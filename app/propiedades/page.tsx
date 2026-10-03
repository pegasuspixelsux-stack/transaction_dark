import type { Metadata } from "next";
import { properties } from "@/lib/properties";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyFilters } from "@/components/PropertyFilters";
import { MobilePropertyFilters } from "@/components/MobilePropertyFilters";
import { SiteFooter } from "@/components/SiteFooter";
import { AGenteConcierge } from "@/components/AGenteConcierge";

export const metadata: Metadata = {
  title: "Propiedades · Transaction",
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
    <main className="container-page pb-8 pt-16 sm:pt-28">
      <header className="mb-6 sm:mb-12 max-w-2xl">
        <p className="hidden sm:block text-xs uppercase tracking-luxury text-ink-muted">Cartera</p>
        <h1 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-4xl">
          Propiedades
        </h1>
      </header>

      <div className="mb-4 sm:mb-6 lg:hidden">
        <MobilePropertyFilters />
      </div>

      <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-16">
        <div className="hidden lg:block">
          <PropertyFilters />
        </div>

        <div>
          <div className="mb-8">
            <p className="text-xs uppercase tracking-luxury text-ink-muted">
              {results.length}{" "}
              {results.length === 1 ? "propiedad" : "propiedades"}
            </p>
            <details className="group lg:hidden mt-4">
              <summary className="cursor-pointer text-xs uppercase tracking-luxury text-ink-muted transition-colors hover:text-ink">
                Búsqueda avanzada
              </summary>
              <div className="mt-6 border border-hairline bg-surface-raised p-6">
                <PropertyFilters />
              </div>
            </details>
          </div>

          {results.length > 0 ? (
            <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2">
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
      <SiteFooter />
      <AGenteConcierge />
    </main>
  );
}
