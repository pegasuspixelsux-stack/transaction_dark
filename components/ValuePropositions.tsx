import { Star, Users, Globe } from "lucide-react";

const propositions = [
  {
    icon: Star,
    title: "Mirada local",
    description: "Analizamos cada propiedad según su ubicación, entorno y potencial.",
  },
  {
    icon: Users,
    title: "Presentación cuidada",
    description: "Recursos visuales de calidad en fotografía y diseño.",
  },
  {
    icon: Globe,
    title: "Acompañamiento profesional",
    description: "Información y asesoramiento para avanzar con seguridad en cada etapa de la operación.",
  },
];

export function ValuePropositions() {
  return (
    <section className="bg-surface-raised">
      <div className="container-page py-12 sm:py-16">
      <div className="grid gap-8 grid-cols-3 sm:gap-12">
        {propositions.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col gap-5 sm:gap-5">
            <Icon className="size-8 text-blue-800 dark:text-blue-100" strokeWidth={1.5} />
            <div>
              <h3 className="text-sm sm:text-lg font-medium text-ink dark:text-white">{title}</h3>
              <p className="mt-2 hidden text-xs sm:block sm:text-base leading-relaxed text-ink-muted dark:text-white/75">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
