export function Contact() {
  return (
    <section className="border-t border-hairline bg-surface-raised">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <h2 className="max-w-2xl font-display text-3xl font-normal tracking-tight sm:text-4xl">
          Conversemos sobre su próxima propiedad
        </h2>
        <p className="mt-4 max-w-md text-base font-light leading-relaxed text-ink-muted">
          Agende una visita privada o reciba nuestra cartera completa.
        </p>
        <a
          href="mailto:hola@oceanus.uy"
          className="mt-8 inline-flex min-h-11 items-center border border-ink/30 px-8 text-xs uppercase tracking-luxury transition-colors hover:bg-ink hover:text-surface focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          Escribinos
        </a>
      </div>
    </section>
  );
}
