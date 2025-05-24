// components/RoleSelector.tsx
"use client";

import { useState } from "react";

const TEAM_OPTIONS = ["벅벅가", "문어남자", "브싸", "올리버"];

export default function RoleSelector({ onJoin }: { onJoin: (role: string, teamName?: string) => void }) {
  const [role, setRole] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const handleJoin = () => {
    if (role === "bidder" && !selectedTeam) {
      alert("팀을 선택해주세요!");
      return;
    }
    onJoin(role!, selectedTeam ?? undefined);
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded space-y-4 text-center">
      <h2 className="text-xl font-bold">역할을 선택하세요</h2>

      <div className="flex justify-center gap-4">
        <button onClick={() => setRole("host")} className="bg-blue-600 px-4 py-2 rounded">
          사회자
        </button>
        <button onClick={() => setRole("bidder")} className="bg-green-600 px-4 py-2 rounded">
          경매참여자
        </button>
        <button onClick={() => setRole("spectator")} className="bg-gray-600 px-4 py-2 rounded">
          구경꾼
        </button>
      </div>

      {role === "bidder" && (
        <div>
          <p className="mt-4 font-semibold">팀을 선택하세요:</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {TEAM_OPTIONS.map((team) => (
              <button
                key={team}
                onClick={() => setSelectedTeam(team)}
                className={`py-2 rounded border ${
                  selectedTeam === team ? "bg-yellow-400 text-black font-bold" : "bg-white text-black"
                }`}
              >
                {team} 팀
              </button>
            ))}
          </div>
        </div>
      )}

      {role && (
        <button onClick={handleJoin} className="bg-purple-600 hover:bg-purple-700 px-6 py-2 mt-4 rounded font-bold">
          입장하기
        </button>
      )}
    </div>
  );
}
