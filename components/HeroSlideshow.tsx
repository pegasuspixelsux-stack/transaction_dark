"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Property } from "@/types/property";
import { formatPrice, propertyTypeLabel } from "@/lib/properties";

export function HeroSlideshow({ properties }: { properties: Property[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % properties.length),
      7000,
    );
    return () => window.clearInterval(id);
  }, [properties.length]);

  const current = properties[active];

  return (
    <>
      {/* Preload every slide so advancing never flashes. */}
      {properties.map((p) => (
        <link key={p.id} rel="preload" as="image" href={p.imageUrl} />
      ))}

      <Image
        key={current.id}
        src={current.imageUrl}
        alt=""
        fill
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        className="object-cover motion-safe:animate-[heroSlide_1400ms_ease-out]"
      />

      <div className="container-page relative z-10 mt-auto flex flex-col items-start gap-2.5 pb-20 text-white [text-shadow:0_1px_18px_rgba(0,0,0,0.45)] sm:pb-28">
        <p
          key={`zone-${current.id}`}
          data-rise
          className="text-xs font-normal uppercase tracking-luxury text-white/85 [animation-delay:0ms]"
        >
          {current.zone}
        </p>
        <h1
          key={`title-${current.id}`}
          data-rise
          className="font-display text-3xl font-medium tracking-tight [animation-delay:60ms] sm:text-4xl lg:text-5xl"
        >
          {current.title}
        </h1>
        <p
          key={`meta-${current.id}`}
          data-rise
          className="text-sm uppercase tracking-luxury text-white/85 [animation-delay:120ms]"
        >
          {current.bedrooms > 0 ? `${current.bedrooms} dorm · ` : ""}
          {propertyTypeLabel(current.type)} · {formatPrice(current.price)}
        </p>
        <Link
          href="/propiedades"
          className="mt-4 inline-flex min-h-11 items-center border border-white/50 px-8 text-xs font-normal uppercase tracking-luxury text-white transition-colors [text-shadow:none] hover:bg-white hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Buscar propiedades
        </Link>
      </div>
    </>
  );
}
