import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const REALM = "Key-Kingdom Admin";

function decodeBasicAuth(header: string): { username: string; password: string } | null {
  const [scheme, encoded] = header.split(" ");
  if (scheme?.toLowerCase() !== "basic" || !encoded) return null;

  try {
    const decoded = atob(encoded);
    const [username, ...rest] = decoded.split(":");
    const password = rest.join(":");
    if (!username || password === undefined) return null;
    return { username, password };
  } catch (error) {
    console.error("Failed to decode basic auth header", error);
    return null;
  }
}

function isAuthorized(request: NextRequest) {
  const header = request.headers.get("authorization");
  const credentials = header ? decodeBasicAuth(header) : null;
  const adminUser = process.env.ADMIN_USERNAME ?? "admin";
  const adminPass = process.env.ADMIN_PASSWORD ?? "change-me";

  return credentials?.username === adminUser && credentials.password === adminPass;
}

export function middleware(request: NextRequest) {
  if (isAuthorized(request)) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm=\"${REALM}\"`,
    },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
