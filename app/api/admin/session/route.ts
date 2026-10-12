import { NextResponse } from "next/server";
import {
  clearFailures,
  clearServerSession,
  getServerSession,
  isSuperAdminEmail,
  isThrottled,
  recordFailure,
  sameOrigin,
  sessionFromIdToken,
  setServerSession,
  toSessionUser,
  verifySuperAdmin,
} from "@/lib/server/admin-session";

const noStore = { "Cache-Control": "no-store" };
const BAD_CREDENTIALS = "Correo o contraseña incorrectos.";

/** Who does the server think I am? Used to restore the session on reload. */
export async function GET() {
  const session = await getServerSession();
  return NextResponse.json(
    { user: session ? toSessionUser(session) : null },
    { headers: noStore },
  );
}

/**
 * Two ways in:
 *  - { idToken }            staff, after signing in with Firebase in the browser
 *  - { email, password }    the env-defined super admin only
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (isThrottled(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Probá de nuevo en unos minutos." },
      { status: 429, headers: noStore },
    );
  }

  let body: { idToken?: unknown; email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  let identity;
  if (typeof body.idToken === "string") {
    const result = await sessionFromIdToken(body.idToken);
    if (!result.ok) {
      if (result.status === 401) recordFailure(ip);
      return NextResponse.json({ error: result.error }, { status: result.status, headers: noStore });
    }
    identity = result.session;
  } else {
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    identity = verifySuperAdmin(email, password);
    if (!identity) {
      // Only count attempts aimed at the super admin account; staff go via Firebase.
      if (isSuperAdminEmail(email)) recordFailure(ip);
      return NextResponse.json({ error: BAD_CREDENTIALS }, { status: 401, headers: noStore });
    }
  }

  clearFailures(ip);
  const session = { sub: identity.sub, email: identity.email, name: identity.name, role: identity.role };
  if (!(await setServerSession(session))) {
    return NextResponse.json(
      { error: "El servidor no tiene configurado el secreto de sesión." },
      { status: 500, headers: noStore },
    );
  }
  return NextResponse.json({ user: toSessionUser(session) }, { headers: noStore });
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  await clearServerSession();
  return NextResponse.json({ ok: true }, { headers: noStore });
}
