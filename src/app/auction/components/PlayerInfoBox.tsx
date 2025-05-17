"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

interface Player {
  id: string;
  name: string;
  tierCurrent: string;
  tierPeak: string;
  winrateOverall?: number;
  winrateByLane?: {
    top: number | null;
    jungle: number | null;
    middle: number | null;
    bottom: number | null;
    utility: number | null;
  };
}

export default function PlayerInfoBox() {
  console.log("🧪 PlayerInfoBox 렌더링됨");
  const [player, setPlayer] = useState<Player | null>(null);
  const socket = getSocket();
  console.log("🧩 getSocket 반환값:", socket);

  useEffect(() => {
    console.log("📦 showPlayer listener attached");
    socket.on("showPlayer", (data: Player) => {
      console.log("🎯 showPlayer 수신:", data);
      setPlayer(data);
    });

    return () => {
      socket.off("showPlayer");
    };
  }, [socket]);

  if (!player) {
    return (
      <div className="bg-gray-700 p-4 rounded w-full max-w-xl text-center">
        <p className="text-gray-400">🎯 현재 경매 중인 플레이어 없음</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 p-4 rounded w-full max-w-xl text-center space-y-1">
      <h2 className="text-xl font-bold mb-2">🎯 경매 중: {player.name}</h2>
      <p>
        현재 티어: <strong>{player.tierCurrent || "미입력"}</strong>
      </p>
      <p>
        최고 티어: <strong>{player.tierPeak || "미입력"}</strong>
      </p>
      {player.winrateOverall !== undefined && (
        <p>
          내전 전체 승률: <strong>{player.winrateOverall}%</strong>
        </p>
      )}
      {player.winrateByLane && (
        <div className="text-sm text-gray-300 space-y-1">
          <p>라인별 승률:</p>
          <p>탑: {player.winrateByLane.top ?? "-"}%</p>
          <p>정글: {player.winrateByLane.jungle ?? "-"}%</p>
          <p>미드: {player.winrateByLane.middle ?? "-"}%</p>
          <p>원딜: {player.winrateByLane.bottom ?? "-"}%</p>
          <p>서폿: {player.winrateByLane.utility ?? "-"}%</p>
        </div>
      )}
    </div>
  );
}
