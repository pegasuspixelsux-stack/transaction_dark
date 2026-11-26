import { NextResponse } from "next/server";
import { can } from "@/lib/admin/rbac";
import { getServerSession, sameOrigin } from "@/lib/server/admin-session";
import { saveIntoCatalog } from "@/lib/server/property-input";
import { readProperties, writeProperties } from "@/lib/server/property-store";
import { readZones } from "@/lib/server/zone-store";
import { relinkLeadsToProperty } from "@/lib/server/lead-store";
import { readPropertyTypes } from "@/lib/server/property-type-store";
import { typeIds } from "@/lib/property-types";
import { zoneNames } from "@/lib/zones";
import type { AdminProperty } from "@/types/admin";

const noStore = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStore });

type Session = NonNullable<Awaited<ReturnType<typeof getServerSession>>>;

/** Agents see every published listing plus anything assigned to them (e.g. drafts). */
const isVisibleTo = (session: Session, p: AdminProperty) =>
  can(session.role, "properties:view-all") || p.status === "published" || p.assignedAgentId === session.sub;

export async function GET() {
  const session = await getServerSession();
  if (!session) return json({ error: "No autenticado." }, 401);
  const all = await readProperties();
  return json({ properties: all.filter((p) => isVisibleTo(session, p)) });
}

/** Create or update one property (`id` present = update). */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Origen no permitido." }, 403);
  const session = await getServerSession();
  if (!session) return json({ error: "No autenticado." }, 401);
  const fullWrite = can(session.role, "properties:write");
  if (!fullWrite && !can(session.role, "properties:edit")) {
    return json({ error: "No tenés permiso para editar propiedades." }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }

  const all = await readProperties();
  if (!fullWrite) {
    // Agent edit: an existing, visible property; ID, agent and homepage flags stay as they are.
    const id = typeof body === "object" && body !== null && "id" in body ? (body as { id: unknown }).id : null;
    const existing = typeof id === "string" ? all.find((p) => p.id === id) : undefined;
    if (!existing || !isVisibleTo(session, existing)) return json({ error: "No se encontró la propiedad." }, 404);
    body = {
      ...(body as object),
      id: existing.id,
      newId: "",
      assignedAgentId: existing.assignedAgentId,
      featured: !!existing.featured,
      hero: !!existing.hero,
    };
  }

  const result = saveIntoCatalog(all, body, {
    zones: zoneNames(await readZones()),
    types: typeIds(await readPropertyTypes()),
  });
  if (!result.ok) return json({ error: result.error }, result.status);
  try {
    await writeProperties(result.properties);
  } catch (error) {
    console.error("[properties] failed to save:", error);
    return json({ error: "No pudimos guardar la propiedad en el servidor." }, 500);
  }
  if (result.renamedFrom) {
    // The property is saved; a failure here only leaves old consultas pointing at the previous ID.
    await relinkLeadsToProperty(result.renamedFrom, result.property.id).catch((error) =>
      console.error("[properties] could not re-link leads after ID change:", error),
    );
  }
  return json({
    property: result.property,
    properties: result.properties.filter((p) => isVisibleTo(session, p)),
  });
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Origen no permitido." }, 403);
  const session = await getServerSession();
  if (!session) return json({ error: "No autenticado." }, 401);
  if (!can(session.role, "properties:write")) return json({ error: "No tenés permiso para eliminar propiedades." }, 403);

  const id = new URL(request.url).searchParams.get("id");
  const all = await readProperties();
  if (!id || !all.some((p) => p.id === id)) return json({ error: "No se encontró la propiedad." }, 404);
  const properties = all.filter((p) => p.id !== id);
  try {
    await writeProperties(properties);
  } catch (error) {
    console.error("[properties] failed to delete:", error);
    return json({ error: "No pudimos eliminar la propiedad." }, 500);
  }
  return json({ properties });
}
