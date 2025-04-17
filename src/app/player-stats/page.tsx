"use client";

import { useState, useEffect } from "react";

const ROLES = ["전체", "탑", "정글", "미드", "원딜", "서폿"];
const GAME_FILTERS = [5, 10, 15, 20, 25];
const ROLE_MAP: Record<string, string> = {
  전체: "ALL",
  탑: "TOP",
  정글: "JUNGLE",
  미드: "MIDDLE",
  원딜: "BOTTOM",
  서폿: "UTILITY",
};

export default function PlayerStatsPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState("전체");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [minGames, setMinGames] = useState(10);

  useEffect(() => {
    const fetchPlayers = async () => {
      const res = await fetch("/api/stats/players");
      const json = await res.json();
      setPlayers(json); // [{ alias, position, winrate, games }]
    };
    fetchPlayers();
  }, []);

  const filteredPlayers = players
    .filter((p) => selectedRole === "전체" || p.position === ROLE_MAP[selectedRole])
    .filter((p) => p.games >= minGames)
    .sort((a, b) => b.winrate - a.winrate);

  return (
    <main className="p-6 text-white max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">🧙‍♂️ 플레이어 통계</h1>

      <div className="flex rounded-xl overflow-hidden border border-white/10 bg-white/5">
        {/* 왼쪽: 필터 + 유저 목록 */}
        <div className="w-64 border-r border-white/10 p-4 space-y-4 bg-black/30">
          <div className="flex flex-wrap gap-1">
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedRole === role ? "bg-blue-600" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* ✅ 판수 필터 */}
          <div className="mt-2">
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
          </div>

          {/* ✅ 플레이어 리스트 */}
          <div className="mt-4 space-y-2">
            {filteredPlayers.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">표시할 유저가 없습니다</p>
            ) : (
              filteredPlayers.map((player) => (
                <div
                  key={player.alias}
                  onClick={() => setSelectedPlayer(player.alias)}
                  className={`flex justify-between px-3 py-2 rounded cursor-pointer ${
                    selectedPlayer === player.alias ? "bg-blue-700" : "hover:bg-white/10"
                  }`}
                >
                  <span>{player.alias}</span>
                  <span className="text-sm text-gray-200">
                    {player.winrate}%{" "}
                    <span className="text-gray-400">
                      (<span className="text">{player.wins}</span>/<span className="text">{player.losses}</span>)
                    </span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 오른쪽: 플레이어 상세 정보 */}
        <div className="flex-1 p-6">
          {selectedPlayer ? (
            <p className="text-xl font-semibold">{selectedPlayer}의 통계 상세 정보</p>
          ) : (
            <p className="text-gray-400 text-center mt-10">플레이어를 선택해주세요.</p>
          )}
        </div>
      </div>
    </main>
  );
}
