# Oceanus Landing Sections (Cycle 2) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]` checkboxes.

**Goal:** Build the home page below the hero — featured properties, zones, brand statement, contact, footer — as static Server Components with typed mock data.

**Architecture:** All new sections are Server Components (no `"use client"`, no `motion` this cycle). Mock property data lives in `lib/properties.ts`, typed with `@/types/property`. Sections are composed incrementally into `app/page.tsx` (one per task, so each task is visually verifiable). The trident icon is extracted to `components/Trident.tsx` (used by `SiteHeader` and the new `SiteFooter`).

**Tech Stack:** Next.js 16.3.3 App Router, React 19, TypeScript, Tailwind CSS v4.

**Spec:** none — scope was set directly with the user (all 5 sections, mock data, Firebase deferred). This plan is the spec.

## Global Constraints

- Follow `docs/design-guidelines.md` — it is the current source of truth.
- **Server Components only.** No `"use client"`, no `motion`, no browser APIs in any file this cycle.
- **Mock data only.** No Firebase, no `next.config.ts` change, no network calls.
- Typography: `font-display` (Playfair Display) for headings — title case, `tracking-tight`, `font-normal`, never uppercase. Montserrat (default) for everything else. Uppercase + `tracking-luxury` only on Montserrat labels.
- Palette: `surface`, `surface-raised`, `ink`, `ink-muted`, `hairline`, `abyss` (hero scrim only), `sky-400` (trident only). No other colors.
- Every interactive element carries `hover` + this focus ring: `focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink`.
- Section rhythm: outer `<section>`; inner container `mx-auto max-w-7xl px-6 py-24 sm:py-32` (brand statement may use `max-w-4xl` and more vertical space).
- Interactive tap targets ≥ 44px (`min-h-11` on buttons/CTAs).
- Copy is Rioplatense Spanish.
- Compose class names with `cn()` from `@/lib/utils` only where there is a conditional; plain string classNames are fine when static.
- No test runner. Per-task gates: `npm run build`, `npm run lint`, `npx tsc --noEmit` all clean.
- One commit per task. Trailer:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FeaGCm6YBYNQKG3L2hud55
  ```
- Branch: `feat/oceanus-hero-design-system` (continues from the hero cycle).

---

### Task 1: Trident extraction, hero carry-over fixes, property data

**Files:**
- Create: `components/Trident.tsx`
- Modify: `components/SiteHeader.tsx` (use `<Trident />`)
- Modify: `components/OceanusHero.tsx` (2 one-attribute carry-overs from the Task 7 re-review)
- Modify: `app/globals.css` (trim one animation delay)
- Create: `lib/properties.ts`

**Interfaces:**
- Produces: `<Trident className?>` from `@/components/Trident`; `properties: Property[]`, `formatPrice(usd: number): string`, `propertyTypeLabel(type: PropertyType): string` from `@/lib/properties`.

- [ ] **Step 1: Create `components/Trident.tsx`**

```tsx
export function Trident({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M12 21v-9" />
      <path d="M12 3v9" />
      <path d="M7 5v3a5 5 0 0 0 10 0V5" />
      <path d="M9.5 21h5" />
    </svg>
  );
}
```

- [ ] **Step 2: `components/SiteHeader.tsx` — replace the inline `<svg>…</svg>` (the trident) with:**

```tsx
<Trident className="size-4 text-sky-400" />
```
Add `import { Trident } from "@/components/Trident";` with the other imports. Nothing else changes.

- [ ] **Step 3: `components/OceanusHero.tsx` — fix the lazy-load regression**

The `<Image>` currently has `fetchPriority="high"` but defaults to `loading="lazy"`, so the LCP hero photo only loads on scroll. Add `loading="eager"`:
```tsx
      <Image
        src="/images/hero/serena.png"
        alt=""
        fill
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        className="object-cover"
      />
```

- [ ] **Step 4: `components/OceanusHero.tsx` + `app/globals.css` — trim entrance timing**

In `OceanusHero.tsx` the CTA's `[animation-delay:180ms]` → `[animation-delay:150ms]` (brings the entrance under the ~600ms guideline: last element 150ms + 450ms = 600ms). No other delay changes. `globals.css` needs no change — the delay lives in the utility class.

- [ ] **Step 5: Create `lib/properties.ts`**

```ts
import type { Property, PropertyType } from "@/types/property";

export const properties: Property[] = [
  { id: "ji-01", title: "Casa de las Dunas", zone: "José Ignacio", price: 4200000, bedrooms: 5, type: "house", imageUrl: "/images/hero/serena.png" },
  { id: "mn-01", title: "Refugio Manantiales", zone: "Manantiales", price: 2650000, bedrooms: 4, type: "house", imageUrl: "/images/hero/serena.png" },
  { id: "lb-01", title: "Penthouse del Arroyo", zone: "La Barra", price: 1890000, bedrooms: 3, type: "penthouse", imageUrl: "/images/hero/serena.png" },
  { id: "pe-01", title: "Terreno Faro", zone: "Península", price: 950000, bedrooms: 0, type: "land", imageUrl: "/images/hero/serena.png" },
  { id: "ma-01", title: "Apartamento Brava", zone: "Mansa", price: 720000, bedrooms: 2, type: "apartment", imageUrl: "/images/hero/serena.png" },
  { id: "ji-02", title: "Estancia del Este", zone: "José Ignacio", price: 6800000, bedrooms: 6, type: "house", imageUrl: "/images/hero/serena.png" },
];

const TYPE_LABELS: Record<PropertyType, string> = {
  house: "Casa",
  apartment: "Apartamento",
  penthouse: "Penthouse",
  land: "Terreno",
};

export function propertyTypeLabel(type: PropertyType): string {
  return TYPE_LABELS[type];
}

const priceFormatter = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatPrice(usd: number): string {
  return priceFormatter.format(usd);
}
```

- [ ] **Step 6: Verify** — `npm run build && npm run lint && npx tsc --noEmit` all clean. Start `npm run dev`, confirm the hero photo now appears without scrolling, and the header trident still renders. Stop dev.

- [ ] **Step 7: Commit**
```
git add components/Trident.tsx components/SiteHeader.tsx components/OceanusHero.tsx app/globals.css lib/properties.ts
git commit -m "feat: extract Trident, fix hero lazy-load, add property fixtures"
```

---

### Task 2: `PropertyCard` + `FeaturedProperties` section

**Files:**
- Create: `components/PropertyCard.tsx`
- Create: `components/FeaturedProperties.tsx`
- Modify: `app/page.tsx` (render `<FeaturedProperties />`)

**Interfaces:**
- Consumes: `properties`, `formatPrice`, `propertyTypeLabel` (Task 1); `Property` type.
- Produces: `<FeaturedProperties />`, `<PropertyCard property={Property} />`.

- [ ] **Step 1: Create `components/PropertyCard.tsx`**

```tsx
import type { Property } from "@/types/property";
import { formatPrice, propertyTypeLabel } from "@/lib/properties";

export function PropertyCard({ property }: { property: Property }) {
  const { title, zone, price, bedrooms, type } = property;
  return (
    <article className="flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-surface-raised to-surface">
        <span className="absolute bottom-4 left-4 text-xs uppercase tracking-luxury text-ink-muted">
          {zone}
        </span>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-hairline pt-4">
        <h3 className="font-display text-xl font-normal tracking-tight">{title}</h3>
        <p className="shrink-0 text-sm text-ink-muted">{formatPrice(price)}</p>
      </div>
      <p className="mt-1 text-xs uppercase tracking-luxury text-ink-muted">
        {bedrooms > 0 ? `${bedrooms} dorm · ${propertyTypeLabel(type)}` : propertyTypeLabel(type)}
      </p>
    </article>
  );
}
```

- [ ] **Step 2: Create `components/FeaturedProperties.tsx`**

```tsx
import { properties } from "@/lib/properties";
import { PropertyCard } from "@/components/PropertyCard";

export function FeaturedProperties() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <header className="mb-14 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-luxury text-ink-muted">Selección</p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-4xl">
            Propiedades destacadas
          </h2>
        </div>
        <a
          href="#"
          className="hidden shrink-0 text-xs uppercase tracking-luxury text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink sm:block"
        >
          Ver todas
        </a>
      </header>
      <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: `app/page.tsx`**
```tsx
import { OceanusHero } from "@/components/OceanusHero";
import { FeaturedProperties } from "@/components/FeaturedProperties";

export default function Home() {
  return (
    <>
      <OceanusHero />
      <FeaturedProperties />
    </>
  );
}
```

- [ ] **Step 4: Verify** — `npm run build && npm run lint && npx tsc --noEmit` clean. `npm run dev`: the section renders below the hero, 3 columns at `lg`, prices formatted `US$ 4.200.000`, "0 dorm" suppressed for the land listing.

- [ ] **Step 5: Commit**
```
git add components/PropertyCard.tsx components/FeaturedProperties.tsx app/page.tsx
git commit -m "feat: add FeaturedProperties section with PropertyCard"
```

---

### Task 3: `Zones` section

**Files:**
- Create: `components/Zones.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/Zones.tsx`**

```tsx
const ZONES: { name: string; blurb: string }[] = [
  { name: "José Ignacio", blurb: "El pueblo de pescadores devenido en el enclave más codiciado de la costa." },
  { name: "Manantiales", blurb: "Playas amplias, médanos y las mejores mesas del este." },
  { name: "La Barra", blurb: "Vida nocturna, galerías y arquitectura de autor sobre el arroyo Maldonado." },
  { name: "Península", blurb: "El corazón histórico de Punta del Este, entre dos mares." },
  { name: "Mansa", blurb: "Atardeceres sobre aguas calmas y las torres frente al mar." },
];

export function Zones() {
  return (
    <section className="border-y border-hairline bg-surface-raised">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <p className="text-xs uppercase tracking-luxury text-ink-muted">Dónde</p>
        <h2 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-4xl">
          Cinco zonas
        </h2>
        <ul className="mt-14 border-t border-hairline">
          {ZONES.map((zone) => (
            <li key={zone.name} className="border-b border-hairline">
              <a
                href="#"
                className="group flex items-baseline gap-6 py-6 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                <span className="font-display text-xl font-normal tracking-tight sm:text-2xl">
                  {zone.name}
                </span>
                <span className="hidden flex-1 text-sm text-ink-muted sm:block">
                  {zone.blurb}
                </span>
                <span
                  aria-hidden
                  className="ml-auto text-ink-muted transition-transform group-hover:translate-x-1 sm:ml-0"
                >
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: `app/page.tsx`** — add `import { Zones } from "@/components/Zones";` and render `<Zones />` after `<FeaturedProperties />`.

- [ ] **Step 3: Verify** — build/lint/tsc clean; `npm run dev`: the zones list renders on a raised surface with hairline dividers; blurbs hidden below `sm`; arrow nudges right on hover.

- [ ] **Step 4: Commit**
```
git add components/Zones.tsx app/page.tsx
git commit -m "feat: add Zones section"
```

---

### Task 4: `BrandStatement` section

**Files:**
- Create: `components/BrandStatement.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/BrandStatement.tsx`**

```tsx
export function BrandStatement() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-28 text-center sm:py-40">
      <p className="font-display text-2xl font-normal leading-snug tracking-tight sm:text-3xl lg:text-4xl">
        Oceanus representa un número reducido de residencias frente al mar en Punta
        del Este. Cada una elegida por su ubicación, su arquitectura y su luz.
      </p>
    </section>
  );
}
```

- [ ] **Step 2: `app/page.tsx`** — add the import, render `<BrandStatement />` after `<Zones />`.

- [ ] **Step 3: Verify** — build/lint/tsc clean; renders as a centered Playfair pull-quote with generous vertical space.

- [ ] **Step 4: Commit**
```
git add components/BrandStatement.tsx app/page.tsx
git commit -m "feat: add BrandStatement section"
```

---

### Task 5: `Contact` section

**Files:**
- Create: `components/Contact.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/Contact.tsx`**

```tsx
export function Contact() {
  return (
    <section className="border-t border-hairline bg-surface-raised">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <h2 className="max-w-2xl font-display text-3xl font-normal tracking-tight sm:text-4xl">
          Conversemos sobre su próxima propiedad
        </h2>
        <p className="mt-4 max-w-md text-base font-light leading-relaxed text-ink-muted">
          Agende una visita privada o reciba nuestra cartera completa.
        </p>
        <a
          href="mailto:hola@oceanus.uy"
          className="mt-8 inline-flex min-h-11 items-center border border-ink/30 px-8 text-xs uppercase tracking-luxury transition-colors hover:bg-ink hover:text-surface focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          Escribinos
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: `app/page.tsx`** — add the import, render `<Contact />` after `<BrandStatement />`.

- [ ] **Step 3: Verify** — build/lint/tsc clean; the `mailto:` CTA is ≥ 44px tall and inverts on hover.

- [ ] **Step 4: Commit**
```
git add components/Contact.tsx app/page.tsx
git commit -m "feat: add Contact section"
```

---

### Task 6: `SiteFooter`

**Files:**
- Create: `components/SiteFooter.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `<Trident />` (Task 1).

- [ ] **Step 1: Create `components/SiteFooter.tsx`**

```tsx
import { Trident } from "@/components/Trident";

const FOOTER_COLUMNS: { heading: string; items: string[] }[] = [
  { heading: "Propiedades", items: ["Casas", "Apartamentos", "Penthouses", "Terrenos"] },
  { heading: "Zonas", items: ["José Ignacio", "Manantiales", "La Barra", "Península", "Mansa"] },
  { heading: "Oceanus", items: ["Nosotros", "Contacto", "Prensa"] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col gap-12 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Trident className="size-4 text-sky-400" />
            <span className="text-sm font-light uppercase tracking-wordmark text-ink">
              Oceanus
            </span>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.heading}>
                <p className="text-xs uppercase tracking-luxury text-ink-muted">
                  {column.heading}
                </p>
                <ul className="mt-4 space-y-2">
                  {column.items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-16 text-xs text-ink-muted">
          © 2026 Oceanus. Punta del Este, Uruguay.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: `app/page.tsx`** — add the import, render `<SiteFooter />` last.

- [ ] **Step 3: Verify** — build/lint/tsc clean; `npm run dev`: full page scrolls hero → featured → zones → statement → contact → footer, the `fixed` header stays put and readable over every section, footer trident matches the header.

- [ ] **Step 4: Commit**
```
git add components/SiteFooter.tsx app/page.tsx
git commit -m "feat: add SiteFooter, complete the landing page"
```

---

## Self-Review

**Coverage:** FeaturedProperties (T2), Zones (T3), BrandStatement (T4), Contact (T5), SiteFooter (T6) — all 5 sections. PropertyCard unit (T2), `lib/properties.ts` fixtures + helpers (T1), Trident extraction (T1). Carry-over hero fixes from the Task 7 re-review (lazy-load, entrance timing) folded into T1. `app/page.tsx` composed incrementally.

**Placeholders:** none — every task has full component code.

**Type consistency:** `properties: Property[]`, `formatPrice(number): string`, `propertyTypeLabel(PropertyType): string` defined in T1, consumed by name in T2. `<Trident className?>` defined T1, consumed T1 (SiteHeader) and T6 (SiteFooter). `PropertyCard` prop is `{ property: Property }` in both its definition and `FeaturedProperties`' usage.

**Out of scope (later cycles):** scroll-reveal animation (`motion` `whileInView`), a working mobile drawer, real property images, property detail routes, Firebase.
