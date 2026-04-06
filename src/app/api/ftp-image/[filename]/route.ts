import { NextRequest, NextResponse } from 'next/server';
import { fetchFtpFileAsBuffer } from '@/lib/ftpClient';

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/ftp-image/[filename]'>
) {
  const { filename } = await ctx.params;

  if (!filename || typeof filename !== 'string') {
    return new NextResponse('Missing filename', { status: 400 });
  }

  // URL 디코딩 후 path traversal만 방지 (한국어 파일명 허용)
  const decoded = decodeURIComponent(filename);
  if (decoded.includes('/') || decoded.includes('..') || decoded.includes('\\')) {
    return new NextResponse('Invalid filename', { status: 400 });
  }

  try {
    const buffer = await fetchFtpFileAsBuffer(decoded);
    const ext = decoded.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    const contentType = mimeMap[ext] ?? 'application/octet-stream';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('FTP fetch error:', err);
    return new NextResponse('Image not found', { status: 404 });
  }
}
