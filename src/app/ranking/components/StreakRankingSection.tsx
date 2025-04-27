"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface StreakEntry {
  alias: string;
  streakCount: number;
  startDate: string;
  endDate: string | null;
}

interface StreakRankingSectionProps {
  type: string;
  api: string;
}

export default function StreakRankingSection({ type, api }: StreakRankingSectionProps) {
  const [data, setData] = useState<StreakEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(api);
      const json = await res.json();
      setData(json);
    };
    fetchData();
  }, [api]);

  const formatPeriod = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate);
    const formattedStart = `${start.getFullYear()}.${start.getMonth() + 1}.${start.getDate()}`;
    if (!endDate) {
      return `${formattedStart} ~ 진행중`;
    }
    const end = new Date(endDate);
    const formattedEnd = `${end.getFullYear()}.${end.getMonth() + 1}.${end.getDate()}`;
    return `${formattedStart} ~ ${formattedEnd}`;
  };

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold mb-4">{type} 랭킹</h2>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400">조건에 맞는 데이터가 없습니다.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {data.map((entry, index) => (
            <li key={entry.alias} className="bg-white/5 p-4 rounded-xl flex justify-between items-center shadow">
              <div>
                <p className="text-blue-300 font-semibold">
                  {index + 1}. {entry.alias}
                </p>
                <p className="text-gray-400 text-xs">{formatPeriod(entry.startDate, entry.endDate)}</p>
              </div>
              <div className="text-white font-bold">
                {entry.streakCount}
                {type.includes("연패") ? "연패" : "연승"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
