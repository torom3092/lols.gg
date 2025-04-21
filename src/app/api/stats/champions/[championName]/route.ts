import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import CHAMPION_KR_MAP from "@/lib/championNameKo";

export async function GET(req: NextRequest, { params }: any) {
  const championName = params.championName;

  if (!championName) {
    return NextResponse.json({ error: "챔피언 이름이 없습니다." }, { status: 400 });
  }

  const searchParams = req.nextUrl.searchParams;
  const year = searchParams.get("year");
  const position = searchParams.get("position");

  const client = await connectToDB();
  const db = client.db("내전GG");

  // ✅ alias 매핑 불러오기
  const aliasDocs = await db.collection("players").find().toArray();
  const nicknameToAlias: Record<string, string> = {};
  for (const doc of aliasDocs) {
    for (const nick of doc.nicknames) {
      nicknameToAlias[nick] = doc.alias;
    }
  }

  const matches = await db.collection("matches").find().toArray();
  const resultMap = new Map<string, { name: string; wins: number; losses: number }>();

  for (const match of matches) {
    if (!match?.gameDate) continue;
    const date = new Date(match.gameDate);
    if (year && date.getFullYear() !== Number(year)) continue;

    for (const p of match.participants || []) {
      if (!p?.championName || !p?.name) continue;

      if (p.championName.toLowerCase() !== championName.toLowerCase()) continue;
      if (position && position !== "전체" && p.position !== position) continue;

      const alias = nicknameToAlias[p.name] || p.name;
      if (!resultMap.has(alias)) {
        resultMap.set(alias, { name: alias, wins: 0, losses: 0 });
      }

      const stat = resultMap.get(alias)!;
      p.win === "Win" ? stat.wins++ : stat.losses++;
    }
  }

  const result = Array.from(resultMap.values())
    .map((entry) => ({
      ...entry,
      games: entry.wins + entry.losses,
      winrate: entry.wins + entry.losses > 0 ? Math.round((entry.wins / (entry.wins + entry.losses)) * 100) : 0,
    }))
    .sort((a, b) => b.games - a.games);

  return NextResponse.json(result);
}
