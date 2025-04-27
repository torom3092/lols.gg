// src/app/ranking/components/WinrateRankingSection.tsx

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface WinrateRankingEntry {
  alias: string;
  winrate: number;
  totalGames: number;
}

interface Props {
  position: string;
  month: string;
  year: string;
}

export default function WinrateRankingSection({ position, month, year }: Props) {
  const [data, setData] = useState<WinrateRankingEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/stats/ranking/winrate?position=${position}&month=${month}&year=${year}`);
      const json = await res.json();
      setData(json.slice(0, 5));
    };
    fetchData();
  }, [position, month, year]);

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold mb-4">승률 랭킹 (TOP 5)</h2>
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
                {player.totalGames}게임 | 승률 {player.winrate}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
