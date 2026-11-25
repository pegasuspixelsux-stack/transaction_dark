"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, House, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useAdmin } from "@/lib/admin/admin-context";
import { uploadImage } from "@/lib/admin/upload-image";
import { MAX_HOME_ZONES, MAX_ZONES, slugify, type Zone, type ZoneErrors } from "@/lib/zones";
import { cn } from "@/lib/utils";
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
type Result = { ok: true } | { ok: false; error: string; errors?: ZoneErrors };

/* ------------------------------------------------------------------ */
/* Edit / create form (inside the modal)                               */
/* ------------------------------------------------------------------ */

interface FormState {
  name: string;
  blurb: string;
  image: string;
  lat: string;
  lng: string;
  showOnHome: boolean;
}

/** Default map centre for a new zone: Punta del Este. */
const empty: FormState = { name: "", blurb: "", image: "", lat: "-34.9667", lng: "-54.95", showOnHome: false };

const toForm = (z: Zone): FormState => ({
  name: z.name,
  blurb: z.blurb,
  image: z.image,
  lat: String(z.lat),
  lng: String(z.lng),
  showOnHome: z.showOnHome,
});

function ZoneForm({
  zone,
  homeFull,
  propertyCount,
  onSubmit,
  onCancel,
}: {
  zone: Zone | null;
  /** True when MAX_HOME_ZONES other zones already hold a homepage slot. */
  homeFull: boolean;
  propertyCount: number;
  onSubmit: (form: FormState) => Promise<Result>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(zone ? toForm(zone) : empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const homeBlocked = homeFull && !zone?.showOnHome && !form.showOnHome;

  async function onPickImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErrors((er) => ({ ...er, image: "" }));
    setUploading(true);
    try {
      set("image", await uploadImage(file, "/zones"));
    } catch (err) {
      setErrors((er) => ({ ...er, image: err instanceof Error ? err.message : "No pudimos subir la imagen." }));
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const local: Record<string, string> = {};
    if (!form.name.trim()) local.name = "Ingresá un nombre.";
    if (!form.image) local.image = "Subí una imagen.";
    setErrors(local);
    setFormError(null);
    if (Object.keys(local).length) return;
    setSaving(true);
    const result = await onSubmit(form);
    setSaving(false);
    if (!result.ok) {
      setFormError(result.error);
      if (result.errors) setErrors(result.errors);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Field
        label="Nombre"
        error={errors.name}
        hint={zone && propertyCount > 0 ? `Si lo cambiás, se actualiza en ${propertyCount} ${propertyCount === 1 ? "propiedad" : "propiedades"}.` : undefined}
      >
        {({ id, describedBy, invalid }) => (
          <input id={id} aria-invalid={invalid} aria-describedby={describedBy} value={form.name} maxLength={60} onChange={(e) => set("name", e.target.value)} className={inputClass} />
        )}
      </Field>

      <Field label="Descripción breve" error={errors.blurb} hint="Se muestra sobre la imagen en la página de inicio.">
        {({ id, describedBy, invalid }) => (
          <textarea id={id} rows={3} aria-invalid={invalid} aria-describedby={describedBy} value={form.blurb} maxLength={240} onChange={(e) => set("blurb", e.target.value)} className={cn(inputClass, "py-3")} />
        )}
      </Field>

      <div>
        <p className="mb-2 text-footnote font-medium text-admin-ink">Imagen</p>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="relative aspect-video overflow-hidden rounded-lg border border-admin-line bg-admin-field">
            {form.image ? (
              <Image src={form.image} alt="" fill sizes="(min-width: 640px) 360px, 100vw" className="object-cover" />
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-admin-muted">Sin imagen</p>
            )}
          </div>
          <label
            className={cn(
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900/[0.05] px-5 text-footnote font-medium text-admin-ink transition-colors duration-200 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-admin-accent",
              uploading ? "cursor-wait opacity-60" : "cursor-pointer hover:bg-admin-panel-strong active:bg-admin-panel",
            )}
          >
            <Upload className="size-4" aria-hidden />
            {uploading ? "Subiendo…" : form.image ? "Cambiar imagen" : "Subir imagen"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={onPickImage} />
          </label>
        </div>
        <p className={cn("mt-2 text-sm", errors.image ? "text-admin-bad" : "text-admin-muted")} role={errors.image ? "alert" : undefined}>
          {errors.image || "JPG, PNG o WebP hasta 10 MB; se convierte a WebP."}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Latitud" error={errors.lat} hint="Centro del mapa en la ficha de la propiedad.">
          {({ id, describedBy, invalid }) => (
            <input id={id} type="number" step="any" aria-invalid={invalid} aria-describedby={describedBy} value={form.lat} onChange={(e) => set("lat", e.target.value)} className={inputClass} />
          )}
        </Field>
        <Field label="Longitud" error={errors.lng}>
          {({ id, describedBy, invalid }) => (
            <input id={id} type="number" step="any" aria-invalid={invalid} aria-describedby={describedBy} value={form.lng} onChange={(e) => set("lng", e.target.value)} className={inputClass} />
          )}
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2 text-footnote font-medium text-admin-ink">Página principal</legend>
        <label className={cn("flex min-h-11 items-start gap-3 text-sm", homeBlocked ? "opacity-60" : "cursor-pointer")}>
          <input
            type="checkbox"
            checked={form.showOnHome}
            disabled={homeBlocked}
            onChange={(e) => set("showOnHome", e.target.checked)}
            className="mt-0.5 size-5 accent-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
          />
          <span>
            Mostrar en “Dónde trabajamos”
            <span className="block text-admin-muted">
              {homeBlocked
                ? `Ya hay ${MAX_HOME_ZONES} zonas en la página de inicio. Quitá una para sumar esta.`
                : `Zona preferida en la página de inicio (máx. ${MAX_HOME_ZONES}).`}
            </span>
          </span>
        </label>
      </fieldset>

      {formError ? <p role="alert" className="text-sm text-admin-bad">{formError}</p> : null}

      <div className="flex flex-wrap justify-end gap-3">
        <Button onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={saving || uploading}>
          {saving ? "Guardando…" : zone ? "Guardar cambios" : "Crear zona"}
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function ZonesManager() {
  const { status, can, properties } = useAdmin();
  const allowed = status === "ready" && can("properties:write");
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [zones, setZones] = useState<Zone[]>([]);
  const [editing, setEditing] = useState<Zone | "new" | null>(null);
  const [deleting, setDeleting] = useState<Zone | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    fetch("/api/admin/zones", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !Array.isArray(data.zones)) {
          setLoad({ state: "error", message: data.error ?? "No pudimos cargar las zonas." });
          return;
        }
        setZones(data.zones);
        setLoad({ state: "ready" });
      })
      .catch(() => {
        if (!cancelled) setLoad({ state: "error", message: "No pudimos conectar con el servidor." });
      });
    return () => {
      cancelled = true;
    };
  }, [allowed, reloadKey]);

  const countFor = (name: string) => properties.filter((p) => p.zone === name).length;
  const homeCount = zones.filter((z) => z.showOnHome).length;

  /** Save the whole list; the server renames the zone on properties when needed. */
  async function save(next: Zone[]): Promise<Result> {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/zones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zones: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !Array.isArray(data.zones)) {
        // Field errors come back keyed "<index>.<field>"; the form only needs the field.
        const errors: ZoneErrors = {};
        for (const [key, msg] of Object.entries((data.errors ?? {}) as ZoneErrors)) {
          errors[key.split(".").pop() ?? key] = msg;
        }
        return { ok: false, error: data.error ?? "No pudimos guardar las zonas.", errors };
      }
      setZones(data.zones);
      setNotice(null);
      return { ok: true };
    } catch {
      return { ok: false, error: "No pudimos conectar con el servidor." };
    } finally {
      setBusy(false);
    }
  }

  async function quick(next: Zone[]) {
    const result = await save(next);
    if (!result.ok) setNotice(result.error);
  }

  async function submitForm(form: FormState): Promise<Result> {
    const values = {
      name: form.name.trim(),
      blurb: form.blurb.trim(),
      image: form.image,
      lat: Number(form.lat),
      lng: Number(form.lng),
      showOnHome: form.showOnHome,
    };
    const next =
      editing === "new"
        ? [...zones, { id: uniqueId(values.name, zones), ...values }]
        : zones.map((z) => (editing && z.id === editing.id ? { ...z, ...values } : z));
    const result = await save(next);
    if (result.ok) setEditing(null);
    return result;
  }

  const move = (i: number, dir: -1 | 1) => {
    const next = [...zones];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    void quick(next);
  };

  if (status === "loading") return <Spinner />;
  if (!allowed) {
    return <EmptyState title="Acceso restringido" body="Tu rol no tiene permiso para editar las zonas." />;
  }

  return (
    <div data-rise>
      <PageHeader
        eyebrow="Catálogo"
        title="Zonas"
        actions={
          <Button variant="primary" onClick={() => setEditing("new")} disabled={load.state !== "ready" || zones.length >= MAX_ZONES}>
            <Plus className="size-4" aria-hidden />
            Nueva zona
          </Button>
        }
      />

      <p className="-mt-4 mb-6 text-sm text-admin-muted">
        En la página de inicio: {homeCount}/{MAX_HOME_ZONES}. El orden de la lista es el orden en el sitio y en el
        selector de zona de las propiedades.
      </p>

      <div aria-live="polite" className="min-h-6">
        {notice ? <p className="mb-4 text-sm text-admin-bad">{notice}</p> : null}
      </div>

      {load.state === "loading" ? (
        <Spinner label="Cargando zonas" />
      ) : load.state === "error" ? (
        <EmptyState
          title="No pudimos cargar las zonas"
          body={load.message}
          action={
            <Button onClick={() => { setLoad({ state: "loading" }); setReloadKey((k) => k + 1); }}>
              Reintentar
            </Button>
          }
        />
      ) : zones.length === 0 ? (
        <EmptyState
          title="Todavía no hay zonas"
          body="Creá la primera zona para poder asignarla a las propiedades."
          action={<Button variant="primary" onClick={() => setEditing("new")}>Nueva zona</Button>}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {zones.map((zone, i) => {
            const count = countFor(zone.name);
            const homeBlocked = !zone.showOnHome && homeCount >= MAX_HOME_ZONES;
            return (
              <li key={zone.id}>
                <GlassCard className="flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-video bg-admin-field">
                    <Image src={zone.image} alt="" fill sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-title-3">{zone.name}</h2>
                      {zone.showOnHome ? <Badge tone="accent">En inicio</Badge> : null}
                    </div>
                    <p className="mt-1 text-sm text-admin-muted">
                      {count} {count === 1 ? "propiedad" : "propiedades"}
                    </p>
                    {zone.blurb ? <p className="mt-3 text-sm">{zone.blurb}</p> : null}
                    <div className="mt-auto flex flex-wrap pt-4">
                      <IconButton
                        label={
                          zone.showOnHome
                            ? `Quitar ${zone.name} de la página de inicio`
                            : homeBlocked
                              ? `Ya hay ${MAX_HOME_ZONES} zonas en la página de inicio`
                              : `Mostrar ${zone.name} en la página de inicio`
                        }
                        aria-pressed={zone.showOnHome}
                        disabled={busy || homeBlocked}
                        onClick={() => quick(zones.map((z) => (z.id === zone.id ? { ...z, showOnHome: !z.showOnHome } : z)))}
                        className={cn(zone.showOnHome && "text-admin-accent")}
                      >
                        <House className="size-4" fill={zone.showOnHome ? "currentColor" : "none"} aria-hidden />
                      </IconButton>
                      <IconButton label={`Subir ${zone.name}`} disabled={busy || i === 0} onClick={() => move(i, -1)}>
                        <ArrowUp className="size-4" aria-hidden />
                      </IconButton>
                      <IconButton label={`Bajar ${zone.name}`} disabled={busy || i === zones.length - 1} onClick={() => move(i, 1)}>
                        <ArrowDown className="size-4" aria-hidden />
                      </IconButton>
                      <IconButton label={`Editar ${zone.name}`} disabled={busy} onClick={() => setEditing(zone)}>
                        <Pencil className="size-4" aria-hidden />
                      </IconButton>
                      <IconButton
                        label={count > 0 ? `${zone.name} tiene propiedades; cambialas de zona para eliminarla` : `Eliminar ${zone.name}`}
                        disabled={busy || count > 0 || zones.length === 1}
                        onClick={() => setDeleting(zone)}
                        className="hover:text-admin-bad"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </IconButton>
                    </div>
                  </div>
                </GlassCard>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Nueva zona" : "Editar zona"}>
        {editing !== null ? (
          <ZoneForm
            key={editing === "new" ? "new" : editing.id}
            zone={editing === "new" ? null : editing}
            homeFull={homeCount >= MAX_HOME_ZONES}
            propertyCount={editing === "new" ? 0 : countFor(editing.name)}
            onSubmit={submitForm}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar zona"
        body={deleting ? `¿Eliminar ${deleting.name}? Esta acción no se puede deshacer.` : ""}
        confirmLabel="Eliminar"
        onConfirm={() => deleting && quick(zones.filter((z) => z.id !== deleting.id))}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

function uniqueId(name: string, zones: Zone[]): string {
  const base = slugify(name);
  let id = base;
  for (let n = 2; zones.some((z) => z.id === id); n++) id = `${base}-${n}`;
  return id;
}
