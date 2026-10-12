"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Pencil, Plus, ShieldAlert, UserCheck, UserX } from "lucide-react";
import { useAdmin, type UserInput } from "@/lib/admin/admin-context";
import { ROLE_LABELS } from "@/lib/admin/rbac";
import { formatDate, initials } from "@/lib/admin/utils";
import type { SessionUser, StoredRole } from "@/types/admin";
import { Badge, Button, Field, GlassCard, IconButton, Modal, PageHeader, Spinner, inputClass } from "./ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES: StoredRole[] = ["admin", "manager", "agent"];

function Forbidden() {
  return (
    <div data-rise role="alert" className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <ShieldAlert className="size-10 text-admin-bad" aria-hidden />
      <p className="mt-6 text-xs uppercase tracking-luxury text-admin-bad">Error 403</p>
      <h1 className="mt-2 font-display text-3xl font-normal tracking-tight">Acceso no autorizado</h1>
      <p className="mt-3 text-sm text-admin-muted">
        La gestión de usuarios está limitada a administradores. Si creés que es un error, pedile a un administrador que actualice tu rol.
      </p>
      <Link
        href="/admin"
        className="mt-8 inline-flex min-h-11 items-center rounded-lg border border-admin-line px-5 text-xs uppercase tracking-luxury transition-colors duration-200 hover:bg-admin-panel-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent active:bg-admin-panel"
      >
        Volver al resumen
      </Link>
    </div>
  );
}

function UserForm({
  target,
  onSubmit,
  onCancel,
  serverError,
}: {
  target: SessionUser | null;
  onSubmit: (input: UserInput) => void | Promise<void>;
  onCancel: () => void;
  serverError: string | null;
}) {
  const [fullName, setFullName] = useState(target?.fullName ?? "");
  const [email, setEmail] = useState(target?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StoredRole>(
    target && target.role !== "superadmin" ? target.role : "agent",
  );
  const [active, setActive] = useState(target?.active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: FormEvent) {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (!fullName.trim()) found.fullName = "El nombre completo es obligatorio.";
    if (!EMAIL_RE.test(email)) found.email = "Ingresá un correo válido.";
    if (!target && password.length < 8) found.password = "Usá al menos 8 caracteres.";
    if (target && password && password.length < 8) found.password = "Usá al menos 8 caracteres.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit({ id: target?.id, fullName, email, password: password || undefined, role, active });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="Nombre completo" error={errors.fullName}>
        {({ id, describedBy, invalid }) => (
          <input id={id} autoComplete="off" aria-invalid={invalid} aria-describedby={describedBy} value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
        )}
      </Field>
      <Field label="Correo electrónico" error={errors.email}>
        {({ id, describedBy, invalid }) => (
          <input id={id} type="email" autoComplete="off" aria-invalid={invalid} aria-describedby={describedBy} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        )}
      </Field>
      <Field
        label={target ? "Nueva contraseña" : "Contraseña"}
        error={errors.password}
        hint={target ? "Dejalo vacío para mantener la contraseña actual." : "Mínimo 8 caracteres."}
      >
        {({ id, describedBy, invalid }) => (
          <input id={id} type="password" autoComplete="new-password" aria-invalid={invalid} aria-describedby={describedBy} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        )}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Rol">
          {({ id }) => (
            <select id={id} value={role} onChange={(e) => setRole(e.target.value as StoredRole)} className={inputClass}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Estado">
          {({ id }) => (
            <select id={id} value={active ? "active" : "inactive"} onChange={(e) => setActive(e.target.value === "active")} className={inputClass}>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          )}
        </Field>
      </div>
      {serverError ? <p role="alert" className="text-sm text-admin-bad">{serverError}</p> : null}
      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <Button onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary">{target ? "Guardar cambios" : "Agregar usuario"}</Button>
      </div>
    </form>
  );
}

export function UsersManager() {
  const { status, user, users, can, saveUser, setUserActive } = useAdmin();
  const [editing, setEditing] = useState<SessionUser | "new" | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (status === "loading" || !user) return <Spinner />;
  if (!can("users:manage")) return <Forbidden />;

  return (
    <div data-rise>
      <PageHeader
        eyebrow="Equipo"
        title="Gestión de usuarios"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setServerError(null);
              setEditing("new");
            }}
          >
            <Plus className="size-4" aria-hidden /> Agregar usuario
          </Button>
        }
      />

      <div aria-live="polite" className="min-h-6">
        {notice ? <p className="mb-4 text-sm text-admin-bad">{notice}</p> : null}
      </div>

      <GlassCard className="overflow-x-auto">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead>
            <tr className="border-b border-admin-line text-xs uppercase tracking-luxury text-admin-ink">
              <th scope="col" className="px-5 py-4 font-normal">Usuario</th>
              <th scope="col" className="px-5 py-4 font-normal">Rol</th>
              <th scope="col" className="px-5 py-4 font-normal">Estado</th>
              <th scope="col" className="px-5 py-4 font-normal">Último acceso</th>
              <th scope="col" className="px-5 py-4"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-line">
            {users.map((u) => (
              <tr key={u.id} className="transition-colors duration-200 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full border border-admin-line bg-admin-panel-strong text-xs tracking-luxury">
                      {initials(u.fullName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-admin-ink">
                        {u.fullName}
                        {u.id === user.id ? <span className="text-admin-muted"> (vos)</span> : null}
                      </p>
                      <p className="truncate text-admin-muted">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Badge tone={u.role === "admin" ? "accent" : "neutral"}>{ROLE_LABELS[u.role]}</Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge tone={u.active ? "ok" : "bad"}>{u.active ? "Activo" : "Inactivo"}</Badge>
                </td>
                <td className="px-5 py-3 text-admin-muted">{formatDate(u.lastLogin, true)}</td>
                <td className="px-2 py-1">
                  <div className="flex">
                    <IconButton
                      label={`Editar a ${u.fullName}`}
                      onClick={() => {
                        setServerError(null);
                        setEditing(u);
                      }}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </IconButton>
                    <IconButton
                      label={u.active ? `Desactivar a ${u.fullName}` : `Activar a ${u.fullName}`}
                      disabled={u.id === user.id}
                      onClick={async () => {
                        const result = await setUserActive(u.id, !u.active);
                        setNotice(result.ok ? null : result.error);
                      }}
                    >
                      {u.active ? <UserX className="size-4" aria-hidden /> : <UserCheck className="size-4" aria-hidden />}
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Agregar usuario" : "Editar usuario"}
      >
        {editing !== null ? (
          <UserForm
            target={editing === "new" ? null : editing}
            serverError={serverError}
            onCancel={() => setEditing(null)}
            onSubmit={async (input) => {
              const result = await saveUser(input);
              if (result.ok) {
                setEditing(null);
                setNotice(null);
              } else {
                setServerError(result.error);
              }
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
