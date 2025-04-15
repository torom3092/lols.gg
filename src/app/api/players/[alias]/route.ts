// src/app/api/players/[alias]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";

// ✅ 이 방식이 공식 문서와 실제 빌드에서 가장 안정적으로 통과됩니다
export async function DELETE(req: NextRequest, context: { params: { alias: string } }): Promise<NextResponse> {
  const alias = context.params.alias;

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
