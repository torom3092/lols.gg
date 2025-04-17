// ✅ components/RollscupTab.tsx
"use client";

import { useState } from "react";

const ROLLSCUP_DATA: Record<string, string[]> = {
  "1회차": ["올리버", "꼬야", "고전퐈", "감자", "파인"],
  "2회차": ["문어남자", "해적왕버기", "고전퐈", "로망", "크릭"],
};

export default function RollscupTab() {
  const [rollsTab, setRollsTab] = useState<"1회차" | "2회차" | "3회차">("1회차");

  return (
    <div>
      <div className="flex justify-center gap-2 mb-4">
        {["1회차", "2회차", "3회차"].map((r) => (
          <button
            key={r}
            onClick={() => setRollsTab(r as any)}
            className={`px-4 py-1 rounded ${rollsTab === r ? "bg-blue-600" : "bg-white/10 hover:bg-white/20"}`}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="bg-white/10 rounded-xl p-6 text-center">
        {rollsTab === "3회차" ? (
          <p className="text-gray-400">⏳ 3회차는 예정입니다.</p>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-3">{rollsTab} 우승팀</h2>
            <ul className="space-y-1 text-lg">
              {ROLLSCUP_DATA[rollsTab].map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
