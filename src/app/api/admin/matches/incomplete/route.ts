// /src/app/api/admin/matches/incomplete/route.ts

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET() {
  const client = await connectToDB();
  const db = client.db("lol-private-stats");
  const matches = db.collection("matches");

  const incompleteMatches = await matches
    .find({
      matchId: { $regex: /^unknown/ },
      $or: [{ gameDate: { $exists: false } }, { gameDate: new Date(0) }],
    })
    .sort({ gameDate: -1 }) // 최신순 정렬
    .toArray();

  return NextResponse.json({ matches: incompleteMatches });
}
