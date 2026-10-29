"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll-triggered reveal. Children marked [data-stagger] animate in sequence.
 * Pass `watch` (e.g. the loaded list length) so items that arrive later also animate.
 * Respects reduced-motion preferences.
 */
export function Reveal({
  children,
  className,
  y = 26,
  stagger = 0.07,
  watch,
  as: Tag = "div",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  stagger?: number;
  watch?: unknown;
  as?: "div" | "section" | "ul" | "ol";
  id?: string;
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
        duration: 0.75,
        ease: "power3.out",
        stagger,
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [y, stagger, watch]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const T = Tag as any;
  return (
    <T ref={ref} id={id} className={className}>
      {children}
    </T>
  );
}

const TONES = {
  blue: "bg-sky-soft text-blueBrand-700",
  sun: "bg-sun-soft text-[#9A6400]",
  coral: "bg-[#FFE8E1] text-[#C2410C]",
  mint: "bg-[#DCFCE7] text-[#15803D]",
  white: "bg-white/15 text-white",
};

export function Eyebrow({ children, tone = "blue", className }: { children: React.ReactNode; tone?: keyof typeof TONES; className?: string }) {
  return <span className={cn("eyebrow", TONES[tone], className)}>{children}</span>;
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  center,
  light,
  tone = "blue",
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  center?: boolean;
  light?: boolean;
  tone?: keyof typeof TONES;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", center && "justify-center text-center", className)}>
      <div className={cn("max-w-2xl", center && "mx-auto")}>
        {eyebrow ? <Eyebrow tone={light ? "white" : tone}>{eyebrow}</Eyebrow> : null}
        <h2 className={cn("mt-3 font-display text-[2.1rem] font-extrabold leading-[1.05] sm:text-5xl text-balance", light ? "text-white" : "text-ink")}>{title}</h2>
        {intro ? <p className={cn("mt-3 text-base leading-7 sm:text-lg", light ? "text-white/75" : "text-ink/65")}>{intro}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className="btn btn-ghost !py-2.5 text-sm">
          {action.label} <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
