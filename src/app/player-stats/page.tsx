"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const ROLES = ["전체", "탑", "정글", "미드", "원딜", "서폿"];
const GAME_FILTERS = [5, 10, 15, 20, 25];
const POSITIONS = ["전체라인", "탑", "정글", "미드", "원딜", "서폿"];

const ROLE_MAP: Record<string, string> = {
  전체: "ALL",
  탑: "TOP",
  정글: "JUNGLE",
  미드: "MIDDLE",
  원딜: "BOTTOM",
  서폿: "UTILITY",
};

const POSITION_EN_MAP: Record<string, string> = {
  전체라인: "ALL",
  탑: "TOP",
  정글: "JUNGLE",
  미드: "MIDDLE",
  원딜: "BOTTOM",
  서폿: "UTILITY",
};

const POSITION_KR_MAP: Record<string, string> = {
  TOP: "탑",
  JUNGLE: "정글",
  MIDDLE: "미드",
  BOTTOM: "원딜",
  UTILITY: "서폿",
};

function getSafeImageUrl(url: string) {
  return url.replace(/^http:\/\//, "https://");
}

function ImageWithFallback({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      src={getSafeImageUrl(imgSrc)}
      alt="champion"
      width={32}
      height={32}
      className="rounded"
      onError={(e) => {
        e.currentTarget.src = "/fallback-champion.png";
      }}
      unoptimized
    />
  );
}

export default function PlayerStatsPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState("전체");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [minGames, setMinGames] = useState(10);
  const [showDetails, setShowDetails] = useState(false);
  const [champStats, setChampStats] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [detailStats, setDetailStats] = useState<any>(null);
  const [detailPosition, setDetailPosition] = useState("전체라인");

  useEffect(() => {
    fetch("/api/stats/players")
      .then((res) => res.json())
      .then(setPlayers);
  }, []);

  useEffect(() => {
    if (!selectedPlayer || showDetails) return;
    setLoadingStats(true);
    fetch(`/api/stats/players/${selectedPlayer}/champions`)
      .then((res) => res.json())
      .then(setChampStats)
      .finally(() => setLoadingStats(false));
  }, [selectedPlayer, showDetails]);

  useEffect(() => {
    if (!selectedPlayer || !showDetails) return;
    const pos = POSITION_EN_MAP[detailPosition];
    const query = pos !== "ALL" ? `?position=${pos}` : "";
    fetch(`/api/stats/players/${selectedPlayer}/detail${query}`)
      .then((res) => res.json())
      .then(setDetailStats);
  }, [selectedPlayer, showDetails, detailPosition]);

  const filteredPlayers = players
    .filter(
      (p) => selectedRole === "전체" || p.position === ROLE_MAP[selectedRole]
    )
    .filter((p) => p.games >= minGames)
    .sort((a, b) => b.winrate - a.winrate);

  return (
    <main className="p-6 text-white max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">🧙‍♂️ 플레이어 통계</h1>
      <div className="flex rounded-xl overflow-hidden border border-white/10 bg-white/5">
        <div className="w-64 border-r border-white/10 p-4 space-y-4 bg-black/30">
          <div className="flex flex-wrap gap-1">
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedRole === role
                    ? "bg-blue-600"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          <select
            value={minGames}
            onChange={(e) => setMinGames(Number(e.target.value))}
            className="w-full p-1 text-sm bg-black/30 border border-white/20 rounded"
          >
            {GAME_FILTERS.map((count) => (
              <option key={count} value={count}>
                {count}판 이상
              </option>
            ))}
          </select>
          <div className="mt-4 space-y-2">
            {filteredPlayers.map((player) => (
              <div
                key={player.alias}
                onClick={() => {
                  setSelectedPlayer(player.alias);
                  setShowDetails(false);
                }}
                className={`flex justify-between px-3 py-2 rounded cursor-pointer ${
                  selectedPlayer === player.alias
                    ? "bg-blue-700"
                    : "hover:bg-white/10"
                }`}
              >
                <span>{player.alias}</span>
                <span className="text-sm text-gray-200">
                  {player.winrate}% (
                  <span className="text-blue-400">{player.wins}</span>/
                  <span className="text-red-400">{player.losses}</span>)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6">
          {selectedPlayer ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {selectedPlayer}의{" "}
                  {showDetails ? "상세 통계" : "챔피언별 통계"}
                </h2>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-3 py-1 text-sm bg-blue-600 rounded hover:bg-blue-700"
                >
                  {showDetails ? "챔피언별 통계 보기" : "상세 통계 보기"}
                </button>
              </div>

              {showDetails ? (
                !detailStats ? (
                  <p className="text-gray-400">불러오는 중...</p>
                ) : (
                  <>
                    <div className="mb-4">
                      <p className="font-semibold text-lg mb-2">라인별 승률</p>
                      <ul className="space-y-1 text-sm text-gray-300">
                        {detailStats.laneWinrates.map((lane: any) => (
                          <li key={lane.position}>
                            {POSITION_KR_MAP[lane.position] || lane.position} -{" "}
                            {lane.winrate}% (
                            <span className="text-blue-400">{lane.wins}</span>/
                            <span className="text-red-400">{lane.losses}</span>)
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <label className="block mb-1 font-medium">
                        본인라인:
                      </label>
                      <select
                        value={detailPosition}
                        onChange={(e) => setDetailPosition(e.target.value)}
                        className="p-1 rounded bg-black/30 border border-white/20 text-sm"
                      >
                        {POSITIONS.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <p className="font-semibold text-lg mb-2">
                        가장 시너지 좋은 팀원
                      </p>
                      {detailStats.bestTeammates.length > 0 ? (
                        <ul className="space-y-1 text-sm">
                          {detailStats.bestTeammates.map((tm: any) => (
                            <li key={`${tm.alias}-${tm.winrate}`}>
                              {tm.alias} -{" "}
                              <span
                                className={
                                  tm.winrate >= 50
                                    ? "text-blue-400"
                                    : "text-red-400"
                                }
                              >
                                {tm.winrate}%
                              </span>{" "}
                              <span className="text-gray-400">
                                ({tm.total}판)
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400">
                          조건에 맞는 데이터가 없습니다.
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="font-semibold text-lg mb-2">
                        가장 어려운 상대
                      </p>
                      {detailStats.hardestOpponents.length > 0 ? (
                        <ul className="space-y-1 text-sm">
                          {detailStats.hardestOpponents.map((op: any) => (
                            <li key={`${op.alias}-${op.winrate}`}>
                              {op.alias} -{" "}
                              <span
                                className={
                                  op.winrate >= 50
                                    ? "text-blue-400"
                                    : "text-red-400"
                                }
                              >
                                {op.winrate}%
                              </span>{" "}
                              <span className="text-gray-400">
                                ({op.total}판)
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400">
                          조건에 맞는 데이터가 없습니다.
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-lg mb-2">
                        함께 가장 많이한 플레이어
                      </p>
                      {detailStats.mostFrequentTeammates.length > 0 ? (
                        <ul className="space-y-1 text-sm">
                          {detailStats.mostFrequentTeammates.map((tm: any) => (
                            <li key={`${tm.alias}-${tm.total}`}>
                              {tm.alias} -{" "}
                              <span
                                className={
                                  tm.winrate >= 50
                                    ? "text-blue-400"
                                    : "text-red-400"
                                }
                              >
                                {tm.winrate}%
                              </span>{" "}
                              <span className="text-gray-400">
                                ({tm.total}판)
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 text-sm">
                          조건에 맞는 데이터가 없습니다.
                        </p>
                      )}
                    </div>
                  </>
                )
              ) : loadingStats ? (
                <p className="text-gray-400">로딩 중...</p>
              ) : champStats.length === 0 ? (
                <p className="text-gray-400">
                  해당 플레이어의 2025년 데이터가 없습니다.
                </p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead className="text-gray-400 border-b border-white/10">
                    <tr>
                      <th className="text-left py-2">챔피언</th>
                      <th>KDA</th>
                      <th>딜량</th>
                      <th>골드</th>
                      <th>승/패</th>
                      <th>승률</th>
                      <th>판수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {champStats
                      .sort((a, b) => b.games - a.games)
                      .map((c) => (
                        <tr
                          key={c.championName}
                          className="border-b border-white/10 hover:bg-white/10 transition-colors duration-150"
                        >
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              {c.championKR !== "모든 챔피언" && (
                                <ImageWithFallback
                                  src={c.imageUrl}
                                  alt={c.championKR}
                                />
                              )}
                              <span>{c.championKR}</span>
                            </div>
                          </td>
                          <td className="text-center">{c.kda}</td>
                          <td className="text-center">
                            {c.avgDamage.toLocaleString()}
                          </td>
                          <td className="text-center">
                            {c.avgGold.toLocaleString()}
                          </td>
                          <td className="text-center">
                            <span className="text-blue-400">{c.wins}</span>/
                            <span className="text-red-400">{c.losses}</span>
                          </td>
                          <td className="text-center">{c.winrate}%</td>
                          <td className="text-center">{c.games}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            <p className="text-gray-400 text-center mt-10">
              플레이어를 선택해주세요.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
