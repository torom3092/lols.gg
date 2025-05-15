// components/TeamPanel.tsx
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

export default function TeamPanel() {
  const [teams, setTeams] = useState<Record<string, PlayerBasic[]>>({});
  const [bidHistory, setBidHistory] = useState<Record<string, number>>({});
  const [historyEntries, setHistoryEntries] = useState<{
    team: string;
    player: PlayerBasic;
    bid: number;
  }[]>([]);

useEffect(() => {
  const socket = getSocket();

  // 👇 이거 꼭 있어야 서버에서 auctionSync 응답함
  const userId = localStorage.getItem("userId");
  if (userId) {
    const sendInit = () => {
      console.log("📨 TeamPanel → requestInit", userId);
      socket.emit("requestInit", { userId });
    };

    if (socket.connected) {
      sendInit();
    } else {
      socket.on("connect", sendInit);
    }
  }

  socket.on("auctionSync", ({ teams, bidHistory, history }) => {
    console.log("✅ auctionSync 수신 (TeamPanel)", { teams, bidHistory, history });
    setTeams(teams);
    setBidHistory(bidHistory);
    setHistoryEntries(history);
  });

  return () => {
    socket.off("auctionSync");
    socket.off("connect");
  };
}, []);


  return (
    <div className="bg-gray-900 text-white p-6 rounded h-full overflow-y-auto min-h-[600px]">
      <h2 className="text-xl font-bold mb-4">팀 구성 현황</h2>
      {TEAM_ORDER.map((teamName) => {
        const players = teams[teamName] ?? [];
        const totalSpent = bidHistory[teamName] ?? 0;
        return (
          <div
            key={teamName}
            className="mb-6 border-l-4 border-sky-400 pl-4 bg-gray-800 rounded p-4"
          >
            <h3 className="text-lg font-semibold text-sky-300 mb-2">
              {TEAM_LABELS[teamName] ?? teamName}
              <span className="ml-2 text-sm text-gray-400">
                (총 낙찰가: {totalSpent}P)
              </span>
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
