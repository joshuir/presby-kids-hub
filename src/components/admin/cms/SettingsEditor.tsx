"use client";

import { useEffect, useMemo, useState } from "react";
import { adminList } from "@/lib/cms/client";
import { cn } from "@/lib/cn";
import { SCHEMAS, type Field } from "./fields";
import { FieldEditor } from "./FieldEditor";
import { PageHeader, Panel, RowsEditor, SaveBar, useNotify, type RowCol } from "./ui";
import { useSiteSettings } from "./useSiteSettings";

/** Structured editors for list settings that are stored as "a|b|c" lines. */
const ROWS: Record<string, RowCol[]> = {
  heroWords: [{ key: "w", label: "Word" }],
  serviceTimes: [{ key: "name", label: "Name" }, { key: "time", label: "Time" }],
  stats: [{ key: "label", label: "Label" }, { key: "value", label: "Number / value", width: "w-36" }],
  sundaySteps: [{ key: "t", label: "Title" }, { key: "d", label: "Text" }],
  groups: [{ key: "key", label: "Key", options: ["beginners", "primary", "juniors", "seniors"], width: "w-32" }, { key: "name", label: "Name" }, { key: "ages", label: "Ages" }, { key: "desc", label: "Description" }, { key: "photo", label: "Photo link (optional)" }],
  missionItems: [{ key: "t", label: "Title" }, { key: "d", label: "Text" }],
  deliveryAreas: [{ key: "area", label: "Area" }, { key: "fee", label: "Fee", width: "w-28" }],
  collectionPoints: [{ key: "p", label: "Collection point" }],
  sizeGuide: [{ key: "code", label: "Size code", width: "w-24" }, { key: "label", label: "Label" }, { key: "chest", label: "Chest cm", width: "w-24" }, { key: "len", label: "Length cm", width: "w-24" }],
};

/** Keys edited elsewhere (Navigation, Footer, Page layouts) — not repeated here. */
const ELSEWHERE = new Set(["ctaLabel", "socials", "footerLinks", "footerTagline", "aboutSections"]);

export function SettingsEditor({ initialGroup }: { initialGroup?: string }) {
  const notify = useNotify();
  const st = useSiteSettings(notify);
  const [lookups, setLookups] = useState<Record<string, { id: string; name: string }[]>>({});
  const groups = useMemo(() => {
    const out: { key: string; label: string; help?: string; fields: Field[] }[] = [];
    for (const f of SCHEMAS.settings) {
      if (f.type === "heading") out.push({ key: f.key, label: f.label, help: f.help, fields: [] });
      else if (!ELSEWHERE.has(f.key)) out[out.length - 1]?.fields.push(f);
    }
    return out.filter((g) => g.fields.length);
  }, []);
  const [g, setG] = useState(initialGroup && groups.some((x) => x.key === initialGroup) ? initialGroup : groups[0].key);

  useEffect(() => {
    adminList("lessons")
      .then((ls) => setLookups({ lessons: ls.map((l) => ({ id: l.id, name: `${l.title} — ${l.classId} (${l.lessonDate})` })) }))
      .catch(() => {});
  }, []);

  const d = st.draft;
  if (!d) return <p className="text-sm text-slate-500">Loading settings…</p>;
  const cur = groups.find((x) => x.key === g) ?? groups[0];

  return (
    <div className="grid gap-5">
      <PageHeader title="Site settings" intro="Contact details, page text, animations, shop & payments, blog, app and policy pages." />
      <div className="grid items-start gap-5 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Settings groups" className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 lg:sticky lg:top-20 lg:flex-col lg:overflow-visible">
          {groups.map((x) => (
            <button key={x.key} type="button" onClick={() => setG(x.key)} aria-current={g === x.key ? "page" : undefined} className={cn("whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-semibold transition", g === x.key ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100")}>
              {x.label}
            </button>
          ))}
        </nav>
        <Panel title={cur.label} intro={cur.help}>
          <div className="grid gap-4 md:grid-cols-2" data-testid="settings-fields">
            {cur.fields.map((f) => (
              <div key={f.key} className={f.wide || ROWS[f.key] ? "md:col-span-2" : ""}>
                {ROWS[f.key] ? (
                  <RowsEditor
                    label={f.label.replace(/\s*\(one per line[^)]*\)/i, "")}
                    help={f.help}
                    value={(d[f.key] as string[]) ?? []}
                    onChange={(v) => st.set(f.key as never, v as never)}
                    cols={ROWS[f.key]}
                  />
                ) : (
                  <FieldEditor field={f} doc={d as Record<string, unknown>} classes={[]} lookups={lookups} set={(k, v) => st.set(k as never, v as never)} />
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <SaveBar dirty={st.dirty} saving={st.saving} onSave={st.save} onDiscard={st.discard} />
    </div>
  );
}
