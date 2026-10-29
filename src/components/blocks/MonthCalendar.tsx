"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { EventDoc } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { todayISO } from "@/lib/format";
import { sized } from "@/lib/img";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Month grid (Mon–Sun). Days with events are tappable. */
export function MonthCalendar({
  events,
  month,
  onMonth,
  selected,
  onSelect,
  compact,
}: {
  events: EventDoc[];
  month: Date;
  onMonth: (d: Date) => void;
  selected: string | null;
  onSelect: (day: string | null) => void;
  compact?: boolean;
}) {
  const today = todayISO();
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - ((first.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    }).filter((d, i) => i < 35 || d.getMonth() === month.getMonth());
  }, [month]);
  const byDay = useMemo(() => {
    const m = new Map<string, EventDoc[]>();
    events.forEach((e) => m.set(e.date, [...(m.get(e.date) ?? []), e]));
    return m;
  }, [events]);
  const label = month.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl" aria-live="polite">{label}</h2>
        <div className="flex items-center gap-1">
          <button type="button" className="rounded-full px-3 py-2 text-xs font-bold ring-1 ring-ink/10 hover:bg-paper" onClick={() => { onMonth(new Date()); onSelect(null); }}>
            Today
          </button>
          <button type="button" aria-label="Previous month" className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-ink/10 hover:bg-paper" onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" aria-label="Next month" className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-ink/10 hover:bg-paper" onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-extrabold uppercase tracking-wider text-ink/45 sm:text-sm">
        {(compact ? ["M", "T", "W", "T", "F", "S", "S"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).map((d, i) => (
          <div key={i} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const k = iso(d);
          const evs = byDay.get(k) ?? [];
          const inMonth = d.getMonth() === month.getMonth();
          const isSel = selected === k;
          return (
            <button
              key={k}
              type="button"
              disabled={!evs.length}
              onClick={() => onSelect(isSel ? null : k)}
              aria-pressed={isSel}
              aria-label={`${d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}${evs.length ? `: ${evs.map((e) => e.title).join(", ")}` : ""}`}
              className={cn(
                "relative flex flex-col items-center justify-start rounded-xl p-1 font-bold transition",
                compact ? "aspect-square text-sm" : "min-h-[72px] text-base sm:min-h-[118px] sm:p-2 sm:text-lg",
                !inMonth && "text-ink/25",
                k === today && "ring-2 ring-blueBrand-600",
                evs.length ? (isSel ? "bg-blueBrand-600 text-white" : "bg-sky-soft text-blueBrand-800 hover:bg-blueBrand-100") : "cursor-default",
              )}
            >
              <span>{d.getDate()}</span>
              {evs.length ? (
                compact ? (
                  <span className={cn("mt-0.5 h-1.5 w-1.5 rounded-full", isSel ? "bg-white" : "bg-blueBrand-600")} />
                ) : (
                  <span className="mt-1 flex w-full flex-col items-center">
                    <span className="flex -space-x-3">
                      {evs.slice(0, 2).map((e) => {
                        const pic = e.logo || e.image;
                        return (
                          <span key={e.id} className="block h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-white shadow sm:h-12 sm:w-12" style={{ boxShadow: `0 0 0 2px ${e.color || "#2563EB"}` }}>
                            {pic ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={sized(pic, 100, 100)} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="grid h-full w-full place-items-center text-xs font-extrabold">{e.title[0]}</span>
                            )}
                          </span>
                        );
                      })}
                    </span>
                    <span className="mt-1 hidden w-full truncate text-center text-xs font-bold leading-tight sm:block">{evs[0].title}</span>
                  </span>
                )
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
