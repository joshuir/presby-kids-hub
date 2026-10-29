"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, ShieldCheck, X } from "lucide-react";
import { addComment, getComments, type CommentItem } from "@/lib/cms/client";
import { initials, useSettings } from "@/lib/site";
import { cn } from "@/lib/cn";

function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Approved comments + a form. Everything new waits for an admin before it shows. */
export function CommentThread({ postId, onCount, autoFocus }: { postId: string; onCount?: (n: number) => void; autoFocus?: boolean }) {
  const s = useSettings();
  const [items, setItems] = useState<CommentItem[] | null>(null);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const open = s.commentsOpen !== "no";

  useEffect(() => {
    let alive = true;
    getComments(postId)
      .then((c) => {
        if (!alive) return;
        setItems(c);
        onCount?.(c.length);
      })
      .catch(() => alive && setItems([]));
    try {
      setName(localStorage.getItem("cm-comment-name") ?? "");
    } catch {}
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);
  useEffect(() => {
    if (autoFocus) setTimeout(() => taRef.current?.focus(), 250);
  }, [autoFocus]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setErr("");
    try {
      await addComment(postId, name.trim(), text.trim());
      try {
        localStorage.setItem("cm-comment-name", name.trim());
      } catch {}
      setText("");
      setState("sent");
    } catch (x) {
      setErr((x as Error).message || "Couldn't send — please try again.");
      setState("error");
    }
  };

  return (
    <div>
      {items === null ? (
        <p className="py-3 text-sm text-ink/50">Loading comments…</p>
      ) : items.length ? (
        <ul className="grid gap-3">
          {items.map((c) => (
            <li key={c.id} className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky-soft text-xs font-extrabold text-blueBrand-700" aria-hidden>{initials(c.name)}</span>
              <div className="min-w-0 flex-1">
                <div className="rounded-2xl rounded-tl-md bg-paper px-3.5 py-2.5">
                  <div className="text-sm font-bold">{c.name} <span className="font-normal text-ink/45">· {ago(c.createdAt)}</span></div>
                  <p className="mt-0.5 whitespace-pre-wrap text-[15px] leading-6 text-ink/80">{c.body}</p>
                </div>
                {c.reply ? (
                  <div className="ml-4 mt-2 flex gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brand/logo.png" alt="" className="mt-1 h-6 w-auto" />
                    <div className="rounded-2xl rounded-tl-md bg-blueBrand-50 px-3 py-2 text-sm">
                      <span className="font-bold text-blueBrand-700">{c.replyBy || "Children's Ministry"}</span>
                      <p className="text-ink/80">{c.reply}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-2 text-sm text-ink/55">No comments yet — be the first to encourage our teachers.</p>
      )}

      {open ? (
        state === "sent" ? (
          <div role="status" className="mt-4 flex items-start gap-3 rounded-2xl bg-[#DCFCE7] p-4 text-sm">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#15803D]" aria-hidden />
            <div>
              <div className="font-bold">Thank you! Your comment has been sent.</div>
              <p className="text-ink/70">It will appear once a ministry admin has checked it.</p>
              <button type="button" onClick={() => setState("idle")} className="mt-1 font-bold text-blueBrand-700">Write another</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 grid gap-2">
            {s.commentsNote ? <p className="text-xs leading-5 text-ink/55">{s.commentsNote}</p> : null}
            <label className="sr-only" htmlFor={`cn-${postId}`}>Your name</label>
            <input id={`cn-${postId}`} required maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (e.g. Ama's mum)" className="h-11 rounded-xl bg-paper px-3.5 text-[15px] outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-blueBrand-500" />
            <div className="relative">
              <label className="sr-only" htmlFor={`ct-${postId}`}>Comment</label>
              <textarea
                ref={taRef}
                id={`ct-${postId}`}
                required
                minLength={2}
                maxLength={600}
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a kind comment…"
                className="w-full resize-none rounded-xl bg-paper px-3.5 py-3 pr-14 text-[15px] outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-blueBrand-500"
              />
              <button type="submit" disabled={state === "sending" || text.trim().length < 2 || !name.trim()} aria-label="Send comment" className="absolute bottom-3 right-2 grid h-10 w-10 place-items-center rounded-full bg-blueBrand-600 text-white transition disabled:opacity-40">
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="flex justify-between text-xs text-ink/45">
              <span>{err ? <span role="alert" className="font-bold text-red-700">{err}</span> : "Comments are checked before they appear."}</span>
              <span>{text.length}/600</span>
            </div>
          </form>
        )
      ) : (
        <p className="mt-3 rounded-xl bg-paper p-3 text-sm text-ink/60">Comments are closed on this post.</p>
      )}
    </div>
  );
}

/** Phones: comments open in a bottom sheet so the feed keeps its place. */
export function CommentSheet({ postId, open, onClose, onCount, title }: { postId: string; open: boolean; onClose: () => void; onCount?: (n: number) => void; title?: string }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[85] flex items-end bg-ink/50 sm:items-center sm:justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Comments"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="flex max-h-[88dvh] w-full flex-col rounded-t-[1.8rem] bg-white sm:max-w-lg sm:rounded-[1.8rem]"
          >
            <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-ink/15 sm:hidden" aria-hidden />
            <div className="flex items-center justify-between gap-3 border-b border-ink/5 px-5 py-3">
              <h2 className="flex items-center gap-2 font-display text-lg font-extrabold"><MessageCircle className="h-5 w-5" aria-hidden /> {title ?? "Comments"}</h2>
              <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-paper" aria-label="Close comments"><X className="h-5 w-5" aria-hidden /></button>
            </div>
            <div className={cn("overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4")}>
              <CommentThread postId={postId} onCount={onCount} autoFocus />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
