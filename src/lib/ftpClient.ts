import * as ftp from 'basic-ftp';
import { PassThrough } from 'stream';

const FTP_HOST = process.env.FTP_HOST!;
const FTP_USER = process.env.FTP_USER!;
const FTP_PASSWORD = process.env.FTP_PASSWORD!;
const FTP_PORT = parseInt(process.env.FTP_PORT || '21');
const FTP_BASE_PATH = process.env.FTP_BASE_PATH || '/web/vmd';

export async function fetchFtpFileAsBuffer(filename: string): Promise<Buffer> {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASSWORD,
      port: FTP_PORT,
      secure: false,
    });

    const pass = new PassThrough();
    const chunks: Buffer[] = [];

    pass.on('data', (chunk: Buffer) => chunks.push(chunk));

    await client.downloadTo(pass, `${FTP_BASE_PATH}/${filename}`);

    return Buffer.concat(chunks);
  } finally {
    client.close();
  }
}

export async function listFtpFiles(): Promise<string[]> {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASSWORD,
      port: FTP_PORT,
      secure: false,
    });

    const list = await client.list(FTP_BASE_PATH);
    return list.map((f) => f.name).filter((n) => /\.(jpg|jpeg|png|gif|webp)$/i.test(n));
  } finally {
    client.close();
  }
}
