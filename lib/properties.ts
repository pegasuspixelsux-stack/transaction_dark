import type { Property, PropertyType, PropertyZone } from "@/types/property";

// Placeholder imagery — Unsplash (architecture / coastal homes).
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

export const properties: Property[] = [
  { id: "ji-01", title: "Casa de las Dunas", zone: "José Ignacio", price: 4200000, bedrooms: 5, type: "house", imageUrl: img("1613490493576-7fde63acd811") },
  { id: "ji-02", title: "Estancia del Este", zone: "José Ignacio", price: 6800000, bedrooms: 6, type: "house", imageUrl: img("1600596542815-ffad4c1539a9") },
  { id: "ji-03", title: "Casa Faro Norte", zone: "José Ignacio", price: 3550000, bedrooms: 4, type: "house", imageUrl: img("1600585154340-be6161a56a0c") },
  { id: "ji-04", title: "Terreno Camino de los Ceibos", zone: "José Ignacio", price: 1250000, bedrooms: 0, type: "land", imageUrl: img("1449844908441-8829872d2607") },
  { id: "mn-01", title: "Refugio Manantiales", zone: "Manantiales", price: 2650000, bedrooms: 4, type: "house", imageUrl: img("1512917774080-9991f1c4c750") },
  { id: "mn-02", title: "Casa Médano", zone: "Manantiales", price: 3100000, bedrooms: 4, type: "house", imageUrl: img("1600047509807-ba8f99d2cdde") },
  { id: "mn-03", title: "Penthouse Bikini", zone: "Manantiales", price: 1780000, bedrooms: 3, type: "penthouse", imageUrl: img("1600566753190-17f0baa2a6c3") },
  { id: "lb-01", title: "Penthouse del Arroyo", zone: "La Barra", price: 1890000, bedrooms: 3, type: "penthouse", imageUrl: img("1600607687644-c7171b42498f") },
  { id: "lb-02", title: "Casa Galería", zone: "La Barra", price: 2450000, bedrooms: 4, type: "house", imageUrl: img("1600585152220-90363fe7e115") },
  { id: "pe-01", title: "Terreno Faro", zone: "Península", price: 950000, bedrooms: 0, type: "land", imageUrl: img("1583608205776-bfd35f0d9f83") },
  { id: "pe-02", title: "Apartamento Torre Mar", zone: "Península", price: 690000, bedrooms: 2, type: "apartment", imageUrl: img("1502005097973-6a7082348e28") },
  { id: "ma-01", title: "Apartamento Brava", zone: "Mansa", price: 720000, bedrooms: 2, type: "apartment", imageUrl: img("1598928506311-c55ded91a20c") },
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

export function countByZone(zone: PropertyZone): number {
  return properties.filter((p) => p.zone === zone).length;
}

const priceFormatter = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatPrice(usd: number): string {
  return priceFormatter.format(usd);
}
