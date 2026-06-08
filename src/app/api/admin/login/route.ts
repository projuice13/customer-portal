import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE = "portal_admin_auth";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password: string = body?.password ?? "";
    const correct = process.env.ADMIN_PASSWORD ?? "";

    if (!correct || password !== correct) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
