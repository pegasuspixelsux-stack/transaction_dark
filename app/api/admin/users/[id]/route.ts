import { NextResponse } from "next/server";
import { can } from "@/lib/admin/rbac";
import {
  getServerSession,
  isStaffRole,
  isSuperAdminEmail,
  sameOrigin,
  superAdminEmail,
} from "@/lib/server/admin-session";
import { adminAuth } from "@/lib/server/firebase-admin";
import { EMAIL_RE, listStaff, toStaffUser } from "@/lib/server/staff-users";

const noStore = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStore });

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return json({ error: "Origen no permitido." }, 403);
  const session = await getServerSession();
  if (!session) return json({ error: "No autenticado." }, 401);
  if (!can(session.role, "users:manage")) return json({ error: "Acceso no autorizado." }, 403);
  const auth = adminAuth();
  if (!auth) return json({ error: "La gestión de usuarios no está configurada en el servidor." }, 503);

  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }

  try {
    const target = await auth.getUser(id).catch(() => null);
    // Non-staff and the super admin are invisible here: same answer as "missing".
    const current = target ? toStaffUser(target) : null;
    if (!target || !current) return json({ error: "No se encontró el usuario." }, 404);

    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : current.fullName;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : current.email;
    const password = typeof body.password === "string" && body.password ? body.password : undefined;
    const role = body.role === undefined ? current.role : body.role;
    const active = typeof body.active === "boolean" ? body.active : current.active;

    if (!fullName) return json({ error: "El nombre completo es obligatorio." }, 422);
    if (!EMAIL_RE.test(email)) return json({ error: "Ingresá un correo válido." }, 422);
    if (password !== undefined && password.length < 8) return json({ error: "Usá al menos 8 caracteres." }, 422);
    if (!isStaffRole(role)) return json({ error: "Ese rol no se puede asignar." }, 422);
    if (isSuperAdminEmail(email)) return json({ error: "Ya existe un usuario con este correo." }, 409);
    if (id === session.sub && !active) {
      return json({ error: "No podés desactivar tu propia cuenta." }, 400);
    }

    // Never leave the system without an active admin (the env super admin counts).
    const losesAdmin = current.role === "admin" && current.active && (role !== "admin" || !active);
    if (losesAdmin && !superAdminEmail()) {
      const others = (await listStaff()).filter((u) => u.id !== id && u.role === "admin" && u.active);
      if (others.length === 0) return json({ error: "Se requiere al menos un administrador activo." }, 409);
    }

    await auth.updateUser(id, {
      displayName: fullName,
      email,
      disabled: !active,
      ...(password ? { password } : {}),
    });
    if (role !== current.role) await auth.setCustomUserClaims(id, { role });
    // Role/disable/password changes must take effect on existing sessions.
    if (role !== current.role || !active || password) await auth.revokeRefreshTokens(id);

    return json({ user: toStaffUser(await auth.getUser(id)) });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "auth/email-already-exists") {
      return json({ error: "Ya existe un usuario con este correo." }, 409);
    }
    console.error("[users] update failed:", error);
    return json({ error: "No pudimos actualizar el usuario." }, 500);
  }
}
