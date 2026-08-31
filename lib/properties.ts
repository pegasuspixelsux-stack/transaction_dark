import type { Property, PropertyType } from "@/types/property";

// Placeholder imagery — Unsplash (architecture / coastal homes).
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

export const properties: Property[] = [
  { id: "ji-01", title: "Casa de las Dunas", zone: "José Ignacio", price: 4200000, bedrooms: 5, type: "house", imageUrl: img("1613490493576-7fde63acd811") },
  { id: "mn-01", title: "Refugio Manantiales", zone: "Manantiales", price: 2650000, bedrooms: 4, type: "house", imageUrl: img("1600596542815-ffad4c1539a9") },
  { id: "lb-01", title: "Penthouse del Arroyo", zone: "La Barra", price: 1890000, bedrooms: 3, type: "penthouse", imageUrl: img("1600585154340-be6161a56a0c") },
  { id: "pe-01", title: "Terreno Faro", zone: "Península", price: 950000, bedrooms: 0, type: "land", imageUrl: img("1600047509807-ba8f99d2cdde") },
  { id: "ma-01", title: "Apartamento Brava", zone: "Mansa", price: 720000, bedrooms: 2, type: "apartment", imageUrl: img("1580587771525-78b9dba3b914") },
  { id: "ji-02", title: "Estancia del Este", zone: "José Ignacio", price: 6800000, bedrooms: 6, type: "house", imageUrl: img("1512917774080-9991f1c4c750") },
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
