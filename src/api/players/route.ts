import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongdb";

export async function GET() {
  try {
    const db = await connectToDatabase();
    return NextResponse.json({ message: "MongoDB 연결 성공!", dbName: db.databaseName });
  } catch (error) {
    return NextResponse.json({ message: "MongoDB 연결 실패", error }, { status: 500 });
  }
}
