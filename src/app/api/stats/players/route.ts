import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const client = await connectToDB();
  const db = client.db("내전GG");

  const aliases = await db.collection("players").find().toArray();
  const matches = await db.collection("matches").find().toArray();

  const results = [];

  for (const alias of aliases) {
    const allNames = alias.nicknames; // ["토로", "Toro"]

    // 포지션별 판수, 승수 누적
    const positionStats: Record<string, { wins: number; losses: number }> = {};

    for (const match of matches) {
      const date = new Date(match.gameDate);
      if (date.getFullYear() !== 2025) continue;

      for (const p of match.participants || []) {
        if (!allNames.includes(p.name)) continue;

        const pos = p.position;
        if (!pos) continue;

        if (!positionStats[pos]) {
          positionStats[pos] = { wins: 0, losses: 0 };
        }

        if (p.win === "Win") {
          positionStats[pos].wins++;
        } else {
          positionStats[pos].losses++;
        }
      }
    }

    // 포지션 중 가장 많이 한 포지션 추출
    const mostPlayedPosition = Object.entries(positionStats).sort(
      (a, b) => b[1].wins + b[1].losses - (a[1].wins + a[1].losses)
    )[0];

    if (!mostPlayedPosition) continue;

    const [position, stat] = mostPlayedPosition;
    const total = stat.wins + stat.losses;
    const winrate = total > 0 ? Math.round((stat.wins / total) * 100) : 0;

    results.push({
      alias: alias.alias,
      position,
      winrate,
      games: total,
      wins: stat.wins,
      losses: stat.losses,
    });
  }

  // 판수 많은 순 정렬
  results.sort((a, b) => b.games - a.games);

  return NextResponse.json(results);
}
