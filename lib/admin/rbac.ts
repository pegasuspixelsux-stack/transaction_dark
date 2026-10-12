import type { Role } from "@/types/admin";

export type Permission =
  | "users:manage"
  | "properties:view-all"
  | "properties:write"
  | "leads:view-all"
  | "leads:reassign"
  | "leads:move";

const PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: [
    "users:manage",
    "properties:view-all",
    "properties:write",
    "leads:view-all",
    "leads:reassign",
    "leads:move",
  ],
  manager: [
    "properties:view-all",
    "properties:write",
    "leads:view-all",
    "leads:reassign",
    "leads:move",
  ],
  // Agents only see what is assigned to them (enforced by the data layer).
  agent: ["leads:move"],
};

export function can(role: Role | undefined, permission: Permission): boolean {
  return role ? PERMISSIONS[role].includes(permission) : false;
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  manager: "Manager",
  agent: "Sales Agent",
};
