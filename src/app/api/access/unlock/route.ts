import { NextResponse } from "next/server";

const ACCESS_COOKIE = "rt_unlocked";

export async function POST(request: Request) {
  let passcode: string | undefined;

  try {
    const body = (await request.json()) as { passcode?: string } | null;
    passcode = typeof body?.passcode === "string" ? body.passcode : undefined;
  } catch {
    passcode = undefined;
  }

  const expectedPasscode = process.env.PRIVATE_PASSCODE;

  if (!expectedPasscode || !passcode || passcode !== expectedPasscode) {
    return NextResponse.json({ error: "Incorrect passcode" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: ACCESS_COOKIE,
    value: "true",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
