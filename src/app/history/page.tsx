"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MatchCard from "@/app/history/components/MatchCard";

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tab, setTab] = useState<"history" | "highlight" | "rollscup">("history");
  const [matches, setMatches] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(Number(searchParams.get("page") || "1"));
  const limit = 10;

  const [filters, setFilters] = useState({
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
    name: searchParams.get("name") || "",
    champion: searchParams.get("champion") || "",
    matchId: searchParams.get("matchId") || "",
  });

  const updateUrlParams = (updatedFilters: any, newPage: number) => {
    const params = new URLSearchParams();
    if (updatedFilters.from) params.set("from", updatedFilters.from);
    if (updatedFilters.to) params.set("to", updatedFilters.to);
    if (updatedFilters.name) params.set("name", updatedFilters.name);
    if (updatedFilters.champion) params.set("champion", updatedFilters.champion);
    if (updatedFilters.matchId) params.set("matchId", updatedFilters.matchId);
    params.set("page", newPage.toString());
    router.push(`/history?${params.toString()}`);
  };

  const fetchMatches = async () => {
    const params = new URLSearchParams();
    if (filters.from) params.append("from", filters.from);
    if (filters.to) params.append("to", filters.to);
    if (filters.name) params.append("name", filters.name);
    if (filters.champion) params.append("champion", filters.champion);
    if (filters.matchId) params.append("matchId", filters.matchId);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const res = await fetch(`/api/matches?${params.toString()}`);
    const json = await res.json();
    setMatches(json.matches);
    setTotal(json.total);
  };

  useEffect(() => {
    fetchMatches();
  }, [filters, page]);

  const handleFilterChange = (key: string, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    setPage(1);
    updateUrlParams(updated, 1);
  };

  const resetFilters = () => {
    const cleared = { from: "", to: "", name: "", champion: "", matchId: "" };
    setFilters(cleared);
    setPage(1);
    updateUrlParams(cleared, 1);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">📚 기록실</h1>

      {/* 탭 */}
      <div className="flex space-x-4 mb-6 justify-center border-b border-white/20 pb-2">
        {["history", "highlight", "rollscup"].map((key) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`px-4 py-2 rounded-t ${
              tab === key
                ? "bg-white text-black font-bold"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {key === "history" ? "기록실" : key === "highlight" ? "하이라이트" : "롤스컵"}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        {tab === "history" && (
          <>
            {/* 필터 + 정렬 UI */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-7 gap-2">
              <input type="date" value={filters.from} onChange={(e) => handleFilterChange("from", e.target.value)} className="p-2 rounded bg-black/40 text-white border border-gray-600" />
              <input type="date" value={filters.to} onChange={(e) => handleFilterChange("to", e.target.value)} className="p-2 rounded bg-black/40 text-white border border-gray-600" />
              <input type="text" value={filters.name} onChange={(e) => handleFilterChange("name", e.target.value)} placeholder="플레이어 이름" className="p-2 rounded bg-black/40 text-white border border-gray-600" />
              <input type="text" value={filters.champion} onChange={(e) => handleFilterChange("champion", e.target.value)} placeholder="챔피언 이름" className="p-2 rounded bg-black/40 text-white border border-gray-600" />
              <input type="text" value={filters.matchId} onChange={(e) => handleFilterChange("matchId", e.target.value)} placeholder="매치 ID" className="p-2 rounded bg-black/40 text-white border border-gray-600" />
              <button onClick={resetFilters} className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition">초기화</button>
            </div>

            {/* 매치 목록 */}
            {matches.length === 0 ? (
              <p className="text-center text-gray-500">조건에 맞는 경기가 없습니다.</p>
            ) : (
              <>
                {matches.map((match: any) => (
                  <MatchCard key={match.uniqueId} match={match} />
                ))}
                <div className="flex justify-center items-center gap-4 mt-4">
                  <button
                    disabled={page <= 1}
                    onClick={() => {
                      setPage(page - 1);
                      updateUrlParams(filters, page - 1);
                    }}
                    className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
                  >
                    이전
                  </button>
                  <span className="text-sm">{page} / {Math.ceil(total / limit)}</span>
                  <button
                    disabled={page >= Math.ceil(total / limit)}
                    onClick={() => {
                      setPage(page + 1);
                      updateUrlParams(filters, page + 1);
                    }}
                    className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              </>
            )}
          </>
        )}
        {tab === "highlight" && <div className="text-gray-400 text-center py-10">✨ 하이라이트 기능은 곧 업데이트됩니다!</div>}
        {tab === "rollscup" && <div className="text-gray-400 text-center py-10">🏆 롤스컵 정보는 곧 추가될 예정입니다!</div>}
      </div>
    </div>
  );
}
