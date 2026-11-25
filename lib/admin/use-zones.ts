"use client";

import { useEffect, useState } from "react";
import type { PropertyTypeDef } from "@/lib/property-types";
import type { Zone } from "@/lib/zones";

/** GET a list from an admin endpoint; `null` while loading, `[]` on failure. */
function useAdminList<T>(url: string, key: string): T[] | null {
  const [items, setItems] = useState<T[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(url, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Record<string, T[] | undefined> | null) => {
        if (!cancelled) setItems(data?.[key] ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [url, key]);
  return items;
}

/** Zones from /api/admin/zones; `null` while loading. */
export const useZones = () => useAdminList<Zone>("/api/admin/zones", "zones");

/** Property types from /api/admin/property-types; `null` while loading. */
export const usePropertyTypes = () => useAdminList<PropertyTypeDef>("/api/admin/property-types", "types");
