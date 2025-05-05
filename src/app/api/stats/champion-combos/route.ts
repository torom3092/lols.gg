import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

// 조합 만들기 함수
function getCombinations(arr: string[], size: number): string[][] {
  const results: string[][] = [];
  const backtrack = (path: string[], start: number) => {
    if (path.length === size) {
      results.push([...path].sort());
      return;
    }
    for (let i = start; i < arr.length; i++) {
      path.push(arr[i]);
      backtrack(path, i + 1);
      path.pop();
    }
  };
  backtrack([], 0);
  return results;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const size = parseInt(searchParams.get("size") || "2");
  const year = searchParams.get("year") || "all";

  if (![2, 3].includes(size)) {
    return NextResponse.json({ error: "size must be 2 or 3" }, { status: 400 });
  }

  const client = await connectToDB();
  const db = client.db("내전GG");
  const matchesCollection = db.collection("matches");

  // 날짜 필터
  const query: any = {};
  if (year !== "all") {
    query.gameDate = {
      $gte: new Date(`${year}-01-01T00:00:00.000Z`),
      $lt: new Date(`${+year + 1}-01-01T00:00:00.000Z`),
    };
  }

  const matches = await matchesCollection.find(query).toArray();

  const comboStats: Record<string, { names: string[]; wins: number; losses: number }> = {};

  for (const match of matches) {
    const blueTeam = match.participants.filter((p: any) => p.teamId === "blue");
    const redTeam = match.participants.filter((p: any) => p.teamId === "red");

    for (const team of [blueTeam, redTeam]) {
      const champNames = team.map((p: any) => p.championName);
      const win = team[0].win === "Win";

      const combos = getCombinations(champNames, size);

      for (const names of combos) {
        const key = names.join(" + ");
        if (!comboStats[key]) {
          comboStats[key] = {
            names,
            wins: 0,
            losses: 0,
          };
        }
        if (win) comboStats[key].wins++;
        else comboStats[key].losses++;
      }
    }
  }

  const combos = Object.values(comboStats)
    .filter((combo) => {
      const total = combo.wins + combo.losses;
      return size === 2 ? total >= 5 : total >= 2;
    })
    .map((combo) => {
      const total = combo.wins + combo.losses;
      return {
        ...combo,
        total,
        winrate: ((combo.wins / total) * 100).toFixed(1),
      };
    })
    .sort((a, b) => +b.winrate - +a.winrate)
    .slice(0, 30);

  return NextResponse.json(combos);
}
