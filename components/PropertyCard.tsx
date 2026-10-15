import Link from "next/link";
import Image from "next/image";
import { Bath, Bed, Calendar, ImageOff, Ruler } from "lucide-react";
import type { Property } from "@/types/property";
import { formatPrice, propertyTypeLabel } from "@/lib/properties";

const MAX_FEATURES = 4;

export function PropertyCard({ property }: { property: Property }) {
  const { id, title, zone, location, price, bedrooms, bathrooms, area, yearBuilt, type, imageUrl, description, features } =
    property;

  const metrics = [
    bedrooms > 0 ? { icon: Bed, text: `${bedrooms} ${bedrooms === 1 ? "dorm" : "dorms"}` } : null,
    bathrooms && bathrooms > 0 ? { icon: Bath, text: `${bathrooms} ${bathrooms === 1 ? "baño" : "baños"}` } : null,
    area && area > 0 ? { icon: Ruler, text: `${area.toLocaleString("es-UY")} m²` } : null,
    yearBuilt ? { icon: Calendar, text: String(yearBuilt) } : null,
  ].filter((m): m is NonNullable<typeof m> => m !== null);

  const place = location && location !== zone ? location : zone;

  return (
    <Link
      href={`/propiedades/${id}`}
      className="group block border border-hairline transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink active:opacity-80"
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-mist/20">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center gap-2 text-xs uppercase tracking-luxury text-ink-muted">
              <ImageOff className="size-4" aria-hidden />
              Foto próximamente
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-5 p-5">
          <div>
            <div className="flex items-baseline justify-between gap-2 text-xs uppercase tracking-luxury text-ink-muted">
              <p>
                {propertyTypeLabel(type)} · {place}
              </p>
              <p className="shrink-0">Ref. {id}</p>
            </div>
            <h3 className="mt-2 font-display text-xl font-normal tracking-tight text-ink">{title}</h3>
          </div>

          {metrics.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-hairline py-3 text-sm text-ink">
              {metrics.map(({ icon: Icon, text }, i) => (
                <li key={text} className="flex items-center gap-3">
                  {i > 0 ? (
                    <span aria-hidden className="text-ink-muted">
                      ·
                    </span>
                  ) : null}
                  <span className="flex items-center gap-2">
                    <Icon className="size-4 text-ink-muted" aria-hidden />
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {description ? (
            <p className="line-clamp-3 max-w-prose text-sm font-light leading-relaxed text-ink-muted">{description}</p>
          ) : null}

          {features && features.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {features.slice(0, MAX_FEATURES).map((feature) => (
                <li key={feature} className="border border-hairline px-3 py-1 text-xs text-ink-muted">
                  {feature}
                </li>
              ))}
            </ul>
          ) : null}

          <p className="mt-auto flex items-baseline justify-between gap-2">
            <span className="text-xs uppercase tracking-luxury text-ink-muted">Precio</span>
            <span className="text-base text-ink">{formatPrice(price)}</span>
          </p>
        </div>
      </article>
    </Link>
  );
}
