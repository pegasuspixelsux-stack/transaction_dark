/** Excel (.xlsx) import of the property catalog. Server-only. */
import { readSheet } from "read-excel-file/universal";
import {
  CURRENCIES,
  LISTINGS,
  STATUSES,
  TYPES,
  ZONES,
  saveIntoCatalog,
} from "@/lib/server/property-input";
import type { AdminProperty, ImportRowError } from "@/types/admin";

export const MAX_IMPORT_ROWS = 500;
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

export interface ImportReport {
  created: number;
  updated: number;
  errors: ImportRowError[];
  /** The catalog after applying every row; only meaningful when `errors` is empty. */
  properties: AdminProperty[];
}

const KNOWN_COLUMNS = [
  "id", "title", "listingType", "price", "currency", "location", "zone", "propertyType",
  "bedrooms", "bathrooms", "areaM2", "yearBuilt", "commonExpenses", "annualTaxes", "features", "amenities", "imageUrl",
  "images", "description", "status", "featured", "hero",
] as const;
/** Spanish headers (what the template uses) and the original English ones both work. */
const HEADER_ALIASES: Record<(typeof KNOWN_COLUMNS)[number], string[]> = {
  id: ["id", "codigo"],
  title: ["titulo", "title", "nombre"],
  listingType: ["operacion", "listingtype"],
  price: ["precio", "price"],
  currency: ["moneda", "currency"],
  location: ["ubicacion", "location"],
  zone: ["zona", "zone"],
  propertyType: ["tipo", "tipodepropiedad", "propertytype"],
  bedrooms: ["dormitorios", "bedrooms"],
  bathrooms: ["banos", "bathrooms"],
  areaM2: ["superficiem", "superficiem2", "superficie", "aream2"],
  yearBuilt: ["anodeconstruccion", "aniodeconstruccion", "ano", "anio", "yearbuilt"],
  commonExpenses: ["gastoscomunes", "gastoscomunesmensual", "commonexpenses"],
  annualTaxes: ["impuestos", "impuestosanuales", "annualtaxes"],
  features: ["caracteristicas", "features"],
  amenities: ["amenidades", "comodidades", "amenities"],
  imageUrl: ["imagenprincipal", "imagen", "imageurl"],
  images: ["imagenes", "images"],
  description: ["descripcion", "description"],
  status: ["estado", "status"],
  featured: ["destacada", "destacado", "featured"],
  hero: ["carruselprincipal", "carrusel", "hero"],
};

const COLUMN_LABELS: Record<(typeof REQUIRED_COLUMNS)[number], string> = {
  title: "Título", listingType: "Operación", price: "Precio", currency: "Moneda",
  location: "Ubicación", zone: "Zona", propertyType: "Tipo", bedrooms: "Dormitorios",
  bathrooms: "Baños", areaM2: "Superficie m²", status: "Estado",
};

/** Spanish cell values -> the canonical values the catalog stores. */
const VALUE_ALIASES: Record<string, string> = {
  venta: "sale", alquiler: "rent",
  casa: "house", apartamento: "apartment", departamento: "apartment", terreno: "land",
  publicada: "published", publicado: "published", borrador: "draft",
};
const VALUE_LABELS: Record<string, string> = {
  sale: "venta", rent: "alquiler", house: "casa", apartment: "apartamento", land: "terreno",
  penthouse: "penthouse", published: "publicada", draft: "borrador",
};

const fold = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const normalizeHeader = (v: string) => fold(v).replace(/[^a-z0-9]/g, "");
const canonical = (v: string) => VALUE_ALIASES[fold(v.trim())] ?? v.toLowerCase();

const REQUIRED_COLUMNS = [
  "title", "listingType", "price", "currency", "location", "zone", "propertyType",
  "bedrooms", "bathrooms", "areaM2", "status",
] as const;

type Cell = string | number | boolean | Date | null | undefined;

const text = (v: Cell) => (v === null || v === undefined ? "" : v instanceof Date ? v.toISOString() : String(v).trim());
const splitList = (v: Cell) => text(v).split(";").map((s) => s.trim()).filter(Boolean);

function number(v: Cell): number | undefined {
  if (typeof v === "number") return v;
  const s = text(v).replace(/[\s$€]/g, "");
  if (!s) return undefined;
  // "4.200.000" or "4,200,000" -> thousands separators; "1234,5" -> decimal comma
  const cleaned = /^\d{1,3}([.,]\d{3})+$/.test(s) ? s.replace(/[.,]/g, "") : s.replace(",", ".");
  const n = Number(cleaned);
  return Number.isNaN(n) ? undefined : n;
}

function bool(v: Cell): boolean {
  if (typeof v === "boolean") return v;
  return ["true", "1", "si", "sí", "yes", "x"].includes(text(v).toLowerCase());
}

export class ImportFileError extends Error {}

/** Read the "Inventario" sheet (or the first sheet) into header-keyed row objects. */
export async function readInventoryRows(file: Blob): Promise<{ row: number; values: Record<string, Cell> }[]> {
  let data: Cell[][];
  try {
    data = (await readSheet(file, "Inventario").catch(() => readSheet(file))) as Cell[][];
  } catch {
    throw new ImportFileError("No pudimos leer el archivo. Verificá que sea un .xlsx válido.");
  }
  if (!data || data.length === 0) throw new ImportFileError("El archivo está vacío.");

  const headers = data[0].map((h) => text(h));
  const byHeader = new Map<string, string>(
    KNOWN_COLUMNS.flatMap((c) => HEADER_ALIASES[c].map((alias) => [alias, c] as const)),
  );
  const columns = headers.map((h) => byHeader.get(normalizeHeader(h)));
  const missing = REQUIRED_COLUMNS.filter((c) => !columns.includes(c));
  if (missing.length > 0) {
    throw new ImportFileError(`Faltan columnas obligatorias: ${missing.map((c) => COLUMN_LABELS[c]).join(", ")}.`);
  }

  const rows: { row: number; values: Record<string, Cell> }[] = [];
  data.slice(1).forEach((cells, i) => {
    if (!cells.some((c) => text(c) !== "")) return; // skip blank rows
    const values: Record<string, Cell> = {};
    columns.forEach((col, idx) => {
      if (col) values[col] = cells[idx];
    });
    rows.push({ row: i + 2, values });
  });
  if (rows.length === 0) throw new ImportFileError("No hay filas con datos para importar.");
  if (rows.length > MAX_IMPORT_ROWS) {
    throw new ImportFileError(`Máximo ${MAX_IMPORT_ROWS} filas por archivo.`);
  }
  return rows;
}

/** Apply every row to `list` in order. Any row error means nothing should be saved. */
export function applyInventoryRows(
  list: AdminProperty[],
  rows: { row: number; values: Record<string, Cell> }[],
): ImportReport {
  let current = list;
  let created = 0;
  let updated = 0;
  const errors: ImportRowError[] = [];

  for (const { row, values: v } of rows) {
    const id = text(v.id);
    const input = {
      ...(id ? { id } : {}),
      title: text(v.title),
      listingType: canonical(text(v.listingType)),
      price: number(v.price),
      currency: text(v.currency).toUpperCase(),
      location: text(v.location),
      zone: text(v.zone),
      propertyType: canonical(text(v.propertyType)),
      bedrooms: number(v.bedrooms),
      bathrooms: number(v.bathrooms),
      areaM2: number(v.areaM2),
      ...("yearBuilt" in v ? { yearBuilt: number(v.yearBuilt) } : {}),
      ...("commonExpenses" in v ? { commonExpenses: number(v.commonExpenses) } : {}),
      ...("annualTaxes" in v ? { annualTaxes: number(v.annualTaxes) } : {}),
      features: splitList(v.features),
      ...("amenities" in v ? { amenities: splitList(v.amenities) } : {}),
      imageUrl: text(v.imageUrl),
      ...("images" in v ? { images: splitList(v.images) } : {}),
      description: text(v.description),
      status: canonical(text(v.status)),
      featured: bool(v.featured),
      hero: bool(v.hero),
    };

    // Reject unknown dropdown values instead of silently replacing them with a default.
    const invalid: [string, string, readonly string[]][] = [
      ["Operación", input.listingType, LISTINGS],
      ["Moneda", input.currency, CURRENCIES],
      ["Zona", input.zone, ZONES],
      ["Tipo", input.propertyType, TYPES],
      ["Estado", input.status, STATUSES],
    ];
    const badField = invalid.find(([, value, allowed]) => !allowed.includes(value));
    if (badField) {
      errors.push({
        row,
        title: input.title,
        error: `Valor inválido en «${badField[0]}»: "${VALUE_LABELS[badField[1]] ?? badField[1]}". Usá: ${badField[2].map((o) => VALUE_LABELS[o] ?? o).join(" | ")}.`,
      });
      continue;
    }

    const wasExisting = id !== "" && current.some((p) => p.id === id);
    const result = saveIntoCatalog(current, input, { allowNewId: true });
    if (!result.ok) {
      errors.push({ row, title: input.title, error: result.error });
      continue;
    }
    current = result.properties;
    if (wasExisting) updated += 1;
    else created += 1;
  }

  return { created, updated, errors, properties: current };
}
