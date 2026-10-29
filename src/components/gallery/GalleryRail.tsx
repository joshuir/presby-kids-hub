"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { RotatingImage } from "./RotatingImage";
import { useMotionLevel } from "@/components/motion/MotionDirector";
import type { GalleryDoc } from "@/lib/cms/types";
import { cn } from "@/lib/cn";

export function albumPhotos(a: GalleryDoc) {
  const imgs = (a.media ?? []).filter((m) => m.type === "image").map((m) => m.url);
  return [a.cover, ...imgs.filter((u) => u !== a.cover)].filter(Boolean) as string[];
}

/**
 * Editorial auto-moving strip of albums (reference: architecture "Works" rail):
 * tall and short photos alternate on a shared baseline, names sit underneath,
 * each tile quietly rotates through its album, and a big title + live progress sit below.
 * It moves on its own — no dragging — and pauses on hover, focus or with the pause button.
 */
export function GalleryRail({
  albums,
  title = "Gallery",
  links = [],
  speed = 60,
  className,
}: {
  albums: GalleryDoc[];
  title?: string;
  links?: Array<{ href: string; label: string }>;
  /** seconds for one full loop */
  speed?: number;
  className?: string;
}) {
  const level = useMotionLevel();
  const [paused, setPaused] = useState(false);
  const [pct, setPct] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);

  // read the marquee's position to show progress like the reference "(58%)"
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = trackRef.current;
      if (el) {
        const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
        const half = el.scrollWidth / 2 || 1;
        setPct(Math.round((Math.abs(m.m41) / half) * 100) % 101);
      }
      raf = window.setTimeout(tick, 250) as unknown as number;
    };
    tick();
    return () => window.clearTimeout(raf);
  }, []);

  if (!albums.length) return null;
  const doubled = [...albums, ...albums];
  const moving = level !== "off";
  const stopped = paused || !moving;

  return (
    <section className={cn("relative", className)} aria-label={`${title} — albums`}>
      <div
        ref={wrapRef}
        className="marquee-wrap overflow-hidden"
        data-paused={stopped ? "true" : "false"}
        onMouseEnter={() => (hoverRef.current = true)}
        onMouseLeave={() => (hoverRef.current = false)}
      >
        <div
          ref={trackRef}
          className={cn(moving ? "marquee" : "flex w-max", "items-end gap-4 py-2 sm:gap-5")}
          style={{ ["--marquee-speed" as string]: `${Math.max(20, speed) * (albums.length / 6)}s` }}
        >
          {doubled.map((a, k) => {
            const tall = k % 2 === 0;
            const photos = albumPhotos(a);
            const dup = k >= albums.length;
            return (
              <Link
                key={a.id + k}
                href={`/gallery/?album=${a.id}`}
                tabIndex={dup ? -1 : undefined}
                aria-hidden={dup || undefined}
                className="group block shrink-0"
              >
                <div className={cn("overflow-hidden bg-paper", tall ? "h-[300px] w-[230px] sm:h-[380px] sm:w-[280px]" : "h-[160px] w-[230px] sm:h-[190px] sm:w-[280px]")}>
                  <RotatingImage
                    images={photos}
                    alt={a.title}
                    offset={k}
                    width={600}
                    height={tall ? 800 : 400}
                    paused={stopped}
                    className="h-full w-full transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3 pr-1">
                  <span className="font-display text-[15px] font-extrabold uppercase tracking-tight text-ink">{a.title}</span>
                  <ArrowUpRight className="h-4 w-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 sm:px-6">
        <h2 className="font-display text-[3.4rem] font-extrabold uppercase leading-[0.82] tracking-[-0.04em] text-ink sm:text-[6.5rem] lg:text-[8.5rem]">{title}</h2>
        <div className="flex items-center gap-4 pb-2">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-wide ring-1 ring-ink/10 hover:bg-paper"
            aria-pressed={paused}
            disabled={!moving}
          >
            {stopped ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
            {stopped ? "Play" : "Pause"}
          </button>
          <span className="font-display text-sm font-extrabold uppercase tracking-wide text-ink/70" aria-live="off">
            {moving ? (stopped ? "Paused" : "Auto-playing") : "Gallery"} <span className="tabular-nums">({pct}%)</span>
          </span>
        </div>
        {links.length ? (
          <ul className="grid gap-1 pb-2 text-right">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="font-display text-sm font-extrabold uppercase tracking-wide hover:text-blueBrand-600">
                  {l.label} ↗
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
