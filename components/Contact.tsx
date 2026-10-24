import { ContactForm } from "@/components/ContactForm";
import { getSiteConfig, telHref, waNumber } from "@/lib/server/public-config";

const focusRing =
  "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink dark:focus-visible:outline-white";


export async function Contact() {
  const config = await getSiteConfig();
  return (
    <section id="contacto" className="scroll-mt-24 border-t border-hairline bg-surface-raised dark:border-white/10 dark:bg-zinc-900">
      <div className="container-page py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — contact info */}
          <div>
            <h2 className="max-w-md font-display text-3xl font-normal tracking-tight text-ink dark:text-white sm:text-4xl">
              Conversemos sobre su próxima propiedad
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted dark:text-white/75">
              Agende una visita privada o reciba nuestra cartera completa.
            </p>
            <dl className="mt-10 space-y-6">
              <div>
                <dt className="text-xs uppercase tracking-luxury text-ink-muted dark:text-white/75">Email</dt>
                <dd className="mt-1 text-sm dark:text-white">
                  <a href={`mailto:${config.contact.emails[0]}`} className={`transition-colors hover:text-ink dark:hover:text-white ${focusRing}`}>
                    {config.contact.emails[0]}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-luxury text-ink-muted dark:text-white/75">Teléfono</dt>
                <dd className="mt-1 text-sm dark:text-white">
                  <a href={telHref(config.contact.phones[0])} className={`transition-colors hover:text-ink dark:hover:text-white ${focusRing}`}>
                    {config.contact.phones[0]}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* Right — enquiry form */}
          <ContactForm whatsapp={waNumber(config.whatsapp.primary.number)} />
        </div>
      </div>
    </section>
  );
}
