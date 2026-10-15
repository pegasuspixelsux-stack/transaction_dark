import { createHash } from "node:crypto";
import { adminDb } from "@/lib/server/firebase-admin";

/**
 * Fixed-window rate limiter. Counters live in Firestore (`rateLimits`) so the
 * limit holds across serverless instances; without Firebase Admin it falls
 * back to per-process memory. Keys are hashed so no raw IPs are stored.
 * Fails open: a storage error must never block real visitors.
 */
const memory = new Map<string, { count: number; resetAt: number }>();

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

/** Returns true when this call is within the limit (and counts it). */
export async function allowRequest(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const db = adminDb();
  if (!db) {
    const entry = memory.get(key);
    if (!entry || entry.resetAt < now) {
      memory.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    entry.count += 1;
    return entry.count <= limit;
  }
  try {
    const ref = db.collection("rateLimits").doc(createHash("sha256").update(key).digest("hex").slice(0, 40));
    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.data() as { count?: number; resetAt?: number } | undefined;
      if (!data || (data.resetAt ?? 0) < now) {
        tx.set(ref, { count: 1, resetAt: now + windowMs });
        return true;
      }
      const count = (data.count ?? 0) + 1;
      tx.update(ref, { count });
      return count <= limit;
    });
  } catch (error) {
    console.error("[rate-limit] storage error, allowing request:", (error as Error).message);
    return true;
  }
}
