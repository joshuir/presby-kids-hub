"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RotatingImage } from "./RotatingImage";
import { useMotionLevel } from "@/components/motion/MotionDirector";
import type { GalleryDoc } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { useSettings } from "@/lib/site";

export function albumPhotos(a: GalleryDoc) {
  const imgs = (a.media ?? []).filter((m) => m.type === "image").map((m) => m.url);
  return [a.cover, ...imgs.filter((u) => u !== a.cover)].filter(Boolean) as string[];
}

function Strip({ albums, reverse, tallFirst, seconds, stopped, moving }: { albums: GalleryDoc[]; reverse?: boolean; tallFirst: boolean; seconds: number; stopped: boolean; moving: boolean }) {
  const doubled = [...albums, ...albums];
  return (
    <div className="marquee-wrap overflow-hidden" data-paused={stopped ? "true" : "false"}>
      <div
        className={cn(moving ? "marquee" : "flex w-max", reverse && "reverse", "items-end gap-4 py-2 sm:gap-5")}
        style={{ ["--marquee-speed" as string]: `${seconds}s` }}
      >
        {doubled.map((a, k) => {
          const tall = (k % 2 === 0) === tallFirst;
          const photos = albumPhotos(a);
          const dup = k >= albums.length;
          return (
            <Link
              key={a.id + k}
              href={`/gallery/?album=${a.id}`}
              tabIndex={dup ? -1 : undefined}
              aria-hidden={dup || undefined}
              data-cursor="View"
              className="group block shrink-0"
            >
              <div className={cn("overflow-hidden rounded-[1.2rem] bg-paper", tall ? "h-[260px] w-[210px] sm:h-[340px] sm:w-[260px]" : "h-[150px] w-[210px] sm:h-[180px] sm:w-[260px]")}>
                <RotatingImage
                  images={reverse ? [...photos].reverse() : photos}
                  alt={a.title}
                  offset={k + (reverse ? 3 : 0)}
                  width={600}
                  height={tall ? 800 : 400}
                  paused={stopped}
                  className="h-full w-full transition duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div className="mt-2.5 flex items-baseline justify-between gap-3 pr-1">
                <span className="font-display text-[14px] font-extrabold uppercase tracking-tight text-ink">{a.title}</span>
                <ArrowUpRight className="h-4 w-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Editorial auto-moving gallery (reference: architecture "Works" rail): two strips of albums
 * glide in opposite directions on their own — no buttons, no dragging. Each tile quietly rotates
 * through its album's photos. Everything pauses while the pointer rests on a strip (or a strip
 * has keyboard focus) so a photo can be looked at or clicked. Speed: Settings → Animations.
 */
export function GalleryRail({
  albums,
  title = "Gallery",
  links = [],
  className,
}: {
  albums: GalleryDoc[];
  title?: string;
  links?: Array<{ href: string; label: string }>;
  className?: string;
}) {
  const level = useMotionLevel();
  const s = useSettings();
  if (!albums.length) return null;
  const moving = level !== "off";
  const base = Math.max(20, Number(s.galleryStripSeconds) || 60);
  const seconds = base * Math.max(1, albums.length / 6);
  // second strip starts half-way through the list so the two rows never show the same album side by side
  const half = Math.ceil(albums.length / 2);
  const second = [...albums.slice(half), ...albums.slice(0, half)];

  return (
    <section className={cn("relative", className)} aria-label={`${title || "Gallery"} — albums`}>
      <div className="grid gap-5">
        <Strip albums={albums} tallFirst seconds={seconds} stopped={!moving} moving={moving} />
        {albums.length > 2 ? <Strip albums={second} reverse tallFirst={false} seconds={seconds * 1.15} stopped={!moving} moving={moving} /> : null}
      </div>

      {title || links.length ? <div className="mx-auto mt-10 flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 sm:px-6">
        {title ? <h2 className="font-display text-[3.4rem] font-extrabold uppercase leading-[0.82] tracking-[-0.04em] text-ink sm:text-[6.5rem] lg:text-[8.5rem]">{title}</h2> : <span />}
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
      </div> : null}
    </section>
  );
}
