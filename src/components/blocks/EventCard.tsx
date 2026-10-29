"use client";

import { CalendarPlus, Download, MapPin } from "lucide-react";
import type { EventDoc } from "@/lib/cms/types";
import { downloadIcs, fmtTime, googleCalUrl } from "@/lib/format";
import { useSettings } from "@/lib/site";

export function EventCard({ e }: { e: EventDoc }) {
  const s = useSettings();
  const d = new Date(e.date + "T12:00:00");
  return (
    <article id={e.id} className="card flex scroll-mt-28 gap-4 p-4 sm:p-5">
      <div className="grid h-20 w-16 shrink-0 place-items-center rounded-2xl bg-sun-soft text-center">
        <div>
          <div className="font-display text-3xl font-extrabold leading-none">{d.getDate()}</div>
          <div className="mt-1 text-[11px] font-extrabold uppercase tracking-wider text-[#9A6400]">{d.toLocaleDateString("en-GB", { month: "short" })}</div>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        {e.category ? <span className="eyebrow bg-sky-soft !py-0.5 text-blueBrand-700">{e.category}</span> : null}
        <h3 className="mt-1.5 font-display text-xl font-bold leading-snug">{e.title}</h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm font-semibold text-ink/55">
          <span>{d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · {fmtTime(e.startTime)}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden />{e.location}</span>
        </p>
        {e.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.image} alt="" loading="lazy" className="mt-3 aspect-[16/8] w-full rounded-2xl object-cover" />
        ) : null}
        <p className="mt-2 text-sm leading-6 text-ink/70">{e.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={googleCalUrl(e, s.address)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-bold text-white">
            <CalendarPlus className="h-4 w-4" aria-hidden /> Google Calendar
          </a>
          <button type="button" onClick={() => downloadIcs([e], e.id)} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold ring-1 ring-ink/10">
            <Download className="h-4 w-4" aria-hidden /> Apple / Outlook
          </button>
          {e.registerUrl ? <a href={e.registerUrl} className="inline-flex items-center rounded-full bg-sun px-3.5 py-2 text-xs font-bold">Register</a> : null}
        </div>
      </div>
    </article>
  );
}
