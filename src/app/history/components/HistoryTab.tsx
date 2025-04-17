// ✅ components/HistoryTab.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MatchCard from "./MatchCard";

export default function HistoryTab() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
    <div>
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-7 gap-2">
        <input
          type="date"
          value={filters.from}
          onChange={(e) => handleFilterChange("from", e.target.value)}
          className="p-2 rounded bg-black/40 text-white border border-gray-600"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => handleFilterChange("to", e.target.value)}
          className="p-2 rounded bg-black/40 text-white border border-gray-600"
        />
        <input
          type="text"
          value={filters.name}
          onChange={(e) => handleFilterChange("name", e.target.value)}
          placeholder="플레이어 이름"
          className="p-2 rounded bg-black/40 text-white border border-gray-600"
        />
        <input
          type="text"
          value={filters.champion}
          onChange={(e) => handleFilterChange("champion", e.target.value)}
          placeholder="챔피언 이름"
          className="p-2 rounded bg-black/40 text-white border border-gray-600"
        />
        <input
          type="text"
          value={filters.matchId}
          onChange={(e) => handleFilterChange("matchId", e.target.value)}
          placeholder="매치 ID"
          className="p-2 rounded bg-black/40 text-white border border-gray-600"
        />
        <button onClick={resetFilters} className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition">
          초기화
        </button>
      </div>

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
            <span className="text-sm">
              {page} / {Math.ceil(total / limit)}
            </span>
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
    </div>
  );
}
