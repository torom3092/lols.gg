"use client";

import { useEffect, useState } from "react";
import championNameKo from "@/lib/championNameKo";

type Combo = {
  names: string[];
  wins: number;
  losses: number;
  total: number;
  winrate: string;
};

export default function ChampionGraph() {
  const [data, setData] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState<2 | 3>(2);
  const [year, setYear] = useState<"2025" | "2024" | "all">("2025");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch(`/api/stats/champion-combos?size=${size}&year=${year}`);
      const json = await res.json();
      setData(json);
      setLoading(false);
    }

    fetchData();
  }, [size, year]);

  const translate = (name: string) => championNameKo[name] || name;

  if (loading) return <div className="text-center text-neutral-400">불러오는 중...</div>;

  if (data.length === 0) return <div className="text-center text-neutral-400">챔피언 조합 데이터가 없습니다.</div>;

  return (
    <div>
      {/* 🔧 필터 선택 UI */}
      <div className="flex justify-center gap-4 mb-4">
        <select
          value={size}
          onChange={(e) => setSize(parseInt(e.target.value) as 2 | 3)}
          className="px-3 py-1 rounded-md bg-neutral-800 text-white border border-neutral-600"
        >
          <option value={2}>2챔프 조합</option>
          <option value={3}>3챔프 조합</option>
        </select>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value as "2025" | "2024" | "all")}
          className="px-3 py-1 rounded-md bg-neutral-800 text-white border border-neutral-600"
        >
          <option value="2025">2025년</option>
          <option value="2024">2024년</option>
          <option value="all">전체</option>
        </select>
      </div>

      <h2 className="text-lg font-semibold border-b border-neutral-600 pb-1 mb-3 text-center">
        챔피언 조합 승률 TOP ({size}챔프, {year === "all" ? "전체 연도" : `${year}년`})
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-neutral-700">
          <thead className="bg-neutral-800 text-white">
            <tr>
              <th className="px-4 py-2 border-b border-neutral-600">챔피언 조합</th>
              <th className="px-4 py-2 border-b border-neutral-600">전적</th>
              <th className="px-4 py-2 border-b border-neutral-600 text-right">승률</th>
            </tr>
          </thead>
          <tbody>
            {data.map((combo, idx) => (
              <tr key={idx} className="border-t border-neutral-700">
                <td className="px-4 py-2">{combo.names.map(translate).join(" + ")}</td>
                <td className="px-4 py-2">
                  {combo.wins}승 {combo.losses}패 ({combo.total}회)
                </td>
                <td className="px-4 py-2 text-right">{combo.winrate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
