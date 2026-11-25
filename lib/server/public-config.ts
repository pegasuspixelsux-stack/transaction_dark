/**
 * Request-time access to the saved business configuration for public pages.
 * `connection()` opts out of prerendering so edits made in the admin panel
 * show up on the next page load instead of being frozen at build time.
 */
import { connection } from "next/server";
import { readSiteConfig } from "@/lib/server/config-store";
import type { SiteConfig } from "@/lib/site-config";
import type { Zone } from "@/lib/zones";
import { readZones } from "@/lib/server/zone-store";
import type { PropertyTypeDef } from "@/lib/property-types";
import { readPropertyTypes } from "@/lib/server/property-type-store";

export async function getSiteConfig(): Promise<SiteConfig> {
  await connection();
  return readSiteConfig();
}

/** "+598 94 261 636" -> "59894261636" (wa.me format). */
export const waNumber = (phone: string) => phone.replace(/\D/g, "");

/** "+598 94 261 636" -> "+59894261636" (tel: format). */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** Zones for public pages, read at request time so admin edits show up immediately. */
export async function getPublicZones(): Promise<Zone[]> {
  await connection();
  return readZones();
}

/** Property types for public pages, read at request time so admin edits show up immediately. */
export async function getPublicPropertyTypes(): Promise<PropertyTypeDef[]> {
  await connection();
  return readPropertyTypes();
}
