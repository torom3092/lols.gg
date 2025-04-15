// src/app/admin/login/submit/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  // 여기에 실제 인증 로직을 넣을 수 있어
  if (username === "admin" && password === "07272") {
    const res = NextResponse.redirect(new URL("/admin/upload-match", req.url));
    res.cookies.set("authToken", "secure-token", {
      httpOnly: true,
      path: "/",
    });
    return res;
  }

  return NextResponse.redirect(new URL("/admin/login?error=1", req.url));
}
