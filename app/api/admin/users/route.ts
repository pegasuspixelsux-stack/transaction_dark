import { NextResponse } from "next/server";
import { can } from "@/lib/admin/rbac";
import {
  getServerSession,
  isStaffRole,
  isSuperAdminEmail,
  sameOrigin,
} from "@/lib/server/admin-session";
import { adminAuth } from "@/lib/server/firebase-admin";
import { EMAIL_RE, listStaff, toStaffUser } from "@/lib/server/staff-users";

const noStore = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStore });

/**
 * Staff directory. Admins get everyone; managers (who assign leads) only get
 * the active agents. The super admin is never included.
 */
export async function GET() {
  const session = await getServerSession();
  if (!session) return json({ error: "No autenticado." }, 401);
  const full = can(session.role, "users:manage");
  const agentsOnly =
    can(session.role, "leads:reassign") || can(session.role, "properties:write");
  if (!full && !agentsOnly) return json({ error: "Acceso no autorizado." }, 403);
  if (!adminAuth()) return json({ error: "La gestión de usuarios no está configurada en el servidor." }, 503);

  try {
    const staff = await listStaff();
    return json({ users: full ? staff : staff.filter((u) => u.role === "agent" && u.active) });
  } catch (error) {
    console.error("[users] list failed:", error);
    return json({ error: "No pudimos cargar los usuarios." }, 500);
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Origen no permitido." }, 403);
  const session = await getServerSession();
  if (!session) return json({ error: "No autenticado." }, 401);
  if (!can(session.role, "users:manage")) return json({ error: "Acceso no autorizado." }, 403);
  const auth = adminAuth();
  if (!auth) return json({ error: "La gestión de usuarios no está configurada en el servidor." }, 503);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role;
  if (!fullName) return json({ error: "El nombre completo es obligatorio." }, 422);
  if (!EMAIL_RE.test(email)) return json({ error: "Ingresá un correo válido." }, 422);
  if (password.length < 8) return json({ error: "Usá al menos 8 caracteres." }, 422);
  if (!isStaffRole(role)) return json({ error: "Ese rol no se puede asignar." }, 422);
  if (isSuperAdminEmail(email)) return json({ error: "Ya existe un usuario con este correo." }, 409);

  try {
    const created = await auth.createUser({
      email,
      password,
      displayName: fullName,
      disabled: body.active === false,
    });
    await auth.setCustomUserClaims(created.uid, { role });
    const fresh = await auth.getUser(created.uid);
    return json({ user: toStaffUser(fresh) }, 201);
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "auth/email-already-exists") {
      return json({ error: "Ya existe un usuario con este correo." }, 409);
    }
    console.error("[users] create failed:", error);
    return json({ error: "No pudimos crear el usuario." }, 500);
  }
}
