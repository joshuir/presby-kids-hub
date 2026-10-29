"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getPublic } from "@/lib/cms/client";
import { seedSettings } from "@/lib/cms/seed/content";
import type { SiteSettingsDoc } from "@/lib/cms/types";

/** Site-wide settings (contact details, hero text, service times…) from the CMS. */
const Ctx = createContext<SiteSettingsDoc>(seedSettings[0]);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<SiteSettingsDoc>(seedSettings[0]);
  useEffect(() => {
    getPublic("settings")
      .then((all) => {
        const site = all.find((x) => x.id === "site");
        if (site) setS({ ...seedSettings[0], ...site });
      })
      .catch(() => {});
  }, []);
  return <Ctx.Provider value={s}>{children}</Ctx.Provider>;
}

export const useSettings = () => useContext(Ctx);

/** "a|b|c" → ["a","b","c"] (trimmed). */
export const parts = (s: string) => (s ?? "").split("|").map((x) => x.trim());

export function waLink(num: string, text = "") {
  const n = num.replace(/[^\d]/g, "");
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function telLink(num: string) {
  return `tel:${num.replace(/[^\d+]/g, "")}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
