"use client";

import { useEffect, useState } from "react";

interface TotalAssistsEntry {
  alias: string;
  totalAssists: number;
  totalGames: number;
}

export default function TotalAssistsRankingSection() {
  const [data, setData] = useState<TotalAssistsEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/stats/ranking/totalAssists`);
      const json = await res.json();
      setData(json);
    };
    fetchData();
  }, []);

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold mb-4">총 어시스트 랭킹 (TOP 10)</h2>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400">조건에 맞는 데이터가 없습니다.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {data.map((player, index) => (
            <li key={player.alias} className="bg-white/5 p-4 rounded-xl flex justify-between items-center shadow">
              <span className="text-green-300 font-medium">
                {index + 1}. {player.alias}
              </span>
              <span className="text-white">
                {player.totalGames}게임 | 총 어시스트 {player.totalAssists}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
