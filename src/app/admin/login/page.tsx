// src/app/admin/login/page.tsx

import React from "react";

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-full max-w-sm bg-[#1f1f1f] p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-white text-center">관리자 로그인</h1>
        <form method="POST" action="/admin/login/submit">
          <input
            type="text"
            name="username"
            placeholder="아이디"
            className="w-full p-2 mb-3 border border-gray-600 rounded bg-[#2a2a2a] text-white placeholder-gray-400"
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            className="w-full p-2 mb-3 border border-gray-600 rounded bg-[#2a2a2a] text-white placeholder-gray-400"
          />
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded mt-2">
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
