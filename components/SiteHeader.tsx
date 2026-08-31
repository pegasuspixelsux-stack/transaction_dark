import Link from "next/link";
import { Menu } from "lucide-react";
import { Trident } from "@/components/Trident";

const NAV_LINKS = ["Propiedades", "Zonas", "Nosotros", "Contacto"] as const;

const focusRing =
  "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-surface/75 backdrop-blur-md">
      <nav className="container-page flex items-center justify-between py-5">
        <Link
          href="/"
          aria-label="Oceanus — inicio"
          className={`flex items-center gap-2.5 ${focusRing}`}
        >
          <Trident className="size-4 text-sky-600" />
          <span className="text-sm font-light uppercase tracking-wordmark text-ink">
            Oceanus
          </span>
        </Link>

        <ul className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <a
                href="#"
                className={`text-xs uppercase tracking-luxury text-ink/85 transition-colors hover:text-ink ${focusRing}`}
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          aria-label="Abrir menú"
          className={`-m-3 p-3 text-ink/85 transition-colors hover:text-ink md:hidden ${focusRing}`}
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </nav>
    </header>
  );
}
