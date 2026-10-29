"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getPublic } from "@/lib/cms/client";
import { seedSettings } from "@/lib/cms/seed/pages";
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

/** "Label|Value" pairs used for stats. */
export function splitPair(s: string) {
  const [a, b] = s.split("|");
  return { label: (a ?? "").trim(), value: (b ?? "").trim() };
}

export function waLink(num: string, text = "") {
  const n = num.replace(/[^\d]/g, "");
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
