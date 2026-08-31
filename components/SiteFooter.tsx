import { Facebook, Instagram, Linkedin } from "lucide-react";
import { Trident } from "@/components/Trident";

const SOCIAL = [
  { label: "Instagram", Icon: Instagram },
  { label: "Facebook", Icon: Facebook },
  { label: "LinkedIn", Icon: Linkedin },
];

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
          <div className="max-w-xs">
            <div className="flex items-center gap-3">
              <Trident className="size-8 text-sky-600" />
              <span className="text-xl uppercase tracking-wordmark text-ink">
                Oceanus
              </span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-ink-muted">
              Propiedades de autor frente al mar en Punta del Este. Asesoramiento
              privado para compradores y vendedores.
            </p>
            <div className="mt-6 flex items-center gap-5">
              {SOCIAL.map(({ label, Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
                >
                  <Icon size={18} strokeWidth={1.5} />
                </a>
              ))}
            </div>
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
