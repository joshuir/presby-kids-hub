"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Heart, Link2, MapPin, MessageCircle, Share2, SmilePlus } from "lucide-react";
import type { EventDoc, PostDoc, TeacherDoc } from "@/lib/cms/types";
import { Avatar } from "./Teachers";
import { AddToCalendar } from "./EventCard";
import { CommentSheet, CommentThread } from "./Comments";
import { VideoEmbed } from "@/components/ui/VideoEmbed";
import { AlbumArt } from "@/components/art/Illustrations";
import { getCommentCounts, getReactionTotals, react as sendReaction, REACTIONS, type Reaction } from "@/lib/cms/client";
import { fmtDate, fmtTime } from "@/lib/format";
import { sized } from "@/lib/img";
import { cn } from "@/lib/cn";

const MINE = "cm-reacts-v2";
const LABEL: Record<Reaction, string> = { "❤️": "Love", "🙏": "Amen", "🙌": "Praise", "😂": "Haha", "😮": "Wow", "👏": "Clap", "🔥": "Fire", "😊": "Smile" };

function readMine(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(MINE) ?? "{}");
  } catch {
    return {};
  }
}

/** Shared live counts: CMS starting counts + everyone's taps (stored in the database). */
function useReactions(post: PostDoc) {
  const [server, setServer] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<string[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    getReactionTotals().then((all) => alive && setServer(all[post.id] ?? {}));
    setMine(readMine()[post.id] ?? []);
    return () => {
      alive = false;
    };
  }, [post.id]);
  const counts: Record<string, number> = {};
  REACTIONS.forEach((e) => {
    const n = (post.reactions?.[e] ?? 0) + (server[e] ?? 0);
    if (n > 0) counts[e] = n;
  });
  const toggle = async (e: Reaction) => {
    if (pending) return;
    const on = mine.includes(e);
    const nextMine = on ? mine.filter((x) => x !== e) : [...mine, e];
    setMine(nextMine);
    setServer((s) => ({ ...s, [e]: Math.max(0, (s[e] ?? 0) + (on ? -1 : 1)) }));
    try {
      const all = readMine();
      all[post.id] = nextMine;
      localStorage.setItem(MINE, JSON.stringify(all));
    } catch {}
    setPending(e);
    try {
      const n = await sendReaction(post.id, e, on ? -1 : 1);
      setServer((s) => ({ ...s, [e]: n }));
    } catch {
      // keep the optimistic count; it will reconcile on next load
    } finally {
      setPending(null);
    }
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { counts, mine, toggle, total };
}

function ReactionPicker({ mine, onPick, onClose }: { mine: string[]; onPick: (e: Reaction) => void; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute bottom-full left-0 z-20 mb-2 flex gap-0.5 rounded-full bg-white p-1.5 shadow-card ring-1 ring-ink/10"
      role="group"
      aria-label="Choose a reaction"
    >
      {REACTIONS.map((e, i) => (
        <motion.button
          key={e}
          type="button"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.025 }}
          aria-label={`${LABEL[e]}${mine.includes(e) ? " (selected)" : ""}`}
          aria-pressed={mine.includes(e)}
          onClick={() => onPick(e)}
          className={cn("grid h-10 w-10 place-items-center rounded-full text-[1.6rem] transition hover:-translate-y-1.5 hover:scale-125 sm:h-11 sm:w-11", mine.includes(e) && "bg-sky-soft")}
        >
          {e}
        </motion.button>
      ))}
    </motion.div>
  );
}

export function PostCard({ post, author, event, compact, index = 0 }: { post: PostDoc; author?: TeacherDoc; event?: EventDoc; compact?: boolean; index?: number }) {
  const { counts, mine, toggle, total } = useReactions(post);
  const [picker, setPicker] = useState(false);
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState("");
  const [nComments, setNComments] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [burst, setBurst] = useState<string | null>(null);

  useEffect(() => {
    try {
      setSaved((JSON.parse(localStorage.getItem("cm-saved") ?? "[]") as string[]).includes(post.id));
    } catch {}
    getCommentCounts().then((c) => setNComments(c[post.id] ?? 0));
  }, [post.id]);

  const pick = (e: Reaction) => {
    if (!mine.includes(e)) {
      setBurst(e);
      setTimeout(() => setBurst(null), 700);
    }
    toggle(e);
    setPicker(false);
  };

  const share = async () => {
    const url = `${location.origin}/blog/#${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: "Children's Ministry", text: post.body.slice(0, 120), url });
      else {
        await navigator.clipboard.writeText(url);
        setNote("Link copied");
        setTimeout(() => setNote(""), 1800);
      }
    } catch {}
  };

  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    try {
      const list = new Set<string>(JSON.parse(localStorage.getItem("cm-saved") ?? "[]"));
      if (next) list.add(post.id);
      else list.delete(post.id);
      localStorage.setItem("cm-saved", JSON.stringify([...list]));
    } catch {}
  };

  const openComments = () => {
    if (window.matchMedia("(max-width: 639px)").matches) setSheet(true);
    else setShowComments((v) => !v);
  };

  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([e]) => e);
  const imgs = post.images ?? [];

  const body = (
    <>
      <header className="flex items-center gap-3">
        {author ? <Avatar t={author} size={44} i={index} /> : null}
        <div className="min-w-0">
          <div className="truncate font-bold">{author?.name ?? "Children's Ministry"}</div>
          <div className="truncate text-xs text-ink/55">{author?.role} · {fmtDate(post.date, { day: "numeric", month: "short" })}</div>
        </div>
        {post.pinned === "yes" && !compact ? <span className="ml-auto rounded-full bg-sun-soft px-2.5 py-1 text-xs font-bold text-[#9A6400]">📌 Pinned</span> : null}
      </header>
      <p className={cn("mt-3 whitespace-pre-line text-[16px] leading-7 text-ink/85", compact && "line-clamp-3")}>{post.body}</p>
      {post.kind === "verse" && post.verse ? (
        <blockquote className="mt-3 rounded-2xl bg-blueBrand-600 p-5 text-white">
          <p className="font-display text-xl font-bold leading-snug">“{post.verse}”</p>
          <footer className="mt-2 text-sm font-bold text-white/70">{post.verseRef}</footer>
        </blockquote>
      ) : null}
      {post.kind === "event" && event ? (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-sun-soft p-3">
          <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white">
            {event.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sized(event.logo || event.image, 120, 120)} alt="" className="h-full w-full object-cover" />
            ) : null}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold">{event.title}</div>
            <div className="flex items-center gap-1 text-xs text-ink/60"><MapPin className="h-3 w-3" aria-hidden />{fmtDate(event.date, { day: "numeric", month: "short" })} · {fmtTime(event.startTime)} · {event.location}</div>
          </div>
          {!compact ? <div className="w-full sm:w-auto"><AddToCalendar e={event} /></div> : null}
        </div>
      ) : null}
      {imgs.length ? (
        <div className={cn("mt-3 grid gap-1.5 overflow-hidden rounded-2xl", imgs.length > 1 && !compact && "grid-cols-2", imgs.length === 3 && !compact && "grid-rows-2")}>
          {imgs.slice(0, compact ? 1 : 4).map((src, k) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={sized(src, 900)} alt="" loading="lazy" className={cn("w-full object-cover", imgs.length === 3 && k === 0 && !compact ? "row-span-2 h-full" : "aspect-[4/3]")} />
          ))}
        </div>
      ) : post.kind === "photo" ? (
        <AlbumArt seed={index + 2} className="mt-3 aspect-[4/3] w-full rounded-2xl" label="Class activity illustration" />
      ) : null}
      {post.kind === "video" && post.videoUrl && !compact ? <div className="mt-3"><VideoEmbed url={post.videoUrl} title="Video" /></div> : null}
      {post.audioUrl && !compact ? <audio controls preload="none" src={post.audioUrl} className="mt-3 w-full" /> : null}
    </>
  );

  if (compact) {
    return (
      <Link href={`/blog/#${post.id}`} data-tilt="4" className="card block h-full p-5">
        {body}
        <div className="mt-4 flex items-center gap-3 text-sm text-ink/55">
          <span><span aria-hidden>{top.join("")}</span> {total}</span>
          {nComments ? <span className="inline-flex items-center gap-1"><MessageCircle className="h-4 w-4" aria-hidden /> {nComments}</span> : null}
        </div>
      </Link>
    );
  }

  return (
    <article id={post.id} className="card scroll-mt-40 p-4 sm:p-6">
      {body}

      {/* reaction chips — every one is tappable */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([e, n]) => {
            const on = mine.includes(e);
            return (
              <motion.button
                layout
                key={e}
                type="button"
                onClick={() => pick(e as Reaction)}
                aria-pressed={on}
                aria-label={`${LABEL[e as Reaction]} — ${n}${on ? ", you reacted" : ""}`}
                className={cn("relative inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold ring-1 transition", on ? "bg-sky-soft text-blueBrand-700 ring-blueBrand-300" : "bg-paper text-ink/70 ring-transparent hover:ring-ink/15")}
              >
                <span className="text-base leading-none" aria-hidden>{e}</span>
                <span className="tabular-nums">{n}</span>
                <AnimatePresence>
                  {burst === e ? (
                    <motion.span aria-hidden className="pointer-events-none absolute -top-1 left-2 text-xl" initial={{ y: 0, opacity: 1, scale: 1 }} animate={{ y: -34, opacity: 0, scale: 1.6 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
                      {e}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.button>
            );
          })}
        <span className="ml-auto text-sm text-ink/50">
          {nComments ? <button type="button" onClick={openComments} className="hover:underline">{nComments} comment{nComments === 1 ? "" : "s"}</button> : null}
          {note ? <span role="status" className="ml-2 font-bold text-blueBrand-700">{note}</span> : null}
        </span>
      </div>

      <div className="relative mt-3 grid grid-cols-4 gap-1 border-t border-ink/5 pt-2">
        <div className="relative" onPointerEnter={(e) => e.pointerType === "mouse" && setPicker(true)} onPointerLeave={() => setPicker(false)}>
          <button
            type="button"
            aria-pressed={mine.includes("❤️")}
            onClick={() => pick("❤️")}
            onContextMenu={(e) => {
              e.preventDefault();
              setPicker(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setPicker(true);
              }
            }}
            className={cn("flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold hover:bg-paper sm:text-base", mine.includes("❤️") ? "text-[#E11D48]" : "text-ink/70")}
          >
            <Heart className={cn("h-5 w-5", mine.includes("❤️") && "fill-current")} aria-hidden /> <span>{mine.includes("❤️") ? "Loved" : "Love"}</span>
          </button>
          <AnimatePresence>{picker ? <ReactionPicker mine={mine} onPick={pick} onClose={() => setPicker(false)} /> : null}</AnimatePresence>
        </div>
        <button type="button" onClick={() => setPicker((p) => !p)} aria-expanded={picker} className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold text-ink/70 hover:bg-paper sm:text-base">
          <SmilePlus className="h-5 w-5" aria-hidden /> <span>React</span>
        </button>
        <button type="button" onClick={openComments} aria-expanded={showComments} className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold text-ink/70 hover:bg-paper sm:text-base">
          <MessageCircle className="h-5 w-5" aria-hidden /> <span>Comment</span>
        </button>
        <div className="flex">
          <button type="button" onClick={share} aria-label="Share" className="flex flex-1 items-center justify-center rounded-xl py-2.5 text-ink/70 hover:bg-paper">
            {typeof navigator !== "undefined" && "share" in navigator ? <Share2 className="h-5 w-5" aria-hidden /> : <Link2 className="h-5 w-5" aria-hidden />}
          </button>
          <button type="button" onClick={toggleSave} aria-pressed={saved} aria-label={saved ? "Saved" : "Save"} className={cn("flex flex-1 items-center justify-center rounded-xl py-2.5 hover:bg-paper", saved ? "text-blueBrand-700" : "text-ink/70")}>
            <Bookmark className={cn("h-5 w-5", saved && "fill-current")} aria-hidden />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showComments ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-3 border-t border-ink/5 pt-4">
              <CommentThread postId={post.id} onCount={setNComments} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <CommentSheet postId={post.id} open={sheet} onClose={() => setSheet(false)} onCount={setNComments} title={`Comments on ${author?.name.split(" ")[0] ?? "this"}'s post`} />
      <p className="sr-only">Press the up arrow on Love, or right-click it, to choose a different reaction.</p>
    </article>
  );
}
