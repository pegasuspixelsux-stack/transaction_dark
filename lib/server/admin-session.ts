/**
 * Server-only admin identity. Imported by route handlers only — never from a
 * client component (it reads secrets from process.env).
 *
 * - The **super admin** is defined by SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD.
 *   It is deliberately absent from the users DB, so no user grid can list or
 *   edit it. If either variable is unset, super-admin login is disabled.
 * - Sessions are HMAC-signed httpOnly cookies (`tx_admin`).
 * - Seeded demo admins can also obtain a session so the config API can verify
 *   them. The rest of the admin app still uses the mock localStorage layer
 *   (lib/admin/db.ts); when a real user store replaces it, swap
 *   `verifyStoredUser` below for a lookup against that store.
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createSeed } from "@/lib/admin/seed";
import type { Role, SessionUser } from "@/types/admin";

export const SESSION_COOKIE = "tx_admin";
const SESSION_TTL_S = 8 * 60 * 60;

export interface ServerSession {
  sub: string;
  email: string;
  name: string;
  role: Role;
  exp: number; // epoch seconds
}

/* ---------------------------- secrets ----------------------------- */

let ephemeralSecret: string | null = null;

function signingKey(): string | null {
  const explicit = process.env.ADMIN_SESSION_SECRET;
  if (explicit && explicit.length >= 16) return explicit;
  const pw = process.env.SUPER_ADMIN_PASSWORD;
  if (pw) return createHash("sha256").update(`tx-admin:${pw}`).digest("hex");
  // Dev convenience only: sessions last until the process restarts.
  if (process.env.NODE_ENV !== "production") {
    return (ephemeralSecret ??= randomBytes(32).toString("hex"));
  }
  return null;
}

const digest = (v: string) => createHash("sha256").update(v).digest();
const safeEqual = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

/* ----------------------------- tokens ----------------------------- */

const b64 = (s: string) => Buffer.from(s).toString("base64url");

function sign(payload: ServerSession): string | null {
  const key = signingKey();
  if (!key) return null;
  const body = b64(JSON.stringify(payload));
  const mac = createHmac("sha256", key).update(body).digest("base64url");
  return `${body}.${mac}`;
}

function verify(token: string | undefined): ServerSession | null {
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

/* ---------------------------- cookie I/O --------------------------- */

export async function getServerSession(): Promise<ServerSession | null> {
  const store = await cookies();
  return verify(store.get(SESSION_COOKIE)?.value);
}

export async function setServerSession(session: Omit<ServerSession, "exp">): Promise<boolean> {
  const token = sign({ ...session, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_S });
  if (!token) return false;
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_S,
  });
  return true;
}

export async function clearServerSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/* --------------------------- credentials --------------------------- */

export function superAdminConfigured(): boolean {
  return Boolean(process.env.SUPER_ADMIN_EMAIL && process.env.SUPER_ADMIN_PASSWORD);
}

/** Constant-time check of the env-defined super admin credentials. */
export function verifySuperAdmin(email: string, password: string): ServerSession | null {
  const e = process.env.SUPER_ADMIN_EMAIL;
  const p = process.env.SUPER_ADMIN_PASSWORD;
  if (!e || !p) return null;
  // Evaluate both so timing doesn't reveal which one was wrong.
  const emailOk = safeEqual(email.trim().toLowerCase(), e.trim().toLowerCase());
  const passOk = safeEqual(password, p);
  if (!(emailOk && passOk)) return null;
  return { sub: "superadmin", email: e.trim(), name: "Super administrador", role: "superadmin", exp: 0 };
}

/** Demo accounts from the seed; replace with a real user-store lookup. */
export function verifyStoredUser(email: string, password: string): ServerSession | null {
  const match = createSeed().users.find(
    (u) => u.active && u.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!match || !safeEqual(password, match.password)) return null;
  return { sub: match.id, email: match.email, name: match.fullName, role: match.role, exp: 0 };
}

export const toSessionUser = (s: ServerSession): SessionUser => ({
  id: s.sub,
  fullName: s.name,
  email: s.email,
  role: s.role,
  active: true,
  lastLogin: new Date().toISOString(),
});

/* ---------------------------- throttling --------------------------- */

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 8;

export function isThrottled(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < Date.now()) return false;
  return entry.count >= MAX_FAILS;
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else entry.count += 1;
}

export function clearFailures(key: string): void {
  attempts.delete(key);
}

/** Reject cross-site state-changing requests (defence in depth on top of SameSite=Lax). */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
