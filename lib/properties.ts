import type { Property, PropertyType } from "@/types/property";

export const properties: Property[] = [
  { id: "ji-01", title: "Casa de las Dunas", zone: "José Ignacio", price: 4200000, bedrooms: 5, type: "house", imageUrl: "/images/hero/serena.png" },
  { id: "mn-01", title: "Refugio Manantiales", zone: "Manantiales", price: 2650000, bedrooms: 4, type: "house", imageUrl: "/images/hero/serena.png" },
  { id: "lb-01", title: "Penthouse del Arroyo", zone: "La Barra", price: 1890000, bedrooms: 3, type: "penthouse", imageUrl: "/images/hero/serena.png" },
  { id: "pe-01", title: "Terreno Faro", zone: "Península", price: 950000, bedrooms: 0, type: "land", imageUrl: "/images/hero/serena.png" },
  { id: "ma-01", title: "Apartamento Brava", zone: "Mansa", price: 720000, bedrooms: 2, type: "apartment", imageUrl: "/images/hero/serena.png" },
  { id: "ji-02", title: "Estancia del Este", zone: "José Ignacio", price: 6800000, bedrooms: 6, type: "house", imageUrl: "/images/hero/serena.png" },
];

const TYPE_LABELS: Record<PropertyType, string> = {
  house: "Casa",
  apartment: "Apartamento",
  penthouse: "Penthouse",
  land: "Terreno",
};

export function propertyTypeLabel(type: PropertyType): string {
  return TYPE_LABELS[type];
}

const priceFormatter = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatPrice(usd: number): string {
  return priceFormatter.format(usd);
}
