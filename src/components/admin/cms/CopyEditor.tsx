"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { COPY, COPY_PAGES, type CopyEntry } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { FieldEditor } from "./FieldEditor";
import { LivePreview } from "./LivePreview";
import { LinkInput, useSitePages } from "./NavigationEditor";
import { PageHeader, Panel, SaveBar, useNotify } from "./ui";
import { useSiteSettings } from "./useSiteSettings";

const PREVIEW_PATH: Record<string, string> = { Home: "/", "Header & footer": "/gallery/", "Shared sections": "/", Events: "/events/", Classes: "/classes/", Contact: "/contact/", About: "/about/" };

export function CopyEditor() {
  const notify = useNotify();
  const st = useSiteSettings(notify);
  const pages = useSitePages();
  const [group, setGroup] = useState(COPY_PAGES.includes("Home") ? "Home" : COPY_PAGES[0]);
  const [q, setQ] = useState("");
  const d = st.draft;
  const entries = useMemo(() => Object.entries(COPY) as [string, CopyEntry][], []);
  if (!d) return <p className="text-sm text-slate-500">Loading…</p>;
  const copy = (d.copy ?? {}) as Record<string, string>;
  const set = (k: string, v: string) => {
    const n = { ...copy, [k]: v };
    if (!v) delete n[k];
    st.set("copy", n);
  };
  const term = q.trim().toLowerCase();
  const shown = entries.filter(([k, e]) => (term ? `${e.label} ${e.def} ${copy[k] ?? ""} ${e.page}`.toLowerCase().includes(term) : e.page === group));
  const changed = (p: string) => entries.filter(([k, e]) => e.page === p && copy[k]).length;

  return (
    <div className="grid gap-5">
      <PageHeader title="Site text & images" intro="Every heading, button, label and fixed picture on the website that isn't part of a content list. Leave a box empty to use the original wording." />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,560px)_1fr]">
        <div className="grid gap-4">
          <Panel>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search all text…" aria-label="Search site text" className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500" />
            </div>
            {!term ? (
              <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Page">
                {COPY_PAGES.map((p) => (
                  <button key={p} type="button" role="tab" aria-selected={group === p} onClick={() => setGroup(p)} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold transition", group === p ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                    {p}{changed(p) ? <span className="ml-1 opacity-60">· {changed(p)}</span> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </Panel>
          <Panel title={term ? `${shown.length} result${shown.length === 1 ? "" : "s"}` : group}>
            <ul className="grid gap-4" data-testid="copy-list">
              {shown.map(([k, e]) => {
                const v = copy[k] ?? "";
                return (
                  <li key={k} className={cn("rounded-xl border p-3", v ? "border-blue-200 bg-blue-50/30" : "border-slate-200")} data-copy={k}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-slate-700">{e.label}{term ? <span className="ml-1 font-normal text-slate-400">· {e.page}</span> : null}</span>
                      {v ? <button type="button" onClick={() => set(k, "")} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"><RotateCcw className="h-3 w-3" /> Use original</button> : null}
                    </div>
                    {e.kind === "image" ? (
                      <FieldEditor field={{ key: "v", label: "Image", type: "media", accept: "image/*" }} doc={{ v: v || e.def }} classes={[]} lookups={{}} set={(_, val) => set(k, String(val ?? ""))} />
                    ) : e.kind === "link" ? (
                      <LinkInput label="Link" value={v} onChange={(val) => set(k, val)} pages={pages} />
                    ) : e.kind === "long" || e.def.length > 70 ? (
                      <textarea value={v} placeholder={e.def} onChange={(ev) => set(k, ev.target.value)} rows={3} aria-label={e.label} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-500" />
                    ) : (
                      <input value={v} placeholder={e.def} onChange={(ev) => set(k, ev.target.value)} aria-label={e.label} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" />
                    )}
                  </li>
                );
              })}
            </ul>
          </Panel>
          <p className="text-xs text-slate-500">Page heroes, the home hero, welcome text, stats, service times, contact details and policy pages are in <b>Site settings</b> and <b>Page heroes</b>. Lists such as classes, events and FAQs have their own sections.</p>
        </div>
        <div className="xl:sticky xl:top-20">
          <LivePreview path={PREVIEW_PATH[term ? "Home" : group] ?? "/"} settings={d} height={720} />
        </div>
      </div>
      <SaveBar dirty={st.dirty} saving={st.saving} onSave={st.save} onDiscard={st.discard} />
    </div>
  );
}
