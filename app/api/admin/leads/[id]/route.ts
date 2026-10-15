import { NextResponse } from "next/server";
import { can } from "@/lib/admin/rbac";
import { getServerSession, sameOrigin } from "@/lib/server/admin-session";
import { listLeads, updateLead, type LeadPatch } from "@/lib/server/lead-store";
import { LEAD_STAGES, type LeadOutcome, type LeadStage } from "@/types/admin";

const noStore = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: noStore });

/** Move a lead between stages, set its outcome, or reassign it. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return json({ error: "Origen no permitido." }, 403);
  const session = await getServerSession();
  if (!session) return json({ error: "No autenticado." }, 401);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }

  const { id } = await params;
  const current = (await listLeads()).find((l) => l.id === id);
  if (!current) return json({ error: "No se encontró la consulta." }, 404);

  const seesAll = can(session.role, "leads:view-all");
  if (!seesAll && current.assignedAgentId !== session.sub) {
    return json({ error: "Solo podés editar las consultas asignadas a vos." }, 403);
  }

  const patch: LeadPatch = {};

  if ("stage" in body || "outcome" in body) {
    if (!can(session.role, "leads:move")) return json({ error: "No tenés permiso para mover consultas." }, 403);
    const stage = ("stage" in body ? body.stage : current.stage) as LeadStage;
    if (!LEAD_STAGES.includes(stage)) return json({ error: "Etapa inválida." }, 422);
    patch.stage = stage;
    if (stage === "closed") {
      const outcome = (body.outcome ?? current.outcome ?? "won") as LeadOutcome;
      if (outcome !== "won" && outcome !== "lost") return json({ error: "Resultado inválido." }, 422);
      patch.outcome = outcome;
    } else {
      patch.outcome = null;
    }
  }

  if ("assignedAgentId" in body) {
    if (!can(session.role, "leads:reassign")) return json({ error: "Solo los gerentes pueden reasignar." }, 403);
    const agent = body.assignedAgentId;
    patch.assignedAgentId = typeof agent === "string" && agent ? agent : null;
  }

  if (Object.keys(patch).length === 0) return json({ error: "No hay cambios para guardar." }, 400);

  try {
    const lead = await updateLead(id, patch);
    if (!lead) return json({ error: "No se encontró la consulta." }, 404);
    return json({ lead });
  } catch (error) {
    console.error("[leads] failed to update:", error);
    return json({ error: "No pudimos guardar el cambio." }, 500);
  }
}
