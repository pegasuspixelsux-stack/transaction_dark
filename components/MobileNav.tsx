"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";

const focusRing =
  "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink dark:focus-visible:outline-white";

/** Burger button + full-width dropdown panel with the main nav links. */
export function MobileNav({
  links,
  social = [],
}: {
  links: { label: string; href: string }[];
  social?: { label: string; href: string; path: string }[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((o) => !o)}
        className={`-m-3 p-3 text-ink/85 transition-colors hover:text-ink dark:text-white/85 dark:hover:text-white ${focusRing}`}
      >
        <Menu size={20} strokeWidth={1.5} />
      </button>

      {/* Portalled: the header's backdrop-blur would otherwise trap `fixed` inside it. */}
      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[60] nav:hidden">
              <button
                type="button"
                aria-label="Cerrar menú"
                tabIndex={-1}
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-black/40"
              />
              <div
                id="mobile-nav"
                data-mobile-nav
                role="dialog"
                aria-modal="true"
                aria-label="Menú"
                className="absolute right-0 top-0 w-1/2 min-w-60 max-w-sm pb-6 animate-[navSlide_250ms_ease-out] border-b border-l border-hairline bg-surface shadow-2xl dark:border-white/10 dark:bg-[#0a1a2e]"
              >
                <div className="flex justify-end px-6 py-5">
                  <button
                    type="button"
                    aria-label="Cerrar menú"
                    onClick={() => setOpen(false)}
                    className={`-m-3 p-3 text-ink/85 hover:text-ink dark:text-white/85 dark:hover:text-white ${focusRing}`}
                  >
                    <X size={20} strokeWidth={1.5} />
                  </button>
                </div>
                <ul className="px-6">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={`block py-3 text-sm uppercase tracking-luxury text-ink dark:text-white ${focusRing}`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                {social.length > 0 ? (
                  <div className="mt-4 flex items-center gap-5 border-t border-hairline px-6 pt-5 dark:border-white/10">
                    {social.map(({ label, href, path }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className={`text-ink-muted transition-colors hover:text-ink dark:text-white/75 dark:hover:text-white ${focusRing}`}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-[18px]">
                          <path d={path} />
                        </svg>
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
