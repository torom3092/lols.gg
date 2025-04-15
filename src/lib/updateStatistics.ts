import { connectToDB } from "@/lib/mongodb";

// 모든 match 데이터를 순회하면서 플레이어 통계 계산
export async function updatePlayerStats() {
  const client = await connectToDB();
  const db = client.db();
  const matchCollection = db.collection("matches");
  const playerCollection = db.collection("players");

  const allMatches = await matchCollection.find().toArray();

  const statsMap: Record<string, any> = {};

  for (const match of allMatches) {
    for (const p of match.participants) {
      const puuid = p.PUUID;
      const champ = p.SKIN;
      const win = p.WIN === "Win";

      if (!statsMap[puuid]) statsMap[puuid] = { totalGames: 0, totalWins: 0, champions: {} };

      statsMap[puuid].totalGames += 1;
      if (win) statsMap[puuid].totalWins += 1;

      if (!statsMap[puuid].champions[champ]) {
        statsMap[puuid].champions[champ] = { games: 0, wins: 0 };
      }

      statsMap[puuid].champions[champ].games += 1;
      if (win) statsMap[puuid].champions[champ].wins += 1;
    }
  }

  // 저장
  for (const puuid in statsMap) {
    await playerCollection.updateOne({ puuid }, { $set: { statistics: statsMap[puuid] } }, { upsert: true });
  }

  client.close();
}
