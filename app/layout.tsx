import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "이자세이버 - 주담대 특판 알림 서비스",
  description: "주택담보대출 특판 정보를 실시간으로 알려드려요. 연 100만원 이상 이자를 아끼세요.",
  openGraph: {
    title: "이자세이버 - 주담대 특판 알림 서비스",
    description: "주택담보대출 특판 정보를 실시간으로 알려드려요. 연 100만원 이상 이자를 아끼세요.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full scroll-smooth">
      <body className={`${notoSansKR.className} min-h-full antialiased`}>
        {children}
      </body>
    </html>
  );
}
