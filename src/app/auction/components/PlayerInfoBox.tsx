"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

interface Player {
  id: string;
  name: string;
  tierCurrent: string;
  tierPeak: string;
  winrateOverall?: number;
  totalGames?: number;
  winrateByLane?: {
    top: number | null;
    jungle: number | null;
    middle: number | null;
    bottom: number | null;
    utility: number | null;
  };
  laneGamesCount?: {
    top: number;
    jungle: number;
    middle: number;
    bottom: number;
    utility: number;
  };
}

export default function PlayerInfoBox({ userId }: { userId: string | null }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const socket = getSocket();

  useEffect(() => {
    if (!userId) return;

    console.log("📦 initPlayer listener attached");

    socket.on("initPlayer", (data: Player) => {
      setPlayer(data);
    });

    socket.emit("requestInit", { userId });

    return () => {
      socket.off("initPlayer");
    };
  }, [socket, userId]);

  if (!player) {
    return (
      <div className="bg-gray-700 p-4 rounded w-full max-w-xl text-center">
        <p className="text-gray-400"> 현재 경매 중인 플레이어 없음</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 p-4 rounded w-full max-w-xl text-center space-y-1">
      <h2 className="text-xl font-bold mb-2"> 경매 중: {player.name}</h2>
      <p>
        현재 티어: <strong>{player.tierCurrent || "미입력"}</strong>
      </p>
      <p>
        최고 티어: <strong>{player.tierPeak || "미입력"}</strong>
      </p>
      {player.winrateOverall !== undefined && (
        <p>
          내전 전체 승률: <strong>{player.winrateOverall}%</strong>
          {player.totalGames !== undefined && <span className="text-sm text-gray-400"> ({player.totalGames}판)</span>}
        </p>
      )}
      {player.winrateByLane && (
        <div className="text-sm text-gray-300 space-y-1">
          <p>라인별 승률:</p>

          {player.laneGamesCount?.top !== undefined && player.laneGamesCount.top > 0 && (
            <p>
              탑: {player.winrateByLane.top ?? "-"}%
              {player.laneGamesCount?.top !== undefined && ` (${player.laneGamesCount.top}판)`}
            </p>
          )}

          {player.laneGamesCount?.jungle !== undefined && player.laneGamesCount.jungle > 0 && (
            <p>
              정글: {player.winrateByLane.jungle ?? "-"}%
              {player.laneGamesCount?.jungle !== undefined && ` (${player.laneGamesCount.jungle}판)`}
            </p>
          )}

          {player.laneGamesCount?.middle !== undefined && player.laneGamesCount.middle > 0 && (
            <p>
              미드: {player.winrateByLane.middle ?? "-"}%
              {player.laneGamesCount?.middle !== undefined && ` (${player.laneGamesCount.middle}판)`}
            </p>
          )}

          {player.laneGamesCount?.bottom !== undefined && player.laneGamesCount.bottom > 0 && (
            <p>
              원딜: {player.winrateByLane.bottom ?? "-"}%
              {player.laneGamesCount?.bottom !== undefined && ` (${player.laneGamesCount.bottom}판)`}
            </p>
          )}

          {player.laneGamesCount?.utility !== undefined && player.laneGamesCount.utility > 0 && (
            <p>
              서폿: {player.winrateByLane.utility ?? "-"}%
              {player.laneGamesCount?.utility !== undefined && ` (${player.laneGamesCount.utility}판)`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
