// ✅ /api/stats/champions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const client = await connectToDB();
  const db = client.db("내전GG");
  const matches = await db.collection("matches").find().toArray();

  const searchParams = req.nextUrl.searchParams;
  const year = searchParams.get("year");
  const position = searchParams.get("position"); // "TOP", "JUNGLE", ...

  const resultMap = new Map<string, { championName: string; wins: number; losses: number }>();

  for (const match of matches) {
    const date = new Date(match.gameDate);
    if (year && date.getFullYear() !== Number(year)) continue;

    for (const p of match.participants) {
      if (position && position !== "전체" && p.position !== position) continue;

      const name = p.championName;
      if (!resultMap.has(name)) {
        resultMap.set(name, { championName: name, wins: 0, losses: 0 });
      }
      const stat = resultMap.get(name)!;
      p.win === "Win" ? stat.wins++ : stat.losses++;
    }
  }

  const result = Array.from(resultMap.values())
    .map((stat) => ({
      ...stat,
      games: stat.wins + stat.losses,
      winrate: stat.wins + stat.losses > 0 ? Math.round((stat.wins / (stat.wins + stat.losses)) * 100) : 0,
    }))
    .sort((a, b) => b.games - a.games); // 판수 기준 내림차순 정렬

  return NextResponse.json(result);
}
