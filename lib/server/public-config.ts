/**
 * Request-time access to the saved business configuration for public pages.
 * `connection()` opts out of prerendering so edits made in the admin panel
 * show up on the next page load instead of being frozen at build time.
 */
import { connection } from "next/server";
import { readSiteConfig } from "@/lib/server/config-store";
import type { SiteConfig } from "@/lib/site-config";

export async function getSiteConfig(): Promise<SiteConfig> {
  await connection();
  return readSiteConfig();
}

/** "+598 94 261 636" -> "59894261636" (wa.me format). */
export const waNumber = (phone: string) => phone.replace(/\D/g, "");

/** "+598 94 261 636" -> "+59894261636" (tel: format). */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
