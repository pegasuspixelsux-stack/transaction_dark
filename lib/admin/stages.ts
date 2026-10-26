import type { LeadStage } from "@/types/admin";

export const STAGE_LABELS: Record<LeadStage, string> = {
  new: "Recién recibida",
  contacted: "Seguimiento",
  negotiation: "Negociación",
  won: "Ganada",
  closed: "Cerrada",
};

/** Tailwind classes for the small dot beside each stage title. */
export const STAGE_DOT: Record<LeadStage, string> = {
  new: "bg-admin-accent",
  contacted: "bg-sky-300",
  negotiation: "bg-orange-300",
  won: "bg-admin-ok",
  closed: "bg-slate-400",
};

/** Simplified status shown in the Consultas list (the pipeline keeps the full stages). */
export type ConsultaStatus = "new" | "contacted" | "in-progress" | "closed";

export const CONSULTA_STATUS_LABELS: Record<ConsultaStatus, string> = {
  new: "Nuevo",
  "in-progress": "En proceso",
  contacted: "Contactado",
  closed: "Cerrado",
};

export const CONSULTA_STATUS_TONE: Record<ConsultaStatus, "accent" | "warn" | "ok" | "neutral"> = {
  new: "accent",
  "in-progress": "warn",
  contacted: "ok",
  closed: "neutral",
};

export function consultaStatus(stage: LeadStage): ConsultaStatus {
  if (stage === "new") return "new";
  if (stage === "contacted") return "contacted";
  if (stage === "negotiation") return "in-progress";
  return "closed";
}
