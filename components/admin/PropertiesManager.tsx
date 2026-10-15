"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, GalleryHorizontal, LayoutGrid, List, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { useAdmin } from "@/lib/admin/admin-context";
import { formatMoney } from "@/lib/admin/utils";
import type { AdminProperty, PublishStatus } from "@/types/admin";
import { cn } from "@/lib/utils";
import { PropertyForm } from "./PropertyForm";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Field,
  GlassCard,
  IconButton,
  Modal,
  PageHeader,
  Spinner,
  inputClass,
} from "./ui";

type View = "table" | "grid";

const MAX_FEATURED = 5;
const MAX_HERO = 5;

const listingLabel = (t: AdminProperty["listingType"]) =>
  t === "sale" ? "En venta" : "En alquiler";

export function PropertiesManager() {
  const { status, properties, users, can, saveProperty, togglePropertyStatus, togglePropertyFlag, deleteProperty } =
    useAdmin();
  const canWrite = can("properties:write");

  const [view, setView] = useState<View>("table");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PublishStatus>("all");
  const [editing, setEditing] = useState<AdminProperty | "new" | null>(null);
  const [deleting, setDeleting] = useState<AdminProperty | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const agents = useMemo(() => users.filter((u) => u.role === "agent" && u.active), [users]);
  const agentName = (id: string | null) =>
    id ? (users.find((u) => u.id === id)?.fullName ?? "Desconocido") : "Sin asignar";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties.filter(
      (p) =>
        (statusFilter === "all" || p.status === statusFilter) &&
        (!q || p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)),
    );
  }, [properties, query, statusFilter]);

  if (status === "loading") return <Spinner />;

  const featuredCount = properties.filter((p) => p.featured).length;
  const heroCount = properties.filter((p) => p.hero).length;

  async function report(pending: Promise<{ ok: true } | { ok: false; error: string }>) {
    const result = await pending;
    setNotice(result.ok ? null : result.error);
    return result.ok;
  }

  const rowActions = (p: AdminProperty) =>
    canWrite ? (
      <div className="flex">
        <IconButton
          label={p.featured ? `Quitar ${p.title} de destacadas` : `Marcar ${p.title} como destacada`}
          aria-pressed={!!p.featured}
          onClick={() => report(togglePropertyFlag(p.id, "featured"))}
          className={cn(p.featured && "text-admin-accent")}
        >
          <Star className="size-4" fill={p.featured ? "currentColor" : "none"} aria-hidden />
        </IconButton>
        <IconButton
          label={p.hero ? `Quitar ${p.title} del hero` : `Mostrar ${p.title} en el hero`}
          aria-pressed={!!p.hero}
          onClick={() => report(togglePropertyFlag(p.id, "hero"))}
          className={cn(p.hero && "text-admin-accent")}
        >
          <GalleryHorizontal className="size-4" aria-hidden />
        </IconButton>
        <IconButton label={p.status === "published" ? `Despublicar ${p.title}` : `Publicar ${p.title}`} onClick={() => report(togglePropertyStatus(p.id))}>
          {p.status === "published" ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </IconButton>
        <IconButton label={`Editar ${p.title}`} onClick={() => setEditing(p)}>
          <Pencil className="size-4" aria-hidden />
        </IconButton>
        <IconButton label={`Eliminar ${p.title}`} onClick={() => setDeleting(p)} className="hover:text-admin-bad">
          <Trash2 className="size-4" aria-hidden />
        </IconButton>
      </div>
    ) : null;

  const flagBadges = (p: AdminProperty) =>
    p.featured || p.hero ? (
      <div className="mt-1 flex flex-wrap gap-1">
        {p.featured ? <Badge tone="accent">Destacada</Badge> : null}
        {p.hero ? <Badge tone="accent">Hero</Badge> : null}
      </div>
    ) : null;

  const statusBadge = (s: PublishStatus) => (
    <Badge tone={s === "published" ? "ok" : "warn"}>
      {s === "published" ? "Publicada" : "Borrador"}
    </Badge>
  );

  return (
    <div data-rise>
      <PageHeader
        eyebrow="Inventario"
        title="Propiedades"
        actions={
          canWrite ? (
            <Button variant="primary" onClick={() => setEditing("new")}>
              <Plus className="size-4" aria-hidden /> Crear propiedad
            </Button>
          ) : null
        }
      />

      {!canWrite ? (
        <p className="mb-6 text-sm text-admin-muted">
          Estás viendo las propiedades asignadas a vos. Solo gerentes y administradores pueden editar publicaciones.
        </p>
      ) : null}

      <p className="mb-6 text-sm text-admin-muted">
        Destacadas en la página principal: {featuredCount}/{MAX_FEATURED} · En el hero: {heroCount}/{MAX_HERO}
      </p>

      <section aria-label="Filtros" className="mb-6 grid gap-4 sm:grid-cols-[1fr_12rem_auto]">
        <Field label="Buscar">
          {({ id }) => (
            <div className="relative">
              <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />
              <input id={id} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Título o ubicación" className={cn(inputClass, "pl-11")} />
            </div>
          )}
        </Field>
        <Field label="Estado">
          {({ id }) => (
            <select id={id} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className={inputClass}>
              <option value="all">Todas</option>
              <option value="published">Publicadas</option>
              <option value="draft">Borradores</option>
            </select>
          )}
        </Field>
        <div role="group" aria-label="Vista" className="flex items-end gap-1">
          {(["table", "grid"] as const).map((v) => (
            <IconButton
              key={v}
              label={v === "table" ? "Vista de tabla" : "Vista de cuadrícula"}
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn("border border-admin-line", view === v && "bg-admin-panel-strong text-admin-ink")}
            >
              {v === "table" ? <List className="size-4" aria-hidden /> : <LayoutGrid className="size-4" aria-hidden />}
            </IconButton>
          ))}
        </div>
      </section>

      <div aria-live="polite" className="min-h-6">
        {notice ? <p className="mb-4 text-sm text-admin-bad">{notice}</p> : null}
      </div>

      {properties.length === 0 ? (
        <EmptyState
          title="Aún no hay propiedades"
          body={canWrite ? "Creá tu primera publicación para empezar." : "No tenés propiedades asignadas."}
          action={canWrite ? <Button variant="primary" onClick={() => setEditing("new")}>Crear propiedad</Button> : undefined}
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="Ninguna propiedad coincide" body="Probá con otra búsqueda o filtro de estado." />
      ) : view === "table" ? (
        <GlassCard className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-line text-xs uppercase tracking-luxury text-admin-ink">
                <th scope="col" className="px-5 py-4 font-normal">Propiedad</th>
                <th scope="col" className="px-5 py-4 font-normal">Tipo</th>
                <th scope="col" className="px-5 py-4 font-normal">Precio</th>
                <th scope="col" className="px-5 py-4 font-normal">Detalles</th>
                <th scope="col" className="px-5 py-4 font-normal">Agente</th>
                <th scope="col" className="px-5 py-4 font-normal">Estado</th>
                <th scope="col" className="px-5 py-4"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-line">
              {filtered.map((p) => (
                <tr key={p.id} className="transition-colors duration-200 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="text-admin-ink">{p.title}</p>
                    <p className="text-admin-muted">{p.location}</p>
                    {flagBadges(p)}
                  </td>
                  <td className="px-5 py-3 text-admin-muted">{listingLabel(p.listingType)}</td>
                  <td className="px-5 py-3">{formatMoney(p.price, p.currency)}</td>
                  <td className="px-5 py-3 text-admin-muted">
                    {p.bedrooms} dorm. · {p.bathrooms} baños · {p.areaM2} m²
                  </td>
                  <td className="px-5 py-3 text-admin-muted">{agentName(p.assignedAgentId)}</td>
                  <td className="px-5 py-3">{statusBadge(p.status)}</td>
                  <td className="px-2 py-1">{rowActions(p)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.id}>
              <GlassCard className="overflow-hidden transition-colors duration-200 hover:border-slate-400">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied host
                  <img src={p.imageUrl} alt={p.title} loading="lazy" className="h-44 w-full object-cover" />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-admin-panel text-sm text-admin-muted">Sin imagen</div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-xl font-normal tracking-tight">{p.title}</h2>
                    {statusBadge(p.status)}
                  </div>
                  <p className="mt-1 text-sm text-admin-muted">{p.location}</p>
                  {flagBadges(p)}
                  <p className="mt-3 text-admin-ink">
                    {formatMoney(p.price, p.currency)}
                    <span className="text-sm text-admin-muted"> · {listingLabel(p.listingType)}</span>
                  </p>
                  <p className="mt-1 text-sm text-admin-muted">
                    {p.bedrooms} dorm. · {p.bathrooms} baños · {p.areaM2} m²
                  </p>
                  <div className="-mb-2 -ml-3 mt-3">{rowActions(p)}</div>
                </div>
              </GlassCard>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Crear propiedad" : "Editar propiedad"}
        wide
      >
        {editing !== null ? (
          <PropertyForm
            property={editing === "new" ? null : editing}
            agents={agents}
            onCancel={() => setEditing(null)}
            featuredFull={featuredCount >= MAX_FEATURED}
            heroFull={heroCount >= MAX_HERO}
            onSubmit={async (input) => {
              if (await report(saveProperty(input))) setEditing(null);
            }}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="¿Eliminar propiedad?"
        body={deleting ? `“${deleting.title}” se eliminará de forma permanente. Esta acción no se puede deshacer.` : ""}
        confirmLabel="Eliminar"
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && report(deleteProperty(deleting.id))}
      />
    </div>
  );
}
