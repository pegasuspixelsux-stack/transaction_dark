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
  "bedrooms", "bathrooms", "areaM2", "yearBuilt", "features", "amenities", "imageUrl",
  "images", "description", "status", "featured", "hero",
] as const;
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
  const byLower = new Map<string, string>(KNOWN_COLUMNS.map((c) => [c.toLowerCase(), c]));
  const columns = headers.map((h) => byLower.get(h.toLowerCase()));
  const missing = REQUIRED_COLUMNS.filter((c) => !columns.includes(c));
  if (missing.length > 0) {
    throw new ImportFileError(`Faltan columnas obligatorias: ${missing.join(", ")}.`);
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
      listingType: text(v.listingType).toLowerCase(),
      price: number(v.price),
      currency: text(v.currency).toUpperCase(),
      location: text(v.location),
      zone: text(v.zone),
      propertyType: text(v.propertyType).toLowerCase(),
      bedrooms: number(v.bedrooms),
      bathrooms: number(v.bathrooms),
      areaM2: number(v.areaM2),
      ...("yearBuilt" in v ? { yearBuilt: number(v.yearBuilt) } : {}),
      features: splitList(v.features),
      ...("amenities" in v ? { amenities: splitList(v.amenities) } : {}),
      imageUrl: text(v.imageUrl),
      ...("images" in v ? { images: splitList(v.images) } : {}),
      description: text(v.description),
      status: text(v.status).toLowerCase(),
      featured: bool(v.featured),
      hero: bool(v.hero),
    };

    // Reject unknown dropdown values instead of silently replacing them with a default.
    const invalid: [string, string, readonly string[]][] = [
      ["listingType", input.listingType, LISTINGS],
      ["currency", input.currency, CURRENCIES],
      ["zone", input.zone, ZONES],
      ["propertyType", input.propertyType, TYPES],
      ["status", input.status, STATUSES],
    ];
    const badField = invalid.find(([, value, allowed]) => !allowed.includes(value));
    if (badField) {
      errors.push({
        row,
        title: input.title,
        error: `Valor inválido en «${badField[0]}»: "${badField[1]}". Usá: ${badField[2].join(" | ")}.`,
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
