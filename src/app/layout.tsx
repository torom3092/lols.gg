// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "내전.GG",
  description: "커스텀 내전 분석 서비스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body
        style={{
          background:
            "radial-gradient(circle at 40% 20%, rgba(255,255,255,0.05) 0%, transparent 40%)," +
            "radial-gradient(circle at bottom right, rgba(0,0,0,0.5) 0%, transparent 60%)," +
            "#0f0f0f",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          minHeight: "100vh",
        }}
        className="text-white"
      >
        {children}
      </body>
    </html>
  );
}
