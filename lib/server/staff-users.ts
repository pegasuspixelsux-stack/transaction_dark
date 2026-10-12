/**
 * Staff directory backed by Firebase Authentication (server-only).
 * Role = custom claim `role`. The env-defined super admin is never returned,
 * created, or modified here, regardless of what is in Firebase.
 */
import type { UserRecord } from "firebase-admin/auth";
import type { SessionUser } from "@/types/admin";
import { adminAuth } from "./firebase-admin";
import { isStaffRole, isSuperAdminEmail, type StaffRole } from "./admin-session";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function toStaffUser(u: UserRecord): SessionUser | null {
  const role = (u.customClaims ?? {}).role;
  if (!isStaffRole(role) || isSuperAdminEmail(u.email)) return null;
  return {
    id: u.uid,
    fullName: u.displayName || u.email || "Usuario",
    email: u.email ?? "",
    role,
    active: !u.disabled,
    lastLogin: u.metadata.lastSignInTime ? new Date(u.metadata.lastSignInTime).toISOString() : null,
  };
}

export async function listStaff(): Promise<SessionUser[]> {
  const auth = adminAuth();
  if (!auth) throw new Error("not-configured");
  const out: SessionUser[] = [];
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    for (const u of page.users) {
      const staff = toStaffUser(u);
      if (staff) out.push(staff);
    }
    pageToken = page.pageToken;
  } while (pageToken);
  return out.sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export type { StaffRole };
