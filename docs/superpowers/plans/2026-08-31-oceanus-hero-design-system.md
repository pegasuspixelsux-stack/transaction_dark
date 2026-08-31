# Oceanus Hero & Design-System Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the luxury-dark visual foundation and ship the cinematic `OceanusHero` as the home page.

**Architecture:** Tailwind v4 CSS-first theming in `app/globals.css` (`@theme inline` + `@utility`), a `cn()` class-merge helper, `Property` domain types (declarations only), one self-contained `"use client"` hero component driven by `motion/react`, and a concrete design-guidelines doc referenced from `AGENTS.md`. No data layer this cycle.

**Tech Stack:** Next.js 16.3.3 (App Router), React 19, TypeScript, Tailwind CSS v4, `motion` 13.1.1, `lucide-react`, `clsx`, `tailwind-merge`.

**Spec:** `docs/superpowers/specs/2026-08-31-oceanus-hero-design-system-design.md` — read it alongside this plan.

## Global Constraints

- Next.js is **16.3.3** with App Router; this is a modified Next — consult `node_modules/next/dist/docs/` before changing framework-touching code. Do not remove the auto-generated block in `AGENTS.md`.
- **No `tailwind.config.ts`.** Tailwind v4 is CSS-first; all theme tokens and custom utilities live in `app/globals.css`.
- **No test runner is added this cycle.** Verification gates per task are: `npm run build` (clean), `npm run lint` (clean), and — for visual tasks — `npm run dev` with a stated manual check. This is deliberate: the deliverables are CSS tokens, type declarations, and one visual component; a unit runner would only exercise third-party libraries.
- Color token is **`surface`** (`--color-surface`), never `base` — `text-base` is a built-in Tailwind font-size utility and a `--color-base` token would shadow it.
- Permanent dark theme. No light mode, no theme toggle, no `prefers-color-scheme` block.
- `motion` package, React bindings imported from `motion/react`. Never the legacy `framer-motion` name.
- All four new packages go in `dependencies`, not `devDependencies`.
- UI copy is Spanish (Rioplatense), matching the Punta del Este market.
- Path alias: `@/*` → `./*` (repo root). Import the helper as `@/lib/utils`, types as `@/types/property`.
- Every animation must gate on `useReducedMotion()`; animate `opacity`/`transform` only.
- End every task with a commit. Commit message trailer:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FeaGCm6YBYNQKG3L2hud55
  ```
- Work stays on branch `feat/oceanus-hero-design-system`.

---

### Task 1: Install the motion + class-composition toolchain

**Files:**
- Modify: `package.json` (via npm), `package-lock.json`

**Interfaces:**
- Consumes: nothing.
- Produces: `motion` / `motion/react`, `lucide-react`, `clsx`, `tailwind-merge` available to later tasks.

- [ ] **Step 1: Install the four runtime dependencies**

```bash
npm install motion lucide-react clsx tailwind-merge
```

- [ ] **Step 2: Verify they landed in `dependencies`**

Run: `node -e "const p=require('./package.json'); console.log(p.dependencies)"`
Expected: object contains `motion`, `lucide-react`, `clsx`, `tailwind-merge` (and the existing `next`, `react`, `react-dom`). None of the four appear under `devDependencies`.

- [ ] **Step 3: Verify `motion/react` resolves**

Run: `node -e "require.resolve('motion/react'); console.log('ok')"`
Expected: prints `ok`.

- [ ] **Step 4: Verify the build is still clean**

Run: `npm run build`
Expected: build completes with no errors (the CNA starter page still builds).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add motion, lucide-react, clsx, tailwind-merge"
```

---

### Task 2: Luxury-dark theme in `app/globals.css`

**Files:**
- Modify (rewrite): `app/globals.css`
- Modify: `app/layout.tsx` (metadata only)

**Interfaces:**
- Consumes: nothing.
- Produces: utility classes `bg-surface` `bg-surface-raised` `text-ink` `text-ink-muted` `border-hairline` (+ `/opacity` variants), `tracking-luxury`, `tracking-wordmark`; global dark `body` (background `#0A0A0A`, ink `#F5F5F0`, `font-weight: 300`); themed scrollbars.

- [ ] **Step 1: Rewrite `app/globals.css`**

```css
@import "tailwindcss";

/* `@theme inline` so `--font-sans` resolves the Geist variables set on <html>. */
@theme inline {
  --color-surface: #0a0a0a;
  --color-surface-raised: #121212;
  --color-ink: #f5f5f0;
  --color-ink-muted: #a3a29d;
  --color-hairline: #262625;
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@utility tracking-luxury {
  letter-spacing: 0.2em;
}

@utility tracking-wordmark {
  letter-spacing: 0.35em;
}

:root {
  color-scheme: dark;
}

html {
  scrollbar-width: thin;
  scrollbar-color: var(--color-hairline) var(--color-surface);
}

body {
  background: var(--color-surface);
  color: var(--color-ink);
  font-weight: 300;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--color-surface);
}
::-webkit-scrollbar-thumb {
  background: var(--color-hairline);
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #3a3a38;
}
```

- [ ] **Step 2: Update metadata in `app/layout.tsx`**

Replace the `metadata` export only. Leave the font setup and the `RootLayout` component exactly as they are.

```tsx
export const metadata: Metadata = {
  title: "Oceanus",
  description: "Propiedades de autor frente al mar en Punta del Este.",
};
```

- [ ] **Step 3: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: both clean. No "unknown utility" or "unknown at-rule" errors from the new `@utility` blocks.

- [ ] **Step 4: Visual check**

Run: `npm run dev`, open `http://localhost:3000`.
Expected: the (still CNA-boilerplate) page now renders on a near-black `#0A0A0A` background with light text; scrollbar is thin and dark. Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: luxury-dark Tailwind v4 theme and metadata"
```

---

### Task 3: `cn()` helper and `Property` domain types

**Files:**
- Create: `lib/utils.ts`
- Create: `types/property.ts`

**Interfaces:**
- Consumes: `clsx`, `tailwind-merge` (Task 1).
- Produces:
  - `cn(...inputs: ClassValue[]): string` from `@/lib/utils`
  - `PropertyZone`, `PropertyType`, `Property` from `@/types/property`

- [ ] **Step 1: Create `lib/utils.ts`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Create `types/property.ts`**

```ts
export type PropertyZone =
  | "José Ignacio"
  | "Manantiales"
  | "La Barra"
  | "Península"
  | "Mansa";

export type PropertyType = "house" | "apartment" | "penthouse" | "land";

export interface Property {
  id: string;
  title: string;
  zone: PropertyZone;
  price: number; // USD, whole dollars
  bedrooms: number;
  type: PropertyType;
  imageUrl: string;
}
```

- [ ] **Step 3: Verify both modules typecheck and are importable**

Create a scratch file `scratch-check.ts` at the repo root:

```ts
import { cn } from "@/lib/utils";
import type { Property } from "@/types/property";

const _cls: string = cn("a", { b: true }, ["c"]);
const _p: Property = {
  id: "1",
  title: "Casa",
  zone: "José Ignacio",
  price: 1000000,
  bedrooms: 4,
  type: "house",
  imageUrl: "/x.jpg",
};
void _cls;
void _p;
```

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Delete the scratch file**

```bash
rm scratch-check.ts
```

Run: `npx tsc --noEmit && npm run lint`
Expected: both clean.

- [ ] **Step 5: Commit**

```bash
git add lib/utils.ts types/property.ts
git commit -m "feat: add cn() helper and Property domain types"
```

---

### Task 4: `OceanusHero` component, rendered as the home page

**Files:**
- Create: `components/OceanusHero.tsx`
- Modify (rewrite): `app/page.tsx`

**Interfaces:**
- Consumes: `motion` / `useReducedMotion` / `Variants` from `motion/react`; `Menu` from `lucide-react`.
- Produces: `export function OceanusHero()` from `@/components/OceanusHero`.

- [ ] **Step 1: Create `components/OceanusHero.tsx`**

```tsx
"use client";

import { Menu } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";

const NAV_LINKS = ["Propiedades", "Zonas", "Nosotros", "Contacto"] as const;

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 26 },
  },
};

export function OceanusHero() {
  const reduce = useReducedMotion();
  const parentMotion = reduce
    ? {}
    : { variants: container, initial: "hidden" as const, animate: "show" as const };
  const childVariants = reduce ? undefined : item;

  return (
    <section className="relative flex min-h-screen w-full flex-col overflow-hidden bg-surface">
      {/*
        SWAP POINT — cinematic imagery.
        Replace the gradient <div> below with:
          <Image src={HERO_SRC} alt="" fill priority sizes="100vw" className="object-cover" />
        and add the image host to next.config.ts -> images.remotePatterns.
      */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,#1c1c1c_0%,#0a0a0a_55%,#050505_100%)]"
      />
      <div aria-hidden className="absolute inset-0 bg-black/40" />

      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-hairline bg-surface/40 px-6 py-5 backdrop-blur-md">
        <span className="text-sm font-light uppercase tracking-wordmark">
          Oceanus
        </span>
        <ul className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <a
                href="#"
                className="text-xs uppercase tracking-luxury text-ink-muted transition-colors hover:text-ink"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          aria-label="Abrir menú"
          className="text-ink-muted transition-colors hover:text-ink md:hidden"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </nav>

      <motion.div
        {...parentMotion}
        className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-32 text-center sm:items-start sm:pb-40 sm:pl-16 sm:text-left"
      >
        <motion.p
          variants={childVariants}
          className="text-xs uppercase tracking-luxury text-ink-muted"
        >
          Punta del Este · Uruguay
        </motion.p>
        <motion.h1
          variants={childVariants}
          className="max-w-3xl text-4xl font-light uppercase leading-[1.05] tracking-luxury sm:text-6xl lg:text-7xl"
        >
          Propiedades
          <br />
          frente al mar
        </motion.h1>
        <motion.p
          variants={childVariants}
          className="max-w-md text-base font-light text-ink-muted sm:text-lg"
        >
          Una colección curada de residencias en José Ignacio, Manantiales, La
          Barra, Península y Mansa.
        </motion.p>
        <motion.a
          variants={childVariants}
          href="#"
          className="mt-2 border border-ink/30 px-8 py-3 text-xs uppercase tracking-luxury transition-colors hover:bg-ink hover:text-surface"
        >
          Ver propiedades
        </motion.a>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Rewrite `app/page.tsx`**

```tsx
import { OceanusHero } from "@/components/OceanusHero";

export default function Home() {
  return <OceanusHero />;
}
```

- [ ] **Step 3: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: both clean. `app/page` builds as a static route. No `"use client"` boundary errors (the client component is a leaf imported by the server page — this is allowed).

- [ ] **Step 4: Visual check**

Run: `npm run dev`, open `http://localhost:3000`.
Expected:
- Full-screen dark radial-gradient background.
- Sticky top nav with blur, hairline bottom border, `OCEANUS` wordmark (wide tracking), 4 nav links on desktop, a menu icon below `md`.
- Headline / eyebrow / subhead / CTA fade + rise in, staggered, on load.
- CTA inverts (ink fill, dark text) on hover.

- [ ] **Step 5: Reduced-motion check**

Enable the OS "reduce motion" setting (Windows: Settings → Accessibility → Visual effects → Animation effects off), hard-reload `http://localhost:3000`.
Expected: hero content is present immediately with no fade/rise animation. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add components/OceanusHero.tsx app/page.tsx
git commit -m "feat: add OceanusHero and render it as the home page"
```

---

### Task 5: Design-guidelines doc and `AGENTS.md` pointer

**Files:**
- Create: `docs/design-guidelines.md`
- Modify: `AGENTS.md` (append one section at the end)

**Interfaces:**
- Consumes: nothing.
- Produces: a reference doc; no code surface.

- [ ] **Step 1: Create `docs/design-guidelines.md`**

```md
# Oceanus Design Guidelines

Follow these for all UI, styling, and animation work. Concrete rules over taste debates.

## 1. Impeccable Design & High Taste

- One type family (Geist). Weights: 300 for body and headings, 400 only for
  emphasis. Never bold.
- Uppercase display type always carries tracking: `tracking-luxury` (0.2em) for
  headings and links, `tracking-wordmark` (0.35em) for the logotype.
- Spacing uses the Tailwind scale only. No arbitrary pixel values for margin,
  padding, or gap.
- Borders are hairlines: `border border-hairline`. No heavy rules, no shadows
  for separation.
- Color restraint: `surface`, `surface-raised`, `ink`, `ink-muted`, `hairline`.
  Introduce a new color only with a documented reason.
- Optical alignment over mathematical: nudge icons and punctuation to look
  centered, not to measure centered.

## 2. Awesome UI/UX + UX/UI Pro Max

- Every interactive element defines `hover`, `focus-visible`, `active`, and
  `disabled` states. Never remove focus outlines without replacing them.
- Every async view defines empty, loading, and error states before it ships.
- Contrast: body text must pass WCAG AA against its background. `ink` on
  `surface` passes; `ink-muted` is for secondary text at >= 14px only.
- Touch targets >= 44x44px.
- Line length for reading text: `max-w-md` to `max-w-prose`.
- Respect `prefers-reduced-motion` everywhere motion exists.

## 3. Frontend Engineering (Next.js 16 App Router)

- Default to Server Components. Add `"use client"` only at the leaf component
  that needs state, effects, browser APIs, or a client-only library (`motion`).
- A server page importing a client leaf is fine; pushing `"use client"` up to
  layouts or pages is not.
- Client-exposed env vars must be prefixed `NEXT_PUBLIC_`. Keep secrets in
  server-only modules; reach for the `server-only` package if a module must
  never cross the boundary.
- Compose class names with `cn()` from `@/lib/utils` — never string-concatenate
  conditional classes.
- Domain types live in `types/`. Import via the `@/` alias.
- Consult `node_modules/next/dist/docs/` before using an unfamiliar framework
  API — this Next build has breaking changes vs. older docs.

## 4. Emil Kowalski — Micro-Interactions

- Animate in response to a user action or a mount. Never animate idle UI.
- Durations: 150–250ms for state feedback (hover, toggle), <= 500ms for
  entrances. Anything slower feels broken.
- Easing: ease-out for enter, ease-in for exit. Linear only for continuous
  motion (spinners, marquees).
- Transform origin matches the trigger — a menu opening from a button grows
  from that button's corner.
- Animate `opacity` and `transform` only. Never animate `width`, `height`,
  `top`, `left`, or box-model properties.
- Motion should make the UI feel faster, never gate interaction behind it.
- Always honor `prefers-reduced-motion` (`useReducedMotion()`).

## 5. motion / Framer Motion Standards

- Import from `motion/react`.
- Spring for physical or spatial movement (drag, layout shifts, sheets,
  position). Tween + ease for opacity and color.
- Default spring: `{ type: "spring", stiffness: 200, damping: 26 }` — soft, no
  visible overshoot. Tune per interaction, document why.
- Entrances use variants + `staggerChildren` (~0.08s) on a parent, not manual
  per-child delays.
- Use `AnimatePresence` for mount/unmount transitions.
- Use the `layout` prop sparingly; never on large subtrees (it measures every
  child every frame).
- Every animated component computes `const reduce = useReducedMotion()` and
  renders static output when it is true.
```

- [ ] **Step 2: Append to `AGENTS.md`**

Add at the very end of the file (below the auto-generated block), preceded by one blank line:

```md

## Design work

All UI, styling, and animation work MUST follow `docs/design-guidelines.md`.
```

- [ ] **Step 3: Verify nothing broke**

Run: `npm run build && npm run lint`
Expected: both clean (docs-only change; this is a sanity check that `AGENTS.md` edits did not disturb anything).

- [ ] **Step 4: Commit**

```bash
git add docs/design-guidelines.md AGENTS.md
git commit -m "docs: add design guidelines and reference them from AGENTS.md"
```

---

## Self-Review

**1. Spec coverage:**
- Dependencies → Task 1. ✓
- `globals.css` luxury-dark theme + `@utility` + scrollbars + drop light block → Task 2. ✓
- `layout.tsx` metadata touch-up → Task 2. ✓
- `cn()` helper → Task 3. ✓
- `Property` / `PropertyZone` / `PropertyType` → Task 3. ✓
- `OceanusHero.tsx` (background swap point, sticky blur nav, wordmark, nav links, mobile menu icon, staggered spring entry, reduced-motion gate, opacity/transform only) → Task 4. ✓
- `app/page.tsx` renders the hero → Task 4. ✓
- `docs/design-guidelines.md` all five sections → Task 5. ✓
- `AGENTS.md` pointer → Task 5. ✓
- Verification (build, lint, dev, reduced-motion) → gates in Tasks 2 and 4. ✓
- Deferred (Firebase, listings, detail, auth) → out of scope, not planned. ✓

**2. Placeholder scan:** No "TBD"/"TODO"/"handle edge cases"/"similar to Task N". The `SWAP POINT` comment is a deliberate, spec-mandated marker with the exact replacement code inline, not a plan placeholder.

**3. Type consistency:**
- `cn(...inputs: ClassValue[]): string` — defined Task 3, matches Global Constraints wording.
- `OceanusHero` — named export, referenced identically in Task 4 Step 1/Step 2 and the interfaces block.
- `container` / `item` `Variants`, `parentMotion` / `childVariants` locals — defined and consumed within Task 4 Step 1 only; consistent.
- `PropertyZone` members exactly match the spec's five zones including accents (`José Ignacio`, `Península`).

No issues found.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-31-oceanus-hero-design-system.md`.
