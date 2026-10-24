"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Building2, Globe, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

const HIGHLIGHTS = [
  { icon: Building2, label: "Transacciones inmobiliarias estratégicas" },
  { icon: Globe, label: "Asesoramiento para inversores internacionales" },
  { icon: KeyRound, label: "Gestión integral de propiedades" },
];

const INTERVAL_MS = 2500;

/** Bullet list that spotlights one item at a time, cycling through all three. */
export function InvestmentsHighlights() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  // `null` on the server: stay static until hydrated, and never cycle under reduced motion.
  const cycling = reduce === false;

  useEffect(() => {
    if (!cycling) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % HIGHLIGHTS.length), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [cycling]);

  return (
    <ul className="divide-y divide-hairline border-y border-hairline dark:divide-white/10 dark:border-white/10">
      {HIGHLIGHTS.map(({ icon: Icon, label }, index) => (
        <li
          key={label}
          className={cn(
            "flex items-center gap-4 py-5 text-lg font-medium text-ink transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none dark:text-white",
            cycling && (index === active ? "translate-x-2 opacity-100" : "opacity-40"),
          )}
        >
          <Icon className="size-5 shrink-0 text-blue-800 dark:text-blue-100" strokeWidth={1.5} aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  );
}
