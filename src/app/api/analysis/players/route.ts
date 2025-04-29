import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const playerListRaw = searchParams.get("players");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  if (!playerListRaw) {
    return NextResponse.json({ error: "players are required" }, { status: 400 });
  }

  const playerAliases = playerListRaw.split(",").filter(Boolean);
  if (playerAliases.length < 2 || playerAliases.length > 3) {
    return NextResponse.json({ error: "2~3 players supported" }, { status: 400 });
  }

  const client = await connectToDB();
  const db = client.db("내전GG");
  const matchesCollection = db.collection("matches");
  const playersCollection = db.collection("players");

  const playerDataList = await Promise.all(playerAliases.map((alias) => playersCollection.findOne({ alias })));

  if (playerDataList.some((p) => !p)) {
    return NextResponse.json({ error: "플레이어 정보를 찾을 수 없습니다." }, { status: 400 });
  }

  const nicknameMap = new Map();
  playerDataList.forEach((data, i) => {
    nicknameMap.set(playerAliases[i], data!.nicknames);
  });

  const dateFilter: any = {};
  if (year && year !== "all") {
    const fromMonth = month && month !== "all" ? month.padStart(2, "0") : "01";
    const toMonth = month && month !== "all" ? String(+month + 1).padStart(2, "0") : "12";
    dateFilter.$gte = new Date(`${year}-${fromMonth}-01T00:00:00.000Z`);
    dateFilter.$lt = new Date(
      month && month !== "all" ? `${year}-${toMonth}-01T00:00:00.000Z` : `${+year + 1}-01-01T00:00:00.000Z`
    );
  }

  const matches = await matchesCollection.find({ ...(year !== "all" && { gameDate: dateFilter }) }).toArray();

  const filteredMatches = matches.filter((match) => {
    const participants = match.participants;
    const sameTeamPlayers = participants.filter((p: any) => {
      return playerAliases.some((alias) => nicknameMap.get(alias)?.includes(p.name));
    });
    if (sameTeamPlayers.length < playerAliases.length) return false;

    const teamId = sameTeamPlayers[0].teamId;
    return sameTeamPlayers.every((p: any) => p.teamId === teamId);
  });

  const stats = {
    total: filteredMatches.length,
    wins: 0,
    losses: 0,
    winrate: 0,
    laneCombos: {} as Record<string, { count: number; wins: number; losses: number }>,
    champCombos: [] as any[],
  };

  filteredMatches.forEach((match) => {
    const players = match.participants;
    const teamPlayers = players.filter((p: any) =>
      playerAliases.some((alias) => nicknameMap.get(alias)?.includes(p.name))
    );

    const win = teamPlayers[0].win === "Win";
    if (win) stats.wins++;
    else stats.losses++;

    const laneKey = teamPlayers
      .map((p: any) => p.positionKR)
      .sort()
      .join(" + ");
    if (!stats.laneCombos[laneKey]) {
      stats.laneCombos[laneKey] = { count: 0, wins: 0, losses: 0 };
    }
    stats.laneCombos[laneKey].count++;
    if (win) stats.laneCombos[laneKey].wins++;
    else stats.laneCombos[laneKey].losses++;

    const champKey = teamPlayers
      .map((p: any) => p.championName)
      .sort()
      .join(" + ");
    const existing = stats.champCombos.find((c) => c.key === champKey);
    if (existing) {
      if (win) existing.wins++;
      else existing.losses++;
    } else {
      stats.champCombos.push({
        key: champKey,
        names: teamPlayers.map((p: any) => p.championName),
        wins: win ? 1 : 0,
        losses: win ? 0 : 1,
      });
    }
  });

  stats.winrate = stats.total > 0 ? +((stats.wins / stats.total) * 100).toFixed(1) : 0;

  return NextResponse.json(stats);
}
