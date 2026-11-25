/**
 * Shape, defaults and validation for the property types ("Casa", "Terreno", …).
 * Pure (no fs / no env) so the API route, the admin pages and public pages can import it.
 *
 * Properties store the type `id`, which never changes, so renaming a type's
 * label needs no migration.
 */

export interface PropertyTypeDef {
  /** Stable key stored on properties, e.g. "house". */
  id: string;
  /** Singular label, e.g. "Casa". */
  label: string;
  /** True for buildings (bedrooms, bathrooms, year built apply); false for land. */
  built: boolean;
}

export const MAX_TYPES = 30;

export const DEFAULT_PROPERTY_TYPES: PropertyTypeDef[] = [
  { id: "house", label: "Casa", built: true },
  { id: "apartment", label: "Apartamento", built: true },
  { id: "land", label: "Terreno", built: false },
  { id: "farm", label: "Chacra", built: false },
  { id: "field", label: "Campo", built: false },
];

export const typeIds = (types: PropertyTypeDef[]) => types.map((t) => t.id);

export const findType = (types: PropertyTypeDef[], id: string | undefined) =>
  types.find((t) => t.id === id);

/** Label for a type id; falls back to the id for a type that was since removed. */
export const typeLabel = (types: PropertyTypeDef[], id: string | undefined) =>
  findType(types, id)?.label ?? id ?? "";

/** Records saved before the category change may still say "penthouse". */
export const normalizeTypeId = (id: string | undefined) => (id === "penthouse" ? "apartment" : (id ?? "house"));

const fold = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** "Casa de campo" -> "casa-de-campo" */
export const slugifyType = (s: string) =>
  fold(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "tipo";

/** Match an id or a label (accent- and case-insensitive), e.g. from a spreadsheet cell. */
export function resolveType(types: PropertyTypeDef[], value: string): string | undefined {
  const v = fold(value);
  return types.find((t) => t.id === v || fold(t.label) === v)?.id;
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export type TypeErrors = Record<string, string>;
export type TypesParseResult = { ok: true; value: PropertyTypeDef[] } | { ok: false; errors: TypeErrors };

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Validate an untrusted list of types. Errors are keyed `<index>.<field>`. */
export function parsePropertyTypes(input: unknown): TypesParseResult {
  const errors: TypeErrors = {};
  if (!Array.isArray(input)) return { ok: false, errors: { _: "Solicitud inválida." } };
  if (input.length === 0) return { ok: false, errors: { _: "Tiene que haber al menos un tipo." } };
  if (input.length > MAX_TYPES) return { ok: false, errors: { _: `Máximo ${MAX_TYPES} tipos.` } };

  const seenLabels = new Set<string>();
  const seenIds = new Set<string>();
  const value: PropertyTypeDef[] = input.map((row, i) => {
    const r = isObj(row) ? row : {};
    const label = typeof r.label === "string" ? r.label.trim().slice(0, 40) : "";
    if (!label) errors[`${i}.label`] = "Ingresá un nombre.";
    else if (seenLabels.has(fold(label))) errors[`${i}.label`] = "Ya hay un tipo con ese nombre.";
    seenLabels.add(fold(label));

    let id = typeof r.id === "string" && /^[a-z0-9-]{1,40}$/.test(r.id) ? r.id : slugifyType(label);
    while (seenIds.has(id)) id = `${id}-${i}`;
    seenIds.add(id);

    return { id, label, built: r.built === true };
  });

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value };
}
