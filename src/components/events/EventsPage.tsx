"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { Loading } from "@/components/site/LoadState";
import { Reveal } from "@/components/ui/Reveal";
import { getPublic } from "@/lib/cms/client";
import { downloadIcs, eventStart, fmtDate, googleCalUrl, upcoming } from "@/lib/format";
import type { EventDoc } from "@/lib/cms/types";
import { cn } from "@/lib/cn";

function EventCard({ e, past }: { e: EventDoc; past?: boolean }) {
  const d = eventStart(e);
  return (
    <article id={e.id} className={cn("group grid scroll-mt-28 overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-black/5 sm:grid-cols-[140px_1fr]", past && "opacity-75")}>
      <div className="grid place-items-center bg-hero-blue p-5 text-center text-white">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-white/70">{d.toLocaleDateString("en-GB", { month: "short" })}</div>
          <div className="font-[family-name:var(--font-heading)] text-5xl leading-none">{d.getDate()}</div>
          <div className="mt-1 text-xs text-white/70">{d.toLocaleDateString("en-GB", { weekday: "long" })}</div>
        </div>
      </div>
      <div className="p-6">
        {e.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.image} alt="" loading="lazy" className="mb-4 aspect-[16/7] w-full rounded-2xl object-cover" />
        ) : null}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-blueBrand-600">
          {e.category ? <span className="rounded-full bg-sky-soft px-2.5 py-1">{e.category}</span> : null}
          <span>{fmtDate(e.date)} · {e.startTime}{e.endTime ? `–${e.endTime}` : ""}</span>
        </div>
        <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl text-navy-900">{e.title}</h3>
        <div className="mt-1 text-sm text-black/55">📍 {e.location}</div>
        <p className="mt-3 text-sm leading-6 text-black/70">{e.description}</p>
        {!past ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={googleCalUrl(e)} target="_blank" rel="noreferrer" className="rounded-full bg-navy-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-blueBrand-700">+ Google Calendar</a>
            <button type="button" onClick={() => downloadIcs(e)} className="rounded-full bg-sky-soft px-4 py-2 text-xs font-bold text-navy-900 transition hover:bg-blueBrand-100">Download .ics</button>
            {e.registerUrl ? <a href={e.registerUrl} className="rounded-full bg-sun-400 px-4 py-2 text-xs font-bold text-navy-900">Register</a> : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function EventsPage() {
  const [events, setEvents] = useState<EventDoc[] | null>(null);
  const [tab, setTab] = useState<"up" | "past">("up");

  useEffect(() => {
    getPublic("events").then(setEvents).catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    if (!events?.length) return;
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify(
      upcoming(events).map((e) => ({
        "@context": "https://schema.org",
        "@type": "Event",
        name: e.title,
        startDate: `${e.date}T${e.startTime || "09:00"}`,
        endDate: e.endTime ? `${e.date}T${e.endTime}` : undefined,
        location: { "@type": "Place", name: e.location },
        description: e.description,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      })),
    );
    document.head.appendChild(ld);
    return () => ld.remove();
  }, [events]);

  const up = events ? upcoming(events) : [];
  const past = events ? events.filter((e) => !up.includes(e)).sort((a, b) => b.date.localeCompare(a.date)) : [];
  const list = tab === "up" ? up : past;

  return (
    <div>
      <PageHero eyebrow="Events" title="What’s coming up" intro="Family days, services and special programmes. Add any event to your calendar in one tap." />
      <Container className="mt-10 max-w-4xl">
        <div className="inline-flex rounded-full bg-sky-soft p-1" role="tablist">
          {(["up", "past"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("rounded-full px-5 py-2 text-sm font-bold transition", tab === t ? "bg-white text-navy-900 shadow-soft" : "text-navy-900/60")}>
              {t === "up" ? `Upcoming (${up.length})` : `Past (${past.length})`}
            </button>
          ))}
        </div>
        {events === null ? <Loading label="Loading events…" /> : null}
        {events && !list.length ? <p className="py-16 text-center text-black/50">{tab === "up" ? "No upcoming events yet — check back soon." : "No past events."}</p> : null}
        <Reveal key={tab + (events ? "1" : "0")} className="mt-6 grid gap-5">
          {list.map((e) => <div key={e.id} data-stagger><EventCard e={e} past={tab === "past"} /></div>)}
        </Reveal>
      </Container>
    </div>
  );
}
