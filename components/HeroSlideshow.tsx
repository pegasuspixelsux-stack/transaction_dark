"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Property } from "@/types/property";

export function HeroSlideshow({
  properties,
  onSlideChange,
}: {
  properties: Property[];
  onSlideChange?: (index: number) => void;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    onSlideChange?.(active);
  }, [active, onSlideChange]);

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

    </>
  );
}
