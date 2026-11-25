/**
 * Persistence for the property types list. Server-only.
 *
 * Stored as one Firestore document (`settings/property-types`) when Firebase
 * Admin is configured, otherwise as `data/property-types.json` (override with
 * PROPERTY_TYPES_PATH) for local development. Until the first save, the
 * built-in defaults are used.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { adminDb } from "@/lib/server/firebase-admin";
import { DEFAULT_PROPERTY_TYPES, parsePropertyTypes, type PropertyTypeDef } from "@/lib/property-types";

const DOC = { collection: "settings", id: "property-types" };

const filePath = () =>
  process.env.PROPERTY_TYPES_PATH ?? path.join(process.cwd(), "data", "property-types.json");

/** Stored data is re-validated so a hand-edited document can't break public pages. */
const clean = (items: unknown): PropertyTypeDef[] => {
  const parsed = parsePropertyTypes(items);
  return parsed.ok ? parsed.value : DEFAULT_PROPERTY_TYPES;
};

export async function readPropertyTypes(): Promise<PropertyTypeDef[]> {
  const db = adminDb();
  if (db) {
    try {
      const snap = await db.collection(DOC.collection).doc(DOC.id).get();
      return snap.exists ? clean(snap.data()?.items) : DEFAULT_PROPERTY_TYPES;
    } catch (error) {
      console.error("[property-types] could not read Firestore, using defaults:", error);
      return DEFAULT_PROPERTY_TYPES;
    }
  }
  try {
    return clean(JSON.parse(await fs.readFile(/*turbopackIgnore: true*/ filePath(), "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[property-types] could not read stored types, using defaults:", error);
    }
    return DEFAULT_PROPERTY_TYPES;
  }
}

export async function writePropertyTypes(items: PropertyTypeDef[]): Promise<void> {
  const db = adminDb();
  if (db) {
    await db.collection(DOC.collection).doc(DOC.id).set({ items: JSON.parse(JSON.stringify(items)) });
    return;
  }
  const target = filePath();
  await fs.mkdir(/*turbopackIgnore: true*/ path.dirname(target), { recursive: true });
  const tmp = `${target}.${process.pid}.tmp`;
  await fs.writeFile(/*turbopackIgnore: true*/ tmp, JSON.stringify(items, null, 2), "utf8");
  await fs.rename(/*turbopackIgnore: true*/ tmp, target);
}
