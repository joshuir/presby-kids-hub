"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Container } from "./Container";
import { SectionNav } from "./SectionNav";

/** Blue banner used at the top of inner pages, with a short GSAP entrance. */
export function PageHero({ eyebrow, title, intro, children, breadcrumb }: { eyebrow?: string; title: string; intro?: string; children?: React.ReactNode; breadcrumb?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-ph]", { y: 24, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 });
      gsap.to("[data-ph-orb]", { y: -18, x: 10, duration: 5, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: 1.2 });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ref} className="bg-hero-blue relative overflow-hidden text-white">
      <span data-ph-orb className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blueBrand-400/30 blur-2xl" />
      <span data-ph-orb className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-sun-400/20 blur-2xl" />
      <Container className="relative pb-14 pt-6 sm:pb-20 sm:pt-8">
        <div data-ph className="mb-8 sm:mb-10">
          <SectionNav tone="dark" current={breadcrumb} />
        </div>
        {eyebrow ? <div data-ph className="text-xs font-extrabold uppercase tracking-[0.2em] text-blueBrand-200">{eyebrow}</div> : null}
        <h1 data-ph className="mt-2 max-w-3xl font-[family-name:var(--font-heading)] text-4xl leading-tight sm:text-5xl text-balance">{title}</h1>
        {intro ? <p data-ph className="mt-4 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{intro}</p> : null}
        {children ? <div data-ph className="mt-6">{children}</div> : null}
      </Container>
      <svg className="relative block w-full text-white" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden>
        <path d="M0 40V20C360-6 1080-6 1440 20v20z" fill="currentColor" />
      </svg>
    </section>
  );
}
