// src/app/api/players/[alias]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

export async function DELETE(req: NextRequest, context: { params: { alias: string } }) {
  const { alias } = context.params;

  try {
    const client = await connectToDB();
    const db = client.db("내전GG");

    const result = await db.collection("players").deleteOne({ alias });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Alias not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Alias deleted." });
  } catch (err) {
    console.error("[DELETE ALIAS ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
