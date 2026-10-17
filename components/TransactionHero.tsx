"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Bath, Bed, Ruler } from "lucide-react";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { Trident } from "@/components/Trident";
import { WatermarkIcon } from "@/components/WatermarkIcon";
import { formatPrice, propertyTypeLabel } from "@/lib/properties";
import type { Property } from "@/types/property";

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
  const metrics = current
    ? [
        current.bedrooms > 0 ? { icon: Bed, text: `${current.bedrooms} ${current.bedrooms === 1 ? "dorm" : "dorms"}` } : null,
        current.bathrooms && current.bathrooms > 0
          ? { icon: Bath, text: `${current.bathrooms} ${current.bathrooms === 1 ? "baño" : "baños"}` }
          : null,
        current.area && current.area > 0 ? { icon: Ruler, text: `${current.area.toLocaleString("es-UY")} m²` } : null,
      ].filter((m): m is NonNullable<typeof m> => m !== null)
    : [];
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
            <div key={current.id}>
              <p className="text-sm uppercase tracking-luxury text-white/75">{tag}</p>
              <h3 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-4xl">
                <Link
                  href={`/propiedades/${current.id}`}
                  className="pointer-events-auto focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  {current.title}
                </Link>
              </h3>
              {metrics.length > 0 ? (
                <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/90">
                  {metrics.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-2">
                      <Icon className="size-4" aria-hidden />
                      {text}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-2 text-sm uppercase tracking-luxury text-white/75">
                {propertyTypeLabel(current.type)} · {formatPrice(current.price)}
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
