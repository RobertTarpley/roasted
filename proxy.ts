import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ACCESS_COOKIE = "rt_unlocked";
const ACCESS_PATH = "/access";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === ACCESS_PATH) {
    return NextResponse.next();
  }

  const hasAccess = Boolean(request.cookies.get(ACCESS_COOKIE)?.value);

  if (!hasAccess) {
    return NextResponse.redirect(new URL(ACCESS_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!access|api|_next/static|_next/image|favicon.ico).*)",
  ],
};
