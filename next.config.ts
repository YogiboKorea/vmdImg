import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose', 'basic-ftp'],
  // 상위 폴더에 있는 다른 package-lock.json 때문에 워크스페이스 루트가 잘못 추론되는 것 방지
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;
