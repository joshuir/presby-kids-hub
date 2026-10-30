"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { useSettings } from "@/lib/site";

/** The ministry crest + name. Always links to the home page. */
export function Logo({ name, sub, light = false, size = 44, className }: { name?: string; sub?: string; light?: boolean; size?: number; className?: string }) {
  const s = useSettings();
  const logo = s.logoUrl;
  name = name || s.siteName || "Children's Ministry";
  sub = sub || s.churchName || "Presbyterian Church";
  return (
    <Link href="/" aria-label={`${name} — home`} className={cn("flex min-w-0 shrink-0 items-center gap-2.5 rounded-2xl", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo || "/brand/logo.png"} alt="" width={size} height={Math.round(size * 1.125)} className="shrink-0 drop-shadow-sm" style={{ width: size, height: "auto" }} />
      <span className="min-w-0 leading-none">
        <span className={cn("block truncate font-display text-[15px] font-extrabold sm:text-base", light ? "text-white" : "text-ink")}>{name}</span>
        <span className={cn("mt-1 block truncate text-[9.5px] font-bold uppercase tracking-[0.18em]", light ? "text-white/60" : "text-ink/55")}>{sub}</span>
      </span>
    </Link>
  );
}
