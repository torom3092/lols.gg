import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const rawMonth = req.nextUrl.searchParams.get("month");
  const rawYear = req.nextUrl.searchParams.get("year");

  const POSITION_MAP: Record<string, string> = {
    전체라인: "ALL",
    탑: "TOP",
    정글: "JUNGLE",
    미드: "MIDDLE",
    원딜: "BOTTOM",
    서폿: "UTILITY",
  };

  const raw = req.nextUrl.searchParams.get("position") || "전체라인";
  const positionFilter = POSITION_MAP[raw] || "ALL";
  const client = await connectToDB();
  const db = client.db("내전GG");

  const players = await db.collection("players").find().toArray();
  const nicknameToAlias: Record<string, string> = {};
  for (const p of players) {
    for (const nick of p.nicknames) {
      nicknameToAlias[nick] = p.alias;
    }
  }

  const aliasStats: Record<string, { totalDamage: number; totalGames: number }> = {};
  const matches = await db.collection("matches").find().toArray();

  console.log("게임 수:", matches.length);
  console.log("positionFilter: ", positionFilter);
  console.log("monthFilter: ", rawMonth);

  for (const match of matches) {
    const date = new Date(match.gameDate);
    if (rawYear && rawYear !== "전체" && date.getFullYear() !== Number(rawYear)) {
      continue;
    }
    if (rawMonth && rawMonth !== "전체" && date.getMonth() + 1 !== Number(rawMonth)) {
      continue;
    }

    for (const p of match.participants || []) {
      const alias = nicknameToAlias[p.name];
      if (!alias || !p.totalDamageDealtToChampions) continue;

      const rawDamage = p.totalDamageDealtToChampions;
      const damage = typeof rawDamage === "number" ? rawDamage : Number(rawDamage);
      if (isNaN(damage)) {
        console.log("damage 변환 실패:", p.name, rawDamage);
        continue;
      }

      const normalizedPosition = (p.position || "").toUpperCase();
      if (positionFilter !== "ALL" && normalizedPosition !== positionFilter) continue;

      if (!aliasStats[alias]) {
        aliasStats[alias] = { totalDamage: 0, totalGames: 0 };
      }

      aliasStats[alias].totalDamage += damage;
      aliasStats[alias].totalGames++;
    }
  }

  const results = Object.entries(aliasStats)
    .filter(([_, stat]) => stat.totalGames >= 10)
    .map(([alias, stat]) => ({
      alias,
      avgDamage: Math.round(stat.totalDamage / stat.totalGames),
      games: stat.totalGames,
    }))
    .sort((a, b) => b.avgDamage - a.avgDamage)
    .slice(0, 50);

  return NextResponse.json(results);
}
