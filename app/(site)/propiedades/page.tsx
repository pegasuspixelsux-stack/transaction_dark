import type { Metadata } from "next";
import Link from "next/link";
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
  const page = Number(one(sp.page)) || 1;
  const perPage = 10;

  const results = properties.filter(
    (p) =>
      (zonas.length === 0 || zonas.includes(p.zone)) &&
      (tipos.length === 0 || tipos.includes(p.type)) &&
      p.price <= precioMax &&
      p.bedrooms >= dormMin,
  );

  const totalPages = Math.ceil(results.length / perPage);
  const paginatedResults = results.slice((page - 1) * perPage, page * perPage);

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
            <>
              <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2">
                {paginatedResults.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={`?page=${page - 1}${sp.zona ? `&zona=${sp.zona}` : ""}${sp.tipo ? `&tipo=${sp.tipo}` : ""}${sp.precioMax ? `&precioMax=${sp.precioMax}` : ""}${sp.dormMin ? `&dormMin=${sp.dormMin}` : ""}`}
                      className="px-3 py-2 border border-hairline text-xs uppercase tracking-luxury transition-colors hover:bg-surface-raised dark:border-white/10 dark:hover:bg-zinc-900"
                    >
                      Anterior
                    </Link>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`?page=${p}${sp.zona ? `&zona=${sp.zona}` : ""}${sp.tipo ? `&tipo=${sp.tipo}` : ""}${sp.precioMax ? `&precioMax=${sp.precioMax}` : ""}${sp.dormMin ? `&dormMin=${sp.dormMin}` : ""}`}
                      className={`px-3 py-2 text-xs uppercase tracking-luxury transition-colors ${
                        p === page
                          ? "border border-hairline bg-surface-raised dark:border-white/10 dark:bg-zinc-900"
                          : "text-ink-muted hover:text-ink dark:text-white/75 dark:hover:text-white"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}

                  {page < totalPages && (
                    <Link
                      href={`?page=${page + 1}${sp.zona ? `&zona=${sp.zona}` : ""}${sp.tipo ? `&tipo=${sp.tipo}` : ""}${sp.precioMax ? `&precioMax=${sp.precioMax}` : ""}${sp.dormMin ? `&dormMin=${sp.dormMin}` : ""}`}
                      className="px-3 py-2 border border-hairline text-xs uppercase tracking-luxury transition-colors hover:bg-surface-raised dark:border-white/10 dark:hover:bg-zinc-900"
                    >
                      Siguiente
                    </Link>
                  )}
                </div>
              )}
            </>
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
