"use client";

import Link from "next/link";
import { Images } from "lucide-react";
import { RotatingImage } from "./RotatingImage";
import { albumPhotos } from "./GalleryRail";
import { AlbumArt } from "@/components/art/Illustrations";
import { fmtDate } from "@/lib/format";
import type { GalleryDoc } from "@/lib/cms/types";

/** Album card whose three photo slots rotate through the album on their own. */
export function CollageCard({ a, i }: { a: GalleryDoc; i: number }) {
  const photos = albumPhotos(a);
  const third = (k: number) => photos.filter((_, j) => j % 3 === k);
  return (
    <Link href={`/gallery/?album=${a.id}`} data-cursor="View" data-tilt="4" className="group card block overflow-hidden p-2.5">
      {photos.length ? (
        <div className="grid aspect-[5/4] grid-cols-[1.6fr_1fr] grid-rows-2 gap-2">
          <RotatingImage images={third(0).length ? third(0) : photos} alt={a.title} offset={i * 3} className="row-span-2 rounded-[1.1rem]" width={700} height={800} />
          <RotatingImage images={third(1).length ? third(1) : photos} offset={i * 3 + 1} className="rounded-[1.1rem]" width={400} height={400} />
          <RotatingImage images={third(2).length ? third(2) : photos} offset={i * 3 + 2} className="rounded-[1.1rem]" width={400} height={400} />
        </div>
      ) : (
        <AlbumArt seed={i} className="aspect-[5/4] w-full rounded-[1.1rem]" label={a.title} />
      )}
      <div className="flex items-end justify-between gap-3 px-1.5 pb-1 pt-3">
        <div className="min-w-0">
          <span className="eyebrow bg-sun-soft !py-0.5 text-[#9A6400]">{a.category}</span>
          <div className="mt-1.5 truncate font-display text-xl font-extrabold leading-tight">{a.title}</div>
          <div className="text-xs font-semibold text-ink/50">{fmtDate(a.date, { month: "long", year: "numeric" })}</div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-paper px-2.5 py-1 text-xs font-bold text-ink/60">
          <Images className="h-3.5 w-3.5" aria-hidden /> {photos.length}
        </span>
      </div>
    </Link>
  );
}
