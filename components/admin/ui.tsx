"use client";

import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-xs uppercase tracking-luxury transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent disabled:cursor-not-allowed disabled:opacity-40";

const buttonVariants = {
  primary:
    "bg-admin-accent text-admin-accent-ink hover:bg-admin-accent-hover active:bg-admin-muted",
  ghost:
    "border border-admin-line text-admin-ink hover:bg-admin-panel-strong active:bg-admin-panel",
  danger:
    "border border-admin-bad/40 text-admin-bad hover:bg-admin-bad/10 active:bg-admin-bad/20",
} as const;

export function Button({
  variant = "ghost",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
}) {
  return (
    <button
      type={type}
      className={cn(buttonBase, buttonVariants[variant], className)}
      {...props}
    />
  );
}

export function IconButton({
  label,
  className,
  type = "button",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-admin-muted transition-colors duration-200 hover:bg-admin-panel-strong hover:text-admin-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent active:bg-admin-panel disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

export function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-admin-line bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-luxury text-admin-accent">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-normal tracking-tight sm:text-4xl">
          {title}
        </h1>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}

const badgeTones = {
  neutral: "border-admin-line text-admin-muted",
  accent: "border-admin-accent/40 text-admin-accent",
  ok: "border-admin-ok/40 text-admin-ok",
  warn: "border-admin-warn/40 text-admin-warn",
  bad: "border-admin-bad/40 text-admin-bad",
} as const;

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof badgeTones;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs uppercase tracking-luxury",
        badgeTones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-admin-line px-6 py-16 text-center">
      <h2 className="font-display text-2xl font-normal tracking-tight">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-sm text-admin-muted">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Spinner({ label = "Cargando" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-24">
      <span
        aria-hidden
        className="size-5 animate-spin rounded-full border border-admin-line border-t-admin-accent motion-reduce:animate-none"
      />
      <span className="text-sm text-admin-muted">{label}…</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */

export const inputClass =
  "min-h-11 w-full rounded-lg border border-admin-line bg-admin-field px-4 text-sm text-admin-ink transition-colors duration-200 placeholder:text-admin-muted hover:border-slate-400 focus-visible:border-admin-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-admin-bad";

export function Field({
  label,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  /** Receives the generated ids so the control is wired for a11y. */
  children: (ids: {
    id: string;
    describedBy: string | undefined;
    invalid: boolean;
  }) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const describedBy = error || hint ? `${id}-desc` : undefined;
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-2 block text-xs uppercase tracking-luxury text-admin-ink"
      >
        {label}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={describedBy} role="alert" className="mt-2 text-sm text-admin-bad">
          {error}
        </p>
      ) : hint ? (
        <p id={describedBy} className="mt-2 text-sm text-admin-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal (native <dialog>: focus trap, Esc and backdrop come for free) */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // Padding lives on the inner div, so a click on the dialog itself
        // is a click on the backdrop.
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "m-auto max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl border border-admin-line bg-white p-0 text-admin-ink",
        wide ? "max-w-3xl" : "max-w-lg",
      )}
    >
      {open ? (
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <h2
              id={titleId}
              className="font-display text-2xl font-normal tracking-tight"
            >
              {title}
            </h2>
            <IconButton label="Cerrar diálogo" onClick={onClose} className="-mr-2 -mt-2">
              <X className="size-5" aria-hidden />
            </IconButton>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-admin-muted">{body}</p>
      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
