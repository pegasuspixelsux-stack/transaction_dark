"use client";

import type { DragEvent } from "react";
import { GripVertical, MessageCircle, Phone } from "lucide-react";
import type { Lead, LeadOutcome, LeadStage, SessionUser } from "@/types/admin";
import { LEAD_STAGES } from "@/types/admin";
import { STAGE_LABELS } from "@/lib/admin/stages";
import { formatDate, telLink, whatsappLink } from "@/lib/admin/utils";
import { cn } from "@/lib/utils";
import { inputClass } from "./ui";

const iconLink =
  "inline-flex size-11 items-center justify-center rounded-lg border border-admin-line text-admin-muted transition-colors duration-200 hover:bg-admin-panel-strong hover:text-admin-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent active:bg-admin-panel";

interface LeadCardProps {
  lead: Lead;
  agents: SessionUser[];
  agentName: string;
  canMove: boolean;
  canReassign: boolean;
  dragging: boolean;
  onMove: (stage: LeadStage) => void;
  onOutcome: (outcome: LeadOutcome) => void;
  onReassign: (agentId: string | null) => void;
  onDragStart: (e: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}

export function LeadCard({
  lead,
  agents,
  agentName,
  canMove,
  canReassign,
  dragging,
  onMove,
  onOutcome,
  onReassign,
  onDragStart,
  onDragEnd,
}: LeadCardProps) {
  const greeting = `Hola ${lead.name.split(" ")[0]}, te escribimos de Transaction${
    lead.propertyTitle ? ` por ${lead.propertyTitle}` : " por tu consulta"
  }.`;

  return (
    <article
      draggable={canMove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      aria-label={`Consulta de ${lead.name}`}
      className={cn(
        "rounded-xl border border-admin-line bg-white p-4 transition-[opacity,border-color] duration-200 hover:border-slate-400",
        canMove && "cursor-grab active:cursor-grabbing",
        dragging && "opacity-40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm text-admin-ink">
            {lead.name}
            {lead.qualified ? (
              <span className="ml-2 border border-admin-ok px-1.5 py-0.5 text-[10px] uppercase tracking-luxury text-admin-ok">
                Calificado
              </span>
            ) : null}
          </h3>
          <p className="truncate text-sm text-admin-muted">{lead.phone}</p>
        </div>
        {canMove ? (
          <GripVertical aria-hidden className="mt-1 size-4 shrink-0 text-admin-muted" />
        ) : null}
      </div>

      <dl className="mt-3 space-y-1 text-sm">
        <div>
          <dt className="sr-only">Interesado en</dt>
          <dd className="text-admin-ink">{lead.propertyTitle || "Consulta general"}</dd>
        </div>
        {lead.message ? (
          <div className="text-admin-muted">
            <dt className="sr-only">Mensaje</dt>
            <dd className="line-clamp-3 whitespace-pre-line">{lead.message}</dd>
          </div>
        ) : null}
        <div className="text-admin-muted">
          <dt className="sr-only">Origen y fecha</dt>
          <dd>
            {lead.source} · {formatDate(lead.createdAt)}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center gap-2">
        <a href={telLink(lead.phone)} aria-label={`Llamar a ${lead.name}`} title="Llamar" className={iconLink}>
          <Phone className="size-4" aria-hidden />
        </a>
        <a
          href={whatsappLink(lead.phone, greeting)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp a ${lead.name}`}
          title="WhatsApp"
          className={iconLink}
        >
          <MessageCircle className="size-4" aria-hidden />
        </a>
        {lead.stage === "closed" ? (
          <div role="group" aria-label="Resultado" className="ml-auto flex gap-1">
            {(["won", "lost"] as const).map((o) => (
              <button
                key={o}
                type="button"
                disabled={!canMove}
                aria-pressed={lead.outcome === o}
                onClick={() => onOutcome(o)}
                className={cn(
                  "min-h-11 rounded-lg border px-3 text-xs uppercase tracking-luxury transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent disabled:cursor-not-allowed disabled:opacity-40",
                  lead.outcome === o
                    ? o === "won"
                      ? "border-admin-ok/50 bg-admin-ok/15 text-admin-ok"
                      : "border-admin-bad/50 bg-admin-bad/15 text-admin-bad"
                    : "border-admin-line text-admin-muted hover:bg-admin-panel-strong",
                )}
              >
                {o === "won" ? "Ganada" : "Perdida"}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-3 space-y-2">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-luxury text-admin-ink">
            Etapa
          </span>
          <select
            value={lead.stage}
            disabled={!canMove}
            onChange={(e) => onMove(e.target.value as LeadStage)}
            className={inputClass}
          >
            {LEAD_STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABELS[s]}
              </option>
            ))}
          </select>
        </label>

        {canReassign ? (
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-luxury text-admin-ink">
              Agente asignado
            </span>
            <select
              value={lead.assignedAgentId ?? ""}
              onChange={(e) => onReassign(e.target.value || null)}
              className={inputClass}
            >
              <option value="">Sin asignar</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="text-sm text-admin-muted">
            Agente: <span className="text-admin-ink">{agentName}</span>
          </p>
        )}
      </div>
    </article>
  );
}
