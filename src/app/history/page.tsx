"use client";

import { useEffect, useRef, useState } from "react";
import MatchCard from "@/app/history/components/MatchCard";

export default function HistoryPage() {
  const [tab, setTab] = useState<"history" | "highlight" | "rollscup">("history");
  const [matches, setMatches] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "", name: "", champion: "", matchId: "" });
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [displayCount, setDisplayCount] = useState(10);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      const res = await fetch("/api/matches");
      const data = await res.json();
      setMatches(data);
    };
    fetchMatches();
  }, []);

  const resetFilters = () => {
    setFilters({ from: "", to: "", name: "", champion: "", matchId: "" });
    setDisplayCount(10);
  };

  const filteredMatches = matches.filter((match: any) => {
    const date = new Date(match.gameDate);
    const fromCheck = filters.from ? date >= new Date(filters.from) : true;
    const toCheck = filters.to ? date <= new Date(filters.to) : true;

    const nameCheck = filters.name
      ? match.participants.some((p: any) => p.name.toLowerCase().includes(filters.name.toLowerCase()))
      : true;

    const champCheck = filters.champion
      ? match.participants.some((p: any) => p.championName.toLowerCase().includes(filters.champion.toLowerCase()))
      : true;

    const matchIdCheck = filters.matchId ? match.matchId?.toLowerCase().includes(filters.matchId.toLowerCase()) : true;

    return fromCheck && toCheck && nameCheck && champCheck && matchIdCheck;
  });

  const getTime = (date: any) =>
    typeof date === "string" ? new Date(date).getTime() : new Date(date?.$date || date).getTime();

  const sortedMatches = [...filteredMatches].sort((a: any, b: any) => {
    const aDate = getTime(a.gameDate);
    const bDate = getTime(b.gameDate);
    return sortOrder === "newest" ? bDate - aDate : aDate - bDate;
  });

  const visibleMatches = sortedMatches.slice(0, displayCount);

  const loadMore = () => {
    setDisplayCount((prev) => prev + 10);
  };

  useEffect(() => {
    if (!loadMoreRef.current) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        loadMore();
      }
    });

    observerRef.current.observe(loadMoreRef.current);
  }, [visibleMatches]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">📚 기록실</h1>

      {/* 탭 */}
      <div className="flex space-x-4 mb-6 justify-center border-b border-white/20 pb-2">
        {[
          { key: "history", label: "기록실" },
          { key: "highlight", label: "하이라이트" },
          { key: "rollscup", label: "롤스컵" },
        ].map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key as any)}
            className={`px-4 py-2 rounded-t ${
              tab === tabItem.key ? "bg-white text-black font-bold" : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        {tab === "history" && (
          <>
            {/* 필터 + 정렬 UI */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-7 gap-2">
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                className="p-2 rounded bg-black/40 text-white border border-gray-600 placeholder-gray-400"
              />
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                className="p-2 rounded bg-black/40 text-white border border-gray-600 placeholder-gray-400"
              />
              <input
                type="text"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                className="p-2 rounded bg-black/40 text-white border border-gray-600"
                placeholder="플레이어 이름"
              />
              <input
                type="text"
                value={filters.champion}
                onChange={(e) => setFilters({ ...filters, champion: e.target.value })}
                className="p-2 rounded bg-black/40 text-white border border-gray-600"
                placeholder="챔피언 이름"
              />
              <input
                type="text"
                value={filters.matchId}
                onChange={(e) => setFilters({ ...filters, matchId: e.target.value })}
                className="p-2 rounded bg-black/40 text-white border border-gray-600"
                placeholder="매치 ID"
              />
              <button
                onClick={resetFilters}
                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
              >
                초기화
              </button>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                className="p-2 bg-black/40 text-white border border-gray-600 rounded"
              >
                <option value="newest">최신순</option>
                <option value="oldest">오래된순</option>
              </select>
            </div>

            {/* 매치 카드 목록 */}
            {visibleMatches.length === 0 ? (
              <p className="text-center text-gray-500">조건에 맞는 경기가 없습니다.</p>
            ) : (
              <>
                {visibleMatches.map((match: any) => (
                  <MatchCard key={match.uniqueId} match={match} />
                ))}
                <div ref={loadMoreRef} className="h-10" />
              </>
            )}
          </>
        )}

        {tab === "highlight" && (
          <div className="text-gray-400 text-center py-10">✨ 하이라이트 기능은 곧 업데이트됩니다!</div>
        )}

        {tab === "rollscup" && (
          <div className="text-gray-400 text-center py-10">🏆 롤스컵 정보는 곧 추가될 예정입니다!</div>
        )}
      </div>
    </div>
  );
}
