"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Mail, MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Channel = "whatsapp" | "email";

interface PropertyInquiryActionsProps {
  propertyId: string;
  propertyTitle: string;
  /** wa.me format, digits only. */
  whatsapp: string;
  email: string;
}

const actionClass =
  "inline-flex min-h-11 items-center gap-2 border border-blue-800 dark:border-blue-100 px-6 py-3 text-sm uppercase tracking-luxury text-blue-800 dark:text-blue-100 transition-colors duration-200 hover:bg-blue-800 hover:text-white dark:hover:bg-blue-100/15 active:bg-blue-900 active:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink";
const labelClass = "text-xs uppercase tracking-luxury text-ink-muted";
const fieldClass =
  "min-h-11 border border-hairline bg-surface px-4 py-3 text-sm text-ink transition-colors duration-200 placeholder:text-ink-muted hover:border-ink/40 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-ink disabled:opacity-60 dark:bg-white/5";
const submitClass =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-ink/30 px-8 text-xs uppercase tracking-luxury transition-colors duration-200 hover:bg-ink hover:text-surface active:bg-ink/90 active:text-surface disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink";

/**
 * Email / WhatsApp buttons for a property. Each opens a short form first so the
 * inquiry is saved as a lead; only after it is stored do we open the channel.
 */
export function PropertyInquiryActions({
  propertyId,
  propertyTitle,
  whatsapp,
  email,
}: PropertyInquiryActionsProps) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    website: "", // honeypot: real visitors never see or fill this
  });

  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const open = channel !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function show(next: Channel, trigger: HTMLElement) {
    triggerRef.current = trigger;
    setError("");
    setChannel(next);
  }

  function close() {
    if (loading) return;
    setChannel(null);
    triggerRef.current?.focus();
  }

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!channel || loading) return;
    setLoading(true);
    setError("");

    // Browsers block window.open() after an await, so reserve the tab inside the click.
    const tab = channel === "whatsapp" ? window.open("", "_blank") : null;
    if (tab) tab.opener = null;

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          message: form.message,
          source: channel === "whatsapp" ? "property-whatsapp" : "property-email",
          propertyId,
          propertyTitle,
          website: form.website,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No pudimos registrar tu consulta. Probá de nuevo.");
      }

      const body =
        `Hola, mi nombre es ${form.name}.\n` +
        `Propiedad: ${propertyTitle} (Ref. ${propertyId})\n` +
        (form.message ? `Mensaje: ${form.message}` : "");

      if (channel === "whatsapp") {
        const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(body)}`;
        if (tab) tab.location.href = url;
        else window.location.href = url;
      } else {
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Consulta sobre ${propertyTitle}`)}&body=${encodeURIComponent(body)}`;
      }
      setForm((f) => ({ ...f, message: "", website: "" }));
      setChannel(null);
    } catch (err) {
      tab?.close();
      setError(err instanceof Error ? err.message : "No pudimos registrar tu consulta.");
    } finally {
      setLoading(false);
    }
  }

  const isWhatsapp = channel === "whatsapp";

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-4">
        <button type="button" onClick={(e) => show("email", e.currentTarget)} className={actionClass}>
          <Mail size={18} aria-hidden />
          Email
        </button>
        <button type="button" onClick={(e) => show("whatsapp", e.currentTarget)} className={actionClass}>
          <MessageCircle size={18} aria-hidden />
          WhatsApp
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setChannel(null)}
        onCancel={(e) => {
          if (loading) e.preventDefault();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto border border-hairline bg-surface p-0 text-ink backdrop:bg-ink/60 dark:bg-[#0a1a2e]"
      >
        {open ? (
          <div className="p-6 sm:p-8">
            <div className="mb-2 flex items-start justify-between gap-4">
              <h2 id={titleId} className="font-display text-2xl font-normal tracking-tight">
                {isWhatsapp ? "Consultá por WhatsApp" : "Consultá por email"}
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar"
                className="-mr-2 -mt-2 inline-flex size-11 shrink-0 items-center justify-center text-ink-muted transition-colors duration-200 hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-ink active:opacity-70"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-ink-muted">
              Dejanos tus datos sobre <span className="text-ink">{propertyTitle}</span> y{" "}
              {isWhatsapp ? "te abrimos WhatsApp" : "abrimos tu correo"} para seguir la conversación.
            </p>

            <form onSubmit={onSubmit} className="relative flex flex-col gap-5">
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={set("website")}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              <div className="grid gap-5 sm:grid-cols-3">
                <label className="flex flex-col gap-2 sm:col-span-1">
                  <span className={labelClass}>Referencia</span>
                  <input type="text" name="referencia" readOnly value={propertyId} className={cn(fieldClass, "cursor-default")} />
                </label>
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className={labelClass}>Propiedad</span>
                  <input type="text" name="propiedad" readOnly value={propertyTitle} className={cn(fieldClass, "cursor-default")} />
                </label>
              </div>
              <label className="flex flex-col gap-2">
                <span className={labelClass}>{isWhatsapp ? "Nombre" : "Nombre y apellido"}</span>
                <input type="text" name="nombre" autoComplete="name" required disabled={loading} value={form.name} onChange={set("name")} className={fieldClass} />
              </label>
              <label className="flex flex-col gap-2">
                <span className={labelClass}>Teléfono / WhatsApp</span>
                <input type="tel" name="telefono" autoComplete="tel" required disabled={loading} value={form.phone} onChange={set("phone")} placeholder="+598 99 123 456" className={fieldClass} />
              </label>
              {isWhatsapp ? null : (
                <label className="flex flex-col gap-2">
                  <span className={labelClass}>Email</span>
                  <input type="email" name="email" autoComplete="email" required disabled={loading} value={form.email} onChange={set("email")} className={fieldClass} />
                </label>
              )}
              <label className="flex flex-col gap-2">
                <span className={labelClass}>Mensaje (opcional)</span>
                <textarea name="mensaje" rows={3} disabled={loading} value={form.message} onChange={set("message")} className={cn(fieldClass, "resize-none")} />
              </label>
              {error ? (
                <p role="alert" className="text-sm text-ink">
                  {error}
                </p>
              ) : null}
              <button type="submit" disabled={loading} className={cn(submitClass, "mt-2")}>
                {loading ? "Enviando…" : isWhatsapp ? "Continuar por WhatsApp" : "Continuar por email"}
              </button>
            </form>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
