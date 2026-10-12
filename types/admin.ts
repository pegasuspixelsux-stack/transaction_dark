export type Role = "admin" | "manager" | "agent";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  /** Mock only. A real backend stores a salted hash, never the password. */
  password: string;
  role: Role;
  active: boolean;
  lastLogin: string | null; // ISO
}

/** User shape that is safe to hand to UI state. */
export type SessionUser = Omit<AdminUser, "password">;

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
}

export interface DbState {
  users: AdminUser[];
  properties: AdminProperty[];
  leads: Lead[];
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: number; // epoch ms
}
