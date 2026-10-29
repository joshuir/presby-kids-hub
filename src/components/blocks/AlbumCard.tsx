import type { GalleryDoc } from "@/lib/cms/types";
import { AlbumArt } from "@/components/art/Illustrations";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export function AlbumCover({ a, i, className }: { a: GalleryDoc; i: number; className?: string }) {
  const src = a.cover || a.media?.find((m) => m.type === "image")?.url;
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" loading="lazy" className={cn("object-cover", className)} />
  ) : (
    <AlbumArt seed={i} className={className} label={a.title} />
  );
}

export function AlbumCard({ a, i, onOpen }: { a: GalleryDoc; i: number; onOpen?: () => void }) {
  const inner = (
    <>
      <div className="overflow-hidden rounded-[1.4rem]">
        <AlbumCover a={a} i={i} className="aspect-[4/3] w-full transition duration-500 group-hover:scale-105" />
      </div>
      <div className="px-1 pb-1 pt-3 text-left">
        <span className="eyebrow bg-sun-soft !py-0.5 text-[#9A6400]">{a.category}</span>
        <div className="mt-1.5 font-display text-lg font-bold leading-tight">{a.title}</div>
        <div className="text-xs font-semibold text-ink/50">{fmtDate(a.date, { month: "short", year: "numeric" })}{a.media?.length ? ` · ${a.media.length} photos` : ""}</div>
      </div>
    </>
  );
  return onOpen ? (
    <button type="button" onClick={onOpen} className="group card block w-full p-2 transition hover:-translate-y-1">{inner}</button>
  ) : (
    <div className="group card p-2">{inner}</div>
  );
}
