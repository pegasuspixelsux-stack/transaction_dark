"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAdmin } from "@/lib/admin/admin-context";
import { STAGE_DOT, STAGE_LABELS } from "@/lib/admin/stages";
import { formatDate } from "@/lib/admin/utils";
import { LEAD_STAGES } from "@/types/admin";
import { cn } from "@/lib/utils";
import { usePropertyTypes } from "@/lib/admin/use-zones";
import { normalizeTypeId } from "@/lib/property-types";
import { DonutChart, type DonutSlice } from "./DonutChart";
import { EmptyState, GlassCard, PageHeader, Spinner } from "./ui";

/**
 * Categorical slots 1–5, assigned by the type's position on the "Tipos" page.
 * Validated for color-vision deficiency including the ring's wrap-around
 * (slot 5 touches slot 1); a 6th+ type folds into "Otros tipos" instead of a
 * generated hue.
 */
const TYPE_COLORS = ["#257de0", "#f47230", "#00b894", "#f2a600", "#ee7fac"];

/** Zones ranked by listings for sale: one blue, darkest = most (validated ordinal ramp). */
const RANK_RAMP = ["#0f4a96", "#1b64be", "#257de0", "#519ced", "#84b9f3"];
const OTHER_COLOR = "#a1a1aa";

export function OverviewDashboard() {
  const { status, user, properties, leads, users, can } = useAdmin();

  // Captured once per mount so render stays pure.
  const [now] = useState(() => Date.now());

  const stats = useMemo(() => {
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const byStage = Object.fromEntries(
      LEAD_STAGES.map((s) => [s, leads.filter((l) => l.stage === s).length]),
    ) as Record<(typeof LEAD_STAGES)[number], number>;
    const won = leads.filter((l) => l.stage === "won" || (l.stage === "closed" && l.outcome === "won")).length;
    const lost = leads.filter((l) => l.stage === "closed" && l.outcome === "lost").length;
    return {
      published: properties.filter((p) => p.status === "published").length,
      drafts: properties.filter((p) => p.status === "draft").length,
      open: leads.filter((l) => l.stage !== "closed" && l.stage !== "won").length,
      newThisWeek: leads.filter((l) => new Date(l.createdAt).getTime() > weekAgo).length,
      unassigned: leads.filter((l) => !l.assignedAgentId).length,
      won,
      winRate: won + lost > 0 ? Math.round((won / (won + lost)) * 100) : null,
      byStage,
      activeUsers: users.filter((u) => u.active).length,
    };
  }, [properties, leads, users, now]);

  const types = usePropertyTypes();
  const typeSlices = useMemo<DonutSlice[]>(() => {
    if (types === null) return [];
    const list = types;
    const count = (id: string) => properties.filter((p) => normalizeTypeId(p.propertyType) === id).length;
    const named = list.slice(0, TYPE_COLORS.length).map((t, i) => ({
      key: t.id,
      label: t.label,
      color: TYPE_COLORS[i],
      value: count(t.id),
    }));
    const namedIds = new Set(named.map((s) => s.key));
    const rest = properties.filter((p) => !namedIds.has(normalizeTypeId(p.propertyType))).length;
    return rest > 0 ? [...named, { key: "__other", label: "Otros tipos", value: rest, color: OTHER_COLOR }] : named;
  }, [properties, types]);

  const zoneSlices = useMemo<DonutSlice[]>(() => {
    const counts = new Map<string, number>();
    for (const p of properties) {
      if (p.listingType !== "sale") continue;
      const zone = p.zone || "Sin zona";
      counts.set(zone, (counts.get(zone) ?? 0) + 1);
    }
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"));
    const top = ranked.slice(0, RANK_RAMP.length).map(([zone, value], i) => ({
      key: zone,
      label: zone,
      value,
      color: RANK_RAMP[i],
    }));
    const rest = ranked.slice(RANK_RAMP.length).reduce((sum, [, n]) => sum + n, 0);
    return rest > 0 ? [...top, { key: "__other", label: "Otras zonas", value: rest, color: OTHER_COLOR }] : top;
  }, [properties]);


  if (status === "loading" || !user) return <Spinner />;

  const metrics = [
    { label: "Propiedades publicadas", value: stats.published, note: `${stats.drafts} en borrador` },
    { label: "Consultas abiertas", value: stats.open, note: `${stats.newThisWeek} nuevas esta semana` },
    {
      label: can("leads:view-all") ? "Consultas sin asignar" : "Operaciones ganadas",
      value: can("leads:view-all") ? stats.unassigned : stats.won,
      note: can("leads:view-all") ? "Esperando un agente" : "Cerradas como ganadas",
    },
    {
      label: "Tasa de cierre",
      value: stats.winRate === null ? "—" : `${stats.winRate}%`,
      note: `${stats.won} operaciones ganadas`,
    },
  ];

  const maxStage = Math.max(1, ...Object.values(stats.byStage));
  const recent = [...leads]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <div data-rise>
      <PageHeader eyebrow="Panel" title={`Qué bueno verte, ${user.fullName.split(" ")[0]}`} />

      <section aria-label="Métricas clave" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <GlassCard key={m.label} className="p-6">
            <p className="text-footnote font-medium text-admin-muted">{m.label}</p>
            <p className="mt-3 text-hero-number tabular-nums">{m.value}</p>
            <p className="mt-2 text-sm text-admin-muted">{m.note}</p>
          </GlassCard>
        ))}
      </section>

      <section aria-label="Composición del catálogo" className="mt-6 grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="text-title-3">Propiedades por tipo</h2>
          <p className="mt-1 text-footnote text-admin-muted">Todo el catálogo, publicadas y borradores.</p>
          <DonutChart
            slices={typeSlices}
            totalLabel="propiedades"
            emptyText={types === null ? "Cargando tipos…" : "Todavía no hay propiedades."}
          />
        </GlassCard>
        <GlassCard className="p-6">
          <h2 className="text-title-3">Zonas con más propiedades en venta</h2>
          <p className="mt-1 text-footnote text-admin-muted">Ordenadas de mayor a menor; el azul más oscuro es la zona con más ofertas.</p>
          <DonutChart slices={zoneSlices} totalLabel="en venta" emptyText="No hay propiedades en venta." />
        </GlassCard>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <GlassCard className="p-6 lg:col-span-3">
          <h2 className="text-title-3">Pipeline</h2>
          {leads.length === 0 ? (
            <p className="mt-4 text-sm text-admin-muted">Aún no hay consultas.</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {LEAD_STAGES.map((stage) => (
                <li key={stage}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span aria-hidden className={cn("size-2 rounded-full", STAGE_DOT[stage])} />
                      {STAGE_LABELS[stage]}
                    </span>
                    <span className="text-admin-muted">{stats.byStage[stage]}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-admin-panel-strong">
                    <div
                      className={cn("h-full origin-left rounded-full", STAGE_DOT[stage])}
                      style={{ transform: `scaleX(${stats.byStage[stage] / maxStage})` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/leads"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-footnote font-medium text-admin-accent hover:text-admin-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
          >
            Abrir pipeline <ArrowRight className="size-4" aria-hidden />
          </Link>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2">
          <h2 className="text-title-3">Últimas consultas</h2>
          {recent.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Todavía no hay nada" body="Las nuevas consultas del sitio aparecerán acá." />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-admin-line">
              {recent.map((l) => (
                <li key={l.id} className="py-3">
                  <p className="text-sm text-admin-ink">{l.name}</p>
                  <p className="text-sm text-admin-muted">
                    {l.propertyTitle} · {formatDate(l.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      {can("users:manage") ? (
        <p className="mt-6 text-sm text-admin-muted">
          {stats.activeUsers} miembros activos del equipo ·{" "}
          <Link
            href="/admin/users"
            className="text-admin-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
          >
            Gestionar usuarios
          </Link>
        </p>
      ) : null}
    </div>
  );
}
