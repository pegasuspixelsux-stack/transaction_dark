/**
 * Favicon and link-preview (Open Graph / X) metadata from the saved site
 * settings. Server-only. The built-in favicon lives at /public/favicon.ico (not
 * app/favicon.ico, which as a file convention would override uploaded icons).
 */
import type { Metadata } from "next";
import type { SiteConfig } from "@/lib/site-config";

export function brandingMetadata({ agency }: SiteConfig): Pick<Metadata, "icons" | "openGraph" | "twitter"> {
  const favicon = agency.faviconUrl;
  const image = agency.ogImageUrl
    ? [{ url: agency.ogImageUrl, width: 1200, height: 630, alt: agency.name }]
    : undefined;
  return {
    icons: favicon
      ? { icon: [{ url: favicon, type: "image/png", sizes: "512x512" }], apple: [{ url: favicon, sizes: "512x512" }] }
      : { icon: "/favicon.ico" },
    openGraph: {
      type: "website",
      locale: "es_UY",
      siteName: agency.name,
      title: agency.name,
      description: agency.tagline,
      ...(image ? { images: image } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: agency.name,
      description: agency.tagline,
      ...(image ? { images: image.map((i) => i.url) } : {}),
    },
  };
}
