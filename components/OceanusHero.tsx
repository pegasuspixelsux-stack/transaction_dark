"use client";

import { Menu } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";

const NAV_LINKS = ["Propiedades", "Zonas", "Nosotros", "Contacto"] as const;

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 26 },
  },
};

export function OceanusHero() {
  const reduce = useReducedMotion();
  const parentMotion = reduce
    ? {}
    : { variants: container, initial: "hidden" as const, animate: "show" as const };
  const childVariants = reduce ? undefined : item;

  return (
    <section className="relative flex min-h-screen w-full flex-col overflow-hidden bg-surface">
      {/*
        SWAP POINT — cinematic imagery.
        Replace the gradient <div> below with:
          <Image src={HERO_SRC} alt="" fill priority sizes="100vw" className="object-cover" />
        and add the image host to next.config.ts -> images.remotePatterns.
      */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,#1c1c1c_0%,#0a0a0a_55%,#050505_100%)]"
      />
      <div aria-hidden className="absolute inset-0 bg-black/40" />

      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-hairline bg-surface/40 px-6 py-5 backdrop-blur-md">
        <span className="text-sm font-light uppercase tracking-wordmark">
          Oceanus
        </span>
        <ul className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <a
                href="#"
                className="text-xs uppercase tracking-luxury text-ink-muted transition-colors hover:text-ink"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          aria-label="Abrir menú"
          className="text-ink-muted transition-colors hover:text-ink md:hidden"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </nav>

      <motion.div
        {...parentMotion}
        className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-32 text-center sm:items-start sm:pb-40 sm:pl-16 sm:text-left"
      >
        <motion.p
          variants={childVariants}
          className="text-xs uppercase tracking-luxury text-ink-muted"
        >
          Punta del Este · Uruguay
        </motion.p>
        <motion.h1
          variants={childVariants}
          className="max-w-3xl text-4xl font-light uppercase leading-[1.05] tracking-luxury sm:text-6xl lg:text-7xl"
        >
          Propiedades
          <br />
          frente al mar
        </motion.h1>
        <motion.p
          variants={childVariants}
          className="max-w-md text-base font-light text-ink-muted sm:text-lg"
        >
          Una colección curada de residencias en José Ignacio, Manantiales, La
          Barra, Península y Mansa.
        </motion.p>
        <motion.a
          variants={childVariants}
          href="#"
          className="mt-2 border border-ink/30 px-8 py-3 text-xs uppercase tracking-luxury transition-colors hover:bg-ink hover:text-surface"
        >
          Ver propiedades
        </motion.a>
      </motion.div>
    </section>
  );
}
