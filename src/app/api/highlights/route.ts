import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { title, youtubeId } = await req.json();

    if (!title || !youtubeId) {
      return NextResponse.json({ error: "title과 youtubeId는 필수입니다." }, { status: 400 });
    }

    const client = await connectToDB();
    const db = client.db("내전GG");

    const newHighlight = {
      title,
      youtubeId,
      createdAt: new Date(),
    };

    await db.collection("highlightVideos").insertOne(newHighlight);

    return NextResponse.json({ message: "등록 완료" }, { status: 201 });
  } catch (err) {
    console.error("하이라이트 등록 에러:", err);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const client = await connectToDB();
    const db = client.db("내전GG");

    const videos = await db
      .collection("highlightVideos")
      .find({})
      .sort({ createdAt: -1 }) // 최신순
      .toArray();

    return NextResponse.json(videos);
  } catch (err) {
    console.error("하이라이트 목록 조회 에러:", err);
    return NextResponse.json({ error: "서버 에러" }, { status: 500 });
  }
}
