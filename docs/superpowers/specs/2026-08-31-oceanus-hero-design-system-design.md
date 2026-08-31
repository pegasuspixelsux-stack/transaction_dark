# Oceanus — Hero & Design-System Foundation (Cycle 1)

**Date:** 2026-08-31
**Status:** Approved (design), pending spec review
**Branch:** `feat/oceanus-hero-design-system`

## Context

`oceanus` is a fresh Next.js 16.3.3 / React 19 / Tailwind CSS v4 App Router
project, currently carrying only the `create-next-app` boilerplate. The goal
for this cycle is to establish the visual foundation for a luxury real-estate
platform (Punta del Este zones) and ship the first high-impact screen: a
cinematic hero.

This is **cycle 1 of a larger effort**. Explicitly deferred to later cycles:

- Firebase Auth + Firestore wiring (`lib/firebase.ts`). Data layer is decided
  (Firebase, per user), but no persistence code lands this cycle.
- Property listing grid, property detail routes, zone filtering, auth flows.

## Goals

1. Install the motion + class-composition toolchain.
2. Replace the starter theme with a permanent "deep luxury dark" palette and
   supporting Tailwind v4 utilities.
3. Add the `cn()` class-merge helper.
4. Define the `Property` domain types (no runtime code that consumes them yet).
5. Build `OceanusHero.tsx` and render it as the home page.
6. Write a concrete, reusable design-guidelines document and point `AGENTS.md`
   at it.

## Non-Goals

- No `tailwind.config.ts` — Tailwind v4 is CSS-first; theming lives in
  `globals.css` via `@theme` / `@utility`. AGENTS.md explicitly warns against
  assuming pre-v4 conventions.
- No light theme / theme toggle. The brand is committed dark.
- No remote-image configuration. The hero ships with a gradient placeholder and
  a documented swap point.
- No new fonts. Geist (already wired) covers light-weight luxury type.

## Dependencies

```
npm install motion lucide-react clsx tailwind-merge
```

- `motion` (13.1.1) is the current name for the package formerly published as
  `framer-motion` (same version, same team). React bindings import from
  `motion/react`. We use `motion`, not the legacy `framer-motion` alias.
- All four are runtime dependencies (`dependencies`, not `devDependencies`).

## Components & Files

### `app/globals.css` (rewrite)

Replace the CNA starter theme block. Target shape:

```css
@import "tailwindcss";

/* `@theme inline` so `--font-sans` resolves the Geist var set on <html>,
   matching the existing working setup. */
@theme inline {
  --color-surface: #0a0a0a;
  --color-surface-raised: #121212;
  --color-ink: #f5f5f0;
  --color-ink-muted: #a3a29d;   /* ~60% ink, for secondary text */
  --color-hairline: #262625;    /* borders / dividers */
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

/* NOTE: token is `surface`, not `base` — `text-base` is a built-in
   Tailwind font-size utility and would collide. */

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

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--color-surface); }
::-webkit-scrollbar-thumb {
  background: var(--color-hairline);
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover { background: #3a3a38; }
```

Notes:
- `@utility` is the Tailwind v4 mechanism for custom utilities; it makes
  `tracking-luxury` / `tracking-wordmark` first-class (respond to variants).
- Drop the `@media (prefers-color-scheme: dark)` block entirely.
- `layout.tsx` keeps `className={...variable} h-full antialiased`; no change
  needed there beyond confirming the Geist variables still feed `--font-sans`.

### `lib/utils.ts` (new)

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Imported elsewhere as `@/lib/utils` (tsconfig `paths` maps `@/*` → `./*`).

### `types/property.ts` (new)

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
  price: number;        // USD, whole dollars
  bedrooms: number;
  type: PropertyType;
  imageUrl: string;
}
```

No fixtures, no consumers this cycle — the hero does not read property data.

### `components/OceanusHero.tsx` (new, `"use client"`)

Client component: uses `motion/react` and `useReducedMotion`.

Structure:

- **Section wrapper** — `relative min-h-screen w-full overflow-hidden bg-surface`.
- **Background layer** — absolutely positioned. Placeholder:
  `bg-[radial-gradient(...)]` deep charcoal → near-black, plus a subtle
  vignette. Directly above it, a commented-out `<Image fill priority alt="">`
  block marked `SWAP POINT` so final art is a one-line change. A dark scrim
  (`bg-black/40`) sits over the media for text contrast.
- **Sticky nav** — `sticky top-0 z-50 flex items-center justify-between px-6 py-5
  backdrop-blur-md bg-surface/40 border-b border-hairline`. Left: wordmark
  `OCEANUS` in `uppercase tracking-wordmark text-sm font-light`. Right: 3–4 nav
  links (`Propiedades`, `Zonas`, `Nosotros`, `Contacto`) `uppercase
  tracking-luxury text-xs text-ink-muted hover:text-ink transition-colors`.
  A `lucide-react` menu icon shown `md:hidden` (non-functional placeholder this
  cycle — no drawer).
- **Hero content** — vertically centered; text-centered and `items-center` on
  mobile, left-aligned (`sm:text-left sm:items-start`) from `sm` up, with the
  block sitting toward the lower third via padding:
  - Eyebrow: `uppercase tracking-luxury text-xs text-ink-muted`
    ("Punta del Este · Uruguay")
  - Headline: `text-4xl sm:text-6xl lg:text-7xl font-light uppercase
    tracking-luxury leading-[1.05]` — two lines.
  - Subhead: `text-base sm:text-lg text-ink-muted font-light max-w-md`.
  - CTA: single ghost button — `border border-ink/30 px-8 py-3 uppercase
    tracking-luxury text-xs hover:bg-ink hover:text-surface transition-colors`.

Animation:

- Entry uses a parent `motion.div` with a `staggerChildren` transition (~0.08s)
  and child variants `{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }`.
- Transition: spring, `stiffness: 200`, `damping: 26` (soft, no visible
  overshoot on text).
- `const reduce = useReducedMotion()` — when true, render with no `initial` /
  variants (content appears static).
- Only `opacity` and `transform` animate. No layout-animating properties.

### `app/page.tsx` (rewrite)

```tsx
import { OceanusHero } from "@/components/OceanusHero";

export default function Home() {
  return <OceanusHero />;
}
```

Remove all boilerplate imports/markup. `metadata` in `layout.tsx` gets a
minor touch-up (`title: "Oceanus"`, description one-liner) — small, in scope.

### `docs/design-guidelines.md` (new)

Reusable reference, concrete values over adjectives. Sections:

1. **Impeccable Design & High Taste** — spacing scale discipline, one type
   family, weight range (300/400 only for body & headings here), optical
   alignment, hairline borders (`--color-hairline`), restraint on color.
2. **Awesome UI/UX + UX/UI Pro Max** — every interactive element needs
   hover/focus-visible/active/disabled states; every async view needs
   empty/loading/error; contrast targets (ink on base passes AA); tap targets
   ≥ 44px; content max-widths for readability.
3. **Frontend Engineering** — Next 16 default = Server Component; add
   `"use client"` only at the leaf that needs state/effects/browser APIs or a
   client-only lib (`motion`); `NEXT_PUBLIC_` rules and `server-only`; compose
   with `cn()`; colocate types in `types/`.
4. **Emil Kowalski — Micro-Interactions** — animate in response to a user
   action or a mount, never idle; durations 150–250ms for UI feedback,
   ≤ 500ms for entrances; ease-out for enter, ease-in for exit; transform
   origin matches the trigger; animate `opacity`/`transform` only; always
   honor `prefers-reduced-motion`; motion should aid perceived performance,
   not delay interaction.
5. **`motion` / Framer Motion Standards** — spring for physical/spatial
   movement (drag, layout, sheets), tween+ease for opacity/color; default
   spring `{ stiffness: 200, damping: 26 }`; use `AnimatePresence` for
   mount/unmount; `layout` prop sparingly and never on large subtrees;
   `useReducedMotion()` gate is mandatory; import from `motion/react`.

### `AGENTS.md` (append)

```md
## Design work

All UI, styling, and animation work MUST follow `docs/design-guidelines.md`.
```

Appended below the auto-generated block. Committing it alongside this work
keeps the tree clean (per the note in that block).

## Data Flow

None this cycle. The hero is fully static aside from mount-time animation.
`Property` types are declarations only.

## Error Handling

N/A — no data fetching, no user input, no async. The mobile menu icon is inert
by design (documented in the component).

## Testing / Verification

- `npm run build` — clean (no type errors, no `"use client"` boundary errors).
- `npm run lint` — clean.
- `npm run dev` — home route renders the hero: sticky blurred nav, gradient
  background, staggered text entrance.
- Manual: toggle OS "reduce motion" → hero content appears with no transform
  animation.

## Risks / Open Questions

- `tailwind-merge` has no knowledge of the custom `tracking-luxury` /
  `tracking-wordmark` utilities, but since they don't collide with Tailwind's
  `tracking-*` scale in practice within this component, no custom config is
  needed. If conflicts appear later, extend via `extendTailwindMerge`.
- Placeholder gradient is intentionally not "cinematic imagery" — final art is
  a follow-up asset task; swap point is marked in the component.

## Follow-up Cycles (not in scope)

1. `lib/firebase.ts` + env wiring + property fixtures/seed.
2. Listings grid + zone filter.
3. Property detail route.
4. Auth flows.
