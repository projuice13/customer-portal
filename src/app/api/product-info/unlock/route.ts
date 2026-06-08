import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "portal_product_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password: string = body?.password ?? "";

    const correctPassword =
      process.env.PRODUCT_INFO_PASSWORD ?? "grapes";

    if (password !== correctPassword) {
      return NextResponse.json(
        { error: "Incorrect password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
}
