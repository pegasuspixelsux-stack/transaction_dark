import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bath, Bed, ImageOff, Ruler } from "lucide-react";
import type { Property } from "@/types/property";
import { formatPrice } from "@/lib/properties";

const textShadow = "[text-shadow:0_1px_6px_rgba(0,0,0,0.5)]";

export function PropertyCard({ property }: { property: Property }) {
  const { id, title, zone, location, price, bedrooms, bathrooms, area, imageUrl } = property;

  const metrics = [
    bedrooms > 0 ? { icon: Bed, text: `${bedrooms} ${bedrooms === 1 ? "dorm" : "dorms"}` } : null,
    bathrooms && bathrooms > 0 ? { icon: Bath, text: `${bathrooms} ${bathrooms === 1 ? "baño" : "baños"}` } : null,
    area && area > 0 ? { icon: Ruler, text: `${area.toLocaleString("es-UY")} m²` } : null,
  ].filter((m): m is NonNullable<typeof m> => m !== null);

  const tag = location && location !== zone ? `${location} | ${zone}` : zone;

  return (
    <Link
      href={`/propiedades/${id}`}
      aria-label={`${title}, ${formatPrice(price)}. Ver ficha completa`}
      className="group relative block h-[520px] overflow-hidden border border-hairline bg-neutral-950 text-white transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:opacity-90"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-xs uppercase tracking-luxury text-white/70">
          <ImageOff className="size-4" aria-hidden />
          Foto próximamente
        </div>
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent"
      />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-6 text-xs uppercase tracking-luxury text-white/80">
        <p className={textShadow}>{tag}</p>
        <p className={`shrink-0 ${textShadow}`}>Ref. {id}</p>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6">
        <h3 className={`font-display text-2xl font-normal tracking-tight ${textShadow}`}>{title}</h3>

        {metrics.length > 0 ? (
          <ul className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/90 ${textShadow}`}>
            {metrics.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <Icon className="size-4" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex items-end justify-between gap-3 border-t border-white/25 pt-4">
          <p className={`text-xl ${textShadow}`}>{formatPrice(price)}</p>
          <span
            aria-hidden
            className={`flex items-center gap-2 text-xs uppercase tracking-luxury text-white/80 transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transform-none ${textShadow}`}
          >
            Ver ficha completa
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
