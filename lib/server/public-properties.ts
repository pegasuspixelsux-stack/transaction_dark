/**
 * Request-time access to the published property catalog for public pages.
 * `connection()` opts out of prerendering so admin edits show up on the next
 * page load.
 */
import { connection } from "next/server";
import { readProperties } from "@/lib/server/property-store";
import { readZones } from "@/lib/server/zone-store";
import type { AdminProperty } from "@/types/admin";
import type { Property } from "@/types/property";

const LIMIT = 5;

function toPublic(p: AdminProperty, cityByZone: Map<string, string>): Property {
  const city = p.zone ? cityByZone.get(p.zone) : undefined;
  return {
    id: p.id,
    title: p.title,
    ...(city ? { city } : {}),
    zone: p.zone ?? "José Ignacio",
    location: p.location || undefined,
    price: p.price,
    ...(p.priceText ? { priceText: p.priceText } : {}),
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.areaM2,
    yearBuilt: p.yearBuilt,
    padron: p.padron,
    frontage: p.frontage,
    commonExpenses: p.commonExpenses,
    annualTaxes: p.annualTaxes,
    // Records saved before the category change may still say "penthouse".
    type: (p.propertyType as string) === "penthouse" ? "apartment" : (p.propertyType ?? "house"),
    imageUrl: p.imageUrl,
    images: p.images?.length ? p.images : undefined,
    description: p.description || undefined,
    features: p.features.length ? p.features : undefined,
    amenities: p.amenities,
    featured: p.featured,
    hero: p.hero,
  };
}

export async function getPublicProperties(): Promise<Property[]> {
  await connection();
  const [all, zones] = await Promise.all([readProperties(), readZones()]);
  const cityByZone = new Map(zones.map((z) => [z.name, z.city]));
  return all.filter((p) => p.status === "published").map((p) => toPublic(p, cityByZone));
}

/** Properties marked "Destacada" (max 5); falls back to the first 5 if none are marked. */
export const pickFeatured = (list: Property[]): Property[] => {
  const marked = list.filter((p) => p.featured).slice(0, LIMIT);
  return marked.length > 0 ? marked : list.slice(0, LIMIT);
};

/** Properties marked for the hero (max 5) that have an image; falls back to the first 5. */
export const pickHero = (list: Property[]): Property[] => {
  const withImage = list.filter((p) => p.imageUrl);
  const marked = withImage.filter((p) => p.hero).slice(0, LIMIT);
  return marked.length > 0 ? marked : withImage.slice(0, LIMIT);
};
