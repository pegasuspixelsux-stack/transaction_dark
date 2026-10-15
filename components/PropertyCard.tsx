import Link from "next/link";
import Image from "next/image";
import { Bath, Bed, Calendar, ImageOff, Ruler } from "lucide-react";
import type { Property } from "@/types/property";
import { formatPrice } from "@/lib/properties";
import { ConciergeButton } from "@/components/ConciergeButton";

const textShadow = "[text-shadow:0_1px_6px_rgba(0,0,0,0.5)]";

export function PropertyCard({ property }: { property: Property }) {
  const { id, title, zone, location, price, bedrooms, bathrooms, area, yearBuilt, imageUrl } = property;

  const metrics = [
    bedrooms > 0 ? { icon: Bed, text: `${bedrooms} ${bedrooms === 1 ? "dorm" : "dorms"}` } : null,
    bathrooms && bathrooms > 0 ? { icon: Bath, text: `${bathrooms} ${bathrooms === 1 ? "baño" : "baños"}` } : null,
    area && area > 0 ? { icon: Ruler, text: `${area.toLocaleString("es-UY")} m²` } : null,
    yearBuilt ? { icon: Calendar, text: String(yearBuilt) } : null,
  ].filter((m): m is NonNullable<typeof m> => m !== null);

  const tag = location && location !== zone ? `${location} | ${zone}` : zone;

  return (
    <article className="group relative h-[520px] overflow-hidden rounded-2xl border border-hairline bg-neutral-950 text-white transition-opacity hover:opacity-95">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-start justify-center gap-2 pt-16 text-xs uppercase tracking-luxury text-white/70">
          <ImageOff className="size-4" aria-hidden />
          Foto próximamente
        </div>
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent"
      />

      <p className={`absolute right-5 top-5 text-xs uppercase tracking-luxury text-white/80 ${textShadow}`}>
        Ref. {id}
      </p>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6">
        <p className={`text-xs uppercase tracking-luxury text-white/80 ${textShadow}`}>{tag}</p>

        <h3 className={`font-display text-2xl font-normal tracking-tight ${textShadow}`}>
          <Link
            href={`/propiedades/${id}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            {title}
          </Link>
        </h3>

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

        <div className="flex items-center justify-between gap-3 border-t border-white/25 pt-4">
          <p className={`text-lg ${textShadow}`}>{formatPrice(price)}</p>
          <ConciergeButton className="relative z-10 inline-flex min-h-11 items-center gap-2 border border-white/40 px-4 text-xs uppercase tracking-luxury transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-white/25" />
        </div>
      </div>
    </article>
  );
}
