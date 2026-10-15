"use client";

import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WatermarkIcon } from "@/components/WatermarkIcon";

interface PropertySlideshowProps {
  images: string[];
  title: string;
  /** Overlay content (tag, title, specs) rendered bottom-left inside the boxed container. */
  children?: ReactNode;
}

export function PropertySlideshow({ images, title, children }: PropertySlideshowProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrevious = () => {
    setActiveSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setActiveSlide((prev) => (prev + 1) % images.length);
  };

  return (
    <section className="relative aspect-video w-full overflow-hidden bg-neutral-950">
      {/* Images */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === activeSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image}
            alt={`${title} - Slide ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}

      {/* Gradient Overlays */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent"
      />

      {/* Watermark */}
      <div className="pointer-events-none absolute inset-0 z-10 flex select-none items-center justify-center">
        <WatermarkIcon />
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-6 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/40"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-6 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/40"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Bottom-left overlay, aligned with the 1200px page grid */}
      <div className="absolute inset-x-0 bottom-4 z-10 md:bottom-8">
        <div className="mx-auto flex w-full max-w-[1200px] items-end justify-between gap-6 px-6 md:px-8">
          <div className="min-w-0">{children}</div>
          {images.length > 1 ? (
            <div className="flex shrink-0 flex-col items-end gap-2">
              <div className="flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      activeSlide === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              <p className="text-sm text-white/75">
                {activeSlide + 1} / {images.length}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
