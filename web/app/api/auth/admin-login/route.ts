import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  buildAdminToken,
  getExpectedAdminToken,
  encodeAdminSessionCookie,
} from "@/lib/adminAuth";
import { sendAdminAudit } from "@/lib/adminAudit";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export async function POST(request: Request) {
  const expectedToken = await getExpectedAdminToken();
  if (!expectedToken) {
    return NextResponse.json(
      { error: "Admin credentials are not configured." },
      { status: 503 },
    );
  }

  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials." }, { status: 400 });
  }

  const providedToken = await buildAdminToken(username, password);
  if (providedToken !== expectedToken) {
    return NextResponse.json({ error: "Invalid username or password." }, {
      status: 401,
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: encodeAdminSessionCookie(expectedToken, username),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  await sendAdminAudit({
    action: "admin_login",
    actor: username,
    details: { source: "credentials" },
  });

  return response;
}
