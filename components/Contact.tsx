const focusRing =
  "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink";

const fieldClass =
  "border border-hairline bg-surface px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink-muted focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-ink";

export function Contact() {
  return (
    <section id="contacto" className="scroll-mt-24 border-t border-hairline bg-surface-raised">
      <div className="container-page py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — contact info */}
          <div>
            <h2 className="max-w-md font-display text-3xl font-normal tracking-tight sm:text-4xl">
              Conversemos sobre su próxima propiedad
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
              Agende una visita privada o reciba nuestra cartera completa.
            </p>
            <dl className="mt-10 space-y-6">
              <div>
                <dt className="text-xs uppercase tracking-luxury text-ink-muted">Email</dt>
                <dd className="mt-1 text-sm">
                  <a href="mailto:hola@oceanus.uy" className={`transition-colors hover:text-ink ${focusRing}`}>
                    hola@oceanus.uy
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-luxury text-ink-muted">Teléfono</dt>
                <dd className="mt-1 text-sm">
                  <a href="tel:+59842771234" className={`transition-colors hover:text-ink ${focusRing}`}>
                    +598 42 77 1234
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-luxury text-ink-muted">Oficina</dt>
                <dd className="mt-1 text-sm text-ink-muted">Ruta 10, km 161 · José Ignacio</dd>
              </div>
            </dl>
          </div>

          {/* Right — enquiry form */}
          <form className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-luxury text-ink-muted">Nombre</span>
              <input type="text" name="nombre" autoComplete="name" className={fieldClass} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-luxury text-ink-muted">Email</span>
              <input type="email" name="email" autoComplete="email" className={fieldClass} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-luxury text-ink-muted">Mensaje</span>
              <textarea name="mensaje" rows={4} className={`${fieldClass} resize-none`} />
            </label>
            <button
              type="submit"
              className={`mt-2 inline-flex min-h-11 items-center justify-center border border-ink/30 px-8 text-xs uppercase tracking-luxury transition-colors hover:bg-ink hover:text-surface ${focusRing}`}
            >
              Enviar consulta
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
