import Image from "next/image";
import { Trident } from "@/components/Trident";

export function OceanusHero() {
  return (
    <section className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-surface">
      <Image
        src="/images/hero/serena.png"
        alt=""
        fill
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        className="object-cover"
      />
      {/* Near-transparent overlay — a soft dark fade at the bottom so the white
          lower-left text reads; the photo otherwise shows at full strength. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent"
      />

      {/* Large transparent wordmark watermark, matching the header lockup. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center gap-4 sm:gap-8"
      >
        <Trident className="size-16 text-white/15 sm:size-24 lg:size-32" />
        <span className="text-5xl font-normal uppercase tracking-wordmark text-white/15 sm:text-7xl lg:text-8xl">
          Oceanus
        </span>
      </div>

      <div className="container-page relative z-10 flex flex-1 flex-col items-start justify-end gap-5 pb-20 text-left text-white [text-shadow:0_1px_18px_rgba(0,0,0,0.35)] sm:pb-28">
        <p
          data-rise
          className="text-xs font-normal uppercase tracking-luxury text-white/85 [animation-delay:0ms]"
        >
          Punta del Este · Uruguay
        </p>
        <h1
          data-rise
          className="max-w-3xl font-display text-4xl font-medium leading-[1.08] tracking-tight [animation-delay:60ms] sm:text-5xl lg:text-6xl"
        >
          Propiedades
          <br />
          <span className="italic">frente al mar</span>
        </h1>
        <p
          data-rise
          className="max-w-md text-base font-normal leading-relaxed text-white/90 [animation-delay:120ms] sm:text-lg"
        >
          Una colección curada de residencias en José Ignacio, Manantiales, La
          Barra, Península y Mansa.
        </p>
        <a
          data-rise
          href="#"
          className="mt-2 inline-flex min-h-11 items-center border border-white/50 px-8 text-xs font-normal uppercase tracking-luxury transition-colors [animation-delay:150ms] [text-shadow:none] hover:bg-white hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Ver propiedades
        </a>
      </div>
    </section>
  );
}
