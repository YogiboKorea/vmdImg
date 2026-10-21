import { ImageResponse } from 'next/og';
import { TypeAPreview, TypeBPreview } from '@/components/ImagePreviews';
import { IMAGE_SPECS, customBaseType } from '@/types/product';
import { getCircleImage, CIRCLE_IMAGE_PX } from '@/lib/circleImages';
import { LOGO_URL, LOGO_WHITE_URL } from '@/lib/logo';
import { logoAreaTone } from '@/lib/logoTone';
import sharp from 'sharp';

/*
 * ──── 변경 사항 ──────────────────────────────────────────
 *
 * 1. Noto Sans KR → Pretendard 전환
 *    - Noto Sans KR "korean" subset에 ₩(U+20A9) 미포함 → □ 깨짐
 *    - Pretendard는 full font이라 ₩ 포함
 *    - satori는 woff2 미지원이므로 .woff 사용
 *
 * 2. 필요한 weight 전부 로드
 *    - 400 (Regular) : description fontWeight:500 fallback
 *    - 500 (Medium)  : description
 *    - 600 (SemiBold): 취소선 가격
 *    - 700 (Bold)    : subtitle, 가격, ₩ 기호
 *    - 800 (ExtraBold): 제목
 *    - 900 (Black)   : SALE 배지 텍스트
 *
 * 3. Noto Sans (라틴) 폰트 제거 → 폰트 하나로 통일
 * ────────────────────────────────────────────────────────
 */

// Pretendard .woff CDN URL (fonts-archive)
const PRETENDARD_BASE = 'https://cdn.jsdelivr.net/gh/fonts-archive/Pretendard';
const FONT_URLS: { weight: number; file: string }[] = [
  { weight: 400, file: 'Pretendard-Regular.woff' },
  { weight: 500, file: 'Pretendard-Medium.woff' },
  { weight: 600, file: 'Pretendard-SemiBold.woff' },
  { weight: 700, file: 'Pretendard-Bold.woff' },
  { weight: 800, file: 'Pretendard-ExtraBold.woff' },
  { weight: 900, file: 'Pretendard-Black.woff' },
];

let fontsLoaded = false;
const fontBuffers: Map<number, ArrayBuffer> = new Map();

async function loadFonts() {
  if (fontsLoaded) return;
  console.log('[VMD] Pretendard 폰트 다운로드 시작...');

  const results = await Promise.allSettled(
    FONT_URLS.map(async ({ weight, file }) => {
      const url = `${PRETENDARD_BASE}/${file}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${weight}: ${res.status}`);
      const buf = await res.arrayBuffer();
      console.log(`[VMD] 폰트 ${weight} OK: ${buf.byteLength} bytes`);
      return { weight, buf };
    })
  );

  for (const r of results) {
    if (r.status === 'fulfilled') {
      fontBuffers.set(r.value.weight, r.value.buf);
    } else {
      console.error('[VMD] 폰트 실패:', r.reason);
    }
  }

  fontsLoaded = fontBuffers.size > 0;
  console.log(`[VMD] 폰트 로드 완료: ${fontBuffers.size}/${FONT_URLS.length}`);
}

export async function GET() {
  try {
    const img = new ImageResponse(
      <div style={{ display: 'flex', width: 400, height: 200, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 32, color: 'black' }}>TEST OK</span>
      </div>,
      { width: 400, height: 200 }
    );
    return img;
  } catch (e: any) {
    return Response.json({ error: e.message });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product, type } = body;

    // width/height 직접 지정 시 그대로 사용 (커스텀 사이즈).
    // 미지정 시 type 기반 기본값.
    const width = Number.isFinite(body.width) && body.width > 0
      ? Math.round(body.width)
      : 1984;
    const height = Number.isFinite(body.height) && body.height > 0
      ? Math.round(body.height)
      : (type === 'A' ? 803 : 602);

    // ✅ 폰트 로드
    await loadFonts();

    const TRANSPARENT_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    // fitSize: 지정하면 fitSize×fitSize 정사각(cover)으로 줄여서 base64 — 원본이 큰 원형 이미지용
    const fetchBase64 = async (url: string, fitSize?: number) => {
      try {
        console.log('[VMD] 이미지 fetch:', url);
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/jpeg, image/png, image/webp, */*',
            'Referer': 'https://yogibo.openhost.cafe24.com/'
          },
          cache: 'no-store'
        });
        const mimeType = res.headers.get('content-type') || '';
        if (!res.ok || !mimeType.startsWith('image/')) {
          console.warn(`[VMD] 이미지 차단: ${url} (${res.status})`);
          return TRANSPARENT_PNG;
        }
        const buf = await res.arrayBuffer();
        if (buf.byteLength === 0) return TRANSPARENT_PNG;

        const img = sharp(Buffer.from(buf));
        const pngBuffer = await (fitSize ? img.resize(fitSize, fitSize, { fit: 'cover' }) : img).png().toBuffer();
        console.log('[VMD] 이미지 변환:', buf.byteLength, '->', pngBuffer.byteLength);
        return `data:image/png;base64,${pngBuffer.toString('base64')}`;
      } catch (e: any) {
        console.error('[VMD] 이미지 에러:', url, e?.message);
        return TRANSPARENT_PNG;
      }
    };

    // 썸네일 / 원형 이미지 주소 → base64
    //   data: URL (사용자가 모달에서 직접 업로드한 이미지) — 변환 없이 그대로 사용
    //   절대 URL (Cafe24 lookup 의 detail_image 등) — 그대로 fetch
    //   파일명 — FTP 폴백 (/web/vmd/파일명)
    const loadImage = (raw: string, fitSize?: number) => {
      const src = (raw || '').trim();
      if (src.startsWith('data:')) return Promise.resolve(src);
      if (/^https?:\/\//i.test(src)) return fetchBase64(src, fitSize);
      const cleaned = src.replace(/^\/+/, '');
      const nameParts = cleaned.split('.');
      const ext = nameParts.pop();
      const encodedFileName = nameParts.map((p: string) => encodeURIComponent(p)).join('.') + (ext ? `.${ext}` : '');
      return fetchBase64(`https://yogibo.openhost.cafe24.com/web/vmd/${encodedFileName}`, fitSize);
    };
    const rate = product.discountRate || 0;
    const supported = [10, 15, 20];
    const exact = supported.find((r: number) => r === rate);
    const saleBadgeUrl = exact ? `https://yogibo.openhost.cafe24.com/web/vmd/${exact}.png` : null;

    // 원형 이미지 (리필 비즈) — 상품명으로 코드에서 찾음
    const circle = getCircleImage(product.name);
    console.log('[VMD] 이미지 다운로드:', { saleBadgeUrl, circle: circle?.image });

    // 로고는 일반 / 흰색 둘 다 받아 두고, 썸네일 로고 자리 밝기로 고름 (둘 다 작은 파일)
    const [thumb, logo, logoWhite, badge, circleImg] = await Promise.all([
      loadImage(product.thumbnailImage),
      fetchBase64(LOGO_URL),
      fetchBase64(LOGO_WHITE_URL),
      saleBadgeUrl ? fetchBase64(saleBadgeUrl) : Promise.resolve(null),
      circle ? loadImage(circle.image, CIRCLE_IMAGE_PX) : Promise.resolve(null),
    ]);
    const tone = await logoAreaTone(Buffer.from(thumb.slice(thumb.indexOf(',') + 1), 'base64')).catch(() => null);
    console.log('[VMD] 로고 자리 밝기:', tone?.brightness.toFixed(2), tone?.white ? '→ 흰 로고' : '');

    product._base64Thumb = thumb;
    product._base64Logo = tone?.white ? logoWhite : logo;
    product._base64Badge = badge;
    product._base64Circle = circleImg;
    product._base64ColorChips = [];

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (req.url.startsWith('https') ? 'https' : 'http');
    const baseUrl = `${protocol}://${host}`;

    // baseUrl 은 PriceCard 내부에서 직접 사용하지 않지만 향후 확장 대비 변수만 유지
    void baseUrl;
    const autoFit = body.autoFit === true;

    // type 미지정 시 width/height 로 추론 (구버전 클라이언트 호환)
    let resolvedType: 'A' | 'B' | undefined = type;
    if (!resolvedType && !autoFit) {
      if (width === 1984 && height === 803) resolvedType = 'A';
      else if (width === 1984 && height === 602) resolvedType = 'B';
    }

    // 커스텀 사이즈: satori 는 transform: scale() 을 쓰면 클리핑/레이아웃이 깨지므로
    // 비율이 가까운 A·B 디자인(customBaseType)을 원본 크기로 렌더한 뒤 sharp 로 목표 사이즈에 맞춰(contain) 리사이즈.
    const isCustom = autoFit || (resolvedType !== 'A' && resolvedType !== 'B');
    const baseType = isCustom ? customBaseType(width, height) : resolvedType;
    const element = baseType === 'A'
      ? <TypeAPreview product={product} />
      : <TypeBPreview product={product} />;

    // ✅ 폰트 설정: Pretendard 전 weight
    const fontsConfig: any[] = [];
    for (const { weight } of FONT_URLS) {
      const data = fontBuffers.get(weight);
      if (data) {
        fontsConfig.push({
          name: 'Pretendard',
          data,
          weight: weight as any,
          style: 'normal' as const,
        });
      }
    }

    const fonts = fontsConfig.length > 0 ? fontsConfig : undefined;

    if (isCustom) {
      const { width: REF_W, height: REF_H } = IMAGE_SPECS[baseType ?? 'A'];
      console.log('[VMD] 커스텀 렌더...', { width, height, baseType, fontsCount: fontsConfig.length });
      const base = await new ImageResponse(element, { width: REF_W, height: REF_H, fonts }).arrayBuffer();
      const png = await sharp(Buffer.from(base))
        .resize(width, height, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
          kernel: 'lanczos3',
        })
        .png()
        .toBuffer();
      return new Response(new Uint8Array(png), {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' },
      });
    }

    console.log('[VMD] ImageResponse 생성...', { width, height, fontsCount: fontsConfig.length });

    return new ImageResponse(element, { width, height, fonts });
  } catch (error: any) {
    console.error('[VMD] 최종 에러:', error?.message, error?.cause);
    return new Response(
      JSON.stringify({ error: error?.message || '서버 에러', cause: String(error?.cause || '') }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
}