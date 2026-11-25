/**
 * Persistence for the zones list. Server-only.
 *
 * Stored as one Firestore document (`settings/zones`) when Firebase Admin is
 * configured, otherwise as `data/zones.json` (override with ZONES_PATH) for
 * local development. Until the first save, the built-in defaults are used.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { adminDb } from "@/lib/server/firebase-admin";
import { DEFAULT_ZONES, parseZones, type Zone } from "@/lib/zones";

const DOC = { collection: "settings", id: "zones" };

const filePath = () => process.env.ZONES_PATH ?? path.join(process.cwd(), "data", "zones.json");

/** Stored data is re-validated so a hand-edited document can't break public pages. */
const clean = (items: unknown): Zone[] => {
  const parsed = parseZones(items);
  return parsed.ok ? parsed.value : DEFAULT_ZONES;
};

export async function readZones(): Promise<Zone[]> {
  const db = adminDb();
  if (db) {
    try {
      const snap = await db.collection(DOC.collection).doc(DOC.id).get();
      return snap.exists ? clean(snap.data()?.items) : DEFAULT_ZONES;
    } catch (error) {
      console.error("[zones] could not read Firestore, using defaults:", error);
      return DEFAULT_ZONES;
    }
  }
  try {
    return clean(JSON.parse(await fs.readFile(/*turbopackIgnore: true*/ filePath(), "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[zones] could not read stored zones, using defaults:", error);
    }
    return DEFAULT_ZONES;
  }
}

export async function writeZones(items: Zone[]): Promise<void> {
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
