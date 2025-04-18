import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest, context: Promise<{ params: { alias: string } }>) {
  const { params } = await context;
  const alias = params.alias;
  const position = req.nextUrl.searchParams.get("position");

  if (!alias || alias === "null") {
    return NextResponse.json({ error: "잘못된 alias입니다." }, { status: 400 });
  }

  const client = await connectToDB();
  const db = client.db("내전GG");

  const allPlayers = await db.collection("players").find().toArray();
  const nicknameToAlias: Record<string, string> = {};
  for (const p of allPlayers) {
    for (const nick of p.nicknames) {
      nicknameToAlias[nick] = p.alias;
    }
  }

  const player = await db.collection("players").findOne({ alias });
  if (!player) {
    return NextResponse.json({ error: "해당 플레이어를 찾을 수 없습니다." }, { status: 404 });
  }

  const nicknames = player.nicknames;
  const matches = await db.collection("matches").find().toArray();

  const laneStats: Record<string, { wins: number; losses: number }> = {};
  const synergyMap: Record<string, { wins: number; total: number }> = {};
  const rivalMap: Record<string, { wins: number; total: number }> = {};

  for (const match of matches) {
    const date = new Date(match.gameDate);
    if (date.getFullYear() !== 2025) continue;

    const participants = match.participants || [];
    const self = participants.find((p: any) => nicknames.includes(p.name));
    if (!self) continue;

    const selfPosition = self.position;
    const teamId = self.teamId;
    const opponentTeamId = teamId === "blue" ? "red" : "blue";
    const didWin = self.win === "Win";

    // 1) 라인별 승률
    if (!laneStats[selfPosition]) {
      laneStats[selfPosition] = { wins: 0, losses: 0 };
    }
    didWin ? laneStats[selfPosition].wins++ : laneStats[selfPosition].losses++;

    const shouldCount = !position || position === "ALL" || self.position === position;
    if (!shouldCount) continue;

    for (const p of participants) {
      const pAlias = nicknameToAlias[p.name];
      if (!pAlias || pAlias === alias) continue;

      // 시너지: 같은 팀 (포지션은 상관 없음)
      if (p.teamId === teamId) {
        if (!synergyMap[pAlias]) synergyMap[pAlias] = { wins: 0, total: 0 };
        if (didWin) synergyMap[pAlias].wins++;
        synergyMap[pAlias].total++;
      }

      // 적대: 상대 팀, 같은 포지션
      if (p.teamId === opponentTeamId && p.position === self.position) {
        if (!rivalMap[pAlias]) rivalMap[pAlias] = { wins: 0, total: 0 };
        if (!didWin) rivalMap[pAlias].wins++;
        rivalMap[pAlias].total++;
      }
    }
  }

  const bestTeammates = Object.entries(synergyMap)
    .map(([alias, stat]) => ({
      alias,
      winrate: Math.round((stat.wins / stat.total) * 100),
      total: stat.total,
    }))
    .filter((tm) => tm.total >= 3 && tm.winrate >= 55)
    .sort((a, b) => b.winrate - a.winrate)
    .slice(0, 5);

  const hardestOpponents = Object.entries(rivalMap)
    .map(([alias, stat]) => {
      const myWinrate = 100 - Math.round((stat.wins / stat.total) * 100);
      return {
        alias,
        winrate: myWinrate,
        total: stat.total,
      };
    })
    .filter((op) => op.total >= 3 && op.winrate <= 45)
    .sort((a, b) => a.winrate - b.winrate)
    .slice(0, 5);

  const laneWinrates = Object.entries(laneStats).map(([pos, stat]) => {
    const total = stat.wins + stat.losses;
    const winrate = total > 0 ? Math.round((stat.wins / total) * 100) : 0;
    return { position: pos, wins: stat.wins, losses: stat.losses, winrate };
  });

  return NextResponse.json({
    laneWinrates,
    bestTeammates,
    hardestOpponents,
  });
}
