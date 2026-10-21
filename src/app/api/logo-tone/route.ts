import { NextResponse } from 'next/server';
import { imgUrl } from '@/components/ImagePreviews';
import { logoAreaTone } from '@/lib/logoTone';

// 미리보기용 — 썸네일 로고 자리가 어두워 흰 로고를 써야 하는지. 다운로드(generate-vmd)도 같은 logoAreaTone 으로 판단.
// POST { src: 썸네일 (파일명 / URL / data URL) } → { white, brightness }. 실패하면 일반 로고(white: false).
export async function POST(req: Request) {
  try {
    const { src } = await req.json();
    const url = imgUrl(String(src || ''));
    if (!url) return NextResponse.json({ white: false });

    let image: Buffer;
    if (url.startsWith('data:')) {
      image = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
    } else {
      // cafe24/yogibo 호스트 핫링크 차단 회피 (proxy-image 와 같은 헤더)
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/jpeg, image/png, image/webp, image/*, */*',
          'Referer': 'https://yogibo.openhost.cafe24.com/',
        },
        cache: 'no-store',
      });
      if (!res.ok || !(res.headers.get('content-type') || '').startsWith('image/')) {
        return NextResponse.json({ white: false });
      }
      image = Buffer.from(await res.arrayBuffer());
    }
    return NextResponse.json(await logoAreaTone(image));
  } catch (error) {
    console.error('[logo-tone]', error);
    return NextResponse.json({ white: false });
  }
}
