"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, MessageSquareReply, Trash2, X } from "lucide-react";
import { adminComments, adminSetComment, type AdminComment } from "@/lib/cms/client";
import { cn } from "@/lib/cn";

const FILTERS = ["pending", "approved", "rejected", "all"] as const;

/** Blog comment moderation — nothing a visitor writes appears until a blog admin approves it. */
export function CommentsPanel({ notify }: { notify: (msg: string, kind?: "ok" | "err") => void }) {
  const [items, setItems] = useState<AdminComment[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const [replies, setReplies] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);

  const notifyRef = useRef(notify);
  notifyRef.current = notify;
  const load = useCallback(() => {
    adminComments()
      .then((d) => setItems(d))
      .catch((e) => {
        setItems([]);
        notifyRef.current(String(e.message ?? e), "err");
      });
  }, []);
  useEffect(() => load(), [load]);

  const shown = useMemo(() => (items ?? []).filter((c) => filter === "all" || c.status === filter), [items, filter]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { pending: 0, approved: 0, rejected: 0, all: items?.length ?? 0 };
    (items ?? []).forEach((x) => (c[x.status] += 1));
    return c;
  }, [items]);

  const act = async (c: AdminComment, status: AdminComment["status"], remove = false) => {
    setBusy(c.id);
    try {
      await adminSetComment(c.id, status, replies[c.id] ?? c.reply ?? "", remove);
      notify(remove ? "Comment deleted" : status === "approved" ? "Approved — it's now visible" : status === "rejected" ? "Hidden from the site" : "Saved");
      load();
    } catch (e) {
      notify(String((e as Error).message), "err");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl bg-sky-soft p-4 text-sm leading-6 text-ink/75">
        Comments stay hidden until you approve them. Comments with links, phone numbers, emails or possibly unkind words are flagged ⚠️.
        You can add a reply from the ministry — it shows under the comment.
      </div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter comments">
        {FILTERS.map((f) => (
          <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cn("rounded-full px-4 py-2 text-sm font-bold capitalize", filter === f ? "bg-ink text-white" : "bg-white ring-1 ring-ink/10")}>
            {f} <span className="opacity-60">({counts[f]})</span>
          </button>
        ))}
      </div>
      {items === null ? <p className="text-sm text-ink/50">Loading…</p> : null}
      {items && !shown.length ? <p className="rounded-2xl bg-white p-6 text-center text-ink/50 ring-1 ring-ink/5">No {filter === "all" ? "" : filter} comments.</p> : null}
      <ul className="grid gap-3">
        {shown.map((c) => (
          <li key={c.id} className={cn("rounded-2xl bg-white p-4 ring-1", c.flagged && c.status === "pending" ? "ring-amber-300" : "ring-ink/5")}>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-bold">{c.name}</span>
              <span className="text-ink/40">on post</span>
              <a href={`/blog/#${c.postId}`} target="_blank" rel="noreferrer" className="font-bold text-blueBrand-700">{c.postId}</a>
              <span className="text-ink/40">· {new Date(c.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
              <span className={cn("ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold capitalize", c.status === "approved" ? "bg-emerald-100 text-emerald-800" : c.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800")}>{c.status}</span>
            </div>
            {c.flagged ? (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> {c.flagReason}
              </p>
            ) : null}
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-6">{c.body}</p>
            <label className="mt-3 block">
              <span className="flex items-center gap-1 text-xs font-bold text-ink/50"><MessageSquareReply className="h-3.5 w-3.5" aria-hidden /> Reply from the ministry (optional)</span>
              <textarea
                rows={2}
                maxLength={600}
                value={replies[c.id] ?? c.reply ?? ""}
                onChange={(e) => setReplies((r) => ({ ...r, [c.id]: e.target.value }))}
                className="mt-1 w-full rounded-xl bg-paper px-3 py-2 text-sm outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-blueBrand-500"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={busy === c.id} onClick={() => act(c, "approved")} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                <Check className="h-4 w-4" aria-hidden /> {c.status === "approved" ? "Save reply" : "Approve"}
              </button>
              {c.status !== "rejected" ? (
                <button type="button" disabled={busy === c.id} onClick={() => act(c, "rejected")} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-ink ring-1 ring-ink/15 disabled:opacity-50">
                  <X className="h-4 w-4" aria-hidden /> Hide
                </button>
              ) : null}
              <button type="button" disabled={busy === c.id} onClick={() => confirm("Delete this comment permanently?") && act(c, c.status, true)} className="ml-auto inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-red-700 ring-1 ring-red-200 disabled:opacity-50">
                <Trash2 className="h-4 w-4" aria-hidden /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
