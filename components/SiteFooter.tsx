import { Trident } from "@/components/Trident";

const SOCIAL: { label: string; path: string }[] = [
  {
    label: "Instagram",
    path: "M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23.06 1.25.07 1.65.07 4.85s0 3.6-.07 4.85c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.06.37-2.23.42-1.25.06-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 3.05A6.75 6.75 0 1 0 12 18.75 6.75 6.75 0 0 0 12 5.25Zm0 11.13A4.38 4.38 0 1 1 12 7.6a4.38 4.38 0 0 1 0 8.78Zm6.9-11.4a1.58 1.58 0 1 1-3.15 0 1.58 1.58 0 0 1 3.15 0Z",
  },
  {
    label: "Facebook",
    path: "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z",
  },
  {
    label: "LinkedIn",
    path: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z",
  },
];

const FOOTER_COLUMNS: { heading: string; href?: string; items: string[] }[] = [
  { heading: "Propiedades", href: "/propiedades", items: ["Casas", "Apartamentos", "Penthouses", "Terrenos"] },
  { heading: "Zonas", href: "/#zonas", items: ["José Ignacio", "Manantiales", "La Barra", "Península", "Mansa"] },
  { heading: "Transaction", href: "/#nosotros", items: ["Nosotros", "Contacto", "Prensa"] },
  { heading: "Contacto", href: "/#contacto", items: ["Ruta 10, km 161 · José Ignacio", "Lun–Dom: 9am–6pm", "+598 42 77 1234"] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline dark:border-white/10 dark:bg-zinc-950">
      <div className="container-page py-16 dark:text-white">
        <div className="flex flex-col gap-12 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full border-[1.5px] border-sky-600 text-xs font-bold text-sky-600">
                T
              </div>
              <span className="text-xl uppercase tracking-wordmark text-ink dark:text-white">
                Transaction
              </span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-ink-muted dark:text-white/75">
              Propiedades de autor frente al mar en Punta del Este. Asesoramiento
              privado para compradores y vendedores.
            </p>
            <div className="mt-6 flex items-center gap-5">
              {SOCIAL.map(({ label, path }) => (
                <a
                  key={label}
                  href="#"
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
          <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
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
                  {column.items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
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
              © 2026 Transaction. Punta del Este, Uruguay.
            </p>
            <div className="flex gap-6">
              <a
                href="/admin"
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
