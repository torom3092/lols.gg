// lib/winrate.ts
import { connectToDB } from "@/lib/mongodb";
import { PLAYERS } from "@/lib/players";

const client = await connectToDB();
const db = client.db();
export async function getAllPlayerStats() {
  const playerStats: Record<string, any> = {};

  const aliasMap = await buildAliasMap(); // name → alias

  for (const player of PLAYERS) {
    const name = player.name;
    const alias = aliasMap[name] ?? name;

    // 모든 nickname을 수집
    const nicknameList = Object.entries(aliasMap)
      .filter(([_, a]) => a === alias)
      .map(([n]) => n);

    const matches = await db
      .collection("matches")
      .find({
        participants: { $elemMatch: { name: { $in: nicknameList } } },
      })
      .toArray();

    const totalGames = matches.length;
    const winGames = matches.filter((match) =>
      match.participants.find((p: any) => nicknameList.includes(p.name) && p.win === "Win")
    ).length;

    const winrateOverall = totalGames > 0 ? Math.round((winGames / totalGames) * 100) : null;

    const lanes = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
    const winrateByLane: Record<string, number | null> = {};

    for (const lane of lanes) {
      const laneGames = matches.filter((m) =>
        m.participants.find((p: any) => nicknameList.includes(p.name) && p.position === lane)
      );
      const laneWins = laneGames.filter((m) =>
        m.participants.find((p: any) => nicknameList.includes(p.name) && p.position === lane && p.win === "Win")
      ).length;
      winrateByLane[lane.toLowerCase()] = laneGames.length > 0 ? Math.round((laneWins / laneGames.length) * 100) : null;
    }

    playerStats[name] = {
      winrateOverall,
      winrateByLane,
    };
  }

  // nickname → alias 덮어쓰기 (모든 닉네임도 데이터 갖도록 확장)
  for (const [nickname, alias] of Object.entries(aliasMap)) {
    if (playerStats[alias]) {
      playerStats[nickname] = playerStats[alias];
    }
  }

  return playerStats;
}

async function buildAliasMap(): Promise<Record<string, string>> {
  const players = await db.collection("players").find().toArray();
  const map: Record<string, string> = {};

  for (const entry of players) {
    const alias = entry.alias;
    for (const nick of entry.nicknames) {
      map[nick] = alias;
    }
  }

  return map;
}
