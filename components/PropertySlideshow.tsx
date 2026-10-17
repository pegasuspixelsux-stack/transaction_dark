"use client";

import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { WatermarkIcon } from "@/components/WatermarkIcon";

interface PropertySlideshowProps {
  images: string[];
  title: string;
  /** Overlay content (tag, title, specs) rendered bottom-left inside the boxed container. */
  children?: ReactNode;
}

export function PropertySlideshow({ images, title, children }: PropertySlideshowProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (lightboxOpen) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length, lightboxOpen]);

  // Lightbox: Escape/arrow keys, and no page scroll behind it.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowLeft") setActiveSlide((prev) => (prev - 1 + images.length) % images.length);
      else if (e.key === "ArrowRight") setActiveSlide((prev) => (prev + 1) % images.length);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen, images.length]);

  const goToPrevious = () => {
    setActiveSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setActiveSlide((prev) => (prev + 1) % images.length);
  };

  return (
    <>
    <section className="relative aspect-square w-full md:aspect-video overflow-hidden bg-neutral-950">
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

      {/* Mobile: tap the image to open it full size */}
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="absolute inset-0 z-[5] md:hidden"
        aria-label="Ver imagen completa"
      />

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
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 md:pointer-events-auto md:bottom-8">
        <div className="mx-auto flex w-full max-w-[1200px] items-end justify-between gap-6 px-6 md:px-8">
          <div className="min-w-0">{children}</div>
          {images.length > 1 ? (
            <div className="pointer-events-auto flex shrink-0 flex-col items-end gap-2">
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

    {lightboxOpen ? (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-0 z-[100] bg-black md:hidden"
        onClick={() => setLightboxOpen(false)}
      >
        <Image
          src={images[activeSlide]}
          alt={`${title} - ${activeSlide + 1}`}
          fill
          sizes="100vw"
          className="object-contain"
        />
        <button
          type="button"
          onClick={() => setLightboxOpen(false)}
          className="absolute right-4 top-4 rounded-full bg-white/20 p-3 text-white"
          aria-label="Cerrar"
        >
          <X size={22} />
        </button>
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white"
              aria-label="Anterior"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white"
              aria-label="Siguiente"
            >
              <ChevronRight size={22} />
            </button>
            <p className="absolute inset-x-0 bottom-5 text-center text-sm text-white/75">
              {activeSlide + 1} / {images.length}
            </p>
          </>
        ) : null}
      </div>
    ) : null}
    </>
  );
}
