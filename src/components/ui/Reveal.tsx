"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-triggered reveal. Children with [data-stagger] animate in sequence.
 * Respects reduced-motion preferences.
 */
export function Reveal({
  children,
  className,
  y = 28,
  stagger = 0.08,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  stagger?: number;
  as?: "div" | "section" | "ul";
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const items = el.querySelectorAll("[data-stagger]");
      const targets = items.length ? items : [el];
      gsap.from(targets, {
        y,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger,
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [y, stagger]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const T = Tag as any;
  return (
    <T ref={ref} className={className}>
      {children}
    </T>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  center,
  light,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow ? (
        <div className={`text-xs font-extrabold uppercase tracking-[0.2em] ${light ? "text-blueBrand-200" : "text-blueBrand-600"}`}>{eyebrow}</div>
      ) : null}
      <h2 className={`mt-2 font-[family-name:var(--font-heading)] text-3xl leading-tight sm:text-4xl text-balance ${light ? "text-white" : "text-navy-900"}`}>
        {title}
      </h2>
      {intro ? <p className={`mt-3 text-base leading-7 ${light ? "text-white/75" : "text-black/65"}`}>{intro}</p> : null}
    </div>
  );
}
