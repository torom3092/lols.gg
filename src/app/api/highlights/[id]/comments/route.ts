import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const client = await connectToDB();
  const db = client.db("내전GG");
  const commentsCollection = db.collection("comments");

  const videoId = params.id;
  const comments = await commentsCollection.find({ videoId }).sort({ createdAt: -1 }).toArray();

  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const client = await connectToDB();
  const db = client.db("내전GG");
  const commentsCollection = db.collection("comments");

  const videoId = params.id;
  const body = await req.json();
  const { author, content } = body;

  if (!author || !content) {
    return NextResponse.json({ error: "author와 content는 필수입니다." }, { status: 400 });
  }

  const newComment = {
    videoId,
    author,
    content,
    createdAt: new Date(),
  };

  await commentsCollection.insertOne(newComment);
  return NextResponse.json({ success: true });
}
