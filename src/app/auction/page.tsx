// app/auction/page.tsx
"use client";

import { useState, useEffect } from "react";
import RoleSelector from "./components/RoleSelector";
import TeamPanel from "./components/TeamPanel";
import PlayerInfoBox from "./components/PlayerInfoBox";
import BidPanel from "./components/BidPanel";
import PlayerList from "./components/PlayerList";
import { getSocket } from "@/lib/socket";

export default function AuctionPage() {
  const [joined, setJoined] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [team, setTeam] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const socket = getSocket();

  useEffect(() => {
    if (!joined || !userId) return;

    const socket = getSocket();

    const sendInit = () => {
      console.log("📨 [클라] requestInit emit 시작", userId);
      socket.emit("requestInit", { userId });
    };

    if (socket.connected) {
      console.log("✅ [클라] 소켓 연결됨");
      setTimeout(sendInit, 300);
    } else {
      socket.on("connect", () => {
        console.log("✅ [클라] 소켓 연결 후 emit");
        setTimeout(sendInit, 300);
      });
    }

    return () => {
      socket.off("connect", sendInit);
    };
  }, [joined, userId]);

  const handleJoin = (selectedRole: string, selectedTeam?: string) => {
    const newUserId = selectedTeam ?? selectedRole;
    setUserId(newUserId);
    setRole(selectedRole);
    setTeam(selectedTeam ?? null);
    setJoined(true);

    console.log(`🙋‍♂️ 역할: ${selectedRole}, 팀: ${selectedTeam}`);

    socket.emit("join", {
      userId: newUserId,
      role: selectedRole,
      team: selectedTeam ?? null,
    });
  };

  if (!joined) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <RoleSelector onJoin={handleJoin} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 p-4 min-h-screen text-white">
      <div className="col-span-3">
        <TeamPanel />
      </div>
      <div className="col-span-6 flex flex-col items-center space-y-4">
        <PlayerInfoBox />
        <BidPanel role={role} team={team} userId={userId} />
      </div>
      <div className="col-span-3">
        <PlayerList />
      </div>
    </div>
  );
}
