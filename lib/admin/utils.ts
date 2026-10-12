import type { Currency } from "@/types/admin";

const digits = (phone: string) => phone.replace(/\D/g, "");

export const whatsappLink = (phone: string, message?: string) =>
  `https://wa.me/${digits(phone)}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const telLink = (phone: string) => `tel:+${digits(phone)}`;

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function formatDate(iso: string | null, withTime = false): string {
  if (!iso) return "Never";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(iso));
}

export function formatMoney(value: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Local `YYYY-MM-DD` for comparing against `<input type="date">` values. */
export function toDateKey(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
