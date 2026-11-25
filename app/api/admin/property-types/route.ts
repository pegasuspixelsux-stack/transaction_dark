import { NextResponse } from "next/server";
import { can } from "@/lib/admin/rbac";
import { normalizeTypeId, parsePropertyTypes } from "@/lib/property-types";
import { getServerSession, sameOrigin } from "@/lib/server/admin-session";
import { readPropertyTypes, writePropertyTypes } from "@/lib/server/property-type-store";
import { readProperties } from "@/lib/server/property-store";

const noStore = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStore });

/** Any signed-in staff member can read types (the property form and dashboard need them). */
export async function GET() {
  const session = await getServerSession();
  if (!session) return json({ error: "No autenticado." }, 401);
  return json({ types: await readPropertyTypes() });
}

/** Replace the whole list (order = display order). Removing a type that properties use is refused. */
export async function PUT(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Origen no permitido." }, 403);
  const session = await getServerSession();
  if (!session) return json({ error: "No autenticado." }, 401);
  if (!can(session.role, "properties:write")) return json({ error: "No tenés permiso para editar tipos." }, 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }

  const parsed = parsePropertyTypes((body as { types?: unknown } | null)?.types);
  if (!parsed.ok) return json({ error: parsed.errors._ ?? "Revisá los campos marcados.", errors: parsed.errors }, 422);
  const next = parsed.value;

  const [current, properties] = await Promise.all([readPropertyTypes(), readProperties()]);
  const nextIds = new Set(next.map((t) => t.id));
  const inUse = current.filter(
    (t) => !nextIds.has(t.id) && properties.some((p) => normalizeTypeId(p.propertyType) === t.id),
  );
  if (inUse.length) {
    return json(
      {
        error: `No se puede eliminar ${inUse.map((t) => t.label).join(", ")}: hay propiedades de ese tipo. Cambialas de tipo primero.`,
      },
      409,
    );
  }

  try {
    await writePropertyTypes(next);
  } catch (error) {
    console.error("[property-types] failed to save:", error);
    return json({ error: "No pudimos guardar los tipos en el servidor." }, 500);
  }
  return json({ types: next });
}
