"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, CalendarPlus, Heart, Link2, MapPin, Share2 } from "lucide-react";
import type { EventDoc, PostDoc, TeacherDoc } from "@/lib/cms/types";
import { Avatar } from "./Teachers";
import { VideoEmbed } from "@/components/ui/VideoEmbed";
import { AlbumArt } from "@/components/art/Illustrations";
import { downloadIcs, fmtDate, fmtTime } from "@/lib/format";
import { cn } from "@/lib/cn";

const EMOJI = ["❤️", "👍", "😂", "😍", "🙏"];
const KEY = "cm-reactions";

function readMine(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function PostCard({ post, author, event, compact, index = 0 }: { post: PostDoc; author?: TeacherDoc; event?: EventDoc; compact?: boolean; index?: number }) {
  const [mine, setMine] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState("");
  useEffect(() => {
    setMine(readMine()[post.id] ?? null);
    try {
      setSaved((JSON.parse(localStorage.getItem("cm-saved") ?? "[]") as string[]).includes(post.id));
    } catch {}
  }, [post.id]);

  const counts = { ...post.reactions };
  if (mine) counts[mine] = (counts[mine] ?? 0) + 1;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([e]) => e);

  const react = (e: string | null) => {
    setMine(e);
    setPicker(false);
    try {
      const all = readMine();
      if (e) all[post.id] = e;
      else delete all[post.id];
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch {}
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

  const body = (
    <>
      <header className="flex items-center gap-3">
        {author ? <Avatar t={author} size={44} i={index} /> : null}
        <div className="min-w-0">
          <div className="truncate font-bold">{author?.name ?? "Children's Ministry"}</div>
          <div className="truncate text-xs text-ink/55">{author?.role} · {fmtDate(post.date, { day: "numeric", month: "short" })}</div>
        </div>
      </header>
      <p className={cn("mt-3 whitespace-pre-line leading-7 text-ink/80", compact && "line-clamp-3")}>{post.body}</p>
      {post.kind === "verse" && post.verse ? (
        <blockquote className="mt-3 rounded-2xl bg-blueBrand-600 p-5 text-white">
          <p className="font-display text-xl font-bold leading-snug">“{post.verse}”</p>
          <footer className="mt-2 text-sm font-bold text-white/70">{post.verseRef}</footer>
        </blockquote>
      ) : null}
      {post.kind === "event" && event ? (
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-sun-soft p-3">
          <div className="grid h-14 w-12 place-items-center rounded-xl bg-white text-center">
            <div>
              <div className="font-display text-xl font-extrabold leading-none">{new Date(event.date + "T12:00").getDate()}</div>
              <div className="text-[10px] font-bold uppercase">{new Date(event.date + "T12:00").toLocaleDateString("en-GB", { month: "short" })}</div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold">{event.title}</div>
            <div className="flex items-center gap-1 text-xs text-ink/60"><MapPin className="h-3 w-3" aria-hidden />{fmtTime(event.startTime)} · {event.location}</div>
          </div>
          {!compact ? (
            <button type="button" onClick={() => downloadIcs([event], event.id)} className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-2 text-xs font-bold text-white">
              <CalendarPlus className="h-4 w-4" aria-hidden /> Add
            </button>
          ) : null}
        </div>
      ) : null}
      {post.images?.length ? (
        <div className={cn("mt-3 grid gap-2", post.images.length > 1 && "grid-cols-2")}>
          {post.images.slice(0, compact ? 1 : 4).map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
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
      <Link href={`/blog/#${post.id}`} className="card block h-full p-5 transition hover:-translate-y-1">
        {body}
        <div className="mt-4 flex items-center gap-1 text-sm text-ink/55">
          <span aria-hidden>{top.join("")}</span> {total}
        </div>
      </Link>
    );
  }

  return (
    <article id={post.id} className="card scroll-mt-28 p-5 sm:p-6">
      {body}
      <div className="mt-4 flex items-center justify-between text-sm text-ink/55">
        <span><span aria-hidden>{top.join("")}</span> {total} reactions</span>
        {note ? <span role="status" className="font-bold text-blueBrand-700">{note}</span> : null}
      </div>
      <div className="relative mt-3 grid grid-cols-3 gap-1 border-t border-ink/5 pt-2">
        <div className="relative" onPointerEnter={(e) => e.pointerType === "mouse" && setPicker(true)} onPointerLeave={() => setPicker(false)}>
          <button
            type="button"
            aria-pressed={!!mine}
            onClick={() => react(mine ? null : "❤️")}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setPicker(true);
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setPicker(true);
            }}
            className={cn("flex w-full items-center justify-center gap-2 rounded-xl py-2.5 font-bold hover:bg-paper", mine ? "text-[#E11D48]" : "text-ink/70")}
          >
            {mine && mine !== "❤️" ? <span aria-hidden>{mine}</span> : <Heart className={cn("h-5 w-5", mine && "fill-current")} aria-hidden />} {mine ? "Liked" : "Like"}
          </button>
          <AnimatePresence>
            {picker ? (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} className="absolute bottom-full left-0 z-10 mb-2 flex gap-1 rounded-full bg-white p-1.5 shadow-card ring-1 ring-ink/10" role="group" aria-label="Choose a reaction">
                {EMOJI.map((e) => (
                  <button key={e} type="button" aria-label={`React ${e}`} onClick={() => react(e)} className="grid h-10 w-10 place-items-center rounded-full text-2xl transition hover:-translate-y-1 hover:scale-125">
                    {e}
                  </button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <button type="button" onClick={share} className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-ink/70 hover:bg-paper">
          {typeof navigator !== "undefined" && "share" in navigator ? <Share2 className="h-5 w-5" aria-hidden /> : <Link2 className="h-5 w-5" aria-hidden />} Share
        </button>
        <button type="button" onClick={toggleSave} aria-pressed={saved} className={cn("flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold hover:bg-paper", saved ? "text-blueBrand-700" : "text-ink/70")}>
          <Bookmark className={cn("h-5 w-5", saved && "fill-current")} aria-hidden /> {saved ? "Saved" : "Save"}
        </button>
      </div>
      <p className="sr-only">Press the up arrow on Like, or long-press it, to choose a different reaction.</p>
    </article>
  );
}
