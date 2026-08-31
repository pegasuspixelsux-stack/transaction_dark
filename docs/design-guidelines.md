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
