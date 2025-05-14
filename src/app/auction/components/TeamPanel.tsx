// components/TeamPanel.tsx + PlayerPanel.tsx 통합
"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { PLAYERS, PlayerBasic } from "@/lib/players";

const TEAM_LABELS: Record<string, string> = {
  그카: "팀 그카",
  고전퐈: "팀 고전퐈",
  wisp: "팀 wisp",
  khc: "팀 khc",
};

const TEAM_ORDER = ["그카", "고전퐈", "wisp", "khc"];

type PlayerStatus = "idle" | "current" | "drafted" | "passed";

export default function TeamAndPlayerPanel() {
  const [teams, setTeams] = useState<Record<string, PlayerBasic[]>>({});
  const [bidHistory, setBidHistory] = useState<Record<string, number>>({});
  const [historyEntries, setHistoryEntries] = useState<
    {
      team: string;
      player: PlayerBasic;
      bid: number;
    }[]
  >([]);
  const [playerStatuses, setPlayerStatuses] = useState<Record<string, PlayerStatus>>({});
  const [currentPlayer, setCurrentPlayer] = useState<PlayerBasic | null>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on("auctionSync", ({ teams, bidHistory, history }) => {
      setTeams(teams);
      setBidHistory(bidHistory);
      setHistoryEntries(history);

      const draftedIds = new Set(
        Object.values(teams)
          .flat()
          .map((p: any) => p.id)
      );

      const updated: Record<string, PlayerStatus> = {};
      for (const p of PLAYERS) {
        updated[p.id] = draftedIds.has(p.id) ? "drafted" : "idle";
      }
      setPlayerStatuses(updated);
    });

    socket.on("showPlayer", (player: PlayerBasic) => {
      setCurrentPlayer(player);
      setPlayerStatuses((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((id) => {
          if (updated[id] === "current") updated[id] = "idle";
        });
        updated[player.id] = "current";
        return updated;
      });
    });

    socket.on("playerPassed", ({ player }: { player: PlayerBasic }) => {
      setPlayerStatuses((prev) => ({
        ...prev,
        [player.id]: "passed",
      }));
    });

    return () => {
      socket.off("auctionSync");
      socket.off("showPlayer");
      socket.off("playerPassed");
    };
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 팀 패널 */}
      <div className="bg-gray-900 text-white p-4 rounded h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">팀 구성 현황</h2>
        {TEAM_ORDER.map((teamName) => {
          const players = teams[teamName] ?? [];
          const totalSpent = bidHistory[teamName] ?? 0;
          return (
            <div key={teamName} className="mb-6 border-l-4 border-sky-400 pl-4 bg-gray-800 rounded p-2">
              <h3 className="text-lg font-semibold text-sky-300 mb-2">
                {TEAM_LABELS[teamName] ?? teamName}
                <span className="ml-2 text-sm text-gray-400">(총 낙찰가: {totalSpent}P)</span>
              </h3>
              <ul className="list-disc list-inside text-sm text-white space-y-1">
                {players.length === 0 ? (
                  <li className="text-gray-500 italic">아직 없음</li>
                ) : (
                  players.map((player, idx) => (
                    <li key={player.id} className="flex justify-between">
                      <span>{player.name}</span>
                      <span className="text-xs text-gray-400">#{idx + 1}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          );
        })}

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">낙찰 히스토리</h2>
          <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
            {historyEntries.length === 0 ? (
              <li className="text-gray-500 italic">아직 낙찰된 플레이어 없음</li>
            ) : (
              historyEntries.map((entry, idx) => (
                <li key={idx}>
                  {TEAM_LABELS[entry.team] ?? entry.team} - {entry.player.name} ({entry.bid}P)
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* 플레이어 상태 패널 */}
      <div className="bg-gray-800 rounded p-4 text-white h-full overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">남은 플레이어</h2>
        <div className="grid grid-cols-2 gap-2">
          {PLAYERS.map((player) => {
            const status = playerStatuses[player.id];
            const className =
              status === "current"
                ? "bg-yellow-500 text-black border-yellow-400"
                : status === "drafted"
                ? "bg-green-600 border-green-400"
                : status === "passed"
                ? "bg-gray-500 border-gray-400 text-white"
                : "bg-gray-700 border-gray-600";

            return (
              <div key={player.id} className={`p-2 rounded text-center font-semibold border ${className}`}>
                {player.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
