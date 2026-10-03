"use client";

import { useState } from "react";

const WHATSAPP = "59842771234";

const INTERESTS = ["Comprar", "Vender", "Inversión", "Alquiler de temporada"] as const;

const labelClass = "text-xs uppercase tracking-luxury text-ink-muted";
const fieldClass =
  "border border-hairline bg-surface px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink-muted focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-ink disabled:opacity-60";
const buttonClass =
  "inline-flex min-h-11 items-center justify-center border border-ink/30 px-8 text-xs uppercase tracking-luxury transition-colors hover:bg-ink hover:text-surface active:bg-ink/90 active:text-surface disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink";

type Status = "idle" | "loading" | "sent" | "error";

export function ContactForm({ propertyTitle }: { propertyTitle?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    interest: INTERESTS[0] as string,
    message: propertyTitle ? `Consulta sobre propiedad: ${propertyTitle}` : "",
  });

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          intent: form.interest,
          message: form.message,
          source: "contact-form",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No pudimos registrar su consulta. Intente de nuevo.");
      }
      setStatus("sent");

      const text =
        `Hola, mi nombre es ${form.name}.\n` +
        `Me interesa: ${form.interest}.\n` +
        (propertyTitle ? `Propiedad: ${propertyTitle}\n` : "") +
        (form.message ? `Mensaje: ${form.message}` : "");
      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos registrar su consulta.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="flex flex-col gap-4 border border-hairline bg-surface p-8">
        <h3 className="font-display text-2xl font-normal tracking-tight">Consulta recibida</h3>
        <p className="max-w-md text-sm leading-relaxed text-ink-muted">
          Registramos sus datos y abrimos WhatsApp para continuar la conversación al instante.
        </p>
        <button type="button" onClick={() => setStatus("idle")} className={`${buttonClass} self-start`}>
          Enviar otra consulta
        </button>
      </div>
    );
  }

  const loading = status === "loading";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Nombre y apellido</span>
        <input type="text" name="nombre" autoComplete="name" required disabled={loading} value={form.name} onChange={set("name")} className={fieldClass} />
      </label>
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Email</span>
        <input type="email" name="email" autoComplete="email" required disabled={loading} value={form.email} onChange={set("email")} className={fieldClass} />
      </label>
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Teléfono / WhatsApp</span>
        <input type="tel" name="telefono" autoComplete="tel" required disabled={loading} value={form.phone} onChange={set("phone")} placeholder="+598 99 123 456" className={fieldClass} />
      </label>
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Interés principal</span>
        <select name="interes" disabled={loading} value={form.interest} onChange={set("interest")} className={fieldClass}>
          {INTERESTS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Mensaje</span>
        <textarea name="mensaje" rows={4} disabled={loading} value={form.message} onChange={set("message")} className={`${fieldClass} resize-none`} />
      </label>
      {status === "error" && (
        <p role="alert" className="text-sm text-ink">
          {error}
        </p>
      )}
      <button type="submit" disabled={loading} className={`${buttonClass} mt-2`}>
        {loading ? "Enviando…" : "Enviar y abrir WhatsApp"}
      </button>
    </form>
  );
}
