import { NextResponse } from "next/server";
import { can } from "@/lib/admin/rbac";
import { getServerSession, sameOrigin } from "@/lib/server/admin-session";
import { saveIntoCatalog } from "@/lib/server/property-input";
import { readProperties, writeProperties } from "@/lib/server/property-store";

const noStore = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStore });

export async function GET() {
  const session = await getServerSession();
  if (!session) return json({ error: "No autenticado." }, 401);
  const all = await readProperties();
  const properties = can(session.role, "properties:view-all")
    ? all
    : all.filter((p) => p.assignedAgentId === session.sub);
  return json({ properties });
}

/** Create or update one property (`id` present = update). */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Origen no permitido." }, 403);
  const session = await getServerSession();
  if (!session) return json({ error: "No autenticado." }, 401);
  if (!can(session.role, "properties:write")) return json({ error: "No tenés permiso para editar propiedades." }, 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }

  const result = saveIntoCatalog(await readProperties(), body);
  if (!result.ok) return json({ error: result.error }, result.status);
  try {
    await writeProperties(result.properties);
  } catch (error) {
    console.error("[properties] failed to save:", error);
    return json({ error: "No pudimos guardar la propiedad en el servidor." }, 500);
  }
  return json({ property: result.property, properties: result.properties });
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
