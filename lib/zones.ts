/**
 * Shape, defaults and validation for the zones we work in ("Dónde trabajamos").
 * Pure (no fs / no env) so the API route, the admin page and public pages can import it.
 *
 * Properties reference a zone by its `name`, so renaming a zone also renames it
 * on every property (handled by the zones API route).
 */

export interface Zone {
  /** Stable key; survives renames. */
  id: string;
  name: string;
  blurb: string;
  /** Tile image on the homepage. */
  image: string;
  /** Approximate centre, used for the map on property pages. */
  lat: number;
  lng: number;
  /** Shown in the homepage "Dónde trabajamos" grid (max MAX_HOME_ZONES). */
  showOnHome: boolean;
}

export const MAX_ZONES = 30;
/** The homepage grid is designed for five tiles. */
export const MAX_HOME_ZONES = 5;

const zimg = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

export const DEFAULT_ZONES: Zone[] = [
  {
    id: "jose-ignacio",
    name: "José Ignacio",
    blurb: "El pueblo de pescadores convertido en uno de los destinos más reconocidos de la costa uruguaya.",
    image: zimg("1507525428034-b723cf961d3e"),
    lat: -34.8433,
    lng: -54.635,
    showOnHome: true,
  },
  {
    id: "manantiales",
    name: "Manantiales",
    blurb: "La tranquilidad de un entorno costero en una zona de creciente desarrollo.",
    image: zimg("1519046904884-53103b34b206"),
    lat: -34.9081,
    lng: -54.8294,
    showOnHome: true,
  },
  {
    id: "la-barra",
    name: "La Barra",
    blurb: "Galerías y arquitectura de autor sobre el arroyo Maldonado.",
    image: zimg("1471922694854-ff1b63b20054"),
    lat: -34.914,
    lng: -54.872,
    showOnHome: true,
  },
  {
    id: "peninsula",
    name: "Península",
    blurb: "El corazón histórico de Punta del Este, entre dos mares.",
    image: zimg("1505142468610-359e7d316be0"),
    lat: -34.968,
    lng: -54.944,
    showOnHome: true,
  },
  {
    id: "mansa",
    name: "Mansa",
    blurb: "Atardeceres sobre aguas calmas y las torres frente al mar.",
    image: zimg("1533105079780-92b9be482077"),
    lat: -34.94,
    lng: -54.925,
    showOnHome: true,
  },
  // Rural zones for chacras; not on the homepage grid by default.
  {
    id: "maldonado",
    name: "Maldonado",
    blurb: "Chacras y campos en el interior del departamento, a minutos de la costa.",
    image: zimg("1500382017468-9049fed747ef"),
    lat: -34.75,
    lng: -54.95,
    showOnHome: false,
  },
  {
    id: "rocha",
    name: "Rocha",
    blurb: "Campos abiertos y chacras entre lagunas y la costa atlántica.",
    image: zimg("1499529112087-3cb3b73cec95"),
    lat: -34.48,
    lng: -54.33,
    showOnHome: false,
  },
];

export const zoneNames = (zones: Zone[]) => zones.map((z) => z.name);

export const findZone = (zones: Zone[], name: string) => zones.find((z) => z.name === name);

/** "José Ignacio" -> "jose-ignacio" */
export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "zona";

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export type ZoneErrors = Record<string, string>;
export type ZonesParseResult = { ok: true; value: Zone[] } | { ok: false; errors: ZoneErrors };

/** Hosts allowed by `images.remotePatterns` in next.config.ts. */
const IMAGE_URL_RE = /^https:\/\/(ik\.imagekit\.io|images\.unsplash\.com)\/\S+$/i;

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Validate an untrusted list of zones. Errors are keyed `<index>.<field>`. */
export function parseZones(input: unknown): ZonesParseResult {
  const errors: ZoneErrors = {};
  if (!Array.isArray(input)) return { ok: false, errors: { _: "Solicitud inválida." } };
  if (input.length === 0) return { ok: false, errors: { _: "Tiene que haber al menos una zona." } };
  if (input.length > MAX_ZONES) return { ok: false, errors: { _: `Máximo ${MAX_ZONES} zonas.` } };

  const seenNames = new Set<string>();
  const seenIds = new Set<string>();
  const value: Zone[] = input.map((row, i) => {
    const r = isObj(row) ? row : {};
    const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

    const name = str(r.name, 60);
    if (!name) errors[`${i}.name`] = "Ingresá un nombre.";
    else if (seenNames.has(name.toLowerCase())) errors[`${i}.name`] = "Ya hay una zona con ese nombre.";
    seenNames.add(name.toLowerCase());

    let id = str(r.id, 60) || slugify(name);
    while (seenIds.has(id)) id = `${id}-${i}`;
    seenIds.add(id);

    const blurb = str(r.blurb, 240);

    const image = str(r.image, 500);
    if (!image) errors[`${i}.image`] = "Subí una imagen.";
    else if (!IMAGE_URL_RE.test(image)) errors[`${i}.image`] = "Subí la imagen desde este panel.";

    const lat = Number(r.lat);
    const lng = Number(r.lng);
    if (!(lat >= -90 && lat <= 90)) errors[`${i}.lat`] = "Latitud entre -90 y 90.";
    if (!(lng >= -180 && lng <= 180)) errors[`${i}.lng`] = "Longitud entre -180 y 180.";

    return { id, name, blurb, image, lat, lng, showOnHome: r.showOnHome === true };
  });

  if (value.filter((z) => z.showOnHome).length > MAX_HOME_ZONES) {
    errors._ = `Solo ${MAX_HOME_ZONES} zonas pueden mostrarse en la página de inicio.`;
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value };
}
