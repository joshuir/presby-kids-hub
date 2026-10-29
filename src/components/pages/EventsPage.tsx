"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CalendarRange, List, Rss } from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { MonthCalendar } from "@/components/blocks/MonthCalendar";
import { EventCard } from "@/components/blocks/EventCard";
import { Loading } from "@/components/site/LoadState";
import { downloadIcs, todayISO } from "@/lib/format";
import { useContent } from "@/lib/useContent";
import { cn } from "@/lib/cn";

export function EventsPage() {
  const events = useContent("events");
  const [cat, setCat] = useState("All");
  const [view, setView] = useState<"month" | "list">("month");
  const [month, setMonth] = useState(() => new Date());
  const [day, setDay] = useState<string | null>(null);
  const cats = useMemo(() => ["All", ...Array.from(new Set((events ?? []).map((e) => e.category).filter(Boolean)))], [events]);
  const list = (events ?? []).filter((e) => cat === "All" || e.category === cat).sort((a, b) => a.date.localeCompare(b.date));
  const t = todayISO();
  const mk = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const inMonth = list.filter((e) => e.date.startsWith(mk));
  const right = day ? list.filter((e) => e.date === day) : inMonth;
  const upcomingList = list.filter((e) => e.date >= t);
  const past = list.filter((e) => e.date < t).reverse();
  const byMonth = upcomingList.reduce<Record<string, typeof list>>((acc, e) => {
    const k = e.date.slice(0, 7);
    (acc[k] ||= []).push(e);
    return acc;
  }, {});

  return (
    <div>
      <PageHero eyebrow="Events" title="What's on this season" intro="Tap a date. Add it to your calendar in one tap.">
        <ul className="flex flex-wrap gap-2" aria-hidden>
          {["🧺 Harvest", "⛺ Camp", "👨‍👩‍👧 Parents' Day", "🎄 Christmas"].map((x) => (
            <li key={x} className="rounded-full bg-white px-3.5 py-2 text-sm font-extrabold shadow-soft">{x}</li>
          ))}
        </ul>
      </PageHero>
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1" role="tablist" aria-label="Event type">
            {cats.map((c) => (
              <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold", cat === c ? "bg-ink text-white" : "bg-white ring-1 ring-ink/10")}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full bg-white p-1 ring-1 ring-ink/10" role="tablist" aria-label="View">
              {(
                [
                  ["month", "Month", CalendarRange],
                  ["list", "List", List],
                ] as const
              ).map(([k, l, I]) => (
                <button key={k} type="button" role="tab" aria-selected={view === k} onClick={() => setView(k)} className={cn("inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold", view === k ? "bg-blueBrand-600 text-white" : "text-ink/60")}>
                  <I className="h-4 w-4" aria-hidden /> {l}
                </button>
              ))}
            </div>
            <button type="button" disabled={!upcomingList.length} onClick={() => downloadIcs(upcomingList, "childrens-ministry-events")} title="Add every upcoming event to your calendar app" className="inline-flex items-center gap-1.5 rounded-full bg-sun px-4 py-2 text-sm font-extrabold shadow-[0_3px_0_#D99A12] disabled:opacity-50">
              <Rss className="h-4 w-4" aria-hidden /> Subscribe
            </button>
          </div>
        </div>

        {!events ? <Loading label="Loading events…" /> : null}

        {events && view === "month" ? (
          <div className="mt-6 grid items-start gap-4 lg:grid-cols-[1.5fr_1fr]">
            <MonthCalendar events={list} month={month} onMonth={(d) => { setMonth(d); setDay(null); }} selected={day} onSelect={setDay} />
            <div className="grid gap-3">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                <CalendarDays className="h-5 w-5 text-blueBrand-600" aria-hidden />
                {day ? new Date(day + "T12:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : `In ${month.toLocaleDateString("en-GB", { month: "long" })}`}
              </h2>
              {right.map((e) => <EventCard key={e.id} e={e} />)}
              {!right.length ? (
                <div className="card p-6 text-ink/60">
                  Nothing on {day ? "that day" : "this month"}.{" "}
                  {upcomingList[0] ? (
                    <button type="button" className="font-bold text-blueBrand-700" onClick={() => { const d = new Date(upcomingList[0].date + "T12:00"); setMonth(d); setDay(upcomingList[0].date); }}>
                      Jump to the next event →
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {events && view === "list" ? (
          <div className="mt-6 grid gap-10">
            {Object.entries(byMonth).map(([k, evs]) => (
              <section key={k}>
                <h2 className="font-display text-2xl font-extrabold">{new Date(k + "-15").toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">{evs.map((e) => <EventCard key={e.id} e={e} />)}</div>
              </section>
            ))}
            {!upcomingList.length ? <p className="card p-6 text-ink/60">No upcoming events yet.</p> : null}
            {past.length ? (
              <section className="opacity-80">
                <h2 className="font-display text-2xl font-extrabold">Past events</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">{past.map((e) => <EventCard key={e.id} e={e} />)}</div>
              </section>
            ) : null}
          </div>
        ) : null}
      </Container>
    </div>
  );
}
