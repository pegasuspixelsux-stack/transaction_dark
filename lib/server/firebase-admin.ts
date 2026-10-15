/**
 * Firebase Admin access (server-only). Used to verify ID tokens and manage
 * staff accounts. Credentials come from, in order:
 *   FIREBASE_SERVICE_ACCOUNT       raw JSON or base64-encoded JSON (use on Vercel)
 *   FIREBASE_SERVICE_ACCOUNT_PATH  path to the key file (use locally)
 * Never import this from a client component.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { cert, getApp, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function loadServiceAccount(): ServiceAccount | null {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  try {
    if (inline) {
      const json = inline.startsWith("{") ? inline : Buffer.from(inline, "base64").toString("utf8");
      return JSON.parse(json) as ServiceAccount;
    }
    const file = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
    if (file) {
      return JSON.parse(
        readFileSync(path.resolve(/*turbopackIgnore: true*/ process.cwd(), file), "utf8"),
      ) as ServiceAccount;
    }
  } catch (error) {
    console.error("[firebase-admin] could not load service account:", (error as Error).message);
  }
  return null;
}

let cached: App | null | undefined;

function getAdminApp(): App | null {
  if (cached !== undefined) return cached;
  if (getApps().length) return (cached = getApp());
  const account = loadServiceAccount();
  cached = account ? initializeApp({ credential: cert(account) }) : null;
  return cached;
}

/** `null` when no credentials are configured (staff login is then disabled). */
export function adminAuth(): Auth | null {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}

/** `null` when no credentials are configured. */
export function adminDb(): Firestore | null {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}

export const firebaseAdminConfigured = () => adminAuth() !== null;
