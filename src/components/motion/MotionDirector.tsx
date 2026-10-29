"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSettings } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);
// Phones resize the viewport whenever the address bar slides in/out; re-measuring then makes content jump.
ScrollTrigger.config({ ignoreMobileResize: true });
// test builds only: lets the browser tests count ScrollTrigger refreshes
if (process.env.NEXT_PUBLIC_MOTION_PROBE && typeof window !== "undefined") (window as unknown as { __ST: typeof ScrollTrigger }).__ST = ScrollTrigger;

export type MotionLevel = "full" | "reduced" | "off";

export function motionLevel(setting?: string): MotionLevel {
  if (typeof window === "undefined") return "full";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "off";
  return setting === "off" ? "off" : setting === "reduced" ? "reduced" : "full";
}

/** Use inside components to respect the visitor's and the CMS's motion setting. */
export function useMotionLevel(): MotionLevel {
  const s = useSettings();
  // start as "full" on both server and first client render (no hydration mismatch), then settle
  const [lvl, setLvl] = useState<MotionLevel>("full");
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setLvl(motionLevel(s.animationLevel));
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, [s.animationLevel]);
  return lvl;
}

const fine = () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

/**
 * One place that wires declarative animation attributes on every page:
 *  data-reveal="up|left|right|scale|clip"  – fade/slide in on scroll (children with data-stagger animate in turn)
 *  data-parallax="0.2"                     – scroll parallax (positive = slower than the page)
 *  data-magnetic                            – element leans toward the pointer
 *  data-tilt                                – 3D tilt + soft glare on hover
 *  data-count="180+"                        – counts up when it scrolls into view
 *  data-split                               – words (rendered by <SplitWords>) rise in on scroll
 *  data-scrub-words                         – words light up one by one as you scroll past
 * New content (CMS data arriving later) is picked up automatically.
 */
export function MotionDirector() {
  const pathname = usePathname();
  const s = useSettings();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const level = motionLevel(s.animationLevel);
    document.documentElement.dataset.motion = level;
    if (level === "off") return;
    const full = level === "full";
    const seen = new WeakSet<Element>();
    const triggers: ScrollTrigger[] = [];
    const cleanups: Array<() => void> = [];

    // Anything the visitor can already see is left alone: hiding it so it can fade back in is the
    // "blink" people notice on phones while a page (or late-loading CMS content) appears.
    const onScreen = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight && r.height > 0;
    };

    const reveal = (el: HTMLElement) => {
      if (onScreen(el)) return;
      const kind = el.dataset.reveal || "up";
      const items = el.querySelectorAll<HTMLElement>(":scope [data-stagger]");
      const targets: Element[] = items.length ? Array.from(items) : [el];
      const d = full ? 40 : 14;
      const from: gsap.TweenVars =
        kind === "left" ? { x: -d * 1.5, opacity: 0 } :
        kind === "right" ? { x: d * 1.5, opacity: 0 } :
        kind === "scale" ? { scale: 0.92, opacity: 0 } :
        kind === "clip" ? { clipPath: "inset(12% 12% 12% 12% round 2rem)", opacity: 0.2 } :
        { y: d, opacity: 0 };
      const tw = gsap.from(targets, {
        ...from,
        duration: full ? 0.9 : 0.5,
        ease: "power3.out",
        stagger: items.length ? 0.08 : 0,
        clearProps: "transform,opacity,clipPath",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
      if (tw.scrollTrigger) triggers.push(tw.scrollTrigger);
    };

    const parallax = (el: HTMLElement) => {
      const amt = parseFloat(el.dataset.parallax || "0.15");
      const tw = gsap.fromTo(el, { yPercent: -amt * 50 }, {
        yPercent: amt * 50, ease: "none",
        scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
      if (tw.scrollTrigger) triggers.push(tw.scrollTrigger);
    };

    const magnetic = (el: HTMLElement) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      };
      const leave = () => { xTo(0); yTo(0); };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      cleanups.push(() => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); gsap.set(el, { x: 0, y: 0 }); });
    };

    const tilt = (el: HTMLElement) => {
      const max = parseFloat(el.dataset.tilt || "") || 7;
      el.style.transformStyle = "preserve-3d";
      const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
      const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });
      gsap.set(el, { transformPerspective: 900 });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * max * 2);
        rx(-(py - 0.5) * max * 2);
        el.style.setProperty("--gx", `${px * 100}%`);
        el.style.setProperty("--gy", `${py * 100}%`);
      };
      const leave = () => { rx(0); ry(0); };
      el.classList.add("tilt-glare");
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      cleanups.push(() => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); });
    };

    const count = (el: HTMLElement) => {
      const raw = el.dataset.count ?? el.textContent ?? "";
      const m = raw.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
      if (!m) return;
      const num = parseFloat(m[2].replace(/,/g, ""));
      if (isNaN(num) || (num >= 1900 && num <= 2100 && !m[2].includes(","))) return; // leave years alone
      const fmt = (v: number) => m[1] + (m[2].includes(",") ? Math.round(v).toLocaleString("en-GB") : String(Math.round(v))) + m[3];
      el.textContent = fmt(0);
      const st = ScrollTrigger.create({
        trigger: el, start: "top 92%", once: true,
        onEnter: () => {
          const o = { v: 0 };
          gsap.to(o, { v: num, duration: 1.6, ease: "power2.out", onUpdate: () => { el.textContent = fmt(o.v); } });
        },
      });
      triggers.push(st);
      cleanups.push(() => { el.textContent = raw; });
    };

    const split = (el: HTMLElement) => {
      const words = el.querySelectorAll("[data-w]");
      if (!words.length || onScreen(el)) return;
      const tw = gsap.from(words, {
        yPercent: 110, opacity: 0, duration: 0.8, ease: "power4.out", stagger: 0.05,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
      if (tw.scrollTrigger) triggers.push(tw.scrollTrigger);
    };

    const scrubWords = (el: HTMLElement) => {
      const words = el.querySelectorAll("[data-w]");
      if (!words.length) return;
      const tw = gsap.fromTo(words, { opacity: 0.18 }, {
        opacity: 1, stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
      });
      if (tw.scrollTrigger) triggers.push(tw.scrollTrigger);
    };

    const SELECTOR = "[data-reveal],[data-count],[data-split],[data-parallax],[data-scrub-words],[data-magnetic],[data-tilt]";
    /** Wires any animation attributes not yet wired; returns how many new elements were set up. */
    const setup = () => {
      let added = 0;
      const each = (sel: string, fn: (el: HTMLElement) => void) =>
        document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
          const marks = (el as unknown as { __m?: Set<string> }).__m ?? new Set<string>();
          if (seen.has(el) && marks.has(sel)) return;
          seen.add(el);
          marks.add(sel);
          (el as unknown as { __m?: Set<string> }).__m = marks;
          added++;
          fn(el);
        });
      each("[data-reveal]", reveal);
      each("[data-count]", count);
      each("[data-split]", split);
      if (full) {
        each("[data-parallax]", parallax);
        each("[data-scrub-words]", scrubWords);
        if (fine()) {
          each("[data-magnetic]", magnetic);
          each("[data-tilt]", tilt);
        }
      }
      return added;
    };

    // Only react when content that carries animation attributes arrives (e.g. CMS data loading in).
    // ScrollTrigger itself, count-ups, rotating photos and marquees also change the DOM; reacting to
    // those caused a refresh → mutation → refresh loop that made the page flicker on phones.
    const relevant = (muts: MutationRecord[]) =>
      muts.some((m) =>
        Array.from(m.addedNodes).some(
          (n) => n instanceof HTMLElement && (n.matches(SELECTOR) || !!n.querySelector(SELECTOR)),
        ),
      );
    let timer = 0;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (setup() > 0) ScrollTrigger.refresh();
      }, 120);
    };
    setup();
    const mo = new MutationObserver((muts) => {
      if (relevant(muts)) schedule();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    // late-loading images change heights; one refresh once the page has settled
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 900);

    // reading-progress bar
    const bar = barRef.current;
    const prog = bar
      ? ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }) })
      : null;

    return () => {
      mo.disconnect();
      window.clearTimeout(timer);
      window.clearTimeout(t);
      prog?.kill();
      triggers.forEach((tr) => tr.kill());
      cleanups.forEach((f) => f());
      document.querySelectorAll<HTMLElement>("[data-reveal],[data-reveal] [data-stagger],[data-split] [data-w]").forEach((el) => gsap.set(el, { clearProps: "all" }));
      document.querySelectorAll<HTMLElement>("[data-parallax],[data-tilt]").forEach((el) => gsap.set(el, { clearProps: "transform" }));
    };
  }, [pathname, s.animationLevel]);

  return (
    <>
      <div ref={barRef} aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] origin-left scale-x-0 bg-gradient-to-r from-blueBrand-500 via-sun to-coral" />
      <CursorBuddy level={s.animationLevel} />
    </>
  );
}

/** A soft ring that follows the pointer and grows over anything clickable (mouse users only). */
function CursorBuddy({ level }: { level?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || motionLevel(level) !== "full" || !fine()) return;
    el.style.display = "block";
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
    let over = false;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      xTo(e.clientX);
      yTo(e.clientY);
      const t = e.target as Element | null;
      const hit = !!t?.closest?.("a,button,[role=button],input,select,textarea,label,[data-tilt]");
      if (hit !== over) {
        over = hit;
        gsap.to(el, { scale: hit ? 1.9 : 1, opacity: hit ? 0.35 : 0.55, duration: 0.25 });
      }
    };
    const leave = () => gsap.to(el, { opacity: 0, duration: 0.2 });
    const enter = () => gsap.to(el, { opacity: 0.55, duration: 0.2 });
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
      el.style.display = "none";
    };
  }, [level]);
  return (
    <div
      ref={ref}
      aria-hidden
      style={{ display: "none" }}
      className="pointer-events-none fixed left-0 top-0 z-[80] -ml-4 -mt-4 h-8 w-8 rounded-full border-2 border-blueBrand-500 opacity-0 mix-blend-multiply"
    />
  );
}
