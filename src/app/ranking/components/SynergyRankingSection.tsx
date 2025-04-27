"use client";

import { useEffect, useState } from "react";

interface SynergyRankingEntry {
  player1: string;
  player2: string;
  totalGames: number;
  winrate: number;
  synergyScore: number;
}

interface SynergyRankingProps {
  year: string;
  month: string;
  position: string;
}

export default function SynergyRanking({ year, month, position }: SynergyRankingProps) {
  const [data, setData] = useState<SynergyRankingEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/stats/ranking/synergy?year=${year}&month=${month}&position=${position}`);
      const json = await res.json();
      setData(json.slice(0, 3)); // TOP 3만
    };

    fetchData();
  }, [year, month, position]);

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold mb-4">시너지 랭킹 (TOP 3)</h2>

      {data.length === 0 ? (
        <p className="text-sm text-gray-400">조건에 맞는 데이터가 없습니다.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {data.map((pair, index) => (
            <li
              key={`${pair.player1}-${pair.player2}`}
              className="bg-white/5 p-4 rounded-xl flex justify-between items-center shadow"
            >
              <div>
                <p className="font-medium flex items-center gap-2">
                  <span>{["🥇", "🥈", "🥉"][index]}</span>
                  <span className="text-blue-300">{pair.player1}</span>
                  <span className="text-gray-400">+</span>
                  <span className="text-blue-300">{pair.player2}</span>
                </p>
                <p className="text-gray-400 text-xs">함께한 경기: {pair.totalGames}판</p>
              </div>
              <div className="text-right">
                <p className="text-blue-400 font-bold">{pair.winrate}%</p>
                <p className={`text-xs ${pair.synergyScore >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {pair.synergyScore >= 0 ? "+" : ""}
                  {pair.synergyScore}% 기대승률 대비
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
