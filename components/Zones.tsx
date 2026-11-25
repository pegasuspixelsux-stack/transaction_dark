import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { countByZone } from "@/lib/properties";
import { getPublicProperties } from "@/lib/server/public-properties";
import { getPublicZones } from "@/lib/server/public-config";
import { MAX_HOME_ZONES } from "@/lib/zones";

/** Bento layout for up to five tiles: one large, one tall, three small. */
const TILE_CLASSES = [
  "sm:col-span-4 sm:row-span-2",
  "sm:col-span-2 sm:row-span-2",
  "sm:col-span-2",
  "sm:col-span-2",
  "sm:col-span-2",
];

export async function Zones() {
  const [properties, zones] = await Promise.all([getPublicProperties(), getPublicZones()]);
  const homeZones = zones.filter((z) => z.showOnHome).slice(0, MAX_HOME_ZONES);
  if (homeZones.length === 0) return null;
  return (
    <section id="zonas" className="scroll-mt-24 border-y border-hairline bg-surface">
      <div className="container-page py-24 sm:py-32">
        <p className="text-xs uppercase tracking-luxury text-ink-muted">Nuestra costa</p>
        <h2 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-4xl">
          Dónde trabajamos
        </h2>
        <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
          Los enclaves donde se concentra la demanda. También asesoramos en el
          resto del litoral esteño y en la costa de Rocha.
        </p>
        <div className="mt-14 grid grid-cols-1 gap-4 sm:auto-rows-[240px] sm:grid-cols-6">
          {homeZones.map((zone, i) => {
            const count = countByZone(properties, zone.name);
            return (
              <Link
                key={zone.name}
                href={`/propiedades?zona=${encodeURIComponent(zone.name)}`}
                className={cn(
                  "group relative min-h-[240px] overflow-hidden border border-hairline focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink sm:min-h-0",
                  TILE_CLASSES[i],
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
