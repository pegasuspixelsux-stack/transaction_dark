"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { CheckCheck, Mail, MessageCircle, Phone, Search, X } from "lucide-react";
import { useAdmin } from "@/lib/admin/admin-context";
import {
  CONSULTA_STATUS_LABELS,
  CONSULTA_STATUS_TONE,
  STAGE_LABELS,
  consultaStatus,
  type ConsultaStatus,
} from "@/lib/admin/stages";
import { formatDate, telLink, toDateKey, whatsappLink } from "@/lib/admin/utils";
import type { Lead } from "@/types/admin";
import { cn } from "@/lib/utils";
import { Badge, Button, EmptyState, IconButton, PageHeader, Spinner, inputClass } from "./ui";

const STATUS_ORDER: ConsultaStatus[] = ["new", "in-progress", "contacted", "closed"];

const contactOf = (l: Lead) => l.phone || l.email || "—";
const snippet = (text: string | undefined, max = 90) => {
  const flat = (text ?? "").replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max).trimEnd()}…` : flat;
};

const actionLink =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-admin-line px-5 text-xs uppercase tracking-luxury text-admin-ink transition-colors duration-200 hover:bg-admin-panel-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent active:bg-admin-panel";

export function ConsultasList() {
  const { status, leads, users, can, moveLead } = useAdmin();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ConsultaStatus>("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const agents = useMemo(() => users.filter((u) => u.role === "agent" && u.active), [users]);
  const seesAll = can("leads:view-all");
  const filtersActive = Boolean(query || statusFilter !== "all" || agentFilter !== "all" || from || to);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");
    return leads.filter((l) => {
      if (statusFilter !== "all" && consultaStatus(l.stage) !== statusFilter) return false;
      if (q) {
        const matches =
          l.name.toLowerCase().includes(q) ||
          l.propertyTitle.toLowerCase().includes(q) ||
          (qDigits.length > 0 && l.phone.replace(/\D/g, "").includes(qDigits));
        if (!matches) return false;
      }
      if (agentFilter === "unassigned" && l.assignedAgentId) return false;
      if (agentFilter !== "all" && agentFilter !== "unassigned" && l.assignedAgentId !== agentFilter) return false;
      const day = toDateKey(l.createdAt);
      if (from && day < from) return false;
      if (to && day > to) return false;
      return true;
    });
  }, [leads, query, statusFilter, agentFilter, from, to]);

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setAgentFilter("all");
    setFrom("");
    setTo("");
  };

  const closeDrawer = useCallback(() => setSelectedId(null), []);

  if (status === "loading") return <Spinner label="Cargando consultas" />;

  const selected = leads.find((l) => l.id === selectedId) ?? null;

  async function markContacted(lead: Lead) {
    const result = await moveLead(lead.id, "contacted");
    setNotice(result.ok ? null : result.error);
  }

  return (
    <>
      <PageHeader
        eyebrow="Consultas"
        title="Bandeja de consultas"
        actions={
          <Link href="/admin/leads" className={actionLink}>
            Ver pipeline
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-admin-muted"
            aria-hidden
          />
          <input
            type="search"
            aria-label="Buscar por nombre, propiedad o teléfono"
            placeholder="Nombre, propiedad o teléfono"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={cn(inputClass, "pl-11")}
          />
        </div>
        <select
          aria-label="Filtrar por estado"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | ConsultaStatus)}
          className={cn(inputClass, "sm:w-56")}
        >
          <option value="all">Todos los estados</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {CONSULTA_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        {seesAll ? (
          <select
            aria-label="Filtrar por agente"
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className={cn(inputClass, "sm:w-56")}
          >
            <option value="all">Todos los agentes</option>
            <option value="unassigned">Sin asignar</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.fullName}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:max-w-xl">
        <label className="block text-xs uppercase tracking-luxury">
          <span className="mb-2 block">Creado desde</span>
          <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-xs uppercase tracking-luxury">
          <span className="mb-2 block">Creado hasta</span>
          <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={inputClass} />
        </label>
      </div>

      {notice ? (
        <p role="alert" className="mb-4 text-sm text-admin-bad">
          {notice}
        </p>
      ) : null}

      {leads.length === 0 ? (
        <EmptyState
          title="Todavía no hay consultas"
          body="Cuando alguien consulte por una propiedad o complete el formulario, la consulta aparece acá."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          body="Ninguna consulta coincide con la búsqueda o el filtro."
          action={
            <Button
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
                setAgentFilter("all");
                setFrom("");
                setTo("");
              }}
            >
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <>
          <p className="mb-3 flex items-center gap-3 text-sm text-admin-muted" aria-live="polite">
            <span>
              {filtered.length} {filtered.length === 1 ? "consulta" : "consultas"}
            </span>
            {filtersActive ? (
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-11 underline underline-offset-4 hover:text-admin-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
              >
                Limpiar filtros
              </button>
            ) : null}
          </p>

          {/* Table from md up */}
          <div className="hidden overflow-x-auto rounded-2xl border border-admin-line md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-admin-line bg-admin-panel text-xs uppercase tracking-luxury text-admin-muted">
                <tr>
                  {["Nombre", "Contacto", "Propiedad", "Fecha", "Estado", "Mensaje"].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-line">
                {filtered.map((l) => (
                  <tr key={l.id} className="transition-colors duration-200 hover:bg-admin-panel">
                    <td className="px-4 py-1">
                      <button
                        type="button"
                        onClick={() => setSelectedId(l.id)}
                        className="min-h-11 text-left text-admin-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
                      >
                        {l.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-admin-muted">{contactOf(l)}</td>
                    <td className="max-w-48 truncate px-4 py-3 text-admin-ink" title={l.propertyTitle}>
                      {l.propertyTitle || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-admin-muted">{formatDate(l.createdAt, true)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={CONSULTA_STATUS_TONE[consultaStatus(l.stage)]}>
                        {CONSULTA_STATUS_LABELS[consultaStatus(l.stage)]}
                      </Badge>
                    </td>
                    <td className="max-w-64 px-4 py-3 text-admin-muted">{snippet(l.message) || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards below md */}
          <ul className="space-y-3 md:hidden">
            {filtered.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(l.id)}
                  className="w-full rounded-xl border border-admin-line bg-white p-4 text-left transition-colors duration-200 hover:border-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent active:bg-admin-panel"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-admin-ink">{l.name}</span>
                      <span className="block truncate text-sm text-admin-muted">{contactOf(l)}</span>
                    </span>
                    <Badge tone={CONSULTA_STATUS_TONE[consultaStatus(l.stage)]}>
                      {CONSULTA_STATUS_LABELS[consultaStatus(l.stage)]}
                    </Badge>
                  </span>
                  <span className="mt-2 block truncate text-sm text-admin-ink">{l.propertyTitle || "—"}</span>
                  <span className="mt-1 block text-sm text-admin-muted">{snippet(l.message, 70)}</span>
                  <span className="mt-2 block text-sm text-admin-muted">{formatDate(l.createdAt, true)}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {selected ? (
        <DetailDrawer
          lead={selected}
          canMove={can("leads:move")}
          onClose={closeDrawer}
          onMarkContacted={markContacted}
        />
      ) : null}
    </>
  );
}

function DetailDrawer({
  lead,
  canMove,
  onClose,
  onMarkContacted,
}: {
  lead: Lead;
  canMove: boolean;
  onClose: () => void;
  onMarkContacted: (lead: Lead) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const panelRef = useRef<HTMLElement>(null);

  // Mounted only while a lead is selected: move focus in, restore it on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onClose]);

  const st = consultaStatus(lead.stage);
  const first = lead.name.split(" ")[0];
  const greeting = `Hola ${first}, te escribimos de Transaction${
    lead.propertyTitle ? ` por ${lead.propertyTitle}` : " por tu consulta"
  }.`;
  const canMark = canMove && lead.stage === "new";

  const rows: [string, ReactNode][] = [
    ["Teléfono", lead.phone || "—"],
    ["Email", lead.email || "—"],
    [
      "Propiedad",
      lead.propertyId ? (
        <Link
          href={`/propiedades/${lead.propertyId}`}
          target="_blank"
          className="underline underline-offset-4 hover:text-admin-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
        >
          {lead.propertyTitle || lead.propertyId}
        </Link>
      ) : (
        lead.propertyTitle || "—"
      ),
    ],
    ["Interés", lead.intent || "—"],
    ["Origen", lead.source],
    ["Recibida", formatDate(lead.createdAt, true)],
    ["Etapa en el pipeline", STAGE_LABELS[lead.stage]],
  ];

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Cerrar detalle"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60"
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consulta-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-admin-line bg-white text-admin-ink focus:outline-none motion-safe:animate-[drawerIn_250ms_ease-out]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-admin-line p-6">
          <div className="min-w-0">
            <h2 id="consulta-title" className="truncate font-display text-2xl font-normal tracking-tight">
              {lead.name}
            </h2>
            <div className="mt-2">
              <Badge tone={CONSULTA_STATUS_TONE[st]}>{CONSULTA_STATUS_LABELS[st]}</Badge>
            </div>
          </div>
          <IconButton label="Cerrar" onClick={onClose} className="-mr-2 -mt-2">
            <X className="size-5" aria-hidden />
          </IconButton>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <dl className="space-y-3 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-3 gap-3">
                <dt className="text-admin-muted">{label}</dt>
                <dd className="col-span-2 break-words">{value}</dd>
              </div>
            ))}
          </dl>
          <div>
            <h3 className="mb-2 text-xs uppercase tracking-luxury text-admin-muted">Mensaje</h3>
            <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed">
              {lead.message || "Sin mensaje."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-admin-line p-6">
          {lead.phone ? (
            <a href={whatsappLink(lead.phone, greeting)} target="_blank" rel="noopener noreferrer" className={actionLink}>
              <MessageCircle className="size-4" aria-hidden />
              Abrir en WhatsApp
            </a>
          ) : null}
          {lead.phone ? (
            <a href={telLink(lead.phone)} className={actionLink}>
              <Phone className="size-4" aria-hidden />
              Llamar
            </a>
          ) : null}
          {lead.email ? (
            <a
              href={`mailto:${lead.email}?subject=${encodeURIComponent(lead.propertyTitle ? `Sobre ${lead.propertyTitle}` : "Tu consulta")}`}
              className={actionLink}
            >
              <Mail className="size-4" aria-hidden />
              Email
            </a>
          ) : null}
          {canMark ? (
            <Button
              variant="primary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await onMarkContacted(lead);
                setBusy(false);
              }}
            >
              <CheckCheck className="size-4" aria-hidden />
              Marcar como respondido
            </Button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
