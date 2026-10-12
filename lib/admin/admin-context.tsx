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
import type {
  AdminProperty,
  AdminUser,
  DbState,
  Lead,
  LeadOutcome,
  LeadStage,
  Session,
  SessionUser,
  StoredRole,
} from "@/types/admin";
import { loadDb, resetDb, saveDb } from "./db";
import { can, type Permission } from "./rbac";

const SESSION_KEY = "oceanus-admin-session";
const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export type Result = { ok: true } | { ok: false; error: string };
const ok: Result = { ok: true };
const fail = (error: string): Result => ({ ok: false, error });

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
  /** `loading` until localStorage has been read on the client. */
  status: "loading" | "ready";
  user: SessionUser | null;
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

  saveProperty: (input: PropertyInput) => Result;
  togglePropertyStatus: (id: string) => Result;
  deleteProperty: (id: string) => Result;

  saveUser: (input: UserInput) => Result;
  setUserActive: (id: string, active: boolean) => Result;

  resetDemoData: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

const toSessionUser = (u: AdminUser): SessionUser => ({
  id: u.id,
  fullName: u.fullName,
  email: u.email,
  role: u.role,
  active: u.active,
  lastLogin: u.lastLogin,
});

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    return session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

function writeSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage blocked: the session simply won't survive a reload.
  }
  // Cookie mirrors the session so a proxy / server component can later gate
  // routes without touching localStorage. Mock token only — not a real JWT.
  document.cookie = session
    ? `${COOKIE_NAME}=${session.token}; Path=/; Max-Age=${SESSION_TTL_MS / 1000}; SameSite=Lax`
    : `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

export function AdminProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DbState | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // The hardcoded super admin lives only in a server cookie, never in `db`.
  const [superUser, setSuperUser] = useState<SessionUser | null>(null);
  const [serverChecked, setServerChecked] = useState(false);
  const dbRef = useRef<DbState | null>(null);

  // localStorage only exists in the browser, so the first client render must
  // match the server's "loading" output; hydrate state here, after mount.
  useEffect(() => {
    const loaded = loadDb();
    dbRef.current = loaded;
    /* eslint-disable react-hooks/set-state-in-effect */
    setDb(loaded);
    setSession(readSession());
    /* eslint-enable react-hooks/set-state-in-effect */

    let cancelled = false;
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { user: SessionUser | null } | null) => {
        if (!cancelled && data?.user?.role === "superadmin") setSuperUser(data.user);
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

  const currentUser = useMemo(() => {
    if (!db) return null;
    if (superUser) return superUser;
    if (!session) return null;
    const found = db.users.find((u) => u.id === session.userId && u.active);
    return found ? toSessionUser(found) : null;
  }, [db, session, superUser]);

  const role = currentUser?.role;
  const allowed = useCallback((p: Permission) => can(role, p), [role]);

  const properties = useMemo(() => {
    if (!db || !currentUser) return [];
    return can(currentUser.role, "properties:view-all")
      ? db.properties
      : db.properties.filter((p) => p.assignedAgentId === currentUser.id);
  }, [db, currentUser]);

  const leads = useMemo(() => {
    if (!db || !currentUser) return [];
    return can(currentUser.role, "leads:view-all")
      ? db.leads
      : db.leads.filter((l) => l.assignedAgentId === currentUser.id);
  }, [db, currentUser]);

  const users = useMemo(
    () => (db ? db.users.map(toSessionUser) : []),
    [db],
  );

  const login = useCallback<AdminContextValue["login"]>(
    async (email, password) => {
      const state = dbRef.current;
      if (!state) return fail("Todavía se está cargando — probá de nuevo en un momento.");
      const match = state.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      );
      // Same message for unknown email and wrong password.
      if (!match || match.password !== password) {
        // Not a regular user: the only other identity is the env-defined super
        // admin, which only the server can verify.
        try {
          const res = await fetch("/api/admin/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = (await res.json().catch(() => ({}))) as {
            user?: SessionUser;
            error?: string;
          };
          if (res.ok && data.user?.role === "superadmin") {
            writeSession(null);
            setSession(null);
            setSuperUser(data.user);
            return ok;
          }
          if (res.status === 429 && data.error) return fail(data.error);
        } catch {
          // Offline / no server: fall through to the generic message.
        }
        return fail("Correo o contraseña incorrectos.");
      }
      if (!match.active) {
        return fail("Esta cuenta fue desactivada. Contactá a un administrador.");
      }
      const next: Session = {
        token: btoa(JSON.stringify({ sub: match.id, iat: Date.now() })),
        userId: match.id,
        expiresAt: Date.now() + SESSION_TTL_MS,
      };
      writeSession(next);
      commit({
        ...state,
        users: state.users.map((u) =>
          u.id === match.id ? { ...u, lastLogin: new Date().toISOString() } : u,
        ),
      });
      setSession(next);
      setSuperUser(null);
      if (match.role === "admin") {
        // Lets the config API verify this admin server-side (best effort).
        void fetch("/api/admin/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }).catch(() => {});
      }
      return ok;
    },
    [commit],
  );

  const logout = useCallback(() => {
    writeSession(null);
    setSession(null);
    setSuperUser(null);
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

  const saveProperty = useCallback<AdminContextValue["saveProperty"]>(
    (input) => {
      const state = dbRef.current;
      if (!state || !allowed("properties:write")) {
        return fail("No tenés permiso para editar propiedades.");
      }
      const now = new Date().toISOString();
      if (input.id) {
        commit({
          ...state,
          properties: state.properties.map((p) =>
            p.id === input.id
              ? { ...p, ...input, id: p.id, updatedAt: now }
              : p,
          ),
        });
      } else {
        const created: AdminProperty = {
          ...input,
          id: newId("p"),
          updatedAt: now,
        };
        commit({ ...state, properties: [created, ...state.properties] });
      }
      return ok;
    },
    [allowed, commit],
  );

  const togglePropertyStatus = useCallback<
    AdminContextValue["togglePropertyStatus"]
  >(
    (id) => {
      const state = dbRef.current;
      if (!state || !allowed("properties:write")) {
        return fail("No tenés permiso para editar propiedades.");
      }
      commit({
        ...state,
        properties: state.properties.map((p) =>
          p.id === id
            ? {
                ...p,
                status: p.status === "published" ? "draft" : "published",
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      });
      return ok;
    },
    [allowed, commit],
  );

  const deleteProperty = useCallback<AdminContextValue["deleteProperty"]>(
    (id) => {
      const state = dbRef.current;
      if (!state || !allowed("properties:write")) {
        return fail("No tenés permiso para eliminar propiedades.");
      }
      commit({
        ...state,
        properties: state.properties.filter((p) => p.id !== id),
      });
      return ok;
    },
    [allowed, commit],
  );

  const saveUser = useCallback<AdminContextValue["saveUser"]>(
    (input) => {
      const state = dbRef.current;
      if (!state || !allowed("users:manage")) {
        return fail("Solo los administradores pueden gestionar usuarios.");
      }
      const email = input.email.trim().toLowerCase();
      if (state.users.some((u) => u.id !== input.id && u.email.toLowerCase() === email)) {
        return fail("Ya existe un usuario con este correo.");
      }
      if (input.id) {
        const target = state.users.find((u) => u.id === input.id);
        if (!target) return fail("No se encontró el usuario.");
        const adminsLeft = state.users.filter(
          (u) => u.id !== input.id && u.role === "admin" && u.active,
        ).length;
        const losesAdmin =
          target.role === "admin" &&
          target.active &&
          (input.role !== "admin" || !input.active);
        if (losesAdmin && adminsLeft === 0) {
          return fail("Se requiere al menos un administrador activo.");
        }
        commit({
          ...state,
          users: state.users.map((u) =>
            u.id === input.id
              ? {
                  ...u,
                  fullName: input.fullName.trim(),
                  email,
                  role: input.role,
                  active: input.active,
                  password: input.password ? input.password : u.password,
                }
              : u,
          ),
        });
        return ok;
      }
      if (!input.password) return fail("La contraseña es obligatoria.");
      const created: AdminUser = {
        id: newId("u"),
        fullName: input.fullName.trim(),
        email,
        password: input.password,
        role: input.role,
        active: input.active,
        lastLogin: null,
      };
      commit({ ...state, users: [...state.users, created] });
      return ok;
    },
    [allowed, commit],
  );

  const setUserActive = useCallback<AdminContextValue["setUserActive"]>(
    (id, active) => {
      const state = dbRef.current;
      const target = state?.users.find((u) => u.id === id);
      if (!target) return fail("No se encontró el usuario.");
      return saveUser({ ...target, password: undefined, active });
    },
    [saveUser],
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
      deleteProperty,
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
      deleteProperty,
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
