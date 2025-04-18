// /api/stats/players/[alias]/detail/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(
  req: NextRequest,
  context: Promise<{ params: { alias: string } }>
) {
  const { params } = await context;
  const alias = params.alias;
  const position = req.nextUrl.searchParams.get("position"); // TOP, JUNGLE, etc.

  if (!alias || alias === "null") {
    return NextResponse.json({ error: "잘못된 alias입니다." }, { status: 400 });
  }

  const client = await connectToDB();
  const db = client.db("내전GG");

  const player = await db.collection("players").findOne({ alias });
  if (!player) {
    return NextResponse.json({ error: "해당 플레이어를 찾을 수 없습니다." }, { status: 404 });
  }

  const nicknames = player.nicknames;
  const matches = await db.collection("matches").find().toArray();

  const laneStats: Record<string, { wins: number; losses: number }> = {};
  const synergyMap: Record<string, { wins: number; total: number }> = {};
  const rivalMap: Record<string, { wins: number; total: number }> = {};

  const positionPlayers: Record<string, any> = {}; // 포지션별 플레이어 스탯 (평균 비교용)

  for (const match of matches) {
    const date = new Date(match.gameDate);
    if (date.getFullYear() !== 2025) continue;

    const participants = match.participants || [];
    const self = participants.find((p: any) => nicknames.includes(p.name));
    if (!self) continue;

    // 1) 라인별 승률
    const pos = self.position;
    if (!laneStats[pos]) laneStats[pos] = { wins: 0, losses: 0 };
    self.win === "Win" ? laneStats[pos].wins++ : laneStats[pos].losses++;

    // 2) 시너지/상대 통계 (포지션 필터가 있을 때만)
    if (position && self.position !== position) continue;

    const teamId = self.teamId;
    const opponentTeamId = teamId === "blue" ? "red" : "blue";
    const didWin = self.win === "Win";

    // 통계 집계용
    const key = `${match.matchId}-${self.name}`;
    if (!positionPlayers[self.name]) {
      positionPlayers[self.name] = {
        games: 0,
        vision: 0,
        gold: 0,
        damage: 0,
      };
    }
    positionPlayers[self.name].games++;
    positionPlayers[self.name].vision += Number(self.visionScore || 0);
    positionPlayers[self.name].gold += Number(self.goldEarned || 0);
    positionPlayers[self.name].damage += Number(self.totalDamageDealtToChampions || 0);

    for (const p of participants) {
      if (nicknames.includes(p.name) || p.name === self.name) continue;

      if (p.teamId === teamId && p.position === self.position) {
        if (!synergyMap[p.name]) synergyMap[p.name] = { wins: 0, total: 0 };
        if (didWin) synergyMap[p.name].wins++;
        synergyMap[p.name].total++;
      }

      if (p.teamId === opponentTeamId && p.position === self.position) {
        if (!rivalMap[p.name]) rivalMap[p.name] = { wins: 0, total: 0 };
        if (!didWin) rivalMap[p.name].wins++;
        rivalMap[p.name].total++;
      }
    }
  }

  // 3) 시너지 좋은 플레이어
  const bestTeammate = Object.entries(synergyMap)
    .filter(([, stat]) => stat.total >= 3)
    .map(([name, stat]) => ({
      name,
      winrate: Math.round((stat.wins / stat.total) * 100),
      total: stat.total,
    }))
    .sort((a, b) => b.winrate - a.winrate)[0] || null;

  // 4) 어려운 상대
  const hardestOpponent = Object.entries(rivalMap)
    .filter(([, stat]) => stat.total >= 3)
    .map(([name, stat]) => ({
      name,
      loseRate: Math.round((stat.wins / stat.total) * 100),
      total: stat.total,
    }))
    .sort((a, b) => b.loseRate - a.loseRate)[0] || null;

  // 5) 라인별 승률 정리
  const laneWinrates = Object.entries(laneStats).map(([pos, stat]) => {
    const total = stat.wins + stat.losses;
    const winrate = total > 0 ? Math.round((stat.wins / total) * 100) : 0;
    return { position: pos, wins: stat.wins, losses: stat.losses, winrate };
  });

  // 6) 해당 포지션 내 평균 지표 순위 계산
  let averageRanking = null;
  if (position) {
    const playerList = Object.entries(positionPlayers)
      .map(([name, stat]: any) => ({
        name,
        vision: stat.vision / stat.games,
        gold: stat.gold / stat.games,
        damage: stat.damage / stat.games,
      }));

    const sortedVision = [...playerList].sort((a, b) => b.vision - a.vision);
    const sortedGold = [...playerList].sort((a, b) => b.gold - a.gold);
    const sortedDamage = [...playerList].sort((a, b) => b.damage - a.damage);

    const self = playerList.find((p) => nicknames.includes(p.name));
    if (self) {
      averageRanking = {
        visionRank: sortedVision.findIndex((p) => p.name === self.name) + 1,
        goldRank: sortedGold.findIndex((p) => p.name === self.name) + 1,
        damageRank: sortedDamage.findIndex((p) => p.name === self.name) + 1,
        totalPlayers: playerList.length,
      };

      console.log(averageRanking);
    }
  }

  return NextResponse.json({
    laneWinrates,
    bestTeammate,
    hardestOpponent,
    averageRanking,
  });
}
