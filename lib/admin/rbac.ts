import type { Role } from "@/types/admin";

export type Permission =
  | "users:manage"
  | "config:manage"
  | "properties:view-all"
  | "properties:write"
  /** Edit and publish/unpublish a property already in the list (no create, delete or homepage flags). */
  | "properties:edit"
  | "leads:view-all"
  | "leads:reassign"
  | "leads:move";

const PERMISSIONS: Record<Role, readonly Permission[]> = {
  // Full system privileges. Not a database user: see lib/server/admin-session.ts.
  superadmin: [
    "users:manage",
    "config:manage",
    "properties:view-all",
    "properties:write",
    "properties:edit",
    "leads:view-all",
    "leads:reassign",
    "leads:move",
  ],
  admin: [
    "users:manage",
    "config:manage",
    "properties:view-all",
    "properties:write",
    "properties:edit",
    "leads:view-all",
    "leads:reassign",
    "leads:move",
  ],
  manager: [
    "properties:view-all",
    "properties:write",
    "properties:edit",
    "leads:view-all",
    "leads:reassign",
    "leads:move",
  ],
  // Agents manage properties like managers, but only see and move their own leads (enforced by the data layer).
  agent: ["properties:view-all", "properties:write", "properties:edit", "leads:move"],
};

export function can(role: Role | undefined, permission: Permission): boolean {
  return role ? PERMISSIONS[role].includes(permission) : false;
}

export const ROLE_LABELS: Record<Role, string> = {
  superadmin: "Super administrador",
  admin: "Administrador",
  manager: "Gerente",
  agent: "Agente de ventas",
};
