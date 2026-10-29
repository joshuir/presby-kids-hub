"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Search, X } from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { Loading } from "@/components/site/LoadState";
import { VideoEmbed } from "@/components/ui/VideoEmbed";
import { GalleryRail, albumPhotos } from "@/components/gallery/GalleryRail";
import { CollageCard } from "@/components/gallery/CollageCard";
import { RotatingImage } from "@/components/gallery/RotatingImage";
import { SplitWords } from "@/components/motion/SplitWords";
import { fmtDate } from "@/lib/format";
import { sized } from "@/lib/img";
import { useContent } from "@/lib/useContent";
import type { GalleryDoc, MediaItem } from "@/lib/cms/types";
import { cn } from "@/lib/cn";

function Lightbox({ album, start, onClose }: { album: GalleryDoc; start: number; onClose: () => void }) {
  const media = album.media ?? [];
  const [i, setI] = useState(start);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((x) => (x + 1) % media.length);
      if (e.key === "ArrowLeft") setI((x) => (x - 1 + media.length) % media.length);
    };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [media.length, onClose]);
  const m = media[i];
  return (
    <motion.div className="fixed inset-0 z-[90] flex flex-col bg-ink/95 text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`${album.title} — photo ${i + 1} of ${media.length}`}>
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="truncate font-display text-lg font-extrabold">{album.title}</div>
          <div className="text-sm text-white/60">{i + 1} / {media.length}</div>
        </div>
        <button ref={closeRef} type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close">
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={i} className="absolute inset-0 grid place-items-center px-3 pb-4 sm:px-20" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {m?.type === "video" ? (
              /youtu|vimeo/.test(m.url) ? <div className="w-full max-w-4xl"><VideoEmbed url={m.url} title={album.title} /></div> : <video src={m.url} controls className="max-h-full max-w-full" />
            ) : m ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sized(m.url, 2000)} alt={m.caption || album.title} className="max-h-[78dvh] max-w-full rounded-2xl object-contain" />
            ) : null}
          </motion.div>
        </AnimatePresence>
        {media.length > 1 ? (
          <>
            <button type="button" aria-label="Previous photo" onClick={() => setI((i - 1 + media.length) % media.length)} className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-lg"><ChevronLeft className="h-5 w-5" aria-hidden /></button>
            <button type="button" aria-label="Next photo" onClick={() => setI((i + 1) % media.length)} className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-lg"><ChevronRight className="h-5 w-5" aria-hidden /></button>
          </>
        ) : null}
      </div>
      {m?.caption ? <p className="px-4 pb-3 text-center text-white/75">{m.caption}</p> : null}
      <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto px-4 pb-5">
        {media.map((x, k) => (
          <button key={k} type="button" onClick={() => setI(k)} aria-label={`Photo ${k + 1}`} aria-current={k === i} className={cn("h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-2 transition", k === i ? "ring-sun" : "opacity-50 ring-transparent hover:opacity-100")}>
            {x.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sized(x.url, 120, 120)} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full w-full place-items-center bg-white/10"><Play className="h-4 w-4" aria-hidden /></span>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/** Album page: an auto-rotating mosaic on top, then every photo in a grid. */
function AlbumView({ album, all }: { album: GalleryDoc; all: GalleryDoc[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const photos = albumPhotos(album);
  const slot = (k: number) => {
    const l = photos.filter((_, j) => j % 5 === k);
    return l.length ? l : photos;
  };
  const idx = all.findIndex((a) => a.id === album.id);
  const prev = all[(idx - 1 + all.length) % all.length];
  const next = all[(idx + 1) % all.length];
  const media: MediaItem[] = album.media?.length ? album.media : photos.map((url) => ({ type: "image" as const, url }));

  return (
    <div>
      <Container className="pt-8">
        <Link href="/gallery/" className="inline-flex items-center gap-2 text-sm font-bold text-ink/60 hover:text-blueBrand-600">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All albums
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <span className="eyebrow bg-sun-soft text-[#9A6400]">{album.category} · {fmtDate(album.date, { month: "long", year: "numeric" })}</span>
            <h1 className="mt-3 font-display text-5xl font-extrabold leading-[0.95] sm:text-7xl"><SplitWords hero text={album.title} /></h1>
            {album.description ? <p className="mt-4 text-lg leading-8 text-ink/65">{album.description}</p> : null}
          </div>
          <button type="button" onClick={() => setPaused((p) => !p)} aria-pressed={paused} className="btn btn-ghost !py-2.5 text-sm">
            {paused ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />} {paused ? "Play slideshow" : "Pause slideshow"}
          </button>
        </div>
      </Container>

      {/* auto-rotating mosaic */}
      <Container className="mt-8">
        <div data-reveal="clip" className="grid h-[520px] grid-cols-2 grid-rows-3 gap-2 sm:h-[620px] sm:grid-cols-4 sm:grid-rows-2 sm:gap-3">
          <RotatingImage images={slot(0)} alt={album.title} offset={0} paused={paused} width={1200} height={1000} className="col-span-2 row-span-2 rounded-[1.6rem]" />
          <RotatingImage images={slot(1)} offset={1} paused={paused} width={600} height={600} className="rounded-[1.4rem]" />
          <RotatingImage images={slot(2)} offset={2} paused={paused} width={600} height={600} className="rounded-[1.4rem]" />
          <RotatingImage images={slot(3)} offset={3} paused={paused} width={600} height={600} className="hidden rounded-[1.4rem] sm:block" />
          <RotatingImage images={slot(4)} offset={4} paused={paused} width={600} height={600} className="hidden rounded-[1.4rem] sm:block" />
        </div>
      </Container>

      {/* every photo */}
      <Container className="mt-14">
        <h2 className="font-display text-2xl font-extrabold">All {media.length} photos</h2>
        <ul data-reveal className="mt-5 columns-2 gap-3 sm:columns-3 lg:columns-4">
          {media.map((m, k) => (
            <li key={k} data-stagger className="mb-3 break-inside-avoid">
              <button type="button" onClick={() => setOpen(k)} className="group zoom-img block w-full overflow-hidden rounded-[1.2rem]" aria-label={`Open photo ${k + 1}${m.caption ? `: ${m.caption}` : ""}`}>
                {m.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sized(m.url, 700)} alt={m.caption || ""} loading="lazy" className="w-full" style={{ aspectRatio: [4 / 5, 1, 4 / 3, 3 / 4][k % 4] }} />
                ) : (
                  <span className="grid aspect-video w-full place-items-center bg-ink text-white"><Play className="h-8 w-8" aria-hidden /></span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </Container>

      {all.length > 1 ? (
        <Container className="mt-12">
          <nav className="grid gap-3 sm:grid-cols-2" aria-label="More albums">
            <Link href={`/gallery/?album=${prev.id}`} className="card group flex items-center gap-4 p-3">
              <ArrowLeft className="ml-2 h-5 w-5 shrink-0 transition group-hover:-translate-x-1" aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sized(albumPhotos(prev)[0] ?? "", 160, 160)} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <span className="min-w-0"><span className="block text-xs font-bold uppercase text-ink/45">Previous album</span><span className="block truncate font-display text-lg font-bold">{prev.title}</span></span>
            </Link>
            <Link href={`/gallery/?album=${next.id}`} className="card group flex items-center justify-end gap-4 p-3 text-right">
              <span className="min-w-0"><span className="block text-xs font-bold uppercase text-ink/45">Next album</span><span className="block truncate font-display text-lg font-bold">{next.title}</span></span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sized(albumPhotos(next)[0] ?? "", 160, 160)} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <ArrowRight className="mr-2 h-5 w-5 shrink-0 transition group-hover:translate-x-1" aria-hidden />
            </Link>
          </nav>
        </Container>
      ) : null}

      <AnimatePresence>{open !== null ? <Lightbox album={{ ...album, media }} start={open} onClose={() => setOpen(null)} /> : null}</AnimatePresence>
    </div>
  );
}

function GalleryInner() {
  const albums = useContent("gallery");
  const sp = useSearchParams();
  const router = useRouter();
  const albumId = sp.get("album");
  const [cat, setCat] = useState(() => sp.get("cat") ?? "All");
  const [q, setQ] = useState("");

  const sorted = useMemo(() => [...(albums ?? [])].sort((a, b) => a.order - b.order || b.date.localeCompare(a.date)), [albums]);
  const cats = useMemo(() => ["All", ...Array.from(new Set(sorted.map((a) => a.category).filter(Boolean)))], [sorted]);
  const shown = sorted.filter((a) => (cat === "All" || a.category === cat) && (!q || `${a.title} ${a.category} ${a.description}`.toLowerCase().includes(q.toLowerCase())));
  const album = albumId ? sorted.find((a) => a.id === albumId) : undefined;

  useEffect(() => {
    if (albumId && albums && !album) router.replace("/gallery/");
  }, [albumId, albums, album, router]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [albumId]);

  if (!albums) return <Loading label="Loading albums…" />;
  if (album) return <AlbumView album={album} all={sorted} />;

  return (
    <div>
      <PageHero page="gallery" eyebrow="Gallery" title="Moments of *joy*" intro="Group photos only — always shared with parental consent." />

      <div className="mt-6">
        <GalleryRail
          albums={sorted}
          title="Gallery"
          links={cats.slice(1, 3).map((c) => ({ href: `/gallery/?cat=${encodeURIComponent(c)}#albums`, label: c }))}
        />
      </div>

      <Container className="mt-20" >
        <div id="albums" className="scroll-mt-28 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl font-extrabold sm:text-5xl"><SplitWords text="Every *album*" /></h2>
            <p className="mt-2 text-ink/60">Each collage changes by itself — open one to see every photo.</p>
          </div>
          <label className="relative w-full sm:w-72">
            <span className="sr-only">Search albums</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search albums" className="h-12 w-full rounded-full bg-white pl-11 pr-4 outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-blueBrand-500" />
          </label>
        </div>
        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Album categories">
          {cats.map((c) => (
            <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={cn("shrink-0 rounded-full px-4 py-2.5 text-sm font-bold transition", cat === c ? "bg-ink text-white" : "bg-white ring-1 ring-ink/10 hover:bg-paper")}>
              {c} <span className="opacity-50">{c === "All" ? sorted.length : sorted.filter((a) => a.category === c).length}</span>
            </button>
          ))}
        </div>
        <ul data-reveal className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-3" key={cat + q}>
          {shown.map((a, i) => (
            <li key={a.id} data-stagger>
              <CollageCard a={a} i={i} />
            </li>
          ))}
        </ul>
        {!shown.length ? <p className="card mt-6 p-8 text-center text-ink/55">No albums match — try another category.</p> : null}
      </Container>
    </div>
  );
}

export function GalleryPage() {
  return (
    <Suspense fallback={<Loading label="Loading albums…" />}>
      <GalleryInner />
    </Suspense>
  );
}
