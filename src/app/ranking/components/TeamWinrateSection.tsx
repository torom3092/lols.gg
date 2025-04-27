"use client";

import { useState, useEffect } from "react";

interface TeamWinrateData {
  blueWinrate: number;
  redWinrate: number;
  blueTotal: number;
  redTotal: number;
}

interface Props {
  year: string;
  month: string;
}

export default function TeamWinrateSection({ year, month }: Props) {
  const [data, setData] = useState<TeamWinrateData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/stats/ranking/team-winrate?year=${year}&month=${month}`);
      const json = await res.json();
      setData(json);
    };
    fetchData();
  }, [year, month]);

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold mb-4">진형별 승률</h2>

      {data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-white/5 p-6 rounded-xl flex flex-col items-center shadow">
            <p className="text-blue-400 font-bold mb-2">블루팀</p>
            <p className="text-white">{data.blueTotal}게임</p>
            <p className="text-white">{data.blueWinrate}% 승률</p>
          </div>

          <div className="bg-white/5 p-6 rounded-xl flex flex-col items-center shadow">
            <p className="text-red-400 font-bold mb-2">레드팀</p>
            <p className="text-white">{data.redTotal}게임</p>
            <p className="text-white">{data.redWinrate}% 승률</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-400">데이터를 불러오는 중입니다...</p>
      )}
    </section>
  );
}
