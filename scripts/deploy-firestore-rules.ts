/** Publishes firestore.rules to the live project: npx tsx --env-file=.env.local scripts/deploy-firestore-rules.ts */
import { readFileSync } from "node:fs";
import { getSecurityRules } from "firebase-admin/security-rules";
import { getApp } from "firebase-admin/app";
import { adminDb } from "@/lib/server/firebase-admin";

async function main() {
  if (!adminDb()) throw new Error("Firebase Admin is not configured.");
  const source = readFileSync("firestore.rules", "utf8");
  const rules = getSecurityRules(getApp());
  await rules.releaseFirestoreRulesetFromSource(source);
  const current = await rules.getFirestoreRuleset();
  console.log("Released ruleset:", current.name);
}

main().catch((e) => {
  console.error("FAILED:", (e as Error).message);
  process.exit(1);
});
