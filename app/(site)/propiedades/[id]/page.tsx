import { notFound } from "next/navigation";
import { Mail, MessageCircle, Bed, Bath, Ruler, Calendar } from "lucide-react";
import { properties } from "@/lib/properties";
import { propertyTypeLabel } from "@/lib/properties";
import { PropertySlideshow } from "@/components/PropertySlideshow";
import { ContactForm } from "@/components/ContactForm";
import { SiteFooter } from "@/components/SiteFooter";
import { AGenteConcierge } from "@/components/AGenteConcierge";

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = properties.find((p) => p.id === id);

  if (!property) {
    notFound();
  }

  const images = property.images || [property.imageUrl];
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

  const stats = [
    { label: "Dormitorios", value: property.bedrooms, icon: Bed },
    { label: "Baños", value: bathrooms, icon: Bath },
    { label: "Área", value: `${area}m²`, icon: Ruler },
    { label: "Año de construcción", value: yearBuilt, icon: Calendar },
  ];

  return (
    <>
      <main className="min-h-full">
        {/* Hero Slideshow */}
        <PropertySlideshow images={images} title={property.title} />

        {/* Property Info Section */}
        <section className="container-page py-24 sm:py-32">
          {/* Important Stats */}
          <div className="mb-24">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex flex-col gap-3">
                    <Icon className="size-6 text-blue-400" />
                    <div>
                      <p className="text-sm text-ink-muted dark:text-white/75">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-xl font-display font-normal dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description Section */}
          <div className="mb-24 max-w-2xl">
            <p className="text-xs uppercase tracking-luxury text-ink-muted dark:text-white/75">
              Descripción
            </p>
            <h1 className="mt-3 font-display text-3xl font-normal tracking-tight text-ink dark:text-white sm:text-4xl">
              {property.title}
            </h1>
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
                    <span className="mt-1.5 size-2 rounded-full bg-blue-400 flex-shrink-0" />
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
                    <span className="mt-1.5 size-2 rounded-full bg-blue-400 flex-shrink-0" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Section */}
          <div className="border-t border-hairline pt-24 dark:border-white/10">
            <h2 className="font-display text-2xl font-normal tracking-tight text-ink dark:text-white sm:text-3xl">
              Información de contacto
            </h2>
            <p className="mt-3 text-base text-ink-muted dark:text-white/75">
              Precio: <span className="font-display text-2xl text-ink dark:text-white">US$ {property.price.toLocaleString()}</span>
            </p>

            <div className="mt-8 flex gap-4">
              <a
                href={`mailto:hola@transaction.uy?subject=${encodeURIComponent(`Consulta sobre ${property.title}`)}`}
                className="inline-flex items-center gap-2 border border-blue-400 px-6 py-3 text-sm uppercase tracking-luxury text-blue-400 transition-colors hover:bg-blue-400 hover:text-white dark:border-blue-400"
              >
                <Mail size={18} />
                Email
              </a>
              <a
                href="https://wa.me/59842771234"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-blue-400 px-6 py-3 text-sm uppercase tracking-luxury text-blue-400 transition-colors hover:bg-blue-400 hover:text-white dark:border-blue-400"
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <AGenteConcierge />
    </>
  );
}
