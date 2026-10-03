import Link from "next/link";
import Image from "next/image";
import type { Property } from "@/types/property";
import { formatPrice, propertyTypeLabel } from "@/lib/properties";

export function PropertyCard({ property }: { property: Property }) {
  const { id, title, zone, price, bedrooms, type, imageUrl } = property;
  return (
    <Link href={`/propiedades/${id}`}>
      <article className="relative aspect-[4/5] overflow-hidden border border-hairline bg-mist/20 cursor-pointer transition-opacity hover:opacity-90">
      <Image
        src={imageUrl}
        alt={title}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 via-black/30 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end gap-2 p-4 text-white">
        <p className="text-xs uppercase tracking-luxury [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
          {zone}
        </p>
        <h3 className="font-display text-lg font-normal tracking-tight [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
          {title}
        </h3>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xs uppercase tracking-luxury [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
            {bedrooms > 0 ? `${bedrooms} dorm · ${propertyTypeLabel(type)}` : propertyTypeLabel(type)}
          </p>
          <p className="shrink-0 text-sm font-medium [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
            {formatPrice(price)}
          </p>
        </div>
      </div>
      </article>
    </Link>
  );
}
