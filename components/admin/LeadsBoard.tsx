"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAdmin } from "@/lib/admin/admin-context";
import { STAGE_DOT, STAGE_LABELS } from "@/lib/admin/stages";
import { toDateKey } from "@/lib/admin/utils";
import { LEAD_STAGES, type LeadStage } from "@/types/admin";
import { cn } from "@/lib/utils";
import { LeadCard } from "./LeadCard";
import { EmptyState, Field, PageHeader, Spinner, inputClass } from "./ui";

export function LeadsBoard() {
  const { status, leads, users, can, moveLead, setLeadOutcome, reassignLead } = useAdmin();

  const [query, setQuery] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<LeadStage | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const agents = useMemo(
    () => users.filter((u) => u.role === "agent" && u.active),
    [users],
  );
  const nameById = useMemo(
    () => new Map(users.map((u) => [u.id, u.fullName])),
    [users],
  );

  const canMove = can("leads:move");
  const canReassign = can("leads:reassign");
  const seesAll = can("leads:view-all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");
    return leads.filter((l) => {
      if (q) {
        const matchesName = l.name.toLowerCase().includes(q);
        const matchesPhone = qDigits.length > 0 && l.phone.replace(/\D/g, "").includes(qDigits);
        if (!matchesName && !matchesPhone) return false;
      }
      if (agentFilter === "unassigned" && l.assignedAgentId) return false;
      if (agentFilter !== "all" && agentFilter !== "unassigned" && l.assignedAgentId !== agentFilter) {
        return false;
      }
      const day = toDateKey(l.createdAt);
      if (from && day < from) return false;
      if (to && day > to) return false;
      return true;
    });
  }, [leads, query, agentFilter, from, to]);

  async function run(pending: Promise<{ ok: true } | { ok: false; error: string }>) {
    const result = await pending;
    setNotice(result.ok ? null : result.error);
  }

  function endDrag() {
    setDraggingId(null);
    setOverStage(null);
  }

  if (status === "loading") return <Spinner />;

  const filtersActive = Boolean(query || from || to || agentFilter !== "all");

  return (
    <div data-rise>
      <PageHeader eyebrow="Ventas" title="Pipeline de consultas" />

      <section
        aria-label="Filtros"
        className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Field label="Buscar">
          {({ id }) => (
            <div className="relative">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-admin-muted"
              />
              <input
                id={id}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nombre o teléfono"
                className={cn(inputClass, "pl-11")}
              />
            </div>
          )}
        </Field>
        {seesAll ? (
          <Field label="Agente">
            {({ id }) => (
              <select
                id={id}
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className={inputClass}
              >
                <option value="all">Todos los agentes</option>
                <option value="unassigned">Sin asignar</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName}
                  </option>
                ))}
              </select>
            )}
          </Field>
        ) : null}
        <Field label="Creado desde">
          {({ id }) => (
            <input id={id} type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
          )}
        </Field>
        <Field label="Creado hasta">
          {({ id }) => (
            <input id={id} type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={inputClass} />
          )}
        </Field>
      </section>

      <div aria-live="polite" className="min-h-6">
        {notice ? <p className="mb-4 text-sm text-admin-bad">{notice}</p> : null}
      </div>

      {leads.length === 0 ? (
        <EmptyState
          title={seesAll ? "Aún no hay consultas" : "Aún no tenés consultas asignadas"}
          body={
            seesAll
              ? "Las consultas de los formularios del sitio aparecerán acá."
              : "Cuando un gerente te asigne una consulta, aparecerá acá."
          }
        />
      ) : filtered.length === 0 && filtersActive ? (
        <EmptyState
          title="Ninguna consulta coincide con los filtros"
          body="Probá con otro nombre, agente o rango de fechas."
        />
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className="grid auto-cols-[minmax(17rem,1fr)] grid-flow-col gap-4">
            {LEAD_STAGES.map((stage) => {
              const rank = { alta: 0, media: 1, baja: 3 } as const;
              // High-intent leads first; plain form enquiries sit between "media" and "baja".
              const items = filtered
                .filter((l) => l.stage === stage)
                .sort((a, b) => (a.priority ? rank[a.priority] : 2) - (b.priority ? rank[b.priority] : 2));
              const isOver = overStage === stage && draggingId !== null;
              return (
                <section
                  key={stage}
                  aria-label={STAGE_LABELS[stage]}
                  onDragOver={(e) => {
                    if (draggingId && canMove) e.preventDefault();
                  }}
                  onDragEnter={() => draggingId && setOverStage(stage)}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggingId) run(moveLead(draggingId, stage));
                    endDrag();
                  }}
                  className={cn(
                    "flex min-h-96 flex-col rounded-2xl border bg-white p-3 transition-colors duration-200",
                    isOver ? "border-admin-accent bg-admin-panel-strong" : "border-admin-line",
                  )}
                >
                  <header className="mb-3 flex items-center justify-between px-1 py-2">
                    <h2 className="flex items-center gap-2 text-xs uppercase tracking-luxury text-admin-ink">
                      <span aria-hidden className={cn("size-2 rounded-full", STAGE_DOT[stage])} />
                      {STAGE_LABELS[stage]}
                    </h2>
                    <span className="text-sm text-admin-muted">{items.length}</span>
                  </header>
                  <div className="flex flex-1 flex-col gap-3">
                    {items.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-admin-line px-3 py-8 text-center text-sm text-admin-muted">
                        {canMove ? "Soltá una consulta acá" : "Nada por acá"}
                      </p>
                    ) : (
                      items.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          agents={agents}
                          agentName={
                            lead.assignedAgentId
                              ? (nameById.get(lead.assignedAgentId) ?? "Desconocido")
                              : "Sin asignar"
                          }
                          canMove={canMove}
                          canReassign={canReassign}
                          dragging={draggingId === lead.id}
                          onMove={(s) => run(moveLead(lead.id, s))}
                          onOutcome={(o) => run(setLeadOutcome(lead.id, o))}
                          onReassign={(id) => run(reassignLead(lead.id, id))}
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", lead.id);
                            e.dataTransfer.effectAllowed = "move";
                            setDraggingId(lead.id);
                          }}
                          onDragEnd={endDrag}
                        />
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
