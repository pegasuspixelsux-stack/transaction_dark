#!/usr/bin/env node
/**
 * Rotate the Super Admin password.
 *
 *   node scripts/reset-super-admin.mjs            # local + Vercel + redeploy
 *   node scripts/reset-super-admin.mjs --local    # only .env.local
 *
 * - Writes a fresh 5-word passphrase to .env.local (never printed).
 * - Unless --local: updates SUPER_ADMIN_PASSWORD on the Vercel project and
 *   redeploys production. Requires `vercel login` as the account that owns the
 *   team (see TEAM / PROJECT below).
 *
 * Read the new password afterwards with:  grep SUPER_ADMIN_PASSWORD .env.local
 */
import { execFileSync } from "node:child_process";
import { randomInt } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TEAM = "pegasuspixels";
const PROJECT = "transaction-dark";
const ENV_FILE = ".env.local";
const KEY = "SUPER_ADMIN_PASSWORD";
const localOnly = process.argv.includes("--local");

const WORDS =
  "able acid aged also area army atom aunt away baby back ball band bank barn base bath bead beam bear beef bell belt bike bird blue boat body bold bone book boot born boss bowl bulb bush cake calm camp card care cart case cash cave cell chef chip city clay clip club coal coat code coin cold cook cool cope cord corn cost crab crew crop dark dash data dawn deal deck deep deer desk dial dice dish dive dock dome door dove down draw drum duck dune dusk dust each earn east easy edge exit face fact fair farm fast fawn fern fill film fine fire fish flag flat flow foam fold folk food ford fork fort frog fuel full gain game gate gear gift glad glow goal gold golf good gown grid grin gulf hail half hall hand harp hawk heal heat herb hill hint hold home hope horn hose host hour hunt idea inch iron isle jade jazz join jump keen kind king kite knot lake lamp land lane lark leaf lens lime line lion list loft loop luck lush mail main map mark mast meal melt mint mist moon moss nest news nook oak oats opal oven pace pack palm park path peak pear pier pine plan play plum pond pool port pure quay rain reed rice ring road rock roof rope rose sage sail salt sand seal seed ship silk snow soap song star step stone sun tide tree twin vale view wave wind wool yard zinc zone".split(
    " ",
  );

const vercel = (args, opts = {}) =>
  execFileSync("vercel", args, { encoding: "utf8", shell: process.platform === "win32", ...opts });

const password =
  Array.from({ length: 5 }, () => WORDS[randomInt(WORDS.length)]).join("-") +
  "-" +
  randomInt(10, 100);

if (!existsSync(ENV_FILE)) {
  console.error(`${ENV_FILE} not found. Run from the project root.`);
  process.exit(1);
}
const line = new RegExp(`^${KEY}=.*$`, "m");
let env = readFileSync(ENV_FILE, "utf8");
env = line.test(env)
  ? env.replace(line, `${KEY}=${password}`)
  : `${env.replace(/\s*$/, "\n")}${KEY}=${password}\n`;
writeFileSync(ENV_FILE, env);
console.log(`✓ New password written to ${ENV_FILE}`);

if (localOnly) {
  console.log("Restart `npm run dev` to apply it locally.");
  process.exit(0);
}

const tmp = mkdtempSync(join(tmpdir(), "sa-"));
try {
  const base = `/v10/projects/${PROJECT}/env?slug=${TEAM}`;
  const listing = JSON.parse(vercel(["api", base]));
  const entry = listing.envs?.find((e) => e.key === KEY);
  const body = join(tmp, "body.json");
  if (entry) {
    writeFileSync(body, JSON.stringify({ value: password }));
    vercel(["api", `/v9/projects/${PROJECT}/env/${entry.id}?slug=${TEAM}`, "--method", "PATCH", "--input", body]);
  } else {
    writeFileSync(
      body,
      JSON.stringify({ key: KEY, value: password, type: "sensitive", target: ["production", "preview"] }),
    );
    vercel(["api", base, "--method", "POST", "--input", body]);
  }
  console.log("✓ Vercel variable updated");

  const latest = vercel(["list", PROJECT, "--scope", TEAM])
    .split(/\r?\n/)
    .find((l) => /^https:\/\//.test(l.trim()));
  if (!latest) throw new Error("Could not find a deployment to redeploy.");
  console.log("Redeploying (about a minute)…");
  vercel(["redeploy", latest.trim(), "--scope", TEAM], { stdio: "ignore" });
  console.log("✓ Redeployed. Read the password with: grep SUPER_ADMIN_PASSWORD .env.local");
} catch (error) {
  console.error(
    "\nVercel step failed. Is the CLI logged in as the account that owns the team (`vercel login`)?\n",
    String(error.message).split("\n")[0],
  );
  console.error(`Your local ${ENV_FILE} already has the new password; Vercel still has the old one.`);
  process.exit(1);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
