/**
 * Persistence for the business configuration. Server-only.
 *
 * When Firebase Admin credentials are configured, the config lives in
 * Firestore (`settings/site-config`) so it survives serverless deploys.
 * Otherwise it falls back to the file store described below.
 *
 * File store:
 * Stored as JSON at `data/site-config.json` (override with SITE_CONFIG_PATH),
 * written atomically so a crash mid-write can't corrupt it. Values survive
 * restarts. NOTE: serverless hosts (e.g. Vercel) have an ephemeral/read-only
 * filesystem — point SITE_CONFIG_PATH at a persistent volume or swap this
 * module for a database-backed store there.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { adminDb } from "@/lib/server/firebase-admin";
import { DEFAULT_SITE_CONFIG, withDefaults, type SiteConfig } from "@/lib/site-config";

const filePath = () =>
  process.env.SITE_CONFIG_PATH ?? path.join(process.cwd(), "data", "site-config.json");

const DOC = { collection: "settings", id: "site-config" };

export async function readSiteConfig(): Promise<SiteConfig> {
  const db = adminDb();
  if (db) {
    try {
      const snap = await db.collection(DOC.collection).doc(DOC.id).get();
      return snap.exists ? withDefaults(snap.data()) : DEFAULT_SITE_CONFIG;
    } catch (error) {
      console.error("[config] could not read Firestore config, using defaults:", error);
      return DEFAULT_SITE_CONFIG;
    }
  }
  try {
    return withDefaults(JSON.parse(await fs.readFile(/*turbopackIgnore: true*/ filePath(), "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return DEFAULT_SITE_CONFIG;
    console.error("[config] could not read stored config, using defaults:", error);
    return DEFAULT_SITE_CONFIG;
  }
}

export async function writeSiteConfig(config: SiteConfig): Promise<void> {
  const db = adminDb();
  if (db) {
    await db.collection(DOC.collection).doc(DOC.id).set(JSON.parse(JSON.stringify(config)));
    return;
  }
  const target = filePath();
  await fs.mkdir(/*turbopackIgnore: true*/ path.dirname(target), { recursive: true });
  const tmp = `${target}.${process.pid}.tmp`;
  await fs.writeFile(/*turbopackIgnore: true*/ tmp, JSON.stringify(config, null, 2), "utf8");
  await fs.rename(/*turbopackIgnore: true*/ tmp, target);
}
