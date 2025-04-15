import { MatchType } from "@/types";
import { connectToDB } from "@/lib/mongodb";

// MongoDB에 match 저장
export async function saveMatchToDB(matchData: MatchType) {
  const client = await connectToDB();
  const db = client.db();
  const matchCollection = db.collection("matches");

  // 이미 저장된 match인지 확인 (중복 저장 방지)
  const exists = await matchCollection.findOne({ matchId: matchData.matchId });
  if (!exists) {
    await matchCollection.insertOne(matchData);
  }

  client.close();
}
