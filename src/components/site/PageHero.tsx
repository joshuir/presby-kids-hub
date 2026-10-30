"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ChevronRight, Home } from "lucide-react";
import { Container } from "./Container";
import { Eyebrow } from "@/components/ui/Reveal";
import { SplitWords } from "@/components/motion/SplitWords";
import { fxOn, motionLevel } from "@/components/motion/MotionDirector";
import { useContent } from "@/lib/useContent";
import { seedHeroes } from "@/lib/cms/seed/content";
import { useSettings, waLink } from "@/lib/site";
import { sized } from "@/lib/img";
import { buildNav } from "@/lib/nav";
import { cn } from "@/lib/cn";
import type { HeroDoc } from "@/lib/cms/types";

/** Stagger index (and optional start tilt) for the CSS hero entrance. */
const ix = (i: number, r?: number) => ({ "--i": i, ...(r !== undefined ? { "--r": `${r}deg` } : {}) }) as React.CSSProperties;

/** Breadcrumb trail from the menu structure (Home › Section › Page). */
function useCrumbs(extra?: string) {
  const path = (usePathname() || "/").replace(/\/+$/, "/");
  const s = useSettings();
  const crumbs: Array<{ href: string; label: string }> = [];
  for (const n of buildNav(s.menu)) {
    if (n.href === "/") continue;
    const kids = n.children ?? [];
    const child = kids.find((c) => c.href === path);
    if (path.startsWith(n.href) || child) {
      crumbs.push({ href: n.href, label: n.label });
      if (child && child.href !== n.href) crumbs.push({ href: child.href, label: child.label });
      break;
    }
  }
  if (extra) crumbs.push({ href: "", label: extra });
  return crumbs;
}

const PAGE_LABEL: Record<string, string> = { safeguarding: "Safeguarding", accessibility: "Accessibility", privacy: "Privacy", terms: "Terms of use" };

function ctaHref(url: string, whatsapp: string) {
  if (url === "whatsapp") return waLink(whatsapp, "Hello! I have a question about the Children's Ministry.");
  return url;
}

function Cta({ href, label, primary }: { href: string; label: string; primary?: boolean }) {
  const cls = primary ? "btn btn-primary" : "btn btn-ghost";
  if (/^https?:/.test(href))
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls} data-magnetic>
        {label} <ArrowRight className="h-4 w-4" aria-hidden />
      </a>
    );
  if (href.startsWith("#"))
    return (
      <a href={href} className={cls} data-magnetic>
        {label} <ArrowRight className="h-4 w-4" aria-hidden />
      </a>
    );
  return (
    <Link href={href} className={cls} data-magnetic>
      {label} <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

/**
 * Professional page hero, editable per page in the CMS (Website → Page heroes).
 *  - collage: words left, layered photos right (mouse-parallax)
 *  - photo:   full-bleed photo with the words on top
 *  - plain:   words only on a soft dotted background
 * Props are the fallback when the CMS has no hero for the page.
 */
export function PageHero({
  page,
  eyebrow,
  title,
  intro,
  children,
  crumb,
  noCrumbs,
  className,
  image,
}: {
  page: string;
  /** fallback image when the page has no hero in the CMS (custom pages) */
  image?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  children?: React.ReactNode;
  /** extra breadcrumb (e.g. the class or album name) */
  crumb?: string;
  /** leave out the breadcrumb trail */
  noCrumbs?: boolean;
  className?: string;
  /** @deprecated kept for older callers */
  art?: React.ReactNode;
}) {
  const s = useSettings();
  const heroes = useContent("heroes");
  const seed = seedHeroes.find((h) => h.id === page);
  const h: Partial<HeroDoc> = heroes?.find((x) => x.id === page) ?? (heroes === null ? seed ?? {} : seed ?? {});
  const t = h.title || title || "";
  const eb = h.eyebrow || eyebrow;
  const intr = h.intro || intro;
  const style = (h.style as string) || (h.image || image ? (h.image ? "collage" : "photo") : "plain");
  const imgs = [h.image || image, ...(h.images ?? [])].filter(Boolean) as string[];
  const navCrumbs = useCrumbs(crumb);
  const crumbs = navCrumbs.length ? navCrumbs : PAGE_LABEL[page] ? [{ href: "", label: PAGE_LABEL[page] }] : navCrumbs;
  const ref = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const level = motionLevel(s.animationLevel);
    if (level === "off") return;
    // Entrance animations are pure CSS (globals.css, "Hero entrances") so they start with the first
    // paint; running them from JS after hydration hid an already-visible hero and caused a blink.
    // mouse parallax on the photo stack
    const art = artRef.current;
    let off = () => {};
    if (art && level === "full" && window.matchMedia("(pointer: fine)").matches) {
      const layers = Array.from(art.querySelectorAll<HTMLElement>("[data-depth]"));
      const tos = layers.map((l) => [gsap.quickTo(l, "x", { duration: 0.8, ease: "power3.out" }), gsap.quickTo(l, "y", { duration: 0.8, ease: "power3.out" })] as const);
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach((l, i) => {
          const d = parseFloat(l.dataset.depth || "10");
          tos[i][0](px * d);
          tos[i][1](py * d);
        });
      };
      el.addEventListener("pointermove", move);
      off = () => el.removeEventListener("pointermove", move);
    }
    // scrolling away: the collage drifts up slower than the page (starts at 0, so nothing jumps on load)
    let st: ScrollTrigger | undefined;
    const drift = art;
    if (drift && level === "full" && fxOn(s, "fxParallax")) {
      const tw = gsap.fromTo(drift, { yPercent: 0 }, {
        yPercent: 14, ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.5 },
      });
      st = tw.scrollTrigger;
    }
    return () => {
      off();
      st?.kill();
      if (drift) gsap.set(drift, { clearProps: "transform" });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, style, s.animationLevel, (s as unknown as Record<string, string>).fxParallax]);

  const Title = (
    <h1 className={cn("font-display font-extrabold leading-[0.98] tracking-tight", style === "photo" ? "text-white" : "text-ink", "text-[2.7rem] sm:text-6xl lg:text-[5.2rem]")}>
      <SplitWords hero text={t} mark={style === "photo" ? "sun" : "squiggle"} />
    </h1>
  );

  const Crumbs = crumbs.length && !noCrumbs ? (
    <nav aria-label="Breadcrumb" data-ph style={ix(0)} className={cn("mb-5 flex flex-wrap items-center gap-1 text-sm font-bold", style === "photo" ? "text-white/80" : "text-ink/50")}>
      <Link href="/" className="inline-flex items-center gap-1 rounded-full px-1 hover:text-blueBrand-600">
        <Home className="h-3.5 w-3.5" aria-hidden /> Home
      </Link>
      {crumbs.map((c, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden />
          {c.href && i < crumbs.length - 1 ? (
            <Link href={c.href} className="hover:text-blueBrand-600">{c.label}</Link>
          ) : (
            <span aria-current="page" className={style === "photo" ? "text-white" : "text-ink"}>{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  ) : null;

  const Ctas =
    h.ctaLabel || h.cta2Label ? (
      <div data-ph style={ix(3)} className="mt-7 flex flex-wrap gap-3">
        {h.ctaLabel && h.ctaUrl ? <Cta href={ctaHref(h.ctaUrl, s.whatsapp)} label={h.ctaLabel} primary /> : null}
        {h.cta2Label && h.cta2Url ? <Cta href={ctaHref(h.cta2Url, s.whatsapp)} label={h.cta2Label} /> : null}
      </div>
    ) : null;

  if (style === "photo" && imgs[0]) {
    return (
      <section ref={ref} className={cn("px-3 pt-3 sm:px-5", className)}>
        <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2.2rem] bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-hero-bg src={sized(imgs[0], 1800, 1000)} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/55 to-ink/10" />
          <div className="px-6 pb-12 pt-10 sm:px-12 sm:pb-20 sm:pt-16 lg:min-h-[480px] lg:px-16">
            {Crumbs}
            {eb ? <div data-ph style={ix(1)}><Eyebrow tone="white">{eb}</Eyebrow></div> : null}
            <div className="mt-4 max-w-3xl">{Title}</div>
            {intr ? <p data-ph style={ix(2)} className="mt-5 max-w-xl text-lg leading-8 text-white/80">{intr}</p> : null}
            {Ctas}
            {children ? <div data-ph style={ix(4)} className="mt-6">{children}</div> : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className={cn("relative overflow-hidden", className)}>
      <div aria-hidden className="dot-grid absolute inset-0 [mask-image:linear-gradient(180deg,#000_30%,transparent)]" />
      <div aria-hidden className="absolute -right-24 top-0 h-96 w-96 rounded-full bg-blueBrand-200/40 blur-3xl" />
      <div aria-hidden className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-sun/20 blur-3xl" />
      <Container className={cn("relative grid items-center gap-10 pb-12 pt-8 sm:pb-16 sm:pt-12", style === "collage" && imgs.length > 0 && "lg:grid-cols-[1.15fr_1fr]")}>
        <div>
          {Crumbs}
          {eb ? <div data-ph style={ix(1)}><Eyebrow>{eb}</Eyebrow></div> : null}
          <div className="mt-4">{Title}</div>
          {intr ? <p data-ph style={ix(2)} className="mt-5 max-w-xl text-lg leading-8 text-ink/65">{intr}</p> : null}
          {Ctas}
          {children ? <div data-ph style={ix(4)} className="mt-6">{children}</div> : null}
        </div>
        {style === "collage" && imgs.length ? (
          <div ref={artRef} className="relative mx-auto aspect-[5/4] w-full max-w-[560px]" aria-hidden>
            <div data-depth="14" className="absolute inset-y-[6%] left-[8%] right-[14%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img data-hero-img style={ix(0, 0)} src={sized(imgs[0], 1100, 900)} alt="" className="h-full w-full rounded-[2rem] object-cover shadow-[0_30px_60px_-25px_rgba(11,21,48,.45)]" />
            </div>
            {imgs[1] ? (
              <div data-depth="-22" className="absolute -left-1 bottom-0 w-[34%] sm:-left-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img data-hero-img style={ix(1, -6)} src={sized(imgs[1], 500, 600)} alt="" className="aspect-[5/6] w-full -rotate-6 rounded-[1.4rem] border-[5px] border-white object-cover shadow-xl" />
              </div>
            ) : null}
            {imgs[2] ? (
              <div data-depth="26" className="absolute -right-1 top-0 w-[30%] sm:-right-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img data-hero-img style={ix(2, 5)} src={sized(imgs[2], 500, 600)} alt="" className="aspect-[5/6] w-full rotate-6 rounded-[1.4rem] border-[5px] border-white object-cover shadow-xl" />
              </div>
            ) : null}
            <div data-depth="-12" className="absolute bottom-[8%] right-[6%] grid h-20 w-20 place-items-center rounded-full bg-white shadow-xl ring-4 ring-sun/60 sm:h-24 sm:w-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img data-hero-img style={ix(3, 0)} src="/brand/logo.png" alt="" className="h-[72%] w-auto" />
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
