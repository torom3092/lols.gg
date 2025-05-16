// lib/winrate.ts
import { connectToDB } from "@/lib/mongodb";
import { PLAYERS } from "@/lib/players";

export async function getAllPlayerStats() {
  const client = await connectToDB();
  const db = client.db("내전GG");

  const playerStats: Record<string, any> = {};

  // players 컬렉션 기반 alias → nicknames map 만들기
  const aliasDocs = await db.collection("players").find().toArray();
  const aliasToNicknames: Record<string, string[]> = {};
  for (const doc of aliasDocs) {
    aliasToNicknames[doc.alias] = doc.nicknames;
  }

  for (const player of PLAYERS) {
    const alias = player.name; // PLAYERS는 alias 기준으로 구성됨
    const nicknameList = aliasToNicknames[alias] ?? [alias];

    const matches = await db
      .collection("matches")
      .find({
        participants: { $elemMatch: { name: { $in: nicknameList } } },
      })
      .toArray();

    const totalGames = matches.length;
    const winGames = matches.filter((match) =>
      match.participants.find((p: any) => {
        const winField = typeof p.win === "string" ? p.win.toLowerCase() : p.win;
        return nicknameList.includes(p.name) && (winField === "win" || winField === true);
      })
    ).length;

    const winrateOverall = totalGames > 0 ? Math.round((winGames / totalGames) * 100) : null;

    const lanes = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
    const winrateByLane: Record<string, number | null> = {};

    for (const lane of lanes) {
      const laneGames = matches.filter((m) =>
        m.participants.find((p: any) => nicknameList.includes(p.name) && p.position?.toUpperCase() === lane)
      );
      const laneWins = laneGames.filter((m) =>
        m.participants.find((p: any) => {
          const winField = typeof p.win === "string" ? p.win.toLowerCase() : p.win;
          return (
            nicknameList.includes(p.name) &&
            p.position?.toUpperCase() === lane &&
            (winField === "win" || winField === true)
          );
        })
      ).length;
      winrateByLane[lane.toLowerCase()] = laneGames.length > 0 ? Math.round((laneWins / laneGames.length) * 100) : null;
    }

    playerStats[alias] = {
      winrateOverall,
      winrateByLane,
    };

    // 별명으로도 접근 가능하게 추가
    for (const nick of nicknameList) {
      playerStats[nick] = playerStats[alias];
    }
  }

  console.log("✅ 최종 playerStats keys:", Object.keys(playerStats));
  return playerStats;
}
