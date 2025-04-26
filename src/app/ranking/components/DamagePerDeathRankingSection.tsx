"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface DamagePerDeathEntry {
  alias: string;
  damagePerDeath: number;
  games: number;
}

interface Props {
  position: string;
  month: string;
}

export default function DamagePerDeathRankingSection({ position, month }: Props) {
  const [data, setData] = useState<DamagePerDeathEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/stats/ranking/damagePerDeath?position=${position}&month=${month}`);
      const json = await res.json();
      setData(json);
    };
    fetchData();
  }, [position, month]);

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold mb-4">데스당 딜량 랭킹 (TOP 5)</h2>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400">조건에 맞는 데이터가 없습니다.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {data.map((player, index) => (
            <li key={player.alias} className="bg-white/5 p-4 rounded-xl flex justify-between items-center shadow">
              <span className="text-purple-300 font-medium">
                {index + 1}. {player.alias}
              </span>
              <span className="text-white">
                {player.games}게임 | 데스당 {player.damagePerDeath.toLocaleString()} 딜
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
