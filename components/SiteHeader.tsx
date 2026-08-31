import Link from "next/link";
import { Menu } from "lucide-react";

const NAV_LINKS = ["Propiedades", "Zonas", "Nosotros", "Contacto"] as const;

const focusRing =
  "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-surface/75 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          aria-label="Oceanus — inicio"
          className={`flex items-center gap-2.5 ${focusRing}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="size-4 text-sky-400"
          >
            <path d="M12 21v-9" />
            <path d="M12 3v9" />
            <path d="M7 5v3a5 5 0 0 0 10 0V5" />
            <path d="M9.5 21h5" />
          </svg>
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
