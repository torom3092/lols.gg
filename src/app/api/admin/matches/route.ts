import { connectToDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await connectToDB();
    const db = client.db("내전GG");

    const matches = await db
      .collection("matches")
      .find(
        {
          $or: [{ matchId: { $regex: "^unknown-" } }, { gameDate: { $exists: false } }],
        },
        {
          projection: {
            matchId: 1,
            gameDate: 1,
            _id: 0,
          },
        }
      )
      .toArray();

    return NextResponse.json(matches);
  } catch (err) {
    console.error("[ADMIN MATCH LIST ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
