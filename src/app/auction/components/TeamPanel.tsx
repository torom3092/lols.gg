// components/TeamPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { PlayerBasic } from "@/lib/players";

const TEAM_LABELS: Record<string, string> = {
  벅벅가: "팀 벅벅가",
  낮달: "팀 낮달",
  브싸: "팀 브싸",
  올리버버: "팀 올리버",
};

const TEAM_ORDER = ["벅벅가", "낮달", "브싸", "올리버"];

interface HistoryEntry {
  team: string;
  player: PlayerBasic;
  bid: number;
}

export default function TeamPanel() {
  const [teams, setTeams] = useState<Record<string, PlayerBasic[]>>({});
  const [bidHistory, setBidHistory] = useState<Record<string, number>>({});
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const socket = getSocket();

    const handleSync = (data: {
      syncedTeams: Record<string, PlayerBasic[]>;
      syncedHistory: HistoryEntry[];
      syncedBids: Record<string, number>;
    }) => {
      setTeams(data.syncedTeams);
      setHistoryEntries(data.syncedHistory);
      setBidHistory(data.syncedBids);
    };

    socket.on("teamPanelSync", handleSync);

    return () => {
      socket.off("teamPanelSync", handleSync);
    };
  }, []);

  return (
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
  );
}
