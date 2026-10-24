import { ThemeToggle } from "@/components/ThemeToggle";
import { SOCIAL } from "@/components/social-icons";
import { getSiteConfig, telHref } from "@/lib/server/public-config";

const staticColumns: { heading: string; href?: string; items: string[]; hrefs?: string[] }[] = [
  { heading: "Propiedades", href: "/propiedades", items: ["Casas", "Apartamentos", "Terrenos", "Chacras", "Campos"] },
  { heading: "Zonas", href: "/#zonas", items: ["José Ignacio", "Manantiales", "La Barra", "Península", "Mansa"] },
  { heading: "Transaction", href: "/#nosotros", items: ["Nosotros", "Contacto", "Prensa"] },
];

export async function SiteFooter() {
  const config = await getSiteConfig();
  const { city } = config.address;
  const FOOTER_COLUMNS = [
    ...staticColumns,
    {
      heading: "Contacto",
      href: "/#contacto",
      // Same details, in the same order, as the Contacto section.
      items: [config.contact.emails[0], config.contact.phones[0]],
      hrefs: [`mailto:${config.contact.emails[0]}`, telHref(config.contact.phones[0])],
    },
  ];
  return (
    <footer className="border-t border-hairline dark:border-white/10 dark:bg-zinc-950">
      <div className="container-page py-16 dark:text-white">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full border-[1.5px] border-blue-800 dark:border-sky-600 text-xs font-bold text-blue-800 dark:text-sky-600">
                T
              </div>
              <span className="text-xl uppercase tracking-wordmark text-ink dark:text-white">
                {config.agency.name}
              </span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-ink-muted dark:text-white/75">
              {config.agency.tagline} Asesoramiento privado para compradores y
              vendedores.
            </p>
            <div className="mt-6 flex items-center gap-5">
              {SOCIAL.map(({ label, key, path }) => (
                <a
                  key={label}
                  href={config.social[key] || "#"}
                  aria-label={label}
                  className="text-ink-muted transition-colors hover:text-ink dark:text-white/75 dark:hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink dark:focus-visible:outline-white"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-[18px]">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-2 wide:grid-cols-4">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.heading}>
                {column.href ? (
                  <a
                    href={column.href}
                    className="text-xs uppercase tracking-luxury text-ink-muted transition-colors hover:text-ink dark:text-white/75 dark:hover:text-white"
                  >
                    {column.heading}
                  </a>
                ) : (
                  <p className="text-xs uppercase tracking-luxury text-ink-muted dark:text-white/75">
                    {column.heading}
                  </p>
                )}
                <ul className="mt-4 space-y-2">
                  {column.items.map((item, i) => (
                    <li key={item}>
                      <a
                        href={column.hrefs?.[i] ?? "#"}
                        className="text-sm text-ink-muted transition-colors hover:text-ink dark:text-white/75 dark:hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink dark:focus-visible:outline-white"
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
        <div className="mt-16 border-t border-hairline pt-8 dark:border-white/10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-ink-muted dark:text-white/75">
              © 2026 {config.agency.name}. {city}, {config.address.country}.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <ThemeToggle />
              <a
                href="/login"
                className="text-xs text-ink-muted transition-colors hover:text-ink dark:text-white/75 dark:hover:text-white"
              >
                Admin
              </a>
              <a
                href="/privacy"
                className="text-xs text-ink-muted transition-colors hover:text-ink dark:text-white/75 dark:hover:text-white"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="text-xs text-ink-muted transition-colors hover:text-ink dark:text-white/75 dark:hover:text-white"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
