// app/simulator/components/PlayerCombinationAnalysis.tsx
"use client";

import { useEffect, useState } from "react";

export default function PlayerCombinationAnalysis() {
  const [players, setPlayers] = useState<string[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(["", ""]);
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/players")
      .then((res) => res.json())
      .then((data) => setPlayers(data.map((p: any) => p.alias)));
  }, []);

  const handleSelect = (value: string, index: number) => {
    const updated = [...selectedPlayers];
    updated[index] = value;
    setSelectedPlayers(updated);
  };

  const handleCompare = async () => {
    const filtered = selectedPlayers.filter((p) => p);
    if (filtered.length < 2) {
      alert("최소 두 명의 플레이어를 선택해주세요.");
      return;
    }

    const params = new URLSearchParams();
    params.set("players", filtered.join(","));

    setLoading(true);

    const res = await fetch(`/api/analysis/players?${params.toString()}`);
    if (!res.ok) {
      const html = await res.text();
      console.error("서버 응답 오류:", html);
      alert("API 호출 중 오류 발생");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">플레이어 조합 분석</h1>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {[0, 1, 2].map((i) => (
          <select
            key={i}
            className="w-64 px-4 py-2 rounded-md border border-neutral-700 bg-neutral-800 text-white"
            value={selectedPlayers[i] || ""}
            onChange={(e) => handleSelect(e.target.value, i)}
          >
            <option value="">
              플레이어 {i + 1} 선택{i > 1 ? " (선택)" : ""}
            </option>
            {players.map((player) => (
              <option key={player} value={player}>
                {player}
              </option>
            ))}
          </select>
        ))}
      </div>

      <div className="text-center mb-6">
        <button
          onClick={handleCompare}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-semibold"
        >
          분석하기
        </button>
      </div>

      {loading && <div className="text-center text-neutral-300">분석 중...</div>}

      {result && (
        <div className="mt-6 bg-neutral-800 p-6 rounded-lg text-white space-y-2 text-center">
          <div>총 경기 수: {result.total}회</div>
          <div>승리 수: {result.wins}회</div>
          <div>패배 수: {result.losses}회</div>
          <div className="font-bold">승률: {result.winrate}%</div>
        </div>
      )}
    </div>
  );
}
