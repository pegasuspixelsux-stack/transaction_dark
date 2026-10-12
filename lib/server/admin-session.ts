/**
 * Server-only admin identity. Imported by route handlers only — never from a
 * client component (it reads secrets from process.env).
 *
 * Two kinds of staff identity can obtain a session:
 *  - the hardcoded **super admin** (SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD).
 *    It is not a Firebase user and not in any user list. Login is disabled if
 *    either variable is unset.
 *  - **staff** (admin / manager / agent): Firebase Authentication accounts whose
 *    role lives in a custom claim. The browser signs in with Firebase, sends the
 *    ID token here, and we verify it with the Admin SDK.
 *
 * Either way the result is an HMAC-signed httpOnly cookie (`tx_admin`) that
 * `proxy.ts` and the admin APIs trust.
 */
import { cookies } from "next/headers";
import type { Role, SessionUser } from "@/types/admin";
import { adminAuth } from "./firebase-admin";
import {
  SESSION_COOKIE,
  SESSION_TTL_S,
  safeEqual,
  signSession,
  verifySessionToken,
  type ServerSession,
} from "./session-token";

export { SESSION_COOKIE };
export type { ServerSession };

export const STAFF_ROLES = ["admin", "manager", "agent"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
export const isStaffRole = (v: unknown): v is StaffRole =>
  typeof v === "string" && (STAFF_ROLES as readonly string[]).includes(v);

/* ---------------------------- cookie I/O --------------------------- */

export async function getServerSession(): Promise<ServerSession | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function setServerSession(session: Omit<ServerSession, "exp">): Promise<boolean> {
  const token = signSession({ ...session, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_S });
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

/* ------------------------- super admin (env) ----------------------- */

export function superAdminEmail(): string | null {
  const e = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  return e || null;
}

export const isSuperAdminEmail = (email: string | undefined | null) =>
  Boolean(email && superAdminEmail() && email.trim().toLowerCase() === superAdminEmail());

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

/* --------------------------- staff (Firebase) ---------------------- */

export type StaffLogin =
  | { ok: true; session: ServerSession }
  | { ok: false; status: number; error: string };

/** Verify a Firebase ID token from a fresh sign-in and map it to a session. */
export async function sessionFromIdToken(idToken: string): Promise<StaffLogin> {
  const auth = adminAuth();
  if (!auth) {
    return { ok: false, status: 500, error: "El inicio de sesión del personal no está configurado en el servidor." };
  }
  try {
    const decoded = await auth.verifyIdToken(idToken, true);
    // Only accept a token minted by a sign-in that just happened.
    if (Date.now() / 1000 - decoded.auth_time > 300) {
      return { ok: false, status: 401, error: "Correo o contraseña incorrectos." };
    }
    const user = await auth.getUser(decoded.uid);
    if (user.disabled) {
      return { ok: false, status: 403, error: "Esta cuenta fue desactivada. Contactá a un administrador." };
    }
    const role = (user.customClaims ?? {}).role;
    if (!isStaffRole(role) || isSuperAdminEmail(user.email)) {
      return { ok: false, status: 403, error: "Esta cuenta no tiene acceso al panel." };
    }
    return {
      ok: true,
      session: {
        sub: user.uid,
        email: user.email ?? "",
        name: user.displayName || user.email || "Usuario",
        role,
        exp: 0,
      },
    };
  } catch {
    return { ok: false, status: 401, error: "Correo o contraseña incorrectos." };
  }
}

export const toSessionUser = (s: Pick<ServerSession, "sub" | "email" | "name" | "role">): SessionUser => ({
  id: s.sub,
  fullName: s.name,
  email: s.email,
  role: s.role as Role,
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
