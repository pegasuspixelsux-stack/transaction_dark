import type { DbState } from "@/types/admin";
import { createSeed } from "./seed";

/**
 * Mock persistence layer. Everything above this file talks to `loadDb` /
 * `saveDb` only, so swapping in Firestore, Supabase or Prisma means
 * re-implementing these functions (async) — nothing else changes.
 */
const DB_KEY = "oceanus-admin-db-v1";

export function loadDb(): DbState {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as DbState;
  } catch {
    // Corrupt or unavailable storage — fall through to a fresh seed.
  }
  const seed = createSeed();
  saveDb(seed);
  return seed;
}

export function saveDb(state: DbState): void {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(state));
  } catch {
    // Quota or private mode: state still lives in memory for this session.
  }
}

export function resetDb(): DbState {
  const seed = createSeed();
  saveDb(seed);
  return seed;
}
