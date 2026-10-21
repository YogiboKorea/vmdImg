// Cafe24 상품 데이터 — adminChat 서버 경유 (2026-10, yChat 종료로 이전. yChat 의 /api/vmd/* 는 없음)
//   전체 상품명: GET /api/meta/products          → { success, data: { [product_no]: product_name } } (이미지 없음)
//   키워드 검색: GET /api/cafe24/products?keyword= → { success, count, data: [{ product_no, product_name, price, detail_image }] }
//               cafe24 상품명 부분일치 (띄어쓰기까지 같아야 걸림), 진열·판매 중인 상품만, 최대 100개
const PROXY = process.env.NEXT_PUBLIC_CAFE24_PROXY_URL || '';

export interface Cafe24Product {
  product_no: number;
  product_code?: string;
  product_name: string;
  price?: string;
  list_image?: string | null;
  detail_image?: string | null;
  image_medium?: string | null;
  image_small?: string | null;
  tiny_image?: string | null;
  eng_product_name?: string;
  summary_description?: string;
  simple_description?: string;
}

// 대괄호 [..] / 소괄호 (..) / 일본식 【..】 / 꺾쇠 <..> 안의 내용 제거.
// cafe24 상품명에 자주 붙는 "[브랜드] 상품명 (옵션)" 패턴 처리용.
function stripBrackets(s: string): string {
  return s
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/【[^】]*】/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/《[^》]*》/g, ' ');
}

// 상품명에 괄호류가 포함되어 있는지 — 포함이면 "이벤트 변종" 으로 간주하고 매칭에서 제외.
export function hasBrackets(name: string): boolean {
  return /[[\]()<>【】《》]/.test(name || '');
}

export function normalize(s: string): string {
  return stripBrackets(s || '')
    .toLowerCase()
    // 일반 공백 + non-breaking + 가는/넓은 공백 (\s가 대부분 커버하지만 명시)
    .replace(/[\s  -   　]/g, '')
    // 보이지 않는 zero-width 문자들 (엑셀 셀에서 종종 들어옴)
    .replace(/[​‌‍‎‏﻿⁠]/g, '')
    // 일반 구분/특수문자
    .replace(/[\-_/()[\]{}.,!?·•+~`'"’‘“”]/g, '');
}

// ─── 전체 상품 캐시 ──────────────────────────────────────
let _allCache: { products: Cafe24Product[]; loadedAt: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10분

/**
 * cafe24 전체 상품명을 adminChat 의 /api/meta/products 로 한 번에 가져옴 (페이지네이션은 서버에서 처리).
 * 이미지는 없으므로 매칭 후 getProductImage 로 따로 조회. 10분 캐시. force=true 로 강제 갱신.
 */
export async function fetchAllProducts(force = false): Promise<Cafe24Product[]> {
  if (!force && _allCache && Date.now() - _allCache.loadedAt < CACHE_TTL_MS) {
    return _allCache.products;
  }
  if (!PROXY) throw new Error('NEXT_PUBLIC_CAFE24_PROXY_URL 미설정');

  const url = `${PROXY}/api/meta/products`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`cafe24 all ${res.status}`);
  const data = await res.json();
  const map: Record<string, string> = data?.data && typeof data.data === 'object' ? data.data : {};
  const raw: Cafe24Product[] = Object.entries(map).map(([no, name]) => ({
    product_no: Number(no),
    product_name: String(name),
  }));

  // [...] / (...) / <...> / 【...】 / 《...》 포함 상품 = 이벤트/협력사 변종 → 매칭 후보 제외
  const all = raw.filter((p) => !hasBrackets(p.product_name));
  const dropped = raw.length - all.length;

  _allCache = { products: all, loadedAt: Date.now() };
  console.log(`[Cafe24] 전체 상품 로드 완료: ${all.length}개 (괄호 포함 ${dropped}개 제외)`);
  return all;
}

export function getCachedProducts(): Cafe24Product[] | null {
  return _allCache?.products ?? null;
}

export function invalidateCache() {
  _allCache = null;
  _keywordCache.clear();
}

// ─── 키워드 검색 (이미지 포함) ──────────────────────────────
// 같은 키워드는 결과를 재사용 (자동 매칭 중 같은 상품명을 여러 번 조회하지 않도록)
const _keywordCache = new Map<string, Promise<Cafe24Product[]>>();

async function keywordSearch(keyword: string): Promise<Cafe24Product[]> {
  if (!PROXY) throw new Error('NEXT_PUBLIC_CAFE24_PROXY_URL 미설정');
  let pending = _keywordCache.get(keyword);
  if (!pending) {
    pending = (async () => {
      const res = await fetch(`${PROXY}/api/cafe24/products?keyword=${encodeURIComponent(keyword)}`);
      if (!res.ok) throw new Error(`cafe24 search ${res.status}`);
      const data = await res.json();
      const list: { product_no: number; product_name: string; price?: number; detail_image?: string | null }[] =
        Array.isArray(data?.data) ? data.data : [];
      return list.map((p) => ({
        product_no: p.product_no,
        product_name: p.product_name,
        price: p.price != null ? String(p.price) : undefined,
        detail_image: p.detail_image || null,
        list_image: p.detail_image || null, // 검색 창 목록 썸네일용
      }));
    })();
    _keywordCache.set(keyword, pending);
    pending.catch(() => _keywordCache.delete(keyword));
  }
  return pending;
}

/**
 * 상품 이미지 — adminChat 에 단건 이미지 조회가 없어서, cafe24 상품명 그대로 키워드 검색해 같은 상품번호의 detail_image 사용.
 * 진열·판매 중이 아닌 상품은 검색에 안 나와 '' 반환.
 */
export async function getProductImage(product: { product_no: number; product_name: string }): Promise<string> {
  const list = await keywordSearch(product.product_name);
  return list.find((p) => p.product_no === product.product_no)?.detail_image || '';
}

// ─── 검색 (모달용) ──────────────────────────────────
// 키워드 검색(이미지 있음, 띄어쓰기 일치 필요) + 전체 상품명 정규화 부분일치(띄어쓰기 무시, 이미지는 고를 때 조회)를 합침.
export async function searchProducts(query: string, limit = 100): Promise<Cafe24Product[]> {
  const q = normalize(query);
  const [byKeyword, byName] = await Promise.allSettled([
    query.trim() ? keywordSearch(query.trim()) : Promise.resolve([]),
    fetchAllProducts().then((all) => (q ? all.filter((p) => normalize(p.product_name).includes(q)) : all)),
  ]);
  if (byKeyword.status === 'rejected' && byName.status === 'rejected') throw byKeyword.reason;
  if (byKeyword.status === 'rejected') console.warn('[Cafe24] 키워드 검색 실패:', byKeyword.reason);
  if (byName.status === 'rejected') console.warn('[Cafe24] 전체 상품 로드 실패:', byName.reason);

  const withImage = byKeyword.status === 'fulfilled' ? byKeyword.value.filter((p) => !hasBrackets(p.product_name)) : [];
  const seen = new Set(withImage.map((p) => p.product_no));
  const nameOnly = byName.status === 'fulfilled' ? byName.value.filter((p) => !seen.has(p.product_no)) : [];
  return [...withImage, ...nameOnly].slice(0, limit);
}

export type MatchResult =
  | { status: 'matched'; product: Cafe24Product; imageUrl: string; via: 'exact' | 'contains' }
  | { status: 'unmatched'; candidates: Cafe24Product[] };

/**
 * 매칭 전략:
 *  1) 정규화 완전일치 (괄호 내용 + 공백 + 특수문자 제거 후)
 *  2) "요기보 " + 엑셀 상품명 완전일치 — cafe24 는 "요기보 맥스" 처럼 브랜드명이 붙은 상품이 많음
 *     (없으면 3)에서 "맥스" 가 더 짧은 "볼 맥스" 로 잡힘)
 *  3) 포함 매칭 — 정규화된 cafe24 상품명 안에 엑셀 상품명이 들어있는 가장 짧은 후보
 *  4) 폴백 unmatched
 * 매칭 후 getProductImage 로 detail_image 확보.
 */
export async function lookupByName(name: string): Promise<MatchResult> {
  const target = normalize(name);
  if (!target) return { status: 'unmatched', candidates: [] };

  // 전체 상품 캐시에서 먼저 매칭 시도 (없으면 키워드 검색으로 폴백)
  let pool: Cafe24Product[] = [];
  try {
    pool = await fetchAllProducts();
  } catch (e) {
    console.warn('[Cafe24] 전체 상품 로드 실패, 키워드 검색으로 폴백:', e);
    try {
      pool = (await keywordSearch(name)).filter((p) => !hasBrackets(p.product_name));
    } catch {
      return { status: 'unmatched', candidates: [] };
    }
  }

  // 이미지: 키워드 검색 결과면 이미 있음, 전체 상품명 목록이면 따로 조회
  const pickImage = async (p: Cafe24Product) =>
    p.detail_image || p.image_medium || p.list_image || await getProductImage(p).catch(() => '');

  const exact = pool.filter((p) => normalize(p.product_name) === target);
  if (exact.length > 0) {
    const picked = exact[0];
    console.log(`[Cafe24] "${name}" → EXACT #${picked.product_no}: ${picked.product_name}`);
    return { status: 'matched', product: picked, imageUrl: await pickImage(picked), via: 'exact' };
  }

  const brandTarget = normalize('요기보' + name);
  const brandExact = pool.find((p) => normalize(p.product_name) === brandTarget);
  if (brandExact) {
    console.log(`[Cafe24] "${name}" → EXACT(요기보) #${brandExact.product_no}: ${brandExact.product_name}`);
    return { status: 'matched', product: brandExact, imageUrl: await pickImage(brandExact), via: 'exact' };
  }

  const contains = pool
    .filter((p) => normalize(p.product_name).includes(target))
    .sort((a, b) => normalize(a.product_name).length - normalize(b.product_name).length);
  if (contains.length > 0) {
    const picked = contains[0];
    console.log(`[Cafe24] "${name}" → CONTAINS #${picked.product_no}: ${picked.product_name}`);
    return { status: 'matched', product: picked, imageUrl: await pickImage(picked), via: 'contains' };
  }

  console.log(`[Cafe24] "${name}" → no match (norm="${target}", pool=${pool.length})`);
  return { status: 'unmatched', candidates: [] };
}

/** 동시성 제한 병렬 매핑 — 시작 시 전체 상품을 한 번에 로드 */
export async function lookupManyByName(
  names: string[],
  concurrency = 8,
  onProgress?: (done: number, total: number, phase: 'loading' | 'matching') => void
): Promise<Map<string, MatchResult>> {
  const result = new Map<string, MatchResult>();
  const uniq = Array.from(new Set(names));

  // 1단계: 전체 상품 사전 로드 (한 번)
  onProgress?.(0, uniq.length, 'loading');
  try {
    await fetchAllProducts();
  } catch (e) {
    console.warn('[Cafe24] 사전 로드 실패, 개별 검색으로 진행:', e);
  }

  // 2단계: 병렬 매칭
  let idx = 0;
  let done = 0;
  const workers = Array.from({ length: Math.min(concurrency, uniq.length) }, async () => {
    while (true) {
      const i = idx++;
      if (i >= uniq.length) break;
      const name = uniq[i];
      try {
        result.set(name, await lookupByName(name));
      } catch {
        result.set(name, { status: 'unmatched', candidates: [] });
      }
      done++;
      onProgress?.(done, uniq.length, 'matching');
    }
  });
  await Promise.all(workers);
  return result;
}
