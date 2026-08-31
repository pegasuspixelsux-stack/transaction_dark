"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PropertyType, PropertyZone } from "@/types/property";
import { propertyTypeLabel } from "@/lib/properties";

const ZONES: PropertyZone[] = [
  "José Ignacio",
  "Manantiales",
  "La Barra",
  "Península",
  "Mansa",
];
const TYPES: PropertyType[] = ["house", "apartment", "penthouse", "land"];
const PRICE_OPTIONS = [
  { label: "Sin límite", value: "" },
  { label: "Hasta US$ 1M", value: "1000000" },
  { label: "Hasta US$ 2M", value: "2000000" },
  { label: "Hasta US$ 5M", value: "5000000" },
];
const BED_OPTIONS = [
  { label: "Cualquiera", value: "" },
  { label: "1+", value: "1" },
  { label: "2+", value: "2" },
  { label: "3+", value: "3" },
  { label: "4+", value: "4" },
];

const groupClass = "space-y-3";
const legendClass = "text-xs uppercase tracking-luxury text-ink-muted";
const rowClass =
  "flex cursor-pointer items-center gap-3 text-sm text-ink transition-colors hover:text-ink";
const selectClass =
  "w-full border border-hairline bg-surface px-3 py-2 text-sm text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-ink";

export function PropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const list = (key: string) =>
    sp.get(key)?.split(",").filter(Boolean) ?? [];

  const commit = (params: URLSearchParams) => {
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const toggleMulti = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    const current = list(key);
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    if (next.length) params.set(key, next.join(","));
    else params.delete(key);
    commit(params);
  };

  const setSingle = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    commit(params);
  };

  const hasFilters = [...sp.keys()].length > 0;

  return (
    <aside className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
      <div className={groupClass}>
        <p className={legendClass}>Zona</p>
        {ZONES.map((zone) => (
          <label key={zone} className={rowClass}>
            <input
              type="checkbox"
              checked={list("zona").includes(zone)}
              onChange={() => toggleMulti("zona", zone)}
              className="size-4 accent-ink"
            />
            {zone}
          </label>
        ))}
      </div>

      <div className={groupClass}>
        <p className={legendClass}>Tipo</p>
        {TYPES.map((type) => (
          <label key={type} className={rowClass}>
            <input
              type="checkbox"
              checked={list("tipo").includes(type)}
              onChange={() => toggleMulti("tipo", type)}
              className="size-4 accent-ink"
            />
            {propertyTypeLabel(type)}
          </label>
        ))}
      </div>

      <div className={groupClass}>
        <p className={legendClass}>Precio</p>
        <select
          value={sp.get("precioMax") ?? ""}
          onChange={(e) => setSingle("precioMax", e.target.value)}
          className={selectClass}
        >
          {PRICE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className={groupClass}>
        <p className={legendClass}>Dormitorios</p>
        <select
          value={sp.get("dormMin") ?? ""}
          onChange={(e) => setSingle("dormMin", e.target.value)}
          className={selectClass}
        >
          {BED_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => commit(new URLSearchParams())}
          className="self-start text-xs uppercase tracking-luxury text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          Limpiar filtros
        </button>
      )}
    </aside>
  );
}
