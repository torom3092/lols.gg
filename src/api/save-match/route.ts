// app/api/save-match/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const matchData = await req.json(); // 요청 데이터

    const client = await connectToDB();
    const db = client.db("lol-stats"); // DB 이름
    const collection = db.collection("matches"); // 콜렉션 이름

    await collection.insertOne(matchData); // 한 판 데이터 저장

    return NextResponse.json({ message: "매치 저장 완료!" }, { status: 200 });
  } catch (error) {
    console.error("매치 저장 중 오류:", error);
    return NextResponse.json({ message: "서버 오류 발생" }, { status: 500 });
  }
}
