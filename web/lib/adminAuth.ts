const ENCODER = new TextEncoder();

export const ADMIN_SESSION_COOKIE = "kk_admin_auth";
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN;
const ADMIN_API_ACTOR = process.env.ADMIN_API_ACTOR ?? "automation";

type EncodedSession = {
  token: string;
  username?: string;
};

async function digestHex(value: string) {
  const buffer = await crypto.subtle.digest("SHA-256", ENCODER.encode(value));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function buildAdminToken(username: string, password: string) {
  return digestHex(`${username}:${password}`);
}

export async function getExpectedAdminToken() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) return null;
  return buildAdminToken(username, password);
}

export function encodeAdminSessionCookie(token: string, username?: string) {
  return Buffer.from(JSON.stringify({ token, username } satisfies EncodedSession)).toString(
    "base64url",
  );
}

export function decodeAdminSessionCookie(value: string | undefined) {
  if (!value) return null;

  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded) as Partial<EncodedSession>;
    if (!parsed.token) return null;

    return parsed as EncodedSession;
  } catch (error) {
    console.error("Unable to decode admin session cookie", error);
    return null;
  }
}

export type AdminIdentity = {
  username?: string;
  source: "cookie" | "basic" | "bearer";
};

type AuthorizationCheckInput = {
  cookieValue?: string | null;
  authorizationHeader?: string | null;
  expectedToken: string;
};

export async function resolveAdminAuthorization({
  cookieValue,
  authorizationHeader,
  expectedToken,
}: AuthorizationCheckInput) {
  const cookieSession = decodeAdminSessionCookie(cookieValue ?? undefined);
  if (cookieSession?.token === expectedToken) {
    return { authorized: true, identity: { username: cookieSession.username, source: "cookie" } satisfies AdminIdentity };
  }

  if (authorizationHeader?.startsWith("Basic ")) {
    const decoded = atob(authorizationHeader.slice(6));
    const [username, ...rest] = decoded.split(":");
    const password = rest.join(":");
    if (username && password !== undefined) {
      const providedToken = await buildAdminToken(username, password);
      if (providedToken === expectedToken) {
        return { authorized: true, identity: { username, source: "basic" } satisfies AdminIdentity };
      }
    }
  }

  if (ADMIN_API_TOKEN && authorizationHeader?.startsWith("Bearer ")) {
    const providedToken = authorizationHeader.slice(7).trim();
    if (providedToken && providedToken === ADMIN_API_TOKEN) {
      return { authorized: true, identity: { username: ADMIN_API_ACTOR, source: "bearer" } satisfies AdminIdentity };
    }
  }

  return { authorized: false, identity: undefined } as const;
}

function getCookieFromHeader(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export async function getAdminIdentityFromRequest(request: Request) {
  const expectedToken = await getExpectedAdminToken();
  if (!expectedToken) return undefined;

  const cookieValue = getCookieFromHeader(request.headers.get("cookie"), ADMIN_SESSION_COOKIE);
  const { identity } = await resolveAdminAuthorization({
    cookieValue,
    authorizationHeader: request.headers.get("authorization"),
    expectedToken,
  });

  return identity;
}
