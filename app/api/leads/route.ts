import { NextResponse } from "next/server";
import { createLead } from "@/lib/server/lead-store";
import { allowRequest, clientIp } from "@/lib/server/rate-limit";

const str = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);

const SOURCES = { "contact-form": "contact-form", "a-gente-concierge": "a-gente-concierge" } as const;

const MAX_BODY_BYTES = 10_000;

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }
  // 5 submissions per IP every 10 minutes is plenty for a real visitor.
  if (!(await allowRequest(`lead:${clientIp(request)}`, 5, 10 * 60 * 1000))) {
    return NextResponse.json(
      { error: "Demasiadas consultas seguidas. Probá de nuevo en unos minutos." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  // Hidden "website" field: humans never see it, bots fill it. Pretend success.
  if (str(body.website)) return NextResponse.json({ ok: true });

  const name = str(body.name);
  const phone = str(body.phone, 60);
  if (!name || !phone) {
    return NextResponse.json({ error: "Nombre y teléfono son obligatorios." }, { status: 400 });
  }

  const source = body.source === "contact-form" ? SOURCES["contact-form"] : SOURCES["a-gente-concierge"];

  // The concierge asks several questions; fold the answers into a readable note.
  const answers = [
    ["Operación", str(body.intent, 60)],
    ["Tipo", str(body.asset, 60)],
    ["Zona", str(body.zone, 60)],
    ["Plazo", str(body.timeline, 60)],
    ["Presupuesto", str(body.budget, 60)],
    ["Dormitorios", str(body.beds, 40)],
    ["Baños", str(body.baths, 40)],
    ["Preferencia", str(body.preference, 80)],
    ["Mejor horario", str(body.bestTime, 40)],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join(" · ");
  const typed = str(body.message, 1000);

  try {
    await createLead({
      name,
      phone,
      email: str(body.email, 120),
      propertyId: str(body.propertyId, 60) || null,
      propertyTitle: str(body.propertyTitle, 120),
      source,
      intent: str(body.intent, 60),
      message: [typed, source === "a-gente-concierge" ? answers : ""].filter(Boolean).join("\n"),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[lead] failed to save:", error);
    return NextResponse.json(
      { error: "No pudimos registrar tu consulta. Probá de nuevo." },
      { status: 500 },
    );
  }
}
