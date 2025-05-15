"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { PLAYERS } from "@/lib/players";

type PlayerStatus = "idle" | "current" | "drafted" | "passed";

export default function PlayerList() {
  const [playerStatuses, setPlayerStatuses] = useState<Record<string, PlayerStatus>>({});

  const findIdByName = (name: string) => {
    const found = PLAYERS.find((p) => p.name === name);
    if (!found) console.warn("[PlayerList] 이름으로 ID 찾기 실패:", name);
    return found?.id;
  };

  useEffect(() => {
    const socket = getSocket();

    socket.on("auctionReset", () => {
      console.log("[PlayerList] auctionReset 수신 → 상태 초기화");
      setPlayerStatuses({});
    });

    socket.on("auctionSync", ({ teams }) => {
      if (!teams) return;
      console.log("[PlayerList] auctionSync 수신:", teams);

      const draftedIds = new Set<string>();
      Object.values(teams).forEach((players: any) => {
        players.forEach((p: any) => draftedIds.add(p.id));
      });

      setPlayerStatuses((prev) => {
        const updated: Record<string, PlayerStatus> = {};
        for (const player of PLAYERS) {
          updated[player.id] = draftedIds.has(player.id) ? "drafted" : "idle";
        }
        return updated;
      });
    });

    socket.on("playerPassed", ({ id, name }: { id: string; name: string }) => {
      console.log("[PlayerList] playerPassed 수신:", id);
      setPlayerStatuses((prev) => ({
        ...prev,
        [id]: "passed",
      }));
    });

    socket.on("playerDrafted", ({ name }: { name: string }) => {
      const id = findIdByName(name);
      console.log("[playerDrafted] 받은 이름:", name, "→ id 변환 결과:", id);
      if (!id) return; // ❗ 여기서 걸리는지 확인
      setPlayerStatuses((prev) => ({
        ...prev,
        [id]: "drafted",
      }));
    });

    socket.on("showPlayer", ({ id }: { id: string }) => {
      console.log("[PlayerList] showPlayer 수신:", id);

      setPlayerStatuses((prev) => {
        const updated: Record<string, PlayerStatus> = {};
        for (const player of PLAYERS) {
          if (player.id === id) {
            updated[player.id] = "current";
          } else if (prev[player.id] === "drafted" || prev[player.id] === "passed") {
            updated[player.id] = prev[player.id]; // 유지
          } else {
            updated[player.id] = "idle";
          }
        }
        return updated;
      });
    });

    return () => {
      socket.off("auctionSync");
      socket.off("playerPassed");
      socket.off("playerDrafted");
      socket.off("showPlayer");
      socket.off("auctionReset");
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
