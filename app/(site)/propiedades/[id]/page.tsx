import { notFound } from "next/navigation";
import { Mail, MessageCircle, Bed, Bath, Ruler, Calendar, MapPin } from "lucide-react";
import { getPublicProperties } from "@/lib/server/public-properties";
import { PropertySlideshow } from "@/components/PropertySlideshow";
import { ContactForm } from "@/components/ContactForm";
import { SiteFooter } from "@/components/SiteFooter";
import { AGenteConcierge } from "@/components/AGenteConcierge";
import { ZONE_CENTERS } from "@/lib/properties";
import { isAgentEnabled } from "@/lib/site-config";
import { getSiteConfig, waNumber } from "@/lib/server/public-config";

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await getSiteConfig();
  const whatsapp = waNumber(config.whatsapp.primary.number);
  const property = (await getPublicProperties()).find((p) => p.id === id);

  if (!property) {
    notFound();
  }

  const images = (property.images?.length ? property.images : [property.imageUrl]).filter(Boolean);
  const bathrooms = property.bathrooms ?? 3;
  const area = property.area ?? 450;
  const yearBuilt = property.yearBuilt ?? 2015;
  const description =
    property.description ||
    `${property.title} es una propiedad excepcional ubicada en el corazón de ${property.zone}. Con arquitectura moderna y detalles de lujo, esta residencia ofrece vistas panorámicas al mar y acceso directo a las playas más exclusivas de Punta del Este. Cada espacio ha sido cuidadosamente diseñado para maximizar la luz natural y la conexión con el paisaje costero.`;

  const features = property.features || [
    "Acceso directo a playa",
    "Piscina climatizada",
    "Spa privado",
    "Cine en casa",
    "Seguridad 24/7",
    "Garaje para 4 autos",
  ];

  const amenities = property.amenities || [
    "Cocina gourmet",
    "Biblioteca",
    "Sala de juegos",
    "Bodega",
    "Terraza panorámica",
    "Solarium",
    "Lavandería",
    "Almacenamiento",
  ];

  const place = property.location && property.location !== property.zone ? `${property.location} | ${property.zone}` : property.zone;
  const specs = [
    property.bedrooms > 0 ? { icon: Bed, text: `${property.bedrooms} ${property.bedrooms === 1 ? "dorm" : "dorms"}` } : null,
    bathrooms > 0 ? { icon: Bath, text: `${bathrooms} ${bathrooms === 1 ? "baño" : "baños"}` } : null,
    area > 0 ? { icon: Ruler, text: `${area.toLocaleString("es-UY")} m²` } : null,
    { icon: Calendar, text: String(yearBuilt) },
  ].filter((x): x is NonNullable<typeof x> => x !== null);

  const heroOverlay = (
    <div className="text-white">
      <p className="text-xs uppercase tracking-luxury text-white/80 [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
        {place} · Ref. {property.id}
      </p>
      <h1 className="mt-2 font-display text-2xl font-normal tracking-tight drop-shadow-md sm:text-3xl md:text-5xl">
        {property.title}
      </h1>
    </div>
  );

  return (
    <>
      <main className="min-h-full">
        {/* Hero Slideshow */}
        {images.length > 0 ? (
          <PropertySlideshow images={images} title={property.title}>
            {heroOverlay}
          </PropertySlideshow>
        ) : (
          <section className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-neutral-950 text-xs uppercase tracking-luxury text-white/60 sm:aspect-auto sm:min-h-dvh">
            Fotos próximamente
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-4 z-10 md:bottom-8">
              <div className="mx-auto w-full max-w-[calc(1000px+4rem)] px-6 normal-case tracking-normal md:px-8">{heroOverlay}</div>
            </div>
          </section>
        )}

        {/* Property Info Section */}
        <section className="mx-auto w-full max-w-[calc(1000px+4rem)] px-6 py-24 sm:py-32 md:px-8">
          {/* Description Section */}
          <div className="mb-24">
            <ul className="mb-8 grid max-w-md grid-cols-2 gap-x-6 gap-y-3 text-sm text-ink dark:text-white/90">
              {specs.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2">
                  <Icon className="size-4 text-blue-800 dark:text-blue-400" aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
            <p className="text-xs uppercase tracking-luxury text-ink-muted dark:text-white/75">
              Descripción · Ref. <span className="uppercase">{property.id}</span>
            </p>
            <p className="mt-6 text-base leading-relaxed text-ink-muted dark:text-white/75">
              {description}
            </p>
          </div>

          {/* Location */}
          <div className="mb-24">
            <h2 className="font-display text-2xl font-normal tracking-tight text-ink dark:text-white sm:text-3xl">
              Ubicación
            </h2>
            <p className="mt-4 flex items-start gap-3 text-base text-ink-muted dark:text-white/75">
              <MapPin className="mt-1 size-5 shrink-0 text-blue-800 dark:text-blue-400" aria-hidden />
              <span>{property.zone}, Maldonado</span>
            </p>
            <iframe
              title={`Mapa de la zona ${property.zone}`}
              src={`https://maps.google.com/maps?q=${ZONE_CENTERS[property.zone].lat},${ZONE_CENTERS[property.zone].lng}&z=13&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="mt-6 aspect-[4/3] w-full border border-hairline sm:aspect-video dark:border-white/10"
            />
            <p className="mt-2 text-xs text-ink-muted dark:text-white/60">
              Ubicación aproximada de la zona.
            </p>
          </div>

          {/* Features & Amenities */}
          <div className="mb-24 grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-normal tracking-tight text-ink dark:text-white sm:text-3xl">
                Características
              </h2>
              <ul className="mt-6 space-y-3">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-base text-ink-muted dark:text-white/75"
                  >
                    <span className="mt-1.5 size-2 rounded-full bg-blue-800 dark:bg-blue-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl font-normal tracking-tight text-ink dark:text-white sm:text-3xl">
                Amenidades
              </h2>
              <ul className="mt-6 space-y-3">
                {amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-start gap-3 text-base text-ink-muted dark:text-white/75"
                  >
                    <span className="mt-1.5 size-2 rounded-full bg-blue-800 dark:bg-blue-400 flex-shrink-0" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Section */}
          <div className="border-t border-hairline pt-24 dark:border-white/10">
            <h2 className="font-display text-2xl font-normal tracking-tight text-ink dark:text-white sm:text-3xl">
              Costos e información de contacto
            </h2>
            <dl className="mt-8 divide-y divide-hairline border-y border-hairline text-base dark:divide-white/10 dark:border-white/10">
              <div className="flex items-baseline justify-between gap-4 py-4">
                <dt className="text-ink-muted dark:text-white/75">Precio</dt>
                <dd className="font-display text-2xl text-ink dark:text-white">US$ {property.price.toLocaleString("es-UY")}</dd>
              </div>
              {property.commonExpenses !== undefined ? (
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-ink-muted dark:text-white/75">Gastos comunes (mensual)</dt>
                  <dd className="text-ink dark:text-white">US$ {property.commonExpenses.toLocaleString("es-UY")}</dd>
                </div>
              ) : null}
              {property.annualTaxes !== undefined ? (
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-ink-muted dark:text-white/75">Impuestos (anual)</dt>
                  <dd className="text-ink dark:text-white">US$ {property.annualTaxes.toLocaleString("es-UY")}</dd>
                </div>
              ) : null}
            </dl>
            {property.commonExpenses === undefined && property.annualTaxes === undefined ? (
              <p className="mt-4 text-sm text-ink-muted dark:text-white/75">
                Consultá por gastos comunes e impuestos con un asesor.
              </p>
            ) : null}

            <div className="mt-8 flex gap-4">
              <a
                href={`mailto:${config.contact.emails[0]}?subject=${encodeURIComponent(`Consulta sobre ${property.title}`)}`}
                className="inline-flex items-center gap-2 border border-blue-800 dark:border-blue-400 px-6 py-3 text-sm uppercase tracking-luxury text-blue-800 dark:text-blue-400 transition-colors hover:bg-blue-800 hover:text-white dark:hover:bg-blue-400 "
              >
                <Mail size={18} />
                Email
              </a>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-blue-800 dark:border-blue-400 px-6 py-3 text-sm uppercase tracking-luxury text-blue-800 dark:text-blue-400 transition-colors hover:bg-blue-800 hover:text-white dark:hover:bg-blue-400 "
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
            </div>

            <div className="mt-16">
              <h3 className="font-display text-xl font-normal tracking-tight text-ink dark:text-white">
                Consultá por esta propiedad
              </h3>
              <p className="mb-8 mt-3 text-sm text-ink-muted dark:text-white/75">
                Dejanos tus datos y un asesor privado te contacta. También podés responder unas
                preguntas rápidas con el asistente AGENTE.
              </p>
              <ContactForm propertyTitle={property.title} propertyId={property.id} whatsapp={whatsapp} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      {isAgentEnabled(config) ? (
        <AGenteConcierge whatsapp={whatsapp} property={{ id: property.id, title: property.title }} />
      ) : null}
    </>
  );
}
