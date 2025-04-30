import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const client = await connectToDB();
  const db = client.db("내전GG");
  const playersCollection = db.collection("players");
  const matchesCollection = db.collection("matches");

  const players = await playersCollection.find({}).toArray();
  const matches = await matchesCollection.find({}).toArray();

  // 닉네임별 등장 횟수 계산
  const nicknameCounts: Record<string, number> = {};

  for (const match of matches) {
    for (const p of match.participants) {
      const name = p.name;
      nicknameCounts[name] = (nicknameCounts[name] || 0) + 1;
    }
  }

  // alias별 총 플레이 횟수 계산
  const result = players.map((player) => {
    const totalGames = player.nicknames.reduce((sum: number, nick: string) => {
      return sum + (nicknameCounts[nick] || 0);
    }, 0);

    return {
      alias: player.alias,
      nicknames: player.nicknames,
      games: totalGames,
    };
  });

  return NextResponse.json(result);
}
