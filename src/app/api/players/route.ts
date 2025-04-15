// src/app/api/players/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET: 전체 플레이어 목록 반환
export async function GET() {
  try {
    const client = await connectToDB();
    const db = client.db("내전GG");
    const players = await db.collection("players").find().toArray();
    return NextResponse.json(players);
  } catch (error) {
    console.error("[GET PLAYERS ERROR]", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

// PATCH: 닉네임 수정
export async function PATCH(req: NextRequest) {
  try {
    const { alias, oldNickname, newNickname } = await req.json();

    if (!alias || !oldNickname || !newNickname) {
      return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
    }

    const client = await connectToDB();
    const db = client.db("내전GG");

    await db
      .collection("players")
      .updateOne({ alias, nicknames: oldNickname }, { $set: { "nicknames.$": newNickname } });

    return NextResponse.json({ success: true, message: "닉네임이 수정되었습니다." });
  } catch (error) {
    console.error("[PATCH NICKNAME ERROR]", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

// DELETE: 닉네임 삭제
export async function DELETE(req: NextRequest) {
  try {
    const { alias, nickname } = await req.json();

    if (!alias || !nickname) {
      return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
    }

    const client = await connectToDB();
    const db = client.db("내전GG");

    await db.collection("players").updateOne({ alias }, { $pull: { nicknames: nickname } });

    return NextResponse.json({ success: true, message: "닉네임이 삭제되었습니다." });
  } catch (error) {
    console.error("[DELETE NICKNAME ERROR]", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nickname, alias } = body;

    if (!nickname || !alias) {
      return NextResponse.json({ error: "nickname과 alias는 필수입니다." }, { status: 400 });
    }

    const client = await connectToDB();
    const db = client.db("내전GG");
    const playersCollection = db.collection("players");

    // 같은 alias 문서가 이미 존재할 경우 닉네임만 추가
    const existingAlias = await playersCollection.findOne({ alias });

    if (existingAlias) {
      // 이미 닉네임이 포함되어 있는 경우
      if (existingAlias.nicknames.includes(nickname)) {
        return NextResponse.json({ message: "이미 등록된 닉네임입니다." }, { status: 409 });
      }

      // 닉네임 추가
      await playersCollection.updateOne({ alias }, { $push: { nicknames: nickname } });

      return NextResponse.json({
        success: true,
        message: "닉네임이 별명에 추가되었습니다!",
      });
    }

    // 새 alias로 문서 추가
    const newPlayer = {
      _id: new ObjectId(),
      alias,
      nicknames: [nickname],
      createdAt: new Date(),
    };

    await playersCollection.insertOne(newPlayer);

    return NextResponse.json({
      success: true,
      message: "새 별명과 닉네임이 등록되었습니다!",
      player: newPlayer,
    });
  } catch (error) {
    console.error("플레이어 등록 에러:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
