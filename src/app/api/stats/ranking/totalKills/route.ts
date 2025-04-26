// /api/stats/ranking/totalKills/route.ts

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET() {
  const client = await connectToDB();
  const db = client.db("내전GG");

  const players = await db.collection("players").find().toArray();
  const nicknameToAlias: Record<string, string> = {};
  for (const p of players) {
    for (const nick of p.nicknames) {
      nicknameToAlias[nick] = p.alias;
    }
  }

  const aliasStats: Record<string, { kills: number; games: number }> = {};
  const matches = await db.collection("matches").find().toArray();

  for (const match of matches) {
    const date = new Date(match.gameDate);

    for (const p of match.participants || []) {
      const alias = nicknameToAlias[p.name];
      if (!alias) continue;

      const kills = typeof p.kills === "string" ? parseInt(p.kills, 10) : p.kills;
      if (isNaN(kills)) continue;

      if (!aliasStats[alias]) {
        aliasStats[alias] = { kills: 0, games: 0 };
      }

      aliasStats[alias].kills += kills;
      aliasStats[alias].games++;
    }
  }

  const results = Object.entries(aliasStats)
    .filter(([_, stat]) => stat.games >= 10) // 최소 10판
    .map(([alias, stat]) => ({
      alias,
      totalKills: stat.kills,
      totalGames: stat.games,
    }))
    .sort((a, b) => b.totalKills - a.totalKills)
    .slice(0, 10);

  return NextResponse.json(results);
}
