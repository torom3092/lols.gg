"use client";

import { useState , useEffect } from "react";

export default function SimulatorPage() {
  const [players, setPlayers] = useState<string[]>([]);
  const [blueTeam, setBlueTeam] = useState<string[]>([]);
  const [redTeam, setRedTeam] = useState<string[]>([]);

  const [selectedTab, setSelectedTab] = useState<
    "team" | "champion" | "player"
  >("team");

  useEffect(() => {
    async function fetchPlayers() {
      const res = await fetch("/api/players");
      const data = await res.json();
      const aliasList = data
        .filter((p: any) => p.alias && p.alias !== "guest")
        .map((p: any) => p.alias);
      setPlayers(aliasList);
    }
    fetchPlayers();
  }, []);

  return (
    <div className="from-gray-900 to-black min-h-screen text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* 탭 선택 버튼 */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setSelectedTab("team")}
            className={`px-6 py-2 rounded-full transition-all ${
              selectedTab === "team"
                ? "bg-blue-500"
                : "bg-neutral-700 hover:bg-neutral-600"
            }`}
          >
            팀 조합 시뮬레이터
          </button>
          <button
            onClick={() => setSelectedTab("champion")}
            className={`px-6 py-2 rounded-full transition-all ${
              selectedTab === "champion"
                ? "bg-blue-500"
                : "bg-neutral-700 hover:bg-neutral-600"
            }`}
          >
            챔피언 조합 시뮬레이터
          </button>
          <button
            onClick={() => setSelectedTab("player")}
            className={`px-6 py-2 rounded-full transition-all ${
              selectedTab === "player"
                ? "bg-blue-500"
                : "bg-neutral-700 hover:bg-neutral-600"
            }`}
          >
            플레이어 조합 분석
          </button>
        </div>

        {/* 탭별 내용 */}
        <div>
          {selectedTab === "team" && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-center">
                팀 조합 시뮬레이터
              </h2>

              {/* 플레이어 리스트 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-neutral-700 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 text-center">
                    플레이어 목록
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {players.map((player) => (
                      <button
                        key={player}
                        onClick={() => handleSelectPlayer(player)}
                        disabled={isPlayerSelected(player)}
                        className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded text-sm"
                      >
                        {player}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 선택된 블루팀/레드팀 */}
                <div className="border border-neutral-700 p-4 rounded-lg flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-blue-400 text-center">
                      블루팀
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {blueTeam.map((player) => (
                        <div
                          key={player}
                          className="bg-blue-500 px-3 py-1 rounded text-sm"
                        >
                          {player}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-red-400 text-center">
                      레드팀
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {redTeam.map((player) => (
                        <div
                          key={player}
                          className="bg-red-500 px-3 py-1 rounded text-sm"
                        >
                          {player}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === "champion" && (
            <div className="text-center text-lg font-bold">
              🛠️ 챔피언 조합 시뮬레이터 화면
            </div>
          )}
          {selectedTab === "player" && (
            <div className="text-center text-lg font-bold">
              🛠️ 플레이어 조합 분석 화면
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
