export type PropertyZone =
  | "José Ignacio"
  | "Manantiales"
  | "La Barra"
  | "Península"
  | "Mansa";

export type PropertyType = "house" | "apartment" | "penthouse" | "land";

export interface Property {
  id: string;
  title: string;
  zone: PropertyZone;
  price: number; // USD, whole dollars
  bedrooms: number;
  bathrooms?: number;
  area?: number; // m²
  yearBuilt?: number;
  type: PropertyType;
  imageUrl: string;
  images?: string[]; // Array of image URLs for slideshow
  description?: string;
  features?: string[];
  amenities?: string[];
}
