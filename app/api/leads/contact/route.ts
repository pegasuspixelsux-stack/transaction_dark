import { NextResponse } from "next/server";
import { createLead } from "@/lib/server/lead-store";
import { readProperties } from "@/lib/server/property-store";
import { allowRequest, clientIp } from "@/lib/server/rate-limit";

const SOURCES = { whatsapp: "direct-whatsapp", call: "direct-call" } as const;

/**
 * Records a tap on the property page's direct WhatsApp / call buttons as a
 * consulta in the dashboard. Sent with navigator.sendBeacon, so it never delays
 * opening WhatsApp or the dialer.
 */
export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 2_000) {
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }
  // A visitor may tap a few times; more than this is noise or abuse.
  if (!(await allowRequest(`direct-contact:${clientIp(request)}`, 6, 10 * 60 * 1000))) {
    return NextResponse.json({ ok: true, skipped: "rate-limited" });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const propertyId = typeof body.propertyId === "string" ? body.propertyId.slice(0, 60) : "";
  const channel = body.channel === "call" ? "call" : body.channel === "whatsapp" ? "whatsapp" : null;
  if (!propertyId || !channel) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });

  const property = (await readProperties()).find((p) => p.id === propertyId && p.status === "published");
  if (!property) return NextResponse.json({ error: "No se encontró la propiedad." }, { status: 404 });

  try {
    await createLead({
      // The visitor continues in WhatsApp / the phone app, so their details aren't known here.
      name: channel === "whatsapp" ? "Contacto por WhatsApp" : "Llamada telefónica",
      phone: "",
      email: "",
      propertyId: property.id,
      propertyTitle: property.title,
      source: SOURCES[channel],
      intent: property.listingType === "rent" ? "Alquilar" : "Comprar",
      message: `El visitante tocó «${channel === "whatsapp" ? "WhatsApp" : "Llamar"}» en la ficha de la propiedad.`,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[lead] direct contact failed to save:", error);
    return NextResponse.json({ error: "No pudimos registrar el contacto." }, { status: 500 });
  }
}
