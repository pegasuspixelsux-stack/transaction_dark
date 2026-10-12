import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/server/session-token";

/**
 * Server-side gate for the whole dashboard. Anyone without a valid, signed,
 * unexpired staff session (superadmin / admin / manager / agent) is redirected
 * to the login page before a single dashboard byte is rendered. The cookie is
 * httpOnly + HMAC-signed, so it cannot be forged from the browser.
 */
const STAFF_ROLES = new Set(["superadmin", "admin", "manager", "agent"]);

export function proxy(request: NextRequest) {
  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (session && STAFF_ROLES.has(session.role)) {
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*"],
};
