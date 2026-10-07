import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Light routing only, no hard auth wall: anyone can use the app as a guest.
 * Visitors without any session land on the welcome flow, which creates a guest session.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/" && !getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/"] };
