"use client";

import Link from "next/link";
import React, { useState } from "react";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { Trident } from "@/components/Trident";
import { properties } from "@/lib/properties";

const HERO_PROPERTIES = properties.slice(0, 5);

export function OceanusHero() {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <section className="relative flex h-[75vh] sm:min-h-dvh w-full flex-col overflow-hidden bg-surface dark:bg-zinc-950">
      <HeroSlideshow properties={HERO_PROPERTIES} onSlideChange={setActiveSlide} />

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

      {/* Centered watermark and button. */}
      <div className="pointer-events-none absolute inset-0 z-10 flex select-none flex-col items-center justify-center gap-8 sm:gap-12">
        <div aria-hidden className="flex items-center justify-center gap-2 sm:gap-8">
          <div className="flex size-10 items-center justify-center rounded-full border-[3px] border-white/50 text-2xl font-bold text-white/50 sm:size-24 sm:text-6xl lg:size-32 lg:text-7xl">
            T
          </div>
          <span className="text-2xl font-normal uppercase tracking-wordmark text-white/50 sm:text-7xl lg:text-8xl">
            Transaction
          </span>
        </div>
        <Link
          href="/propiedades"
          className="pointer-events-auto border border-white/50 px-8 py-3 text-xs uppercase tracking-luxury text-white transition-all hover:bg-white/20 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white backdrop-blur-sm"
        >
          Buscar propiedades
        </Link>
      </div>

      {/* Property info lower left corner. */}
      <div className="absolute bottom-0 left-0 right-0 z-10 text-white">
        <div className="container-page pb-8 pt-4">
          <p className="text-sm uppercase tracking-luxury text-white/75">
            {HERO_PROPERTIES[0]?.zone}
          </p>
          <h3 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-4xl">
            {HERO_PROPERTIES[0]?.title}
          </h3>
          <p className="mt-2 text-sm uppercase tracking-luxury text-white/75">
            {HERO_PROPERTIES[0]?.type} · US$ {HERO_PROPERTIES[0]?.price.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Dots navigation lower right corner. */}
      <div className="absolute bottom-0 right-0 z-10 flex gap-2 p-6">
        {HERO_PROPERTIES.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveSlide(index)}
            aria-label={`Slide ${index + 1}`}
            className={`h-2 w-2 rounded-full transition-all ${
              activeSlide === index
                ? "w-6 bg-white"
                : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
