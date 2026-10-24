export type PropertyZone =
  | "José Ignacio"
  | "Manantiales"
  | "La Barra"
  | "Península"
  | "Mansa";

export type PropertyType = "house" | "apartment" | "land" | "farm" | "field";

export interface Property {
  id: string;
  title: string;
  zone: PropertyZone;
  /** Free-text address line, e.g. "Punta del Este, Maldonado". */
  location?: string;
  price: number; // USD, whole dollars
  bedrooms: number;
  bathrooms?: number;
  area?: number; // m²
  yearBuilt?: number;
  /** Cadastral parcel number (padrón). */
  padron?: string;
  /** Street frontage in metres (medida del frente). */
  frontage?: number;
  /** Monthly common expenses (gastos comunes). */
  commonExpenses?: number;
  /** Yearly property taxes. */
  annualTaxes?: number;
  type: PropertyType;
  imageUrl: string;
  images?: string[]; // Array of image URLs for slideshow
  description?: string;
  features?: string[];
  amenities?: string[];
  /** Shown in "Propiedades destacadas" (max 5 across the catalog). */
  featured?: boolean;
  /** Shown in the homepage hero slideshow (max 5 across the catalog). */
  hero?: boolean;
}
