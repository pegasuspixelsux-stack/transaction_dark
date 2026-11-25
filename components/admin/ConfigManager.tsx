"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { Plus, Save, Trash2, Upload } from "lucide-react";
import { uploadImage, type UploadOptions } from "@/lib/admin/upload-image";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/lib/admin/admin-context";
import { AGENT_FLAG, isAgentEnabled, type ConfigErrors, type SiteConfig } from "@/lib/site-config";
import {
  Button,
  EmptyState,
  Field,
  GlassCard,
  IconButton,
  PageHeader,
  Spinner,
  inputClass,
} from "@/components/admin/ui";

type LogoField = "logoUrl" | "logoDarkUrl";
type ImageField = LogoField | "faviconUrl" | "ogImageUrl";

/** How each uploaded image is prepared before it is stored. */
const UPLOAD_OPTIONS: Record<ImageField, UploadOptions> = {
  // Logos ship as padded squares: trim the empty border, cap at 320px (40px tall × 3x screens).
  logoUrl: { trim: true, maxEdge: 320 },
  logoDarkUrl: { trim: true, maxEdge: 320 },
  // PNG is the favicon format every browser accepts; 512px covers tabs, bookmarks and home screens.
  faviconUrl: { trim: true, square: 512, type: "image/png" },
  // The size WhatsApp, Facebook, LinkedIn and X expect; JPEG is supported by every preview crawler.
  ogImageUrl: { cover: { width: 1200, height: 630 }, type: "image/jpeg" },
};

const LOGO_SLOTS: { field: LogoField; title: string; bg: string; mutedText: string }[] = [
  { field: "logoUrl", title: "Logo para fondo claro", bg: "bg-[#eaf4fb]", mutedText: "text-admin-muted" },
  { field: "logoDarkUrl", title: "Logo para fondo oscuro", bg: "bg-[#0a1a2e]", mutedText: "text-white/70" },
];

const MEDIA_SLOTS: { field: "faviconUrl" | "ogImageUrl"; title: string; hint: string }[] = [
  {
    field: "faviconUrl",
    title: "Favicon",
    hint: "Imagen cuadrada, idealmente 512×512. Se recorta el margen y se guarda como PNG.",
  },
  {
    field: "ogImageUrl",
    title: "Imagen para compartir (Open Graph)",
    hint: "Se recorta al centro en 1200×630 y se guarda como JPG. Dejá el contenido importante en el centro.",
  },
];

type Load =
  | { state: "loading" }
  | { state: "auth" }
  | { state: "error"; message: string }
  | { state: "ready" };

/** Immutable set by dotted path ("contact.phones.0"). */
function setIn<T>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  const clone: unknown = Array.isArray(obj) ? [...obj] : { ...(obj as object) };
  const bag = clone as Record<string, unknown>;
  bag[head] = rest.length ? setIn(bag[head] ?? (/^\d+$/.test(rest[0]) ? [] : {}), rest.join("."), value) : value;
  return clone as T;
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <GlassCard className="p-6">
      <h2 className="text-title-3">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-admin-muted">{hint}</p> : null}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </GlassCard>
  );
}

export function ConfigManager() {
  const { status, user, can, login } = useAdmin();
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [draft, setDraft] = useState<SiteConfig | null>(null);
  const [errors, setErrors] = useState<ConfigErrors>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  const [flagDraft, setFlagDraft] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthError, setReauthError] = useState<string | null>(null);
  const [reauthBusy, setReauthBusy] = useState(false);
  /** Which logo slot is uploading, and per-slot upload errors. */
  const [logoUploading, setLogoUploading] = useState<ImageField | null>(null);
  const [logoError, setLogoError] = useState<Partial<Record<ImageField, string>>>({});

  const allowed = status === "ready" && can("config:manage");

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    fetch("/api/admin/config", { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as { config?: SiteConfig; error?: string };
        if (cancelled) return;
        if (res.ok && data.config) {
          setDraft(data.config);
          setLoad({ state: "ready" });
        } else if (res.status === 401) {
          setLoad({ state: "auth" });
        } else {
          setLoad({ state: "error", message: data.error ?? "No pudimos cargar la configuración." });
        }
      })
      .catch(() => {
        if (!cancelled) setLoad({ state: "error", message: "No pudimos conectar con el servidor." });
      });
    return () => {
      cancelled = true;
    };
  }, [allowed, reloadKey]);

  async function reauthenticate(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setReauthBusy(true);
    setReauthError(null);
    try {
      const result = await login(user.email, reauthPassword);
      if (result.ok) {
        setReauthPassword("");
        if (draft) {
          // Unsaved edits are kept; just let the admin save again.
          setLoad({ state: "ready" });
          setNotice({ tone: "ok", text: "Sesión verificada. Guardá los cambios de nuevo." });
        } else {
          setLoad({ state: "loading" });
          setReloadKey((k) => k + 1);
        }
      } else {
        setReauthError(result.error);
      }
    } catch {
      setReauthError("No pudimos conectar con el servidor.");
    } finally {
      setReauthBusy(false);
    }
  }

  if (status === "loading" || !user) return <Spinner />;
  if (!allowed) {
    return (
      <EmptyState
        title="Acceso no autorizado"
        body="La configuración del sitio está limitada a administradores."
      />
    );
  }
  if (load.state === "loading") return <Spinner />;
  if (load.state === "auth") {
    return (
      <div data-rise>
        <PageHeader eyebrow="Negocio" title="Configuración del sitio" />
        <GlassCard className="max-w-md p-6">
          <h2 className="text-title-3">Confirmá tu identidad</h2>
          <p className="mt-2 text-sm text-admin-muted">
            Para editar la configuración, el servidor necesita verificar tu contraseña ({user.email}).
          </p>
          <form onSubmit={reauthenticate} noValidate className="mt-5 space-y-4">
            <Field label="Contraseña" error={reauthError ?? undefined}>
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  className={inputClass}
                />
              )}
            </Field>
            <Button type="submit" variant="primary" disabled={reauthBusy || !reauthPassword}>
              {reauthBusy ? "Verificando…" : "Verificar"}
            </Button>
          </form>
        </GlassCard>
      </div>
    );
  }
  if (load.state === "error" || !draft) {
    return (
      <div data-rise>
        <PageHeader eyebrow="Negocio" title="Configuración del sitio" />
        <p role="alert" className="text-sm text-admin-bad">
          {load.state === "error" ? load.message : "No pudimos cargar la configuración."}
        </p>
      </div>
    );
  }

  const set = (path: string, value: unknown) => {
    setDraft((d) => (d ? setIn(d, path, value) : d));
    setNotice(null);
  };
  const get = (path: string): string => {
    const v = path.split(".").reduce<unknown>((acc, k) => (acc as Record<string, unknown> | undefined)?.[k], draft);
    return v === undefined || v === null ? "" : String(v);
  };

  const text = (label: string, path: string, extra?: { type?: string; placeholder?: string; hint?: string; className?: string }) => (
    <Field label={label} error={errors[path]} hint={extra?.hint} className={extra?.className}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          type={extra?.type ?? "text"}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          value={get(path)}
          placeholder={extra?.placeholder}
          onChange={(e) =>
            set(path, extra?.type === "number" ? e.target.value : e.target.value)
          }
          className={inputClass}
        />
      )}
    </Field>
  );

  async function onPickLogo(field: ImageField, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLogoError((er) => ({ ...er, [field]: undefined }));
    setLogoUploading(field);
    try {
      set(`agency.${field}`, await uploadImage(file, "/branding", UPLOAD_OPTIONS[field]));
    } catch (err) {
      setLogoError((er) => ({ ...er, [field]: err instanceof Error ? err.message : "No pudimos subir el logo." }));
    } finally {
      setLogoUploading(null);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setNotice(null);
    setErrors({});
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          address: {
            ...draft.address,
            coordinates: {
              lat: Number(draft.address.coordinates.lat),
              lng: Number(draft.address.coordinates.lng),
            },
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        config?: SiteConfig;
        error?: string;
        errors?: ConfigErrors;
      };
      if (res.ok && data.config) {
        setDraft(data.config);
        setNotice({ tone: "ok", text: "Configuración guardada correctamente. Los nuevos cambios ya están activos." });
      } else {
        if (data.errors) setErrors(data.errors);
        if (res.status === 401) setLoad({ state: "auth" });
        else setNotice({ tone: "bad", text: data.error ?? "No pudimos guardar los cambios." });
      }
    } catch {
      setNotice({ tone: "bad", text: "No pudimos conectar con el servidor." });
    } finally {
      setSaving(false);
    }
  }

  const phones = [draft.contact.phones[0] ?? "", draft.contact.phones[1] ?? ""];
  const emails = [draft.contact.emails[0] ?? "", draft.contact.emails[1] ?? ""];
  const flagEntries = Object.entries(draft.flags).filter(([key]) => key !== AGENT_FLAG);

  function addFlag() {
    const key = flagDraft.trim();
    if (!key) return;
    set("flags", { ...draft!.flags, [key]: false });
    setFlagDraft("");
  }

  return (
    <div data-rise>
      <PageHeader
        eyebrow="Negocio"
        title="Configuración del sitio"
        actions={
          <Button type="submit" variant="primary" form="config-form" disabled={saving}>
            <Save className="size-4" aria-hidden />
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        }
      />

      <div aria-live="polite" className="min-h-6">
        {notice ? (
          <p className={`mb-4 text-sm ${notice.tone === "ok" ? "text-admin-ok" : "text-admin-bad"}`}>
            {notice.text}
          </p>
        ) : null}
      </div>

      <form id="config-form" onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6 lg:col-span-2">
          <h2 className="text-title-3">Logo</h2>
          <p className="mt-1 max-w-prose text-footnote text-admin-muted">
            Se muestra junto al nombre en el menú superior, el pie de página y el panel. Subí una versión para fondos
            claros y otra para fondos oscuros (tema oscuro del sitio y barra lateral del panel). Si subís solo una, se usa
            en ambos. PNG, JPG o WebP: se recorta el margen vacío, se achica a 320 px y se convierte a WebP.
          </p>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            {LOGO_SLOTS.map(({ field, title, bg, mutedText }) => {
              const url = draft.agency[field];
              const fallback = draft.agency[field === "logoUrl" ? "logoDarkUrl" : "logoUrl"];
              const shown = url || fallback;
              const error = logoError[field] || errors[`agency.${field}`];
              const busy = logoUploading === field;
              return (
                <div key={field}>
                  <p className="mb-2 text-footnote font-medium text-admin-ink">{title}</p>
                  <div className={cn("flex h-20 items-center justify-center rounded-xl border border-admin-line", bg)}>
                    {shown ? (
                      <Image src={shown} alt="" width={160} height={48} className={cn("h-12 w-auto max-w-40 object-contain", !url && "opacity-60")} />
                    ) : (
                      <span className={cn("text-footnote", mutedText)}>Sin logo</span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <label
                      className={cn(
                        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900/[0.05] px-5 text-callout font-medium text-admin-ink transition-colors duration-150 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-admin-accent",
                        busy ? "cursor-wait opacity-60" : "cursor-pointer hover:bg-slate-900/[0.08] active:bg-slate-900/[0.11]",
                      )}
                    >
                      <Upload className="size-4" aria-hidden />
                      {busy ? "Subiendo…" : url ? "Cambiar" : "Subir"}
                      <input
                        type="file"
                        accept="image/png,image/webp,image/jpeg"
                        aria-label={`Subir ${title.toLowerCase()}`}
                        className="sr-only"
                        disabled={logoUploading !== null}
                        onChange={(e) => onPickLogo(field, e)}
                      />
                    </label>
                    {url ? (
                      <Button variant="danger" onClick={() => set(`agency.${field}`, "")}>
                        <Trash2 className="size-4" aria-hidden />
                        Quitar
                      </Button>
                    ) : null}
                  </div>
                  <p role={error ? "alert" : undefined} className={cn("mt-2 text-footnote", error ? "text-admin-bad" : "text-admin-muted")}>
                    {error || (!url && fallback ? "Usando el otro logo." : " ")}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-footnote text-admin-muted">Guardá los cambios para publicarlos.</p>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2">
          <h2 className="text-title-3">Favicon y vista previa al compartir</h2>
          <p className="mt-1 max-w-prose text-footnote text-admin-muted">
            El favicon es el ícono de la pestaña del navegador. La vista previa (Open Graph) es la imagen que aparece al
            compartir un enlace del sitio en WhatsApp, Facebook, LinkedIn o X.
          </p>
          <div className="mt-5 grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            {MEDIA_SLOTS.map(({ field, title, hint }) => {
              const url = draft.agency[field];
              const error = logoError[field] || errors[`agency.${field}`];
              const busy = logoUploading === field;
              return (
                <div key={field}>
                  <p className="mb-2 text-footnote font-medium text-admin-ink">{title}</p>
                  {field === "faviconUrl" ? (
                    // Shown as a browser tab would show it.
                    <div className="flex h-[7.5rem] items-center justify-center rounded-xl border border-admin-line bg-admin-panel">
                      <div className="flex max-w-full items-center gap-2 rounded-t-lg bg-white px-3 py-2 shadow-sm">
                        {url ? (
                          <Image src={url} alt="" width={16} height={16} className="size-4" />
                        ) : (
                          <span aria-hidden className="size-4 rounded-sm bg-admin-line" />
                        )}
                        <span className="truncate text-footnote text-admin-ink">{draft.agency.name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-[1200/630] overflow-hidden rounded-xl border border-admin-line bg-admin-panel">
                      {url ? (
                        <Image src={url} alt="" fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-footnote text-admin-muted">Sin imagen</span>
                      )}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3">
                    <label
                      className={cn(
                        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900/[0.05] px-5 text-callout font-medium text-admin-ink transition-colors duration-150 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-admin-accent",
                        busy ? "cursor-wait opacity-60" : "cursor-pointer hover:bg-slate-900/[0.08] active:bg-slate-900/[0.11]",
                      )}
                    >
                      <Upload className="size-4" aria-hidden />
                      {busy ? "Subiendo…" : url ? "Cambiar" : "Subir"}
                      <input
                        type="file"
                        accept="image/png,image/webp,image/jpeg"
                        aria-label={`Subir ${title.toLowerCase()}`}
                        className="sr-only"
                        disabled={logoUploading !== null}
                        onChange={(e) => onPickLogo(field, e)}
                      />
                    </label>
                    {url ? (
                      <Button variant="danger" onClick={() => set(`agency.${field}`, "")}>
                        <Trash2 className="size-4" aria-hidden />
                        Quitar
                      </Button>
                    ) : null}
                  </div>
                  <p role={error ? "alert" : undefined} className={cn("mt-2 text-footnote", error ? "text-admin-bad" : "text-admin-muted")}>
                    {error || hint}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-footnote text-admin-muted">
            Guardá los cambios para publicarlos. WhatsApp y las redes guardan la vista previa un tiempo, así que un cambio
            puede tardar en verse en enlaces ya compartidos.
          </p>
        </GlassCard>

        <Section title="Información del negocio">
          {text("Nombre comercial / proyecto", "agency.name")}
          {text("Razón social", "agency.legalName")}
          {text("Eslogan", "agency.tagline", { className: "sm:col-span-2" })}
          {text("N.º de matrícula", "agency.licenseId")}
        </Section>

        <Section title="Dirección física">
          {text("Calle y número", "address.street", { className: "sm:col-span-2" })}
          {text("Ciudad", "address.city")}
          {text("Departamento", "address.region")}
          {text("País", "address.country")}
          {text("Código postal", "address.postalCode")}
          {text("Latitud", "address.coordinates.lat", { type: "number" })}
          {text("Longitud", "address.coordinates.lng", { type: "number" })}
        </Section>

        <Section title="Datos de contacto">
          <Field label="Teléfono principal" error={errors["contact.phones.0"]}>
            {({ id, describedBy, invalid }) => (
              <input id={id} type="tel" aria-invalid={invalid} aria-describedby={describedBy} value={phones[0]} onChange={(e) => set("contact.phones", [e.target.value, phones[1]])} className={inputClass} />
            )}
          </Field>
          <Field label="Teléfono secundario" error={errors["contact.phones.1"]}>
            {({ id, describedBy, invalid }) => (
              <input id={id} type="tel" aria-invalid={invalid} aria-describedby={describedBy} value={phones[1]} onChange={(e) => set("contact.phones", [phones[0], e.target.value])} className={inputClass} />
            )}
          </Field>
          <Field label="Correo de contacto" error={errors["contact.emails.0"]}>
            {({ id, describedBy, invalid }) => (
              <input id={id} type="email" aria-invalid={invalid} aria-describedby={describedBy} value={emails[0]} onChange={(e) => set("contact.emails", [e.target.value, emails[1]])} className={inputClass} />
            )}
          </Field>
          <Field label="Correo de soporte" error={errors["contact.emails.1"]}>
            {({ id, describedBy, invalid }) => (
              <input id={id} type="email" aria-invalid={invalid} aria-describedby={describedBy} value={emails[1]} onChange={(e) => set("contact.emails", [emails[0], e.target.value])} className={inputClass} />
            )}
          </Field>
        </Section>

        <Section title="WhatsApp">
          {text("Número principal", "whatsapp.primary.number", { type: "tel", placeholder: "+59899000000" })}
          {text("Número de soporte", "whatsapp.support.number", { type: "tel" })}
          <Field label="Mensaje predeterminado" error={errors["whatsapp.primary.defaultMessage"]} className="sm:col-span-2">
            {({ id, describedBy, invalid }) => (
              <textarea id={id} rows={3} aria-invalid={invalid} aria-describedby={describedBy} value={draft.whatsapp.primary.defaultMessage} onChange={(e) => set("whatsapp.primary.defaultMessage", e.target.value)} className={`${inputClass} py-3`} />
            )}
          </Field>
        </Section>

        <Section title="Redes sociales">
          {text("Instagram", "social.instagram", { type: "url", placeholder: "https://instagram.com/…" })}
          {text("Facebook", "social.facebook", { type: "url" })}
          {text("LinkedIn", "social.linkedin", { type: "url" })}
          {text("YouTube", "social.youtube", { type: "url" })}
        </Section>

        <GlassCard className="p-6">
          <h2 className="text-title-3">Enlaces externos</h2>
          <p className="mt-1 text-sm text-admin-muted">Sitios o recursos adicionales (hasta 20).</p>
          <ul className="mt-5 space-y-4">
            {draft.externalLinks.map((link, i) => (
              <li key={i} className="grid gap-3 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end">
                <Field label="Nombre" error={errors[`externalLinks.${i}.label`]}>
                  {({ id, describedBy, invalid }) => (
                    <input id={id} aria-invalid={invalid} aria-describedby={describedBy} value={link.label} onChange={(e) => set(`externalLinks.${i}.label`, e.target.value)} className={inputClass} />
                  )}
                </Field>
                <Field label="URL" error={errors[`externalLinks.${i}.url`]}>
                  {({ id, describedBy, invalid }) => (
                    <input id={id} type="url" aria-invalid={invalid} aria-describedby={describedBy} value={link.url} onChange={(e) => set(`externalLinks.${i}.url`, e.target.value)} className={inputClass} placeholder="https://…" />
                  )}
                </Field>
                <IconButton
                  label={`Quitar enlace ${link.label || i + 1}`}
                  className="hover:text-admin-bad"
                  onClick={() => set("externalLinks", draft.externalLinks.filter((_, j) => j !== i))}
                >
                  <Trash2 className="size-4" aria-hidden />
                </IconButton>
              </li>
            ))}
          </ul>
          <Button
            className="mt-5"
            disabled={draft.externalLinks.length >= 20}
            onClick={() => set("externalLinks", [...draft.externalLinks, { label: "", url: "" }])}
          >
            <Plus className="size-4" aria-hidden /> Agregar enlace
          </Button>
        </GlassCard>

        <Section title="Horario de atención">
          {text("Lunes a viernes", "hours.weekday")}
          {text("Sábado", "hours.saturday")}
          {text("Domingo", "hours.sunday")}
          {text("Feriados", "hours.holidays")}
        </Section>

        <GlassCard className="p-6">
          <h2 className="text-title-3">Notificaciones e indicadores</h2>
          <Field
            label="Correos que reciben las consultas nuevas"
            hint="Uno por línea."
            error={Object.keys(errors).find((k) => k.startsWith("notifications.")) ? "Revisá los correos ingresados." : undefined}
            className="mt-5"
          >
            {({ id, describedBy, invalid }) => (
              <textarea
                id={id}
                rows={3}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                value={draft.notifications.leadEmails.join("\n")}
                onChange={(e) => set("notifications.leadEmails", e.target.value.split("\n"))}
                className={`${inputClass} py-3`}
              />
            )}
          </Field>

          <p className="mb-2 mt-6 text-footnote font-medium text-admin-ink">Indicadores de funcionalidades</p>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 border-b border-admin-line text-sm">
            <input
              type="checkbox"
              checked={isAgentEnabled(draft)}
              onChange={(e) => set("flags", { ...draft.flags, [AGENT_FLAG]: e.target.checked })}
              className="size-5 accent-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
            />
            <span>Agente de chat (asistente en el sitio)</span>
          </label>
          {errors.flags ? <p role="alert" className="mb-2 text-sm text-admin-bad">{errors.flags}</p> : null}
          {flagEntries.length === 0 ? (
            <p className="text-sm text-admin-muted">Todavía no hay indicadores.</p>
          ) : (
            <ul className="divide-y divide-admin-line">
              {flagEntries.map(([key, on]) => (
                <li key={key} className="flex items-center justify-between gap-3 py-1">
                  <label className="flex min-h-11 flex-1 cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={(e) => set("flags", { ...draft.flags, [key]: e.target.checked })}
                      className="size-5 accent-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent"
                    />
                    <span className="break-all">{key}</span>
                  </label>
                  {errors[`flags.${key}`] ? <span className="text-sm text-admin-bad">{errors[`flags.${key}`]}</span> : null}
                  <IconButton
                    label={`Quitar indicador ${key}`}
                    className="hover:text-admin-bad"
                    onClick={() => {
                      const next = { ...draft.flags };
                      delete next[key];
                      set("flags", next);
                    }}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex gap-2">
            <input
              aria-label="Nombre del nuevo indicador"
              value={flagDraft}
              onChange={(e) => setFlagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFlag();
                }
              }}
              placeholder="nuevoIndicador"
              className={inputClass}
            />
            <Button onClick={addFlag} aria-label="Agregar indicador" className="px-3">
              <Plus className="size-4" aria-hidden />
            </Button>
          </div>
        </GlassCard>

        <div className="flex justify-end lg:col-span-2">
          <Button type="submit" variant="primary" disabled={saving}>
            <Save className="size-4" aria-hidden />
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
