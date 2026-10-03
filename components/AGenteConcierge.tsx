"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X, MessageCircle } from "lucide-react";

type Phase = "options" | "form" | "done";
type AnswerKey =
  | "intent"
  | "asset"
  | "zone"
  | "timeline"
  | "budget"
  | "beds"
  | "baths"
  | "preference";

const OPTION_STEPS: { key: AnswerKey; kicker: string; q: string; options: string[] }[] = [
  {
    key: "intent",
    kicker: "Intención",
    q: "¿Qué te trae por aquí hoy?",
    options: ["Inversión patrimonial", "Residencia permanente", "Casa vacacional"],
  },
  {
    key: "asset",
    kicker: "Tipo",
    q: "¿Qué tipo de propiedad buscás?",
    options: ["Residencia / Casa", "Finca en chacra", "Penthouse / Apartamento"],
  },
  {
    key: "zone",
    kicker: "Zona",
    q: "¿Qué zona de la costa uruguaya preferís?",
    options: ["José Ignacio", "Manantiales", "La Barra", "Península", "Mansa"],
  },
  {
    key: "timeline",
    kicker: "Horizonte",
    q: "¿Cuál es su horizonte de compra?",
    options: ["Inmediata / Ahora", "En 6 meses", "En 1 año", "Explorando opciones"],
  },
  {
    key: "budget",
    kicker: "Inversión",
    q: "¿Cuál es el rango de inversión estimado?",
    options: [
      "USD 1M — 3M",
      "USD 3M — 6M",
      "USD 6M — 10M+",
      "Consultar off-market",
    ],
  },
  {
    key: "beds",
    kicker: "Configuración deseada",
    q: "¿Cuántos dormitorios?",
    options: ["3 Dormitorios", "4 Dormitorios", "5+ Dormitorios", "Indiferente"],
  },
  {
    key: "baths",
    kicker: "Configuración deseada",
    q: "¿Cuántos baños?",
    options: ["3+ Baños", "5+ Baños", "Indiferente"],
  },
  {
    key: "preference",
    kicker: "Requisitos particulares",
    q: "¿Qué es lo que no puede faltar?",
    options: [
      "Acceso directo / Vista al mar",
      "Privacidad absoluta / Chacra",
      "Seguridad privada 24/7",
      "Arquitectura de autor",
    ],
  },
];

const BEST_TIMES = ["Mañana", "Mediodía", "Tarde", "Noche"];
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
  const [phase, setPhase] = useState<Phase>("options");
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<AnswerKey, string>>>({});
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

  const current = OPTION_STEPS[stepIdx];
  const total = OPTION_STEPS.length;

  function pick(value: string) {
    setAnswers((a) => ({ ...a, [current.key]: value }));
    if (stepIdx < total - 1) setStepIdx(stepIdx + 1);
    else setPhase("form");
  }

  function back() {
    if (phase === "form") {
      setPhase("options");
      setStepIdx(total - 1);
    } else if (stepIdx > 0) {
      setStepIdx(stepIdx - 1);
    }
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
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    } finally {
      setSubmitting(false);
    }
  }

  const waMessage = [
    `Hola, soy ${form.name || "—"}.`,
    `Busco ${answers.asset ?? "una propiedad"} para ${answers.intent ?? "—"} en ${answers.zone ?? "—"}.`,
    `Horizonte de compra: ${answers.timeline ?? "—"}. Rango de inversión: ${answers.budget ?? "—"}.`,
    `Configuración: ${answers.beds ?? "—"} / ${answers.baths ?? "—"}.`,
    `Requisito clave: ${answers.preference ?? "—"}.`,
    `Mi teléfono es ${form.phone || "—"}; prefiero que me contacten en el horario de ${form.bestTime}.`,
  ].join(" ");
  const waHref = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waMessage)}`;

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
            <MessageCircle className="size-4 text-sky-400" />
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
                <MessageCircle className="size-4 text-sky-400" />
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
              {phase === "options" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-1">
                    {OPTION_STEPS.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1 flex-1 ${i <= stepIdx ? "bg-sky-400" : "bg-white/15"}`}
                      />
                    ))}
                  </div>
                  <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/40">
                    {current.kicker} · {stepIdx + 1} / {total}
                  </p>
                  <p className="font-display text-lg leading-snug tracking-tight">
                    {current.q}
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {current.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => pick(opt)}
                        className="border border-white/15 px-4 py-3 text-left text-sm transition-colors hover:border-white/45 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {stepIdx > 0 && (
                    <button type="button" onClick={back} className={`self-start ${backClass}`}>
                      ← Volver
                    </button>
                  )}
                </div>
              )}

              {phase === "form" && (
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
                    <button type="button" onClick={back} className={backClass}>
                      ← Volver
                    </button>
                  </div>
                </form>
              )}

              {phase === "done" && (
                <div className="flex flex-col gap-4">
                  <MessageCircle className="size-6 text-sky-400" />
                  <p className="font-display text-lg leading-snug tracking-tight">
                    Gracias, {form.name.split(" ")[0] || "hola"}.
                  </p>
                  <p className="text-sm leading-relaxed text-white/70">
                    Hemos registrado sus preferencias. Un asesor privado de Transaction
                    curará una selección a su medida —&nbsp;incluyendo propiedades
                    que rara vez llegan a publicarse&nbsp;— y se pondrá en contacto
                    con usted a primera hora.
                  </p>

                  <div className="flex flex-col gap-2 pt-1">
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center bg-[#f5f5f0] px-6 text-[0.7rem] uppercase tracking-[0.2em] text-[#0b0b0b] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                    >
                      Continuar por WhatsApp
                    </a>
                    <p className="text-[0.7rem] leading-relaxed text-white/40">
                      Si escribe fuera de horario, le respondemos a primera hora del
                      día siguiente.
                    </p>
                  </div>

                  <p className="border-t border-white/10 pt-4 text-xs leading-relaxed text-white/50">
                    Su dossier queda en manos de un asesor dedicado, que revisará
                    cada criterio y le acercará una cartera pensada exclusivamente
                    para usted.
                  </p>

                  <button
                    type="button"
                    onClick={dismiss}
                    className={`self-start ${backClass}`}
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
