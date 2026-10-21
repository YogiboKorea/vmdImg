import { NextResponse } from 'next/server';
import sharp from 'sharp';

// 1x1 투명 PNG (base64 디코드된 Uint8Array)
const TRANSPARENT_PNG = Uint8Array.from(
  atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='),
  (c) => c.charCodeAt(0),
);

function transparentResponse(extraStatus?: number) {
  return new NextResponse(TRANSPARENT_PNG, {
    status: extraStatus ?? 200,
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=60' },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  // w: 지정하면 w×w 정사각(cover)으로 줄여서 보냄 — 원본이 큰 원형 이미지 미리보기용
  const width = Number(searchParams.get('w')) || 0;

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    // cafe24/yogibo 호스트는 일부 핫링크 차단을 위해 UA/Referer 검증을 함.
    // 누락 시 HTML/403 으로 응답하는 경우가 있어 명시적으로 설정.
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/jpeg, image/png, image/webp, image/*, */*',
        'Referer': 'https://yogibo.openhost.cafe24.com/',
      },
      cache: 'no-store',
    });

    const contentType = res.headers.get('Content-Type') || '';
    if (!res.ok || !contentType.startsWith('image/')) {
      console.warn(`[Proxy] non-image (${res.status}, ${contentType}): ${url}`);
      return transparentResponse();
    }

    const arrayBuffer = await res.arrayBuffer();
    if (width > 0) {
      const resized = await sharp(Buffer.from(arrayBuffer)).resize(width, width, { fit: 'cover' }).png().toBuffer();
      return new NextResponse(new Uint8Array(resized), {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400, immutable' },
      });
    }
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error) {
    console.error('[Proxy] fetch error:', error);
    return transparentResponse();
  }
}
