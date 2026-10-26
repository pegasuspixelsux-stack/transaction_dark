/**
 * Persistence for sales leads (form / concierge submissions). Server-only.
 *
 * One Firestore document per lead in the `leads` collection when Firebase
 * Admin is configured, otherwise `data/leads.json` for local development.
 * Older documents written by the previous client-side code are normalised on
 * read (no `stage` means a new lead).
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { adminDb } from "@/lib/server/firebase-admin";
import { LEAD_STAGES, type Lead, type LeadOutcome, type LeadStage } from "@/types/admin";

const COLLECTION = "leads";
const MAX_LEADS = 2000;

const filePath = () => process.env.LEADS_PATH ?? path.join(process.cwd(), "data", "leads.json");

const SOURCE_LABELS: Record<string, string> = {
  "contact-form": "Formulario de contacto",
  "a-gente-concierge": "Concierge A-Gente",
  "property-whatsapp": "WhatsApp (ficha de propiedad)",
  "property-email": "Email (ficha de propiedad)",
};

type Raw = Record<string, unknown>;

const s = (v: unknown) => (typeof v === "string" ? v : "");

function iso(v: unknown): string {
  if (typeof v === "string" && !Number.isNaN(Date.parse(v))) return v;
  const maybe = v as { toDate?: () => Date } | null;
  if (maybe && typeof maybe.toDate === "function") return maybe.toDate().toISOString();
  return new Date(0).toISOString();
}

function normalise(id: string, d: Raw): Lead {
  // "viewing" was a stage in the previous pipeline; it now belongs to follow-up.
  const rawStage = d.stage === "viewing" ? "contacted" : d.stage;
  const stage = LEAD_STAGES.includes(rawStage as LeadStage) ? (rawStage as LeadStage) : "new";
  const source = s(d.source);
  return {
    id,
    name: s(d.name),
    phone: s(d.phone),
    email: s(d.email),
    propertyId: typeof d.propertyId === "string" && d.propertyId ? d.propertyId : null,
    propertyTitle: s(d.propertyTitle),
    assignedAgentId: typeof d.assignedAgentId === "string" && d.assignedAgentId ? d.assignedAgentId : null,
    stage,
    outcome: stage === "closed" ? (d.outcome === "lost" ? "lost" : "won") : null,
    source: SOURCE_LABELS[source] ?? (source || "Sitio web"),
    createdAt: iso(d.createdAt),
    ...(s(d.intent) ? { intent: s(d.intent) } : {}),
    ...(s(d.message) ? { message: s(d.message) } : {}),
    ...(d.qualified === true ? { qualified: true } : {}),
    ...(d.priority === "alta" || d.priority === "media" || d.priority === "baja" ? { priority: d.priority } : {}),
  };
}

async function readFileLeads(): Promise<Lead[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(/*turbopackIgnore: true*/ filePath(), "utf8"));
    return Array.isArray(parsed) ? (parsed as Raw[]).map((d) => normalise(s(d.id), d)) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") console.error("[leads] could not read file:", error);
    return [];
  }
}

async function writeFileLeads(leads: Lead[]): Promise<void> {
  const target = filePath();
  await fs.mkdir(/*turbopackIgnore: true*/ path.dirname(target), { recursive: true });
  const tmp = `${target}.${process.pid}.tmp`;
  await fs.writeFile(/*turbopackIgnore: true*/ tmp, JSON.stringify(leads, null, 2), "utf8");
  await fs.rename(/*turbopackIgnore: true*/ tmp, target);
}

export async function listLeads(): Promise<Lead[]> {
  const db = adminDb();
  const leads = db
    ? (await db.collection(COLLECTION).limit(MAX_LEADS).get()).docs.map((doc) => normalise(doc.id, doc.data()))
    : await readFileLeads();
  return leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export interface NewLead {
  name: string;
  phone: string;
  email: string;
  propertyId: string | null;
  propertyTitle: string;
  source: string;
  intent: string;
  message: string;
  qualified?: boolean;
  priority?: "alta" | "media" | "baja";
}

export async function createLead(input: NewLead): Promise<Lead> {
  const lead: Lead = {
    ...input,
    id: `l-${crypto.randomUUID().slice(0, 8)}`,
    assignedAgentId: null,
    stage: "new",
    outcome: null,
    createdAt: new Date().toISOString(),
  };
  const db = adminDb();
  if (db) {
    const { id, ...data } = lead;
    await db.collection(COLLECTION).doc(id).set(data);
  } else {
    await writeFileLeads([lead, ...(await readFileLeads())]);
  }
  return lead;
}

export interface LeadPatch {
  stage?: LeadStage;
  outcome?: LeadOutcome | null;
  assignedAgentId?: string | null;
}

/** Returns the updated lead, or `null` when it does not exist. */
export async function updateLead(id: string, patch: LeadPatch): Promise<Lead | null> {
  const db = adminDb();
  if (db) {
    const ref = db.collection(COLLECTION).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return null;
    const next = { ...normalise(id, snap.data() as Raw), ...patch };
    const { id: _id, ...data } = next;
    void _id;
    await ref.set(data);
    return next;
  }
  const all = await readFileLeads();
  const current = all.find((l) => l.id === id);
  if (!current) return null;
  const next = { ...current, ...patch };
  await writeFileLeads(all.map((l) => (l.id === id ? next : l)));
  return next;
}
