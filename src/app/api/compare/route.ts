import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const playerA = searchParams.get("playerA");
    const playerB = searchParams.get("playerB");
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (!playerA || !playerB) {
      return NextResponse.json({ error: "playerA and playerB are required" }, { status: 400 });
    }

    const client = await connectToDB();
    const db = client.db("내전GG");
    const matchesCollection = db.collection("matches");
    const playersCollection = db.collection("players");

    const playerAData = await playersCollection.findOne({ $or: [{ alias: playerA }, { nicknames: playerA }] });
    const playerBData = await playersCollection.findOne({ $or: [{ alias: playerB }, { nicknames: playerB }] });

    if (!playerAData || !playerBData) {
      return NextResponse.json({ error: "플레이어 정보를 찾을 수 없습니다." }, { status: 400 });
    }

    const playerANicknames = playerAData.nicknames || [];
    const playerBNicknames = playerBData.nicknames || [];

    const safeYear = year || "2025";
    const safeMonth = month || "all";

    let dateFilter: any = {};
    if (safeYear !== "all") {
      const start = new Date(`${safeYear}-${safeMonth !== "all" ? safeMonth.padStart(2, "0") : "01"}-01T00:00:00.000Z`);
      let end: Date;

      if (safeMonth !== "all") {
        const nextMonth = Number(safeMonth) + 1;
        end = new Date(`${safeYear}-${nextMonth.toString().padStart(2, "0")}-01T00:00:00.000Z`);
      } else {
        end = new Date(`${Number(safeYear) + 1}-01-01T00:00:00.000Z`);
      }

      dateFilter = { $gte: start, $lt: end };
    }

    const matches = await matchesCollection
      .find({
        $and: [
          { "participants.name": { $in: playerANicknames } },
          { "participants.name": { $in: playerBNicknames } },
          ...(safeYear !== "all" ? [{ gameDate: dateFilter }] : []),
        ],
      })
      .toArray();

    let totalWins = 0;
    let totalLosses = 0;
    const laneStats: Record<string, { wins: number; losses: number }> = {};
    const championStatsByLane: Record<string, any[]> = {};
    const matchList: any[] = [];

    for (const match of matches) {
      const players = match.participants;
      const playerADataInMatch = players.find((p: any) => playerANicknames.includes(p.name));
      const playerBDataInMatch = players.find((p: any) => playerBNicknames.includes(p.name));

      if (!playerADataInMatch || !playerBDataInMatch) continue;
      if (playerADataInMatch.teamId === playerBDataInMatch.teamId) continue;

      const result = playerADataInMatch.win === "Win" ? "win" : "lose";
      if (result === "win") totalWins++;
      else totalLosses++;

      matchList.push({
        matchId: match.matchId,
        date: match.gameDate,
        championA: playerADataInMatch.championName,
        championB: playerBDataInMatch.championName,
        lineA: playerADataInMatch.position,
        lineB: playerBDataInMatch.position,
        result,
      });

      if (
        playerADataInMatch.position &&
        playerBDataInMatch.position &&
        playerADataInMatch.position === playerBDataInMatch.position
      ) {
        const lane = playerADataInMatch.position;

        if (!laneStats[lane]) laneStats[lane] = { wins: 0, losses: 0 };
        if (result === "win") laneStats[lane].wins++;
        else laneStats[lane].losses++;

        if (!championStatsByLane[lane]) championStatsByLane[lane] = [];

        const existing = championStatsByLane[lane].find(
          (c: any) => c.championA === playerADataInMatch.championName && c.championB === playerBDataInMatch.championName
        );
        if (existing) {
          if (result === "win") existing.wins++;
          else existing.losses++;
        } else {
          championStatsByLane[lane].push({
            championA: playerADataInMatch.championName,
            championB: playerBDataInMatch.championName,
            wins: result === "win" ? 1 : 0,
            losses: result === "lose" ? 1 : 0,
          });
        }
      }
    }

    const laneStatsArray = Object.entries(laneStats).map(([lane, record]) => ({
      lane,
      wins: record.wins,
      losses: record.losses,
      winrate: record.wins + record.losses > 0 ? +((record.wins / (record.wins + record.losses)) * 100).toFixed(1) : 0,
    }));

    const championStatsFinal: any = {};
    for (const [lane, champs] of Object.entries(championStatsByLane)) {
      championStatsFinal[lane] = champs.map((c) => ({
        championA: c.championA,
        championB: c.championB,
        wins: c.wins,
        losses: c.losses,
        winrate: c.wins + c.losses > 0 ? +((c.wins / (c.wins + c.losses)) * 100).toFixed(1) : 0,
      }));
    }

    return NextResponse.json({
      summary: {
        wins: totalWins,
        losses: totalLosses,
        winrate: totalWins + totalLosses > 0 ? +((totalWins / (totalWins + totalLosses)) * 100).toFixed(1) : 0,
      },
      laneStats: laneStatsArray,
      championStatsByLane: championStatsFinal,
      matches: matchList,
    });
  } catch (error) {
    console.error("compare API error:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}
