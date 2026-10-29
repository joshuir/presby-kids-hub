"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Container } from "./Container";
import { Eyebrow } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

/**
 * Inner-page hero in the reference style: eyebrow chip, big display title with a
 * word-by-word GSAP entrance, short intro, optional chips/children, dotted background.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  art,
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
  art?: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-w]", { yPercent: 110, opacity: 0, duration: 0.7, ease: "power4.out", stagger: 0.06 });
      gsap.from("[data-ph]", { y: 18, opacity: 0, duration: 0.6, ease: "power3.out", delay: 0.25, stagger: 0.08 });
    }, el);
    return () => ctx.revert();
  }, [title]);
  return (
    <section ref={ref} className={cn("relative overflow-hidden", className)}>
      <div aria-hidden className="dot-grid absolute inset-0 [mask-image:linear-gradient(180deg,#000_30%,transparent)]" />
      <div aria-hidden className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-blueBrand-200/40 blur-3xl" />
      <Container className="relative grid items-center gap-10 pb-12 pt-12 sm:pb-16 sm:pt-16 lg:grid-cols-[1.3fr_1fr]">
        <div>
          {eyebrow ? (
            <div data-ph>
              <Eyebrow>{eyebrow}</Eyebrow>
            </div>
          ) : null}
          <h1 className="mt-4 font-display text-[2.6rem] font-extrabold leading-[1] sm:text-6xl lg:text-7xl" aria-label={title}>
            {title.split(" ").map((w, i) => (
              <span key={i} aria-hidden className="inline-block overflow-hidden pb-1 align-bottom">
                <span data-w className="inline-block pr-[0.22em]">{w}</span>
              </span>
            ))}
          </h1>
          {intro ? <p data-ph className="mt-5 max-w-xl text-lg leading-8 text-ink/65">{intro}</p> : null}
          {children ? <div data-ph className="mt-6">{children}</div> : null}
        </div>
        {art ? <div data-ph className="hidden lg:block">{art}</div> : null}
      </Container>
    </section>
  );
}
