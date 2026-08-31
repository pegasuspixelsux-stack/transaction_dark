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
  type: PropertyType;
  imageUrl: string;
}
