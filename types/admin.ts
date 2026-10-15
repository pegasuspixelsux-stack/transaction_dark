import type { PropertyType, PropertyZone } from "@/types/property";

/** `superadmin` is hardcoded server-side (env credentials) and never stored in the users table. */
export type Role = "superadmin" | "admin" | "manager" | "agent";
export type StoredRole = Exclude<Role, "superadmin">;

/** A signed-in staff member (Firebase account) or the env-defined super admin. */
export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  active: boolean;
  lastLogin: string | null; // ISO
}

/** One problem found while importing a spreadsheet. */
export interface ImportRowError {
  /** Spreadsheet row number (the header is row 1). */
  row: number;
  title: string;
  error: string;
}

/** Result of previewing or committing an Excel import. */
export interface PropertyImportSummary {
  created: number;
  updated: number;
  errors: ImportRowError[];
  saved: boolean;
}

export type ListingType = "sale" | "rent";
export type Currency = "USD" | "UYU" | "EUR";
export type PublishStatus = "draft" | "published";

export interface AdminProperty {
  id: string;
  title: string;
  listingType: ListingType;
  price: number;
  currency: Currency;
  location: string;
  bedrooms: number;
  bathrooms: number;
  areaM2: number;
  features: string[];
  imageUrl: string;
  description: string;
  status: PublishStatus;
  assignedAgentId: string | null;
  updatedAt: string; // ISO
  /** Public-site fields. Optional so older records keep working. */
  zone?: PropertyZone;
  propertyType?: PropertyType;
  images?: string[];
  yearBuilt?: number;
  amenities?: string[];
  /** "Propiedades destacadas" on the homepage (max 5). */
  featured?: boolean;
  /** Homepage hero slideshow (max 5). */
  hero?: boolean;
}

export const LEAD_STAGES = [
  "new",
  "contacted",
  "viewing",
  "negotiation",
  "closed",
] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];
export type LeadOutcome = "won" | "lost";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyId: string | null;
  propertyTitle: string;
  assignedAgentId: string | null;
  stage: LeadStage;
  /** Only meaningful when `stage === "closed"`. */
  outcome: LeadOutcome | null;
  source: string;
  createdAt: string; // ISO
  /** What the visitor said they want (from the form). */
  intent?: string;
  message?: string;
}


