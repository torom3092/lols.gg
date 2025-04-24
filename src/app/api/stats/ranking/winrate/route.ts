import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const rawMonth = req.nextUrl.searchParams.get("month"); // e.g. "4"
  const positionFilter = req.nextUrl.searchParams.get("position"); // e.g. "탑"

  const POSITION_MAP: Record<string, string> = {
    전체라인: "ALL",
    탑: "TOP",
    정글: "JUNGLE",
    미드: "MIDDLE",
    원딜: "BOTTOM",
    서폿: "UTILITY",
  };

  const mappedPosition = POSITION_MAP[positionFilter || "전체라인"] || "ALL";

  const client = await connectToDB();
  const db = client.db("내전GG");

  const players = await db.collection("players").find().toArray();
  const nicknameToAlias: Record<string, string> = {};
  for (const p of players) {
    for (const nick of p.nicknames) {
      nicknameToAlias[nick] = p.alias;
    }
  }

  const aliasStats: Record<string, { wins: number; total: number }> = {};
  const matches = await db.collection("matches").find().toArray();

  for (const match of matches) {
    const date = new Date(match.gameDate);
    if (date.getFullYear() !== 2025) continue;

    if (rawMonth && rawMonth !== "전체" && date.getMonth() + 1 !== Number(rawMonth)) {
      continue;
    }

    for (const p of match.participants || []) {
      const alias = nicknameToAlias[p.name];
      if (!alias) continue;

      if (mappedPosition !== "ALL" && p.position !== mappedPosition) {
        continue; // 포지션이 일치하지 않으면 스킵
      }

      if (!aliasStats[alias]) {
        aliasStats[alias] = { wins: 0, total: 0 };
      }

      aliasStats[alias].total++;
      if (p.win === "Win") aliasStats[alias].wins++;
    }
  }

  const results = Object.entries(aliasStats)
    .filter(([_, stat]) => stat.total >= 15)
    .map(([alias, stat]) => ({
      alias,
      totalGames: stat.total,
      wins: stat.wins,
      winrate: Math.round((stat.wins / stat.total) * 100),
    }))
    .sort((a, b) => b.winrate - a.winrate);

  return NextResponse.json(results);
}
