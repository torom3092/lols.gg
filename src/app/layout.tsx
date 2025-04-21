// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "롤스기릿",
  description: "커스텀 내전 분석 서비스",
};

const backgroundStyle = {
  background:
    "radial-gradient(circle at 40% 20%, rgba(255,255,255,0.05) 0%, transparent 40%)," +
    "radial-gradient(circle at bottom right, rgba(0,0,0,0.5) 0%, transparent 60%)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gradient-to-br from-gray-900 to-black min-h-screen text-white">
        {/* 🔹 상단 로고 영역 */}
        <header>
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 w-fit">
            <Image src="/logo.png" className="invert brightness-200" alt="로고" width={36} height={36} />
            <span className="text-2xl font-bold">롤스기릿</span>
          </Link>
        </header>

        {children}
      </body>
    </html>
  );
}
