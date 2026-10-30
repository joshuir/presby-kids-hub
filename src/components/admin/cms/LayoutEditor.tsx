"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Blocks, Eye, EyeOff, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import type { LayoutItem } from "@/lib/cms/types";
import { PAGE_SECTIONS, resolveLayout } from "@/lib/layout";
import { adminList } from "@/lib/cms/client";
import { cn } from "@/lib/cn";
import { EditorSplit } from "./EditorSplit";
import { Btn, PageHeader, Panel, SaveBar, useNotify } from "./ui";
import { useSiteSettings } from "./useSiteSettings";

export function LayoutEditor({ onEditBlock, onNewBlock }: { onEditBlock: (id: string) => void; onNewBlock: () => void }) {
  const notify = useNotify();
  const st = useSiteSettings(notify);
  const [page, setPage] = useState("home");
  const [blocks, setBlocks] = useState<{ id: string; title: string; type: string; status?: string }[]>([]);
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  useEffect(() => {
    adminList("blocks").then((b) => setBlocks(b.map((x) => ({ id: x.id, title: x.title, type: x.type, status: x.status })))).catch(() => {});
  }, []);

  const d = st.draft;
  if (!d) return <p className="text-sm text-slate-500">Loading layouts…</p>;
  const layouts = (d.layouts ?? {}) as Record<string, LayoutItem[]>;
  const items = resolveLayout(page, layouts[page]);
  const write = (next: LayoutItem[]) => st.set("layouts", { ...layouts, [page]: next });
  const label = (id: string) => {
    if (id.startsWith("block:")) {
      const b = blocks.find((x) => x.id === id.slice(6));
      return b ? b.title : "Missing block (deleted)";
    }
    return PAGE_SECTIONS[page].sections.find((x) => x.id === id)?.label ?? id;
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const n = [...items];
    const [x] = n.splice(from, 1);
    n.splice(to, 0, x);
    write(n);
  };

  return (
    <div className="grid gap-5">
      <PageHeader title="Page layouts" intro="Choose which sections appear on each page and in what order. Add your own blocks (text, images, videos, banners, cards, maps, social posts…) anywhere between them." />
      <EditorSplit path={PAGE_SECTIONS[page].path} settings={d} bar={<SaveBar dirty={st.dirty} saving={st.saving} onSave={st.save} onDiscard={st.discard} />}>
        <div className="grid gap-5">
          <Panel>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Page</span>
              <select data-testid="layout-page" value={page} onChange={(e) => setPage(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold">
                {Object.entries(PAGE_SECTIONS).map(([k, p]) => <option key={k} value={k}>{p.label}</option>)}
              </select>
            </label>
          </Panel>

          <Panel title="Sections" intro="Drag to reorder (or use the arrows). The eye hides a section without deleting it.">
            <ol className="grid gap-1.5" data-testid="layout-sections">
              {items.map((it, i) => {
                const isBlock = it.id.startsWith("block:");
                return (
                  <li
                    key={it.id + i}
                    draggable
                    onDragStart={(e) => { setDrag(i); e.dataTransfer.effectAllowed = "move"; }}
                    onDragOver={(e) => { e.preventDefault(); setOver(i); }}
                    onDragLeave={() => setOver((o) => (o === i ? null : o))}
                    onDrop={(e) => { e.preventDefault(); if (drag !== null) move(drag, i); setDrag(null); setOver(null); }}
                    onDragEnd={() => { setDrag(null); setOver(null); }}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border bg-white px-2 py-2 transition",
                      over === i && drag !== i ? "border-blue-400 bg-blue-50" : "border-slate-200",
                      drag === i && "opacity-50",
                      it.hidden && "bg-slate-50",
                    )}
                    data-section={it.id}
                  >
                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-slate-300" aria-hidden />
                    {isBlock ? <Blocks className="h-4 w-4 shrink-0 text-violet-500" aria-hidden /> : <span className="w-4 shrink-0 text-center text-[11px] font-bold text-slate-400">{i + 1}</span>}
                    <span className={cn("min-w-0 flex-1 truncate text-sm font-semibold", it.hidden ? "text-slate-400 line-through" : "text-slate-800")}>
                      {label(it.id)}
                      {isBlock ? <span className="ml-1.5 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-violet-700">block</span> : null}
                    </span>
                    {isBlock ? (
                      <button type="button" aria-label={`Edit ${label(it.id)}`} onClick={() => onEditBlock(it.id.slice(6))} className="grid h-8 w-8 place-items-center rounded text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                    ) : null}
                    <button type="button" aria-label={it.hidden ? `Show ${label(it.id)}` : `Hide ${label(it.id)}`} onClick={() => write(items.map((x, k) => (k === i ? { ...x, hidden: !x.hidden } : x)))} className="grid h-8 w-8 place-items-center rounded text-slate-500 hover:bg-slate-100">{it.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    <button type="button" aria-label={`Move ${label(it.id)} up`} disabled={i === 0} onClick={() => move(i, i - 1)} className="grid h-8 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" aria-label={`Move ${label(it.id)} down`} disabled={i === items.length - 1} onClick={() => move(i, i + 1)} className="grid h-8 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                    {isBlock ? (
                      <button type="button" aria-label={`Remove ${label(it.id)} from this page`} onClick={() => write(items.filter((_, k) => k !== i))} className="grid h-8 w-8 place-items-center rounded text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            <div className="mt-3 grid gap-2 rounded-xl border border-dashed border-slate-300 p-3">
              <div className="text-[13px] font-semibold text-slate-700">Add a block to this page</div>
              <div className="flex flex-wrap gap-2">
                <select data-testid="add-block" value="" onChange={(e) => e.target.value && write([...items, { id: `block:${e.target.value}` }])} className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-2 text-sm">
                  <option value="">Choose an existing block…</option>
                  {blocks.map((b) => <option key={b.id} value={b.id}>{b.title} ({b.type}){b.status !== "published" ? " — draft" : ""}</option>)}
                </select>
                <Btn size="md" onClick={onNewBlock}><Plus className="h-4 w-4" /> New block</Btn>
              </div>
              <p className="text-xs text-slate-500">New blocks are added at the bottom — move them into place with the arrows. Only published blocks show on the live site.</p>
            </div>
            <button type="button" onClick={() => write([])} className="mt-3 text-xs font-semibold text-slate-500 underline-offset-4 hover:underline">Reset this page to its default layout</button>
          </Panel>
        </div>
      </EditorSplit>
    </div>
  );
}
