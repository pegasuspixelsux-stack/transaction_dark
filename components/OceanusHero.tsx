import { HeroSlideshow } from "@/components/HeroSlideshow";
import { Trident } from "@/components/Trident";
import { properties } from "@/lib/properties";

const HERO_PROPERTIES = properties.slice(0, 4);

export function OceanusHero() {
  return (
    <section className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-surface">
      <HeroSlideshow properties={HERO_PROPERTIES} />

      {/* Scrims so the property detail reads over any slide:
          a soft bottom fade + a stronger radial pool anchored bottom-left. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_95%_at_0%_100%,rgba(0,0,0,0.62),rgba(0,0,0,0.18)_38%,transparent_70%)]"
      />

      {/* Centered wordmark watermark. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center gap-4 sm:gap-8"
      >
        <Trident className="size-16 text-white/30 sm:size-24 lg:size-32" />
        <span className="text-5xl font-normal uppercase tracking-wordmark text-white/30 sm:text-7xl lg:text-8xl">
          Oceanus
        </span>
      </div>
    </section>
  );
}
