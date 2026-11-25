"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useAdmin } from "@/lib/admin/admin-context";
import {
  MAX_TYPES,
  normalizeTypeId,
  slugifyType,
  type PropertyTypeDef,
  type TypeErrors,
} from "@/lib/property-types";
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

type Load = { state: "loading" } | { state: "error"; message: string } | { state: "ready" };
type Result = { ok: true } | { ok: false; error: string; errors?: TypeErrors };

function TypeForm({
  type,
  onSubmit,
  onCancel,
}: {
  type: PropertyTypeDef | null;
  onSubmit: (values: { label: string; built: boolean }) => Promise<Result>;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(type?.label ?? "");
  const [built, setBuilt] = useState(type?.built ?? true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!label.trim()) return setError("Ingresá un nombre.");
    setError(null);
    setSaving(true);
    const result = await onSubmit({ label: label.trim(), built });
    setSaving(false);
    if (!result.ok) {
      setFormError(result.error);
      if (result.errors?.label) setError(result.errors.label);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Field label="Nombre" error={error ?? undefined} hint="En singular, por ejemplo “Casa” o “Local comercial”.">
        {({ id, describedBy, invalid }) => (
          <input
            id={id}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            value={label}
            maxLength={40}
            onChange={(e) => setLabel(e.target.value)}
            className={inputClass}
          />
        )}
      </Field>

      <label className="flex min-h-11 cursor-pointer items-start gap-3 text-body">
        <input
          type="checkbox"
          checked={built}
          onChange={(e) => setBuilt(e.target.checked)}
          className="mt-0.5 size-5 accent-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
        />
        <span>
          Es una construcción
          <span className="block text-footnote text-admin-muted">
            Muestra dormitorios, baños y año de construcción en la ficha. Desmarcalo para terrenos y campos.
          </span>
        </span>
      </label>

      {formError ? <p role="alert" className="text-footnote text-admin-bad">{formError}</p> : null}

      <div className="flex flex-wrap justify-end gap-3">
        <Button onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Guardando…" : type ? "Guardar cambios" : "Crear tipo"}
        </Button>
      </div>
    </form>
  );
}

export function PropertyTypesManager() {
  const { status, can, properties } = useAdmin();
  const allowed = status === "ready" && can("properties:write");
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [types, setTypes] = useState<PropertyTypeDef[]>([]);
  const [editing, setEditing] = useState<PropertyTypeDef | "new" | null>(null);
  const [deleting, setDeleting] = useState<PropertyTypeDef | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    fetch("/api/admin/property-types", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !Array.isArray(data.types)) {
          setLoad({ state: "error", message: data.error ?? "No pudimos cargar los tipos." });
          return;
        }
        setTypes(data.types);
        setLoad({ state: "ready" });
      })
      .catch(() => {
        if (!cancelled) setLoad({ state: "error", message: "No pudimos conectar con el servidor." });
      });
    return () => {
      cancelled = true;
    };
  }, [allowed, reloadKey]);

  const countFor = (id: string) => properties.filter((p) => normalizeTypeId(p.propertyType) === id).length;

  async function save(next: PropertyTypeDef[]): Promise<Result> {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/property-types", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ types: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !Array.isArray(data.types)) {
        const errors: TypeErrors = {};
        for (const [key, msg] of Object.entries((data.errors ?? {}) as TypeErrors)) {
          errors[key.split(".").pop() ?? key] = msg;
        }
        return { ok: false, error: data.error ?? "No pudimos guardar los tipos.", errors };
      }
      setTypes(data.types);
      setNotice(null);
      return { ok: true };
    } catch {
      return { ok: false, error: "No pudimos conectar con el servidor." };
    } finally {
      setBusy(false);
    }
  }

  async function quick(next: PropertyTypeDef[]) {
    const result = await save(next);
    if (!result.ok) setNotice(result.error);
  }

  async function submitForm(values: { label: string; built: boolean }): Promise<Result> {
    const next =
      editing === "new"
        ? [...types, { id: uniqueId(values.label, types), ...values }]
        : types.map((t) => (editing && t.id === editing.id ? { ...t, ...values } : t));
    const result = await save(next);
    if (result.ok) setEditing(null);
    return result;
  }

  const move = (i: number, dir: -1 | 1) => {
    const next = [...types];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    void quick(next);
  };

  if (status === "loading") return <Spinner />;
  if (!allowed) {
    return <EmptyState title="Acceso restringido" body="Tu rol no tiene permiso para editar los tipos de propiedad." />;
  }

  return (
    <div data-rise>
      <PageHeader
        eyebrow="Catálogo"
        title="Tipos de propiedad"
        actions={
          <Button variant="primary" onClick={() => setEditing("new")} disabled={load.state !== "ready" || types.length >= MAX_TYPES}>
            <Plus className="size-4" aria-hidden />
            Nuevo tipo
          </Button>
        }
      />

      <p className="-mt-4 mb-6 max-w-prose text-callout text-admin-muted">
        El orden de la lista es el orden en los filtros del sitio, en el formulario de propiedades y en el gráfico del
        resumen.
      </p>

      <div aria-live="polite" className="min-h-6">
        {notice ? <p className="mb-4 text-callout text-admin-bad">{notice}</p> : null}
      </div>

      {load.state === "loading" ? (
        <Spinner label="Cargando tipos" />
      ) : load.state === "error" ? (
        <EmptyState
          title="No pudimos cargar los tipos"
          body={load.message}
          action={
            <Button onClick={() => { setLoad({ state: "loading" }); setReloadKey((k) => k + 1); }}>
              Reintentar
            </Button>
          }
        />
      ) : (
        <GlassCard className="overflow-hidden">
          <ul className="divide-y divide-admin-line">
            {types.map((type, i) => {
              const count = countFor(type.id);
              return (
                <li key={type.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-headline">{type.label}</h2>
                      {type.built ? <Badge>Construcción</Badge> : <Badge>Sin construir</Badge>}
                    </div>
                    <p className="text-footnote text-admin-muted">
                      {count} {count === 1 ? "propiedad" : "propiedades"}
                    </p>
                  </div>
                  <div className="flex">
                    <IconButton label={`Subir ${type.label}`} disabled={busy || i === 0} onClick={() => move(i, -1)}>
                      <ArrowUp className="size-4" aria-hidden />
                    </IconButton>
                    <IconButton label={`Bajar ${type.label}`} disabled={busy || i === types.length - 1} onClick={() => move(i, 1)}>
                      <ArrowDown className="size-4" aria-hidden />
                    </IconButton>
                    <IconButton label={`Editar ${type.label}`} disabled={busy} onClick={() => setEditing(type)}>
                      <Pencil className="size-4" aria-hidden />
                    </IconButton>
                    <IconButton
                      label={count > 0 ? `${type.label} tiene propiedades; cambialas de tipo para eliminarlo` : `Eliminar ${type.label}`}
                      disabled={busy || count > 0 || types.length === 1}
                      onClick={() => setDeleting(type)}
                      className="hover:text-admin-bad"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </GlassCard>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Nuevo tipo" : "Editar tipo"}>
        {editing !== null ? (
          <TypeForm
            key={editing === "new" ? "new" : editing.id}
            type={editing === "new" ? null : editing}
            onSubmit={submitForm}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar tipo"
        body={deleting ? `¿Eliminar ${deleting.label}? Esta acción no se puede deshacer.` : ""}
        confirmLabel="Eliminar"
        onConfirm={() => deleting && quick(types.filter((t) => t.id !== deleting.id))}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

function uniqueId(label: string, types: PropertyTypeDef[]): string {
  const base = slugifyType(label);
  let id = base;
  for (let n = 2; types.some((t) => t.id === id); n++) id = `${base}-${n}`;
  return id;
}
