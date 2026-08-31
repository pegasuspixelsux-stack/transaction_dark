import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { countByZone } from "@/lib/properties";
import type { PropertyZone } from "@/types/property";

const zimg = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const ZONES: {
  name: PropertyZone;
  blurb: string;
  image: string;
  className: string;
}[] = [
  {
    name: "José Ignacio",
    blurb: "El pueblo de pescadores devenido en el enclave más codiciado de la costa.",
    image: zimg("1507525428034-b723cf961d3e"),
    className: "sm:col-span-4 sm:row-span-2",
  },
  {
    name: "Manantiales",
    blurb: "Playas amplias, médanos y las mejores mesas del este.",
    image: zimg("1519046904884-53103b34b206"),
    className: "sm:col-span-2 sm:row-span-2",
  },
  {
    name: "La Barra",
    blurb: "Galerías y arquitectura de autor sobre el arroyo Maldonado.",
    image: zimg("1471922694854-ff1b63b20054"),
    className: "sm:col-span-2",
  },
  {
    name: "Península",
    blurb: "El corazón histórico de Punta del Este, entre dos mares.",
    image: zimg("1505142468610-359e7d316be0"),
    className: "sm:col-span-2",
  },
  {
    name: "Mansa",
    blurb: "Atardeceres sobre aguas calmas y las torres frente al mar.",
    image: zimg("1533105079780-92b9be482077"),
    className: "sm:col-span-2",
  },
];

export function Zones() {
  return (
    <section id="zonas" className="scroll-mt-24 border-y border-hairline bg-surface-raised">
      <div className="container-page py-24 sm:py-32">
        <p className="text-xs uppercase tracking-luxury text-ink-muted">Dónde</p>
        <h2 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-4xl">
          Las zonas más codiciadas
        </h2>
        <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
          Cinco enclaves donde se concentra la demanda. También asesoramos en el
          resto del litoral esteño y en la costa de Rocha.
        </p>
        <div className="mt-14 grid grid-cols-1 gap-4 sm:auto-rows-[240px] sm:grid-cols-6">
          {ZONES.map((zone) => {
            const count = countByZone(zone.name);
            return (
              <Link
                key={zone.name}
                href={`/propiedades?zona=${encodeURIComponent(zone.name)}`}
                className={cn(
                  "group relative min-h-[240px] overflow-hidden border border-hairline focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink sm:min-h-0",
                  zone.className,
                )}
              >
                <Image
                  src={zone.image}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <p className="text-xs uppercase tracking-luxury text-white/75">
                    {count} {count === 1 ? "propiedad" : "propiedades"}
                  </p>
                  <h3 className="mt-1.5 font-display text-xl font-medium tracking-tight sm:text-2xl">
                    {zone.name}
                  </h3>
                  <p className="mt-1 max-w-xs text-sm text-white/85">{zone.blurb}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
