"use client";

import { useEffect, useState } from "react";
import ChampionSimulatorPage from "./components/ChampionSimulatorPage";
import PlayerCombinationAnalysis from "./components/PlayerCombinationAnalysis";
import ChampionGraph from "./components/ChampionGraph";
import PlayerGraph from "./components/PlayerGraph.tsx";

export default function SimulatorPage() {
  const [selectedTab, setSelectedTab] = useState<"team" | "champion" | "player" | "playerGraph" | "ChampionGraph">(
    "team"
  );
  const [players, setPlayers] = useState<string[]>([]);
  const [blueTeam, setBlueTeam] = useState<string[]>([]);
  const [redTeam, setRedTeam] = useState<string[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    // 기본 2명 지정해도 되고 빈 값으로 처리 가능
    const defaultPlayers = ["", ""];
    const params = new URLSearchParams({ players: defaultPlayers.join(",") });

    fetch(`/api/analysis/players?${params}`)
      .then((res) => res.json())
      .then(setResult);
  }, []);

  useEffect(() => {
    async function fetchPlayers() {
      const res = await fetch("/api/players");
      const data = await res.json();
      const aliasList = data.filter((p: any) => p.alias && p.alias !== "guest").map((p: any) => p.alias);
      setPlayers(aliasList);
    }
    async function fetchMatches() {
      const res = await fetch("/api/simulator/matches");
      const data = await res.json();
      setMatches(data);
    }
    fetchPlayers();
    fetchMatches();
  }, []);

  function handleSelectPlayer(player: string) {
    if (blueTeam.length < 5) {
      setBlueTeam([...blueTeam, player]);
    } else if (redTeam.length < 5) {
      setRedTeam([...redTeam, player]);
    }
  }

  function isPlayerSelected(player: string) {
    return blueTeam.includes(player) || redTeam.includes(player);
  }

  function calculateTeamWinrate(team: string[], matches: any[]): number {
    if (team.length === 0) return 0;

    let totalWinrate = 0;

    for (const player of team) {
      const playerMatches = matches.filter((match) => match.participants.some((p: any) => p.name === player));
      const totalGames = playerMatches.length;
      if (totalGames === 0) continue;

      const wins = playerMatches.filter(
        (match) => match.participants.find((p: any) => p.name === player)?.win === "Win"
      ).length;

      const winrate = (wins / totalGames) * 100;
      totalWinrate += winrate;
    }

    return totalWinrate / team.length;
  }

  const blueAvg = calculateTeamWinrate(blueTeam, matches);
  const redAvg = calculateTeamWinrate(redTeam, matches);
  const total = blueAvg + redAvg;

  const blueFinal = total > 0 ? +((blueAvg / total) * 100).toFixed(1) : 50;
  const redFinal = total > 0 ? +((redAvg / total) * 100).toFixed(1) : 50;

  return (
    <div className=" min-h-screen text-white">
      <div className="max-w-6xl mx-auto p-8">
        {/* 탭 선택 버튼 */}
        <div className="flex justify-center gap-4 mb-10">
          {[
            { key: "team", label: "팀 조합 시뮬레이터" },
            { key: "champion", label: "챔피언 조합 시뮬레이터" },
            { key: "player", label: "플레이어 조합 분석" },
            { key: "ChampionGraph", label: "챔피언 조합표" },
            { key: "playerGraph", label: "플레이어 조합표" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key as any)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedTab === key ? "bg-blue-500" : "bg-neutral-700 hover:bg-neutral-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 탭별 내용 */}
        {selectedTab === "team" && (
          <div className="space-y-10">
            <h2 className="text-4xl font-extrabold text-center mb-6">팀 조합 시뮬레이터</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 플레이어 리스트 */}
              <div className="bg-neutral-800 p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold mb-4 text-center">플레이어 목록</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {players.map((player) => (
                    <button
                      key={player}
                      onClick={() => handleSelectPlayer(player)}
                      disabled={isPlayerSelected(player)}
                      className="bg-neutral-700 hover:bg-blue-500 hover:scale-105 transition-all duration-300 px-4 py-2 rounded text-sm font-semibold"
                    >
                      {player}
                    </button>
                  ))}
                </div>
              </div>

              {/* 선택된 블루팀/레드팀 */}
              <div className="bg-neutral-800 p-6 rounded-2xl shadow-lg flex flex-col gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-blue-400 text-center">블루팀</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {blueTeam.map((player) => (
                      <div key={player} className="bg-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
                        {player}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-red-400 text-center">레드팀</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {redTeam.map((player) => (
                      <div key={player} className="bg-red-600 px-4 py-2 rounded-full text-sm font-semibold">
                        {player}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 팀 분석 결과 */}
            {blueTeam.length === 5 && redTeam.length === 5 && (
              <div className="p-8 bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-2xl shadow-2xl">
                <h2 className="text-3xl font-extrabold mb-6 text-center">팀 분석 결과</h2>
                <div className="flex justify-center items-center gap-8 text-2xl font-bold">
                  <div className="text-red-400">레드팀 승률 {redFinal}%</div>
                  <div className="text-white">vs</div>
                  <div className="text-blue-400">블루팀 승률 {blueFinal}%</div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTab === "champion" && <ChampionSimulatorPage />}

        {selectedTab === "player" && <PlayerCombinationAnalysis />}

        {selectedTab === "ChampionGraph" && <ChampionGraph />}

        {selectedTab === "playerGraph" && <PlayerGraph />}
      </div>
    </div>
  );
}
