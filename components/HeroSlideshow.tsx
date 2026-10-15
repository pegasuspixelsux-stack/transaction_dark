"use client";

import Image from "next/image";
import type { Property } from "@/types/property";

/** Controlled: the parent owns the active index so the image, text and dots always agree. */
export function HeroSlideshow({ properties, active }: { properties: Property[]; active: number }) {
  const current = properties[active] ?? properties[0];

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

    </>
  );
}
