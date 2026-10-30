"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Blocks, CalendarDays, CheckCircle2, Circle, FileText, Image as ImageIcon, LayoutTemplate, Mail, MessageSquare, Newspaper, Palette, Plus, ShoppingBag } from "lucide-react";
import type { CollectionName } from "@/lib/cms/types";
import { adminComments, adminList, adminListMeta, adminOrders, rpc } from "@/lib/cms/client";
import { cn } from "@/lib/cn";
import type { CmsTab } from "./nav";
import { PageHeader, Panel } from "./ui";

type Recent = { col: CollectionName; id: string; title: string; updatedAt: string };
const RECENT_COLS: CollectionName[] = ["posts", "events", "lessons", "gallery", "teachers", "products", "blocks", "custompages", "heroes", "faqs", "classes"];
const COL_LABEL: Partial<Record<CollectionName, string>> = { posts: "Blog post", events: "Event", lessons: "Lesson", gallery: "Album", teachers: "Teacher", products: "Product", blocks: "Block", custompages: "Custom page", heroes: "Page hero", faqs: "FAQ", classes: "Class" };

export function Dashboard({ name, go, allowed }: { name: string; go: (tab: CmsTab, opts?: { id?: string; isNew?: boolean }) => void; allowed: (t: CmsTab) => boolean }) {
  const [stats, setStats] = useState<Record<string, number | null>>({});
  const [recent, setRecent] = useState<Recent[] | null>(null);
  const [setup, setSetup] = useState<{ label: string; done: boolean; tab: CmsTab }[]>([]);

  useEffect(() => {
    let alive = true;
    const put = (k: string, v: number | null) => alive && setStats((s) => ({ ...s, [k]: v }));
    if (allowed("messages")) rpc<{ handled: boolean; data?: { site?: string } }[]>("kh_submissions_list").then((m) => put("messages", m.filter((x) => x.data?.site === "cm" && !x.handled).length)).catch(() => put("messages", null));
    if (allowed("comments")) adminComments().then((c) => put("comments", c.filter((x) => x.status === "pending").length)).catch(() => put("comments", null));
    if (allowed("orders")) adminOrders().then((o) => put("orders", o.filter((x) => !["completed", "cancelled"].includes(x.status)).length)).catch(() => put("orders", null));

    Promise.all(
      RECENT_COLS.filter((c) => allowed(c as CmsTab)).map((c) =>
        adminListMeta(c as never)
          .then(({ items, saved }) => {
            const docs = items as Array<Record<string, unknown>>;
            if (c === "posts") put("posts", docs.filter((d) => d.status === "published").length);
            if (c === "events") put("events", docs.filter((d) => d.status === "published" && String(d.date) >= new Date().toISOString().slice(0, 10)).length);
            if (!saved) return [] as Recent[]; // starter content, never edited
            return docs.filter((d) => d.updatedAt).map((d) => ({ col: c, id: String(d.id), title: String(d.title ?? d.name ?? d.question ?? String(d.body ?? "").slice(0, 50) ?? d.id).replace(/\*/g, ""), updatedAt: String(d.updatedAt) }));
          })
          .catch(() => [] as Recent[]),
      ),
    ).then((all) => alive && setRecent(all.flat().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8)));

    adminList("settings")
      .then((all) => {
        const s = (all.find((x) => x.id === "site") ?? {}) as Record<string, unknown>;
        const copy = (s.copy ?? {}) as Record<string, string>;
        if (!alive) return;
        setSetup([
          { label: "Choose your colours & fonts", done: !!(s.themePrimary || s.fontHeading), tab: "theme" as CmsTab },
          { label: "Upload your logo", done: !!s.logoUrl, tab: "theme" as CmsTab },
          { label: "Arrange the header menu", done: Array.isArray(s.menu) && (s.menu as unknown[]).length > 0, tab: "navigation" as CmsTab },
          { label: "Check contact details", done: !!s.phone && !String(s.email ?? "").includes("example"), tab: "settings" as CmsTab },
          { label: "Add your social media links", done: Array.isArray(s.socials) && (s.socials as string[]).some((x) => !x.includes("pcm-kids") && x.split("|")[3]), tab: "footer" as CmsTab },
          { label: "Personalise the home page layout", done: !!(s.layouts as Record<string, unknown> | undefined)?.home, tab: "layouts" as CmsTab },
          { label: "Review the site text", done: Object.keys(copy).length > 0, tab: "copy" as CmsTab },
        ].filter((x) => allowed(x.tab)));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [allowed]);

  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const cards: { key: string; label: string; icon: typeof Mail; tab: CmsTab; tone: string }[] = [
    { key: "messages", label: "New messages", icon: Mail, tab: "messages" as CmsTab, tone: "text-blue-600 bg-blue-50" },
    { key: "comments", label: "Comments to review", icon: MessageSquare, tab: "comments" as CmsTab, tone: "text-violet-600 bg-violet-50" },
    { key: "orders", label: "Open orders", icon: ShoppingBag, tab: "orders" as CmsTab, tone: "text-emerald-600 bg-emerald-50" },
    { key: "events", label: "Upcoming events", icon: CalendarDays, tab: "events" as CmsTab, tone: "text-orange-600 bg-orange-50" },
    { key: "posts", label: "Published posts", icon: Newspaper, tab: "posts" as CmsTab, tone: "text-pink-600 bg-pink-50" },
  ].filter((c) => allowed(c.tab));
  const quick: { label: string; icon: typeof Plus; tab: CmsTab; isNew?: boolean }[] = [
    { label: "Write a blog post", icon: Newspaper, tab: "posts" as CmsTab, isNew: true },
    { label: "Add an event", icon: CalendarDays, tab: "events" as CmsTab, isNew: true },
    { label: "New photo album", icon: ImageIcon, tab: "gallery" as CmsTab, isNew: true },
    { label: "Create a page", icon: FileText, tab: "custompages" as CmsTab, isNew: true },
    { label: "New content block", icon: Blocks, tab: "blocks" as CmsTab, isNew: true },
    { label: "Edit page layouts", icon: LayoutTemplate, tab: "layouts" as CmsTab },
    { label: "Change theme & fonts", icon: Palette, tab: "theme" as CmsTab },
  ].filter((q) => allowed(q.tab));
  const done = setup.filter((x) => x.done).length;

  return (
    <div className="grid gap-5" data-testid="cms-dashboard">
      <PageHeader
        title={`${hello}${name ? `, ${name.split(" ")[0]}` : ""}`}
        intro="Here's what's happening on the website. Every change you make is live as soon as you save."
      />

      {cards.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {cards.map((c) => (
            <button key={c.key} type="button" onClick={() => go(c.tab)} className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,.04)] transition hover:-translate-y-0.5 hover:shadow-md">
              <span className={cn("grid h-9 w-9 place-items-center rounded-lg", c.tone)}><c.icon className="h-[18px] w-[18px]" /></span>
              <span className="mt-3 block text-2xl font-bold tabular-nums text-slate-900">{stats[c.key] === undefined ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-slate-100" /> : stats[c.key] ?? "—"}</span>
              <span className="mt-0.5 flex items-center justify-between text-xs font-semibold text-slate-500">{c.label}<ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" /></span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-5">
          <Panel title="Quick actions">
            <div className="grid gap-2 sm:grid-cols-2">
              {quick.map((q) => (
                <button key={q.label} type="button" onClick={() => go(q.tab, { isNew: q.isNew })} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50/50">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-700"><q.icon className="h-4 w-4" /></span>
                  {q.label}
                  {q.isNew ? <Plus className="ml-auto h-4 w-4 text-slate-400" /> : <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />}
                </button>
              ))}
            </div>
          </Panel>
          <Panel title="Recently edited">
            {recent === null ? (
              <div className="grid gap-2">{[0, 1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />)}</div>
            ) : recent.length ? (
              <ul className="divide-y divide-slate-100">
                {recent.map((r) => (
                  <li key={r.col + r.id}>
                    <button type="button" onClick={() => go(r.col as CmsTab, { id: r.id })} className="flex w-full items-center gap-3 py-2.5 text-left">
                      <span className="w-24 shrink-0 text-xs font-semibold text-slate-400">{COL_LABEL[r.col] ?? r.col}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{r.title}</span>
                      <span className="shrink-0 text-xs text-slate-400">{new Date(r.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Nothing edited yet — the site is showing its starter content.</p>
            )}
          </Panel>
        </div>
        {setup.length ? (
          <Panel title="Make it yours" intro={`${done} of ${setup.length} done`}>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(done / setup.length) * 100}%` }} /></div>
            <ul className="grid gap-1">
              {setup.map((x) => (
                <li key={x.label}>
                  <button type="button" onClick={() => go(x.tab)} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50">
                    {x.done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> : <Circle className="h-5 w-5 shrink-0 text-slate-300" />}
                    <span className={cn("flex-1 font-medium", x.done ? "text-slate-400 line-through" : "text-slate-800")}>{x.label}</span>
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
