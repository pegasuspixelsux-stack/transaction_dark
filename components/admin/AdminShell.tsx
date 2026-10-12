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
  { href: "/admin", label: "Overview", Icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", Icon: Building2 },
  { href: "/admin/leads", label: "Leads Pipeline", Icon: SquareKanban },
  { href: "/admin/users", label: "User Management", Icon: Users, requires: "users:manage" },
  { href: "/admin/settings", label: "Site Configuration", Icon: Settings },
];

const COLLAPSE_KEY = "oceanus-admin-sidebar-collapsed";

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
    return <Spinner label={status === "loading" ? "Loading" : "Redirecting to sign in"} />;
  }

  const items = NAV.filter((item) => !item.requires || can(item.requires));

  return (
    <div className="flex min-h-screen">
      {drawerOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      ) : null}

      <aside
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-admin-line bg-[#0a1827]/95 backdrop-blur-xl transition-transform duration-200 ease-out motion-reduce:transition-none lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:bg-admin-panel",
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
            label="Close menu"
            className="lg:hidden"
            onClick={() => setDrawerOpen(false)}
          >
            <X className="size-5" aria-hidden />
          </IconButton>
        </div>

        <nav aria-label="Admin" className="flex-1 space-y-1 p-3">
          {items.map(({ href, label, Icon }) => {
            const active =
              href === "/admin" ? pathname === href : pathname.startsWith(href);
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
                    ? "bg-admin-panel-strong text-admin-ink"
                    : "text-admin-muted hover:bg-admin-panel hover:text-admin-ink active:bg-admin-panel-strong",
                )}
              >
                <Icon
                  className={cn("size-5 shrink-0", active && "text-admin-accent")}
                  aria-hidden
                />
                <span className={cn(collapsed && "lg:sr-only")}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-admin-line p-3 lg:block">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-pressed={collapsed}
            aria-controls="admin-sidebar"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-admin-muted transition-colors duration-200 hover:bg-admin-panel hover:text-admin-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-accent active:bg-admin-panel-strong",
              collapsed && "justify-center",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-5" aria-hidden />
            ) : (
              <PanelLeftClose className="size-5" aria-hidden />
            )}
            <span className={cn(collapsed && "sr-only")}>Collapse</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-admin-line bg-admin-bg/80 px-4 backdrop-blur-xl sm:px-6">
          <IconButton
            label="Open menu"
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
              aria-label="Log out"
              className="px-3 sm:px-5"
            >
              <LogOut className="size-4" aria-hidden />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
