import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const rawMonth = req.nextUrl.searchParams.get("month");
  const rawPosition = req.nextUrl.searchParams.get("position");
  const rawYear = req.nextUrl.searchParams.get("year");

  const POSITION_MAP: Record<string, string> = {
    전체라인: "ALL",
    탑: "TOP",
    정글: "JUNGLE",
    미드: "MIDDLE",
    원딜: "BOTTOM",
    서폿: "UTILITY",
  };

  const positionFilter = POSITION_MAP[rawPosition || "전체라인"] || "ALL";
  const client = await connectToDB();
  const db = client.db("내전GG");

  const players = await db.collection("players").find().toArray();
  const nicknameToAlias: Record<string, string> = {};
  for (const p of players) {
    for (const nick of p.nicknames) {
      nicknameToAlias[nick] = p.alias;
    }
  }

  const aliasStats: Record<string, { totalDamage: number; totalDeaths: number; totalGames: number }> = {};
  const matches = await db.collection("matches").find().toArray();

  for (const match of matches) {
    const date = new Date(match.gameDate);
    if (rawYear && rawYear !== "전체" && date.getFullYear() !== Number(rawYear)) {
      continue;
    }

    if (rawMonth && rawMonth !== "전체" && date.getMonth() + 1 !== Number(rawMonth)) continue;

    for (const p of match.participants || []) {
      const alias = nicknameToAlias[p.name];
      if (!alias) continue;

      const damage =
        typeof p.totalDamageDealtToChampions === "string"
          ? parseInt(p.totalDamageDealtToChampions, 10)
          : p.totalDamageDealtToChampions;
      const deaths = typeof p.deaths === "string" ? parseInt(p.deaths, 10) : p.deaths;

      if (isNaN(damage) || isNaN(deaths)) continue;

      const normalizedPosition = (p.position || "").toUpperCase();
      if (positionFilter !== "ALL" && normalizedPosition !== positionFilter) continue;

      if (!aliasStats[alias]) {
        aliasStats[alias] = { totalDamage: 0, totalDeaths: 0, totalGames: 0 };
      }

      aliasStats[alias].totalDamage += damage;
      aliasStats[alias].totalDeaths += deaths;
      aliasStats[alias].totalGames++;
    }
  }

  const results = Object.entries(aliasStats)
    .filter(([_, stat]) => stat.totalGames >= 10 && stat.totalDeaths > 0)
    .map(([alias, stat]) => ({
      alias,
      damagePerDeath: Math.round(stat.totalDamage / stat.totalDeaths), // ❌ 소수점 없이 반올림
      games: stat.totalGames,
    }))
    .sort((a, b) => b.damagePerDeath - a.damagePerDeath)
    .slice(0, 5); // TOP 5

  return NextResponse.json(results);
}
