import { NextResponse } from "next/server";
import { can } from "@/lib/admin/rbac";
import { getServerSession, sameOrigin } from "@/lib/server/admin-session";
import { readProperties, writeProperties } from "@/lib/server/property-store";
import { readZones, writeZones } from "@/lib/server/zone-store";
import { parseZones } from "@/lib/zones";

const noStore = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStore });

/** Any signed-in staff member can read zones (the property form needs them). */
export async function GET() {
  const session = await getServerSession();
  if (!session) return json({ error: "No autenticado." }, 401);
  return json({ zones: await readZones() });
}

/**
 * Replace the whole list (order = display order). Renaming a zone renames it on
 * every property; removing a zone that properties still use is refused.
 */
export async function PUT(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Origen no permitido." }, 403);
  const session = await getServerSession();
  if (!session) return json({ error: "No autenticado." }, 401);
  if (!can(session.role, "properties:write")) return json({ error: "No tenés permiso para editar zonas." }, 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }

  const parsed = parseZones((body as { zones?: unknown } | null)?.zones);
  if (!parsed.ok) return json({ error: parsed.errors._ ?? "Revisá los campos marcados.", errors: parsed.errors }, 422);
  const next = parsed.value;

  const [current, properties] = await Promise.all([readZones(), readProperties()]);
  const nextById = new Map(next.map((z) => [z.id, z]));

  const renames = new Map<string, string>();
  const removed: string[] = [];
  for (const zone of current) {
    const after = nextById.get(zone.id);
    if (!after) removed.push(zone.name);
    else if (after.name !== zone.name) renames.set(zone.name, after.name);
  }

  const nextNames = new Set(next.map((z) => z.name));
  const inUse = removed.filter((name) => !nextNames.has(name) && properties.some((p) => p.zone === name));
  if (inUse.length) {
    return json(
      { error: `No se puede eliminar ${inUse.join(", ")}: hay propiedades en esa zona. Cambialas de zona primero.` },
      409,
    );
  }

  try {
    if (renames.size) {
      await writeProperties(
        properties.map((p) => (p.zone && renames.has(p.zone) ? { ...p, zone: renames.get(p.zone)! } : p)),
      );
    }
    await writeZones(next);
  } catch (error) {
    console.error("[zones] failed to save:", error);
    return json({ error: "No pudimos guardar las zonas en el servidor." }, 500);
  }
  return json({ zones: next });
}
