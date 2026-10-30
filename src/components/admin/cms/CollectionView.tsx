"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarClock, Copy, ExternalLink, GripVertical, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import type { BlockDoc, CollectionName, ProductDoc, Status } from "@/lib/cms/types";
import {
  adminDelete, adminDeleteMany, adminList, adminPatchMany, adminReset, adminUpsert, adminUpsertMany, rpc,
} from "@/lib/cms/client";
import { sized } from "@/lib/img";
import { cn } from "@/lib/cn";
import { ContentBlock } from "@/components/blocks/ContentBlock";
import { SCHEMAS, blank, titleOf } from "./fields";
import { FieldEditor } from "./FieldEditor";
import { ProductPreview } from "./ProductPreview";
import { Btn, PageHeader, useNotify } from "./ui";

type Doc = Record<string, unknown> & { id?: string; status?: Status; publishAt?: string; updatedAt?: string };
type Col = Exclude<CollectionName, "settings">;

const ORDERED = ["classes", "products", "teachers", "milestones", "faqs", "gallery", "units", "mascots"];
const STATUS_STYLE: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  draft: "bg-slate-100 text-slate-600 ring-slate-500/20",
  scheduled: "bg-sky-50 text-sky-700 ring-sky-600/20",
  archived: "bg-amber-50 text-amber-800 ring-amber-600/20",
};

export const COLLECTION_META: Partial<Record<Col, { title: string; intro: string; noun: string }>> = {
  heroes: { title: "Page heroes", intro: "The big banner at the top of each page — heading, intro, photos and buttons.", noun: "hero" },
  blocks: { title: "Blocks", intro: "Reusable sections (text, images, videos, banners, cards, maps, social posts…) you can place on any page from Page layouts or Custom pages.", noun: "block" },
  custompages: { title: "Custom pages", intro: "Build new pages from blocks — no code. Add them to the menu under Navigation.", noun: "page" },
  faqs: { title: "FAQs", intro: "Questions and answers shown on the Home and Contact pages.", noun: "question" },
  milestones: { title: "History & achievements", intro: "Timeline milestones and achievements on the About page.", noun: "entry" },
  classes: { title: "Classes", intro: "Each class, its age range, room, teachers and colour.", noun: "class" },
  lessons: { title: "Lessons", intro: "Weekly Bible lessons with media, downloads and take-home activities.", noun: "lesson" },
  teachers: { title: "Teachers", intro: "Team portraits, roles, bios and credentials.", noun: "teacher" },
  events: { title: "Events", intro: "Calendar events with images, times and registration links.", noun: "event" },
  posts: { title: "Blog posts", intro: "Verses, photos, videos and news from the classrooms.", noun: "post" },
  gallery: { title: "Gallery", intro: "Photo and video albums.", noun: "album" },
  units: { title: "Game units", intro: "The learning path: units, their stories and colours.", noun: "unit" },
  questions: { title: "Game questions", intro: "Bible questions with answers, wrong options and explanations.", noun: "question" },
  mascots: { title: "Mascots", intro: "The friendly characters children choose in the games.", noun: "mascot" },
  leaderboard: { title: "Leaderboard", intro: "Players and scores. Hide or correct entries.", noun: "player" },
  products: { title: "Clothing", intro: "Products, photos, prices, sizes, colours and stock.", noun: "product" },
};

function effectiveStatus(d: Doc) {
  if (d.status === "scheduled" && d.publishAt && new Date(d.publishAt).getTime() <= Date.now()) return "published";
  return d.status ?? "draft";
}

function thumbOf(col: Col, d: Doc): string | null {
  const first = (v: unknown) => (Array.isArray(v) && v.length ? String(v[0]) : null);
  const pick: Partial<Record<Col, () => string | null>> = {
    lessons: () => (d.bannerUrl as string) || null,
    teachers: () => (d.photo as string) || null,
    events: () => (d.image as string) || null,
    posts: () => first(d.images),
    gallery: () => (d.cover as string) || first((d.media as { url: string }[] | undefined)?.map((m) => m.url)),
    products: () => first(d.photos) || ((d.colorways as { image?: string; frontImage?: string }[] | undefined)?.[0]?.image ?? null),
    heroes: () => (d.image as string) || null,
    milestones: () => (d.image as string) || null,
    blocks: () => (d.image as string) || first(d.images),
    custompages: () => (d.heroImage as string) || null,
  };
  const u = pick[col]?.();
  return u && /^(https?:|\/)/.test(u) ? u : null;
}

function subOf(col: Col, d: Doc, classes: { id: string; name: string }[]) {
  switch (col) {
    case "lessons": return `${classes.find((c) => c.id === d.classId)?.name ?? d.classId} · ${d.lessonDate}`;
    case "questions": return `${d.testament} · ${d.difficulty} · ${d.story}`;
    case "products": return `${d.currency} ${d.price} · ${(d.colorways as unknown[])?.length ?? 0} colours`;
    case "leaderboard": return `${d.xp} XP · 🔥${d.streak}`;
    case "classes": return `${d.group} · ${d.ageRange}`;
    case "mascots": return `unlocks at ${d.unlockXp} XP`;
    case "posts": return `${d.kind} · ${d.date}${d.pinned === "yes" ? " · pinned" : ""}`;
    case "gallery": return `${d.category} · ${d.date}`;
    case "faqs": return String(d.category ?? "");
    case "units": return `${d.testament} · ${(d.stories as unknown[])?.length || "all"} stories`;
    case "events": return `${d.date} · ${d.location}`;
    case "teachers": return String(d.role ?? "");
    case "blocks": return `${d.type} block`;
    case "custompages": return `/p/?s=${d.slug} · ${(d.blocks as unknown[])?.length ?? 0} blocks`;
    case "heroes": return `/${d.page || d.id}/`;
    default: return "";
  }
}

function glyphOf(col: Col, d: Doc) {
  if (col === "mascots") return String(d.emoji ?? "🙂");
  if (col === "units") return String(d.icon ?? "⭐");
  if (col === "leaderboard") return String(d.mascot ?? "🏅");
  return null;
}

function previewUrl(col: Col, d: Doc) {
  if (col === "lessons" && d.classId) return `/classes/lesson/?c=${d.classId}&l=${d.slug}&preview=${d.id}`;
  if (col === "classes") return `/classes/view/?c=${d.id}`;
  if (col === "products") return "/collection/";
  if (["questions", "mascots", "leaderboard", "units"].includes(col)) return "/games/";
  if (col === "posts") return `/blog/#${d.id}`;
  if (col === "events") return `/events/#${d.id}`;
  if (col === "gallery") return `/gallery/?album=${d.id}`;
  if (col === "teachers") return `/about/?teacher=${d.id}#team`;
  if (col === "milestones") return "/about/#history";
  if (col === "custompages") return `/p/?s=${d.slug}`;
  if (col === "heroes") {
    const id = String(d.id);
    return id === "home" ? "/" : id.startsWith("p-") ? `/p/?s=${id.slice(2)}` : `/${id}/`;
  }
  if (col === "faqs") return "/contact/";
  return "/";
}

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

/** List + editor for one content collection. */
export function CollectionView({ col, openId, startNew, onConsumed }: { col: Col; openId?: string | null; startNew?: boolean; onConsumed?: () => void }) {
  const notify = useNotify();
  const meta = COLLECTION_META[col] ?? { title: col, intro: "", noun: "item" };
  const [items, setItems] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [dirty, setDirty] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [extra, setExtra] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [scheduleAt, setScheduleAt] = useState("");
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [lookups, setLookups] = useState<Record<string, { id: string; name: string }[]>>({});
  const [drag, setDrag] = useState<string | null>(null);
  const schema = col === "leaderboard" ? [] : SCHEMAS[col as Exclude<Col, "leaderboard">] ?? [];
  const ordered = ORDERED.includes(col);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = col === "leaderboard" ? await rpc<Doc[]>("kh_admin_leaderboard") : ((await adminList(col as never)) as Doc[]);
      setItems(list);
    } catch (e) {
      notify((e as Error).message, "err");
    } finally {
      setLoading(false);
    }
  }, [col, notify]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    adminList("classes").then((c) => setClasses(c.map((x) => ({ id: x.id, name: x.name })))).catch(() => {});
    const want = new Set(schema.filter((f) => f.source).map((f) => f.source as string));
    want.forEach((src) => {
      adminList(src as never)
        .then((list) =>
          setLookups((cur) => ({
            ...cur,
            [src]: (list as Doc[]).map((x) => ({
              id: String(x.id),
              name: src === "lessons" ? `${x.title} — ${x.classId} (${x.lessonDate})` : src === "events" ? `${x.title} (${x.date})` : src === "blocks" ? `${x.title} (${x.type})` : String(x.name ?? x.title),
            })),
          })),
        )
        .catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [col]);

  // open a specific item / a new one when asked from elsewhere (dashboard, layout editor, search)
  useEffect(() => {
    if (startNew) {
      setEditing(blank(col, {}) as Doc);
      setDirty(true);
      onConsumed?.();
    } else if (openId && items.length) {
      const d = items.find((x) => x.id === openId);
      if (d) setEditing(d);
      onConsumed?.();
    }
  }, [openId, startNew, items, col, onConsumed]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const save = async (doc: Doc, patch: Partial<Doc> = {}, msg = "Saved") => {
    const body: Doc = { ...doc, ...patch };
    if (col === "leaderboard") {
      try {
        await rpc("kh_admin_leaderboard_save", { pid: body.id, nm: body.name, new_xp: Number(body.xp ?? 0), is_hidden: body.status === "archived" });
        notify(`${msg} — the live site is updated.`);
        setDirty(false);
        load();
      } catch (e) {
        notify((e as Error).message, "err");
      }
      return;
    }
    for (const f of schema) {
      if (f.required && !String(body[f.key] ?? "").trim()) return notify(`“${f.label}” is required`, "err");
    }
    if (col === "questions") {
      const opts = ((body.options as string[]) ?? []).map((o) => o.trim()).filter(Boolean);
      if (opts.length < 2) return notify("Add at least two answer options", "err");
      if (!opts.includes(String(body.answer ?? "").trim())) return notify("Select the correct answer", "err");
      body.options = opts;
    }
    const clean = (k: string) => { if (Array.isArray(body[k])) body[k] = (body[k] as string[]).map((x) => String(x).trim()).filter(Boolean); };
    if (col === "lessons") {
      ["discussion", "activitySteps"].forEach(clean);
      body.slug = slugify(String(body.slug || body.title || ""));
      if (items.some((d) => d.slug === body.slug && d.classId === body.classId && d.id !== body.id)) return notify("This class already has a lesson with that URL name", "err");
      if (!body.id) body.id = `${String(body.classId)}-${String(body.slug)}`;
    }
    if (col === "custompages") {
      body.slug = slugify(String(body.slug || body.title || ""));
      if (items.some((d) => d.slug === body.slug && d.id !== body.id)) return notify("Another page already uses that web address name", "err");
      if (!body.id) body.id = String(body.slug);
    }
    if (col === "teachers") clean("highlights");
    if (col === "units") clean("stories");
    if (col === "blocks") ["buttons", "items"].forEach(clean);
    if (col === "products") body.sizes = ((body.sizes as string[]) ?? []).map((s) => s.trim()).filter(Boolean);
    if (ordered && body.order === undefined) body.order = items.length + 1;
    try {
      const saved = (await adminUpsert(col as never, Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined)) as never)) as Doc;
      setEditing(saved);
      setDirty(false);
      notify(`${msg} — the live site is updated.`);
      load();
    } catch (e) {
      notify((e as Error).message, "err");
    }
  };

  const remove = async (doc: Doc) => {
    if (!doc.id) return setEditing(null);
    if (!confirm(`Delete “${titleOf(col, doc)}” permanently? This cannot be undone. (Tip: Archive keeps it.)`)) return;
    try {
      if (col === "leaderboard") await rpc("kh_admin_leaderboard_delete", { pid: doc.id });
      else await adminDelete(col as never, doc.id);
      setEditing(null);
      setDirty(false);
      notify("Deleted");
      load();
    } catch (e) {
      notify((e as Error).message, "err");
    }
  };

  const bulk = async (action: "published" | "draft" | "archived" | "delete") => {
    const ids = [...sel];
    if (!ids.length) return;
    if (action === "delete" && !confirm(`Delete ${ids.length} item${ids.length === 1 ? "" : "s"} permanently?`)) return;
    try {
      if (action === "delete") await adminDeleteMany(col as never, ids);
      else await adminPatchMany(col as never, Object.fromEntries(ids.map((id) => [id, { status: action, ...(action === "published" ? { publishAt: null } : {}) }])));
      notify(`${ids.length} item${ids.length === 1 ? "" : "s"} ${action === "delete" ? "deleted" : action === "published" ? "published" : action === "draft" ? "unpublished" : "archived"}`);
      setSel(new Set());
      load();
    } catch (e) {
      notify((e as Error).message, "err");
    }
  };

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    let list = items.filter((d) => !term || JSON.stringify(d).toLowerCase().includes(term));
    if (statusFilter !== "all") list = list.filter((d) => effectiveStatus(d) === statusFilter);
    if (col === "questions" && level) list = list.filter((d) => d.difficulty === level);
    if (extra) {
      if (col === "lessons") list = list.filter((d) => d.classId === extra);
      if (col === "questions") list = list.filter((d) => d.story === extra || d.testament === extra);
    }
    if (col === "leaderboard") list = [...list].sort((a, b) => Number(b.xp) - Number(a.xp));
    if (col === "lessons") list = [...list].sort((a, b) => String(b.lessonDate).localeCompare(String(a.lessonDate)));
    if (ordered) list = [...list].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));
    if (col === "posts" || col === "events") list = [...list].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return list;
  }, [items, q, statusFilter, extra, level, col, ordered]);

  const PAGE = 40;
  const pageItems = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    items.forEach((d) => (c[effectiveStatus(d)] = (c[effectiveStatus(d)] ?? 0) + 1));
    return c;
  }, [items]);
  const storyGroups = useMemo(() => {
    if (col !== "questions") return [];
    const seen = new Map<string, string>();
    items.forEach((d) => { if (d.story && !seen.has(String(d.story))) seen.set(String(d.story), String(d.testament)); });
    return ([["OT", "Old Testament stories"], ["NT", "New Testament stories"]] as const)
      .map(([t, l]) => [l, [...seen].filter(([, tt]) => tt === t).map(([s]) => s)] as const)
      .filter(([, l]) => l.length);
  }, [items, col]);

  const canReorder = ordered && !q && statusFilter === "all";
  const reorder = async (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const list = [...filtered];
    const from = list.findIndex((x) => x.id === fromId);
    const to = list.findIndex((x) => x.id === toId);
    const [x] = list.splice(from, 1);
    list.splice(to, 0, x);
    const patches = Object.fromEntries(list.map((d, i) => [String(d.id), { order: i + 1 }]));
    setItems((cur) => cur.map((d) => (patches[String(d.id)] ? { ...d, ...patches[String(d.id)] } : d)));
    try {
      await adminPatchMany(col as never, patches);
      notify("New order saved — the live site is updated.");
    } catch (e) {
      notify((e as Error).message, "err");
      load();
    }
  };

  const open = (d: Doc) => {
    if (dirty && !confirm("Discard unsaved changes?")) return;
    setEditing(d);
    setDirty(false);
    setScheduleAt(d.publishAt ? String(d.publishAt).slice(0, 16) : "");
  };
  const allOnPage = pageItems.length > 0 && pageItems.every((d) => sel.has(String(d.id)));

  /* ---------------- editor ---------------- */
  const editor = editing ? (
    <form
      onSubmit={(e) => { e.preventDefault(); save(editing); }}
      className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,.04)]"
      data-testid="cms-editor"
    >
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
        <button type="button" onClick={() => { if (!dirty || confirm("Discard unsaved changes?")) { setEditing(null); setDirty(false); } }} aria-label="Back to the list" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 xl:hidden">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{editing.id ? "Edit" : "New"} {meta.noun}</div>
          <div className="truncate text-base font-bold text-slate-900">{titleOf(col, editing) || "Untitled"}</div>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ring-1", STATUS_STYLE[effectiveStatus(editing)])}>{effectiveStatus(editing)}</span>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-2">
        {col === "leaderboard" ? (
          <>
            <label className="block"><span className="mb-1 block text-[13px] font-semibold text-slate-700">Player name</span><input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={String(editing.name ?? "")} onChange={(e) => { setEditing({ ...editing, name: e.target.value }); setDirty(true); }} /></label>
            <label className="block"><span className="mb-1 block text-[13px] font-semibold text-slate-700">XP</span><input type="number" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={Number(editing.xp ?? 0)} onChange={(e) => { setEditing({ ...editing, xp: Number(e.target.value) }); setDirty(true); }} /></label>
            <p className="text-sm text-slate-500 md:col-span-2">Badges: {((editing.achievements as string[]) ?? []).join(", ") || "none"} · Streak {String(editing.streak)}</p>
          </>
        ) : (
          <>
            {col === "products" ? <div className="md:col-span-2"><ProductPreview product={editing as unknown as ProductDoc} /></div> : null}
            {col === "blocks" ? (
              <div className="md:col-span-2">
                <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Live preview</div>
                <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-200 bg-[var(--color-cream)] pb-10 [zoom:.6]" data-testid="block-preview">
                  <ContentBlock b={editing as unknown as BlockDoc} />
                </div>
              </div>
            ) : null}
            {schema.map((f) => (
              <div key={f.key} className={f.wide || f.type === "heading" ? "md:col-span-2" : ""}>
                <FieldEditor field={f} doc={editing} classes={classes} lookups={lookups} set={(k, v) => { setEditing((cur) => ({ ...(cur ?? {}), [k]: v })); setDirty(true); }} />
              </div>
            ))}
          </>
        )}
      </div>

      <div className="sticky bottom-0 mt-auto grid gap-3 rounded-b-2xl border-t border-slate-200 bg-white/95 p-3 backdrop-blur">
        {col !== "leaderboard" ? (
          <details className="text-sm">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 font-semibold text-slate-600"><CalendarClock className="h-4 w-4" /> Schedule publishing</summary>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} aria-label="Publish at" className="h-9 rounded-lg border border-slate-200 px-2" />
              <Btn size="sm" disabled={!scheduleAt} onClick={() => save(editing, { status: "scheduled", publishAt: new Date(scheduleAt).toISOString() }, `Scheduled for ${new Date(scheduleAt).toLocaleString()}`)}>Schedule</Btn>
            </div>
          </details>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Btn type="submit" tone={dirty ? "primary" : "default"}>{dirty ? "Save changes" : "Save"}</Btn>
          {col !== "leaderboard" ? <Btn tone="success" onClick={() => save(editing, { status: "published", publishAt: undefined }, "Published")}>Publish</Btn> : null}
          {col !== "leaderboard" && (effectiveStatus(editing) === "published" || editing.status === "scheduled") ? <Btn onClick={() => save(editing, { status: "draft" }, "Unpublished")}>Unpublish</Btn> : null}
          {editing.status !== "archived" ? (
            <Btn disabled={!editing.id} onClick={() => save(editing, { status: "archived" }, col === "leaderboard" ? "Hidden" : "Archived")}>{col === "leaderboard" ? "Hide" : "Archive"}</Btn>
          ) : (
            <Btn onClick={() => save(editing, { status: col === "leaderboard" ? "published" : "draft" }, "Restored")}><RotateCcw className="h-4 w-4" /> Restore</Btn>
          )}
          {editing.id && col !== "leaderboard" ? (
            <Btn tone="ghost" onClick={() => {
              const copy: Doc = { ...editing, id: undefined, status: "draft", createdAt: undefined, updatedAt: undefined };
              if (copy.title) copy.title = `${copy.title} (copy)`;
              else if (copy.name) copy.name = `${copy.name} (copy)`;
              if (copy.slug) copy.slug = `${copy.slug}-copy`;
              setEditing(copy);
              setDirty(true);
            }}><Copy className="h-4 w-4" /> Duplicate</Btn>
          ) : null}
          {editing.id ? <a href={previewUrl(col, editing)} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"><ExternalLink className="h-4 w-4" /> View</a> : null}
          <Btn tone="danger" className="ml-auto" onClick={() => remove(editing)}><Trash2 className="h-4 w-4" /> Delete</Btn>
        </div>
        {editing.updatedAt ? <div className="text-[11px] text-slate-400">Last saved {new Date(String(editing.updatedAt)).toLocaleString()}</div> : null}
      </div>
    </form>
  ) : null;

  /* ---------------- list ---------------- */
  return (
    <div className="grid gap-5">
      <PageHeader
        title={meta.title}
        intro={meta.intro}
        actions={col !== "leaderboard" ? <Btn tone="primary" data-testid="cms-new" onClick={() => { if (dirty && !confirm("Discard unsaved changes?")) return; setEditing(blank(col, col === "lessons" && extra ? { classId: extra } : {}) as Doc); setDirty(true); }}><Plus className="h-4 w-4" /> New {meta.noun}</Btn> : undefined}
      />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(340px,440px)_1fr]">
        <div className={cn("rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,.04)]", editing && "hidden xl:block")}>
          <div className="grid gap-2 border-b border-slate-200 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder={`Search ${meta.title.toLowerCase()}…`} aria-label="Search" className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500" />
            </div>
            <div className="no-scrollbar flex gap-1 overflow-x-auto" role="tablist" aria-label="Status">
              {["all", "published", "scheduled", "draft", "archived"].map((s) => (
                <button key={s} type="button" role="tab" aria-selected={statusFilter === s} onClick={() => { setStatusFilter(s); setPage(0); }} className={cn("whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold capitalize", statusFilter === s ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100")}>
                  {s} {counts[s] ? <span className="opacity-60">{counts[s]}</span> : null}
                </button>
              ))}
            </div>
            {col === "lessons" ? (
              <select value={extra} onChange={(e) => setExtra(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-2 text-sm" aria-label="Filter by class">
                <option value="">All classes</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : null}
            {col === "questions" ? (
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <select value={extra} onChange={(e) => { setExtra(e.target.value); setPage(0); }} className="h-9 min-w-0 rounded-lg border border-slate-200 px-2 text-sm" aria-label="Filter questions by story">
                  <option value="">All stories ({items.length})</option>
                  <optgroup label="Testament"><option value="OT">Old Testament</option><option value="NT">New Testament</option></optgroup>
                  {storyGroups.map(([g, list]) => <optgroup key={g} label={g}>{list.map((s) => <option key={s} value={s}>{s} ({items.filter((d) => d.story === s).length})</option>)}</optgroup>)}
                </select>
                <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(0); }} className="h-9 rounded-lg border border-slate-200 px-2 text-sm capitalize" aria-label="Filter questions by level">
                  <option value="">All levels</option>
                  {["easy", "medium", "hard", "expert"].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            ) : null}
            {col === "questions" ? <BulkImport stories={storyGroups.flatMap(([, l]) => l)} onDone={(n) => { notify(`Imported ${n} questions`); load(); }} /> : null}
          </div>

          {sel.size ? (
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-blue-50 px-3 py-2 text-sm" data-testid="bulk-bar">
              <span className="mr-1 font-semibold text-blue-900">{sel.size} selected</span>
              <Btn size="sm" onClick={() => bulk("published")}>Publish</Btn>
              <Btn size="sm" onClick={() => bulk("draft")}>Unpublish</Btn>
              <Btn size="sm" onClick={() => bulk("archived")}>Archive</Btn>
              <Btn size="sm" tone="danger" onClick={() => bulk("delete")}>Delete</Btn>
              <button type="button" onClick={() => setSel(new Set())} className="ml-auto text-xs font-semibold text-blue-800 underline">Clear</button>
            </div>
          ) : null}

          <div className="flex items-center gap-2 px-3 pb-1 pt-2 text-xs text-slate-500">
            {col !== "leaderboard" ? <input type="checkbox" aria-label="Select all on this page" checked={allOnPage} onChange={() => setSel((s) => { const n = new Set(s); pageItems.forEach((d) => (allOnPage ? n.delete(String(d.id)) : n.add(String(d.id)))); return n; })} className="h-4 w-4 accent-blue-600" /> : null}
            <span>{loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? meta.noun : `${meta.noun}s`}`}</span>
            {canReorder ? <span className="ml-auto text-slate-400">Drag ⋮⋮ to reorder</span> : null}
          </div>
          <ul className="max-h-[68dvh] overflow-y-auto px-1.5 pb-2" data-testid="cms-list">
            {pageItems.map((d) => {
              const st = effectiveStatus(d);
              const th = thumbOf(col, d);
              const gl = glyphOf(col, d);
              const id = String(d.id);
              return (
                <li
                  key={id}
                  draggable={canReorder}
                  onDragStart={() => setDrag(id)}
                  onDragOver={(e) => canReorder && e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); if (drag) reorder(drag, id); setDrag(null); }}
                  onDragEnd={() => setDrag(null)}
                  className={cn("group flex items-center gap-2 rounded-xl px-1.5 py-1.5", editing?.id === d.id ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-slate-50", drag === id && "opacity-40")}
                >
                  {canReorder ? <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-slate-300 group-hover:text-slate-400" aria-hidden /> : null}
                  {col !== "leaderboard" ? <input type="checkbox" aria-label={`Select ${titleOf(col, d)}`} checked={sel.has(id)} onChange={() => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; })} className="h-4 w-4 shrink-0 accent-blue-600" /> : null}
                  <button type="button" onClick={() => open(d)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-lg" style={col === "classes" || col === "events" ? { background: String(d.color ?? "") || undefined } : undefined}>
                      {th ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sized(th, 80, 80)} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : gl ? gl : <span className="text-xs font-bold text-slate-400">{titleOf(col, d).slice(0, 1).toUpperCase()}</span>}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">{titleOf(col, d)}</span>
                      <span className="block truncate text-xs text-slate-500">{subOf(col, d, classes)}</span>
                    </span>
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1", STATUS_STYLE[st])}>{st}</span>
                  </button>
                </li>
              );
            })}
            {!loading && !filtered.length ? <li className="px-3 py-10 text-center text-sm text-slate-400">Nothing here yet.</li> : null}
          </ul>
          {filtered.length > PAGE ? (
            <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-xs">
              <Btn size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Btn>
              <span className="text-slate-500">Page {page + 1} of {Math.ceil(filtered.length / PAGE)}</span>
              <Btn size="sm" disabled={(page + 1) * PAGE >= filtered.length} onClick={() => setPage(page + 1)}>Next</Btn>
            </div>
          ) : null}
          {col !== "leaderboard" ? (
            <div className="border-t border-slate-200 px-3 py-2">
              <button type="button" className="text-xs text-slate-400 underline-offset-4 hover:underline" onClick={async () => {
                if (!confirm(`Reset ALL ${meta.title} to the original starter content? Your changes will be lost.`)) return;
                await adminReset(col as never);
                notify("Reset to starter content");
                load();
              }}>Reset {meta.title.toLowerCase()} to starter content</button>
            </div>
          ) : null}
        </div>

        {editor ?? (
          <div className="hidden min-h-[320px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500 xl:grid">
            Select {meta.noun === "hero" ? "a hero" : `a ${meta.noun}`} to edit{col !== "leaderboard" ? `, or create a new one` : ""}.
          </div>
        )}
      </div>
    </div>
  );
}

function BulkImport({ stories, onDone }: { stories: string[]; onDone: (n: number) => void }) {
  const notify = useNotify();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [story, setStory] = useState("");
  const [ref, setRef] = useState("");
  const [testament, setTestament] = useState("OT");
  const [difficulty, setDifficulty] = useState("easy");
  const [busy, setBusy] = useState(false);
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">+ Bulk import questions (paste Q &amp; A)</button>;
  const pairs: { q: string; a: string }[] = [];
  let cur: string | null = null;
  for (const l of text.split("\n").map((x) => x.trim()).filter(Boolean)) {
    if (/^answer\s*[:.\-]/i.test(l)) { if (cur) pairs.push({ q: cur, a: l.replace(/^answer\s*[:.\-]\s*/i, "").replace(/\.$/, "") }); cur = null; }
    else cur = l.replace(/^\d+[.)]\s*/, "");
  }
  return (
    <div className="grid gap-2 rounded-xl bg-slate-50 p-3 text-xs">
      <div className="font-semibold">Paste questions like:<br /><code>Who swallowed Jonah?<br />Answer: A huge fish</code></div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-28 rounded-lg border border-slate-200 p-2" aria-label="Questions to import" />
      <input list="story-list" value={story} onChange={(e) => setStory(e.target.value)} placeholder="Story name" className="h-8 rounded-lg border border-slate-200 px-2" />
      <datalist id="story-list">{stories.map((s) => <option key={s} value={s} />)}</datalist>
      <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Bible reference" className="h-8 rounded-lg border border-slate-200 px-2" />
      <div className="flex gap-2">
        <select value={testament} onChange={(e) => setTestament(e.target.value)} className="h-8 flex-1 rounded-lg border border-slate-200 px-2"><option value="OT">Old Testament</option><option value="NT">New Testament</option></select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="h-8 flex-1 rounded-lg border border-slate-200 px-2">{["easy", "medium", "hard", "expert"].map((d) => <option key={d}>{d}</option>)}</select>
      </div>
      <div className="flex items-center gap-2">
        <Btn size="sm" tone="primary" disabled={!pairs.length || !story || busy} onClick={async () => {
          setBusy(true);
          try {
            const answers = pairs.map((p) => p.a);
            const items = pairs.map((p, i) => {
              const others = answers.filter((a, j) => j !== i && a.toLowerCase() !== p.a.toLowerCase());
              const distract = [...new Set(others)].sort(() => Math.random() - 0.5).slice(0, 3);
              while (distract.length < 3) distract.push(["None of these", "Not mentioned", "Someone else"][distract.length]);
              return { question: p.q, answer: p.a, options: [...distract, p.a].sort(() => Math.random() - 0.5), story, ref, testament, difficulty, explain: "", status: "published" };
            });
            await adminUpsertMany("questions", items);
            onDone(pairs.length);
            setText("");
            setOpen(false);
          } catch (e) {
            notify((e as Error).message, "err");
          } finally {
            setBusy(false);
          }
        }}>{busy ? "Importing…" : `Import ${pairs.length} question${pairs.length === 1 ? "" : "s"}`}</Btn>
        <button type="button" onClick={() => setOpen(false)} className="underline">Cancel</button>
      </div>
      <p className="text-slate-500">Wrong-answer options are generated from the other answers — edit each question afterwards to write better options and an explanation.</p>
    </div>
  );
}
