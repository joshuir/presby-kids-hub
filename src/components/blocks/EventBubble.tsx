"use client";

import type { EventDoc } from "@/lib/cms/types";
import { fmtTime } from "@/lib/format";
import { sized } from "@/lib/img";
import { cn } from "@/lib/cn";

/** Round event badge: photo or logo in a coloured ring, the date chip, and the name underneath. */
export function EventBubble({ e, size = 150, onClick, active, className }: { e: EventDoc; size?: number; onClick?: () => void; active?: boolean; className?: string }) {
  const d = new Date(e.date + "T12:00:00");
  const pic = e.logo || e.image;
  const ring = e.color || "#2563EB";
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick ? { type: "button" as const, onClick, "aria-pressed": active } : {})}
      className={cn("group flex flex-col items-center text-center", className)}
      style={{ width: size + 24 }}
    >
      <span className="relative block" style={{ width: size, height: size }}>
        <span
          aria-hidden
          className={cn("absolute -inset-1.5 rounded-full transition duration-500 group-hover:rotate-[160deg]", active && "scale-105")}
          style={{ background: `conic-gradient(${ring}, #FFC53D, ${ring})` }}
        />
        <span className="absolute inset-0 overflow-hidden rounded-full border-[5px] border-white bg-paper">
          {pic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sized(pic, size * 2, size * 2)} alt="" loading="lazy" className={cn("h-full w-full transition duration-700 group-hover:scale-110", e.logo ? "object-contain p-4" : "object-cover")} />
          ) : (
            <span className="grid h-full w-full place-items-center font-display text-4xl font-extrabold" style={{ background: `${ring}22`, color: ring }}>
              {e.title.slice(0, 1)}
            </span>
          )}
        </span>
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg">
          {d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </span>
      </span>
      <span className="mt-5 block font-display text-lg font-extrabold leading-tight sm:text-xl">{e.title}</span>
      <span className="mt-1 block text-sm font-semibold text-ink/55">
        {d.toLocaleDateString("en-GB", { weekday: "short" })} · {fmtTime(e.startTime)}
      </span>
    </Tag>
  );
}
