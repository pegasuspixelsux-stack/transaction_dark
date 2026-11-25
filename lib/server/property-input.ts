/** Validation and merge rules for saving a property. Server-only. */
import type { AdminProperty, Currency, ListingType, PublishStatus } from "@/types/admin";
import { MAX_FEATURED, MAX_HERO } from "@/lib/server/property-store";

export const LISTINGS: ListingType[] = ["sale", "rent"];
export const CURRENCIES: Currency[] = ["USD", "UYU", "EUR"];
export const STATUSES: PublishStatus[] = ["draft", "published"];

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export type SaveResult =
  | {
      ok: true;
      properties: AdminProperty[];
      property: AdminProperty;
      /** Set when the save changed the property's ID (callers re-link references). */
      renamedFrom?: string;
    }
  | { ok: false; error: string; status: number };

const bad = (error: string, status = 422): SaveResult => ({ ok: false, error, status });

/** Insert or update `input` in `list`, enforcing field rules and the featured / hero caps. */
export function saveIntoCatalog(
  list: AdminProperty[],
  input: unknown,
  /** `zones` / `types`: the valid zone names and type ids (from their stores). */
  opts: { zones: readonly string[]; types: readonly string[]; allowNewId?: boolean },
): SaveResult {
  if (!isObj(input)) return bad("Solicitud inválida.", 400);

  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : Number.NaN);

  const id = typeof input.id === "string" && input.id ? input.id : null;
  const existing = id ? list.find((p) => p.id === id) : undefined;
  if (id && !existing) {
    if (!opts.allowNewId) return bad("No se encontró la propiedad.", 404);
    if (!/^[a-zA-Z0-9_-]{1,40}$/.test(id)) return bad("El id solo admite letras, números, guiones (hasta 40).");
  }

  // Optional ID chosen in the form (`newId`): sets the ID of a new property or renames an existing one.
  const wantedId = str(input.newId, 40);
  if (wantedId) {
    if (!/^[a-zA-Z0-9_-]{1,40}$/.test(wantedId)) return bad("El ID solo admite letras, números y guiones (hasta 40).");
    const taken = list.find((p) => p.id.toLowerCase() === wantedId.toLowerCase() && p.id !== existing?.id);
    if (taken) return bad(`El ID ${wantedId} ya lo usa «${taken.title}».`, 409);
  }

  const title = str(input.title, 120);
  const location = str(input.location, 160);
  const price = num(input.price);
  const areaM2 = num(input.areaM2);
  const bedrooms = num(input.bedrooms);
  const bathrooms = num(input.bathrooms);
  if (!title) return bad("El título es obligatorio.");
  if (!location) return bad("La ubicación es obligatoria.");
  if (!(price > 0)) return bad("Ingresá un precio mayor a 0.");
  if (!(areaM2 > 0)) return bad("Ingresá la superficie en m².");
  if (!(Number.isInteger(bedrooms) && bedrooms >= 0)) return bad("Dormitorios inválidos.");
  if (!(Number.isInteger(bathrooms) && bathrooms >= 0)) return bad("Baños inválidos.");

  const imageUrl = str(input.imageUrl, 500);
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) return bad("La imagen debe ser una URL http(s).");

  const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
    allowed.includes(v as T) ? (v as T) : fallback;

  const featured = input.featured === true;
  const hero = input.hero === true;
  const status = pick(input.status, STATUSES, "draft");
  const others = list.filter((p) => p.id !== id);
  if (featured && others.filter((p) => p.featured).length >= MAX_FEATURED) {
    return bad(`Ya hay ${MAX_FEATURED} propiedades destacadas. Quitá una antes de agregar otra.`, 409);
  }
  if (hero && others.filter((p) => p.hero).length >= MAX_HERO) {
    return bad(`Ya hay ${MAX_HERO} propiedades en el hero. Quitá una antes de agregar otra.`, 409);
  }

  const list_ = (v: unknown, max: number, limit: number) =>
    (Array.isArray(v) ? v : []).map((x) => str(x, max)).filter(Boolean).slice(0, limit);

  const extra: Partial<AdminProperty> = {};
  if ("yearBuilt" in input) {
    const y = num(input.yearBuilt);
    extra.yearBuilt = Number.isInteger(y) && y >= 1500 && y <= 2200 ? y : undefined;
  }
  if ("padron" in input) extra.padron = str(input.padron, 40) || undefined;
  if ("listingNumber" in input) {
    const ref = str(input.listingNumber, 30);
    const clash = ref && others.find((p) => p.listingNumber?.toLowerCase() === ref.toLowerCase());
    if (clash) return bad(`El N.º de referencia ${ref} ya lo usa «${clash.title}».`, 409);
    extra.listingNumber = ref || undefined;
  }
  if ("frontage" in input) {
    const f = num(input.frontage);
    extra.frontage = Number.isFinite(f) && f > 0 ? f : undefined;
  }
  for (const key of ["commonExpenses", "annualTaxes"] as const) {
    if (key in input) {
      const n = num(input[key]);
      extra[key] = Number.isFinite(n) && n >= 0 ? n : undefined;
    }
  }
  if ("amenities" in input) extra.amenities = list_(input.amenities, 120, 40);
  if ("images" in input) {
    const imgs = list_(input.images, 500, 20);
    if (imgs.some((u) => !/^https?:\/\//i.test(u))) return bad("Las imágenes deben ser URLs http(s).");
    extra.images = imgs;
  }

  const property: AdminProperty = {
    ...existing,
    ...extra,
    id: wantedId || (existing?.id ?? id ?? `p-${crypto.randomUUID().slice(0, 8)}`),
    title,
    listingType: pick(input.listingType, LISTINGS, "sale"),
    price,
    currency: pick(input.currency, CURRENCIES, "USD"),
    location,
    bedrooms,
    bathrooms,
    areaM2,
    features: (Array.isArray(input.features) ? input.features : [])
      .map((f) => str(f, 120))
      .filter(Boolean)
      .slice(0, 40),
    imageUrl,
    description: str(input.description, 4000),
    status,
    assignedAgentId:
      "assignedAgentId" in input
        ? typeof input.assignedAgentId === "string" && input.assignedAgentId
          ? input.assignedAgentId
          : null
        : (existing?.assignedAgentId ?? null),
    updatedAt: new Date().toISOString(),
    zone: pick(input.zone, opts.zones, existing?.zone ?? opts.zones[0] ?? ""),
    propertyType: pick(input.propertyType, opts.types, existing?.propertyType ?? opts.types[0] ?? "house"),
    featured,
    hero,
  };

  const properties = existing
    ? list.map((p) => (p.id === existing.id ? property : p))
    : [property, ...list];
  const renamedFrom = existing && existing.id !== property.id ? existing.id : undefined;
  return { ok: true, properties, property, renamedFrom };
}
