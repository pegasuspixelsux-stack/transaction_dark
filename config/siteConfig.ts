/**
 * Central business configuration — the *defaults*.
 *
 * Live values are edited in the admin panel (Configuración del sitio) and
 * persisted server-side by `lib/server/config-store.ts`; stored values override
 * these defaults. Client components that import `siteConfig` get the defaults
 * only (e.g. the agency name in the admin chrome).
 */
import { DEFAULT_SITE_CONFIG, type SiteConfig } from "@/lib/site-config";

export const siteConfig: SiteConfig = DEFAULT_SITE_CONFIG;
export type { SiteConfig };
