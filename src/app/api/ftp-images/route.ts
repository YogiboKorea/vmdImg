import { NextRequest, NextResponse } from 'next/server';
import { listFtpFiles } from '@/lib/ftpClient';

export async function GET(_req: NextRequest) {
  try {
    const files = await listFtpFiles();
    return NextResponse.json({ files });
  } catch (err) {
    console.error('FTP list error:', err);
    return NextResponse.json({ error: 'Failed to list FTP files' }, { status: 500 });
  }
}
