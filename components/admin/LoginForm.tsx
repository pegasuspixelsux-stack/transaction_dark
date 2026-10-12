"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, ShieldCheck, Briefcase, UserRound } from "lucide-react";
import { useAdmin } from "@/lib/admin/admin-context";
import { DEMO_PASSWORD } from "@/lib/admin/seed";
import { siteConfig } from "@/config/siteConfig";
import { Button, Field, inputClass } from "./ui";

const linkClass =
  "inline-flex min-h-11 items-center text-xs text-white/80 transition-colors duration-200 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@transaction.demo", Icon: ShieldCheck },
  { label: "Manager", email: "manager@transaction.demo", Icon: Briefcase },
  { label: "Agent", email: "agent@transaction.demo", Icon: UserRound },
] as const;

export function LoginForm() {
  const router = useRouter();
  const { status, user, login } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "ready" && user) router.replace("/admin");
  }, [status, user, router]);

  const emailError =
    touched.email && !EMAIL_RE.test(email)
      ? "Ingresa un correo válido."
      : undefined;
  const passwordError =
    touched.password && password.length === 0
      ? "Ingresa tu contraseña."
      : undefined;

  async function attempt(nextEmail: string, nextPassword: string) {
    setBusy(true);
    const result = await login(nextEmail, nextPassword);
    setBusy(false);
    if (!result.ok) setFormError(result.error);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setFormError(null);
    if (!EMAIL_RE.test(email) || password.length === 0) return;
    attempt(email, password);
  }

  return (
    <main className="admin-dark relative flex min-h-dvh w-full overflow-hidden">
      <Image
        src="/images/hero/serena.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Left half: fully transparent, wordmark top-left */}
      <section className="relative z-10 hidden w-1/2 flex-col justify-between p-12 lg:flex">
        <p className="text-sm uppercase tracking-wordmark text-white">
          {siteConfig.agency.name}
        </p>
        <p className="text-xs text-white/70">
          © {new Date().getFullYear()} Pegasus Pixels
        </p>
      </section>

      {/* Right half: 50% black frosted overlay with the form */}
      <section className="relative z-10 flex w-full flex-col items-center justify-center bg-black/50 px-6 py-12 backdrop-blur-sm lg:w-1/2 lg:p-12">
        <p className="mb-10 text-sm uppercase tracking-wordmark text-white lg:hidden">
          {siteConfig.agency.name}
        </p>
        <div data-rise className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="font-display text-3xl font-normal tracking-tight text-white">
              Iniciar <em className="italic">sesión</em>
            </h1>
            <p className="mt-2 text-sm text-white/80">
              Acceso al sistema de gestión
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <Field label="Correo electrónico" error={emailError}>
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  className={inputClass}
                  placeholder="correo@ejemplo.com"
                />
              )}
            </Field>
            <div>
              <Field label="Contraseña" error={passwordError}>
                {({ id, describedBy, invalid }) => (
                  <input
                    id={id}
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    className={inputClass}
                    placeholder="••••••••"
                  />
                )}
              </Field>
              <div className="mt-2 text-right">
                <a href="#" className={linkClass}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            {formError ? (
              <p role="alert" className="text-sm text-admin-bad">
                {formError}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={busy}
            >
              <LogIn className="size-4" aria-hidden />
              Ingresar
            </Button>
          </form>

          {process.env.NODE_ENV !== "production" ? (
            <div className="border-t border-admin-line pt-6">
              <p className="text-xs uppercase tracking-luxury text-admin-ink">
                Cuentas demo
              </p>
              <p className="mt-2 text-sm text-white/80">
                Un clic para ingresar. Contraseña:{" "}
                <code className="text-admin-ink">{DEMO_PASSWORD}</code>
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map(({ label, email: demoEmail, Icon }) => (
                  <Button
                    key={label}
                    disabled={busy}
                    className="flex-col gap-1 px-2 py-3 text-center"
                    onClick={() => {
                      setFormError(null);
                      attempt(demoEmail, DEMO_PASSWORD);
                    }}
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="text-center">
            <Link href="/" className={linkClass}>
              ← Volver al sitio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
