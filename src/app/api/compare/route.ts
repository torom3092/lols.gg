import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
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

  const playerAData = await playersCollection.findOne({
    $or: [{ alias: playerA }, { nicknames: playerA }],
  });
  const playerBData = await playersCollection.findOne({
    $or: [{ alias: playerB }, { nicknames: playerB }],
  });

  if (!playerAData || !playerBData) {
    return NextResponse.json({ error: "플레이어 정보를 찾을 수 없습니다." }, { status: 400 });
  }

  const playerANicknames = playerAData?.nicknames || [];
  const playerBNicknames = playerBData?.nicknames || [];

  // 날짜 필터 처리
  const dateFilter: any = {};
  if (year && year !== "all") {
    let start: Date, end: Date;

    if (month && month !== "all") {
      const paddedMonth = month.toString().padStart(2, "0");
      start = new Date(`${year}-${paddedMonth}-01T00:00:00.000Z`);
      const nextMonth = Number(month) + 1;
      if (nextMonth <= 12) {
        const nextMonthStr = nextMonth.toString().padStart(2, "0");
        end = new Date(`${year}-${nextMonthStr}-01T00:00:00.000Z`);
      } else {
        end = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);
      }
    } else {
      start = new Date(`${year}-01-01T00:00:00.000Z`);
      end = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);
    }

    dateFilter.$gte = start;
    dateFilter.$lt = end;
  }

  const matches = await matchesCollection
    .find({
      $and: [
        { "participants.name": { $in: playerANicknames } },
        { "participants.name": { $in: playerBNicknames } },
        ...(year && year !== "all" ? [{ gameDate: dateFilter }] : []),
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
    if (playerADataInMatch.teamId === playerBDataInMatch.teamId) continue; // 같은 팀 제외

    const result = playerADataInMatch.win === "Win" ? "win" : "lose";
    if (result === "win") totalWins++;
    else totalLosses++;

    matchList.push({
      matchId: match.matchId,
      date: match.gameDate,
      championA: playerADataInMatch.championNameKR || playerADataInMatch.championName || "",
      championB: playerBDataInMatch.championNameKR || playerBDataInMatch.championName || "",
      lineA: playerADataInMatch.position || "",
      lineB: playerBDataInMatch.position || "",
      result,
    });

    // 맞라인 (같은 라인일 때만)
    if (playerADataInMatch.position && playerBDataInMatch.position && playerADataInMatch.position === playerBDataInMatch.position) {
      const lane = playerADataInMatch.position;

      if (!laneStats[lane]) {
        laneStats[lane] = { wins: 0, losses: 0 };
      }
      if (result === "win") laneStats[lane].wins++;
      else laneStats[lane].losses++;

      // 챔피언별
      if (!championStatsByLane[lane]) {
        championStatsByLane[lane] = [];
      }
      const existing = championStatsByLane[lane].find(
        (c) => c.championA === (playerADataInMatch.championNameKR || playerADataInMatch.championName) &&
               c.championB === (playerBDataInMatch.championNameKR || playerBDataInMatch.championName)
      );
      if (existing) {
        if (result === "win") existing.wins++;
        else existing.losses++;
      } else {
        championStatsByLane[lane].push({
          championA: playerADataInMatch.championNameKR || playerADataInMatch.championName,
          championB: playerBDataInMatch.championNameKR || playerBDataInMatch.championName,
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
}
