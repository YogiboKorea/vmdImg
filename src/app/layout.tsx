import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VMD 이미지 자동 생성기 | Yogibo",
  description:
    "엑셀 파일 업로드로 상품 상세 이미지를 자동 생성합니다. A타입(1984×602) · B타입(1984×803).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
          crossOrigin="anonymous"
        />
      </head>
      <body style={{ fontFamily: "'Pretendard', sans-serif" }}>{children}</body>
    </html>
  );
}
