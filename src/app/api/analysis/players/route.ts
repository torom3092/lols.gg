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

  const playerDataList = await Promise.all(
    playerAliases.map((alias) => playersCollection.findOne({ alias }))
  );

  if (playerDataList.some((p) => !p)) {
    return NextResponse.json({ error: "플레이어 정보를 찾을 수 없습니다." }, { status: 400 });
  }

  const nicknameMap = new Map();
  playerDataList.forEach((data, i) => {
    nicknameMap.set(playerAliases[i], data!.nicknames);
  });

  const query: any = {};

  if (year && year !== "all") {
    const fromMonth = month && month !== "all" ? month.padStart(2, "0") : "01";
    const toMonth = month && month !== "all" ? String(+month + 1).padStart(2, "0") : "12";
    query.gameDate = {
      $gte: new Date(`${year}-${fromMonth}-01T00:00:00.000Z`),
      $lt: new Date(
        month && month !== "all"
          ? `${year}-${toMonth}-01T00:00:00.000Z`
          : `${+year + 1}-01-01T00:00:00.000Z`
      ),
    };
  }

  const matches = await matchesCollection.find(query).toArray();

  const filteredMatches = matches.filter((match) => {
    const participants = match.participants;
    const sameTeamPlayers = participants.filter((p: any) => {
      return playerAliases.some((alias) => nicknameMap.get(alias)?.includes(p.name));
    });
    if (sameTeamPlayers.length < playerAliases.length) return false;

    const teamId = sameTeamPlayers[0].teamId;
    return sameTeamPlayers.every((p: any) => p.teamId === teamId);
  });

  // 통계 결과 구조 초기화
  const stats = {
    total: filteredMatches.length,
    wins: 0,
    losses: 0,
    winrate: 0,
    laneCombos: [] as {
      laneCombo: string;
      count: number;
      wins: number;
      losses: number;
    }[],
    champCombos: [] as {
      key: string;
      names: string[];
      wins: number;
      losses: number;
    }[],
  };

  // 내부 누적용 객체
  const tempLaneCombos: Record<string, { count: number; wins: number; losses: number }> = {};
  const tempChampCombos: Record<
    string,
    { names: string[]; wins: number; losses: number }
  > = {};

  // 매치 순회
  filteredMatches.forEach((match) => {
    const players = match.participants;
    const teamPlayers = players.filter((p: any) =>
      playerAliases.some((alias) => nicknameMap.get(alias)?.includes(p.name))
    );

    const win = teamPlayers[0].win === "Win";
    if (win) stats.wins++;
    else stats.losses++;

    // 라인 조합
    const laneKey = teamPlayers
      .map((p: any) => p.position)
      .sort()
      .join(" + ");
    if (!tempLaneCombos[laneKey]) {
      tempLaneCombos[laneKey] = { count: 0, wins: 0, losses: 0 };
    }
    tempLaneCombos[laneKey].count++;
    if (win) tempLaneCombos[laneKey].wins++;
    else tempLaneCombos[laneKey].losses++;

    // 챔피언 조합
    const champNames = teamPlayers.map((p: any) => p.championName);
    const champKey = [...champNames].sort().join(" + ");
    if (!tempChampCombos[champKey]) {
      tempChampCombos[champKey] = {
        names: champNames,
        wins: 0,
        losses: 0,
      };
    }
    if (win) tempChampCombos[champKey].wins++;
    else tempChampCombos[champKey].losses++;
  });

  stats.winrate = stats.total > 0 ? +((stats.wins / stats.total) * 100).toFixed(1) : 0;

  // Top 3 laneCombos 추출
  stats.laneCombos = Object.entries(tempLaneCombos)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([key, value]) => ({
      laneCombo: key,
      count: value.count,
      wins: value.wins,
      losses: value.losses,
    }));

  // Top 3 champCombos 추출
  stats.champCombos = Object.entries(tempChampCombos)
    .sort((a, b) => (b[1].wins + b[1].losses) - (a[1].wins + a[1].losses))
    .slice(0, 3)
    .map(([key, value]) => ({
      key,
      names: value.names,
      wins: value.wins,
      losses: value.losses,
    }));

  return NextResponse.json(stats);
}
