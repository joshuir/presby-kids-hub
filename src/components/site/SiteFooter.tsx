"use client";

import "@fontsource/poppins/800.css";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUp, ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { SocialBadge } from "./Social";
import { cleanSocials } from "@/lib/socials";
import { parts, telLink, useCopy, useSettings, waLink } from "@/lib/site";
import { cn } from "@/lib/cn";
import { FONTS } from "@/lib/theme";

const HEX = /^#[0-9a-f]{6}$/i;
const col = (v: unknown, d: string) => (typeof v === "string" && HEX.test(v.trim()) ? v.trim() : d);

/**
 * The giant edge-to-edge wordmark at the very bottom (as in the original design): heavy Poppins,
 * a shade lighter than the footer, sized to fill the full width. Each letter lights up in a brand
 * colour as the pointer (or a finger) passes over it, then fades slowly back.
 */
function Wordmark({ text, palette, effect, font, color }: { text: string; palette: string[]; effect: string; font: string; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<number | null>(null);

  // fit the text to the container width (re-measured on resize and once the font loads)
  useLayoutEffect(() => {
    const box = ref.current;
    const el = inner.current;
    if (!box || !el) return;
    const fit = () => {
      const prev = el.style.fontSize;
      el.style.fontSize = "100px";
      const w = el.scrollWidth;
      if (!w) return void (el.style.fontSize = prev);
      const n = Math.max(28, Math.floor((box.clientWidth / w) * 100 * 0.995));
      el.style.fontSize = `${n}px`; // React won't re-apply an unchanged size, so set it directly too
      setSize(n);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    document.fonts?.load(`800 100px "${font}"`).then(fit).catch(() => {});
    document.fonts?.ready.then(fit).catch(() => {});
    return () => ro.disconnect();
  }, [text, font]);

  const light = (el: HTMLElement | null, i: number) => {
    if (!el || effect === "none") return;
    el.style.setProperty("--wm-c", palette[i % palette.length]);
    el.dataset.on = "1";
    window.clearTimeout(Number(el.dataset.t || 0));
    el.dataset.t = String(window.setTimeout(() => (el.dataset.on = ""), effect === "wave" ? 900 : 650));
  };
  const hit = (x: number, y: number) => {
    // elementFromPoint (not e.target) so a finger dragging across lights every letter it passes
    const t = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!t?.dataset.i || !ref.current?.contains(t)) return;
    const i = Number(t.dataset.i);
    light(t, i);
    if (effect === "wave") {
      const sib = ref.current.querySelectorAll<HTMLElement>("[data-i]");
      light(sib[i - 1] ?? null, i + 1);
      light(sib[i + 1] ?? null, i + 2);
    }
  };
  const fam = FONTS.find((f) => f.name === font);
  // Poppins is bundled; any other font comes from Google Fonts
  const href = fam && !fam.local && fam.name !== "Poppins" ? `https://fonts.googleapis.com/css2?family=${fam.name.replace(/ /g, "+")}:wght@800&display=swap` : null;
  return (
    <div
      ref={ref}
      aria-hidden
      data-wm-effect={effect}
      style={{ touchAction: "pan-y", ...(color ? { color } : {}) }}
      className="cm-wordmark relative mt-10 select-none overflow-hidden whitespace-nowrap"
      onPointerDown={(e) => hit(e.clientX, e.clientY)}
      onPointerMove={(e) => hit(e.clientX, e.clientY)}
    >
      {href ? <link rel="stylesheet" href={href} /> : null}
      <span
        ref={inner}
        className="inline-block pb-[0.06em] font-extrabold leading-[1.1] tracking-[-0.045em]"
        style={{ fontFamily: `"${font}", var(--font-heading), sans-serif`, fontWeight: 800, fontSize: size ? `${size}px` : "15vw", visibility: size ? "visible" : "hidden" }}
      >
        {[...text].map((ch, i) => (
          <span key={i} data-i={i} className="cm-wm-letter inline-block">{ch === " " ? "\u00A0" : ch}</span>
        ))}
      </span>
    </div>
  );
}

/** Footer: visit banner, logo + socials, link columns, contact, legal line and a playful wordmark. Everything is editable in the CMS. */
export function SiteFooter() {
  const s = useSettings();
  const t = useCopy();
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const onContact = pathname.startsWith("/contact");
  const times = s.serviceTimes.map(parts);
  const socials = cleanSocials(s.socials);
  const links = (s.footerLinks?.length ? s.footerLinks : ["Classes|/classes/", "Events|/events/", "Gallery|/gallery/", "Contact|/contact/"]).map(parts).filter(([l]) => l);
  const legal = (s.legalLinks?.length ? s.legalLinks : ["Safeguarding|/safeguarding/", "Privacy|/privacy/", "Terms|/terms/", "Accessibility|/accessibility/"]).map(parts).filter(([l]) => l);
  const bg = col(s.footerBg, "var(--color-ink)");
  const fg = col(s.footerText, "#FFFFFF");
  const accent = col(s.footerAccent, "var(--color-sun)");
  const palette = (s.footerWordmarkColors?.length ? s.footerWordmarkColors : []).map((c) => c.trim()).filter((c) => HEX.test(c));
  const wmPalette = palette.length ? palette : ["var(--color-blueBrand-500)", "var(--color-sun)", "var(--color-coral)", "var(--color-mint)", "#A78BFA"];
  const effect = s.footerHoverEffect || "slide";
  const showVisit = s.showVisitCard !== "no" && !onContact;
  const showWord = s.showFooterWordmark !== "no";

  const style = { "--ft-bg": bg, "--ft-fg": fg, "--ft-accent": accent, background: "var(--ft-bg)", color: "var(--ft-fg)" } as CSSProperties;

  return (
    <footer style={style} data-ft-effect={effect} className="cm-footer relative mt-28 overflow-hidden pb-6 pt-14 sm:pt-16">
      <span aria-hidden className="pointer-events-none absolute -left-32 -top-40 h-96 w-96 rounded-full bg-blueBrand-600/25 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-sun/10 blur-3xl" />
      <Container className="relative">
        {showVisit ? (
          <div id="visit" data-reveal="scale" className="relative scroll-mt-28 overflow-hidden rounded-[2rem] bg-blueBrand-600 px-6 py-8 text-white sm:px-10 sm:py-10">
            <span aria-hidden className="absolute -right-10 -top-14 h-48 w-48 rounded-full bg-white/10" />
            <span aria-hidden className="absolute -bottom-20 right-40 h-40 w-40 rounded-full bg-sun/30" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">{t("footer.visit.title")}</h2>
                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-white/85">
                  {times.map(([a, b]) => (
                    <li key={a} className="inline-flex items-center gap-2 text-sm sm:text-base">
                      <Clock className="h-4 w-4 opacity-70" aria-hidden />
                      <span className="font-bold">{a}</span> <span className="text-white/70">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={s.ctaUrl || t("header.ctaUrl") || "/contact/#form-title"} className="btn btn-sun" data-magnetic>{s.ctaLabel || "Plan a visit"}</Link>
                {s.whatsapp ? (
                  <a href={waLink(s.whatsapp, t("footer.visit.whatsappMsg"))} target="_blank" rel="noopener noreferrer" className="btn bg-white text-ink shadow-[0_4px_0_rgba(0,0,0,.2)]" data-magnetic>
                    <SocialBadge network="whatsapp" size={22} /> {t("footer.visit.whatsapp")}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className={cn("grid gap-8 border-b pb-10 lg:grid-cols-[1.2fr_2fr] lg:items-start", showVisit ? "mt-12" : "mt-0")} style={{ borderColor: "color-mix(in srgb, var(--ft-fg) 12%, transparent)" }}>
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-sm leading-6 opacity-65">{s.footerTagline || s.footerBlurb}</p>
            {socials.length ? (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Social media">
                {socials.map(({ network, key, handle, url, external }, i) => (
                  <li key={key + i}>
                    <a href={url} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} title={network} data-social={key} aria-label={`${network}${handle ? ` — ${handle}` : ""}`} className="cm-ft-social block rounded-full ring-2 ring-white/15">
                      <SocialBadge network={key} size={44} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <nav aria-label="Footer">
              <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] opacity-45">{t("footer.col.explore")}</h2>
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[15px] font-bold">
                {links.map(([label, href]) => (
                  <li key={label + href}>
                    <Link className="cm-ft-link group inline-flex items-center gap-1" href={href || "/"}>
                      <span className="cm-ft-label">{label}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] opacity-45">{t("footer.col.contact")}</h2>
              <ul className="mt-4 grid gap-1 text-[15px]">
                {s.phone ? (
                  <li><a className="cm-ft-row inline-flex items-center gap-2.5 rounded-xl py-1.5" href={telLink(s.phone)}><span className="cm-ft-ico grid h-8 w-8 place-items-center rounded-lg"><Phone className="h-4 w-4" aria-hidden /></span><span className="cm-ft-label">{s.phone}</span></a></li>
                ) : null}
                {s.email ? (
                  <li><a className="cm-ft-row inline-flex items-center gap-2.5 break-all rounded-xl py-1.5" href={`mailto:${s.email}`}><span className="cm-ft-ico grid h-8 w-8 shrink-0 place-items-center rounded-lg"><Mail className="h-4 w-4" aria-hidden /></span><span className="cm-ft-label">{s.email}</span></a></li>
                ) : null}
                {s.address ? (
                  <li><a className="cm-ft-row inline-flex items-start gap-2.5 rounded-xl py-1.5 text-sm leading-6" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.mapQuery || s.address)}`} target="_blank" rel="noopener noreferrer"><span className="cm-ft-ico grid h-8 w-8 shrink-0 place-items-center rounded-lg"><MapPin className="h-4 w-4" aria-hidden /></span><span className="cm-ft-label opacity-80">{s.address}</span></a></li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="opacity-55">© {new Date().getFullYear()} {s.siteName} · {s.churchName}</span>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legal.map(([label, href]) => (
              <li key={label}><Link className="cm-ft-link cm-ft-small" href={href || "/"}><span className="cm-ft-label">{label}</span></Link></li>
            ))}
            <li><Link className="cm-ft-link cm-ft-small" href="/admin/"><span className="cm-ft-label">{t("footer.staffLogin")}</span></Link></li>
            <li>
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="cm-ft-top grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-soft ring-1 ring-ink/10" aria-label="Back to top">
                <ArrowUp className="h-4 w-4" aria-hidden />
              </button>
            </li>
          </ul>
        </div>

        {showWord ? (
          <Wordmark
            text={s.footerWordmark || s.siteName || "Children's Ministry"}
            palette={wmPalette}
            effect={s.footerWordmarkEffect || "trail"}
            font={s.footerWordmarkFont || "Poppins"}
            color={col(s.footerWordmarkColor, "") || undefined}
          />
        ) : null}
      </Container>
    </footer>
  );
}
