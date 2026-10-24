"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { Trident } from "@/components/Trident";
import { WatermarkIcon } from "@/components/WatermarkIcon";
import { formatPrice } from "@/lib/properties";
import type { Property } from "@/types/property";

const textShadow = "[text-shadow:0_1px_6px_rgba(0,0,0,0.5)]";

export function TransactionHero({ properties: HERO_PROPERTIES }: { properties: Property[] }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const count = HERO_PROPERTIES.length;

  // Auto-advance; restarts whenever the visitor picks a slide so it never jumps right after a click.
  useEffect(() => {
    if (count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActiveSlide((i) => (i + 1) % count), 7000);
    return () => window.clearInterval(id);
  }, [count, activeSlide]);

  const current = HERO_PROPERTIES[activeSlide] ?? HERO_PROPERTIES[0];
  const tag = current
    ? current.location && current.location !== current.zone
      ? `${current.location} | ${current.zone}`
      : current.zone
    : "";

  return (
    <section className="relative flex h-[75vh] sm:min-h-dvh w-full flex-col overflow-hidden bg-surface dark:bg-zinc-950">
      {HERO_PROPERTIES.length > 0 ? (
        <HeroSlideshow properties={HERO_PROPERTIES} active={activeSlide} />
      ) : null}

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

      {/* Whole slide links to the active property's page. */}
      {current ? (
        <Link
          href={`/propiedades/${current.id}`}
          aria-label={`Ver ${current.title}`}
          className="absolute inset-0 z-[5] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
        />
      ) : null}

      {/* Centered watermark. */}
      <div className="pointer-events-none absolute inset-0 z-10 flex select-none flex-col items-center justify-center">
        <WatermarkIcon />
      </div>

      {/* Property info lower left corner. */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 text-white">
        <div className="container-page pb-8 pt-4">
          {current ? (
            <div key={current.id} className="md:max-w-[70%]">
              <p className={`text-xs uppercase tracking-luxury text-white/80 ${textShadow}`}>
                Ref. {current.id} · {tag}
              </p>
              <h3 className={`mt-2 font-display text-3xl font-normal tracking-tight sm:text-4xl ${textShadow}`}>
                <Link
                  href={`/propiedades/${current.id}`}
                  className="pointer-events-auto focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  {current.title}
                </Link>
              </h3>
              <p className={`mt-4 border-t border-white/25 pt-4 text-xl ${textShadow}`}>
                {formatPrice(current.price)}
              </p>
            </div>
          ) : null}
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
