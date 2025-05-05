import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

// ✅ GET: 댓글 조회
export async function GET(req: NextRequest, context: any) {
  const videoId = context?.params?.id;

  if (!videoId || typeof videoId !== "string") {
    return NextResponse.json({ error: "Missing or invalid video ID" }, { status: 400 });
  }

  const client = await connectToDB();
  const db = client.db("내전GG");
  const commentsCollection = db.collection("comments");

  const comments = await commentsCollection.find({ videoId }).sort({ createdAt: -1 }).toArray();

  return NextResponse.json(comments);
}

// ✅ POST: 댓글 작성
export async function POST(req: NextRequest, context: any) {
  const videoId = context?.params?.id;

  if (!videoId || typeof videoId !== "string") {
    return NextResponse.json({ error: "Missing or invalid video ID" }, { status: 400 });
  }

  const { author, content } = await req.json();

  if (!author || !content) {
    return NextResponse.json({ error: "author와 content는 필수입니다." }, { status: 400 });
  }

  const client = await connectToDB();
  const db = client.db("내전GG");
  const commentsCollection = db.collection("comments");

  await commentsCollection.insertOne({
    videoId,
    author,
    content,
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true });
}
