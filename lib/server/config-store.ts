/**
 * File-backed persistence for the business configuration. Server-only.
 *
 * Stored as JSON at `data/site-config.json` (override with SITE_CONFIG_PATH),
 * written atomically so a crash mid-write can't corrupt it. Values survive
 * restarts. NOTE: serverless hosts (e.g. Vercel) have an ephemeral/read-only
 * filesystem — point SITE_CONFIG_PATH at a persistent volume or swap this
 * module for a database-backed store there.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { DEFAULT_SITE_CONFIG, withDefaults, type SiteConfig } from "@/lib/site-config";

const filePath = () =>
  process.env.SITE_CONFIG_PATH ?? path.join(process.cwd(), "data", "site-config.json");

export async function readSiteConfig(): Promise<SiteConfig> {
  try {
    return withDefaults(JSON.parse(await fs.readFile(filePath(), "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return DEFAULT_SITE_CONFIG;
    console.error("[config] could not read stored config, using defaults:", error);
    return DEFAULT_SITE_CONFIG;
  }
}

export async function writeSiteConfig(config: SiteConfig): Promise<void> {
  const target = filePath();
  await fs.mkdir(path.dirname(target), { recursive: true });
  const tmp = `${target}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(config, null, 2), "utf8");
  await fs.rename(tmp, target);
}
