import { Trident } from "@/components/Trident";

const FOOTER_COLUMNS: { heading: string; items: string[] }[] = [
  { heading: "Propiedades", items: ["Casas", "Apartamentos", "Penthouses", "Terrenos"] },
  { heading: "Zonas", items: ["José Ignacio", "Manantiales", "La Barra", "Península", "Mansa"] },
  { heading: "Oceanus", items: ["Nosotros", "Contacto", "Prensa"] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="container-page py-16">
        <div className="flex flex-col gap-12 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Trident className="size-4 text-sky-600" />
            <span className="text-sm font-light uppercase tracking-wordmark text-ink">
              Oceanus
            </span>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.heading}>
                <p className="text-xs uppercase tracking-luxury text-ink-muted">
                  {column.heading}
                </p>
                <ul className="mt-4 space-y-2">
                  {column.items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-16 text-xs text-ink-muted">
          © 2026 Oceanus. Punta del Este, Uruguay.
        </p>
      </div>
    </footer>
  );
}
