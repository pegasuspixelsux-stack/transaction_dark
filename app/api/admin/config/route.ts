import { NextResponse } from "next/server";
import { can } from "@/lib/admin/rbac";
import { parseSiteConfig } from "@/lib/site-config";
import { getServerSession, sameOrigin } from "@/lib/server/admin-session";
import { readSiteConfig, writeSiteConfig } from "@/lib/server/config-store";

const noStore = { "Cache-Control": "no-store" };

/** admin and superadmin only (permission `config:manage`). */
async function authorize() {
  const session = await getServerSession();
  if (!session) {
    return { error: NextResponse.json({ error: "No autenticado." }, { status: 401, headers: noStore }) };
  }
  if (!can(session.role, "config:manage")) {
    return { error: NextResponse.json({ error: "Acceso no autorizado." }, { status: 403, headers: noStore }) };
  }
  return { session };
}

export async function GET() {
  const auth = await authorize();
  if (auth.error) return auth.error;
  return NextResponse.json({ config: await readSiteConfig() }, { headers: noStore });
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }
  const auth = await authorize();
  if (auth.error) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const parsed = parseSiteConfig(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Revisá los campos marcados.", errors: parsed.errors },
      { status: 422, headers: noStore },
    );
  }

  try {
    await writeSiteConfig(parsed.value);
  } catch (error) {
    console.error("[config] failed to save:", error);
    return NextResponse.json(
      { error: "No pudimos guardar la configuración en el servidor." },
      { status: 500, headers: noStore },
    );
  }
  return NextResponse.json({ config: parsed.value }, { headers: noStore });
}
