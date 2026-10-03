"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PropertyType, PropertyZone } from "@/types/property";
import { propertyTypeLabel } from "@/lib/properties";

const CATEGORIES = [
  { label: "Destacados", key: "featured", value: "true", group: "featured" },
  { label: "Apartamentos", key: "tipo", value: "apartment", group: "tipo" },
  { label: "Casa", key: "tipo", value: "house", group: "tipo" },
  { label: "Terrenos", key: "tipo", value: "land", group: "tipo" },
];

const ZONES: PropertyZone[] = [
  "José Ignacio",
  "Manantiales",
  "La Barra",
  "Península",
  "Mansa",
];

export function MobilePropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const list = (key: string) =>
    sp.get(key)?.split(",").filter(Boolean) ?? [];

  const commit = (params: URLSearchParams) => {
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const setSingle = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    const current = list(key);
    if (current.includes(value)) {
      params.delete(key);
    } else {
      params.set(key, value);
      params.delete("featured");
      params.delete("tipo");
      params.set(key, value);
    }
    commit(params);
  };

  const allItems = CATEGORIES;

  const selectedZones = list("zona");
  const selectedTypes = list("tipo");
  const selectedFeatured = list("featured");

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        {allItems.map(({ label, key, value, group }) => {
            const isSelected =
              (group === "zona" && selectedZones.includes(value)) ||
              (group === "tipo" && selectedTypes.includes(value)) ||
              (group === "featured" && selectedFeatured.includes(value));

            return (
              <button
                key={`${key}-${value}`}
                onClick={() => setSingle(key, value)}
                className="flex flex-col items-center gap-1 whitespace-nowrap"
              >
                <span
                  className={`text-xs font-medium transition-colors ${
                    isSelected
                      ? "text-ink"
                      : "text-ink-muted"
                  }`}
                >
                  {label}
                </span>
                <div
                  className={`h-0.5 w-full transition-colors ${
                    isSelected ? "bg-ink" : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
      </div>

    </div>
  );
}
