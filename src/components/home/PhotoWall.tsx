"use client";

import { useMemo } from "react";
import { useContent } from "@/lib/useContent";
import { sized } from "@/lib/img";
import { albumPhotos } from "@/components/gallery/GalleryRail";

/** Two rows of real photos drifting in opposite directions (pauses on hover; still for reduced motion). */
export function PhotoWall() {
  const albums = useContent("gallery");
  const photos = useMemo(() => (albums ?? []).flatMap((a) => albumPhotos(a).slice(0, 3)), [albums]);
  if (photos.length < 6) return null;
  const half = Math.ceil(photos.length / 2);
  const rows = [photos.slice(0, half), photos.slice(half)];
  return (
    <section aria-label="Photos from our Sundays" className="mt-10 grid gap-3 overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      {rows.map((row, r) => (
        <div key={r} className="marquee-wrap">
          <div className={`marquee gap-3 ${r ? "reverse" : ""}`} style={{ ["--marquee-speed" as string]: `${row.length * 6}s` }}>
            {[...row, ...row].map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={sized(src, 420, 300)}
                alt=""
                loading="lazy"
                className={`h-28 w-40 shrink-0 rounded-2xl object-cover shadow-soft transition duration-500 hover:scale-105 sm:h-40 sm:w-56 ${i % 3 === 1 ? "rotate-[-2deg]" : i % 3 === 2 ? "rotate-[2deg]" : ""}`}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
