import Image from "next/image";

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
      {/* Directional scrim for the lower-left headline. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-tr from-surface via-surface/50 to-surface/10"
      />
      {/* Ocean-blue wash rising from the bottom edge. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-abyss/85 via-abyss/25 to-transparent"
      />

      <div className="relative z-10 flex flex-1 flex-col items-start justify-end gap-5 px-6 pb-20 text-left sm:pb-28 sm:pl-16">
        <p
          data-rise
          className="text-xs uppercase tracking-luxury text-ink/75 [animation-delay:0ms]"
        >
          Punta del Este · Uruguay
        </p>
        <h1
          data-rise
          className="max-w-3xl font-display text-4xl font-normal leading-[1.08] tracking-tight [animation-delay:60ms] sm:text-5xl lg:text-6xl"
        >
          Propiedades
          <br />
          <span className="italic">frente al mar</span>
        </h1>
        <p
          data-rise
          className="max-w-md text-base font-light leading-relaxed text-ink/80 [animation-delay:120ms] sm:text-lg"
        >
          Una colección curada de residencias en José Ignacio, Manantiales, La
          Barra, Península y Mansa.
        </p>
        <a
          data-rise
          href="#"
          className="mt-2 inline-flex min-h-11 items-center border border-ink/30 px-8 text-xs uppercase tracking-luxury transition-colors [animation-delay:150ms] hover:bg-ink hover:text-surface focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          Ver propiedades
        </a>
      </div>
    </section>
  );
}
