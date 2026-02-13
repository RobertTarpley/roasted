import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ACCESS_COOKIE = "rt_unlocked";
const ACCESS_PATH = "/access";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isIgnoredPath =
    pathname === ACCESS_PATH ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image");

  if (isIgnoredPath) {
    return NextResponse.next();
  }

  const hasAccess = Boolean(request.cookies.get(ACCESS_COOKIE)?.value);

  if (!hasAccess) {
    return NextResponse.redirect(new URL(ACCESS_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
