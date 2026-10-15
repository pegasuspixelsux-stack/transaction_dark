import { NextResponse } from "next/server";
import { can } from "@/lib/admin/rbac";
import { getServerSession } from "@/lib/server/admin-session";
import { listLeads } from "@/lib/server/lead-store";

const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401, headers: noStore });
  const all = await listLeads();
  const leads = can(session.role, "leads:view-all")
    ? all
    : all.filter((l) => l.assignedAgentId === session.sub);
  return NextResponse.json({ leads }, { headers: noStore });
}
