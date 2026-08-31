const ZONES: { name: string; blurb: string }[] = [
  { name: "José Ignacio", blurb: "El pueblo de pescadores devenido en el enclave más codiciado de la costa." },
  { name: "Manantiales", blurb: "Playas amplias, médanos y las mejores mesas del este." },
  { name: "La Barra", blurb: "Vida nocturna, galerías y arquitectura de autor sobre el arroyo Maldonado." },
  { name: "Península", blurb: "El corazón histórico de Punta del Este, entre dos mares." },
  { name: "Mansa", blurb: "Atardeceres sobre aguas calmas y las torres frente al mar." },
];

export function Zones() {
  return (
    <section className="border-y border-hairline bg-surface-raised">
      <div className="container-page py-24 sm:py-32">
        <p className="text-xs uppercase tracking-luxury text-ink-muted">Dónde</p>
        <h2 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-4xl">
          Cinco zonas
        </h2>
        <ul className="mt-14 border-t border-hairline">
          {ZONES.map((zone) => (
            <li key={zone.name} className="border-b border-hairline">
              <a
                href="#"
                className="group flex items-baseline gap-6 py-6 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                <span className="font-display text-xl font-normal tracking-tight sm:text-2xl">
                  {zone.name}
                </span>
                <span className="hidden flex-1 text-sm text-ink-muted sm:block">
                  {zone.blurb}
                </span>
                <span
                  aria-hidden
                  className="ml-auto text-ink-muted transition-transform group-hover:translate-x-1 sm:ml-0"
                >
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
