"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { AlbumCard, AlbumCover } from "@/components/blocks/AlbumCard";
import { Loading } from "@/components/site/LoadState";
import { Reveal } from "@/components/ui/Reveal";
import { VideoEmbed } from "@/components/ui/VideoEmbed";
import { fmtDate } from "@/lib/format";
import { useContent } from "@/lib/useContent";
import type { GalleryDoc } from "@/lib/cms/types";
import { cn } from "@/lib/cn";

function Lightbox({ album, index, onClose }: { album: GalleryDoc; index: number; onClose: () => void }) {
  const [i, setI] = useState(0);
  const media = album.media ?? [];
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((x) => Math.min(media.length - 1, x + 1));
      if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
    };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [media.length, onClose]);
  const m = media[i];
  return (
    <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-ink/80 p-3 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div role="dialog" aria-modal="true" aria-label={album.title} initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl overflow-hidden rounded-[1.8rem] bg-white">
        <div className="relative bg-ink">
          {m ? (
            m.type === "video" ? (
              /youtu|vimeo/.test(m.url) ? <VideoEmbed url={m.url} title={album.title} /> : <video src={m.url} controls className="aspect-video w-full" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.url} alt={m.caption || album.title} className="max-h-[65dvh] w-full object-contain" />
            )
          ) : (
            <AlbumCover a={album} i={index} className="aspect-[4/3] w-full" />
          )}
          {media.length > 1 ? (
            <>
              <button type="button" aria-label="Previous photo" disabled={i === 0} onClick={() => setI(i - 1)} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 disabled:opacity-30"><ChevronLeft className="h-5 w-5" aria-hidden /></button>
              <button type="button" aria-label="Next photo" disabled={i === media.length - 1} onClick={() => setI(i + 1)} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 disabled:opacity-30"><ChevronRight className="h-5 w-5" aria-hidden /></button>
            </>
          ) : null}
        </div>
        <div className="flex items-start justify-between gap-4 p-5">
          <div>
            <span className="eyebrow bg-sun-soft text-[#9A6400]">{album.category}</span>
            <h2 className="mt-2 font-display text-2xl font-bold">{album.title}</h2>
            <p className="text-sm text-ink/55">{fmtDate(album.date, { month: "long", year: "numeric" })}{media.length ? ` · ${i + 1} of ${media.length}` : ""}</p>
            {m?.caption ? <p className="mt-2 text-ink/70">{m.caption}</p> : album.description ? <p className="mt-2 text-ink/70">{album.description}</p> : null}
          </div>
          <button ref={closeRef} type="button" aria-label="Close" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper"><X className="h-5 w-5" aria-hidden /></button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function GalleryPage() {
  const albums = useContent("gallery");
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const a = new URLSearchParams(location.search).get("album");
    if (a) setOpen(a);
  }, []);
  useEffect(() => {
    if (!strip.current || !albums?.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tw = gsap.to(strip.current, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    return () => {
      tw.kill();
    };
  }, [albums?.length]);
  const cats = useMemo(() => {
    const m = new Map<string, number>();
    (albums ?? []).forEach((a) => m.set(a.category, (m.get(a.category) ?? 0) + 1));
    return [["All", albums?.length ?? 0] as const, ...[...m.entries()]];
  }, [albums]);
  const list = (albums ?? []).filter((a) => (cat === "All" || a.category === cat) && `${a.title} ${a.category} ${a.description}`.toLowerCase().includes(q.toLowerCase()));
  const current = (albums ?? []).find((a) => a.id === open);
  return (
    <div>
      <PageHero eyebrow="Gallery" title="Moments of joy" intro="Group photos only — always shared with parental consent." />
      {albums?.length ? (
        <div className="overflow-hidden border-y border-ink/5 bg-white py-3" aria-hidden>
          <div ref={strip} className="flex w-max gap-8 whitespace-nowrap font-display text-lg font-bold text-ink/40">
            {[0, 1].map((k) => (
              <span key={k} className="flex gap-8">
                {albums.map((a) => <span key={a.id + k}>✦ {a.title}</span>)}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      <Container className="mt-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Albums by event">
            {cats.map(([c, n]) => (
              <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold", cat === c ? "bg-ink text-white" : "bg-white ring-1 ring-ink/10")}>
                {c} <span className="opacity-60">{n}</span>
              </button>
            ))}
          </div>
          <label className="relative block lg:w-72">
            <span className="sr-only">Search the gallery</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the gallery" className="h-11 w-full rounded-full bg-white pl-10 pr-4 outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-blueBrand-500" />
          </label>
        </div>
        {!albums ? <Loading label="Loading the gallery…" /> : null}
        <Reveal watch={list.length + cat} className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {list.map((a) => (
            <div key={a.id} data-stagger>
              <AlbumCard a={a} i={albums!.indexOf(a)} onOpen={() => setOpen(a.id)} />
            </div>
          ))}
        </Reveal>
        {albums && !list.length ? <p className="card mt-6 p-6 text-ink/60">No albums match your search.</p> : null}
      </Container>
      <AnimatePresence>{current ? <Lightbox album={current} index={albums!.indexOf(current)} onClose={() => setOpen(null)} /> : null}</AnimatePresence>
    </div>
  );
}
