import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.opggstatic.com', // 또는 사용하는 이미지 서버 도메인
      },
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com', // 라이엇 공식 이미지 도메인
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
};

export default nextConfig;
