"use client";

import { useState } from "react";

export default function UploadMatchForm() {
  const [input, setInput] = useState(""); // JSON string
  const [matchId, setMatchId] = useState("");
  const [gameDate, setGameDate] = useState("");
  const [message, setMessage] = useState("");

  const generateUniqueId = (matchId: string, gameDate: string) => {
    const formattedDate = new Date(gameDate).toISOString();
    return `${matchId}-${formattedDate}`;
  };

  const handleUpload = async () => {
    try {
      const parsed = JSON.parse(input);
      const uniqueId = generateUniqueId(matchId, gameDate);
      parsed.matchId = matchId;
      parsed.gameDate = gameDate;
      parsed.uniqueId = uniqueId;

      const nicknames = (parsed.participants ?? []).map((p: any) => p.RIOT_ID_GAME_NAME).filter(Boolean);

      const res = await fetch("/api/upload-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("✅ 업로드 완료");

        await fetch("/api/players/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nicknames }),
        });
      } else {
        setMessage(`❌ 실패: ${result.message}`);
      }
    } catch (err) {
      setMessage("❌ JSON 형식이 올바르지 않아요");
      console.error(err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setInput(text);
  };

  const handleReset = () => {
    setMatchId("");
    setGameDate("");
    setInput("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto bg-[#1f1f1f] rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">📂 매치 JSON 업로드</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Match ID</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-[#2a2a2a] border border-gray-600 text-white placeholder-gray-400"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            placeholder="예: game123"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Game Date</label>
          <input
            type="datetime-local"
            className="w-full p-2 rounded bg-[#2a2a2a] border border-gray-600 text-white"
            value={gameDate}
            onChange={(e) => setGameDate(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">JSON 파일 선택</label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="w-full p-2 rounded bg-[#2a2a2a] border border-gray-600 text-white file:bg-gray-700 file:text-white file:border-0"
          />
        </div>

        <textarea
          className="w-full h-64 p-4 mb-4 rounded bg-[#2a2a2a] border border-gray-600 text-sm text-white placeholder-gray-500"
          placeholder="(자동 입력됨) JSON 내용 확인용"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex space-x-2">
          <button
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
            onClick={handleUpload}
          >
            업로드
          </button>
          <button
            className="w-full py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded transition"
            onClick={handleReset}
          >
            초기화
          </button>
        </div>

        {message && <p className="mt-4 text-sm text-gray-300">{message}</p>}
      </div>
    </div>
  );
}
