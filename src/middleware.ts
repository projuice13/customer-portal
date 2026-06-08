import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "portal_product_auth";
const UNLOCK_PATH = "/product-info/unlock";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /product-info routes (excluding the unlock page itself)
  if (
    pathname.startsWith("/product-info") &&
    !pathname.startsWith(UNLOCK_PATH)
  ) {
    const authCookie = request.cookies.get(COOKIE_NAME);
    if (!authCookie || authCookie.value !== "1") {
      const url = request.nextUrl.clone();
      url.pathname = UNLOCK_PATH;
      // Preserve the originally requested URL so we can redirect back after unlock
      url.searchParams.set("from", pathname + (request.nextUrl.search || ""));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/product-info/:path*"],
};
