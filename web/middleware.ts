import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  getExpectedAdminToken,
  resolveAdminAuthorization,
} from "@/lib/adminAuth";

const LOGIN_PATH = "/admin/login";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname.startsWith(LOGIN_PATH);
  const isAdminApi = pathname.startsWith("/api/admin");

  const expectedToken = await getExpectedAdminToken();
  if (!expectedToken) {
    const message = "Admin credentials are not configured; access is disabled.";
    return isAdminApi
      ? NextResponse.json({ error: message }, { status: 503 })
      : new NextResponse(message, { status: 503 });
  }

  const cookieToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const { authorized: isAuthorized } = await resolveAdminAuthorization({
    cookieValue: cookieToken,
    authorizationHeader: request.headers.get("authorization"),
    expectedToken,
  });

  if (isAuthorized) {
    if (isLoginRoute) {
      const redirectUrl = new URL(
        request.nextUrl.searchParams.get("next") || "/admin/products",
        request.url,
      );
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  if (isLoginRoute) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL(LOGIN_PATH, request.url);
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
