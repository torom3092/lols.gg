import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const client = await connectToDB();
    const db = client.db("내전GG");

    const players = await db.collection("players").find().toArray();
    const matches = await db.collection("matches").find().toArray();

    const searchParams = req.nextUrl.searchParams;
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    // nickname → alias
    const aliasMap = new Map<string, string>();
    for (const player of players) {
      for (const nick of player.nicknames) {
        aliasMap.set(nick, player.alias);
      }
    }

    // name → { alias, wins, games }
    const resultMap = new Map<string, { name: string; alias: string; wins: number; games: number }>();

    for (const match of matches) {
      const date = new Date(match.gameDate);
      if (year && date.getFullYear() !== Number(year)) continue;
      if (month && date.getMonth() + 1 !== Number(month)) continue;

      for (const p of match.participants) {
        const name = p.name ?? "";
        const alias = aliasMap.get(name) ?? ""; // 등록 안 된 경우 alias는 ""
        const key = name; // name 단위로 저장

        if (!resultMap.has(key)) {
          resultMap.set(key, { name, alias, wins: 0, games: 0 });
        }
        const stat = resultMap.get(key)!;
        stat.games += 1;
        if (p.win) stat.wins += 1;
      }
    }

    const result = Array.from(resultMap.values()).map(({ name, alias, wins, games }) => ({
      name,
      alias,
      wins,
      games,
      winrate: Math.round((wins / games) * 100),
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[WINRATE API ERROR]", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
