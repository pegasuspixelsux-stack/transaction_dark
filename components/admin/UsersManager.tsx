"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Pencil, Plus, ShieldAlert, UserCheck, UserX } from "lucide-react";
import { useAdmin, type UserInput } from "@/lib/admin/admin-context";
import { ROLE_LABELS } from "@/lib/admin/rbac";
import { formatDate, initials } from "@/lib/admin/utils";
import type { Role, SessionUser } from "@/types/admin";
import { Badge, Button, Field, GlassCard, IconButton, Modal, PageHeader, Spinner, inputClass } from "./ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES: Role[] = ["admin", "manager", "agent"];

function Forbidden() {
  return (
    <div data-rise role="alert" className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <ShieldAlert className="size-10 text-admin-bad" aria-hidden />
      <p className="mt-6 text-xs uppercase tracking-luxury text-admin-bad">Error 403</p>
      <h1 className="mt-2 font-display text-3xl font-normal tracking-tight">Unauthorized access</h1>
      <p className="mt-3 text-sm text-admin-muted">
        User management is limited to administrators. If you think this is a mistake, ask an admin to update your role.
      </p>
      <Link
        href="/admin"
        className="mt-8 inline-flex min-h-11 items-center rounded-lg border border-admin-line px-5 text-xs uppercase tracking-luxury transition-colors duration-200 hover:bg-admin-panel-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent active:bg-admin-panel"
      >
        Back to overview
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
  onSubmit: (input: UserInput) => void;
  onCancel: () => void;
  serverError: string | null;
}) {
  const [fullName, setFullName] = useState(target?.fullName ?? "");
  const [email, setEmail] = useState(target?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(target?.role ?? "agent");
  const [active, setActive] = useState(target?.active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: FormEvent) {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (!fullName.trim()) found.fullName = "Full name is required.";
    if (!EMAIL_RE.test(email)) found.email = "Enter a valid email address.";
    if (!target && password.length < 8) found.password = "Use at least 8 characters.";
    if (target && password && password.length < 8) found.password = "Use at least 8 characters.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSubmit({ id: target?.id, fullName, email, password: password || undefined, role, active });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="Full name" error={errors.fullName}>
        {({ id, describedBy, invalid }) => (
          <input id={id} autoComplete="off" aria-invalid={invalid} aria-describedby={describedBy} value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
        )}
      </Field>
      <Field label="Email" error={errors.email}>
        {({ id, describedBy, invalid }) => (
          <input id={id} type="email" autoComplete="off" aria-invalid={invalid} aria-describedby={describedBy} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        )}
      </Field>
      <Field
        label={target ? "New password" : "Password"}
        error={errors.password}
        hint={target ? "Leave blank to keep the current password." : "Minimum 8 characters."}
      >
        {({ id, describedBy, invalid }) => (
          <input id={id} type="password" autoComplete="new-password" aria-invalid={invalid} aria-describedby={describedBy} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        )}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Role">
          {({ id }) => (
            <select id={id} value={role} onChange={(e) => setRole(e.target.value as Role)} className={inputClass}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Status">
          {({ id }) => (
            <select id={id} value={active ? "active" : "inactive"} onChange={(e) => setActive(e.target.value === "active")} className={inputClass}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          )}
        </Field>
      </div>
      {serverError ? <p role="alert" className="text-sm text-admin-bad">{serverError}</p> : null}
      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary">{target ? "Save changes" : "Add user"}</Button>
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
        eyebrow="Team"
        title="User Management"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setServerError(null);
              setEditing("new");
            }}
          >
            <Plus className="size-4" aria-hidden /> Add new user
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
              <th scope="col" className="px-5 py-4 font-normal">User</th>
              <th scope="col" className="px-5 py-4 font-normal">Role</th>
              <th scope="col" className="px-5 py-4 font-normal">Status</th>
              <th scope="col" className="px-5 py-4 font-normal">Last login</th>
              <th scope="col" className="px-5 py-4"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-line">
            {users.map((u) => (
              <tr key={u.id} className="transition-colors duration-200 hover:bg-admin-panel">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full border border-admin-line bg-admin-panel-strong text-xs tracking-luxury">
                      {initials(u.fullName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-admin-ink">
                        {u.fullName}
                        {u.id === user.id ? <span className="text-admin-muted"> (you)</span> : null}
                      </p>
                      <p className="truncate text-admin-muted">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Badge tone={u.role === "admin" ? "accent" : "neutral"}>{ROLE_LABELS[u.role]}</Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge tone={u.active ? "ok" : "bad"}>{u.active ? "Active" : "Inactive"}</Badge>
                </td>
                <td className="px-5 py-3 text-admin-muted">{formatDate(u.lastLogin, true)}</td>
                <td className="px-2 py-1">
                  <div className="flex">
                    <IconButton
                      label={`Edit ${u.fullName}`}
                      onClick={() => {
                        setServerError(null);
                        setEditing(u);
                      }}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </IconButton>
                    <IconButton
                      label={u.active ? `Deactivate ${u.fullName}` : `Activate ${u.fullName}`}
                      disabled={u.id === user.id}
                      onClick={() => {
                        const result = setUserActive(u.id, !u.active);
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
        title={editing === "new" ? "Add new user" : "Edit user"}
      >
        {editing !== null ? (
          <UserForm
            target={editing === "new" ? null : editing}
            serverError={serverError}
            onCancel={() => setEditing(null)}
            onSubmit={(input) => {
              const result = saveUser(input);
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
