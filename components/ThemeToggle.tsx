"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="flex items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-xs uppercase tracking-luxury text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink dark:border-white/10 dark:text-white/75 dark:hover:text-white dark:focus-visible:outline-white"
    >
      {theme === "light" ? (
        <>
          <Moon size={14} />
          Dark
        </>
      ) : (
        <>
          <Sun size={14} />
          Light
        </>
      )}
    </button>
  );
}
