"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import type {
  AdminProperty,
  DbState,
  Lead,
  LeadOutcome,
  LeadStage,
  PropertyImportSummary,
  SessionUser,
  StoredRole,
} from "@/types/admin";
import { getFirebaseAuth } from "@/lib/firebase";
import { loadDb, resetDb, saveDb } from "./db";
import { can, type Permission } from "./rbac";

export type Result = { ok: true } | { ok: false; error: string };
const ok: Result = { ok: true };
const fail = (error: string): Result => ({ ok: false, error });

const BAD_CREDENTIALS = "Correo o contraseña incorrectos.";

export type PropertyInput = Omit<AdminProperty, "id" | "updatedAt"> & {
  id?: string;
};

export interface UserInput {
  id?: string;
  fullName: string;
  email: string;
  /** Required when creating; blank on edit keeps the current password. */
  password?: string;
  role: StoredRole;
  active: boolean;
}

interface AdminContextValue {
  /** `loading` until the server session and local data have been read. */
  status: "loading" | "ready";
  user: SessionUser | null;
  /** Staff directory from Firebase (never includes the super admin). */
  users: SessionUser[];
  /** Already scoped to what the signed-in role may see. */
  properties: AdminProperty[];
  leads: Lead[];
  can: (permission: Permission) => boolean;

  login: (email: string, password: string) => Promise<Result>;
  logout: () => void;

  moveLead: (id: string, stage: LeadStage, outcome?: LeadOutcome) => Result;
  setLeadOutcome: (id: string, outcome: LeadOutcome) => Result;
  reassignLead: (id: string, agentId: string | null) => Result;

  saveProperty: (input: PropertyInput) => Promise<Result>;
  togglePropertyStatus: (id: string) => Promise<Result>;
  /** Turn the homepage "Destacada" / "Hero" choice on or off (max 5 each). */
  togglePropertyFlag: (id: string, flag: "featured" | "hero") => Promise<Result>;
  deleteProperty: (id: string) => Promise<Result>;
  /** Upload an .xlsx; `commit: false` only validates and previews. */
  importProperties: (
    file: File,
    commit: boolean,
  ) => Promise<({ ok: true } & PropertyImportSummary) | { ok: false; error: string }>;

  saveUser: (input: UserInput) => Promise<Result>;
  setUserActive: (id: string, active: boolean) => Promise<Result>;

  resetDemoData: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

async function readJson<T>(res: Response): Promise<T> {
  return (await res.json().catch(() => ({}))) as T;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DbState | null>(null);
  // The signed server cookie is the only source of truth for who is signed in.
  const [authUser, setAuthUser] = useState<SessionUser | null>(null);
  const [staff, setStaff] = useState<SessionUser[]>([]);
  const [serverChecked, setServerChecked] = useState(false);
  const [catalog, setCatalog] = useState<AdminProperty[]>([]);
  const dbRef = useRef<DbState | null>(null);

  // localStorage only exists in the browser, so the first client render must
  // match the server's "loading" output; hydrate state here, after mount.
  useEffect(() => {
    const loaded = loadDb();
    dbRef.current = loaded;
    /* eslint-disable react-hooks/set-state-in-effect */
    setDb(loaded);
    /* eslint-enable react-hooks/set-state-in-effect */

    let cancelled = false;
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { user: SessionUser | null } | null) => {
        if (!cancelled) setAuthUser(data?.user ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setServerChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const commit = useCallback((next: DbState) => {
    dbRef.current = next;
    setDb(next);
    saveDb(next);
  }, []);

  const currentUser = db ? authUser : null;
  const role = currentUser?.role;
  const allowed = useCallback((p: Permission) => can(role, p), [role]);

  const refreshStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) return;
      const data = await readJson<{ users?: SessionUser[] }>(res);
      // Defensive: the super admin must never appear in any directory.
      setStaff((data.users ?? []).filter((u) => (u.role as string) !== "superadmin"));
    } catch {
      // Leave the previous list in place.
    }
  }, []);

  const userId = currentUser?.id;
  useEffect(() => {
    if (userId && (can(role, "users:manage") || can(role, "leads:reassign"))) {
      // Fetch-on-identity-change; state is only set after the request resolves.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void refreshStaff();
    }
  }, [userId, role, refreshStaff]);

  const users = useMemo(() => (currentUser ? staff : []), [currentUser, staff]);

  // The server already scopes the catalog to what this role may see.
  const properties = useMemo(() => (currentUser ? catalog : []), [currentUser, catalog]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetch("/api/admin/properties", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { properties?: AdminProperty[] } | null) => {
        if (!cancelled && data?.properties) setCatalog(data.properties);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const leads = useMemo(() => {
    if (!db || !currentUser) return [];
    return can(currentUser.role, "leads:view-all")
      ? db.leads
      : db.leads.filter((l) => l.assignedAgentId === currentUser.id);
  }, [db, currentUser]);

  const login = useCallback<AdminContextValue["login"]>(async (email, password) => {
    if (!dbRef.current) return fail("Todavía se está cargando — probá de nuevo en un momento.");
    const post = (body: unknown) =>
      fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

    // 1) The env-defined super admin: only the server can verify it.
    try {
      const res = await post({ email, password });
      const data = await readJson<{ user?: SessionUser; error?: string }>(res);
      if (res.ok && data.user) {
        setAuthUser(data.user);
        return ok;
      }
      if (res.status === 429 && data.error) return fail(data.error);
    } catch {
      return fail("No pudimos conectar con el servidor.");
    }

    // 2) Staff: sign in with Firebase, then let the server verify the ID token.
    const auth = getFirebaseAuth();
    if (!auth) return fail("El inicio de sesión no está configurado.");
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const res = await post({ idToken: await cred.user.getIdToken() });
      const data = await readJson<{ user?: SessionUser; error?: string }>(res);
      if (!res.ok || !data.user) return fail(data.error ?? BAD_CREDENTIALS);
      setAuthUser(data.user);
      return ok;
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "auth/too-many-requests") {
        return fail("Demasiados intentos. Probá de nuevo en unos minutos.");
      }
      if (code === "auth/user-disabled") {
        return fail("Esta cuenta fue desactivada. Contactá a un administrador.");
      }
      if (code === "auth/network-request-failed") {
        return fail("No pudimos conectar con el servidor.");
      }
      // Same message for unknown email and wrong password.
      return fail(BAD_CREDENTIALS);
    } finally {
      // The server cookie is the session; don't keep a second one in the browser.
      void signOut(auth).catch(() => {});
    }
  }, []);

  const logout = useCallback(() => {
    setAuthUser(null);
    setStaff([]);
    void fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
  }, []);

  const patchLead = useCallback(
    (id: string, patch: (lead: Lead) => Lead): Result => {
      const state = dbRef.current;
      const actor = currentUser;
      if (!state || !actor) return fail("Tu sesión se cerró.");
      const lead = state.leads.find((l) => l.id === id);
      if (!lead) return fail("No se encontró la consulta.");
      const mayEdit =
        can(actor.role, "leads:view-all") || lead.assignedAgentId === actor.id;
      if (!mayEdit || !can(actor.role, "leads:move")) {
        return fail("Solo podés editar las consultas asignadas a vos.");
      }
      commit({
        ...state,
        leads: state.leads.map((l) => (l.id === id ? patch(l) : l)),
      });
      return ok;
    },
    [commit, currentUser],
  );

  const moveLead = useCallback<AdminContextValue["moveLead"]>(
    (id, stage, outcome) =>
      patchLead(id, (l) => ({
        ...l,
        stage,
        outcome:
          stage === "closed" ? (outcome ?? l.outcome ?? "won") : null,
      })),
    [patchLead],
  );

  const setLeadOutcome = useCallback<AdminContextValue["setLeadOutcome"]>(
    (id, outcome) => patchLead(id, (l) => ({ ...l, outcome })),
    [patchLead],
  );

  const reassignLead = useCallback<AdminContextValue["reassignLead"]>(
    (id, agentId) => {
      if (!allowed("leads:reassign")) return fail("Solo los gerentes pueden reasignar.");
      return patchLead(id, (l) => ({ ...l, assignedAgentId: agentId }));
    },
    [allowed, patchLead],
  );

  const sendProperty = useCallback(
    async (init: RequestInit, url = "/api/admin/properties"): Promise<Result> => {
      if (!allowed("properties:write")) return fail("No tenés permiso para editar propiedades.");
      try {
        const res = await fetch(url, init);
        const data = await readJson<{ properties?: AdminProperty[]; error?: string }>(res);
        if (!res.ok || !data.properties) return fail(data.error ?? "No pudimos guardar los cambios.");
        setCatalog(data.properties);
        return ok;
      } catch {
        return fail("No pudimos conectar con el servidor.");
      }
    },
    [allowed],
  );

  const saveProperty = useCallback<AdminContextValue["saveProperty"]>(
    (input) =>
      sendProperty({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    [sendProperty],
  );

  const patchProperty = useCallback(
    (id: string, patch: (p: AdminProperty) => Partial<AdminProperty>): Promise<Result> => {
      const current = catalog.find((p) => p.id === id);
      if (!current) return Promise.resolve(fail("No se encontró la propiedad."));
      return saveProperty({ ...current, ...patch(current) });
    },
    [catalog, saveProperty],
  );

  const togglePropertyStatus = useCallback<AdminContextValue["togglePropertyStatus"]>(
    (id) => patchProperty(id, (p) => ({ status: p.status === "published" ? "draft" : "published" })),
    [patchProperty],
  );

  const togglePropertyFlag = useCallback<AdminContextValue["togglePropertyFlag"]>(
    (id, flag) => patchProperty(id, (p) => ({ [flag]: !p[flag] })),
    [patchProperty],
  );

  const deleteProperty = useCallback<AdminContextValue["deleteProperty"]>(
    (id) => sendProperty({ method: "DELETE" }, `/api/admin/properties?id=${encodeURIComponent(id)}`),
    [sendProperty],
  );

  const importProperties = useCallback<AdminContextValue["importProperties"]>(
    async (file, commit) => {
      if (!allowed("properties:write")) return { ok: false, error: "No tenés permiso para importar propiedades." };
      const body = new FormData();
      body.set("file", file);
      if (commit) body.set("commit", "1");
      try {
        const res = await fetch("/api/admin/properties/import", { method: "POST", body });
        const data = await readJson<
          PropertyImportSummary & { properties?: AdminProperty[]; error?: string }
        >(res);
        if (!res.ok) return { ok: false, error: data.error ?? "No pudimos importar el archivo." };
        if (data.saved && data.properties) setCatalog(data.properties);
        return {
          ok: true,
          created: data.created,
          updated: data.updated,
          errors: data.errors,
          saved: data.saved,
        };
      } catch {
        return { ok: false, error: "No pudimos conectar con el servidor." };
      }
    },
    [allowed],
  );

  const saveUser = useCallback<AdminContextValue["saveUser"]>(
    async (input) => {
      if (!allowed("users:manage")) {
        return fail("Solo los administradores pueden gestionar usuarios.");
      }
      if ((input.role as string) === "superadmin") return fail("Ese rol no se puede asignar.");
      try {
        const res = await fetch(input.id ? `/api/admin/users/${encodeURIComponent(input.id)}` : "/api/admin/users", {
          method: input.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: input.fullName,
            email: input.email,
            password: input.password || undefined,
            role: input.role,
            active: input.active,
          }),
        });
        const data = await readJson<{ error?: string }>(res);
        if (!res.ok) return fail(data.error ?? "No pudimos guardar el usuario.");
        await refreshStaff();
        return ok;
      } catch {
        return fail("No pudimos conectar con el servidor.");
      }
    },
    [allowed, refreshStaff],
  );

  const setUserActive = useCallback<AdminContextValue["setUserActive"]>(
    async (id, active) => {
      if (!allowed("users:manage")) {
        return fail("Solo los administradores pueden gestionar usuarios.");
      }
      try {
        const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active }),
        });
        const data = await readJson<{ error?: string }>(res);
        if (!res.ok) return fail(data.error ?? "No pudimos actualizar el usuario.");
        await refreshStaff();
        return ok;
      } catch {
        return fail("No pudimos conectar con el servidor.");
      }
    },
    [allowed, refreshStaff],
  );

  const resetDemoData = useCallback(() => commit(resetDb()), [commit]);

  const value = useMemo<AdminContextValue>(
    () => ({
      status: db && serverChecked ? "ready" : "loading",
      user: currentUser,
      users,
      properties,
      leads,
      can: allowed,
      login,
      logout,
      moveLead,
      setLeadOutcome,
      reassignLead,
      saveProperty,
      togglePropertyStatus,
      togglePropertyFlag,
      deleteProperty,
      importProperties,
      saveUser,
      setUserActive,
      resetDemoData,
    }),
    [
      db,
      serverChecked,
      currentUser,
      users,
      properties,
      leads,
      allowed,
      login,
      logout,
      moveLead,
      setLeadOutcome,
      reassignLead,
      saveProperty,
      togglePropertyStatus,
      togglePropertyFlag,
      deleteProperty,
      importProperties,
      saveUser,
      setUserActive,
      resetDemoData,
    ],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}
