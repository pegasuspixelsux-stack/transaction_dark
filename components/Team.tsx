import Image from "next/image";

const pimg = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`;

const TEAM: { name: string; role: string; image: string }[] = [
  { name: "Valentina Rocha", role: "Dirección", image: pimg("1494790108377-be9c29b29330") },
  { name: "Mateo Duarte", role: "Ventas · José Ignacio", image: pimg("1500648767791-00dcc994a43e") },
  { name: "Sofía Beltrán", role: "Ventas · La Barra", image: pimg("1438761681033-6461ffad8d80") },
  { name: "Joaquín Vidal", role: "Arquitectura", image: pimg("1507003211169-0a1dd7228f2d") },
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
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-muted">
            Un equipo reducido de asesores con raíces en Punta del Este. Conocemos
            cada calle, cada playa y cada casa que representamos — y trabajamos con
            un número acotado de clientes por temporada.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6">
          {TEAM.map((member) => (
            <figure key={member.name} className="flex flex-col">
              <div className="relative aspect-[4/5] overflow-hidden border border-hairline bg-mist/20">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(min-width: 1024px) 20vw, 45vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3">
                <p className="font-display text-lg font-normal tracking-tight">
                  {member.name}
                </p>
                <p className="mt-0.5 text-xs uppercase tracking-luxury text-ink-muted">
                  {member.role}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
