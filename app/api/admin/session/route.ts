import { NextResponse } from "next/server";
import {
  clearFailures,
  clearServerSession,
  getServerSession,
  isThrottled,
  recordFailure,
  sameOrigin,
  setServerSession,
  toSessionUser,
  verifyStoredUser,
  verifySuperAdmin,
} from "@/lib/server/admin-session";

const noStore = { "Cache-Control": "no-store" };

/** Who does the server think I am? Used to restore the super admin on reload. */
export async function GET() {
  const session = await getServerSession();
  return NextResponse.json(
    { user: session ? toSessionUser(session) : null },
    { headers: noStore },
  );
}

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

  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  const identity = verifySuperAdmin(email, password) ?? verifyStoredUser(email, password);
  if (!identity) {
    recordFailure(ip);
    // Same message whether the email or the password was wrong.
    return NextResponse.json(
      { error: "Correo o contraseña incorrectos." },
      { status: 401, headers: noStore },
    );
  }

  clearFailures(ip);
  const session = { sub: identity.sub, email: identity.email, name: identity.name, role: identity.role };
  if (!(await setServerSession(session))) {
    return NextResponse.json(
      { error: "El servidor no tiene configurado el secreto de sesión." },
      { status: 500, headers: noStore },
    );
  }
  return NextResponse.json(
    { user: toSessionUser({ ...session, exp: 0 }) },
    { headers: noStore },
  );
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  await clearServerSession();
  return NextResponse.json({ ok: true }, { headers: noStore });
}
