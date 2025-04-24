import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

const POSITION_MAP: Record<string, string> = {
  전체라인: "ALL",
  탑: "TOP",
  정글: "JUNGLE",
  미드: "MIDDLE",
  원딜: "BOTTOM",
  서폿: "UTILITY",
};

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("position") || "전체라인";
  const rawMonth = req.nextUrl.searchParams.get("month");
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

  const matches = await db.collection("matches").find().toArray();

  const individualStats: Record<string, { wins: number; total: number }> = {};
  const synergyStats: Record<string, { pair: [string, string]; wins: number; total: number }> = {};

  for (const match of matches) {
    const date = new Date(match.gameDate);
    if (date.getFullYear() !== 2025) continue;
    if (rawMonth && rawMonth !== "전체" && date.getMonth() + 1 !== Number(rawMonth)) continue;

    const participants = match.participants || [];

    for (const p of participants) {
      const alias = nicknameToAlias[p.name];
      if (!alias) continue;

      if (!individualStats[alias]) {
        individualStats[alias] = { wins: 0, total: 0 };
      }

      individualStats[alias].total++;
      if (p.win === "Win") individualStats[alias].wins++;
    }

    const teams = {
      blue: participants.filter((p: any) => p.teamId === "blue"),
      red: participants.filter((p: any) => p.teamId === "red"),
    };

    for (const team of [teams.blue, teams.red]) {
      const aliasWithPosition = team
        .map((p: any) => ({
          alias: nicknameToAlias[p.name],
          position: p.position,
          win: p.win,
        }))
        .filter((p: any) => p.alias); // 유효한 alias만

      // 라인 필터 조건 적용
      // ✅ shouldInclude 함수 내부에서 이렇게만 사용
      const shouldInclude = (a: string, b: string): boolean => {
        if (positionFilter === "ALL") return true;

        return aliasWithPosition.some((p: any) => (p.alias === a || p.alias === b) && p.position === positionFilter);
      };

      for (let i = 0; i < aliasWithPosition.length; i++) {
        for (let j = i + 1; j < aliasWithPosition.length; j++) {
          const [a, b] = [aliasWithPosition[i].alias, aliasWithPosition[j].alias].sort();
          const key = `${a}__${b}`;

          if (!shouldInclude(a, b)) continue;

          if (!synergyStats[key]) {
            synergyStats[key] = { pair: [a, b], wins: 0, total: 0 };
          }

          const win = aliasWithPosition.find((p: any) => p.alias === a)?.win;
          if (win === "Win") synergyStats[key].wins++;
          synergyStats[key].total++;
        }
      }
    }
  }

  const results = Object.values(synergyStats)
    .filter((pair) => pair.total >= 10)
    .map((pair) => {
      const [a, b] = pair.pair;
      const expected =
        ((individualStats[a]?.wins || 0) / (individualStats[a]?.total || 1) +
          (individualStats[b]?.wins || 0) / (individualStats[b]?.total || 1)) /
        2;

      const actual = pair.wins / pair.total;
      const synergyScore = Math.round((actual - expected) * 100);

      return {
        player1: a,
        player2: b,
        totalGames: pair.total,
        winrate: Math.round(actual * 100),
        synergyScore,
      };
    })
    .sort((a, b) => b.synergyScore - a.synergyScore)
    .slice(0, 3);

  return NextResponse.json(results);
}
