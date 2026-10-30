"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ExternalLink, LogOut, Menu, Search, X } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminGate";
import { cn } from "@/lib/cn";
import { useSettings } from "@/lib/site";
import { TABS, type CmsTab } from "./nav";
import { ToastProvider, useNotify } from "./ui";
import { Dashboard } from "./Dashboard";
import { ThemeEditor } from "./ThemeEditor";
import { NavigationEditor } from "./NavigationEditor";
import { FooterEditor } from "./FooterEditor";
import { LayoutEditor } from "./LayoutEditor";
import { CopyEditor } from "./CopyEditor";
import { SettingsEditor } from "./SettingsEditor";
import { CollectionView } from "./CollectionView";
import { MediaLibrary } from "./MediaLibrary";
import { MessagesPanel } from "./MessagesPanel";
import { CommentsPanel } from "./CommentsPanel";
import { OrdersPanel } from "./OrdersPanel";
import { AccountPanel, SubAdminsPanel } from "./TeamPanels";
import { PageHeader } from "./ui";

export function CmsApp() {
  return (
    <ToastProvider>
      <Cms />
    </ToastProvider>
  );
}

const readHash = (): CmsTab | null => {
  const h = (typeof location !== "undefined" ? location.hash : "").replace(/^#\/?/, "").split("?")[0];
  return TABS.some((t) => t.key === h) ? (h as CmsTab) : null;
};

function Cms() {
  const { session, signOut } = useAdmin();
  const site = useSettings();
  const notify = useNotify();
  const isOwner = session?.role === "owner";
  const perms = useMemo(() => session?.permissions ?? [], [session?.permissions]);
  const allowed = useCallback(
    (t: CmsTab) => {
      const def = TABS.find((x) => x.key === t);
      if (!def) return false;
      if (t === "team") return isOwner;
      if (!def.perm) return true;
      return isOwner || perms.includes(def.perm);
    },
    [isOwner, perms],
  );
  const visible = TABS.filter((t) => allowed(t.key));
  const [rawTab, setTab] = useState<CmsTab>(() => readHash() ?? "dashboard");
  const tab: CmsTab = allowed(rawTab) ? rawTab : "dashboard";
  const [target, setTarget] = useState<{ id?: string; isNew?: boolean } | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // deep links: /admin/#theme
  useEffect(() => {
    const on = () => { const x = readHash(); if (x && allowed(x)) setTab(x); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, [allowed]);

  const go = useCallback((t: CmsTab, opts?: { id?: string; isNew?: boolean }) => {
    if (!allowed(t)) return;
    setTab(t);
    setTarget(opts ?? null);
    setDrawer(false);
    setPalette(false);
    if (location.hash !== `#${t}`) history.replaceState(null, "", `#${t}`);
    window.scrollTo({ top: 0 });
  }, [allowed]);

  // ⌘K / Ctrl+K opens search
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); }
      if (e.key === "Escape") { setPalette(false); setDrawer(false); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const groups = useMemo(() => {
    const m = new Map<string, typeof visible>();
    visible.forEach((t) => m.set(t.group, [...(m.get(t.group) ?? []), t]));
    return [...m.entries()];
  }, [visible]);
  const current = TABS.find((t) => t.key === tab);
  const consumed = useCallback(() => setTarget(null), []);

  const sidebar = (
    <nav aria-label="CMS" className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={site.logoUrl || "/brand/logo.png"} alt="" className="h-9 w-auto" />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-bold text-slate-900">{site.siteName}</div>
          <div className="text-[11px] font-semibold text-slate-500">Content manager</div>
        </div>
      </div>
      <button type="button" onClick={() => setPalette(true)} className="mx-3 mb-2 flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-400 hover:border-slate-300" aria-label="Search the CMS">
        <Search className="h-4 w-4" /> <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border border-slate-200 px-1.5 text-[10px] font-semibold text-slate-400">⌘K</kbd>
      </button>
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {groups.map(([g, items]) => (
          <div key={g || "top"} className="mt-1">
            {g ? (
              <button type="button" onClick={() => setCollapsed((c) => ({ ...c, [g]: !c[g] }))} aria-expanded={!collapsed[g]} className="flex w-full items-center justify-between px-2.5 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600">
                {g}
                <ChevronDown className={cn("h-3.5 w-3.5 transition", collapsed[g] && "-rotate-90")} />
              </button>
            ) : null}
            {!collapsed[g] ? (
              <ul className="grid gap-0.5">
                {items.map((t) => (
                  <li key={t.key}>
                    <button
                      type="button"
                      data-tab={t.key}
                      onClick={() => go(t.key)}
                      aria-current={tab === t.key ? "page" : undefined}
                      className={cn("flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-semibold transition", tab === t.key ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")}
                    >
                      <t.icon className={cn("h-[18px] w-[18px] shrink-0", tab === t.key ? "text-blue-600" : "text-slate-400")} />
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">{(session?.name || session?.username || "A").slice(0, 1).toUpperCase()}</span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-semibold text-slate-800">{session?.name || session?.username}</div>
            <div className="text-[11px] text-slate-500">{isOwner ? "Main admin" : "Sub-admin"}</div>
          </div>
          <button type="button" onClick={() => signOut()} aria-label="Sign out" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </nav>
  );

  const collectionTabs: CmsTab[] = ["heroes", "custompages", "blocks", "posts", "events", "gallery", "classes", "lessons", "teachers", "faqs", "milestones", "units", "questions", "mascots", "leaderboard", "products"];

  return (
    <div className="min-h-dvh bg-[#F6F7F9] text-slate-900 [font-family:Inter,ui-sans-serif,system-ui,-apple-system,'Segoe_UI',Roboto,sans-serif]" data-cms>
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-[#FBFBFC] lg:block">{sidebar}</aside>

      {/* phone drawer */}
      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="CMS menu">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-slate-900/40" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-[#FBFBFC] shadow-2xl">{sidebar}</aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-slate-200 bg-white/90 px-3 backdrop-blur sm:px-5">
          <button type="button" onClick={() => setDrawer(true)} aria-label="Open CMS menu" className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"><Menu className="h-5 w-5" /></button>
          <div className="min-w-0 flex-1 truncate text-sm">
            {current?.group ? <span className="text-slate-400">{current.group} / </span> : null}
            <span className="font-semibold text-slate-800">{current?.label}</span>
          </div>
          <button type="button" onClick={() => setPalette(true)} aria-label="Search" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"><Search className="h-4 w-4" /></button>
          <a href="/" target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"><ExternalLink className="h-4 w-4" /> <span className="hidden sm:inline">View site</span></a>
        </header>

        <main className="mx-auto max-w-[1600px] p-3 sm:p-5 lg:p-7" data-cms-tab={tab}>
          {tab === "dashboard" ? <Dashboard name={session?.name ?? ""} go={go} allowed={allowed} /> : null}
          {tab === "theme" ? <ThemeEditor /> : null}
          {tab === "navigation" ? <NavigationEditor /> : null}
          {tab === "footer" ? <FooterEditor /> : null}
          {tab === "layouts" ? <LayoutEditor onEditBlock={(id) => go("blocks", { id })} onNewBlock={() => go("blocks", { isNew: true })} /> : null}
          {tab === "copy" ? <CopyEditor /> : null}
          {tab === "settings" ? <SettingsEditor /> : null}
          {collectionTabs.includes(tab) ? <CollectionView key={tab} col={tab as never} openId={target?.id} startNew={target?.isNew} onConsumed={consumed} /> : null}
          {tab === "media" ? <MediaLibrary canDelete={isOwner || perms.includes("media")} /> : null}
          {tab === "messages" ? <><PageHeader title="Messages" intro="Contact messages, registrations and newsletter sign-ups from the website." /><div className="mt-5"><MessagesPanel notify={notify} /></div></> : null}
          {tab === "comments" ? <><PageHeader title="Comments" intro="Approve, reply to or remove comments on blog posts." /><div className="mt-5"><CommentsPanel notify={notify} /></div></> : null}
          {tab === "orders" ? <><PageHeader title="Orders" intro="Clothing orders, payments, delivery and collection." /><div className="mt-5"><OrdersPanel notify={notify} /></div></> : null}
          {tab === "team" ? <><PageHeader title="Sub-admins" intro="Invite people to help run the website and choose what they can manage." /><div className="mt-5"><SubAdminsPanel notify={notify} /></div></> : null}
          {tab === "account" ? <><PageHeader title="My account" /><div className="mt-5"><AccountPanel notify={notify} name={session?.name ?? ""} email={session?.username ?? ""} /></div></> : null}
        </main>
      </div>

      {palette ? <CommandPalette tabs={visible} onPick={(t) => go(t)} onClose={() => setPalette(false)} /> : null}
    </div>
  );
}

function CommandPalette({ tabs, onPick, onClose }: { tabs: typeof TABS; onPick: (t: CmsTab) => void; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);
  const term = q.trim().toLowerCase();
  const list = tabs.filter((t) => !term || `${t.label} ${t.group} ${t.keywords ?? ""}`.toLowerCase().includes(term));
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-900/40 px-3 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search the CMS" onClick={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-slate-200 px-4">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            ref={input}
            value={q}
            onChange={(e) => { setQ(e.target.value); setI(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setI((x) => Math.min(list.length - 1, x + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
              if (e.key === "Enter" && list[i]) onPick(list[i].key);
            }}
            placeholder="Jump to… (e.g. colours, menu, events)"
            aria-label="Search CMS sections"
            className="h-12 flex-1 bg-transparent text-sm outline-none"
          />
          <button type="button" onClick={onClose} aria-label="Close search" className="grid h-8 w-8 place-items-center rounded text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
          {list.map((t, k) => (
            <li key={t.key} role="option" aria-selected={k === i}>
              <button type="button" onMouseEnter={() => setI(k)} onClick={() => onPick(t.key)} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm", k === i ? "bg-blue-50 text-blue-800" : "text-slate-700")}>
                <t.icon className="h-4 w-4 text-slate-400" />
                <span className="font-semibold">{t.label}</span>
                {t.group ? <span className="ml-auto text-xs text-slate-400">{t.group}</span> : null}
              </button>
            </li>
          ))}
          {!list.length ? <li className="px-3 py-6 text-center text-sm text-slate-400">No matches.</li> : null}
        </ul>
      </div>
    </div>
  );
}
