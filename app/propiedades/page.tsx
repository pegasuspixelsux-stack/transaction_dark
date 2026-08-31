import type { Metadata } from "next";
import { properties } from "@/lib/properties";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyFilters } from "@/components/PropertyFilters";

export const metadata: Metadata = {
  title: "Propiedades · Oceanus",
  description: "Cartera completa de residencias frente al mar en Punta del Este.",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const one = (v: string | string[] | undefined) =>
  typeof v === "string" ? v : undefined;

export default async function PropiedadesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const zonas = one(sp.zona)?.split(",").filter(Boolean) ?? [];
  const tipos = one(sp.tipo)?.split(",").filter(Boolean) ?? [];
  const precioMax = Number(one(sp.precioMax)) || Infinity;
  const dormMin = Number(one(sp.dormMin)) || 0;

  const results = properties.filter(
    (p) =>
      (zonas.length === 0 || zonas.includes(p.zone)) &&
      (tipos.length === 0 || tipos.includes(p.type)) &&
      p.price <= precioMax &&
      p.bedrooms >= dormMin,
  );

  return (
    <main className="container-page pb-24 pt-28 sm:pt-32">
      <header className="mb-12 max-w-2xl">
        <p className="text-xs uppercase tracking-luxury text-ink-muted">Cartera</p>
        <h1 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-4xl">
          Propiedades
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-muted">
          Toda nuestra cartera de residencias. Refiná la búsqueda por zona, tipo,
          precio y dormitorios.
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-16">
        <PropertyFilters />

        <div>
          <p className="mb-8 text-xs uppercase tracking-luxury text-ink-muted">
            {results.length}{" "}
            {results.length === 1 ? "propiedad" : "propiedades"}
          </p>

          {results.length > 0 ? (
            <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2">
              {results.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <p className="border border-hairline bg-surface-raised px-6 py-10 text-center text-ink-muted">
              Ninguna propiedad coincide con los filtros seleccionados.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
