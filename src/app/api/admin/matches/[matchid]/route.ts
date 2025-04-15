import { connectToDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

// GET 메서드 - gameDate와 participants 배열을 기준으로 데이터 찾기
export async function GET(req: Request, { params }: { params: { participantsHash: string } }) {
  const { participantsHash } = params;

  try {
    const client = await connectToDB();
    const db = client.db("내전GG");

    // participantsHash를 기준으로 경기 데이터를 찾음
    const match = await db.collection("matches").findOne({ participantsHash });

    if (!match) {
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 });
    }

    return NextResponse.json(match); // 찾은 match 반환
  } catch (err) {
    console.error("[MATCH DETAIL ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH 메서드 - gameDate 또는 matchId 수정
export async function PATCH(req: Request, { params }: { params: { participantsHash: string } }) {
  const { participantsHash } = params;
  const body = await req.json();
  const { newMatchId, newGameDate } = body;

  try {
    const client = await connectToDB();
    const db = client.db("내전GG");

    // participantsHash를 기준으로 데이터를 찾음
    const match = await db.collection("matches").findOne({ participantsHash });
    if (!match) {
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 });
    }

    const result = await db.collection("matches").updateOne(
      { participantsHash }, // participantsHash로 업데이트
      {
        $set: {
          ...(newMatchId && { matchId: newMatchId }),
          ...(newGameDate && { gameDate: new Date(newGameDate) }),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Match updated" });
  } catch (err) {
    console.error("[MATCH UPDATE ERROR]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
