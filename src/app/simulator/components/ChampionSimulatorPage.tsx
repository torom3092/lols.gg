"use client";

import { useEffect, useState } from "react";
import { ComboBox } from "@/components/ui/combobox";
import championNameKo from "@/lib/championNameKo";

export default function ChampionSimulatorPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [championA, setChampionA] = useState<string>("");
  const [championB, setChampionB] = useState<string>("");
  const [searchTermA, setSearchTermA] = useState("");
  const [searchTermB, setSearchTermB] = useState("");
  const [result, setResult] = useState<{ totalGames: number; wins: number; winrate: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchMatches() {
      const res = await fetch("/api/simulator/matches");
      const data = await res.json();
      setMatches(data);
    }
    fetchMatches();
  }, []);

  const championOptions = Object.entries(championNameKo).map(([eng, kor]) => ({
    value: eng,
    label: kor,
  }));

  const filteredChampionOptionsA = championOptions.filter((option) => option.label.includes(searchTermA));
  const filteredChampionOptionsB = championOptions.filter((option) => option.label.includes(searchTermB));

  async function handleCompareChampions() {
    if (!championA || !championB || championA === championB) {
      alert("서로 다른 두 챔피언을 선택해주세요.");
      return;
    }

    setLoading(true);

    const filteredMatches = matches.filter((match) => {
      const names = match.participants.map((p: any) => p.championName);
      return names.includes(championA) && names.includes(championB);
    });

    const totalGames = filteredMatches.length;

    const wins = filteredMatches.filter((match) => {
      const teamIdA = match.participants.find((p: any) => p.championName === championA)?.teamId;
      const teamIdB = match.participants.find((p: any) => p.championName === championB)?.teamId;
      const won = match.participants.find((p: any) => p.championName === championA)?.win;
      return teamIdA === teamIdB && won === "Win";
    }).length;

    const winrate = totalGames > 0 ? +((wins / totalGames) * 100).toFixed(1) : 0;

    setResult({ totalGames, wins, winrate });
    setLoading(false);
  }

  return (
    <div className="bg-neutral-900/80 p-10 rounded-xl shadow-xl backdrop-blur-md max-w-4xl mx-auto mt-12">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-extrabold text-center mb-10">챔피언 조합 시뮬레이터</h1>

        {/* ✅ 검색창 (한 줄) */}
        <div className="grid grid-cols-3 gap-4 mb-6 place-items-center">
          <input
            type="text"
            value={searchTermA}
            onChange={(e) => setSearchTermA(e.target.value)}
            placeholder="챔피언 A 검색"
            className="w-full px-4 py-2 rounded-md border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-400"
          />
          <input
            type="text"
            value={searchTermB}
            onChange={(e) => setSearchTermB(e.target.value)}
            placeholder="챔피언 B 검색"
            className="w-full px-4 py-2 rounded-md border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-400"
          />
          <div /> {/* 칼럼 정렬 유지용 빈칸 */}
        </div>

        {/* ✅ 드롭다운 + 버튼 (한 줄) */}
        <div className="grid grid-cols-3 gap-4 mb-8 place-items-center">
          <ComboBox
            options={filteredChampionOptionsA}
            value={championA}
            onChange={(value) => setChampionA(value ?? "")}
            placeholder="챔피언 A 선택"
          />
          <ComboBox
            options={filteredChampionOptionsB}
            value={championB}
            onChange={(value) => setChampionB(value ?? "")}
            placeholder="챔피언 B 선택"
          />
          <button
            onClick={handleCompareChampions}
            className="w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white font-semibold transition-all"
          >
            확인하기
          </button>
        </div>

        {/* 결과 */}
        {loading && <div className="text-center font-semibold">로딩중...</div>}

        {result && (
          <div className="mt-8 p-8 bg-neutral-800 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {championNameKo[championA]} & {championNameKo[championB]} 조합 결과
            </h2>
            <div className="text-lg text-center space-y-2">
              <div>총 경기 수: {result.totalGames}회</div>
              <div>
                함께 승리한 경기 수: <span className="text-blue-400">{result.wins}승</span>
              </div>
              <div className="font-semibold">함께한 승률: {result.winrate}%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
