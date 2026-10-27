"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { readSiteConfig } from "@/lib/server/config-store";
import { createLead } from "@/lib/server/lead-store";
import { allowRequest } from "@/lib/server/rate-limit";

export interface EmailInquiryInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  propertyId: string;
  propertyTitle: string;
  /** Honeypot: real visitors never see or fill this. */
  website?: string;
}

export type EmailInquiryResult = { ok: true } | { ok: false; error: string };

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const escapeHtml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Logs the inquiry as a lead (dashboard / Consultas) and forwards it to the agency inbox. */
export async function sendEmailInquiry(input: EmailInquiryInput): Promise<EmailInquiryResult> {
  if (str(input.website, 100)) return { ok: true }; // bot: pretend success

  const name = str(input.name, 100);
  const email = str(input.email, 120);
  const subject = str(input.subject, 150).replace(/\s+/g, " ");
  const message = str(input.message, 2000);
  const propertyId = str(input.propertyId, 60);
  const propertyTitle = str(input.propertyTitle, 120);

  if (!name || !EMAIL_RE.test(email) || !subject || !message) {
    return { ok: false, error: "Completá nombre, un email válido, asunto y mensaje." };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!(await allowRequest(`email-inquiry:${ip}`, 5, 10 * 60 * 1000))) {
    return { ok: false, error: "Demasiadas consultas seguidas. Probá de nuevo en unos minutos." };
  }

  try {
    await createLead({
      name,
      phone: "",
      email,
      propertyId: propertyId || null,
      propertyTitle,
      source: "property-email",
      intent: "",
      message: `${subject}\n${message}`,
    });
  } catch (error) {
    console.error("[email-inquiry] failed to save lead:", error);
    return { ok: false, error: "No pudimos registrar tu consulta. Probá de nuevo." };
  }

  // The lead is already saved; a delivery problem should not look like a lost inquiry.
  try {
    const key = process.env.RESEND_API_KEY;
    const to = (await readSiteConfig()).contact.emails[0];
    if (!key || !to) throw new Error(!key ? "RESEND_API_KEY is not set" : "no notification email configured");
    const { error } = await new Resend(key).emails.send({
      from: process.env.LEADS_FROM_EMAIL ?? "Consultas web <onboarding@resend.dev>",
      to,
      replyTo: email,
      subject,
      text: `De: ${name} <${email}>\nPropiedad: ${propertyTitle} (Ref. ${propertyId})\n\n${message}`,
      html:
        `<p><strong>De:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;<br>` +
        `<strong>Propiedad:</strong> ${escapeHtml(propertyTitle)} (Ref. ${escapeHtml(propertyId)})</p>` +
        `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    console.error("[email-inquiry] email not delivered:", error);
  }

  return { ok: true };
}
