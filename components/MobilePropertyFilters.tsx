"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PropertyTypeDef } from "@/lib/property-types";

/** `types`: from the admin "Tipos" page, in display order. */
export function MobilePropertyFilters({ types }: { types: PropertyTypeDef[] }) {
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

  const allItems = [
    { label: "Destacados", key: "featured", value: "true", group: "featured" },
    ...types.map((t) => ({ label: t.label, key: "tipo", value: t.id, group: "tipo" })),
  ];

  const selectedZones = list("zona");
  const selectedTypes = list("tipo");
  const selectedFeatured = list("featured");

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-4 flex gap-5 overflow-x-auto px-4 [scrollbar-width:none]">
        {allItems.map(({ label, key, value, group }) => {
            const isSelected =
              (group === "zona" && selectedZones.includes(value)) ||
              (group === "tipo" && selectedTypes.includes(value)) ||
              (group === "featured" && selectedFeatured.includes(value));

            return (
              <button
                key={`${key}-${value}`}
                onClick={() => setSingle(key, value)}
                type="button"
                aria-pressed={isSelected}
                className="flex min-h-11 shrink-0 flex-col items-center justify-center gap-1 whitespace-nowrap"
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
