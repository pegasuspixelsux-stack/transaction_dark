import { NextResponse } from "next/server";
import { can } from "@/lib/admin/rbac";
import { getServerSession, sameOrigin } from "@/lib/server/admin-session";
import {
  ImportFileError,
  MAX_IMPORT_BYTES,
  applyInventoryRows,
  readInventoryRows,
} from "@/lib/server/property-import";
import { readProperties, writeProperties } from "@/lib/server/property-store";

const noStore = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStore });

/**
 * Import properties from an .xlsx upload (multipart field `file`).
 * With `commit=1` the result is saved; otherwise it is only a preview.
 * All-or-nothing: if any row has an error, nothing is saved.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Origen no permitido." }, 403);
  const session = await getServerSession();
  if (!session) return json({ error: "No autenticado." }, 401);
  if (!can(session.role, "properties:write")) {
    return json({ error: "No tenés permiso para importar propiedades." }, 403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }
  const file = form.get("file");
  if (!(file instanceof File)) return json({ error: "Seleccioná un archivo .xlsx." }, 400);
  if (!file.name.toLowerCase().endsWith(".xlsx")) return json({ error: "El archivo debe ser .xlsx." }, 400);
  if (file.size > MAX_IMPORT_BYTES) return json({ error: "El archivo supera los 2 MB." }, 413);

  let report;
  try {
    const rows = await readInventoryRows(file);
    report = applyInventoryRows(await readProperties(), rows);
  } catch (error) {
    if (error instanceof ImportFileError) return json({ error: error.message }, 422);
    console.error("[properties] import failed:", error);
    return json({ error: "No pudimos procesar el archivo." }, 500);
  }

  const { properties, ...summary } = report;
  if (summary.errors.length > 0) return json({ ...summary, saved: false });

  if (form.get("commit") !== "1") return json({ ...summary, saved: false });

  try {
    await writeProperties(properties);
  } catch (error) {
    console.error("[properties] import save failed:", error);
    return json({ error: "No pudimos guardar las propiedades en el servidor." }, 500);
  }
  return json({ ...summary, saved: true, properties });
}
