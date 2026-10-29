"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import type { CollectionName, Status } from "@/lib/cms/types";
import { SCHEMAS, blank, titleOf } from "./fields";
import { FieldEditor, uploadFile } from "./FieldEditor";
import { ProductPreview } from "./ProductPreview";
import { AccountPanel, SubAdminsPanel } from "./TeamPanels";
import { useAdmin } from "@/components/admin/AdminGate";
import { adminDelete, adminList, adminReset, adminUpsert, adminUpsertMany, deleteMedia, listMedia, rpc } from "@/lib/cms/client";
import { MessagesPanel } from "./MessagesPanel";
import type { ProductDoc } from "@/lib/cms/types";

type Doc = Record<string, unknown> & { id?: string; status?: Status; publishAt?: string; updatedAt?: string };
type Tab = Exclude<CollectionName, never> | "media" | "team" | "account" | "messages";
const PANEL_TABS = ["media", "team", "account", "messages"] as const;
const isPanel = (t: Tab) => (PANEL_TABS as readonly string[]).includes(t);
/** database permission section that guards each tab */
const PERM: Partial<Record<Tab, string>> = { settings: "pages", faqs: "pages", milestones: "pages", posts: "blog", units: "questions" };
const ORDERED = ["classes", "products", "teachers", "milestones", "faqs", "gallery", "units"];

const TABS: { key: Tab; label: string; icon: string; group: string }[] = [
  { key: "settings", label: "Site & pages", icon: "⚙️", group: "Website" },
  { key: "classes", label: "Classes", icon: "🏫", group: "Website" },
  { key: "lessons", label: "Lessons", icon: "📚", group: "Website" },
  { key: "teachers", label: "Teachers", icon: "👩‍🏫", group: "Website" },
  { key: "events", label: "Events", icon: "📅", group: "Website" },
  { key: "posts", label: "Feed posts", icon: "📝", group: "Website" },
  { key: "gallery", label: "Gallery", icon: "📸", group: "Website" },
  { key: "faqs", label: "FAQs", icon: "❔", group: "Website" },
  { key: "milestones", label: "History", icon: "🕰️", group: "Website" },
  { key: "units", label: "Game units", icon: "🗺️", group: "Kids Zone" },
  { key: "questions", label: "Game questions", icon: "❓", group: "Kids Zone" },
  { key: "mascots", label: "Mascots", icon: "🦁", group: "Kids Zone" },
  { key: "leaderboard", label: "Leaderboard", icon: "🏆", group: "Kids Zone" },
  { key: "products", label: "Clothing", icon: "👕", group: "Kids Zone" },
  { key: "media", label: "Media library", icon: "🖼️", group: "Admin" },
  { key: "messages", label: "Messages", icon: "✉️", group: "Admin" },
  { key: "team", label: "Sub-admins", icon: "👥", group: "Admin" },
  { key: "account", label: "My account", icon: "🔑", group: "Admin" },
];

const STATUS_STYLE: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-800",
  draft: "bg-black/5 text-black/60",
  scheduled: "bg-sky-100 text-sky-800",
  archived: "bg-amber-100 text-amber-800",
};

/**
 * Routes the CMS's requests to the database (the site is static, so there is no server API).
 * Permissions are enforced inside the database for every call.
 */
async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const u = new URL(url, "https://x");
  const method = (init?.method ?? "GET").toUpperCase();
  const body = init?.body ? JSON.parse(String(init.body)) : null;
  const seg = u.pathname.replace(/^\/api\/cms\//, "");

  if (seg === "upload") {
    if (method === "DELETE") {
      await deleteMedia(u.searchParams.get("key") ?? "");
      return { ok: true } as T;
    }
    return { items: await listMedia() } as T;
  }

  if (seg === "leaderboard") {
    if (method === "GET") return { items: await rpc("kh_admin_leaderboard") } as T;
    if (method === "DELETE") {
      await rpc("kh_admin_leaderboard_delete", { pid: u.searchParams.get("id") });
      return { ok: true } as T;
    }
    await rpc("kh_admin_leaderboard_save", {
      pid: body.id,
      nm: body.name,
      new_xp: Number(body.xp ?? 0),
      is_hidden: body.status === "archived",
    });
    return { item: { ...body, updatedAt: new Date().toISOString() } } as T;
  }

  const col = seg as Exclude<CollectionName, "leaderboard">;
  if (method === "GET") return { items: await adminList(col) } as T;
  if (method === "DELETE") {
    await adminDelete(col, u.searchParams.get("id") ?? "");
    return { ok: true } as T;
  }
  if (body?._action === "reset") {
    await adminReset(col);
    return { ok: true } as T;
  }
  if (body?._action === "bulk") {
    await adminUpsertMany(col, body.items);
    return { ok: true, count: body.items.length } as T;
  }
  const clean = Object.fromEntries(Object.entries(body ?? {}).filter(([, v]) => v !== undefined));
  return { item: await adminUpsert(col, clean) } as T;
}

function effectiveStatus(d: Doc) {
  if (d.status === "scheduled" && d.publishAt && new Date(d.publishAt).getTime() <= Date.now()) return "published";
  return d.status ?? "draft";
}

export function CmsApp() {
  const { session } = useAdmin();
  const isOwnerUser = session?.role === "owner";
  const visibleTabs = TABS.filter((t) => {
    if (t.key === "team") return isOwnerUser;
    if (t.key === "account") return true;
    if (t.key === "media") return true;
    return isOwnerUser || (session?.permissions ?? []).includes(PERM[t.key] ?? t.key);
  });
  const [tab, setTab] = useState<Tab>(() => visibleTabs[0]?.key ?? "lessons");
  const [items, setItems] = useState<Doc[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [lookups, setLookups] = useState<Record<string, { id: string; name: string }[]>>({});
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: "ok" | "err" } | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [extraFilter, setExtraFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [scheduleAt, setScheduleAt] = useState("");

  const notify = (msg: string, tone: "ok" | "err" = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async (t: Tab) => {
    if (isPanel(t)) return;
    setLoading(true);
    try {
      const d = await api<{ items: Doc[] }>(`/api/cms/${t}`);
      setItems(d.items);
    } catch (e) {
      notify((e as Error).message, "err");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
    setEditing(null);
    setQ("");
    setStatusFilter("all");
    setExtraFilter("");
    setPage(0);
  }, [tab, load]);

  useEffect(() => {
    api<{ items: Doc[] }>("/api/cms/classes")
      .then((d) => setClasses(d.items.map((c) => ({ id: String(c.id), name: String(c.name) }))))
      .catch(() => {});
  }, []);

  // option lists for "pick a teacher / class / event / lesson" fields
  useEffect(() => {
    const need: Record<string, string> = { teachers: "teachers", classes: "classes", events: "events", lessons: "lessons" };
    const want = new Set(
      (SCHEMAS[tab as Exclude<CollectionName, "leaderboard">] ?? []).filter((f) => f.source).map((f) => f.source as string),
    );
    want.forEach((src) => {
      api<{ items: Doc[] }>(`/api/cms/${need[src]}`)
        .then((d) =>
          setLookups((cur) => ({
            ...cur,
            [src]: d.items.map((x) => ({
              id: String(x.id),
              name: src === "lessons" ? `${x.title} — ${x.classId} (${x.lessonDate})` : src === "events" ? `${x.title} (${x.date})` : String(x.name ?? x.title),
            })),
          })),
        )
        .catch(() => {});
    });
  }, [tab]);

  // warn before leaving with unsaved changes
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const save = async (doc: Doc, patch: Partial<Doc> = {}, msg = "Saved") => {
    if (isPanel(tab)) return;
    const body = { ...doc, ...patch };
    if (tab === "settings") Object.assign(body, { id: "site", status: "published" });
    // validation
    const schema = tab !== "leaderboard" ? SCHEMAS[tab as Exclude<CollectionName, "leaderboard">] : [];
    for (const f of schema) {
      if (f.required && !String(body[f.key] ?? "").trim()) {
        notify(`“${f.label}” is required`, "err");
        return;
      }
    }
    if (tab === "questions") {
      const opts = ((body.options as string[]) ?? []).map((o) => o.trim()).filter(Boolean);
      if (opts.length < 2) return notify("Add at least two answer options", "err");
      if (!opts.includes(String(body.answer ?? "").trim())) return notify("Select the correct answer", "err");
      body.options = opts;
    }
    const clean = (k: string) => {
      if (Array.isArray(body[k])) body[k] = (body[k] as string[]).map((x) => String(x).trim()).filter(Boolean);
    };
    if (tab === "lessons") {
      ["discussion", "activitySteps"].forEach(clean);
      body.slug = String(body.slug || body.title || "")
        .toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
      if (items.some((d) => d.slug === body.slug && d.classId === body.classId && d.id !== body.id))
        return notify("This class already has a lesson with that URL name", "err");
      if (!body.id) body.id = `${body.classId}-${body.slug}`;
    }
    if (tab === "teachers") clean("highlights");
    if (tab === "units") clean("stories");
    if (tab === "settings") ["heroWords", "serviceTimes", "stats", "sundaySteps", "groups", "missionItems", "socials"].forEach(clean);
    if (tab === "products") {
      body.sizes = ((body.sizes as string[]) ?? []).map((s) => s.trim()).filter(Boolean);
    }
    try {
      const d = await api<{ item: Doc }>(`/api/cms/${tab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setEditing(d.item);
      setDirty(false);
      notify(msg + " — the live site is updated.");
      load(tab);
    } catch (e) {
      notify((e as Error).message, "err");
    }
  };

  const remove = async (doc: Doc) => {
    if (!doc.id) return setEditing(null);
    if (!confirm(`Delete “${titleOf(tab as CollectionName, doc)}” permanently? This cannot be undone. (Tip: Archive keeps it.)`)) return;
    try {
      await api(`/api/cms/${tab}?id=${encodeURIComponent(doc.id)}`, { method: "DELETE" });
      setEditing(null);
      setDirty(false);
      notify("Deleted");
      load(tab);
    } catch (e) {
      notify((e as Error).message, "err");
    }
  };

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    let list = items.filter((d) => !term || JSON.stringify(d).toLowerCase().includes(term));
    if (statusFilter !== "all") list = list.filter((d) => effectiveStatus(d) === statusFilter);
    if (extraFilter) {
      if (tab === "lessons") list = list.filter((d) => d.classId === extraFilter);
      if (tab === "questions") list = list.filter((d) => d.difficulty === extraFilter || d.story === extraFilter || d.testament === extraFilter);
    }
    if (tab === "leaderboard") list = [...list].sort((a, b) => Number(b.xp) - Number(a.xp));
    if (tab === "lessons") list = [...list].sort((a, b) => String(b.lessonDate).localeCompare(String(a.lessonDate)));
    if (ORDERED.includes(tab)) list = [...list].sort((a, b) => Number(a.order) - Number(b.order));
    if (tab === "posts" || tab === "events") list = [...list].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return list;
  }, [items, q, statusFilter, extraFilter, tab]);

  const PAGE = 40;
  const pageItems = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    items.forEach((d) => (c[effectiveStatus(d)] = (c[effectiveStatus(d)] ?? 0) + 1));
    return c;
  }, [items]);

  const stories = useMemo(() => (tab === "questions" ? [...new Set(items.map((d) => String(d.story)))].sort() : []), [items, tab]);

  const previewUrl = (d: Doc) => {
    if (tab === "lessons" && d.classId) return `/classes/lesson/?c=${d.classId}&l=${d.slug}&preview=${d.id}`;
    if (tab === "classes") return `/classes/view/?c=${d.id}`;
    if (tab === "products") return "/collection/";
    if (tab === "questions" || tab === "mascots" || tab === "leaderboard" || tab === "units") return "/games/";
    if (tab === "posts") return `/blog/#${d.id}`;
    if (tab === "events") return `/events/#${d.id}`;
    if (tab === "gallery") return `/gallery/?album=${d.id}`;
    if (tab === "teachers") return `/about/?teacher=${d.id}#teachers`;
    if (tab === "milestones") return "/about/#history";
    if (tab === "faqs") return "/contact/";
    return "/";
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Content manager</h1>
          <p className="text-sm text-black/60">Changes save to the database and appear on the live website straight away — no redeploy needed.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {visibleTabs.map((t, i) => [
          i === 0 || visibleTabs[i - 1].group !== t.group ? (
            <span key={`g-${t.group}`} className="self-center whitespace-nowrap pl-2 pr-1 text-[10px] font-extrabold uppercase tracking-widest text-black/40">{t.group}</span>
          ) : null,
          <button
            key={t.key}
            type="button"
            onClick={() => {
              if (dirty && !confirm("Discard unsaved changes?")) return;
              setDirty(false);
              setTab(t.key);
            }}
            className={cn(
              "whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-semibold ring-1 ring-black/10",
              tab === t.key ? "bg-blueBrand-600 text-white ring-transparent" : "bg-white hover:bg-blueBrand-50",
            )}
          >
            {t.icon} {t.label}
          </button>,
        ])}
      </div>

      {tab === "messages" ? (
        <MessagesPanel notify={notify} />
      ) : tab === "team" ? (
        <SubAdminsPanel notify={notify} />
      ) : tab === "account" ? (
        <AccountPanel notify={notify} name={session?.name ?? ""} email={session?.username ?? ""} />
      ) : tab === "media" ? (
        <MediaLibrary notify={notify} canDelete={isOwnerUser || (session?.permissions ?? []).includes("media")} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(320px,420px)_1fr]">
          {/* list */}
          <div className="rounded-3xl bg-white p-3 shadow-soft ring-1 ring-black/5">
            <div className="flex flex-wrap gap-2">
              <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search…" className="min-w-0 flex-1 rounded-xl px-3 py-2 text-sm ring-1 ring-black/10" />
              {tab !== "leaderboard" && tab !== "settings" ? (
                <button
                  type="button"
                  className="rounded-xl bg-blueBrand-600 px-3 py-2 text-sm font-bold text-white"
                  onClick={() => {
                    if (dirty && !confirm("Discard unsaved changes?")) return;
                    setEditing(blank(tab as CollectionName, tab === "lessons" && extraFilter ? { classId: extraFilter } : {}) as Doc);
                    setDirty(true);
                  }}
                >
                  + New
                </button>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap gap-1 text-xs">
              {["all", "published", "scheduled", "draft", "archived"].map((s) => (
                <button key={s} type="button" onClick={() => { setStatusFilter(s); setPage(0); }} className={cn("rounded-full px-2.5 py-1 font-semibold capitalize ring-1 ring-black/10", statusFilter === s && "bg-ink-950 text-white")}>
                  {s} {counts[s] ? `(${counts[s]})` : ""}
                </button>
              ))}
            </div>
            {tab === "lessons" ? (
              <select value={extraFilter} onChange={(e) => setExtraFilter(e.target.value)} className="mt-2 w-full rounded-xl px-3 py-2 text-sm ring-1 ring-black/10" aria-label="Filter by class">
                <option value="">All classes</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : null}
            {tab === "questions" ? (
              <>
                <select value={extraFilter} onChange={(e) => { setExtraFilter(e.target.value); setPage(0); }} className="mt-2 w-full rounded-xl px-3 py-2 text-sm ring-1 ring-black/10" aria-label="Filter questions">
                  <option value="">All stories & levels</option>
                  <optgroup label="Testament"><option value="OT">Old Testament</option><option value="NT">New Testament</option></optgroup>
                  <optgroup label="Difficulty">{["easy", "medium", "hard", "expert"].map((d) => <option key={d} value={d}>{d}</option>)}</optgroup>
                  <optgroup label="Story">{stories.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                </select>
                <BulkImport stories={stories} onDone={(n) => { notify(`Imported ${n} questions`); load("questions"); }} notify={notify} />
              </>
            ) : null}

            <div className="mt-3 text-xs text-black/50">{loading ? "Loading…" : `${filtered.length} item${filtered.length === 1 ? "" : "s"}`}</div>
            <ul className="mt-1 grid max-h-[65dvh] gap-1 overflow-y-auto pr-1">
              {pageItems.map((d) => {
                const st = effectiveStatus(d);
                return (
                  <li key={String(d.id)}>
                    <button
                      type="button"
                      onClick={() => {
                        if (dirty && !confirm("Discard unsaved changes?")) return;
                        setEditing(d);
                        setDirty(false);
                        setScheduleAt(d.publishAt ? String(d.publishAt).slice(0, 16) : "");
                      }}
                      className={cn("w-full rounded-2xl px-3 py-2 text-left text-sm ring-1 ring-transparent hover:bg-blueBrand-50", editing?.id === d.id && "bg-blueBrand-50 ring-blueBrand-300")}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="line-clamp-2 font-semibold">
                          {tab === "leaderboard" ? `${d.mascot ?? ""} ${d.name}` : titleOf(tab as CollectionName, d)}
                        </span>
                        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", STATUS_STYLE[st])}>{st}</span>
                      </span>
                      <span className="block text-xs text-black/50">
                        {tab === "lessons" && `${classes.find((c) => c.id === d.classId)?.name ?? d.classId} · ${d.lessonDate}`}
                        {tab === "questions" && `${d.testament} · ${d.difficulty} · ${d.story}`}
                        {tab === "products" && `${d.currency} ${d.price} · ${(d.colorways as unknown[])?.length ?? 0} colours`}
                        {tab === "leaderboard" && `${d.xp} XP · 🔥${d.streak} · ${(d.achievements as unknown[])?.length ?? 0} badges`}
                        {tab === "classes" && `${d.group} · ${d.ageRange}`}
                        {tab === "mascots" && `${d.emoji} · unlocks at ${d.unlockXp} XP`}
                        {tab === "posts" && `${d.kind} · ${d.date}${d.pinned === "yes" ? " · pinned" : ""}`}
                        {tab === "gallery" && `${d.category} · ${d.date}`}
                        {tab === "faqs" && String(d.category ?? "")}
                        {tab === "units" && `${d.icon} · ${d.testament} · ${(d.stories as unknown[])?.length || "all"} stories`}
                        {tab === "events" && `${d.date} · ${d.location}`}
                        {tab === "teachers" && String(d.role ?? "")}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {filtered.length > PAGE ? (
              <div className="mt-2 flex items-center justify-between text-xs">
                <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded-lg px-2 py-1 ring-1 ring-black/10 disabled:opacity-40">← Prev</button>
                <span>Page {page + 1} / {Math.ceil(filtered.length / PAGE)}</span>
                <button type="button" disabled={(page + 1) * PAGE >= filtered.length} onClick={() => setPage(page + 1)} className="rounded-lg px-2 py-1 ring-1 ring-black/10 disabled:opacity-40">Next →</button>
              </div>
            ) : null}
            {tab !== "leaderboard" ? (
              <button
                type="button"
                className="mt-3 text-xs text-black/40 underline"
                onClick={async () => {
                  if (!confirm(`Reset ALL ${tab} to the original starter content? Your changes to ${tab} will be lost.`)) return;
                  await api(`/api/cms/${tab}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ _action: "reset" }) });
                  notify("Reset to starter content");
                  load(tab);
                }}
              >
                Reset {tab} to starter content
              </button>
            ) : null}
          </div>

          {/* editor */}
          <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-black/5">
            {!editing ? (
              <div className="grid min-h-60 place-items-center text-center text-sm text-black/50">
                Select an item to edit{tab !== "leaderboard" ? ", or create a new one" : ""}.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  save(editing);
                }}
                className="grid gap-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 pb-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-black/40">{editing.id ? "Editing" : "New"} · {tab}</div>
                    <div className="font-display text-xl">{titleOf(tab as CollectionName, editing) || "Untitled"}</div>
                    {editing.updatedAt ? <div className="text-xs text-black/40">Last saved {new Date(String(editing.updatedAt)).toLocaleString()}</div> : null}
                  </div>
                  <span className={cn("rounded-full px-3 py-1 text-xs font-bold uppercase", STATUS_STYLE[effectiveStatus(editing)])}>
                    {effectiveStatus(editing)}
                    {editing.status === "scheduled" && editing.publishAt && effectiveStatus(editing) === "scheduled" ? ` · ${new Date(String(editing.publishAt)).toLocaleString()}` : ""}
                  </span>
                </div>

                {tab === "leaderboard" ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold uppercase text-black/55">Player name</span>
                      <input className="w-full rounded-xl px-3 py-2 text-sm ring-1 ring-black/15" value={String(editing.name ?? "")} onChange={(e) => { setEditing({ ...editing, name: e.target.value }); setDirty(true); }} />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold uppercase text-black/55">XP</span>
                      <input type="number" className="w-full rounded-xl px-3 py-2 text-sm ring-1 ring-black/15" value={Number(editing.xp ?? 0)} onChange={(e) => { setEditing({ ...editing, xp: Number(e.target.value) }); setDirty(true); }} />
                    </label>
                    <div className="text-sm text-black/60 sm:col-span-2">
                      Achievements: {((editing.achievements as string[]) ?? []).join(", ") || "none"} · Streak {String(editing.streak)} · Stories completed {String(editing.storiesCompleted ?? 0)}
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {tab === "products" ? (
                      <div className="md:col-span-2">
                        <ProductPreview product={editing as unknown as ProductDoc} />
                      </div>
                    ) : null}
                    {SCHEMAS[tab as Exclude<CollectionName, "leaderboard">].map((f) => (
                      <div key={f.key} className={f.wide ? "md:col-span-2" : ""}>
                        <FieldEditor
                          field={f}
                          doc={editing}
                          classes={classes}
                          lookups={lookups}
                          set={(k, v) => {
                            setEditing((cur) => ({ ...(cur ?? {}), [k]: v }));
                            setDirty(true);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* publishing */}
                <div className="sticky bottom-0 -mx-5 -mb-5 grid gap-3 rounded-b-3xl border-t border-black/5 bg-white/95 p-4 backdrop-blur">
                  {tab !== "leaderboard" && tab !== "settings" ? (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold">Schedule:</span>
                      <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} className="rounded-xl px-2 py-1.5 ring-1 ring-black/15" />
                      <button
                        type="button"
                        disabled={!scheduleAt}
                        onClick={() => save(editing, { status: "scheduled", publishAt: new Date(scheduleAt).toISOString() }, `Scheduled for ${new Date(scheduleAt).toLocaleString()}`)}
                        className="rounded-xl bg-sky-600 px-3 py-1.5 font-bold text-white disabled:opacity-40"
                      >
                        Schedule publish
                      </button>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <button type="submit" className="rounded-xl px-4 py-2 text-sm font-bold ring-1 ring-black/15">
                      {dirty ? "Save changes" : "Save"}
                    </button>
                    {tab !== "leaderboard" && tab !== "settings" ? (
                      <button type="button" onClick={() => save(editing, { status: "published", publishAt: undefined }, "Published")} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
                        Publish now
                      </button>
                    ) : null}
                    {tab === "settings" ? null : <>
                    {effectiveStatus(editing) === "published" || editing.status === "scheduled" ? (
                      <button type="button" onClick={() => save(editing, { status: "draft" }, "Unpublished")} className="rounded-xl px-4 py-2 text-sm font-bold ring-1 ring-black/15">
                        Unpublish
                      </button>
                    ) : null}
                    {editing.status !== "archived" ? (
                      <button type="button" disabled={!editing.id} onClick={() => save(editing, { status: "archived" }, tab === "leaderboard" ? "Hidden from leaderboard" : "Archived")} className="rounded-xl bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900 disabled:opacity-40">
                        {tab === "leaderboard" ? "Hide" : "Archive"}
                      </button>
                    ) : (
                      <button type="button" onClick={() => save(editing, { status: tab === "leaderboard" ? "published" : "draft" }, "Restored")} className="rounded-xl bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900">
                        Restore
                      </button>
                    )}
                    {editing.id && tab !== "leaderboard" ? (
                      <button
                        type="button"
                        onClick={() => {
                          const copy: Doc = { ...editing, id: undefined, status: "draft", createdAt: undefined, updatedAt: undefined };
                          if (copy.title) copy.title = `${copy.title} (copy)`;
                          else if (copy.name) copy.name = `${copy.name} (copy)`;
                          setEditing(copy);
                          setDirty(true);
                        }}
                        className="rounded-xl px-4 py-2 text-sm font-bold ring-1 ring-black/15"
                      >
                        Duplicate
                      </button>
                    ) : null}
                    {editing.id ? (
                      <a href={previewUrl(editing)} target="_blank" rel="noreferrer" className="rounded-xl px-4 py-2 text-sm font-bold text-blueBrand-700 ring-1 ring-blueBrand-200">
                        Preview ↗
                      </a>
                    ) : null}
                    <button type="button" onClick={() => remove(editing)} className="ml-auto rounded-xl px-4 py-2 text-sm font-bold text-red-700 ring-1 ring-red-200">
                      Delete
                    </button>
                    </>}
                  </div>
                  {tab === "lessons" && editing.id ? (
                    <p className="text-xs text-black/45">
                      Preview opens the class page showing this lesson even if it isn’t published. Resize the browser (or use your phone) to check the mobile layout. Archived lessons stay in the class archive with all their media and downloads.
                    </p>
                  ) : null}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {toast ? (
        <div role="status" className={cn("fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-card", toast.tone === "ok" ? "bg-ink-950" : "bg-red-600")}>
          {toast.msg}
        </div>
      ) : null}
    </div>
  );
}

function BulkImport({ stories, onDone, notify }: { stories: string[]; onDone: (n: number) => void; notify: (m: string, t?: "ok" | "err") => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [story, setStory] = useState("");
  const [ref, setRef] = useState("");
  const [testament, setTestament] = useState("OT");
  const [difficulty, setDifficulty] = useState("easy");
  const [busy, setBusy] = useState(false);

  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-2 w-full rounded-xl px-3 py-2 text-xs font-bold ring-1 ring-dashed ring-black/20">
        + Bulk import questions (paste Q & A)
      </button>
    );

  const parse = () => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const pairs: { q: string; a: string }[] = [];
    let cur: string | null = null;
    for (const l of lines) {
      if (/^answer\s*[:.\-]/i.test(l)) {
        if (cur) pairs.push({ q: cur, a: l.replace(/^answer\s*[:.\-]\s*/i, "").replace(/\.$/, "") });
        cur = null;
      } else cur = l.replace(/^\d+[.)]\s*/, "");
    }
    return pairs;
  };
  const pairs = parse();

  return (
    <div className="mt-2 grid gap-2 rounded-2xl bg-black/[0.03] p-3 text-xs">
      <div className="font-bold">Paste questions like:<br /><code>Who swallowed Jonah?<br />Answer: A great fish</code></div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-32 rounded-xl p-2 ring-1 ring-black/10" />
      <input list="story-list" value={story} onChange={(e) => setStory(e.target.value)} placeholder="Story name (e.g. Jonah and the Great Fish)" className="rounded-xl px-2 py-1.5 ring-1 ring-black/10" />
      <datalist id="story-list">{stories.map((s) => <option key={s} value={s} />)}</datalist>
      <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Bible reference (e.g. Jonah 1–3)" className="rounded-xl px-2 py-1.5 ring-1 ring-black/10" />
      <div className="flex gap-2">
        <select value={testament} onChange={(e) => setTestament(e.target.value)} className="flex-1 rounded-xl px-2 py-1.5 ring-1 ring-black/10"><option value="OT">Old Testament</option><option value="NT">New Testament</option></select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="flex-1 rounded-xl px-2 py-1.5 ring-1 ring-black/10">{["easy", "medium", "hard", "expert"].map((d) => <option key={d}>{d}</option>)}</select>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!pairs.length || !story || busy}
          onClick={async () => {
            setBusy(true);
            try {
              const answers = pairs.map((p) => p.a);
              const items = pairs.map((p, i) => {
                const others = answers.filter((a, j) => j !== i && a.toLowerCase() !== p.a.toLowerCase());
                const distract = [...new Set(others)].sort(() => Math.random() - 0.5).slice(0, 3);
                while (distract.length < 3) distract.push(["None of these", "Not mentioned", "Someone else"][distract.length]);
                const options = [...distract, p.a].sort(() => Math.random() - 0.5);
                return { question: p.q, answer: p.a, options, story, ref, testament, difficulty, status: "published" };
              });
              await api("/api/cms/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ _action: "bulk", items }),
              });
              onDone(pairs.length);
              setText("");
              setOpen(false);
            } catch (e) {
              notify((e as Error).message, "err");
            } finally {
              setBusy(false);
            }
          }}
          className="rounded-xl bg-blueBrand-600 px-3 py-2 font-bold text-white disabled:opacity-40"
        >
          {busy ? "Importing…" : `Import ${pairs.length} question${pairs.length === 1 ? "" : "s"}`}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="underline">Cancel</button>
      </div>
      <div className="text-black/50">Wrong-answer options are generated from the other answers — edit any question afterwards to fine-tune.</div>
    </div>
  );
}

function MediaLibrary({ notify, canDelete }: { notify: (m: string, t?: "ok" | "err") => void; canDelete: boolean }) {
  const [items, setItems] = useState<{ key: string; url: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => {
    api<{ items: { key: string; url: string }[] }>("/api/cms/upload").then((d) => setItems(d.items.reverse())).catch((e) => notify(e.message, "err"));
  }, [notify]);
  useEffect(() => {
    load();
  }, [load]);
  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-black/60">Upload images, videos, PDFs and Word files (max 50 MB). Copy a link to use it anywhere in the CMS.</p>
        <label className="cursor-pointer rounded-xl bg-blueBrand-600 px-4 py-2 text-sm font-bold text-white">
          {busy ? "Uploading…" : "+ Upload files"}
          <input
            type="file"
            multiple
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={async (e) => {
              const files = [...(e.target.files ?? [])];
              setBusy(true);
              for (const f of files) {
                try {
                  await uploadFile(f);
                } catch (x) {
                  notify(`${f.name}: ${(x as Error).message}`, "err");
                }
              }
              setBusy(false);
              e.target.value = "";
              load();
            }}
          />
        </label>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.length === 0 ? <div className="text-sm text-black/40">No uploads yet.</div> : null}
        {items.map((m) => (
          <div key={m.key} className="overflow-hidden rounded-2xl ring-1 ring-black/10">
            {/\.(png|jpe?g|gif|webp|svg)$/i.test(m.key) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.url} alt="" className="aspect-square w-full object-cover" loading="lazy" />
            ) : (
              <div className="grid aspect-square place-items-center bg-black/5 text-3xl">{/\.(mp4|webm|mov)$/i.test(m.key) ? "🎬" : "📄"}</div>
            )}
            <div className="grid gap-1 p-2 text-[11px]">
              <span className="truncate font-semibold" title={m.key}>{m.key.replace(/^[a-z0-9]+-/, "")}</span>
              <div className="flex gap-1">
                <button type="button" className="flex-1 rounded-lg px-2 py-1 ring-1 ring-black/10" onClick={() => { navigator.clipboard?.writeText(m.url); notify("Link copied"); }}>Copy link</button>
                {canDelete ? <button
                  type="button"
                  className="rounded-lg px-2 py-1 text-red-700 ring-1 ring-red-200"
                  onClick={async () => {
                    if (!confirm("Delete this file? Anything using it will show a broken link.")) return;
                    await api(`/api/cms/upload?key=${encodeURIComponent(m.key)}`, { method: "DELETE" });
                    load();
                  }}
                >
                  ✕
                </button> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
