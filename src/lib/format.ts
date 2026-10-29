import type { EventDoc, LessonDoc } from "@/lib/cms/types";

export function fmtDate(d: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  if (!d) return "";
  const dt = new Date(d.length === 10 ? d + "T12:00:00" : d.length === 7 ? d + "-15T12:00:00" : d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-GB", opts);
}

export function fmtTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "pm" : "am";
  return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, "0")} ${ap}`;
}

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function eventStart(e: EventDoc) {
  return new Date(`${e.date}T${e.startTime || "09:00"}:00`);
}

export function upcoming(events: EventDoc[], from = todayISO()) {
  return events.filter((e) => e.date >= from).sort((a, b) => +eventStart(a) - +eventStart(b));
}

/** Lessons for one class, newest first, and the current one (latest on/before today, else the earliest upcoming). */
export function classLessons(lessons: LessonDoc[], classId: string) {
  const list = lessons.filter((l) => l.classId === classId).sort((a, b) => b.lessonDate.localeCompare(a.lessonDate));
  const t = todayISO();
  const current = list.find((l) => l.lessonDate <= t) ?? list[list.length - 1];
  return { list, current, previous: list.filter((l) => l !== current && l.lessonDate <= (current?.lessonDate ?? t)) };
}

function stamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalUrl(e: EventDoc, location = "") {
  const start = eventStart(e);
  const end = e.endTime ? new Date(`${e.date}T${e.endTime}:00`) : new Date(+start + 2 * 3600_000);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: e.description,
    location: [e.location, location].filter(Boolean).join(", "),
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

export function icsFor(events: EventDoc[]) {
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const body = events.flatMap((e) => {
    const start = eventStart(e);
    const end = e.endTime ? new Date(`${e.date}T${e.endTime}:00`) : new Date(+start + 2 * 3600_000);
    return ["BEGIN:VEVENT", `UID:${e.id}@pcm-kids`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${esc(e.title)}`, `DESCRIPTION:${esc(e.description)}`, `LOCATION:${esc(e.location)}`, "END:VEVENT"];
  });
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Children's Ministry//EN", ...body, "END:VCALENDAR"].join("\r\n");
}

export function downloadIcs(events: EventDoc[], name: string) {
  const url = URL.createObjectURL(new Blob([icsFor(events)], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function localStamp(date: string, time?: string) {
  return `${date}T${time || "09:00"}:00`;
}

/** Outlook (web) "add event" link. */
export function outlookUrl(e: EventDoc, location = "", office = false) {
  const end = e.endTime || (() => {
    const [h, m] = (e.startTime || "09:00").split(":").map(Number);
    return `${String(Math.min(23, h + 2)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  })();
  const p = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: e.title,
    startdt: localStamp(e.date, e.startTime),
    enddt: localStamp(e.date, end),
    location: [e.location, location].filter(Boolean).join(", "),
    body: e.description,
  });
  return `https://${office ? "outlook.office.com" : "outlook.live.com"}/calendar/0/deeplink/compose?${p}`;
}

/** Links that subscribe a calendar app to the live feed (it refreshes by itself). */
export function subscribeLinks(feedUrl: string, name = "Children's Ministry") {
  const webcal = feedUrl.replace(/^https?:/, "webcal:");
  return {
    google: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`,
    apple: webcal,
    outlook: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(feedUrl)}&name=${encodeURIComponent(name)}`,
    office: `https://outlook.office.com/calendar/0/addfromweb?url=${encodeURIComponent(feedUrl)}&name=${encodeURIComponent(name)}`,
    https: feedUrl,
    webcal,
  };
}
