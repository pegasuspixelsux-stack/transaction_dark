import Link from "next/link";
import { properties } from "@/lib/properties";
import { PropertyCard } from "@/components/PropertyCard";

export function FeaturedProperties() {
  return (
    <section className="container-page py-24 sm:py-32">
      <header className="mb-14 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-luxury text-ink-muted">Selección</p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-4xl">
            Propiedades destacadas
          </h2>
        </div>
        <Link
          href="/propiedades"
          className="hidden shrink-0 text-xs uppercase tracking-luxury text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink sm:block"
        >
          Buscar propiedades
        </Link>
      </header>
      {/* First row: 2-up. Remaining rows: 3-up. */}
      <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2">
        {properties.slice(0, 2).map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
      <div className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {properties.slice(2).map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}
