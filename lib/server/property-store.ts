/**
 * Persistence for the property catalog. Server-only.
 *
 * Stored as one Firestore document (`settings/properties`) when Firebase Admin
 * is configured, otherwise as `data/properties.json` (override with
 * PROPERTIES_PATH) for local development. The first read seeds the catalog
 * from the built-in sample properties.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { properties as sampleProperties } from "@/lib/properties";
import { adminDb } from "@/lib/server/firebase-admin";
import type { AdminProperty } from "@/types/admin";

export const MAX_FEATURED = 5;
export const MAX_HERO = 5;

const DOC = { collection: "settings", id: "properties" };

const filePath = () =>
  process.env.PROPERTIES_PATH ?? path.join(process.cwd(), "data", "properties.json");

function seedCatalog(): AdminProperty[] {
  const now = new Date().toISOString();
  return sampleProperties.map((p, i) => ({
    id: p.id,
    title: p.title,
    listingType: "sale",
    price: p.price,
    currency: "USD",
    location: `${p.zone}, Maldonado`,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms ?? Math.max(1, p.bedrooms - 1),
    areaM2: p.area ?? 120 + p.bedrooms * 60,
    features: p.features ?? [],
    imageUrl: p.imageUrl,
    description: p.description ?? "",
    status: "published",
    assignedAgentId: null,
    updatedAt: now,
    zone: p.zone,
    propertyType: p.type,
    images: p.images,
    yearBuilt: p.yearBuilt,
    amenities: p.amenities,
    featured: i < MAX_FEATURED,
    hero: i < MAX_HERO,
  }));
}

export async function readProperties(): Promise<AdminProperty[]> {
  const db = adminDb();
  if (db) {
    try {
      const snap = await db.collection(DOC.collection).doc(DOC.id).get();
      const items = snap.data()?.items;
      return Array.isArray(items) ? (items as AdminProperty[]) : seedCatalog();
    } catch (error) {
      console.error("[properties] could not read Firestore, using samples:", error);
      return seedCatalog();
    }
  }
  try {
    const parsed = JSON.parse(await fs.readFile(/*turbopackIgnore: true*/ filePath(), "utf8"));
    return Array.isArray(parsed) ? (parsed as AdminProperty[]) : seedCatalog();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[properties] could not read stored catalog, using samples:", error);
    }
    return seedCatalog();
  }
}

export async function writeProperties(items: AdminProperty[]): Promise<void> {
  const clean = JSON.parse(JSON.stringify(items)) as AdminProperty[];
  const db = adminDb();
  if (db) {
    await db.collection(DOC.collection).doc(DOC.id).set({ items: clean });
    return;
  }
  const target = filePath();
  await fs.mkdir(/*turbopackIgnore: true*/ path.dirname(target), { recursive: true });
  const tmp = `${target}.${process.pid}.tmp`;
  await fs.writeFile(/*turbopackIgnore: true*/ tmp, JSON.stringify(clean, null, 2), "utf8");
  await fs.rename(/*turbopackIgnore: true*/ tmp, target);
}
