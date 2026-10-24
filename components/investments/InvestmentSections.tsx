"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  Building2,
  Compass,
  FileSignature,
  Handshake,
  KeyRound,
  LineChart,
  Scale,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const card =
  "rounded-xl border border-hairline bg-surface-raised/60 backdrop-blur-md transition-[border-color,box-shadow] duration-200 hover:border-ink/30 hover:shadow-[0_0_32px_-4px_rgba(30,64,175,0.35)] dark:border-white/10 dark:bg-neutral-900/40 dark:hover:border-white/20 dark:hover:shadow-[0_0_32px_-4px_rgba(219,234,254,0.28)]";

const TRANSACTIONS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Building2,
    title: "Adquisición en Pozo y Pre-lanzamientos",
    description:
      "Negociación directa con desarrolladores líderes para asegurar precios de entrada preferenciales y maximizar la plusvalía durante la fase de obra.",
  },
  {
    icon: Handshake,
    title: "Compraventa de Activos Estabilizados",
    description:
      "Propiedades terminadas en ubicaciones clave (Península, Playa Brava, Playa Mansa, La Barra, José Ignacio) listas para generar flujo de caja inmediato mediante renta de temporada o anual.",
  },
  {
    icon: Compass,
    title: "Oportunidades Off-Market",
    description:
      "Acceso exclusivo a propiedades y terrenos fuera del mercado público, seleccionados bajo estrictos criterios de valoración y potencial de retorno.",
  },
  {
    icon: FileSignature,
    title: "Estructuración y Cierre",
    description:
      "Asistencia en la firma de compromisos, canalización de fondos internacionales y coordinación con escribanías y estudios jurídicos de primer nivel en Maldonado y Montevideo.",
  },
];

const SERVICES: {
  icon: LucideIcon;
  title: string;
  items: { label: string; text: string }[];
}[] = [
  {
    icon: LineChart,
    title: "Asesoramiento y Selección Basada en Rendimiento",
    items: [
      {
        label: "Renta Anual vs. Renta Temporal/Vacacional",
        text: "Analizamos y proyectamos el retorno real (Net Yield) según la tipología del activo y la zona.",
      },
      {
        label: "Estrategia de Apreciación de Capital",
        text: "Identificación de micro-zonas con proyección de desarrollo urbano para reventa a mediano/largo plazo.",
      },
      {
        label: "Modelado Financiero",
        text: "Estimación clara de ingresos brutos, costos operativos, impuestos locales y tasa neta de retorno esperada.",
      },
    ],
  },
  {
    icon: Wrench,
    title: "Gestión Integral de Propiedades (Property Management)",
    items: [
      {
        label: "Estrategia “Hands-Off”",
        text: "Administramos su propiedad de principio a fin para que reciba sus ingresos sin requerir presencia física en el país.",
      },
      {
        label: "Gestión de Inquilinos y Contratos",
        text: "Selección y calificación rigurosa de arrendatarios, cobro de alquileres y supervisión del cumplimiento contractual.",
      },
      {
        label: "Mantenimiento y Conservación",
        text: "Inspección periódica y mantenimiento preventivo para preservar el valor del activo a lo largo del tiempo.",
      },
    ],
  },
  {
    icon: Scale,
    title: "Acompañamiento Legal, Fiscal y Residencia",
    items: [
      {
        label: "Navegación del Marco Regulatorio",
        text: "Guía completa sobre convenios de doble imposición, exoneraciones fiscales (como la Ley de Vivienda Promovida cuando aplica) y estructuración de vehículos societarios.",
      },
      {
        label: "Radicación y Residencia Fiscal",
        text: "Asesoramiento integral para inversores que buscan tramitar su residencia fiscal o legal en Uruguay.",
      },
    ],
  },
];

const HIGHLIGHTS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ShieldCheck,
    title: "Asesoramiento Independiente",
    text: "Nos enfocamos en la métrica financiera del activo y su adecuación al perfil del inversor, no en vender inventario genérico.",
  },
  {
    icon: LineChart,
    title: "Retornos Proyectados Claros",
    text: "Proyecciones realistas basadas en datos históricos del mercado de Maldonado y Punta del Este.",
  },
  {
    icon: KeyRound,
    title: "Gestión 100% “Key-in-Hand”",
    text: "Desde el giro de divisas y la compra, hasta la puesta en alquiler, recaudación mensual e informe de rendimientos.",
  },
];

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};

/** Scroll-triggered stagger group; renders static output under reduced motion. */
function Reveal({
  className,
  children,
  as = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "div" | "ul";
}) {
  const reduce = useReducedMotion();
  const Tag = as === "ul" ? motion.ul : motion.div;
  if (reduce) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag
      className={className}
      variants={group}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </Tag>
  );
}

function Item({
  className,
  children,
  as = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const Tag = as === "li" ? motion.li : motion.div;
  return (
    <Tag className={className} variants={reduce ? undefined : item}>
      {children}
    </Tag>
  );
}

function SectionHeader({
  id,
  tag,
  title,
  lead,
  body,
  split = false,
}: {
  id: string;
  tag: string;
  title: string;
  lead: string;
  body: string;
  /** Two columns on lg: heading left, supporting text right. */
  split?: boolean;
}) {
  const heading = (
    <>
      <Item>
        <span className="inline-block rounded-full border border-hairline px-4 py-1.5 text-xs uppercase tracking-luxury text-ink-muted dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
          {tag}
        </span>
      </Item>
      <Item>
        <h2
          id={id}
          className="mt-6 font-display text-3xl font-normal tracking-tight text-ink sm:text-4xl lg:text-5xl dark:text-white"
        >
          {title}
        </h2>
      </Item>
    </>
  );
  const support = (
    <>
      <Item>
        <p className="font-display text-lg italic leading-relaxed text-ink sm:text-xl dark:text-white/90">
          {lead}
        </p>
      </Item>
      <Item>
        <p className="mt-5 max-w-prose text-base font-light leading-relaxed text-ink-muted dark:text-neutral-400">
          {body}
        </p>
      </Item>
    </>
  );
  if (split) {
    return (
      <Reveal className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
        <div>{heading}</div>
        <div className="lg:pt-14">{support}</div>
      </Reveal>
    );
  }
  return (
    <Reveal className="max-w-3xl">
      {heading}
      <Item className="mt-5">{support}</Item>
    </Reveal>
  );
}

export function StrategicTransactions() {
  return (
    <section
      id="transacciones"
      aria-labelledby="transacciones-title"
      className="scroll-mt-24 bg-surface dark:bg-neutral-950"
    >
      <div className="container-page py-24 sm:py-32">
        <SectionHeader
          id="transacciones-title"
          tag="Transacciones"
          title="Transacciones Inmobiliarias Estratégicas"
          split
          lead="Estructuración y ejecución de operaciones con foco en preservación y crecimiento de capital."
          body="En Transaction, gestionamos el ciclo completo de la transacción para inversores individuales e institucionales. Nos especializamos en la adquisición y enajenación de activos inmobiliarios residenciales y comerciales en la costa esteña, garantizando la máxima eficiencia operativa, transparencia fiscal y seguridad jurídica."
        />
        <Reveal className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
          {TRANSACTIONS.map(({ icon: Icon, title, description }) => (
            <Item key={title} className={`${card} p-6 sm:p-8`}>
              <Icon className="size-6 text-blue-800 dark:text-neutral-300" strokeWidth={1.5} aria-hidden />
              <h3 className="mt-5 font-display text-xl font-normal tracking-tight text-ink dark:text-white">
                {title}
              </h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-ink-muted dark:text-neutral-400">
                {description}
              </p>
            </Item>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function InternationalInvestment() {
  return (
    <section
      id="inversores-internacionales"
      aria-labelledby="internacional-title"
      className="scroll-mt-24 border-y border-hairline bg-surface-raised dark:border-white/10 dark:bg-neutral-900"
    >
      <div className="container-page py-24 sm:py-32">
        <SectionHeader
          id="internacional-title"
          tag="Inversores Internacionales"
          title="Inversión Internacional & Maximización de Retorno (ROI)"
          split
          lead="Asesoramiento experto para convertir el capital extranjero en rendimientos sólidos y previsibles en Uruguay."
          body="Uruguay ofrece un marco de estabilidad política, seguridad jurídica y libertad de repatriación de capitales único en la región. Diseñamos soluciones a medida para inversores internacionales que buscan diversificar su patrimonio mediante activos inmobiliarios con retorno en dólares (USD)."
        />

        <Reveal className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, items }, i) => (
            <Item key={title} className={`${card} flex flex-col p-6 sm:p-8`}>
              <div className="flex items-center justify-between">
                <Icon className="size-6 text-blue-800 dark:text-neutral-300" strokeWidth={1.5} aria-hidden />
                <span className="text-xs tracking-luxury text-ink-muted dark:text-neutral-500" aria-hidden>
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-display text-xl font-normal tracking-tight text-ink dark:text-white">
                {title}
              </h3>
              <ul className="mt-6 flex flex-col gap-5 border-t border-hairline pt-6 dark:border-white/10">
                {items.map(({ label, text }) => (
                  <li key={label} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-2 size-1 shrink-0 rounded-full bg-blue-800 dark:bg-neutral-400"
                    />
                    <p className="text-sm font-light leading-relaxed text-ink-muted dark:text-neutral-400">
                      <span className="font-normal text-ink dark:text-white">{label}:</span> {text}
                    </p>
                  </li>
                ))}
              </ul>
            </Item>
          ))}
        </Reveal>

        <Reveal className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <Item key={title} className={`${card} p-6`}>
              <Icon className="size-5 text-blue-800 dark:text-neutral-300" strokeWidth={1.5} aria-hidden />
              <h3 className="mt-4 text-sm uppercase tracking-luxury text-ink dark:text-white">{title}</h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-ink-muted dark:text-neutral-400">
                {text}
              </p>
            </Item>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/** Both investor-facing sections for the /inversiones page. */
export function InvestmentSections() {
  return (
    <>
      <StrategicTransactions />
      <InternationalInvestment />
    </>
  );
}
