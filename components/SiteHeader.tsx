import Link from "next/link";
import { Menu, MapPin, Clock, Phone } from "lucide-react";
import { Trident } from "@/components/Trident";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Propiedades", href: "/propiedades" },
  { label: "Zonas", href: "/#zonas" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Contacto", href: "/#contacto" },
];

const focusRing =
  "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink dark:focus-visible:outline-white";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-surface/75 backdrop-blur-md transition-colors dark:border-white/10 dark:bg-zinc-950/75 dark:text-white">
      <nav className="container-page flex items-center justify-between py-5">
        <Link
          href="/"
          aria-label="Transaction — inicio"
          className={`flex items-center gap-2.5 ${focusRing}`}
        >
          <div className="flex size-4 items-center justify-center rounded-full border border-sky-600 text-[8px] font-bold text-sky-600">
            T
          </div>
          <span className="text-sm font-light uppercase tracking-wordmark text-ink dark:text-white">
            Transaction
          </span>
        </Link>

        <ul className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className={`text-xs uppercase tracking-luxury text-ink/85 transition-colors hover:text-ink dark:text-white/85 dark:hover:text-white ${focusRing}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="#"
            aria-label="Ubicación"
            className={`-m-3 p-3 text-ink/85 transition-colors hover:text-ink dark:text-white/85 dark:hover:text-white ${focusRing}`}
          >
            <MapPin size={18} strokeWidth={1.5} />
          </a>
          <a
            href="#"
            aria-label="Horarios"
            className={`-m-3 p-3 text-ink/85 transition-colors hover:text-ink dark:text-white/85 dark:hover:text-white ${focusRing}`}
          >
            <Clock size={18} strokeWidth={1.5} />
          </a>
          <a
            href="tel:+59842771234"
            aria-label="Llamar"
            className={`-m-3 p-3 text-ink/85 transition-colors hover:text-ink dark:text-white/85 dark:hover:text-white ${focusRing}`}
          >
            <Phone size={18} strokeWidth={1.5} />
          </a>
          <button
            type="button"
            aria-label="Abrir menú"
            className={`-m-3 p-3 text-ink/85 transition-colors hover:text-ink dark:text-white/85 dark:hover:text-white ${focusRing}`}
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </nav>
    </header>
  );
}
