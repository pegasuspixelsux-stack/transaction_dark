/**
 * Signed session tokens (HMAC-SHA256). Dependency-free on purpose so both the
 * route handlers and `proxy.ts` can import it. Server-only: reads process.env.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { Role } from "@/types/admin";

export const SESSION_COOKIE = "tx_admin";
export const SESSION_TTL_S = 8 * 60 * 60;

export interface ServerSession {
  sub: string;
  email: string;
  name: string;
  role: Role;
  exp: number; // epoch seconds
}

export const digest = (v: string) => createHash("sha256").update(v).digest();
export const safeEqual = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

let ephemeralSecret: string | null = null;

function signingKey(): string | null {
  const explicit = process.env.ADMIN_SESSION_SECRET;
  if (explicit && explicit.length >= 16) return explicit;
  const pw = process.env.SUPER_ADMIN_PASSWORD;
  if (pw) return createHash("sha256").update(`tx-admin:${pw}`).digest("hex");
  if (process.env.NODE_ENV !== "production") {
    // Dev only. Deterministic per checkout so the proxy and the route handlers
    // (separate module instances) agree and sessions survive dev restarts.
    return (ephemeralSecret ??= createHash("sha256")
      .update(`tx-dev:${process.cwd()}`)
      .digest("hex"));
  }
  return null;
}

const b64 = (s: string) => Buffer.from(s).toString("base64url");

export function signSession(payload: ServerSession): string | null {
  const key = signingKey();
  if (!key) return null;
  const body = b64(JSON.stringify(payload));
  const mac = createHmac("sha256", key).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function verifySessionToken(token: string | undefined): ServerSession | null {
  const key = signingKey();
  if (!key || !token) return null;
  const [body, mac, extra] = token.split(".");
  if (!body || !mac || extra !== undefined) return null;
  const expected = createHmac("sha256", key).update(body).digest("base64url");
  if (!safeEqual(mac, expected)) return null;
  try {
    const s = JSON.parse(Buffer.from(body, "base64url").toString()) as ServerSession;
    return s.exp > Date.now() / 1000 ? s : null;
  } catch {
    return null;
  }
}

