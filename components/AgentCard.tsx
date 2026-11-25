"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { MessageCircle, Phone } from "lucide-react";

const actionClass =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-blue-800 px-5 py-3 text-sm uppercase tracking-luxury text-blue-800 transition-colors duration-200 hover:bg-blue-800 hover:text-white active:bg-blue-900 active:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink dark:border-blue-100 dark:text-blue-100 dark:hover:bg-blue-100/15";

/** "+598 99 123 456" -> "59899123456" (wa.me) */
const waDigits = (phone: string) => phone.replace(/\D/g, "");
/** "+598 99 123 456" -> "+59899123456" (tel:) */
const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/**
 * The agency as the sales agent: logo, name and direct WhatsApp / call links.
 * Each tap is recorded as a consulta via a beacon, so logging never delays or
 * blocks opening WhatsApp / the dialer.
 */
export function AgentCard({
  name,
  logos,
  whatsapp,
  phone,
  propertyId,
  propertyTitle,
  children,
}: {
  name: string;
  /** Light/dark-background logo URLs; empty strings when none is uploaded. */
  logos: { light: string; dark: string };
  /** WhatsApp number as entered in settings, e.g. "+598 99 000 000". */
  whatsapp: string;
  /** Phone for calls, as entered in settings. */
  phone: string;
  propertyId: string;
  propertyTitle: string;
  /** Extra action placed last in the button row at double width (the Email button). */
  children?: ReactNode;
}) {
  const record = (channel: "whatsapp" | "call") => {
    const body = JSON.stringify({ propertyId, channel });
    const sent =
      typeof navigator.sendBeacon === "function" &&
      navigator.sendBeacon("/api/leads/contact", new Blob([body], { type: "application/json" }));
    if (!sent) {
      void fetch("/api/leads/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  };

  const text = `Hola ${name}, me interesa la propiedad "${propertyTitle}" (Ref. ${propertyId}). ¿Me pueden dar más información?`;

  return (
    <section
      aria-label="Agente de ventas"
      className="mt-8 flex flex-col gap-5 border border-hairline p-5 dark:border-white/10"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-hairline bg-surface dark:border-white/10 dark:bg-white/5">
          {logos.light ? (
            <>
              <Image src={logos.light} alt="" width={48} height={48} className="size-11 object-contain dark:hidden" />
              <Image src={logos.dark} alt="" width={48} height={48} className="hidden size-11 object-contain dark:block" />
            </>
          ) : (
            <span aria-hidden className="font-display text-xl text-blue-800 dark:text-blue-100">
              {name.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-luxury text-ink-muted dark:text-white/75">Agente de ventas</p>
          <p className="mt-1 truncate font-display text-xl text-ink dark:text-white">{name}</p>
          {phone ? (
            <a
              href={telHref(phone)}
              onClick={() => record("call")}
              className="mt-0.5 inline-block text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink dark:text-white/75 dark:hover:text-white"
            >
              {phone}
            </a>
          ) : null}
        </div>
      </div>

      {/* WhatsApp and Llamar take one column each; Email (children) spans two. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {whatsapp ? (
          <a
            href={`https://wa.me/${waDigits(whatsapp)}?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => record("whatsapp")}
            className={actionClass}
          >
            <MessageCircle size={18} aria-hidden />
            WhatsApp
          </a>
        ) : null}
        {phone ? (
          <a href={telHref(phone)} onClick={() => record("call")} className={actionClass}>
            <Phone size={18} aria-hidden />
            Llamar
          </a>
        ) : null}
        {children ? <div className="col-span-2 grid">{children}</div> : null}
      </div>
    </section>
  );
}
