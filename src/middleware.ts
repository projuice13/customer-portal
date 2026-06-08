import { NextRequest, NextResponse } from "next/server";

const PRODUCT_COOKIE = "portal_product_auth";
const ADMIN_COOKIE = "portal_admin_auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin protection ──────────────────────────────────────────────────────
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const authed = request.cookies.get(ADMIN_COOKIE)?.value === "1";
    if (!authed) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // ── Product Info protection ───────────────────────────────────────────────
  if (
    pathname.startsWith("/product-info") &&
    !pathname.startsWith("/product-info/unlock")
  ) {
    const authed = request.cookies.get(PRODUCT_COOKIE)?.value === "1";
    if (!authed) {
      const url = request.nextUrl.clone();
      url.pathname = "/product-info/unlock";
      url.searchParams.set("from", pathname + (request.nextUrl.search || ""));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/product-info/:path*", "/admin/:path*"],
};
