import type { LeadStage } from "@/types/admin";

export const STAGE_LABELS: Record<LeadStage, string> = {
  new: "New Inquiry",
  contacted: "Initial Contact",
  viewing: "Viewing Scheduled",
  negotiation: "Negotiation / Offer",
  closed: "Closed",
};

/** Tailwind classes for the small dot beside each stage title. */
export const STAGE_DOT: Record<LeadStage, string> = {
  new: "bg-admin-accent",
  contacted: "bg-sky-300",
  viewing: "bg-admin-warn",
  negotiation: "bg-orange-300",
  closed: "bg-admin-ok",
};
