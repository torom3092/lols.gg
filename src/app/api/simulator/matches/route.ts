import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const client = await connectToDB();
    const db = client.db("내전GG");
    const matchesCollection = db.collection("matches");

    // 최근 6개월치만 가져오기
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const matches = await matchesCollection
      .find({ gameDate: { $gte: sixMonthsAgo } })
      .project({
        matchId: 1,
        gameDate: 1,
        participants: 1,
        _id: 0, // _id는 필요 없으니까 빼버려
      })
      .toArray();

    return NextResponse.json(matches);
  } catch (error) {
    console.error("[GET SIMULATOR MATCHES ERROR]", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
