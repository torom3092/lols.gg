"use client";

import { useEffect, useState } from "react";

interface TotalKillsEntry {
  alias: string;
  totalKills: number;
  totalGames: number;
}

export default function TotalKillsRankingSection() {
  const [data, setData] = useState<TotalKillsEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/stats/ranking/totalKills`);
      const json = await res.json();
      setData(json);
    };
    fetchData();
  }, []);

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold mb-4">총 킬 랭킹 (TOP 10)</h2>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400">조건에 맞는 데이터가 없습니다.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {data.map((player, index) => (
            <li key={player.alias} className="bg-white/5 p-4 rounded-xl flex justify-between items-center shadow">
              <span className="text-red-300 font-medium">
                {index + 1}. {player.alias}
              </span>
              <span className="text-white">
                {player.totalGames}게임 | 총 킬 {player.totalKills}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
