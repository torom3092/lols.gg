import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const client = await connectToDB();
    const db = client.db("내전GG");

    const searchParams = req.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const name = searchParams.get("name");
    const champion = searchParams.get("champion");
    const matchId = searchParams.get("matchId");
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (from || to) {
      filter.gameDate = {};
      if (from) filter.gameDate.$gte = new Date(from);
      if (to) filter.gameDate.$lte = new Date(to);
    }
    if (name) {
      filter["participants.name"] = { $regex: name, $options: "i" };
    }
    if (champion) {
      filter["participants.championName"] = { $regex: champion, $options: "i" };
    }
    if (matchId) {
      filter.matchId = { $regex: matchId, $options: "i" };
    }

    const total = await db.collection("matches").countDocuments(filter);
    const matches = await db
      .collection("matches")
      .find(filter)
      .sort({ gameDate: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({ total, matches });
  } catch (err) {
    console.error("❌ Failed to fetch matches", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
