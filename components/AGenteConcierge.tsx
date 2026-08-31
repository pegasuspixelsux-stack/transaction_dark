"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { Trident } from "@/components/Trident";

type Step = "intent" | "asset" | "zone" | "form" | "done";

const INTENT = ["Inversión patrimonial", "Residencia permanente", "Casa vacacional"];
const ASSET = ["Residencia / Casa", "Finca en chacra", "Penthouse / Apartamento"];
const ZONE = ["José Ignacio", "Manantiales", "La Barra", "Península", "Mansa"];
const BEST_TIMES = ["Mañana", "Mediodía", "Tarde", "Noche"];

const ASSET_TIPO: Record<string, string> = {
  "Residencia / Casa": "house",
  "Finca en chacra": "house,land",
  "Penthouse / Apartamento": "penthouse,apartment",
};

const QUESTION: Record<"intent" | "asset" | "zone", string> = {
  intent: "¿Qué te trae por aquí hoy?",
  asset: "¿Qué tipo de propiedad buscás?",
  zone: "¿Qué zona de la costa uruguaya preferís?",
};

const SEEN_KEY = "agente-concierge-seen";
const WHATSAPP = "59842771234";

const fieldClass =
  "w-full border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none transition-colors placeholder:text-white/40 focus-visible:border-white/50";
const labelClass = "text-[0.7rem] uppercase tracking-[0.18em] text-white/50";
const backClass =
  "text-[0.7rem] uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-white/80";

export function AGenteConcierge() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("intent");
  const [answers, setAnswers] = useState<{
    intent?: string;
    asset?: string;
    zone?: string;
  }>({});
  const [form, setForm] = useState({ name: "", phone: "", bestTime: BEST_TIMES[0] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* storage unavailable */
    }
    if (seen) return;
    const t = window.setTimeout(() => setOpen(true), 1500);
    return () => window.clearTimeout(t);
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function pick(key: "intent" | "asset" | "zone", value: string) {
    setAnswers((a) => ({ ...a, [key]: value }));
    setStep(key === "intent" ? "asset" : key === "asset" ? "zone" : "form");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...answers, ...form }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "No pudimos registrar tu consulta.");
      }
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    } finally {
      setSubmitting(false);
    }
  }

  const curatedHref = `/propiedades?${new URLSearchParams({
    ...(answers.zone ? { zona: answers.zone } : {}),
    ...(answers.asset && ASSET_TIPO[answers.asset]
      ? { tipo: ASSET_TIPO[answers.asset] }
      : {}),
  }).toString()}`;

  const waMessage = `Hola, soy ${form.name || "—"}. Busco una propiedad para ${
    answers.intent ?? "—"
  } en ${answers.zone ?? "—"} (${answers.asset ?? "—"}). Mi teléfono es ${
    form.phone || "—"
  } y prefiero que me contacten en el horario de ${form.bestTime}.`;
  const waHref = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waMessage)}`;

  const optionStep = step === "intent" || step === "asset" || step === "zone";
  const dotIndex = step === "intent" ? 0 : step === "asset" ? 1 : 2;

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="trigger"
            type="button"
            onClick={() => setOpen(true)}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#0d0d0d] px-5 py-3.5 text-[#f5f5f0] shadow-[0_10px_40px_rgba(0,0,0,0.28)] transition-colors hover:bg-[#161616] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
            aria-label="Abrir el asistente AGENTE"
          >
            <Trident className="size-4 text-sky-400" />
            <span className="text-[0.7rem] uppercase tracking-[0.24em]">AGENTE</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            role="dialog"
            aria-label="Asistente AGENTE"
            className="fixed bottom-6 right-6 z-50 flex w-[calc(100vw-3rem)] max-w-sm origin-bottom-right flex-col border border-white/10 bg-[#0b0b0b] text-[#f5f5f0] shadow-[0_20px_70px_rgba(0,0,0,0.4)]"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Trident className="size-4 text-sky-400" />
                <span className="text-[0.7rem] uppercase tracking-[0.26em] text-white/70">
                  AGENTE
                </span>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Cerrar"
                className="-m-2 p-2 text-white/50 transition-colors hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </header>

            <div className="max-h-[62vh] overflow-y-auto px-5 py-5">
              {optionStep && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`h-1 w-6 ${i <= dotIndex ? "bg-sky-400" : "bg-white/15"}`}
                      />
                    ))}
                  </div>
                  <p className="font-display text-lg leading-snug tracking-tight">
                    {QUESTION[step]}
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {(step === "intent" ? INTENT : step === "asset" ? ASSET : ZONE).map(
                      (opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => pick(step, opt)}
                          className="border border-white/15 px-4 py-3 text-left text-sm transition-colors hover:border-white/45 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                        >
                          {opt}
                        </button>
                      ),
                    )}
                  </div>
                  {step !== "intent" && (
                    <button
                      type="button"
                      onClick={() => setStep(step === "asset" ? "intent" : "asset")}
                      className={`self-start ${backClass}`}
                    >
                      ← Volver
                    </button>
                  )}
                </div>
              )}

              {step === "form" && (
                <form onSubmit={submit} className="flex flex-col gap-4">
                  <p className="font-display text-lg leading-snug tracking-tight">
                    Un asesor privado te contacta
                  </p>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelClass}>Nombre</span>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      autoComplete="name"
                      className={fieldClass}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelClass}>WhatsApp / Teléfono</span>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      autoComplete="tel"
                      className={fieldClass}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelClass}>Mejor horario para contactarte</span>
                    <select
                      value={form.bestTime}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, bestTime: e.target.value }))
                      }
                      className={fieldClass}
                    >
                      {BEST_TIMES.map((t) => (
                        <option key={t} value={t} className="bg-[#0b0b0b]">
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>

                  {error && <p className="text-xs text-red-400">{error}</p>}

                  <div className="flex items-center gap-4 pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex min-h-11 flex-1 items-center justify-center border border-white/50 px-6 text-[0.7rem] uppercase tracking-[0.2em] transition-colors hover:bg-[#f5f5f0] hover:text-[#0b0b0b] disabled:opacity-50 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                    >
                      {submitting ? "Enviando…" : "Enviar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("zone")}
                      className={backClass}
                    >
                      ← Volver
                    </button>
                  </div>
                </form>
              )}

              {step === "done" && (
                <div className="flex flex-col gap-4">
                  <Trident className="size-6 text-sky-400" />
                  <p className="font-display text-lg leading-snug tracking-tight">
                    Gracias, {form.name.split(" ")[0] || "hola"}.
                  </p>
                  <p className="text-sm leading-relaxed text-white/70">
                    Recibimos tu consulta. Un asesor privado de Oceanus te va a
                    escribir en breve. Si querés, seguimos la conversación ahora
                    mismo por WhatsApp.
                  </p>
                  <div className="flex flex-col gap-2.5 pt-1">
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center bg-[#f5f5f0] px-6 text-[0.7rem] uppercase tracking-[0.2em] text-[#0b0b0b] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                    >
                      Continuar por WhatsApp
                    </a>
                    <Link
                      href={curatedHref}
                      onClick={dismiss}
                      className="inline-flex min-h-11 items-center justify-center border border-white/40 px-6 text-[0.7rem] uppercase tracking-[0.2em] transition-colors hover:border-white/70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                    >
                      Ver una selección para vos
                    </Link>
                    <button type="button" onClick={dismiss} className={`self-center ${backClass}`}>
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
