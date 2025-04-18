"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const ROLES = ["전체", "탑", "정글", "미드", "원딜", "서폿"];
const GAME_FILTERS = [5, 10, 15, 20, 25];
const POSITIONS = ["전체", "TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
const ROLE_MAP: Record<string, string> = {
  전체: "ALL",
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

export default function PlayerStatsPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState("전체");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [minGames, setMinGames] = useState(10);
  const [showDetails, setShowDetails] = useState(false);
  const [champStats, setChampStats] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const [detailStats, setDetailStats] = useState<any>(null);
  const [detailPosition, setDetailPosition] = useState("ALL");

  // 플레이어 목록
  useEffect(() => {
    fetch("/api/stats/players")
      .then((res) => res.json())
      .then((json) => setPlayers(json));
  }, []);

  // 챔피언별 통계
  useEffect(() => {
    if (!selectedPlayer || showDetails) return;
    setLoadingStats(true);
    fetch(`/api/stats/players/${selectedPlayer}/champions`)
      .then((res) => res.json())
      .then((json) => setChampStats(json))
      .finally(() => setLoadingStats(false));
  }, [selectedPlayer, showDetails]);

  // 상세 통계
  useEffect(() => {
    if (!selectedPlayer || !showDetails) return;
    const query = detailPosition !== "ALL" ? `?position=${detailPosition}` : "";
    fetch(`/api/stats/players/${selectedPlayer}/detail${query}`)
      .then((res) => res.json())
      .then((json) => setDetailStats(json));
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
        {/* 왼쪽 */}
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
                  {player.winrate}%{" "}
                  <span className="text-gray-400">
                    (<span className="text-blue-400">{player.wins}</span>/
                    <span className="text-red-400">{player.losses}</span>)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽 */}
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
                <>
                  {/* 상세 포지션 선택 */}

                  {/* 상세 통계 출력 */}
                  {!detailStats ? (
                    <p className="text-gray-400">불러오는 중...</p>
                  ) : (
                    <>
                      <div className="mb-4">
                        <p className="font-semibold text-lg mb-2">
                          라인별 승률
                        </p>
                        <ul className="space-y-1 text-sm text-gray-300">
                          {detailStats.laneWinrates.map((lane: any) => (
                            <li key={lane.position}>
                              <span className="font-medium">
                                {POSITION_KR_MAP[lane.position] ||
                                  lane.position}
                              </span>{" "}
                              - {lane.winrate}% (
                              <span className="text-blue-400">{lane.wins}</span>
                              /
                              <span className="text-red-400">
                                {lane.losses}
                              </span>
                              )
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* 2. 해당 라인 내 평균 지표 순위 */}
                      {detailStats?.averageRanking && (
                        <div className="mb-4">
                          <h3 className="font-semibold mb-1 text-base">
                            해당 라인 내 평균 지표 순위
                          </h3>
                          <ul className="text-sm text-gray-300 list-disc list-inside">
                            <li>
                              시야 점수: {detailStats.averageRanking.visionRank}
                              위
                            </li>
                            <li>
                              골드: {detailStats.averageRanking.goldRank}위
                            </li>
                            <li>
                              딜량: {detailStats.averageRanking.damageRank}위
                            </li>
                          </ul>
                        </div>
                      )}

                      <div className="mb-4">
                        <select
                          value={detailPosition}
                          onChange={(e) => setDetailPosition(e.target.value)}
                          className="p-1 rounded bg-black/30 border border-white/20 text-sm"
                        >
                          {POSITIONS.map((pos) => (
                            <option
                              key={pos}
                              value={pos === "전체" ? "ALL" : pos}
                            >
                              {pos}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-4">
                        <p className="font-semibold text-lg mb-2">
                          가장 시너지 좋은 팀원
                        </p>
                        {detailStats.bestTeammate ? (
                          <p>
                            {detailStats.bestTeammate.name} -{" "}
                            {detailStats.bestTeammate.winrate}% (
                            {detailStats.bestTeammate.total}판)
                          </p>
                        ) : (
                          <p className="text-gray-400">
                            충분한 데이터가 없습니다.
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-lg mb-2">
                          가장 어려운 상대
                        </p>
                        {detailStats.hardestOpponent ? (
                          <p>
                            {detailStats.hardestOpponent.name} - 패배율{" "}
                            {detailStats.hardestOpponent.loseRate}% (
                            {detailStats.hardestOpponent.total}판)
                          </p>
                        ) : (
                          <p className="text-gray-400">
                            충분한 데이터가 없습니다.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : loadingStats ? (
                <p className="text-gray-500">로딩 중...</p>
              ) : champStats.length === 0 ? (
                <p className="text-gray-500">
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
                          className="border-b border-white/20 hover:bg-white/10 transition-colors duration-150 text-sm h-12"
                        >
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              {c.championKR !== "모든 챔피언" && (
                                <Image
                                  src={c.imageUrl}
                                  alt={c.championKR}
                                  width={24}
                                  height={24}
                                  className="rounded-full"
                                />
                              )}
                              <span className="text-base leading-tight">
                                {c.championKR}
                              </span>
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
