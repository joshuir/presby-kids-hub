"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import type { MenuItem } from "@/lib/cms/types";
import { DEFAULT_MENU } from "@/lib/nav";
import { ICON_NAMES, IconByName } from "@/lib/icons";
import { adminList } from "@/lib/cms/client";
import { cn } from "@/lib/cn";
import { LivePreview } from "./LivePreview";
import { Btn, PageHeader, Panel, SaveBar, TextInput, Toggle, useNotify } from "./ui";
import { useSiteSettings } from "./useSiteSettings";

export const SITE_PAGES: [string, string][] = [
  ["/", "Home"], ["/about/", "About"], ["/about/#team", "About → Our team"], ["/about/#history", "About → History"], ["/classes/", "Classes"],
  ["/events/", "Events"], ["/blog/", "Blog"], ["/gallery/", "Gallery"], ["/games/", "Bible Games"], ["/collection/", "Clothing collection"],
  ["/contact/", "Contact"], ["/contact/#form-title", "Contact → Message form"], ["/safeguarding/", "Safeguarding"], ["/privacy/", "Privacy"],
  ["/terms/", "Terms"], ["/accessibility/", "Accessibility"],
];

/** Link field with suggestions for every page on the site (including custom pages). */
export function LinkInput({ label, value, onChange, pages }: { label: string; value: string; onChange: (v: string) => void; pages: [string, string][] }) {
  const id = `links-${label.replace(/\W/g, "")}`;
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">{label}</span>
      <input list={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="/page/ or https://…" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
      <datalist id={id}>{pages.map(([href, name]) => <option key={href} value={href}>{name}</option>)}</datalist>
    </label>
  );
}

export function IconSelect({ value, onChange, label = "Icon" }: { value?: string; onChange: (v: string) => void; label?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">{label}</span>
      <span className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 pl-2.5 focus-within:border-blue-500">
        <IconByName name={value} className="h-4 w-4 shrink-0 text-slate-600" />
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="h-full min-w-0 flex-1 bg-transparent pr-2 text-sm outline-none" aria-label={label}>
          {ICON_NAMES.map((n) => <option key={n} value={n}>{n.replace(/([a-z])([A-Z])/g, "$1 $2")}</option>)}
        </select>
      </span>
    </label>
  );
}

export function useSitePages() {
  const [pages, setPages] = useState<[string, string][]>(SITE_PAGES);
  useEffect(() => {
    adminList("custompages")
      .then((cp) => setPages([...SITE_PAGES, ...cp.map((p) => [`/p/?s=${p.slug}`, `Custom page → ${p.title}`] as [string, string])]))
      .catch(() => {});
  }, []);
  return pages;
}

export function NavigationEditor() {
  const notify = useNotify();
  const st = useSiteSettings(notify);
  const pages = useSitePages();
  const [open, setOpen] = useState<number | null>(null);
  const d = st.draft;
  if (!d) return <p className="text-sm text-slate-500">Loading navigation…</p>;
  const menu: MenuItem[] = Array.isArray(d.menu) && d.menu.length ? d.menu : DEFAULT_MENU;
  const setMenu = (m: MenuItem[]) => st.set("menu", m);
  const upd = (i: number, p: Partial<MenuItem>) => setMenu(menu.map((m, k) => (k === i ? { ...m, ...p } : m)));
  const move = (i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= menu.length) return;
    const n = [...menu];
    [n[i], n[j]] = [n[j], n[i]];
    setMenu(n);
    setOpen(j);
  };

  return (
    <div className="grid gap-5">
      <PageHeader title="Navigation" intro="The header menu, its dropdowns and the header button. Drag order with the arrows, hide items without deleting them, and link to any page — including custom pages." />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,520px)_1fr]">
        <div className="grid gap-5">
          <Panel title="Header menu" actions={<Btn size="sm" onClick={() => { setMenu([...menu, { label: "New link", href: "/", icon: "Sparkles" }]); setOpen(menu.length); }}><Plus className="h-4 w-4" /> Add menu item</Btn>}>
            <ol className="grid gap-2" data-testid="menu-items">
              {menu.map((m, i) => {
                const isOpen = open === i;
                return (
                  <li key={i} className={cn("rounded-xl border bg-white", isOpen ? "border-blue-300 shadow-sm" : "border-slate-200", m.hidden && "opacity-60")}>
                    <div className="flex items-center gap-2 p-2 pl-3">
                      <IconByName name={m.icon} className="h-4 w-4 shrink-0 text-slate-500" />
                      <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                        <span className="truncate text-sm font-semibold text-slate-900">{m.label || "Untitled"}</span>
                        <span className="truncate text-xs text-slate-400">{m.href}</span>
                        {m.children?.length || m.mega ? <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">{m.mega ? "mega" : `${m.children?.length} in dropdown`}</span> : null}
                        <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 text-slate-400 transition", isOpen && "rotate-180")} />
                      </button>
                      <button type="button" aria-label={m.hidden ? `Show ${m.label}` : `Hide ${m.label}`} onClick={() => upd(i, { hidden: !m.hidden })} className="grid h-8 w-8 place-items-center rounded text-slate-500 hover:bg-slate-100">{m.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                      <button type="button" aria-label={`Move ${m.label} up`} disabled={i === 0} onClick={() => move(i, -1)} className="grid h-8 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                      <button type="button" aria-label={`Move ${m.label} down`} disabled={i === menu.length - 1} onClick={() => move(i, 1)} className="grid h-8 w-7 place-items-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                    </div>
                    {isOpen ? (
                      <div className="grid gap-3 border-t border-slate-100 p-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <TextInput label="Label" value={m.label} onChange={(v) => upd(i, { label: v })} />
                          <LinkInput label="Link" value={m.href} onChange={(v) => upd(i, { href: v })} pages={pages} />
                          <IconSelect value={m.icon} onChange={(v) => upd(i, { icon: v })} />
                          <label className="block">
                            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Dropdown type</span>
                            <select value={m.mega ? "classes" : m.children?.length ? "list" : "none"} onChange={(e) => upd(i, e.target.value === "classes" ? { mega: "classes" } : e.target.value === "list" ? { mega: undefined, children: m.children?.length ? m.children : [{ label: "New link", href: "/", description: "", icon: "Sparkles" }] } : { mega: undefined, children: [] })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
                              <option value="none">No dropdown</option>
                              <option value="list">Dropdown list</option>
                              <option value="classes">Classes mega-menu (automatic)</option>
                            </select>
                          </label>
                        </div>
                        {!m.mega && m.children?.length ? (
                          <div className="rounded-xl bg-slate-50 p-3">
                            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Dropdown links</div>
                            <ul className="grid gap-2">
                              {m.children.map((c, ci) => {
                                const setC = (p: Partial<typeof c>) => upd(i, { children: m.children!.map((x, k) => (k === ci ? { ...x, ...p } : x)) });
                                return (
                                  <li key={ci} className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2.5 sm:grid-cols-2">
                                    <TextInput label="Label" value={c.label} onChange={(v) => setC({ label: v })} />
                                    <LinkInput label="Link" value={c.href} onChange={(v) => setC({ href: v })} pages={pages} />
                                    <TextInput label="Short description" value={c.description ?? ""} onChange={(v) => setC({ description: v })} />
                                    <IconSelect value={c.icon} onChange={(v) => setC({ icon: v })} />
                                    <div className="flex gap-2 sm:col-span-2">
                                      <Btn size="sm" tone="ghost" disabled={ci === 0} onClick={() => { const n = [...m.children!]; [n[ci - 1], n[ci]] = [n[ci], n[ci - 1]]; upd(i, { children: n }); }}><ArrowUp className="h-3.5 w-3.5" /> Up</Btn>
                                      <Btn size="sm" tone="ghost" disabled={ci === m.children!.length - 1} onClick={() => { const n = [...m.children!]; [n[ci + 1], n[ci]] = [n[ci], n[ci + 1]]; upd(i, { children: n }); }}><ArrowDown className="h-3.5 w-3.5" /> Down</Btn>
                                      <Btn size="sm" tone="ghost" onClick={() => setC({ hidden: !c.hidden })}>{c.hidden ? "Show" : "Hide"}</Btn>
                                      <Btn size="sm" tone="danger" className="ml-auto" onClick={() => upd(i, { children: m.children!.filter((_, k) => k !== ci) })}><Trash2 className="h-3.5 w-3.5" /> Remove</Btn>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                            <Btn size="sm" className="mt-2" onClick={() => upd(i, { children: [...m.children!, { label: "New link", href: "/", description: "", icon: "Sparkles" }] })}><Plus className="h-4 w-4" /> Add dropdown link</Btn>
                          </div>
                        ) : null}
                        <div className="flex justify-end">
                          <Btn tone="danger" size="sm" onClick={() => { if (confirm(`Remove “${m.label}” from the menu?`)) { setMenu(menu.filter((_, k) => k !== i)); setOpen(null); } }}><Trash2 className="h-4 w-4" /> Delete menu item</Btn>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            <button type="button" onClick={() => setMenu(DEFAULT_MENU)} className="mt-3 text-xs font-semibold text-slate-500 underline-offset-4 hover:underline">Restore the starter menu</button>
          </Panel>

          <Panel title="Header button" intro="The button at the right of the header (and at the bottom of the phone menu).">
            <div className="grid gap-3">
              <Toggle label="Show the header button" checked={d.showHeaderCta !== "no"} onChange={(v) => st.set("showHeaderCta", v ? "yes" : "no")} />
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput label="Button text" value={String(d.ctaLabel ?? "")} onChange={(v) => st.set("ctaLabel", v)} />
                <LinkInput label="Button link" value={String(d.ctaUrl ?? "")} onChange={(v) => st.set("ctaUrl", v)} pages={pages} />
              </div>
            </div>
          </Panel>
        </div>
        <div className="xl:sticky xl:top-20">
          <LivePreview path="/" settings={d} height={560} />
        </div>
      </div>
      <SaveBar dirty={st.dirty} saving={st.saving} onSave={st.save} onDiscard={st.discard} />
    </div>
  );
}
