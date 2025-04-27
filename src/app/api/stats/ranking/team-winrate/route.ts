import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const yearFilter = req.nextUrl.searchParams.get("year") || "전체"; // e.g., "2025" or "전체"
  const monthFilter = req.nextUrl.searchParams.get("month") || "전체"; // e.g., "4" or "전체"

  const client = await connectToDB();
  const db = client.db("내전GG");

  const matches = await db.collection("matches").find().toArray();

  let blueWins = 0,
    blueTotal = 0;
  let redWins = 0,
    redTotal = 0;

  for (const match of matches) {
    const date = new Date(match.gameDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (yearFilter !== "전체" && year !== Number(yearFilter)) continue;
    if (monthFilter !== "전체" && month !== Number(monthFilter)) continue;

    const participants = match.participants || [];
    const blueTeam = participants.filter((p: any) => p.teamId === "blue");
    const redTeam = participants.filter((p: any) => p.teamId === "red");

    const blueWin = blueTeam.every((p: any) => p.win === "Win");
    const redWin = redTeam.every((p: any) => p.win === "Win");

    if (blueWin) blueWins++;
    if (redWin) redWins++;
    blueTotal++;
    redTotal++;
  }

  const blueWinrate = blueTotal > 0 ? Math.round((blueWins / blueTotal) * 100) : 0;
  const redWinrate = redTotal > 0 ? Math.round((redWins / redTotal) * 100) : 0;

  return NextResponse.json({
    blueWinrate,
    redWinrate,
    blueTotal,
    redTotal,
  });
}
