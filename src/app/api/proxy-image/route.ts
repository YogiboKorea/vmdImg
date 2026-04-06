import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  // 1x1 투명 PNG Base64
  const transparentPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64") as any;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      // 404 등의 경우 html-to-image가 뻗지 않도록 투명 이미지를 반환합니다.
      console.warn(`[Proxy] Image fetch failed (${res.status}): ${url}`);
      return new NextResponse(transparentPng, {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=60' }
      });
    }
    
    const arrayBuffer = await res.arrayBuffer();
    const headers = new Headers();
    
    headers.set('Content-Type', res.headers.get('Content-Type') || 'image/png');
    headers.set('Cache-Control', 'public, max-age=86400, immutable');
    
    return new NextResponse(arrayBuffer, { headers });
  } catch (error) {
    console.error('Image proxy error:', error);
    // 예외 상황에서도 크래시 방지를 위해 투명 이미지 반환
    return new NextResponse(transparentPng, {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=60' }
    });
  }
}
