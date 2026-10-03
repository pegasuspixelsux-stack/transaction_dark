import { Lock, Users, Zap, Award } from "lucide-react";

const SERVICES: { title: string; description: string; icon: React.ReactNode }[] = [
  {
    title: "Discreción garantizada",
    description: "Mantenemos la confidencialidad de nuestros clientes y transacciones con estrictos protocolos de privacidad.",
    icon: <Lock size={24} />,
  },
  {
    title: "Equipo dedicado",
    description: "Profesionales locales con profundo conocimiento de Punta del Este y experiencia en operaciones de lujo.",
    icon: <Users size={24} />,
  },
  {
    title: "Proceso eficiente",
    description: "De la primera visita a la escritura, acompañamos cada paso con rapidez y profesionalismo.",
    icon: <Zap size={24} />,
  },
  {
    title: "Excelencia reconocida",
    description: "Años de experiencia y referencias que hablan por nosotros en el mercado de propiedades premium.",
    icon: <Award size={24} />,
  },
];

export function Team() {
  return (
    <section className="container-page py-24 sm:py-32">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs uppercase tracking-luxury text-ink-muted">Nosotros</p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-tight sm:text-4xl">
            Quiénes somos
          </h2>
          <div className="mt-6 max-w-md space-y-4 text-base leading-relaxed text-ink-muted">
            <p>
              Transaction nació de una idea simple: comprar o vender una casa en la
              costa debería sentirse como una conversación entre conocidos, no
              como una transacción. Somos un equipo reducido de asesores con
              raíces en Punta del Este.
            </p>
            <p>
              Conocemos cada calle, cada playa y cada casa que representamos.
              Muchas de nuestras propiedades nunca llegan a publicarse: circulan
              entre un grupo acotado de compradores que confían en nuestro
              criterio y en nuestra discreción.
            </p>
            <p>
              Trabajamos con un número limitado de clientes por temporada para
              acompañar cada operación de principio a fin — desde la primera
              visita hasta la escritura, y también en todo lo que viene después.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:gap-8">
          {SERVICES.map((service) => (
            <div key={service.title} className="flex flex-col gap-4 border border-hairline p-6 dark:border-white/10">
              <div className="text-blue-400 dark:text-blue-400">
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
        </div>
      </div>
    </section>
  );
}
