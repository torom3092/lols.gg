"use client";

import { useState } from "react";
import HistoryTab from "@/app/history/components/HistoryTab";
import HighlightTab from "@/app/history/components/HighlightTab";
import RollscupTab from "@/app/history/components/RollscupTab";

const TABS = ["history", "highlight", "rollscup"];

export default function HistoryPage() {
  const [tab, setTab] = useState<"history" | "highlight" | "rollscup">("history");

  return (
    <div className="min-h-screen text-white p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">📚 기록실</h1>

      <div className="flex space-x-4 mb-6 justify-center border-b border-white/20 pb-2">
        {TABS.map((key) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`px-4 py-2 rounded-t ${
              tab === key ? "bg-white text-black font-bold" : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {key === "history" ? "기록실" : key === "highlight" ? "하이라이트" : "롤스컵"}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        {tab === "history" && <HistoryTab />}
        {tab === "highlight" && <HighlightTab />}
        {tab === "rollscup" && <RollscupTab />}
      </div>
    </div>
  );
}
