"use client";

import { useState } from "react";
import UploadMatchForm from "@/app/admin/components/UploadMatchForm";
import AddPlayerPage from "@/app/admin/components/AddPlayerPage"; // 그대로 import 가능
import AddHighlightPage from "@/app/admin/components/AddHighlightPage";
export const dynamic = "force-dynamic";
export default function AdminPage() {
  const [tab, setTab] = useState<"upload" | "player" | "highlight">("upload");

  return (
    <div className="min-h-screen text-white p-6">
      <div className="flex space-x-4 mb-6 border-b border-gray-700 pb-2">
        <button
          onClick={() => setTab("upload")}
          className={`px-4 py-2 rounded-t ${tab === "upload" ? "bg-gray-800 text-white" : "bg-gray-700 text-gray-400"}`}
        >
          매치 업로드
        </button>
        <button
          onClick={() => setTab("player")}
          className={`px-4 py-2 rounded-t ${tab === "player" ? "bg-gray-800 text-white" : "bg-gray-700 text-gray-400"}`}
        >
          플레이어 관리
        </button>
        <button
          onClick={() => setTab("highlight")}
          className={`px-4 py-2 rounded-t ${tab === "player" ? "bg-gray-800 text-white" : "bg-gray-700 text-gray-400"}`}
        >
          하이라이트 업데이트
        </button>
      </div>

      <div className="bg-[#1f1f1f] rounded-xl p-6 shadow-md">
        {tab === "upload" && <UploadMatchForm />}
        {tab === "player" && <AddPlayerPage />}
        {tab === "highlight" && <AddHighlightPage />}
      </div>
    </div>
  );
}
