"use client";

import { useState, useEffect } from "react";
import FilterControls from "./components/FilterControls";
import WinrateRanking from "./components/WinrateRankingSection";
import SynergyRanking from "./components/SynergyRankingSection";
import DamageRanking from "./components/DamageRankingSection";
import GoldRanking from "./components/GoldRankingSection";
import DamagePerDeathRanking from "./components/DamagePerDeathRankingSection";
import TotalAssistsRanking from "./components/TotalAssistsRankingSection";
import TotalGamesRanking from "./components/TotalGamesRankingSection";
import TotalKillsRanking from "./components/TotalKillsRankingSection";

const TABS = ["승률", "딜량", "골드", "시너지", "데스당 딜량", "총 킬", "총 어시스트", "총 게임수"];

interface SynergyRankingEntry {
  player1: string;
  player2: string;
  totalGames: number;
  winrate: number;
  synergyScore: number; // 실제 승률 - 예상 승률
}

export default function RankingPage() {
  const [selectedTab, setSelectedTab] = useState("승률");
  const [position, setPosition] = useState("전체라인");
  const [month, setMonth] = useState("전체");

  const [synergyData, setSynergyData] = useState<SynergyRankingEntry[]>([]);

  useEffect(() => {
    const fetchSynergyData = async () => {
      const res = await fetch(`/api/stats/ranking/synergy?position=${position}&month=${month}`);
      const json = await res.json();
      setSynergyData(json);
    };

    if (selectedTab === "시너지") {
      fetchSynergyData();
    }
  }, [selectedTab, position, month]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">랭킹 페이지</h1>

      {/* 탭 선택 */}
      <div className="flex gap-2 justify-center mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              selectedTab === tab ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 필터 컨트롤 */}
      <FilterControls
        selectedPosition={position}
        onPositionChange={setPosition}
        selectedMonth={month}
        onMonthChange={setMonth}
      />

      {/* 조건부 섹션 렌더링 */}
      <div className="mt-6">
        {selectedTab === "승률" && <WinrateRanking position={position} month={month} />}
        {selectedTab === "데스당 딜량" && <DamagePerDeathRanking position={position} month={month} />}
        {selectedTab === "시너지" && <SynergyRanking synergyRanking={synergyData} />}
        {selectedTab === "딜량" && <DamageRanking position={position} month={month} />}
        {selectedTab === "골드" && <GoldRanking position={position} month={month} />}
        {selectedTab === "총 어시스트" && <TotalAssistsRanking />}
        {selectedTab === "총 게임수" && <TotalGamesRanking />}
        {selectedTab === "총 킬" && <TotalKillsRanking />}
      </div>
    </div>
  );
}
