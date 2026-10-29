"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Copy, Download, RefreshCw } from "lucide-react";
import { CALENDAR_FEED } from "@/lib/cms/client";
import { downloadIcs, subscribeLinks } from "@/lib/format";
import { BrandGlyph } from "@/components/site/Social";
import type { EventDoc } from "@/lib/cms/types";
import { cn } from "@/lib/cn";

function OutlookGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="2" y="4" width="13" height="16" rx="2.5" fill="currentColor" />
      <circle cx="8.5" cy="12" r="3.4" fill="none" stroke="#fff" strokeWidth="1.8" />
      <path d="M15 8h6.2c.4 0 .8.4.8.8v6.4c0 .4-.4.8-.8.8H15" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

/**
 * Small "Sync calendar" button with a dropdown. Subscribing (Google, Apple, Outlook or any iCal app)
 * keeps the family calendar in step with the CMS automatically.
 */
export function CalendarSync({ events, className, align = "right" }: { events: EventDoc[]; className?: string; align?: "left" | "right" }) {
  const l = subscribeLinks(CALENDAR_FEED);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fromHash = () => {
      if (location.hash === "#sync") {
        setOpen(true);
        ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", off);
    document.addEventListener("keydown", off);
    return () => {
      document.removeEventListener("mousedown", off);
      document.removeEventListener("keydown", off);
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(l.https);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this calendar link:", l.https);
    }
  };
  const item = "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-paper";
  const icon = "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white";

  return (
    <div ref={ref} id="sync" className={cn("relative scroll-mt-32", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-ink ring-1 ring-ink/15 transition hover:ring-ink/30"
      >
        <RefreshCw className="h-4 w-4 text-blueBrand-600" aria-hidden /> Sync calendar <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} aria-hidden />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            aria-label="Sync with your calendar"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className={cn("absolute z-40 mt-2 w-72 rounded-2xl bg-white p-1.5 text-ink shadow-card ring-1 ring-ink/10", align === "right" ? "right-0" : "left-0")}
          >
            <p className="px-3 pb-1.5 pt-2 text-xs leading-5 text-ink/55">Subscribe once — new events appear in your calendar automatically.</p>
            <a role="menuitem" href={l.google} target="_blank" rel="noreferrer" className={item} onClick={() => setOpen(false)}>
              <span className={cn(icon, "bg-[#4285F4]")}><BrandGlyph name="google" className="h-4 w-4" /></span>
              <span className="text-sm font-bold">Google Calendar</span>
            </a>
            <a role="menuitem" href={l.apple} className={item} onClick={() => setOpen(false)}>
              <span className={cn(icon, "bg-black")}><BrandGlyph name="apple" className="h-4 w-4" /></span>
              <span className="text-sm font-bold">Apple Calendar</span>
            </a>
            <a role="menuitem" href={l.outlook} target="_blank" rel="noreferrer" className={item} onClick={() => setOpen(false)}>
              <span className={cn(icon, "bg-[#0078D4]")}><OutlookGlyph className="h-4 w-4" /></span>
              <span className="text-sm font-bold">Outlook.com</span>
            </a>
            <a role="menuitem" href={l.office} target="_blank" rel="noreferrer" className={item} onClick={() => setOpen(false)}>
              <span className={cn(icon, "bg-[#0F6CBD]")}><OutlookGlyph className="h-4 w-4" /></span>
              <span className="text-sm font-bold">Outlook 365 <span className="font-normal text-ink/50">· work/school</span></span>
            </a>
            <div className="my-1 border-t border-ink/10" />
            <button role="menuitem" type="button" onClick={copy} className={item}>
              <span className={cn(icon, "bg-paper text-ink")}>{copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}</span>
              <span className="text-sm font-bold">{copied ? "Link copied" : "Copy link (other apps)"}</span>
            </button>
            <button role="menuitem" type="button" disabled={!events.length} onClick={() => { downloadIcs(events, "childrens-ministry-events"); setOpen(false); }} className={cn(item, "disabled:opacity-40")}>
              <span className={cn(icon, "bg-paper text-ink")}><Download className="h-4 w-4" aria-hidden /></span>
              <span className="text-sm font-bold">Download .ics (one-off)</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
