"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { PLAYERS, PlayerBasic } from "@/lib/players";

type PlayerStatus = "idle" | "current" | "drafted" | "passed";

export default function PlayerPanel() {
  const socket = getSocket();

  const [playerStatuses, setPlayerStatuses] = useState<Record<string, PlayerStatus>>({});

  useEffect(() => {
    // 초기 상태: 모두 idle
    setPlayerStatuses(Object.fromEntries(PLAYERS.map((p) => [p.id, "idle"])));

    socket.on("showPlayer", (player: PlayerBasic) => {
      setPlayerStatuses((prev) => {
        const updated = { ...prev };
        // 모든 current 상태 초기화
        Object.keys(updated).forEach((id) => {
          if (updated[id] === "current") updated[id] = "idle";
        });
        updated[player.id] = "current";
        return updated;
      });
    });

    socket.on("playerDrafted", ({ player }: { player: PlayerBasic }) => {
      setPlayerStatuses((prev) => ({
        ...prev,
        [player.id]: "drafted",
      }));
    });

    socket.on("playerPassed", ({ player }: { player: PlayerBasic }) => {
      setPlayerStatuses((prev) => ({
        ...prev,
        [player.id]: "passed",
      }));
    });

    return () => {
      socket.off("showPlayer");
      socket.off("playerDrafted");
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
            <div key={player.id} className={`p-2 rounded text-center font-semibold border ${className}`}>
              {player.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
