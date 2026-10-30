"use client";

import { useCallback, useEffect, useState } from "react";
import { adminList, adminUpsert } from "@/lib/cms/client";
import { seedSettings } from "@/lib/cms/seed/content";
import type { SiteSettingsDoc } from "@/lib/cms/types";

export type Settings = SiteSettingsDoc & Record<string, unknown>;

/**
 * Loads the single "site" settings document for the design / navigation / layout / text editors,
 * keeps an editable draft, and saves it back (which updates the live site immediately).
 */
export function useSiteSettings(notify: (m: string, t?: "ok" | "err") => void) {
  const [saved, setSaved] = useState<Settings | null>(null);
  const [draft, setDraft] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const all = await adminList("settings");
      const site = (all.find((x) => x.id === "site") ?? seedSettings[0]) as Settings;
      const merged = { ...(seedSettings[0] as Settings), ...site };
      setSaved(merged);
      setDraft(merged);
    } catch (e) {
      notify((e as Error).message, "err");
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const set = useCallback(<K extends keyof Settings>(k: K, v: Settings[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d)), []);
  const patch = useCallback((p: Partial<Settings>) => setDraft((d) => (d ? { ...d, ...p } : d)), []);
  const dirty = !!draft && !!saved && JSON.stringify(draft) !== JSON.stringify(saved);

  const save = useCallback(async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const doc = await adminUpsert("settings", { ...draft, id: "site", status: "published" });
      const merged = { ...(seedSettings[0] as Settings), ...(doc as Settings) };
      setSaved(merged);
      setDraft(merged);
      notify("Saved — the live site is updated.");
    } catch (e) {
      notify((e as Error).message, "err");
    } finally {
      setSaving(false);
    }
  }, [draft, notify]);

  const discard = useCallback(() => setDraft(saved), [saved]);

  return { draft, saved, set, patch, dirty, save, saving, discard, reload: load };
}
