import Link from "next/link";
import { MapPin, Clock, Phone } from "lucide-react";
import { SOCIAL } from "@/components/social-icons";
import { MobileNav } from "@/components/MobileNav";
import { getSiteConfig, telHref } from "@/lib/server/public-config";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Inicio", href: "/" },
  { label: "Propiedades", href: "/propiedades" },
  { label: "Zonas", href: "/#zonas" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Contacto", href: "/#contacto" },
];

const focusRing =
  "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink dark:focus-visible:outline-white";

export async function SiteHeader() {
  const config = await getSiteConfig();
  const { lat, lng } = config.address.coordinates;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
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
            {config.agency.name}
          </span>
        </Link>

        <ul className="hidden items-center gap-8 nav:flex wide:gap-10">
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
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ubicación"
            className={`-m-3 p-3 text-ink/85 transition-colors hover:text-ink dark:text-white/85 dark:hover:text-white ${focusRing}`}
          >
            <MapPin size={18} strokeWidth={1.5} />
          </a>
          <Link
            href="/#horarios"
            aria-label="Horarios"
            className={`-m-3 p-3 text-ink/85 transition-colors hover:text-ink dark:text-white/85 dark:hover:text-white ${focusRing}`}
          >
            <Clock size={18} strokeWidth={1.5} />
          </Link>
          <a
            href={telHref(config.contact.phones[0])}
            aria-label="Llamar"
            className={`-m-3 p-3 text-ink/85 transition-colors hover:text-ink dark:text-white/85 dark:hover:text-white ${focusRing}`}
          >
            <Phone size={18} strokeWidth={1.5} />
          </a>
          <div className="nav:hidden">
            <MobileNav
              links={NAV_LINKS}
              social={SOCIAL.filter(({ key }) => config.social[key]).map(({ label, key, path }) => ({
                label,
                path,
                href: config.social[key],
              }))}
            />
          </div>
        </div>
      </nav>
    </header>
  );
}
