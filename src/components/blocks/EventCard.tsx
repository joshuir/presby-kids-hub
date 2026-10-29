"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarPlus, ChevronDown, Clock, MapPin } from "lucide-react";
import type { EventDoc } from "@/lib/cms/types";
import { downloadIcs, fmtTime, googleCalUrl, outlookUrl } from "@/lib/format";
import { useSettings } from "@/lib/site";
import { sized } from "@/lib/img";
import { BrandGlyph } from "@/components/site/Social";

/** "Add to calendar" menu: Google, Apple (.ics), Outlook web and Outlook 365. */
export function AddToCalendar({ e }: { e: EventDoc }) {
  const s = useSettings();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (ev: MouseEvent | KeyboardEvent) => {
      if (ev instanceof KeyboardEvent ? ev.key === "Escape" : !ref.current?.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", off);
    document.addEventListener("keydown", off);
    return () => {
      document.removeEventListener("mousedown", off);
      document.removeEventListener("keydown", off);
    };
  }, [open]);
  const item = "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-bold hover:bg-paper";
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white">
        <CalendarPlus className="h-4 w-4" aria-hidden /> Add to calendar <ChevronDown className="h-4 w-4" aria-hidden />
      </button>
      {open ? (
        <div role="menu" className="absolute left-0 z-30 mt-2 w-60 rounded-2xl bg-white p-1.5 shadow-card ring-1 ring-ink/10">
          <a role="menuitem" className={item} href={googleCalUrl(e, s.address)} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
            <BrandGlyph name="google" className="h-5 w-5 text-[#4285F4]" /> Google Calendar
          </a>
          <button role="menuitem" type="button" className={item} onClick={() => { downloadIcs([e], e.id); setOpen(false); }}>
            <BrandGlyph name="apple" className="h-5 w-5" /> Apple Calendar
          </button>
          <a role="menuitem" className={item} href={outlookUrl(e, s.address)} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
            <span className="grid h-5 w-5 place-items-center rounded bg-[#0078D4] text-[11px] font-black text-white">O</span> Outlook.com
          </a>
          <a role="menuitem" className={item} href={outlookUrl(e, s.address, true)} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
            <span className="grid h-5 w-5 place-items-center rounded bg-[#0F6CBD] text-[11px] font-black text-white">O</span> Outlook 365
          </a>
          <button role="menuitem" type="button" className={item} onClick={() => { downloadIcs([e], e.id); setOpen(false); }}>
            <span className="grid h-5 w-5 place-items-center rounded bg-paper text-[10px] font-black">ICS</span> Other (.ics file)
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function EventCard({ e }: { e: EventDoc }) {
  const d = new Date(e.date + "T12:00:00");
  const pic = e.logo || e.image;
  return (
    <article id={e.id} className="card scroll-mt-28 overflow-visible p-4 sm:p-5">
      <div className="flex gap-4">
        <div className="relative shrink-0">
          <span className="block h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-paper ring-4 sm:h-28 sm:w-28" style={{ ["--tw-ring-color" as string]: e.color || "#2563EB" }}>
            {pic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sized(pic, 240, 240)} alt="" loading="lazy" className={e.logo ? "h-full w-full object-contain p-3" : "h-full w-full object-cover"} />
            ) : (
              <span className="grid h-full w-full place-items-center bg-sun-soft font-display text-3xl font-extrabold">{d.getDate()}</span>
            )}
          </span>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white">
            {d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          {e.category ? <span className="eyebrow bg-sky-soft !py-0.5 text-blueBrand-700">{e.category}</span> : null}
          <h3 className="mt-1.5 font-display text-2xl font-extrabold leading-tight">{e.title}</h3>
          <p className="mt-2 grid gap-1 text-[15px] font-semibold text-ink/60">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden />{d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} · {fmtTime(e.startTime)}{e.endTime ? ` – ${fmtTime(e.endTime)}` : ""}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden />{e.location}</span>
          </p>
        </div>
      </div>
      <p className="mt-4 text-base leading-7 text-ink/75">{e.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <AddToCalendar e={e} />
        {e.registerUrl ? <a href={e.registerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full bg-sun px-4 py-2.5 text-sm font-bold">Register</a> : null}
      </div>
    </article>
  );
}
