"use client";

import { useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { Plus, Upload, X } from "lucide-react";
import type {
  AdminProperty,
  Currency,
  ListingType,
  PublishStatus,
  SessionUser,
} from "@/types/admin";
import type { PropertyInput } from "@/lib/admin/admin-context";
import type { PropertyType, PropertyZone } from "@/types/property";
import { uploadImage } from "@/lib/admin/upload-image";
import type { PropertyTypeDef } from "@/lib/property-types";
import { Button, Field, inputClass } from "./ui";

interface FormState {
  title: string;
  listingType: ListingType;
  price: string;
  currency: Currency;
  location: string;
  bedrooms: string;
  bathrooms: string;
  areaM2: string;
  commonExpenses: string;
  annualTaxes: string;
  /** Property ID (also its public URL). Empty on a new property = generated. */
  propertyId: string;
  listingNumber: string;
  padron: string;
  frontage: string;
  features: string[];
  /** Gallery in display order; the first photo is the cover. */
  photos: string[];
  description: string;
  status: PublishStatus;
  assignedAgentId: string;
  zone: PropertyZone;
  propertyType: PropertyType;
  featured: boolean;
  hero: boolean;
}


const empty: FormState = {
  title: "",
  listingType: "sale",
  price: "",
  currency: "USD",
  location: "",
  bedrooms: "0",
  bathrooms: "0",
  areaM2: "",
  commonExpenses: "",
  annualTaxes: "",
  propertyId: "",
  listingNumber: "",
  padron: "",
  frontage: "",
  features: [],
  photos: [],
  description: "",
  status: "draft",
  assignedAgentId: "",
  zone: "",
  propertyType: "house",
  featured: false,
  hero: false,
};

function fromProperty(p: AdminProperty): FormState {
  return {
    title: p.title,
    listingType: p.listingType,
    price: String(p.price),
    currency: p.currency,
    location: p.location,
    bedrooms: String(p.bedrooms),
    bathrooms: String(p.bathrooms),
    areaM2: String(p.areaM2),
    commonExpenses: p.commonExpenses === undefined ? "" : String(p.commonExpenses),
    annualTaxes: p.annualTaxes === undefined ? "" : String(p.annualTaxes),
    propertyId: p.id,
    listingNumber: p.listingNumber ?? "",
    padron: p.padron ?? "",
    frontage: p.frontage === undefined ? "" : String(p.frontage),
    features: p.features,
    photos: [...new Set([p.imageUrl, ...(p.images ?? [])].filter(Boolean))],
    description: p.description,
    status: p.status,
    assignedAgentId: p.assignedAgentId ?? "",
    zone: p.zone ?? "",
    // Records saved before the category change may still say "penthouse".
    propertyType: (p.propertyType as string) === "penthouse" ? "apartment" : (p.propertyType ?? "house"),
    featured: !!p.featured,
    hero: !!p.hero,
  };
}

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const errors: Errors = {};
  if (f.propertyId.trim() && !/^[a-zA-Z0-9_-]{1,40}$/.test(f.propertyId.trim())) {
    errors.propertyId = "Solo letras, números y guiones (hasta 40).";
  }
  if (!f.title.trim()) errors.title = "El título es obligatorio.";
  if (!f.location.trim()) errors.location = "La ubicación es obligatoria.";
  if (!(Number(f.price) > 0)) errors.price = "Ingresá un precio mayor a 0.";
  if (!(Number(f.areaM2) > 0)) errors.areaM2 = "Ingresá la superficie en m².";
  for (const key of ["bedrooms", "bathrooms"] as const) {
    if (!(Number.isInteger(Number(f[key])) && Number(f[key]) >= 0)) {
      errors[key] = "Usá un número entero, 0 o más.";
    }
  }
  return errors;
}

const MAX_PHOTOS = 10;
export function PropertyForm({
  property,
  agents,
  zones,
  types,
  featuredFull,
  heroFull,
  onSubmit,
  onCancel,
}: {
  property: AdminProperty | null;
  agents: SessionUser[];
  /** Zone names from the "Zonas" page, in display order. */
  zones: string[];
  /** Property types from the "Tipos" page, in display order. */
  types: PropertyTypeDef[];
  /** True when 5 other properties already hold the slot, so this one cannot take it. */
  featuredFull: boolean;
  heroFull: boolean;
  /** Resolves with the server's answer so a refusal is shown inside the dialog. */
  onSubmit: (input: PropertyInput) => Promise<{ ok: true } | { ok: false; error: string }>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    property ? fromProperty(property) : { ...empty, zone: zones[0] ?? "", propertyType: types[0]?.id ?? "house" },
  );
  // Keep a zone that was since removed or renamed selectable instead of silently switching it.
  const zoneOptions = form.zone && !zones.includes(form.zone) ? [form.zone, ...zones] : zones;
  const typeOptions = types.some((t) => t.id === form.propertyType)
    ? types
    : [{ id: form.propertyType, label: form.propertyType, built: true }, ...types];
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  /** Shown next to the save button: the server's refusal, or a pointer to invalid fields above. */
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [featureDraft, setFeatureDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState("");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function onPickImages(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploadError(null);
    const room = MAX_PHOTOS - form.photos.length;
    if (room <= 0) return setUploadError(`Máximo ${MAX_PHOTOS} fotos por propiedad.`);
    setUploading(true);
    const added: string[] = [];
    const problems: string[] = [];
    for (const file of files.slice(0, room)) {
      try {
        added.push(await uploadImage(file, "/properties"));
      } catch (err) {
        problems.push(err instanceof Error ? err.message : "No pudimos subir la imagen.");
      }
    }
    if (files.length > room) problems.push(`Solo se admiten ${MAX_PHOTOS} fotos; se ignoraron ${files.length - room}.`);
    if (added.length) setForm((f) => ({ ...f, photos: [...f.photos, ...added].slice(0, MAX_PHOTOS) }));
    if (problems.length) setUploadError(problems.join(" "));
    setUploading(false);
  }

  function addPhotoUrl() {
    const url = urlDraft.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) return setUploadError("Usá una URL completa que empiece con http(s)://");
    if (form.photos.length >= MAX_PHOTOS) return setUploadError(`Máximo ${MAX_PHOTOS} fotos por propiedad.`);
    setUploadError(null);
    if (!form.photos.includes(url)) set("photos", [...form.photos, url]);
    setUrlDraft("");
  }

  const makeCover = (i: number) => set("photos", [form.photos[i], ...form.photos.filter((_, j) => j !== i)]);
  const removePhoto = (i: number) => set("photos", form.photos.filter((_, j) => j !== i));

  function addFeature() {
    const value = featureDraft.trim();
    if (value && !form.features.includes(value)) set("features", [...form.features, value]);
    setFeatureDraft("");
  }

  function onFeatureKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault(); // don't submit the whole form
      addFeature();
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // The invalid field may be scrolled out of view in this long dialog.
      setSubmitError("Revisá los campos marcados en rojo.");
      return;
    }
    setSubmitError(null);
    setSaving(true);
    const result = await onSubmit({
      ...(property ? { id: property.id } : {}),
      newId: form.propertyId.trim(),
      title: form.title.trim(),
      listingType: form.listingType,
      price: Number(form.price),
      currency: form.currency,
      location: form.location.trim(),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      areaM2: Number(form.areaM2),
      commonExpenses: form.commonExpenses.trim() ? Number(form.commonExpenses) : null,
      annualTaxes: form.annualTaxes.trim() ? Number(form.annualTaxes) : null,
      listingNumber: form.listingNumber.trim(),
      padron: form.padron.trim(),
      frontage: form.frontage.trim() ? Number(form.frontage) : null,
      features: form.features,
      imageUrl: form.photos[0] ?? "",
      images: form.photos,
      description: form.description.trim(),
      status: form.status,
      assignedAgentId: form.assignedAgentId || null,
      zone: form.zone,
      propertyType: form.propertyType,
      featured: form.featured,
      hero: form.hero,
    });
    setSaving(false);
    if (!result.ok) setSubmitError(result.error);
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="ID de la propiedad"
          error={errors.propertyId}
          hint={
            property
              ? form.propertyId.trim() && form.propertyId.trim() !== property.id
                ? `La dirección pasa a /propiedades/${form.propertyId.trim()}; la anterior deja de funcionar.`
                : `Dirección pública: /propiedades/${property.id}`
              : "Opcional. Si lo dejás vacío se genera solo."
          }
        >
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              value={form.propertyId}
              maxLength={40}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => set("propertyId", e.target.value.replace(/\s+/g, "-"))}
              placeholder="1365"
              className={inputClass}
            />
          )}
        </Field>
        <Field label="N.º de referencia" hint="Opcional. Único por propiedad.">
          {({ id, describedBy }) => (
            <input id={id} aria-describedby={describedBy} value={form.listingNumber} maxLength={30} onChange={(e) => set("listingNumber", e.target.value)} placeholder="TR-0001" className={inputClass} />
          )}
        </Field>
      </div>

      <div>
        <Field label="Título" error={errors.title}>
          {({ id, describedBy, invalid }) => (
            <input id={id} aria-invalid={invalid} aria-describedby={describedBy} value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
          )}
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tipo de operación">
          {({ id }) => (
            <select id={id} value={form.listingType} onChange={(e) => set("listingType", e.target.value as ListingType)} className={inputClass}>
              <option value="sale">En venta</option>
              <option value="rent">En alquiler</option>
            </select>
          )}
        </Field>
        <Field label="Estado">
          {({ id }) => (
            <select id={id} value={form.status} onChange={(e) => set("status", e.target.value as PublishStatus)} className={inputClass}>
              <option value="draft">Borrador</option>
              <option value="published">Publicada</option>
            </select>
          )}
        </Field>
        <Field label="Precio" error={errors.price}>
          {({ id, describedBy, invalid }) => (
            <input id={id} type="number" min="0" inputMode="decimal" aria-invalid={invalid} aria-describedby={describedBy} value={form.price} onChange={(e) => set("price", e.target.value)} className={inputClass} />
          )}
        </Field>
        <Field label="Moneda">
          {({ id }) => (
            <select id={id} value={form.currency} onChange={(e) => set("currency", e.target.value as Currency)} className={inputClass}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="UYU">UYU</option>
            </select>
          )}
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Zona">
          {({ id }) => (
            <select id={id} value={form.zone} onChange={(e) => set("zone", e.target.value as PropertyZone)} className={inputClass}>
              {zoneOptions.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Tipo de propiedad">
          {({ id }) => (
            <select id={id} value={form.propertyType} onChange={(e) => set("propertyType", e.target.value as PropertyType)} className={inputClass}>
              {typeOptions.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <Field label="Ubicación" error={errors.location}>
        {({ id, describedBy, invalid }) => (
          <input id={id} aria-invalid={invalid} aria-describedby={describedBy} value={form.location} onChange={(e) => set("location", e.target.value)} className={inputClass} placeholder="José Ignacio, Maldonado" />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Dormitorios" error={errors.bedrooms}>
          {({ id, describedBy, invalid }) => (
            <input id={id} type="number" min="0" aria-invalid={invalid} aria-describedby={describedBy} value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} className={inputClass} />
          )}
        </Field>
        <Field label="Baños" error={errors.bathrooms}>
          {({ id, describedBy, invalid }) => (
            <input id={id} type="number" min="0" aria-invalid={invalid} aria-describedby={describedBy} value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} className={inputClass} />
          )}
        </Field>
        <Field label="Superficie (m²)" error={errors.areaM2}>
          {({ id, describedBy, invalid }) => (
            <input id={id} type="number" min="0" aria-invalid={invalid} aria-describedby={describedBy} value={form.areaM2} onChange={(e) => set("areaM2", e.target.value)} className={inputClass} />
          )}
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Gastos comunes (mensual)" hint="Opcional. Se muestra en el desglose de costos.">
          {({ id, describedBy }) => (
            <input id={id} type="number" min="0" aria-describedby={describedBy} value={form.commonExpenses} onChange={(e) => set("commonExpenses", e.target.value)} className={inputClass} />
          )}
        </Field>
        <Field label="Impuestos (anual)" hint="Opcional. Contribución inmobiliaria e impuesto de primaria.">
          {({ id, describedBy }) => (
            <input id={id} type="number" min="0" aria-describedby={describedBy} value={form.annualTaxes} onChange={(e) => set("annualTaxes", e.target.value)} className={inputClass} />
          )}
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Padrón" hint="Opcional. Número de padrón catastral.">
          {({ id, describedBy }) => (
            <input id={id} aria-describedby={describedBy} value={form.padron} onChange={(e) => set("padron", e.target.value)} className={inputClass} />
          )}
        </Field>
        <Field label="Frente (m)" hint="Opcional. Medida del frente en metros.">
          {({ id, describedBy }) => (
            <input id={id} type="number" min="0" step="any" aria-describedby={describedBy} value={form.frontage} onChange={(e) => set("frontage", e.target.value)} className={inputClass} />
          )}
        </Field>
      </div>

      <Field label="Características" hint="Escribí una característica y presioná Enter.">
        {({ id, describedBy }) => (
          <>
            <div className="flex gap-2">
              <input id={id} aria-describedby={describedBy} value={featureDraft} onChange={(e) => setFeatureDraft(e.target.value)} onKeyDown={onFeatureKey} className={inputClass} placeholder="Piscina privada" />
              <Button onClick={addFeature} aria-label="Agregar característica" className="px-3">
                <Plus className="size-4" aria-hidden />
              </Button>
            </div>
            {form.features.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {form.features.map((feature) => (
                  <li key={feature} className="inline-flex items-center gap-1 rounded-full border border-admin-line py-1 pl-3 pr-1 text-sm">
                    {feature}
                    <button
                      type="button"
                      aria-label={`Quitar ${feature}`}
                      onClick={() => set("features", form.features.filter((f) => f !== feature))}
                      className="inline-flex size-8 items-center justify-center rounded-full text-admin-muted hover:bg-admin-panel-strong hover:text-admin-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
                    >
                      <X className="size-3" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </Field>

      <div>
        <p className="mb-2 text-footnote font-medium text-admin-ink">Fotos ({form.photos.length}/{MAX_PHOTOS})</p>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-admin-line px-4 py-6 text-center text-admin-muted focus-within:ring-2 focus-within:ring-admin-ink">
          <Upload className="size-5" aria-hidden />
          <span className="text-sm">{uploading ? "Subiendo…" : "Subir fotos (JPG, PNG o WebP, se convierten a WebP, hasta 10 MB cada una)"}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={uploading} onChange={onPickImages} />
        </label>
        {uploadError ? <p role="alert" className="mt-2 text-sm text-admin-bad">{uploadError}</p> : null}
        <div className="mt-4 flex gap-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPhotoUrl();
              }
            }}
            aria-label="Agregar foto por URL"
            className={inputClass}
            placeholder="O pegá la URL de una foto…"
          />
          <button type="button" onClick={addPhotoUrl} className="min-h-11 shrink-0 rounded-xl border border-admin-line px-4 text-sm">Agregar</button>
        </div>
        {form.photos.length > 0 ? (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {form.photos.map((url, i) => (
              <li key={url} className="relative overflow-hidden rounded-xl border border-admin-line">
                {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied host */}
                <img src={url} alt={`Foto ${i + 1} de la propiedad`} className="h-28 w-full object-cover" />
                {i === 0 ? (
                  <span className="absolute left-2 top-2 rounded-full bg-admin-accent px-2 py-0.5 text-caption font-medium text-admin-accent-ink">Portada</span>
                ) : null}
                <div className="flex justify-between gap-1 p-1.5 text-xs">
                  {i === 0 ? <span /> : (
                    <button type="button" onClick={() => makeCover(i)} className="inline-flex min-h-11 items-center rounded-lg px-2 underline">Hacer portada</button>
                  )}
                  <button type="button" onClick={() => removePhoto(i)} className="inline-flex min-h-11 items-center rounded-lg px-2 text-admin-bad underline" aria-label={`Quitar foto ${i + 1}`}>Quitar</button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {agents.length > 0 ? (
        <Field label="Agente asignado">
          {({ id }) => (
            <select id={id} value={form.assignedAgentId} onChange={(e) => set("assignedAgentId", e.target.value)} className={inputClass}>
              <option value="">Sin asignar</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.fullName}</option>
              ))}
            </select>
          )}
        </Field>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="mb-2 text-footnote font-medium text-admin-ink">Página principal</legend>
        {([
          { key: "featured", label: "Propiedad destacada", full: featuredFull, hint: "Aparece en “Propiedades destacadas” (máx. 5)." },
          { key: "hero", label: "Mostrar en el hero", full: heroFull, hint: "Aparece en el carrusel principal (máx. 5)." },
        ] as const).map(({ key, label, full, hint }) => {
          const blocked = full && !property?.[key] && !form[key];
          return (
            <label key={key} className={`flex min-h-11 items-start gap-3 text-sm ${blocked ? "opacity-60" : "cursor-pointer"}`}>
              <input
                type="checkbox"
                checked={form[key]}
                disabled={blocked}
                onChange={(e) => set(key, e.target.checked)}
                className="mt-0.5 size-5 accent-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
              />
              <span>
                {label}
                <span className="block text-admin-muted">
                  {blocked ? "Ya hay 5. Quitá una desde la lista para liberar un lugar." : hint}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <Field label="Descripción">
        {({ id }) => (
          <textarea id={id} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} className={`${inputClass} py-3`} />
        )}
      </Field>

      {submitError ? (
        <p role="alert" className="rounded-xl bg-admin-bad/10 px-4 py-3 text-callout text-admin-bad">
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <Button onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Guardando…" : property ? "Guardar cambios" : "Crear propiedad"}
        </Button>
      </div>
    </form>
  );
}
