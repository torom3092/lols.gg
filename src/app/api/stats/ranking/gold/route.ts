import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const rawMonth = req.nextUrl.searchParams.get("month"); // "1", "2", ..., "12", or "전체"
  const rawPosition = req.nextUrl.searchParams.get("position"); // "탑", "정글", etc.

  const POSITION_MAP: Record<string, string> = {
    전체라인: "ALL",
    탑: "TOP",
    정글: "JUNGLE",
    미드: "MIDDLE",
    원딜: "BOTTOM",
    서폿: "UTILITY",
  };

  const positionFilter = POSITION_MAP[rawPosition || "전체라인"] || "ALL";
  const monthFilter = rawMonth || "전체";

  const client = await connectToDB();
  const db = client.db("내전GG");

  const players = await db.collection("players").find().toArray();
  const nicknameToAlias: Record<string, string> = {};
  for (const p of players) {
    for (const nick of p.nicknames) {
      nicknameToAlias[nick] = p.alias;
    }
  }

  const aliasStats: Record<string, { totalGold: number; totalGames: number }> = {};
  const matches = await db.collection("matches").find().toArray();

  for (const match of matches) {
    const date = new Date(match.gameDate);
    if (date.getFullYear() !== 2025) continue;

    if (rawMonth && rawMonth !== "전체" && date.getMonth() + 1 !== Number(rawMonth)) {
      continue;
    }

    for (const p of match.participants || []) {
      const alias = nicknameToAlias[p.name];
      const goldRaw = p.goldEarned;
      const position = (p.position || "").toUpperCase();

      if (!alias) continue;

      const gold = typeof goldRaw === "string" ? parseInt(goldRaw, 10) : goldRaw;
      if (isNaN(gold)) {
        continue;
      }

      if (positionFilter !== "ALL" && position !== positionFilter) {
        continue;
      }

      if (!aliasStats[alias]) {
        aliasStats[alias] = { totalGold: 0, totalGames: 0 };
      }

      aliasStats[alias].totalGold += gold;
      aliasStats[alias].totalGames++;
    }
  }

  const results = Object.entries(aliasStats)
    .filter(([_, stat]) => stat.totalGames >= 10)
    .map(([alias, stat]) => ({
      alias,
      avgGold: Math.round(stat.totalGold / stat.totalGames),
      games: stat.totalGames,
    }))
    .sort((a, b) => b.avgGold - a.avgGold)
    .slice(0, 50); // TOP 50

  return NextResponse.json(results);
}
