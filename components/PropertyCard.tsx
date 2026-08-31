import type { Property } from "@/types/property";
import { formatPrice, propertyTypeLabel } from "@/lib/properties";

export function PropertyCard({ property }: { property: Property }) {
  const { title, zone, price, bedrooms, type } = property;
  return (
    <article className="flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-surface-raised to-surface">
        <span className="absolute bottom-4 left-4 text-xs uppercase tracking-luxury text-ink-muted">
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
