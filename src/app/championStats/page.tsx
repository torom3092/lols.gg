"use client";

import { useEffect, useState } from "react";
import CHAMPION_KR_MAP from "@/lib/championNameKo";

interface ChampionStatsEntry {
  championName: string;
  wins: number;
  losses: number;
  games: number;
  winrate: number;
  imageUrl: string;
}

interface PlayerStatsEntry {
  name: string;
  wins: number;
  losses: number;
  games: number;
  winrate: number;
}

const positionMap: Record<string, string | undefined> = {
  전체: undefined,
  탑: "TOP",
  정글: "JUNGLE",
  미드: "MIDDLE",
  원딜: "BOTTOM",
  서폿: "UTILITY",
};

export default function ChampionStatsPage() {
  const [stats, setStats] = useState<ChampionStatsEntry[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStatsEntry[] | null>(null);
  const [position, setPosition] = useState<string>("전체");
  const [year, setYear] = useState("2025");
  const [selectedChampion, setSelectedChampion] = useState<string | null>(null);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  const fetchStats = async () => {
    const params = new URLSearchParams();
    const mappedPosition = positionMap[position];
    if (mappedPosition) params.append("position", mappedPosition);
    params.append("year", year);

    const res = await fetch(`/api/stats/champions?${params.toString()}`);
    const json = await res.json();

    const sorted = json
      .map((entry: ChampionStatsEntry) => ({
        ...entry,
        imageUrl: `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${entry.championName}.png`,
      }))
      .sort((a: any, b: any) => Number(b.games || 0) - Number(a.games || 0)); // 판수 기준 정렬

    setStats(sorted);
  };

  const handleChampionClick = async (championName: string) => {
    setSelectedChampion(championName);
    setLoadingPlayers(true);
    setPlayerStats(null);

    const params = new URLSearchParams();
    const mappedPosition = positionMap[position];
    if (mappedPosition) params.append("position", mappedPosition);
    params.append("year", year);

    const res = await fetch(`/api/stats/champions/${championName}?${params.toString()}`);
    if (!res.ok) {
      const text = await res.text(); // HTML일 수도 있으니 일단 text로 받음
      console.error("API 응답 에러:", res.status, text);
      setPlayerStats([]);
      setLoadingPlayers(false);
      return;
    }
    const json = await res.json();

    setPlayerStats(json);
    setLoadingPlayers(false);
  };

  useEffect(() => {
    fetchStats();
  }, [position, year]);

  return (
    <main className="p-6 max-w-7xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6 text-center">🧙‍♂️ 챔피언 통계</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 왼쪽 박스 */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {["전체", "탑", "정글", "미드", "원딜", "서폿"].map((pos) => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className={`px-3 py-1 rounded text-sm ${
                  position === pos ? "bg-blue-600" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {pos}
              </button>
            ))}

            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="ml-auto px-2 py-1 bg-black border border-white/20 rounded text-sm"
            >
              {["2025", "2024", "2023"].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {stats.map((entry) => (
              <div
                key={entry.championName}
                onClick={() => handleChampionClick(entry.championName)}
                className="flex items-center space-x-3 cursor-pointer hover:bg-white/10 p-2 rounded"
              >
                <img src={entry.imageUrl} alt={entry.championName} className="w-8 h-8 rounded-full" />
                <div className="flex-1">{CHAMPION_KR_MAP[entry.championName]}</div>
                <div className="text-sm">
                  <span className="text-green-400">{entry.wins}</span> /{" "}
                  <span className="text-red-400">{entry.losses}</span>
                </div>
                <div className="w-12 text-right">{entry.winrate}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽 박스 */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          {selectedChampion ? (
            <div>
              <h2 className="text-center mb-4 text-gray-300">
                {CHAMPION_KR_MAP[selectedChampion]} 챔피언 플레이어 정보
              </h2>
              {loadingPlayers ? (
                <p className="text-center text-gray-500">로딩 중...</p>
              ) : playerStats && playerStats.length > 0 ? (
                <div className="space-y-2">
                  {playerStats.map((p) => (
                    <div key={p.name} className="flex items-center justify-between p-2 rounded hover:bg-white/10">
                      <div className="flex-1">{p.name}</div>
                      <div className="text-sm">
                        <span className="text-green-400">{p.wins}</span> /{" "}
                        <span className="text-red-400">{p.losses}</span>
                      </div>
                      <div className="w-12 text-right">{p.winrate}%</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">해당 챔피언 기록이 없습니다.</p>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">챔피언을 선택해주세요.</p>
          )}
        </div>
      </div>
    </main>
  );
}
