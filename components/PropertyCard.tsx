import Image from "next/image";
import type { Property } from "@/types/property";
import { formatPrice, propertyTypeLabel } from "@/lib/properties";

export function PropertyCard({ property }: { property: Property }) {
  const { title, zone, price, bedrooms, type, imageUrl } = property;
  return (
    <article className="flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden border border-hairline bg-mist/20">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent"
        />
        <span className="absolute bottom-4 left-4 text-xs uppercase tracking-luxury text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
          {zone}
        </span>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-hairline pt-4">
        <h3 className="font-display text-xl font-normal tracking-tight">{title}</h3>
        <p className="shrink-0 text-sm text-ink-muted">{formatPrice(price)}</p>
      </div>
      <p className="mt-1 text-xs uppercase tracking-luxury text-ink-muted">
        {bedrooms > 0 ? `${bedrooms} dorm · ${propertyTypeLabel(type)}` : propertyTypeLabel(type)}
      </p>
    </article>
  );
}
