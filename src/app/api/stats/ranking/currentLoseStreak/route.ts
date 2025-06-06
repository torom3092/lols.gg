import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const client = await connectToDB();
  const db = client.db("내전GG");

  const players = await db.collection("players").find().toArray();
  const nicknameToAlias: Record<string, string> = {};
  for (const p of players) {
    for (const nick of p.nicknames) {
      nicknameToAlias[nick] = p.alias;
    }
  }

  const matches = await db.collection("matches").find().toArray();
  const playerHistories: Record<string, { gameDate: Date; win: boolean }[]> = {};

  for (const match of matches) {
    const participants = match.participants || [];
    const date = new Date(match.gameDate);

    for (const p of participants) {
      const alias = nicknameToAlias[p.name];
      if (!alias) continue;
      if (!playerHistories[alias]) {
        playerHistories[alias] = [];
      }
      playerHistories[alias].push({ gameDate: date, win: p.win === "Win" });
    }
  }

  const results: { alias: string; streakCount: number; startDate: string; endDate: string | null }[] = [];

  for (const [alias, games] of Object.entries(playerHistories)) {
    const sortedGames = games.sort((a, b) => a.gameDate.getTime() - b.gameDate.getTime());

    let maxStreak = 0;
    let currentStreak = 0;
    let currentStart: Date | null = null;

    for (let i = sortedGames.length - 1; i >= 0; i--) {
      const g = sortedGames[i];
      if (!g.win) {
        if (currentStreak === 0) currentStart = g.gameDate;
        currentStreak++;
      } else {
        break;
      }
    }

    if (currentStreak >= 3 && currentStart) {
      results.push({
        alias,
        streakCount: currentStreak,
        startDate: currentStart.toISOString(),
        endDate: null,
      });
    }
  }

  results.sort((a, b) => b.streakCount - a.streakCount);

  return NextResponse.json(results.slice(0, 10));
}
