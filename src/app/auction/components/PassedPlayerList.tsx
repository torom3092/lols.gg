"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

export default function PassedPlayerList() {
  const [passedPlayers, setPassedPlayers] = useState<string[]>([]);

  useEffect(() => {
    const socket = getSocket();

    socket.on("playerPassedListUpdate", (list: string[]) => {
      setPassedPlayers(list);
    });

    return () => {
      socket.off("playerPassedListUpdate");
    };
  }, []);

  if (passedPlayers.length === 0) return null;

  return (
    <div className="mt-6 p-4 rounded-lg bg-[#374151] border border-gray-600 text-white">
      <h4 className="text-sm font-semibold mb-2 text-yellow-300">유찰된 플레이어</h4>
      <ul className="text-sm space-y-1">
        {passedPlayers.map((name, idx) => (
          <li key={idx}>• {name}</li>
        ))}
      </ul>
    </div>
  );
}
