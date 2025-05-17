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

  const allMatches = await db.collection("matches").find().toArray();

  for (const player of PLAYERS) {
    const alias = player.name; // PLAYERS는 alias 기준으로 구성됨
    const nicknameList = aliasToNicknames[alias] ?? [alias];

    const relevantMatches = allMatches.filter((match) =>
      match.participants?.some((p: any) => nicknameList.includes(p.name))
    );

    const totalGames = relevantMatches.length;
    const winGames = relevantMatches.filter((match) => {
      const participant = match.participants.find((p: any) => nicknameList.includes(p.name));
      const winField = participant?.win;
      return winField === "Win" || winField === true || winField?.toLowerCase?.() === "win";
    }).length;

    const winrateOverall = totalGames > 0 ? Math.round((winGames / totalGames) * 100) : null;


    const lanes = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
    const winrateByLane: Record<string, number | null> = {};

    for (const lane of lanes) {
      const laneGames = relevantMatches.filter((match) => {
        const participant = match.participants.find((p: any) =>
          nicknameList.includes(p.name) && p.position?.toUpperCase() === lane
        );
        return !!participant;
      });

      const laneWins = laneGames.filter((match) => {
        const participant = match.participants.find((p: any) =>
          nicknameList.includes(p.name) && p.position?.toUpperCase() === lane
        );
        const winField = participant?.win;
        return winField === "Win" || winField === true || winField?.toLowerCase?.() === "win";
      }).length;

      winrateByLane[lane.toLowerCase()] =
        laneGames.length > 0 ? Math.round((laneWins / laneGames.length) * 100) : null;
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


  return playerStats;
}
