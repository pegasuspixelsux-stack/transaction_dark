"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, LayoutGrid, List, Pencil, Plus, Search, Trash2 } from "lucide-react";
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

export function PropertiesManager() {
  const { status, properties, users, can, saveProperty, togglePropertyStatus, deleteProperty } =
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
    id ? (users.find((u) => u.id === id)?.fullName ?? "Unknown") : "Unassigned";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties.filter(
      (p) =>
        (statusFilter === "all" || p.status === statusFilter) &&
        (!q || p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)),
    );
  }, [properties, query, statusFilter]);

  if (status === "loading") return <Spinner />;

  function report(result: { ok: true } | { ok: false; error: string }) {
    setNotice(result.ok ? null : result.error);
    return result.ok;
  }

  const rowActions = (p: AdminProperty) =>
    canWrite ? (
      <div className="flex">
        <IconButton label={p.status === "published" ? `Unpublish ${p.title}` : `Publish ${p.title}`} onClick={() => report(togglePropertyStatus(p.id))}>
          {p.status === "published" ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </IconButton>
        <IconButton label={`Edit ${p.title}`} onClick={() => setEditing(p)}>
          <Pencil className="size-4" aria-hidden />
        </IconButton>
        <IconButton label={`Delete ${p.title}`} onClick={() => setDeleting(p)} className="hover:text-admin-bad">
          <Trash2 className="size-4" aria-hidden />
        </IconButton>
      </div>
    ) : null;

  const statusBadge = (s: PublishStatus) => (
    <Badge tone={s === "published" ? "ok" : "warn"}>{s}</Badge>
  );

  return (
    <div data-rise>
      <PageHeader
        eyebrow="Inventory"
        title="Properties"
        actions={
          canWrite ? (
            <Button variant="primary" onClick={() => setEditing("new")}>
              <Plus className="size-4" aria-hidden /> Create property
            </Button>
          ) : null
        }
      />

      {!canWrite ? (
        <p className="mb-6 text-sm text-admin-muted">
          You are viewing the properties assigned to you. Only managers and admins can edit listings.
        </p>
      ) : null}

      <section aria-label="Filters" className="mb-6 grid gap-4 sm:grid-cols-[1fr_12rem_auto]">
        <Field label="Search">
          {({ id }) => (
            <div className="relative">
              <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />
              <input id={id} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Title or location" className={cn(inputClass, "pl-11")} />
            </div>
          )}
        </Field>
        <Field label="Status">
          {({ id }) => (
            <select id={id} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className={inputClass}>
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          )}
        </Field>
        <div role="group" aria-label="View" className="flex items-end gap-1">
          {(["table", "grid"] as const).map((v) => (
            <IconButton
              key={v}
              label={v === "table" ? "Table view" : "Grid view"}
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
          title="No properties yet"
          body={canWrite ? "Create your first listing to get started." : "No properties have been assigned to you."}
          action={canWrite ? <Button variant="primary" onClick={() => setEditing("new")}>Create property</Button> : undefined}
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="No properties match" body="Try a different search or status filter." />
      ) : view === "table" ? (
        <GlassCard className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-line text-xs uppercase tracking-luxury text-admin-ink">
                <th scope="col" className="px-5 py-4 font-normal">Property</th>
                <th scope="col" className="px-5 py-4 font-normal">Type</th>
                <th scope="col" className="px-5 py-4 font-normal">Price</th>
                <th scope="col" className="px-5 py-4 font-normal">Specs</th>
                <th scope="col" className="px-5 py-4 font-normal">Agent</th>
                <th scope="col" className="px-5 py-4 font-normal">Status</th>
                <th scope="col" className="px-5 py-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-line">
              {filtered.map((p) => (
                <tr key={p.id} className="transition-colors duration-200 hover:bg-admin-panel">
                  <td className="px-5 py-3">
                    <p className="text-admin-ink">{p.title}</p>
                    <p className="text-admin-muted">{p.location}</p>
                  </td>
                  <td className="px-5 py-3 capitalize text-admin-muted">For {p.listingType}</td>
                  <td className="px-5 py-3">{formatMoney(p.price, p.currency)}</td>
                  <td className="px-5 py-3 text-admin-muted">
                    {p.bedrooms} bd · {p.bathrooms} ba · {p.areaM2} m²
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
              <GlassCard className="overflow-hidden transition-colors duration-200 hover:border-white/25">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied host
                  <img src={p.imageUrl} alt={p.title} loading="lazy" className="h-44 w-full object-cover" />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-admin-panel text-sm text-admin-muted">No image</div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-xl font-normal tracking-tight">{p.title}</h2>
                    {statusBadge(p.status)}
                  </div>
                  <p className="mt-1 text-sm text-admin-muted">{p.location}</p>
                  <p className="mt-3 text-admin-ink">
                    {formatMoney(p.price, p.currency)}
                    <span className="text-sm text-admin-muted"> · For {p.listingType}</span>
                  </p>
                  <p className="mt-1 text-sm text-admin-muted">
                    {p.bedrooms} bd · {p.bathrooms} ba · {p.areaM2} m²
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
        title={editing === "new" ? "Create property" : "Edit property"}
        wide
      >
        {editing !== null ? (
          <PropertyForm
            property={editing === "new" ? null : editing}
            agents={agents}
            onCancel={() => setEditing(null)}
            onSubmit={(input) => {
              if (report(saveProperty(input))) setEditing(null);
            }}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete property?"
        body={deleting ? `“${deleting.title}” will be permanently removed. This can't be undone.` : ""}
        confirmLabel="Delete"
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && report(deleteProperty(deleting.id))}
      />
    </div>
  );
}
