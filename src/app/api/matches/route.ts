import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb"; // 너가 사용하는 Mongo 연결 유틸
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await connectToDB();
    const db = client.db("내전GG"); // ✅ DB 이름 수정!
    const collection = db.collection("matches");

    const matches = await collection
      .find({})
      .sort({ gameDate: -1 }) // 최신순 정렬
      .limit(20)
      .toArray();

    return NextResponse.json(matches);
  } catch (err) {
    console.error("❌ Failed to fetch matches", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
