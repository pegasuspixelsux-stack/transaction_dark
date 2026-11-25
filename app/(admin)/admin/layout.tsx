import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSiteConfig } from "@/lib/server/public-config";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Read server-side so every role sees the saved name and logo (the config API is admin-only).
  const { agency } = await getSiteConfig();
  return (
    <AdminShell brand={{ name: agency.name, logoUrl: agency.logoUrl }}>{children}</AdminShell>
  );
}
