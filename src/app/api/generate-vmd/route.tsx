import { ImageResponse } from 'next/og';
import { TypeAPreview, TypeBPreview } from '@/components/ImagePreviews';
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
    const { product, type } = await req.json();

    const width = 1984;
    const height = type === 'A' ? 602 : 803;

    // ✅ 폰트 로드
    await loadFonts();

    const TRANSPARENT_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    const fetchBase64 = async (url: string) => {
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

        const pngBuffer = await sharp(Buffer.from(buf)).png().toBuffer();
        console.log('[VMD] 이미지 변환:', buf.byteLength, '->', pngBuffer.byteLength);
        return `data:image/png;base64,${pngBuffer.toString('base64')}`;
      } catch (e: any) {
        console.error('[VMD] 이미지 에러:', url, e?.message);
        return TRANSPARENT_PNG;
      }
    };

    const rawFileName = (product.thumbnailImage || '').trim().replace(/^\/+/, '');
    const nameParts = rawFileName.split('.');
    const ext = nameParts.pop();
    const encodedFileName = nameParts.map((p: string) => encodeURIComponent(p)).join('.') + (ext ? `.${ext}` : '');

    const thumbUrl = `https://yogibo.openhost.cafe24.com/web/vmd/${encodedFileName}`;
    const logoUrl = "https://yogibo.openhost.cafe24.com/web/img/icon/logo3_on.png";

    const rate = product.discountRate || 0;
    const supported = [10, 15, 20];
    const exact = supported.find((r: number) => r === rate);
    const saleBadgeUrl = exact ? `https://yogibo.openhost.cafe24.com/web/vmd/${exact}.png` : null;

    console.log('[VMD] 이미지 다운로드:', { thumbUrl, logoUrl, saleBadgeUrl });

    const results = await Promise.all([
      fetchBase64(thumbUrl),
      fetchBase64(logoUrl),
      saleBadgeUrl ? fetchBase64(saleBadgeUrl) : Promise.resolve(null)
    ]);

    product._base64Thumb = results[0];
    product._base64Logo = results[1];
    product._base64Badge = results[2];
    product._base64ColorChips = [];

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || (req.url.startsWith('https') ? 'https' : 'http');
    const baseUrl = `${protocol}://${host}`;

    const element = type === 'A'
      ? <TypeAPreview product={product} baseUrl={baseUrl} />
      : <TypeBPreview product={product} baseUrl={baseUrl} />;

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

    console.log('[VMD] ImageResponse 생성...', { width, height, fontsCount: fontsConfig.length });

    return new ImageResponse(element, {
      width,
      height,
      fonts: fontsConfig.length > 0 ? fontsConfig : undefined,
    });
  } catch (error: any) {
    console.error('[VMD] 최종 에러:', error?.message, error?.cause);
    return new Response(
      JSON.stringify({ error: error?.message || '서버 에러', cause: String(error?.cause || '') }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
}