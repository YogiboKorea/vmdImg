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
 * cafe24 전체 상품을 yogiChat의 /products/all 엔드포인트로 한 번에 가져옴.
 * 페이지네이션은 서버에서 처리되며 detail_image까지 포함되어 응답됨.
 * 10분 캐시. force=true 로 강제 갱신.
 */
export async function fetchAllProducts(force = false): Promise<Cafe24Product[]> {
  if (!force && _allCache && Date.now() - _allCache.loadedAt < CACHE_TTL_MS) {
    return _allCache.products;
  }
  if (!PROXY) throw new Error('NEXT_PUBLIC_CAFE24_PROXY_URL 미설정');

  const url = `${PROXY}/api/vmd/products/all`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`cafe24 all ${res.status}`);
  const data = await res.json();
  const raw: Cafe24Product[] = Array.isArray(data?.products) ? data.products : [];

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
}

// ─── 키워드 검색 (모달용) ──────────────────────────────────
// 캐시 미존재 시 그 자리에서 전체 로드를 1회 시도. 실패하면 cafe24 키워드 검색으로 폴백.
export async function searchProducts(query: string, limit = 100): Promise<Cafe24Product[]> {
  let cached = getCachedProducts();
  if (!cached) {
    try {
      cached = await fetchAllProducts();
    } catch (e) {
      console.warn('[Cafe24] searchProducts: fetchAllProducts 실패, API 폴백:', e);
    }
  }
  if (cached) {
    const q = normalize(query);
    if (!q) return cached.slice(0, limit);
    return cached
      .filter((p) => normalize(p.product_name).includes(q))
      .slice(0, limit);
  }
  // 최종 폴백: cafe24 키워드 검색 API (불완전한 결과)
  if (!PROXY) throw new Error('NEXT_PUBLIC_CAFE24_PROXY_URL 미설정');
  const url = `${PROXY}/api/vmd/products?q=${encodeURIComponent(query)}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`cafe24 search ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.products) ? data.products : [];
}

export async function getProductDetail(productNo: number): Promise<Cafe24Product | null> {
  if (!PROXY) throw new Error('NEXT_PUBLIC_CAFE24_PROXY_URL 미설정');
  const url = `${PROXY}/api/vmd/products/${productNo}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.product_no ? (data as Cafe24Product) : null;
}

export type MatchResult =
  | { status: 'matched'; product: Cafe24Product; imageUrl: string; via: 'exact' | 'contains' }
  | { status: 'unmatched'; candidates: Cafe24Product[] };

/**
 * 매칭 전략:
 *  1) 정규화 완전일치 (괄호 내용 + 공백 + 특수문자 제거 후)
 *  2) 포함 매칭 — 정규화된 cafe24 상품명 안에 엑셀 상품명이 들어있는 가장 짧은 후보
 *  3) 폴백 unmatched
 * 매칭 시 단건 조회로 detail_image 확보.
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
      pool = await searchProducts(name, 100);
    } catch {
      return { status: 'unmatched', candidates: [] };
    }
  }

  // 매칭된 product의 imageUrl 결정: detail_image > image_medium > list_image
  // /products/all 응답에 이미 detail_image가 포함되어 별도 단건 조회 불필요.
  const pickImage = (p: Cafe24Product) => p.detail_image || p.image_medium || p.list_image || '';

  const exact = pool.filter((p) => normalize(p.product_name) === target);
  if (exact.length > 0) {
    const picked = exact[0];
    console.log(`[Cafe24] "${name}" → EXACT #${picked.product_no}: ${picked.product_name}`);
    return { status: 'matched', product: picked, imageUrl: pickImage(picked), via: 'exact' };
  }

  const contains = pool
    .filter((p) => normalize(p.product_name).includes(target))
    .sort((a, b) => normalize(a.product_name).length - normalize(b.product_name).length);
  if (contains.length > 0) {
    const picked = contains[0];
    console.log(`[Cafe24] "${name}" → CONTAINS #${picked.product_no}: ${picked.product_name}`);
    return { status: 'matched', product: picked, imageUrl: pickImage(picked), via: 'contains' };
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
