// components/PlayerList.tsx
"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { PLAYERS, PlayerBasic } from "@/lib/players";

type PlayerStatus = "idle" | "current" | "drafted" | "passed";

export default function PlayerList() {
  const [playerStatuses, setPlayerStatuses] = useState<Record<string, PlayerStatus>>({});
  const [currentPlayer, setCurrentPlayer] = useState<PlayerBasic | null>(null);

useEffect(() => {
  const socket = getSocket();

  socket.on("auctionSync", ({ data }) => {
     console.log("✅ auctionSync 수신", data);
    const draftedIds = new Set(
      Object.values(data).flat().map((p:any) => p.id)
    );
    const updated: Record<string, PlayerStatus> = {};
    for (const p of PLAYERS) {
      updated[p.id] = draftedIds.has(p.id) ? "drafted" : "idle";
    }
    setPlayerStatuses(updated);
  });

  socket.on("showPlayer", (player: PlayerBasic) => {
    setPlayerStatuses((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        if (updated[id] === "current") updated[id] = "idle";
      });
      updated[player.id] = "current";
      return updated;
    });
  });

  socket.on("playerPassed", ({ player }) => {
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
            <div
              key={player.id}
              className={`p-2 rounded text-center font-semibold border ${className}`}
            >
              {player.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
