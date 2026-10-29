"use client";
import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { NAV, activeKey, type NavItem } from "@/lib/nav";
import { useSettings, parts } from "@/lib/site";
import { useContent } from "@/lib/useContent";
import { cn } from "@/lib/cn";

function ClassesMega({ onClose }: { onClose: () => void }) {
  const s = useSettings();
  const classes = useContent("classes") ?? [];
  const groups = s.groups.map(parts);
  const [g, setG] = useState(groups[0]?.[0] ?? "beginners");
  const inGroup = classes.filter((c) => c.group === g);
  return (
    <div className="grid w-[640px] grid-cols-[1.15fr_1fr] gap-3 p-3">
      <div className="grid grid-cols-2 gap-2">
        {groups.map(([key, label, ages]) => (
          <Link
            key={key}
            href={`/classes/#${key}`}
            onClick={onClose}
            onMouseEnter={() => setG(key)}
            onFocus={() => setG(key)}
            className={cn("rounded-2xl p-3 transition", g === key ? "bg-sky-soft" : "hover:bg-paper")}
          >
            <span className="block text-[11px] font-bold uppercase tracking-wider text-blueBrand-600">{ages}</span>
            <span className="mt-1 block font-display text-lg font-bold">{label}</span>
            <span className="text-xs text-ink/55">{classes.filter((c) => c.group === key).length} classes</span>
          </Link>
        ))}
      </div>
      <div className="rounded-2xl bg-paper p-3">
        <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-ink/50">{groups.find((x) => x[0] === g)?.[1]}</div>
        <ul className="mt-1 grid gap-0.5">
          {inGroup.map((c) => (
            <li key={c.id}>
              <Link href={`/classes/view/?c=${c.id}`} onClick={onClose} className="flex items-center justify-between rounded-xl px-2 py-2 text-sm font-bold hover:bg-white">
                {c.name}
                <span className="text-xs font-semibold text-ink/50">{c.ageRange}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/classes/" onClick={onClose} className="mt-2 inline-flex items-center gap-1 px-2 text-sm font-bold text-blueBrand-700">
          All classes <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function DesktopItem({ item, active, open, setOpen }: { item: NavItem; active: boolean; open: boolean; setOpen: React.Dispatch<React.SetStateAction<string | null>> }) {
  const Icon = item.icon;
  const hasMenu = !!(item.children || item.mega);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverAt = useRef(0);
  const cls = cn(
    "relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-[13.5px] font-bold transition-colors",
    active ? "bg-ink text-white" : "text-ink/70 hover:bg-paper hover:text-ink",
  );
  if (!hasMenu) {
    return (
      <Link href={item.href} aria-current={active ? "page" : undefined} className={cls}>
        <Icon className="h-4 w-4" aria-hidden strokeWidth={2.3} />
        {item.label}
      </Link>
    );
  }
  return (
    <div
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        if (timer.current) clearTimeout(timer.current);
        if (!open) hoverAt.current = Date.now();
        setOpen(item.key);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        timer.current = setTimeout(() => setOpen((cur) => (cur === item.key ? null : cur)), 150);
      }}
    >
      <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => {
          // a mouse click right after hover-open should keep the menu open, not toggle it shut
          if (open && Date.now() - hoverAt.current < 600) return;
          setOpen(open ? null : item.key);
        }} className={cls}>
        <Icon className="h-4 w-4" aria-hidden strokeWidth={2.3} />
        {item.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 rounded-[1.75rem] bg-white shadow-card ring-1 ring-ink/5"
          >
            {item.mega === "classes" ? (
              <ClassesMega onClose={() => setOpen(null)} />
            ) : (
              <ul className="grid w-[320px] gap-1 p-2">
                {item.children!.map((c) => {
                  const CI = c.icon;
                  return (
                    <li key={c.href}>
                      <Link href={c.href} onClick={() => setOpen(null)} className="flex items-start gap-3 rounded-2xl p-3 hover:bg-paper">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blueBrand-600 text-white shadow-[0_3px_0_#173EA8]">
                          <CI className="h-5 w-5" aria-hidden />
                        </span>
                        <span>
                          <span className="block text-sm font-extrabold">{c.label}</span>
                          <span className="block text-xs leading-5 text-ink/55">{c.description}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function SiteHeader() {
  const s = useSettings();
  const pathname = usePathname();
  const [menu, setMenu] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [last, setLast] = useState(pathname);
  const navRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const current = activeKey(pathname);
  const isAdmin = pathname.startsWith("/admin");

  if (last !== pathname) {
    setLast(pathname);
    setMenu(null);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenu(null);
      if (open) {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const down = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenu(null);
    };
    window.addEventListener("keydown", key);
    window.addEventListener("pointerdown", down);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("pointerdown", down);
    };
  }, [open]);

  if (isAdmin) return null;
  const groups = s.groups.map(parts);

  return (
    <>
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
        <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between gap-3 rounded-full bg-white/90 pl-3 pr-2 shadow-[0_10px_30px_-10px_rgba(11,21,48,.18)] ring-1 ring-ink/5 backdrop-blur-xl sm:pl-4">
          <Logo name={s.siteName} sub={s.churchName} size={38} />
          <nav ref={navRef} aria-label="Main" className="hidden items-center gap-0.5 xl:flex">
            {NAV.map((n) => (
              <DesktopItem key={n.key} item={n} active={current === n.key} open={menu === n.key} setOpen={setMenu} />
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/contact/#visit" className="btn btn-primary hidden !px-4 !py-2.5 text-sm sm:inline-flex">
              {s.ctaLabel}
            </Link>
            <button
              ref={btnRef}
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full bg-ink text-white xl:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => {
                setExpanded(current === "classes" || current === "kids" ? current : null);
                setOpen((o) => !o);
              }}
            >
              {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 overflow-y-auto bg-cream px-3 pb-8 pt-[88px] xl:hidden"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <nav aria-label="Mobile" className="mx-auto grid max-w-lg gap-1.5">
              {NAV.map((n, i) => {
                const Icon = n.icon;
                const isOpen = expanded === n.key;
                const active = current === n.key;
                const row = cn("flex w-full items-center gap-3 rounded-2xl p-2.5 text-left text-lg font-extrabold", active ? "bg-ink text-white" : "bg-white text-ink shadow-soft");
                const iconBox = <span className={cn("grid h-10 w-10 place-items-center rounded-xl", active ? "bg-white/15" : "bg-sky-soft text-blueBrand-700")}><Icon className="h-5 w-5" aria-hidden /></span>;
                return (
                  <motion.div key={n.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}>
                    {n.children || n.mega ? (
                      <>
                        <button type="button" className={row} aria-expanded={isOpen} onClick={() => setExpanded(isOpen ? null : n.key)}>
                          {iconBox}
                          <span className="flex-1">{n.label}</span>
                          <ChevronDown className={cn("mr-1 h-5 w-5 transition-transform", isOpen && "rotate-180")} aria-hidden />
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen ? (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="grid grid-cols-2 gap-2 p-2">
                                {n.mega === "classes"
                                  ? [
                                      ...groups.map(([key, label, ages]) => (
                                        <Link key={key} href={`/classes/#${key}`} onClick={() => setOpen(false)} className="rounded-2xl bg-white p-3 shadow-soft">
                                          <span className="block font-display text-base font-bold">{label}</span>
                                          <span className="text-xs font-semibold text-ink/55">{ages}</span>
                                        </Link>
                                      )),
                                      <Link key="all" href="/classes/" onClick={() => setOpen(false)} className="col-span-2 rounded-2xl bg-sky-soft p-3 text-center text-sm font-extrabold text-blueBrand-700">
                                        All classes →
                                      </Link>,
                                    ]
                                  : n.children!.map((c) => {
                                      const CI = c.icon;
                                      return (
                                        <Link key={c.href} href={c.href} onClick={() => setOpen(false)} className="col-span-2 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft">
                                          <CI className="h-5 w-5 text-blueBrand-600" aria-hidden />
                                          <span>
                                            <span className="block font-extrabold">{c.label}</span>
                                            <span className="block text-xs text-ink/55">{c.description}</span>
                                          </span>
                                        </Link>
                                      );
                                    })}
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link href={n.href} aria-current={active ? "page" : undefined} className={row} onClick={() => setOpen(false)}>
                        {iconBox}
                        {n.label}
                      </Link>
                    )}
                  </motion.div>
                );
              })}
              <Link href="/contact/#visit" onClick={() => setOpen(false)} className="btn btn-primary mt-3 w-full">
                {s.ctaLabel}
              </Link>
              <p className="mt-2 text-center text-sm font-semibold text-ink/55">{parts(s.serviceTimes[0] ?? "").join(" · ")}</p>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
