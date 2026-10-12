"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { LogIn, Mail } from "lucide-react";
import { useAdmin } from "@/lib/admin/admin-context";
import { getFirebaseAuth } from "@/lib/firebase";
import { siteConfig } from "@/config/siteConfig";
import { Button, Field, inputClass } from "./ui";

const linkClass =
  "inline-flex min-h-11 items-center text-xs text-white/80 transition-colors duration-200 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const router = useRouter();
  const { status, user, login } = useAdmin();
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setFormError(null);
    if (!EMAIL_RE.test(email) || password.length === 0) return;
    setBusy(true);
    const result = await login(email, password);
    setBusy(false);
    if (!result.ok) setFormError(result.error);
  }

  async function onReset(e: FormEvent) {
    e.preventDefault();
    setTouched((t) => ({ ...t, email: true }));
    setFormError(null);
    if (!EMAIL_RE.test(email)) return;
    const auth = getFirebaseAuth();
    if (!auth) {
      setFormError("La recuperación de contraseña no está configurada.");
      return;
    }
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "auth/too-many-requests") {
        setFormError("Demasiados intentos. Probá de nuevo en unos minutos.");
        setBusy(false);
        return;
      }
      // Unknown email etc.: stay silent so accounts can't be enumerated.
    }
    setBusy(false);
    setResetSent(true);
  }

  function switchMode(next: "login" | "reset") {
    setMode(next);
    setFormError(null);
    setResetSent(false);
  }

  const emailField = (
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
  );

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
          {mode === "login" ? (
            <>
              <div className="text-center">
                <h1 className="font-display text-3xl font-normal tracking-tight text-white">
                  Iniciar <em className="italic">sesión</em>
                </h1>
                <p className="mt-2 text-sm text-white/80">
                  Acceso al sistema de gestión
                </p>
              </div>

              <form onSubmit={onSubmit} noValidate className="space-y-5">
                {emailField}
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
                        onBlur={() =>
                          setTouched((t) => ({ ...t, password: true }))
                        }
                        className={inputClass}
                        placeholder="••••••••"
                      />
                    )}
                  </Field>
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      className={linkClass}
                      onClick={() => switchMode("reset")}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
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
                  {busy ? "Ingresando…" : "Ingresar"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center">
                <h1 className="font-display text-3xl font-normal tracking-tight text-white">
                  Recuperar <em className="italic">contraseña</em>
                </h1>
                <p className="mt-2 text-sm text-white/80">
                  Te enviaremos un enlace para crear una nueva.
                </p>
              </div>

              {resetSent ? (
                <p role="status" className="text-center text-sm text-white">
                  Si existe una cuenta con ese correo, te enviamos un mensaje
                  con el enlace. Revisá también la carpeta de spam.
                </p>
              ) : (
                <form onSubmit={onReset} noValidate className="space-y-5">
                  {emailField}
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
                    <Mail className="size-4" aria-hidden />
                    {busy ? "Enviando…" : "Enviar enlace"}
                  </Button>
                </form>
              )}

              <div className="text-center">
                <button
                  type="button"
                  className={linkClass}
                  onClick={() => switchMode("login")}
                >
                  ← Volver a iniciar sesión
                </button>
              </div>
            </>
          )}

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
