import { Star, Users, Globe } from "lucide-react";

const propositions = [
  {
    icon: Star,
    title: "Propiedades Exclusivas",
    description: "Selección curada de propiedades premium disponibles solo para nuestros clientes",
  },
  {
    icon: Users,
    title: "Concierge Privado",
    description: "Servicio dedicado de atención personalizada para tu búsqueda de propiedades",
  },
  {
    icon: Globe,
    title: "Alcance Global",
    description: "Experiencia internacional en bienes raíces de lujo frente al mar",
  },
];

export function ValuePropositions() {
  return (
    <section className="container-page py-12 sm:py-16">
      <div className="grid gap-8 grid-cols-3 sm:gap-12">
        {propositions.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col gap-5 sm:gap-5">
            <Icon className="size-8 text-blue-400 dark:text-blue-400" strokeWidth={1.5} />
            <div>
              <h3 className="text-sm sm:text-lg font-medium text-ink dark:text-white">{title}</h3>
              <p className="mt-2 text-xs sm:text-base leading-relaxed text-ink-muted dark:text-white/75">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
