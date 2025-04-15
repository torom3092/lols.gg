"use client";

import { useEffect, useState } from "react";

interface WinrateEntry {
  alias: string;
  name: string;
  wins: number;
  losses: number;
  games: number;
  winrate: number;
}

export default function StatsPage() {
  const [yearData, setYearData] = useState<WinrateEntry[]>([]);
  const [monthData, setMonthData] = useState<WinrateEntry[]>([]);
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("4");

  useEffect(() => {
    const fetchYearData = async () => {
      const params = new URLSearchParams();
      if (selectedYear && selectedYear !== "전체") {
        params.append("year", selectedYear);
      }
      const res = await fetch(`/api/stats/winrates?${params.toString()}`);
      if (!res.ok) return setYearData([]);
      const json = await res.json();
      setYearData(json);
    };
    fetchYearData();
  }, [selectedYear]);

  useEffect(() => {
    const fetchMonthData = async () => {
      const params = new URLSearchParams();
      params.append("month", selectedMonth);
      const res = await fetch(`/api/stats/winrates?${params.toString()}`);
      if (!res.ok) return setMonthData([]);
      const json = await res.json();
      setMonthData(json);
    };
    fetchMonthData();
  }, [selectedMonth]);

  return (
    <main className="p-6 max-w-7xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6 text-center">🏆 승률 통계</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">📆 연도별 승률</h2>
          <div className="mb-4 space-x-2">
            {["2023", "2024", "2025", "전체"].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year === "전체" ? "" : year)}
                className={`px-3 py-1 rounded ${
                  selectedYear === year ? "bg-blue-600" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
          <WinrateTable data={yearData} />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">🗓 시즌별 승률</h2>
          <div className="mb-4 flex flex-wrap gap-2">
            {[...Array(12)].map((_, i) => {
              const m = (i + 1).toString();
              return (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedMonth === m ? "bg-green-600" : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
          <WinrateTable data={monthData} />
        </div>
      </div>
    </main>
  );
}

function WinrateTable({ data }: { data: WinrateEntry[] }) {
  const filteredData = data.filter((entry) => entry.alias !== "guest");

  return (
    <div className="overflow-x-auto border border-white/10 rounded bg-white/5 text-sm">
      <table className="w-full">
        <thead className="bg-white/10">
          <tr>
            <th className="px-4 py-2 text-left">플레이어</th>
            <th className="px-4 py-2 text-center">승 / 패</th>
            <th className="px-4 py-2 text-center">승률</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((entry) => {
            const isUnregistered = !entry.alias || entry.alias.trim() === "";
            const displayName = isUnregistered ? `${entry.name} (guest)` : entry.alias;

            return (
              <tr key={`${entry.alias}-${entry.name}`} className="border-t border-white/10">
                <td className="px-4 py-2">{displayName}</td>
                <td className="px-4 py-2 text-center">
                  <span className="text-green-400">{entry.wins}</span> /{" "}
                  <span className="text-red-400">{entry.losses}</span>
                </td>
                <td className="px-4 py-2 text-center">{entry.winrate}%</td>
              </tr>
            );
          })}
          {filteredData.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center text-gray-400">
                데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
