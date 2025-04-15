import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  if (username === "admin" && password === "07272") {
    const res = new NextResponse(null, {
      status: 303,
      headers: {
        Location: "/admin/upload-match",
      },
    });

    res.cookies.set("authToken", "secure-token", {
      httpOnly: true,
      path: "/",
    });

    return res;
  }

  return NextResponse.redirect(new URL("/admin/login?error=1", req.url));
}
