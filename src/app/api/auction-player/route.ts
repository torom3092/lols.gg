// app/api/auction-player/route.ts
import { NextResponse } from "next/server";
import { getAllPlayerStats } from "@/lib/winrate";

export async function GET() {
  try {
    const playerStats = await getAllPlayerStats();
    return NextResponse.json(playerStats);
  } catch (err) {
    console.error("❌ Failed to fetch player stats:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
