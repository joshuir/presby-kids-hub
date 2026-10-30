"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Eye, EyeOff, KeyRound, Plus, RefreshCw, Search, ShieldCheck, Trash2, UserCheck, UserX } from "lucide-react";
import { cn } from "@/lib/cn";
import { USERNAME_RE, loginLabel, rpc, staffAction, supa, STAFF_DOMAIN } from "@/lib/cms/client";
import { Btn, Panel } from "./ui";

type Sub = {
  email: string;
  username?: string | null;
  name: string;
  permissions: string[];
  disabled: boolean;
  createdAt: string;
  lastSeenAt?: string | null;
};

/** What a sub-admin can be given, grouped the way the CMS sidebar is. */
const GROUPS: { title: string; items: { key: string; label: string; help?: string }[] }[] = [
  { title: "Website", items: [
    { key: "pages", label: "Website & pages", help: "Theme, menus, footer, social media, page layouts, site text, settings, FAQs, history" },
    { key: "media", label: "Delete from media library", help: "Everyone can upload; this allows deleting files" },
  ] },
  { title: "Content", items: [
    { key: "blog", label: "Blog & comments" },
    { key: "events", label: "Events" },
    { key: "gallery", label: "Gallery" },
    { key: "classes", label: "Classes" },
    { key: "lessons", label: "Lessons" },
    { key: "teachers", label: "Teachers" },
  ] },
  { title: "Kids Zone", items: [
    { key: "questions", label: "Game units & questions" },
    { key: "mascots", label: "Mascots" },
    { key: "leaderboard", label: "Leaderboard" },
  ] },
  { title: "Shop", items: [{ key: "products", label: "Clothing & orders" }] },
  { title: "People & inbox", items: [
    { key: "messages", label: "Messages & registrations" },
    { key: "parents", label: "Parents & children", help: "Personal data — give only to people who need it" },
    { key: "analytics", label: "Analytics" },
  ] },
];
const ALL = GROUPS.flatMap((g) => g.items.map((i) => i.key));

const field = "h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50 disabled:text-slate-500";

/** A readable random password, e.g. "hT7k-9wQm-Ra4z". */
function makePassword() {
  const abc = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const r = new Uint32Array(12);
  crypto.getRandomValues(r);
  const c = Array.from(r, (n) => abc[n % abc.length]);
  return [c.slice(0, 4), c.slice(4, 8), c.slice(8, 12)].map((g) => g.join("")).join("-");
}
const suggestUsername = (name: string) =>
  name.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "").slice(0, 30);
const isStaff = (email: string) => email.endsWith(`@${STAFF_DOMAIN}`);
const signInUrl = () => (typeof window !== "undefined" ? `${window.location.origin}/admin/` : "/admin/");
const ago = (iso?: string | null) => {
  if (!iso) return "Hasn’t signed in yet";
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 90) return "Active just now";
  if (d < 3600) return `Active ${Math.round(d / 60)} min ago`;
  if (d < 86400) return `Active ${Math.round(d / 3600)} h ago`;
  return `Last active ${new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`;
};

type Draft = { name: string; username: string; permissions: string[]; password: string; mustChange: boolean };
type View = null | { mode: "new" } | { mode: "edit"; sub: Sub } | { mode: "done"; name: string; username: string; password: string; isNew: boolean };

/** Main admin: create sub-admin logins (username + password), set what they can manage, reset, deactivate or remove. */
export function SubAdminsPanel({ notify }: { notify: (m: string, t?: "ok" | "err") => void }) {
  const [items, setItems] = useState<Sub[] | null>(null);
  const [view, setView] = useState<View>(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    try {
      setItems(await rpc<Sub[]>("kh_admins_list"));
    } catch (e) {
      notify((e as Error).message, "err");
      setItems([]);
    }
  }, [notify]);
  useEffect(() => {
    let live = true;
    rpc<Sub[]>("kh_admins_list")
      .then((v) => live && setItems(v))
      .catch((e) => {
        if (!live) return;
        notify((e as Error).message, "err");
        setItems([]);
      });
    return () => {
      live = false;
    };
  }, [notify]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (items ?? []).filter((a) => !t || `${a.name} ${a.username ?? ""} ${a.email}`.toLowerCase().includes(t));
  }, [items, q]);
  const selected = view?.mode === "edit" ? view.sub.email : null;
  const active = (items ?? []).filter((a) => !a.disabled).length;

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(300px,400px)_1fr]" data-testid="subadmins">
      <Panel
        title={`Sub-admins (${items?.length ?? 0})`}
        intro={items ? `${active} active · ${(items?.length ?? 0) - active} deactivated` : "Loading…"}
        actions={<Btn tone="primary" size="sm" onClick={() => setView({ mode: "new" })} data-testid="add-subadmin"><Plus className="h-4 w-4" /> Add sub-admin</Btn>}
      >
        {(items?.length ?? 0) > 4 ? (
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or username" aria-label="Search sub-admins" className={cn(field, "pl-9")} />
          </div>
        ) : null}
        <ul className="grid gap-1.5" data-testid="subadmin-list">
          {items && !items.length ? <li className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">No sub-admins yet. Add someone to help run the website.</li> : null}
          {list.map((a) => (
            <li key={a.email}>
              <button
                type="button"
                onClick={() => setView({ mode: "edit", sub: a })}
                data-subadmin={a.username || a.email}
                aria-current={selected === a.email ? "true" : undefined}
                className={cn("flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition", selected === a.email ? "border-blue-500 bg-blue-50" : "border-transparent hover:bg-slate-50")}
              >
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold", a.disabled ? "bg-slate-200 text-slate-500" : "bg-blue-600 text-white")}>
                  {a.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={cn("truncate text-sm font-semibold", a.disabled ? "text-slate-500" : "text-slate-900")}>{a.name}</span>
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", a.disabled ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-800")}>
                      {a.disabled ? "Deactivated" : "Active"}
                    </span>
                  </span>
                  <span className="block truncate text-xs text-slate-500">{a.username ? `@${a.username}` : `${a.email} (email sign-in)`}</span>
                  <span className="block truncate text-xs text-slate-400">{ago(a.lastSeenAt)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          Sub-admins sign in at <span className="break-all font-mono text-slate-800">{signInUrl()}</span> with the <b>username and password you set here</b> — no email needed. They only see the sections you choose.
        </div>
      </Panel>

      <div>
        {view === null ? (
          <Panel>
            <div className="grid min-h-60 place-items-center text-center text-sm text-slate-500">
              <div>
                <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                Select a sub-admin to edit them, or add a new one.
              </div>
            </div>
          </Panel>
        ) : view.mode === "done" ? (
          <Credentials {...view} onClose={() => setView(null)} />
        ) : (
          <SubForm
            key={view.mode === "edit" ? view.sub.email : "new"}
            sub={view.mode === "edit" ? view.sub : null}
            taken={(items ?? []).filter((a) => view.mode === "new" || a.email !== view.sub.email).map((a) => a.username ?? "")}
            notify={notify}
            onSaved={async (r) => {
              await load();
              if (r.showCreds) setView({ mode: "done", name: r.name, username: r.username, password: r.password, isNew: r.isNew });
              else if (r.removed) setView(null);
              else {
                const fresh = (await rpc<Sub[]>("kh_admins_list").catch(() => [])).find((a) => a.email === r.email);
                setView(fresh ? { mode: "edit", sub: fresh } : null);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

function SubForm({ sub, taken, notify, onSaved }: {
  sub: Sub | null;
  taken: string[];
  notify: (m: string, t?: "ok" | "err") => void;
  onSaved: (r: { email?: string; name: string; username: string; password: string; isNew: boolean; showCreds?: boolean; removed?: boolean }) => void;
}) {
  const isNew = !sub;
  const [d, setD] = useState<Draft>(() => ({
    name: sub?.name ?? "",
    username: sub?.username ?? (sub && isStaff(sub.email) ? loginLabel(sub.email) : ""),
    permissions: sub?.permissions ?? [],
    password: isNew ? makePassword() : "",
    mustChange: false,
  }));
  const [touchedUser, setTouchedUser] = useState(!isNew);
  const [showPw, setShowPw] = useState(isNew);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<null | "deactivate" | "remove">(null);
  const set = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }));

  const uname = d.username.trim().toLowerCase();
  const userErr = !uname
    ? isNew || (sub && isStaff(sub.email)) ? "Choose a username." : ""
    : !USERNAME_RE.test(uname)
      ? "3–30 characters: lowercase letters, numbers, dots, dashes or underscores (start with a letter or number)."
      : taken.includes(uname)
        ? "That username is already taken."
        : "";
  const pwErr = d.password && d.password.length < 10 ? "Use at least 10 characters." : isNew && !d.password ? "Set a password." : "";
  const canSave = !!d.name.trim() && !userErr && !pwErr && !busy;
  const legacy = !!sub && !sub.username && !isStaff(sub.email);

  const submit = async () => {
    if (!canSave) return;
    setBusy(true);
    try {
      if (isNew) {
        await staffAction({ action: "create", username: uname, name: d.name.trim(), password: d.password, permissions: d.permissions, mustChange: d.mustChange });
        notify(`${d.name.trim()} can now sign in as “${uname}”.`);
        onSaved({ name: d.name.trim(), username: uname, password: d.password, isNew: true, showCreds: true });
      } else {
        const r = await staffAction({ action: "update", email: sub.email, username: uname, name: d.name.trim(), permissions: d.permissions, active: !sub.disabled, ...(d.password ? { password: d.password, mustChange: d.mustChange } : {}) });
        notify(d.password ? "Saved — new password set." : "Changes saved.");
        const loginChanged = uname && uname !== (sub.username ?? "");
        onSaved({ email: r.email, name: d.name.trim(), username: uname || sub.email, password: d.password, isNew: false, showCreds: !!d.password || !!loginChanged });
      }
    } catch (e) {
      notify((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  };

  const setActive = async (on: boolean) => {
    if (!sub) return;
    setBusy(true);
    try {
      await staffAction({ action: "update", email: sub.email, username: sub.username ?? (isStaff(sub.email) ? loginLabel(sub.email) : ""), name: sub.name, permissions: sub.permissions, active: on });
      notify(on ? `${sub.name} can sign in again.` : `${sub.name} is deactivated and can no longer sign in.`);
      setConfirm(null);
      onSaved({ email: sub.email, name: sub.name, username: sub.username ?? "", password: "", isNew: false });
    } catch (e) {
      notify((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!sub) return;
    setBusy(true);
    try {
      await staffAction({ action: "delete", email: sub.email });
      notify(`${sub.name} has been removed.`);
      onSaved({ name: sub.name, username: "", password: "", isNew: false, removed: true });
    } catch (e) {
      notify((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="grid gap-5"
      data-testid="subadmin-form"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Panel
        title={isNew ? "New sub-admin" : sub.name}
        intro={isNew ? "Set their sign-in details and what they can manage. You’ll get the details to hand over at the end." : sub.disabled ? "Deactivated — this person can’t sign in." : ago(sub.lastSeenAt)}
      >
        {sub?.disabled ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" data-testid="deactivated-note">
            <span><b>Deactivated.</b> Their details are kept, but they can’t sign in or change anything.</span>
            <Btn size="sm" tone="success" type="button" disabled={busy} onClick={() => setActive(true)} data-testid="reactivate"><UserCheck className="h-4 w-4" /> Reactivate</Btn>
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[13px] font-semibold text-slate-700">Full name</span>
            <input
              className={field}
              value={d.name}
              required
              maxLength={60}
              aria-label="Full name"
              onChange={(e) => set({ name: e.target.value, ...(touchedUser ? {} : { username: suggestUsername(e.target.value) }) })}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-semibold text-slate-700">Username</span>
            <input
              className={cn(field, userErr && d.username && "border-red-400")}
              value={d.username}
              aria-label="Username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="off"
              placeholder={legacy ? "Add one to switch to username sign-in" : "e.g. kofi.mensah"}
              onChange={(e) => {
                setTouchedUser(true);
                set({ username: e.target.value.toLowerCase().replace(/\s+/g, "") });
              }}
            />
            <span className={cn("mt-1 block text-xs", userErr && d.username ? "text-red-700" : "text-slate-500")} data-testid="username-hint">
              {userErr && d.username ? userErr : legacy && !uname ? `Signs in with ${sub.email} for now.` : "This is what they type to sign in."}
            </span>
          </label>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><KeyRound className="h-4 w-4 text-slate-400" /> {isNew ? "Password" : "Reset password"}</div>
              <p className="text-xs text-slate-500">{isNew ? "A strong one is filled in for you — change it if you like." : "Leave empty to keep their current password."}</p>
            </div>
            <Btn size="sm" type="button" onClick={() => { set({ password: makePassword() }); setShowPw(true); }} data-testid="generate-password"><RefreshCw className="h-4 w-4" /> Generate</Btn>
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className={cn(field, "font-mono", pwErr && d.password && "border-red-400")}
              type={showPw ? "text" : "password"}
              value={d.password}
              aria-label={isNew ? "Password" : "New password"}
              autoComplete="new-password"
              placeholder={isNew ? "" : "New password (10+ characters)"}
              onChange={(e) => set({ password: e.target.value })}
            />
            <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {pwErr && d.password ? <p className="mt-1 text-xs text-red-700">{pwErr}</p> : null}
          {d.password ? (
            <label className="mt-3 flex items-start gap-2 text-sm text-slate-700">
              <input type="checkbox" className="mt-0.5 h-4 w-4" checked={d.mustChange} onChange={(e) => set({ mustChange: e.target.checked })} data-testid="must-change" />
              <span>Ask them to choose their own password the first time they sign in</span>
            </label>
          ) : null}
        </div>
      </Panel>

      <Panel
        title="What they can manage"
        intro="They only see these sections in the CMS. Change this any time."
        actions={
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" className="h-4 w-4" checked={ALL.every((k) => d.permissions.includes(k))} onChange={(e) => set({ permissions: e.target.checked ? ALL : [] })} data-testid="perm-all" />
            Full access
          </label>
        }
      >
        <div className="grid gap-4 md:grid-cols-2" data-testid="permissions">
          {GROUPS.map((g) => (
            <fieldset key={g.title} className="min-w-0">
              <legend className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">{g.title}</legend>
              <div className="grid gap-1.5">
                {g.items.map((it) => {
                  const on = d.permissions.includes(it.key);
                  return (
                    <label key={it.key} className={cn("flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-sm transition", on ? "border-blue-300 bg-blue-50/60" : "border-slate-200 hover:bg-slate-50")}>
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4"
                        checked={on}
                        data-perm={it.key}
                        onChange={(e) => set({ permissions: e.target.checked ? [...d.permissions, it.key] : d.permissions.filter((x) => x !== it.key) })}
                      />
                      <span className="min-w-0">
                        <span className="block font-semibold text-slate-800">{it.label}</span>
                        {it.help ? <span className="block text-xs text-slate-500">{it.help}</span> : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
        {!d.permissions.length ? <p className="mt-3 text-xs text-amber-700">No sections ticked — they’ll be able to sign in but won’t be able to change anything.</p> : null}
      </Panel>

      <div className="sticky bottom-3 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
        <Btn tone="primary" type="submit" disabled={!canSave} data-testid="save-subadmin">{busy ? "Saving…" : isNew ? "Create sub-admin" : "Save changes"}</Btn>
        {!isNew && !sub.disabled ? (
          confirm === "deactivate" ? (
            <span className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
              Deactivate {sub.name.split(" ")[0]}?
              <Btn size="sm" tone="danger" type="button" disabled={busy} onClick={() => setActive(false)} data-testid="confirm-deactivate">Yes, deactivate</Btn>
              <Btn size="sm" type="button" onClick={() => setConfirm(null)}>Cancel</Btn>
            </span>
          ) : (
            <Btn type="button" onClick={() => setConfirm("deactivate")} disabled={busy} data-testid="deactivate"><UserX className="h-4 w-4" /> Deactivate</Btn>
          )
        ) : null}
        {!isNew ? (
          confirm === "remove" ? (
            <span className="ml-auto flex flex-wrap items-center gap-2 text-sm text-slate-700">
              Remove for good?
              <Btn size="sm" tone="danger" type="button" disabled={busy} onClick={remove} data-testid="confirm-remove">Yes, remove</Btn>
              <Btn size="sm" type="button" onClick={() => setConfirm(null)}>Cancel</Btn>
            </span>
          ) : (
            <Btn tone="ghost" type="button" className="ml-auto text-red-700" onClick={() => setConfirm("remove")} disabled={busy} data-testid="remove"><Trash2 className="h-4 w-4" /> Remove</Btn>
          )
        ) : null}
      </div>
    </form>
  );
}

/** Shown after creating someone or resetting their password: the details to pass on. */
function Credentials({ name, username, password, isNew, onClose }: { name: string; username: string; password: string; isNew: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const text = `Children's Ministry website — staff sign-in\nPage: ${signInUrl()}\nUsername: ${username}${password ? `\nPassword: ${password}` : ""}`;
  return (
    <Panel title={isNew ? `${name} is ready to sign in` : `New sign-in details for ${name}`} intro="Pass these on privately (in person or by direct message). The password isn’t shown again — you can always set a new one.">
      <dl className="grid gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm" data-testid="credentials">
        <div className="flex flex-wrap gap-x-3"><dt className="w-24 font-semibold text-emerald-900">Sign-in page</dt><dd className="break-all font-mono text-slate-800">{signInUrl()}</dd></div>
        <div className="flex flex-wrap gap-x-3"><dt className="w-24 font-semibold text-emerald-900">Username</dt><dd className="font-mono text-slate-800" data-testid="cred-username">{username}</dd></div>
        {password ? <div className="flex flex-wrap gap-x-3"><dt className="w-24 font-semibold text-emerald-900">Password</dt><dd className="font-mono text-slate-800" data-testid="cred-password">{password}</dd></div> : null}
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <Btn
          tone="primary"
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy details"}
        </Btn>
        <Btn type="button" onClick={onClose}>Done</Btn>
      </div>
    </Panel>
  );
}

/** Any admin: change own password. */
export function AccountPanel({ notify, name, email }: { notify: (m: string, t?: "ok" | "err") => void; name: string; email: string }) {
  const [next, setNext] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  return (
    <Panel title="Change my password" intro={`${name} · signed in as ${email}`} className="max-w-lg">
      <form
        className="grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (next.length < 10) return notify("Use at least 10 characters.", "err");
          if (next !== confirmPw) return notify("New passwords don’t match", "err");
          const { error } = await supa().auth.updateUser({ password: next, data: { must_change_password: false } });
          if (error) return notify(error.message, "err");
          setNext("");
          setConfirmPw("");
          notify("Password changed");
        }}
      >
        <input className={field} type="password" aria-label="New password" placeholder="New password (10+ characters)" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" minLength={10} required />
        <input className={field} type="password" aria-label="Confirm new password" placeholder="Confirm new password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} autoComplete="new-password" required />
        <Btn tone="primary" type="submit" className="justify-self-start">Change password</Btn>
      </form>
    </Panel>
  );
}
