import type { EventDoc } from "@/lib/cms/types";

export function fmtDate(d: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  if (!d) return "";
  const dt = new Date(d.length === 10 ? d + "T12:00:00" : d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-GB", opts);
}

export function eventStart(e: EventDoc) {
  return new Date(`${e.date}T${e.startTime || "09:00"}:00`);
}

export function upcoming(events: EventDoc[], now = new Date()) {
  const today = new Date(now.toDateString());
  return events.filter((e) => new Date(e.date + "T23:59:59") >= today).sort((a, b) => +eventStart(a) - +eventStart(b));
}

function stamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalUrl(e: EventDoc) {
  const start = eventStart(e);
  const end = e.endTime ? new Date(`${e.date}T${e.endTime}:00`) : new Date(+start + 3600_000);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: e.description,
    location: e.location,
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

export function downloadIcs(e: EventDoc) {
  const start = eventStart(e);
  const end = e.endTime ? new Date(`${e.date}T${e.endTime}:00`) : new Date(+start + 3600_000);
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Presby Kids Hub//EN",
    "BEGIN:VEVENT",
    `UID:${e.id}@presby-kids-hub`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(e.description)}`,
    `LOCATION:${esc(e.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.id}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
