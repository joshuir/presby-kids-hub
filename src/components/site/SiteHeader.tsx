"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogIn, Menu, UserPlus, X } from "lucide-react";
import { Container } from "@/components/site/Container";
import { LogoMark } from "@/components/site/Logo";
import { useSettings } from "@/lib/site";
import { SITE_NAV, isCurrent, sectionFor, type NavSection } from "@/lib/nav";
import { cn } from "@/lib/cn";

/** Flat list kept for older imports (footer etc.). */
export const NAV = SITE_NAV.filter((s) => s.key !== "home").map((s) => ({ href: s.href, label: s.label }));

function Dropdown({ section, open, onOpen, onClose, current }: { section: NavSection; open: boolean; onOpen: () => void; onClose: () => void; current: boolean }) {
  const id = useId();
  const pathname = usePathname();
  const Icon = section.icon;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverOpen = () => {
    if (timer.current) clearTimeout(timer.current);
    onOpen();
  };
  const hoverClose = () => {
    timer.current = setTimeout(onClose, 160);
  };

  return (
    <div className="relative" onPointerEnter={(e) => e.pointerType === "mouse" && hoverOpen()} onPointerLeave={(e) => e.pointerType === "mouse" && hoverClose()}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => (open ? onClose() : onOpen())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            onOpen();
            requestAnimationFrame(() => document.getElementById(id)?.querySelector<HTMLElement>("a")?.focus());
          }
        }}
        className={cn(
          "group relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors focus-ring",
          current || open ? "text-blueBrand-700" : "text-black/70 hover:text-navy-900",
          open && "bg-sky-soft",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden strokeWidth={2.2} />
        {section.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden />
        {current ? <motion.span layoutId="nav-dot" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-blueBrand-600" /> : null}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            id={id}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute left-1/2 top-full z-50 mt-2 w-[340px] -translate-x-1/2 rounded-3xl bg-white p-2 shadow-card ring-1 ring-black/5"
            onKeyDown={(e) => {
              const links = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("a"));
              const i = links.indexOf(document.activeElement as HTMLElement);
              if (e.key === "ArrowDown") {
                e.preventDefault();
                links[(i + 1) % links.length]?.focus();
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                links[(i - 1 + links.length) % links.length]?.focus();
              }
            }}
          >
            <ul className="grid gap-0.5">
              {section.children!.map((c) => {
                const CI = c.icon;
                const here = isCurrent(pathname, c.href) && !c.href.includes("#");
                return (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      onClick={onClose}
                      aria-current={here ? "page" : undefined}
                      className={cn("flex items-start gap-3 rounded-2xl p-3 transition focus-ring", here ? "bg-sky-soft" : "hover:bg-sky-soft/70")}
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blueBrand-500 to-navy-800 text-white shadow-soft">
                        <CI className="h-5 w-5" aria-hidden strokeWidth={2} />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-navy-900">{c.label}</span>
                        <span className="block text-xs leading-5 text-black/55">{c.description}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function SiteHeader() {
  const s = useSettings();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const navRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const currentSection = sectionFor(pathname);

  // close menus when the page changes
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setMenu(null);
  }

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // lock scroll, Escape to close, focus management for the drawer
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) requestAnimationFrame(() => drawerRef.current?.querySelector<HTMLElement>("a,button")?.focus());
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (open) {
        setOpen(false);
        toggleRef.current?.focus();
      }
      setMenu(null);
    };
    const onDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenu(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <>
      {s.announcement ? (
        <div className="bg-navy-900 px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">{s.announcement}</div>
      ) : null}
      <header className={cn("sticky top-0 z-50 transition-all duration-300", scrolled ? "bg-white/90 shadow-[0_8px_30px_rgba(10,31,68,0.08)] backdrop-blur-xl" : "bg-white/70 backdrop-blur")}>
        <Container className="flex h-16 items-center justify-between gap-3 lg:h-[72px]">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-2xl focus-ring" aria-label={`${s.siteName} — home`}>
            <LogoMark />
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-[family-name:var(--font-heading)] text-base text-navy-900 sm:text-lg">{s.siteName}</span>
              <span className="hidden truncate text-[11px] font-semibold text-black/45 sm:block">{s.churchName}</span>
            </span>
          </Link>

          <nav ref={navRef} className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {SITE_NAV.filter((x) => x.key !== "home").map((sec) => {
              const current = currentSection?.key === sec.key;
              if (sec.children) {
                return (
                  <Dropdown
                    key={sec.key}
                    section={sec}
                    current={current}
                    open={menu === sec.key}
                    onOpen={() => setMenu(sec.key)}
                    onClose={() => setMenu((m) => (m === sec.key ? null : m))}
                  />
                );
              }
              const Icon = sec.icon;
              return (
                <Link
                  key={sec.key}
                  href={sec.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors focus-ring",
                    current ? "text-blueBrand-700" : "text-black/70 hover:text-navy-900",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden strokeWidth={2.2} />
                  {sec.label}
                  {current ? <motion.span layoutId="nav-dot" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-blueBrand-600" /> : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/account/"
              className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-navy-900 ring-1 ring-black/10 transition hover:bg-sky-soft focus-ring sm:inline-flex"
            >
              <LogIn className="h-4 w-4" aria-hidden />
              Parent login
            </Link>
            <Link
              href="/register/"
              className="inline-flex items-center gap-1.5 rounded-full bg-blueBrand-600 px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-blueBrand-700 focus-ring sm:px-5"
            >
              <UserPlus className="hidden h-4 w-4 sm:block" aria-hidden />
              Register
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-black/10 transition hover:bg-sky-soft focus-ring lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => {
                setExpanded(currentSection?.children ? currentSection.key : null);
                setOpen((o) => !o);
              }}
            >
              {open ? <X className="h-5 w-5 text-navy-900" aria-hidden /> : <Menu className="h-5 w-5 text-navy-900" aria-hidden />}
            </button>
          </div>
        </Container>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[60] bg-navy-900/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              ref={drawerRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              onClick={(e) => e.stopPropagation()}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="ml-auto flex h-full w-[min(88vw,380px)] flex-col overflow-y-auto bg-white shadow-card"
            >
              <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
                <span className="font-[family-name:var(--font-heading)] text-lg text-navy-900">Menu</span>
                <button type="button" onClick={() => { setOpen(false); toggleRef.current?.focus(); }} aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-black/10 focus-ring">
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <nav aria-label="Mobile" className="grid gap-1 p-3">
                {SITE_NAV.map((sec) => {
                  const Icon = sec.icon;
                  const current = currentSection?.key === sec.key;
                  const iconBox = (
                    <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", current ? "bg-blueBrand-600 text-white" : "bg-sky-soft text-blueBrand-700")}>
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                  );
                  if (!sec.children) {
                    return (
                      <Link key={sec.key} href={sec.href} aria-current={current ? "page" : undefined} className={cn("flex items-center gap-3 rounded-2xl p-2 text-base font-bold text-navy-900 focus-ring", current ? "bg-sky-soft" : "hover:bg-sky-soft/60")}>
                        {iconBox}
                        {sec.label}
                      </Link>
                    );
                  }
                  const isOpen = expanded === sec.key;
                  return (
                    <div key={sec.key}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setExpanded(isOpen ? null : sec.key)}
                        className={cn("flex w-full items-center gap-3 rounded-2xl p-2 text-left text-base font-bold text-navy-900 focus-ring", current ? "bg-sky-soft" : "hover:bg-sky-soft/60")}
                      >
                        {iconBox}
                        <span className="flex-1">{sec.label}</span>
                        <ChevronDown className={cn("mr-2 h-5 w-5 text-black/40 transition-transform", isOpen && "rotate-180")} aria-hidden />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen ? (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="ml-7 overflow-hidden border-l-2 border-blueBrand-100 pl-3"
                          >
                            {sec.children.map((c) => {
                              const CI = c.icon;
                              const here = isCurrent(pathname, c.href) && !c.href.includes("#");
                              return (
                                <li key={c.href}>
                                  <Link
                                    href={c.href}
                                    onClick={() => setOpen(false)}
                                    aria-current={here ? "page" : undefined}
                                    className={cn("my-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold focus-ring", here ? "bg-sky-soft text-blueBrand-700" : "text-black/75 hover:bg-sky-soft/60")}
                                  >
                                    <CI className="h-4 w-4 shrink-0 text-blueBrand-600" aria-hidden />
                                    {c.label}
                                  </Link>
                                </li>
                              );
                            })}
                          </motion.ul>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>
              <div className="mt-auto grid gap-2 border-t border-black/5 p-4">
                <Link href="/account/" className="flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-navy-900 ring-1 ring-black/10 focus-ring">
                  <LogIn className="h-4 w-4" aria-hidden /> Parent login
                </Link>
                <Link href="/register/" className="flex items-center justify-center gap-2 rounded-full bg-blueBrand-600 py-3 text-sm font-bold text-white focus-ring">
                  <UserPlus className="h-4 w-4" aria-hidden /> Register a child
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
