"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CalendarRange, List } from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { MonthCalendar } from "@/components/blocks/MonthCalendar";
import { EventCard } from "@/components/blocks/EventCard";
import { EventBubble } from "@/components/blocks/EventBubble";
import { CalendarSync } from "@/components/blocks/CalendarSync";
import { Loading } from "@/components/site/LoadState";
import { SplitWords } from "@/components/motion/SplitWords";
import { todayISO } from "@/lib/format";
import { useContent } from "@/lib/useContent";
import { useCopy } from "@/lib/site";
import { PageLayout } from "@/components/site/PageLayout";
import { cn } from "@/lib/cn";
import { Dropdown } from "@/components/ui/Dropdown";

export function EventsPage() {
  const events = useContent("events");
  const tx = useCopy();
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
  const jump = (date: string) => {
    setView("month");
    setMonth(new Date(date + "T12:00"));
    setDay(date);
    document.getElementById("calendar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sections: Record<string, React.ReactNode> = {
    hero: <PageHero page="events" eyebrow="Events" title="What's on this *season*" intro="Tap any event to see the details and add it to your calendar." />,
    upcoming: (
      <Container className="mt-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-3xl font-extrabold sm:text-5xl"><SplitWords text={tx("events.upcoming.title")} /></h2>
          <CalendarSync events={upcomingList} />
        </div>
        {!events ? <Loading label="Loading events…" /> : null}
        <ul data-reveal className="no-scrollbar -mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:flex-wrap sm:justify-start sm:gap-6 sm:overflow-visible sm:px-0">
          {upcomingList.map((e) => (
            <li key={e.id} data-stagger className="snap-start">
              <EventBubble e={e} onClick={() => jump(e.date)} active={day === e.date} size={150} />
            </li>
          ))}
          {events && !upcomingList.length ? <li className="card p-6 text-lg text-ink/60">{tx("events.upcoming.empty")}</li> : null}
        </ul>
      </Container>
    ),
    calendar: (

      <Container className="mt-14">
        <div id="calendar" className="flex scroll-mt-28 flex-wrap items-center justify-between gap-3">
          <Dropdown
            label="Event type"
            hideLabel
            testId="event-type"
            className="w-full sm:w-64"
            value={cat}
            onChange={setCat}
            options={cats.map((c) => ({
              value: c,
              label: c === "All" ? "All event types" : c,
              count: c === "All" ? (events ?? []).length : (events ?? []).filter((e) => e.category === c).length,
              color: c === "All" ? undefined : (events ?? []).find((e) => e.category === c)?.color || undefined,
            }))}
          />
          <div className="flex rounded-full bg-white p-1 ring-1 ring-ink/10" role="tablist" aria-label="View">
            {(
              [
                ["month", "Month", CalendarRange],
                ["list", "List", List],
              ] as const
            ).map(([k, l, I]) => (
              <button key={k} type="button" role="tab" aria-selected={view === k} onClick={() => setView(k)} className={cn("inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-base font-bold", view === k ? "bg-blueBrand-600 text-white" : "text-ink/60")}>
                <I className="h-4 w-4" aria-hidden /> {l}
              </button>
            ))}
          </div>
        </div>

        {events && view === "month" ? (
          <div className="mt-6 grid items-start gap-5 lg:grid-cols-[1.45fr_1fr]">
            <MonthCalendar events={list} month={month} onMonth={(d) => { setMonth(d); setDay(null); }} selected={day} onSelect={setDay} />
            <div className="grid gap-4">
              <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold">
                <CalendarDays className="h-6 w-6 text-blueBrand-600" aria-hidden />
                {day ? new Date(day + "T12:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : `In ${month.toLocaleDateString("en-GB", { month: "long" })}`}
              </h2>
              {right.map((e) => <EventCard key={e.id} e={e} />)}
              {!right.length ? (
                <div className="card p-6 text-lg text-ink/60">
                  Nothing on {day ? "that day" : "this month"}.{" "}
                  {upcomingList[0] ? (
                    <button type="button" className="font-bold text-blueBrand-700" onClick={() => jump(upcomingList[0].date)}>
                      Jump to the next event →
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {events && view === "list" ? (
          <div className="mt-6 grid gap-12">
            {Object.entries(byMonth).map(([k, evs]) => (
              <section key={k}>
                <h2 className="font-display text-3xl font-extrabold">{new Date(k + "-15").toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">{evs.map((e) => <EventCard key={e.id} e={e} />)}</div>
              </section>
            ))}
            {!upcomingList.length ? <p className="card p-6 text-lg text-ink/60">{tx("events.upcoming.empty")}</p> : null}
            {past.length ? (
              <section>
                <h2 className="font-display text-3xl font-extrabold">{tx("events.past.title")}</h2>
                <ul className="mt-6 flex flex-wrap gap-6 opacity-80">
                  {past.map((e) => (
                    <li key={e.id}><EventBubble e={e} size={110} onClick={() => jump(e.date)} /></li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : null}
      </Container>
    ),
  };
  return (
    <div>
      <PageLayout page="events" sections={sections} />
    </div>
  );
}
