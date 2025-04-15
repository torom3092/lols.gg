// src/app/api/upload-match/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { parseReplaybookJson } from "@/utils/parseReplaybookJson";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 고유 ID가 없으면 에러
    if (!body.uniqueId) {
      return NextResponse.json({ message: "uniqueId가 누락되었습니다." }, { status: 400 });
    }

    const data = parseReplaybookJson(body); // 여기서 matchId, gameDate, participants 추출됨

    // uniqueId 포함해서 저장
    const client = await connectToDB();
    const db = client.db("내전GG");
    const collection = db.collection("matches");

    // uniqueId 기준으로 중복 검사
    const existing = await collection.findOne({ uniqueId: body.uniqueId });
    if (existing) {
      return NextResponse.json({ message: "이미 업로드된 매치입니다." }, { status: 409 });
    }

    // uniqueId 함께 저장
    await collection.insertOne({
      ...data,
      uniqueId: body.uniqueId,
    });

    return NextResponse.json({ message: "매치 저장 완료" }, { status: 201 });
  } catch (error) {
    console.error("Upload Match Error:", error);
    return NextResponse.json({ message: "서버 에러 발생" }, { status: 500 });
  }
}
