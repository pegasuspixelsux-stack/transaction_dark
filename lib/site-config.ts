/**
 * Shape, defaults and validation for the editable business configuration.
 * Pure (no fs / no env) so both the API route and the admin form can import it.
 */

export interface SiteConfig {
  agency: { name: string; legalName: string; tagline: string; licenseId: string };
  address: {
    street: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
    coordinates: { lat: number; lng: number };
  };
  contact: { phones: string[]; emails: string[] };
  whatsapp: {
    primary: { number: string; defaultMessage: string };
    support: { number: string };
  };
  social: { instagram: string; facebook: string; linkedin: string; youtube: string };
  externalLinks: { label: string; url: string }[];
  hours: { weekday: string; saturday: string; sunday: string; holidays: string };
  notifications: { leadEmails: string[] };
  flags: Record<string, boolean>;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  agency: {
    name: "Transaction",
    legalName: "",
    tagline: "Propiedades de autor frente al mar en Punta del Este.",
    licenseId: "MVOTMA-REG-00000", // TODO: replace with the real registration ID
  },
  address: {
    street: "Av. Gorlero 000",
    city: "Punta del Este",
    region: "Maldonado",
    country: "Uruguay",
    postalCode: "20100",
    coordinates: { lat: -34.9667, lng: -54.95 },
  },
  contact: {
    phones: ["+598 42 000 000", "+598 42 000 001"],
    emails: ["hello@transaction.example", "sales@transaction.example"],
  },
  whatsapp: {
    primary: {
      number: "+59899000000",
      defaultMessage:
        "¡Hola! Me interesa una de sus propiedades y me gustaría recibir más información.",
    },
    support: { number: "+59899000001" },
  },
  social: {
    instagram: "https://instagram.com/transaction",
    facebook: "https://facebook.com/transaction",
    linkedin: "https://linkedin.com/company/transaction",
    youtube: "https://youtube.com/@transaction",
  },
  externalLinks: [],
  hours: {
    weekday: "Lun – Vie · 09:00 – 18:00",
    saturday: "Sáb · 10:00 – 14:00",
    sunday: "Dom · Con cita previa",
    holidays: "Feriados · Con cita previa",
  },
  notifications: { leadEmails: [] },
  flags: {},
};

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export type ConfigErrors = Record<string, string>;
export type ParseResult =
  | { ok: true; value: SiteConfig }
  | { ok: false; errors: ConfigErrors };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9 ()\-.]{6,30}$/;
const FLAG_KEY_RE = /^[a-zA-Z][a-zA-Z0-9_-]{0,39}$/;

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Validate untrusted input and return a clean, fully-populated config. */
export function parseSiteConfig(input: unknown): ParseResult {
  const errors: ConfigErrors = {};
  if (!isObj(input)) return { ok: false, errors: { _: "Solicitud inválida." } };

  const obj = (key: string): Record<string, unknown> => {
    const v = input[key];
    return isObj(v) ? v : {};
  };

  const text = (path: string, v: unknown, opts: { required?: boolean; max?: number } = {}) => {
    const s = typeof v === "string" ? v.trim() : "";
    if (opts.required && !s) errors[path] = "Este campo es obligatorio.";
    if (s.length > (opts.max ?? 200)) errors[path] = `Máximo ${opts.max ?? 200} caracteres.`;
    return s;
  };
  const url = (path: string, v: unknown) => {
    const s = text(path, v, { max: 300 });
    if (s && !/^https?:\/\/\S+$/i.test(s)) errors[path] = "Usá una URL completa que empiece con http(s)://";
    return s;
  };
  const phone = (path: string, v: unknown, required = false) => {
    const s = text(path, v, { required, max: 30 });
    if (s && !PHONE_RE.test(s)) errors[path] = "Ingresá un teléfono válido.";
    return s;
  };
  const email = (path: string, v: unknown, required = false) => {
    const s = text(path, v, { required, max: 120 });
    if (s && !EMAIL_RE.test(s)) errors[path] = "Ingresá un correo válido.";
    return s;
  };

  const agency = obj("agency");
  const address = obj("address");
  const coords = isObj(address.coordinates) ? address.coordinates : {};
  const contact = obj("contact");
  const whatsapp = obj("whatsapp");
  const wPrimary = isObj(whatsapp.primary) ? whatsapp.primary : {};
  const wSupport = isObj(whatsapp.support) ? whatsapp.support : {};
  const social = obj("social");
  const hours = obj("hours");
  const notifications = obj("notifications");

  const lat = Number(coords.lat);
  const lng = Number(coords.lng);
  if (!(lat >= -90 && lat <= 90)) errors["address.coordinates.lat"] = "Latitud entre -90 y 90.";
  if (!(lng >= -180 && lng <= 180)) errors["address.coordinates.lng"] = "Longitud entre -180 y 180.";

  const phones = (Array.isArray(contact.phones) ? contact.phones : [])
    .map((p, i) => phone(`contact.phones.${i}`, p))
    .filter(Boolean);
  const emails = (Array.isArray(contact.emails) ? contact.emails : [])
    .map((e, i) => email(`contact.emails.${i}`, e))
    .filter(Boolean);
  if (phones.length === 0) errors["contact.phones.0"] = "Ingresá al menos un teléfono.";
  if (emails.length === 0) errors["contact.emails.0"] = "Ingresá al menos un correo.";

  const leadEmails = (Array.isArray(notifications.leadEmails) ? notifications.leadEmails : [])
    .map((e, i) => email(`notifications.leadEmails.${i}`, e))
    .filter(Boolean);

  const externalLinks: SiteConfig["externalLinks"] = [];
  (Array.isArray(input.externalLinks) ? input.externalLinks : []).slice(0, 20).forEach((row, i) => {
    const r = isObj(row) ? row : {};
    const label = text(`externalLinks.${i}.label`, r.label, { max: 60 });
    const href = url(`externalLinks.${i}.url`, r.url);
    if (!label && !href) return;
    if (!label) errors[`externalLinks.${i}.label`] = "Ingresá un nombre.";
    if (!href) errors[`externalLinks.${i}.url`] = "Ingresá una URL.";
    externalLinks.push({ label, url: href });
  });

  const flags: Record<string, boolean> = {};
  if (isObj(input.flags)) {
    const entries = Object.entries(input.flags);
    if (entries.length > 50) errors.flags = "Máximo 50 indicadores.";
    for (const [key, value] of entries.slice(0, 50)) {
      if (!FLAG_KEY_RE.test(key)) {
        errors[`flags.${key}`] = "Usá letras, números, guiones; hasta 40 caracteres.";
        continue;
      }
      flags[key] = value === true;
    }
  }

  const value: SiteConfig = {
    agency: {
      name: text("agency.name", agency.name, { required: true, max: 80 }),
      legalName: text("agency.legalName", agency.legalName, { max: 120 }),
      tagline: text("agency.tagline", agency.tagline, { max: 200 }),
      licenseId: text("agency.licenseId", agency.licenseId, { max: 60 }),
    },
    address: {
      street: text("address.street", address.street, { required: true }),
      city: text("address.city", address.city, { required: true, max: 80 }),
      region: text("address.region", address.region, { max: 80 }),
      country: text("address.country", address.country, { required: true, max: 80 }),
      postalCode: text("address.postalCode", address.postalCode, { max: 20 }),
      coordinates: { lat, lng },
    },
    contact: { phones, emails },
    whatsapp: {
      primary: {
        number: phone("whatsapp.primary.number", wPrimary.number, true),
        defaultMessage: text("whatsapp.primary.defaultMessage", wPrimary.defaultMessage, { max: 500 }),
      },
      support: { number: phone("whatsapp.support.number", wSupport.number) },
    },
    social: {
      instagram: url("social.instagram", social.instagram),
      facebook: url("social.facebook", social.facebook),
      linkedin: url("social.linkedin", social.linkedin),
      youtube: url("social.youtube", social.youtube),
    },
    externalLinks,
    hours: {
      weekday: text("hours.weekday", hours.weekday, { max: 80 }),
      saturday: text("hours.saturday", hours.saturday, { max: 80 }),
      sunday: text("hours.sunday", hours.sunday, { max: 80 }),
      holidays: text("hours.holidays", hours.holidays, { max: 80 }),
    },
    notifications: { leadEmails },
    flags,
  };

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value };
}

/** Overlay stored data on the defaults so older files gain newly added fields. */
export function withDefaults(stored: unknown): SiteConfig {
  if (!isObj(stored)) return DEFAULT_SITE_CONFIG;
  const merge = <T,>(base: T, over: unknown): T => {
    if (isObj(base) && isObj(over)) {
      const out: Record<string, unknown> = { ...base };
      for (const k of Object.keys(over)) out[k] = k in base ? merge((base as Record<string, unknown>)[k], over[k]) : over[k];
      return out as T;
    }
    return (over === undefined ? base : over) as T;
  };
  return merge(DEFAULT_SITE_CONFIG, stored);
}
