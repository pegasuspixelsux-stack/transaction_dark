"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export interface DonutSlice {
  key: string;
  label: string;
  value: number;
  /** Fill for the slice and its legend swatch. Text never uses it. */
  color: string;
}

const SIZE = 176;
const STROKE = 26;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
/** Surface-colored gap between slices, in px along the ring. */
const GAP = 2;

const pct = (value: number, total: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

/**
 * Donut with a legend that doubles as the data table (label, count, share), so
 * identity never rests on color alone. Hovering or focusing a slice or legend
 * row shows its figures in the centre.
 */
export function DonutChart({
  slices,
  totalLabel,
  emptyText,
}: {
  slices: DonutSlice[];
  /** Caption under the total in the centre, e.g. "propiedades". */
  totalLabel: string;
  emptyText: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const titleId = useId();
  const visible = slices.filter((s) => s.value > 0);
  const total = visible.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) return <p className="mt-4 text-callout text-admin-muted">{emptyText}</p>;

  const current = visible.find((s) => s.key === active) ?? null;
  const gap = visible.length > 1 ? GAP : 0;
  // Where each slice starts along the ring (cumulative share of the circumference).
  const starts = visible.map((_, i) => visible.slice(0, i).reduce((sum, s) => sum + (s.value / total) * C, 0));

  return (
    <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-labelledby={titleId}
          className="-rotate-90"
        >
          <title id={titleId}>
            {visible.map((s) => `${s.label}: ${s.value} (${pct(s.value, total)}%)`).join(", ")}
          </title>
          {visible.map((s, i) => {
            const dash = Math.max((s.value / total) * C - gap, 0.001);
            return (
              <circle
                key={s.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE}
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-starts[i]}
                onMouseEnter={() => setActive(s.key)}
                onMouseLeave={() => setActive(null)}
                className={cn(
                  "cursor-default transition-opacity duration-150",
                  active && active !== s.key && "opacity-35",
                )}
              />
            );
          })}
        </svg>
        <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <span className="text-title-1 tabular-nums">{current ? current.value : total}</span>
          <span className="mt-0.5 line-clamp-2 text-footnote text-admin-muted">
            {current ? `${current.label} · ${pct(current.value, total)}%` : totalLabel}
          </span>
        </div>
      </div>

      {/* Every category is listed, including those at 0, so none silently disappear. */}
      <ul className="w-full min-w-0 flex-1 space-y-0.5">
        {slices.map((s) => (
          <li
            key={s.key}
            tabIndex={0}
            onMouseEnter={() => setActive(s.key)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(s.key)}
            onBlur={() => setActive(null)}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-2 text-callout transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent",
              active === s.key && "bg-admin-panel-strong",
            )}
          >
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-full"
              style={s.value > 0 ? { background: s.color } : { boxShadow: `inset 0 0 0 1.5px ${s.color}` }}
            />
            <span className="min-w-0 flex-1 truncate text-admin-ink">{s.label}</span>
            <span className="tabular-nums text-admin-ink">{s.value}</span>
            <span className="w-11 text-right tabular-nums text-admin-muted">{pct(s.value, total)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
