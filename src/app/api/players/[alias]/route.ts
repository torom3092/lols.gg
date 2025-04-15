// src/app/api/players/[alias]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

// ✅ 타입을 직접 쓰지 말고 구조 분해 + params 그대로 받아야 함
export async function DELETE(req: NextRequest, { params }: { params: { alias: string } }) {
  const { alias } = params;

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
