"use client";

import { MessageCircle } from "lucide-react";

export const OPEN_CONCIERGE_EVENT = "open-concierge";

/** Opens the A-Gente concierge panel from anywhere on the page. */
export function ConciergeButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONCIERGE_EVENT))}
      className={className}
    >
      <MessageCircle className="size-4" aria-hidden />
      Conversar con su conserje
    </button>
  );
}
