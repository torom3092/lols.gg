"use client";

import { useEffect, useState } from "react";

interface Player {
  alias: string;
  nicknames: string[];
}

export default function AddPlayerPage() {
  const [nickname, setNickname] = useState("");
  const [alias, setAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [search, setSearch] = useState("");

  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(data);
  };

  useEffect(() => {
    fetchPlayers();
  }, [refresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, alias }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ 저장 완료!");
        setNickname("");
        setAlias("");
        setRefresh(!refresh);
      } else {
        setMessage("❌ 저장 실패. 다시 시도해보세요.");
      }
    } catch (error) {
      setMessage("❌ 에러 발생: " + String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleNicknameUpdate = async (alias: string, oldNickname: string, newNickname: string) => {
    if (!newNickname || newNickname === oldNickname) return;
    await fetch("/api/players", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alias, oldNickname, newNickname }),
    });
    setRefresh(!refresh);
  };

  const handleNicknameDelete = async (alias: string, nickname: string) => {
    await fetch("/api/players", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alias, nickname }),
    });
    setRefresh(!refresh);
  };

  const handleAliasDelete = async (alias: string) => {
    await fetch(`/api/players/${alias}`, {
      method: "DELETE",
    });
    setRefresh(!refresh);
  };

  const filteredPlayers = players.filter(
    (p) =>
      p.alias.toLowerCase().includes(search.toLowerCase()) ||
      p.nicknames.some((n) => n.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 p-4 text-white">
      <div className="max-w-xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg">
        <h1 className="text-xl font-semibold mb-6 text-center">👤 플레이어 관리</h1>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm mb-1 text-gray-300">롤 닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              className="w-full p-2 rounded bg-black/40 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 태우#KR1"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-300">플레이어</label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              required
              className="w-full p-2 rounded bg-black/40 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 벽벅가"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-2 rounded font-semibold hover:bg-gray-200 transition"
          >
            {loading ? "등록 중..." : "등록하기"}
          </button>
          {message && <p className="text-sm text-center mt-2 text-gray-300">{message}</p>}
        </form>

        <h2 className="text-lg font-semibold mb-4 text-gray-200">📜 등록된 플레이어</h2>

        <input
          type="text"
          placeholder="별명 또는 닉네임 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-black/30 text-white placeholder-gray-400 border border-gray-600 focus:outline-none"
        />

        {filteredPlayers.map((player) => (
          <div key={player.alias} className="border border-white/10 bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-white">{player.alias}</h3>
              <button onClick={() => handleAliasDelete(player.alias)} className="text-red-400 text-sm hover:underline">
                삭제
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {player.nicknames.map((name) => (
                <div key={name} className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                  <input
                    className="bg-transparent border-none text-white focus:outline-none w-[100px]"
                    defaultValue={name}
                    onBlur={(e) => handleNicknameUpdate(player.alias, name, e.target.value)}
                  />
                  <button
                    onClick={() => handleNicknameDelete(player.alias, name)}
                    className="text-red-300 text-xs hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
