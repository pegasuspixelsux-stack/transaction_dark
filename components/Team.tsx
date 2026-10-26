import { Lock, Camera, Scale } from "lucide-react";

const SERVICES: { title: string; description: string; icon: React.ReactNode }[] = [
  {
    title: "Discreción y confidencialidad",
    description:
      "Resguardamos la información de nuestros clientes y gestionamos cada operación con la debida confidencialidad.",
    icon: <Lock size={24} />,
  },
  {
    title: "Tasación y fotografía profesional",
    description:
      "Ofrecemos tasaciones de terrenos y fotografía profesional sin costo adicional para nuestros clientes, como parte de nuestro servicio inmobiliario.",
    icon: <Camera size={24} />,
  },
];

const LEGAL_ADVISORS = ["Escribano", "Contador", "Abogado", "Agrimensor"];

export function Team() {
  return (
    <section className="bg-surface-raised">
      <div className="container-page py-24 sm:py-32">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs uppercase tracking-luxury text-ink-muted">Nosotros</p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-4xl">
            Quiénes somos
          </h2>
          <div className="mt-6 max-w-md space-y-4 text-base leading-relaxed text-ink-muted">
            <p>
              Detrás de cada operación inmobiliaria hay decisiones, expectativas y
              proyectos personales. Entender ese contexto es parte fundamental de
              nuestro trabajo.
            </p>
            <p>
              En Transaction buscamos aportar una perspectiva integral del negocio
              inmobiliario, combinando conocimiento del mercado local, análisis y
              atención a los detalles que pueden marcar una diferencia en cada
              operación.
            </p>
            <p>
              Nuestra forma de trabajar se basa en la información, la planificación
              y el cuidado de cada etapa, con el objetivo de que nuestros clientes
              cuenten con elementos claros para tomar sus decisiones.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          {SERVICES.map((service) => (
            <div key={service.title} className="flex flex-col gap-4 border border-hairline p-6 dark:border-white/10">
              <div className="text-blue-800 dark:text-blue-100">
                {service.icon}
              </div>
              <div>
                <h3 className="font-display text-lg font-normal tracking-tight">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-white/75">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
          <div className="flex flex-col sm:col-span-2 gap-4 border border-hairline p-6 dark:border-white/10">
            <div className="text-blue-800 dark:text-blue-100">
              <Scale size={24} />
            </div>
            <div>
              <h3 className="font-display text-lg font-normal tracking-tight">
                Asesoramiento profesional
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-white/75">
                Contamos con asesoramiento de profesionales especializados para acompañar las distintas etapas de cada operación.
              </p>
              <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-ink dark:text-white/90">
                {LEGAL_ADVISORS.map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
