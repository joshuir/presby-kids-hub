"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { rpc, supa } from "@/lib/cms/client";

type Sub = {
  email: string;
  name: string;
  permissions: string[];
  disabled: boolean;
  createdAt: string;
  lastSeenAt?: string | null;
};

const SECTIONS: { key: string; label: string }[] = [
  { key: "lessons", label: "Lessons" },
  { key: "classes", label: "Classes" },
  { key: "questions", label: "Game questions" },
  { key: "mascots", label: "Mascots" },
  { key: "leaderboard", label: "Leaderboard" },
  { key: "products", label: "Clothing" },
  { key: "pages", label: "Site & pages (settings, policies, testimonials, history, constitution)" },
  { key: "blog", label: "Blog" },
  { key: "events", label: "Events" },
  { key: "teachers", label: "Teachers" },
  { key: "parents", label: "Parents & children (personal data)" },
  { key: "analytics", label: "Analytics" },
  { key: "media", label: "Media library (delete files)" },
  { key: "messages", label: "Messages & registrations" },
];
const LABEL = Object.fromEntries(SECTIONS.map((s) => [s.key, s.label]));

const input = "w-full rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-black/15";

/** Main admin: add sub-admins by email and choose what they can edit. */
export function SubAdminsPanel({ notify }: { notify: (m: string, t?: "ok" | "err") => void }) {
  const [items, setItems] = useState<Sub[]>([]);
  const [edit, setEdit] = useState<(Partial<Sub> & { isNew?: boolean }) | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await rpc<Sub[]>("kh_admins_list"));
    } catch (e) {
      notify((e as Error).message, "err");
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (patch: Partial<Sub>, msg: string) => {
    if (!edit) return;
    const body = { ...edit, ...patch };
    setBusy(true);
    try {
      await rpc("kh_admins_save", {
        em: body.email ?? "",
        nm: body.name ?? "",
        perms: body.permissions ?? [],
        is_disabled: Boolean(body.disabled),
      });
      setEdit({ ...body, email: (body.email ?? "").toLowerCase().trim(), isNew: false });
      notify(msg);
      load();
    } catch (e) {
      notify((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  };

  const signUpLink = typeof window !== "undefined" ? `${window.location.origin}/admin/` : "/admin/";

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(320px,420px)_1fr]">
      <div className="rounded-3xl bg-white p-3 shadow-soft ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-2 p-1">
          <div className="text-sm font-semibold">Sub-admins ({items.length})</div>
          <button
            type="button"
            className="rounded-xl bg-blueBrand-600 px-3 py-2 text-sm font-bold text-white"
            onClick={() => setEdit({ isNew: true, name: "", email: "", permissions: ["lessons"], disabled: false })}
          >
            + Add sub-admin
          </button>
        </div>
        <ul className="mt-2 grid gap-1">
          {items.length === 0 ? <li className="p-3 text-sm text-black/50">No sub-admins yet.</li> : null}
          {items.map((a) => (
            <li key={a.email}>
              <button
                type="button"
                onClick={() => setEdit({ ...a, isNew: false })}
                className={cn("w-full rounded-2xl px-3 py-2 text-left text-sm hover:bg-blueBrand-50", edit?.email === a.email && "bg-blueBrand-50")}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{a.name}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", a.disabled ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-800")}>
                    {a.disabled ? "Disabled" : "Active"}
                  </span>
                </span>
                <span className="block text-xs text-black/50">{a.email}</span>
                <span className="block text-xs text-black/50">{a.permissions.map((p) => LABEL[p] ?? p).join(", ") || "no sections"}</span>
                <span className="block text-xs text-black/40">
                  {a.lastSeenAt ? `Last active ${new Date(a.lastSeenAt).toLocaleString()}` : "Hasn’t signed in yet"}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 rounded-2xl bg-blueBrand-50 p-3 text-xs leading-5 text-black/70">
          <b>How sub-admins get in:</b> add their email here, then send them this link:{" "}
          <span className="break-all font-mono">{signUpLink}</span>. They choose <b>Create an account</b> using that same email,
          click the confirmation link that arrives by email, then sign in. They’ll only see the sections you tick.
        </div>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-black/5">
        {!edit ? (
          <div className="grid min-h-60 place-items-center text-center text-sm text-black/50">Select a sub-admin, or add a new one.</div>
        ) : (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              save({}, edit.isNew ? "Sub-admin added — send them the sign-up link" : "Sub-admin updated");
            }}
          >
            <div className="font-display text-xl">{edit.isNew ? "New sub-admin" : `Edit ${edit.name}`}</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold uppercase text-black/55">Full name *</span>
                <input className={input} value={edit.name ?? ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} required />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold uppercase text-black/55">Email *</span>
                <input
                  className={input}
                  type="email"
                  value={edit.email ?? ""}
                  onChange={(e) => setEdit({ ...edit, email: e.target.value })}
                  disabled={!edit.isNew}
                  required
                />
              </label>
            </div>

            <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase text-black/55">Sections they can edit</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {SECTIONS.map((s) => (
                  <label key={s.key} className="flex items-center gap-2 rounded-xl p-2 text-sm ring-1 ring-black/10">
                    <input
                      type="checkbox"
                      checked={edit.permissions?.includes(s.key) ?? false}
                      onChange={(e) =>
                        setEdit({
                          ...edit,
                          permissions: e.target.checked ? [...(edit.permissions ?? []), s.key] : (edit.permissions ?? []).filter((x) => x !== s.key),
                        })
                      }
                    />
                    {s.label}
                  </label>
                ))}
              </div>
              <p className="mt-1 text-xs text-black/45">Any sub-admin can upload images and files while editing their sections.</p>
            </fieldset>

            <div className="flex flex-wrap gap-2 border-t border-black/5 pt-3">
              <button type="submit" disabled={busy} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                {edit.isNew ? "Add sub-admin" : "Save changes"}
              </button>
              {!edit.isNew ? (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => save({ disabled: !edit.disabled }, edit.disabled ? "Sub-admin enabled" : "Sub-admin disabled — they can no longer make changes")}
                    className="rounded-xl bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900"
                  >
                    {edit.disabled ? "Enable" : "Disable"}
                  </button>
                  <button
                    type="button"
                    className="ml-auto rounded-xl px-4 py-2 text-sm font-bold text-red-700 ring-1 ring-red-200"
                    onClick={async () => {
                      if (!confirm(`Remove sub-admin “${edit.name}”? They will lose access immediately.`)) return;
                      try {
                        await rpc("kh_admins_delete", { em: edit.email });
                        setEdit(null);
                        notify("Sub-admin removed");
                        load();
                      } catch (e) {
                        notify((e as Error).message, "err");
                      }
                    }}
                  >
                    Remove
                  </button>
                </>
              ) : null}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/** Any admin: change own password. */
export function AccountPanel({ notify, name, email }: { notify: (m: string, t?: "ok" | "err") => void; name: string; email: string }) {
  const [next, setNext] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  return (
    <form
      className="grid max-w-md gap-3 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-black/5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (next !== confirmPw) return notify("New passwords don’t match", "err");
        const { error } = await supa().auth.updateUser({ password: next });
        if (error) return notify(error.message, "err");
        setNext("");
        setConfirmPw("");
        notify("Password changed");
      }}
    >
      <div className="font-display text-xl">My account</div>
      <div className="text-sm text-black/60">
        {name} · {email}
      </div>
      <input className={input} type="password" placeholder="New password (8+ characters)" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" minLength={8} required />
      <input className={input} type="password" placeholder="Confirm new password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} autoComplete="new-password" required />
      <button type="submit" className="justify-self-start rounded-xl bg-blueBrand-600 px-4 py-2 text-sm font-bold text-white">Change password</button>
    </form>
  );
}
