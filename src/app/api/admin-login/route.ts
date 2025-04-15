// src/app/api/admin/login/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  const VALID_USERNAME = "admin";
  const VALID_PASSWORD = "07272";

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    const response = NextResponse.redirect(new URL("/admin/submit", req.url));
    response.cookies.set("authToken", "secret-token", {
      httpOnly: true,
      path: "/",
    });
    return response;
  }

  return new NextResponse("Invalid credentials", { status: 401 });
}
