"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  SquareKanban,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAdmin } from "@/lib/admin/admin-context";
import type { Permission } from "@/lib/admin/rbac";
import { ROLE_LABELS } from "@/lib/admin/rbac";
import { initials } from "@/lib/admin/utils";
import { siteConfig } from "@/config/siteConfig";
import { cn } from "@/lib/utils";
import { Badge, Button, IconButton, Spinner } from "./ui";

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  requires?: Permission;
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Resumen", Icon: LayoutDashboard },
  { href: "/admin/properties", label: "Propiedades", Icon: Building2 },
  { href: "/admin/leads", label: "Pipeline de consultas", Icon: SquareKanban },
  { href: "/admin/users", label: "Gestión de usuarios", Icon: Users, requires: "users:manage" },
];

const SETTINGS_ITEM: NavItem = {
  href: "/admin/settings",
  label: "Configuración del sitio",
  Icon: Settings,
  requires: "config:manage",
};

const COLLAPSE_KEY = "transaction-admin-sidebar-collapsed";

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user, can, logout } = useAdmin();
  // Safe to read storage here: the shell's first render is the spinner branch
  // on both server and client, so `collapsed` never affects hydrated markup.
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (status === "ready" && !user) router.replace("/login");
  }, [status, user, router]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, prev ? "0" : "1");
      } catch {
        // ignore
      }
      return !prev;
    });
  }

  if (status === "loading" || !user) {
    return <Spinner label={status === "loading" ? "Cargando" : "Redirigiendo al inicio de sesión"} />;
  }

  const items = NAV.filter((item) => !item.requires || can(item.requires));
  const showSettings = !SETTINGS_ITEM.requires || can(SETTINGS_ITEM.requires);

  const renderLink = ({ href, label, Icon }: NavItem) => {
    const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        title={label}
        aria-current={active ? "page" : undefined}
        onClick={() => setDrawerOpen(false)}
        className={cn(
          "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent",
          collapsed && "lg:justify-center",
          active
            ? "bg-white/15 text-white"
            : "text-white/80 hover:bg-white/10 hover:text-white active:bg-white/15",
        )}
      >
        <Icon className={cn("size-5 shrink-0", active && "text-white")} aria-hidden />
        <span className={cn(collapsed && "lg:sr-only")}>{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen">
      {drawerOpen ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/60 lg:hidden"
        />
      ) : null}

      <aside
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col admin-dark border-r border-white/10 bg-slate-900 transition-transform duration-200 ease-out motion-reduce:transition-none lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-20" : "lg:w-64",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-admin-line px-4">
          <span
            className={cn(
              "truncate text-xs uppercase tracking-wordmark",
              collapsed && "lg:sr-only",
            )}
          >
            {siteConfig.agency.name}
          </span>
          <IconButton
            label="Cerrar menú"
            className="lg:hidden"
            onClick={() => setDrawerOpen(false)}
          >
            <X className="size-5" aria-hidden />
          </IconButton>
        </div>

        <nav aria-label="Administración" className="flex-1 space-y-1 p-3">
          {items.map(renderLink)}
        </nav>

        <div className="space-y-1 border-t border-admin-line p-3">
          {showSettings ? renderLink(SETTINGS_ITEM) : null}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-pressed={collapsed}
            aria-controls="admin-sidebar"
            title={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
            className={cn(
              "hidden min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-white/15",
              "lg:flex",
              collapsed && "justify-center",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-5" aria-hidden />
            ) : (
              <PanelLeftClose className="size-5" aria-hidden />
            )}
            <span className={cn(collapsed && "sr-only")}>Contraer</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-admin-line bg-admin-bg/80 px-4 backdrop-blur-xl sm:px-6">
          <IconButton
            label="Abrir menú"
            className="lg:hidden"
            aria-controls="admin-sidebar"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="size-5" aria-hidden />
          </IconButton>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm text-admin-ink">{user.fullName}</p>
              <p className="text-sm text-admin-muted">{user.email}</p>
            </div>
            <span
              aria-hidden
              className="flex size-11 items-center justify-center rounded-full border border-admin-line bg-admin-panel-strong text-xs tracking-luxury"
            >
              {initials(user.fullName)}
            </span>
            <Badge tone="accent">{ROLE_LABELS[user.role]}</Badge>
            <Button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              aria-label="Cerrar sesión"
              className="px-3 sm:px-5"
            >
              <LogOut className="size-4" aria-hidden />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
