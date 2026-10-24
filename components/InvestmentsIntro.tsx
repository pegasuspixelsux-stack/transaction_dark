import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InvestmentsHighlights } from "@/components/InvestmentsHighlights";

export function InvestmentsIntro() {
  return (
    <section
      id="inversiones"
      className="scroll-mt-24 border-y border-hairline bg-surface-raised dark:border-white/10 dark:bg-neutral-900"
    >
      <div className="container-page grid gap-12 py-24 sm:py-32 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs uppercase tracking-luxury text-ink-muted">Inversiones</p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-4xl">
            Invertir en la costa de Uruguay
          </h2>
          <p className="mt-6 max-w-prose text-base leading-relaxed text-ink-muted dark:text-white/75">
            Acompañamos a inversores individuales e institucionales en la compra y venta de
            activos inmobiliarios, con análisis de rendimiento, gestión de la propiedad y
            asesoramiento legal y fiscal en cada etapa.
          </p>
        </div>
        <div>
          <InvestmentsHighlights />
          <Link
            href="/inversiones"
            className="group mt-8 inline-flex min-h-11 items-center gap-2 text-xs uppercase tracking-luxury text-ink transition-colors hover:text-ink-muted focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink dark:text-white dark:focus-visible:outline-white"
          >
            Conocer más
            <ArrowRight
              className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transform-none"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
