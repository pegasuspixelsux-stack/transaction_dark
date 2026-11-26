import { notFound } from "next/navigation";
import { Bed, Bath, Ruler, Calendar, MapPin, FileText, MoveHorizontal } from "lucide-react";
import { getPublicProperties } from "@/lib/server/public-properties";
import { PropertySlideshow } from "@/components/PropertySlideshow";
import { PropertyInquiryActions } from "@/components/PropertyInquiryActions";
import { AgentCard } from "@/components/AgentCard";
import { SiteFooter } from "@/components/SiteFooter";
import { AGenteConcierge } from "@/components/AGenteConcierge";
import { findZone, zonePlace } from "@/lib/zones";
import { brandLogos, isAgentEnabled } from "@/lib/site-config";
import { getPublicPropertyTypes, getPublicZones, getSiteConfig, waNumber } from "@/lib/server/public-config";
import { findType } from "@/lib/property-types";

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await getSiteConfig();
  const whatsapp = waNumber(config.whatsapp.primary.number);
  const property = (await getPublicProperties()).find((p) => p.id === id);

  if (!property) {
    notFound();
  }
  // Zone centre if the zone is known, otherwise the office address.
  const center = findZone(await getPublicZones(), property.zone) ?? config.address.coordinates;

  const images = (property.images?.length ? property.images : [property.imageUrl]).filter(Boolean);
  const isBuilt = findType(await getPublicPropertyTypes(), property.type)?.built ?? false;
  const bathrooms = property.bathrooms ?? (isBuilt ? 3 : 0);
  const area = property.area ?? 450;
  const yearBuilt = property.yearBuilt ?? (isBuilt ? 2015 : undefined);
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
    yearBuilt ? { icon: Calendar, text: String(yearBuilt) } : null,
    property.padron ? { icon: FileText, text: `Padrón ${property.padron}` } : null,
    property.frontage ? { icon: MoveHorizontal, text: `Frente ${property.frontage.toLocaleString("es-UY")} m` } : null,
  ].filter((x): x is NonNullable<typeof x> => x !== null);

  // Phones: the photo carries only the reference; place and title sit below it so the image stays clear.
  // From md up, everything overlays the slideshow as before. Only one <h1> is displayed at a time.
  const heroOverlay = (
    <div className="text-white">
      <p className="text-xs uppercase tracking-luxury text-white/80 [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
        {/* Phones: just the Ref. Desktop: Ref., zone, city. */}
        Ref. {property.id}
        <span className="hidden md:inline"> · {zonePlace(property.zone, property.city)}</span>
      </p>
      {/* Desktop: one line across the full content width; a longer title ends in "…" (full title on hover). */}
      <h1
        title={property.title}
        className="mt-2 hidden w-full truncate font-display text-5xl font-normal leading-tight tracking-tight drop-shadow-md md:block"
      >
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
          <section className="relative flex h-[60svh] w-full items-center justify-center overflow-hidden bg-neutral-950 text-xs uppercase tracking-luxury text-white/60 sm:h-auto sm:min-h-dvh">
            Fotos próximamente
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-4 z-10 md:bottom-8">
              <div className="mx-auto w-full max-w-[calc(1000px+4rem)] px-6 normal-case tracking-normal md:px-8">{heroOverlay}</div>
            </div>
          </section>
        )}

        {/* Property Info Section */}
        <section className="mx-auto w-full max-w-[calc(1000px+4rem)] px-6 pb-24 pt-8 sm:pb-32 md:px-8 md:pt-32">
          {/* Phones only: title below the slideshow (it overlays the photo from md up). */}
          <header className="mb-12 md:hidden">
            <p className="text-xs uppercase tracking-luxury text-ink-muted dark:text-white/75">{place}</p>
            <h1 className="mt-2 font-display text-3xl font-normal tracking-tight text-ink dark:text-white">
              {property.title}
            </h1>
          </header>

          {/* Description Section */}
          <div className="mb-24">
            <ul className="mb-8 grid max-w-md grid-cols-2 gap-x-6 gap-y-3 text-sm text-ink dark:text-white/90">
              {specs.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2">
                  <Icon className="size-4 text-blue-800 dark:text-blue-100" aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
            <p className="text-xs uppercase tracking-luxury text-ink-muted dark:text-white/75">
              Descripción
            </p>
            <p className="mt-6 text-base leading-relaxed text-ink-muted dark:text-white/75">
              {description}
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
                    <span className="mt-1.5 size-2 rounded-full bg-blue-800 dark:bg-blue-100 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl font-normal tracking-tight text-ink dark:text-white sm:text-3xl">
                Amenities
              </h2>
              <ul className="mt-6 space-y-3">
                {amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-start gap-3 text-base text-ink-muted dark:text-white/75"
                  >
                    <span className="mt-1.5 size-2 rounded-full bg-blue-800 dark:bg-blue-100 flex-shrink-0" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Location */}
          <div className="mb-24">
            <h2 className="font-display text-2xl font-normal tracking-tight text-ink dark:text-white sm:text-3xl">
              Ubicación
            </h2>
            <p className="mt-4 flex items-start gap-3 text-base text-ink-muted dark:text-white/75">
              <MapPin className="mt-1 size-5 shrink-0 text-blue-800 dark:text-blue-100" aria-hidden />
              <span>{property.zone}, Maldonado</span>
            </p>
            <iframe
              title={`Mapa de la zona ${property.zone}`}
              src={`https://maps.google.com/maps?q=${center.lat},${center.lng}&z=13&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="mt-6 aspect-[4/3] w-full border border-hairline sm:aspect-video dark:border-white/10"
            />
            <p className="mt-2 text-xs text-ink-muted dark:text-white/60">
              Ubicación aproximada de la zona.
            </p>
          </div>

          {/* Contact Section */}
          <div className="border-t border-hairline pt-24 dark:border-white/10">
            <h2 className="font-display text-2xl font-normal tracking-tight text-ink dark:text-white sm:text-3xl">
              Costos e información de contacto
            </h2>
            <dl className="mt-8 divide-y divide-hairline border-y border-hairline text-base dark:divide-white/10 dark:border-white/10">
              <div className="flex items-baseline justify-between gap-4 py-4">
                <dt className="text-ink-muted dark:text-white/75">Precio</dt>
                <dd className="font-display text-2xl text-ink dark:text-white">{property.priceText || `US$ ${property.price.toLocaleString("es-UY")}`}</dd>
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

            <AgentCard
              name={config.agency.name}
              logos={brandLogos(config.agency)}
              whatsapp={config.whatsapp.primary.number}
              phone={config.contact.phones[0] ?? ""}
              propertyId={property.id}
              propertyTitle={property.title}
            >
              <PropertyInquiryActions propertyId={property.id} propertyTitle={property.title} />
            </AgentCard>
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
