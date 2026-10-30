"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getPublic } from "@/lib/cms/client";
import { seedSettings } from "@/lib/cms/seed/content";
import type { SiteSettingsDoc } from "@/lib/cms/types";
import { fontHref, themeCss } from "@/lib/theme";
import { COPY } from "@/lib/copy";

/** Site-wide settings (contact details, hero text, service times…) from the CMS. */
const Ctx = createContext<SiteSettingsDoc>(seedSettings[0]);

/** Message the CMS sends to a preview iframe so unsaved changes show live. */
export const PREVIEW_MSG = "cm-preview-settings";

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<SiteSettingsDoc>(seedSettings[0]);
  useEffect(() => {
    let previewing = false;
    getPublic("settings")
      .then((all) => {
        const site = all.find((x) => x.id === "site");
        if (site && !previewing) setS({ ...seedSettings[0], ...site });
      })
      .catch(() => {});
    // live preview inside the CMS (same origin only)
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.data?.type !== PREVIEW_MSG) return;
      previewing = true;
      setS({ ...seedSettings[0], ...(e.data.settings as SiteSettingsDoc) });
    };
    window.addEventListener("message", onMsg);
    if (window.parent !== window) window.parent.postMessage({ type: "cm-preview-ready" }, location.origin);
    return () => window.removeEventListener("message", onMsg);
  }, []);
  return (
    <Ctx.Provider value={s}>
      <ThemeStyle s={s} />
      {children}
    </Ctx.Provider>
  );
}

/** Applies the CMS theme (colours, fonts, corners, button style) to the whole site. */
export function ThemeStyle({ s }: { s: Partial<SiteSettingsDoc> }) {
  const href = fontHref(s);
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.buttons = s.buttonStyle || "3d";
    html.dataset.radius = s.themeRadius || "rounded";
  }, [s.buttonStyle, s.themeRadius]);
  return (
    <>
      {href ? <link rel="stylesheet" href={href} /> : null}
      <style id="cm-theme" dangerouslySetInnerHTML={{ __html: themeCss(s) }} />
    </>
  );
}

export const useSettings = () => useContext(Ctx);

/** Text / image from the CMS "Site text & images" editor, falling back to the built-in default. */
export function useCopy() {
  const s = useContext(Ctx);
  return (key: keyof typeof COPY | string) => {
    const v = s.copy?.[key];
    return typeof v === "string" && v.trim() ? v : (COPY as Record<string, { def: string }>)[key]?.def ?? "";
  };
}

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
