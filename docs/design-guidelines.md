# Transaction Design Guidelines

Follow these for all UI, styling, and animation work. Concrete rules over taste debates.

## 1. Impeccable Design & High Taste

- Two typefaces. **Playfair Display** (`font-display`) for headings only —
  title case, `tracking-tight`, weight 400–500, never uppercase. Italic is allowed for one emphasised phrase inside a heading. **Montserrat**
  (`font-sans`, the default) for everything else — body, nav, eyebrows,
  buttons, labels — weight 300–400. Never bold.
- Uppercase + tracking belongs to Montserrat labels only: `tracking-luxury`
  (0.2em) for eyebrows, nav links, and buttons; `tracking-wordmark` (0.35em)
  for the logotype. Never set Playfair uppercase or heavily tracked.
- Spacing uses the Tailwind scale only. No arbitrary pixel values for margin,
  padding, or gap.
- Borders are hairlines: `border border-hairline`. No heavy rules, no shadows
  for separation.
- Light coastal palette: `surface` (soft white), `surface-raised` (soft light
  blue), `ink` (deep slate-teal, the text color), `ink-muted` (secondary text,
  AA on `surface` at ≥14px), `hairline` (soft blue-grey borders), `mist` (soft
  coastal blue — hero bottom scrim only), `sky-600` (brand accent — the logotype
  trident only). Introduce any other color only with a documented reason.
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
- Measure text contrast at 375px width and over the actual background image, not
  just on desktop over a dark fill.
- Pre-merge checklist for every new component: `focus-visible` present · contrast
  measured at 375px · tap targets ≥ 44px · correct `lang` · reduced-motion path
  renders visible content in the SSR HTML.

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
- Durations: 150–250ms for state feedback (hover, toggle); ≤ 450ms per element
  for entrances. A short stagger across a small group may total up to ~600ms end
  to end — no longer.
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
- `initial` / any motion prop must never hide content that is server-rendered.
  `useReducedMotion()` is `null` on the server, so a JS-gated `opacity:0` ships
  in the HTML for everyone. A simple mount entrance belongs in CSS —
  `@keyframes` under `@media (prefers-reduced-motion: no-preference)` — not in JS.
- Reserve `motion` for what CSS cannot do well: scroll-triggered reveals
  (`whileInView`), drag, shared-layout transitions, interruptible gestures.
