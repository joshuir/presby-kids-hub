"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp, ArrowUpRight, Clock, Mail, Phone } from "lucide-react";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { SocialBadge } from "./Social";
import { parts, telLink, useSettings, waLink } from "@/lib/site";

/** Clean, simple footer: a slim visit card, then one row of links, socials and the legal line. All text comes from the CMS. */
export function SiteFooter() {
  const s = useSettings();
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const times = s.serviceTimes.map(parts);
  const socials = s.socials.map(parts).filter((x) => x[3]);
  const links = (s.footerLinks?.length ? s.footerLinks : ["Classes|/classes/", "Events|/events/", "Gallery|/gallery/", "Contact|/contact/"]).map(parts);

  return (
    <footer className="mt-28 pb-6">
      <Container>
        {/* visit card */}
        <div id="visit" data-reveal="scale" className="relative scroll-mt-28 overflow-hidden rounded-[2rem] bg-blueBrand-600 px-6 py-8 text-white sm:px-10 sm:py-10">
          <span aria-hidden className="absolute -right-10 -top-14 h-48 w-48 rounded-full bg-white/10" />
          <span aria-hidden className="absolute -bottom-20 right-40 h-40 w-40 rounded-full bg-sun/30" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">Come as you are this Sunday.</h2>
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
              <Link href="/contact/#form-title" className="btn btn-sun" data-magnetic>{s.ctaLabel || "Plan a visit"}</Link>
              <a href={waLink(s.whatsapp, "Hello! I'd like to visit the Children's Ministry.")} target="_blank" rel="noreferrer" className="btn bg-white text-ink shadow-[0_4px_0_rgba(0,0,0,.2)]" data-magnetic>
                <SocialBadge network="whatsapp" size={22} /> WhatsApp us
              </a>
            </div>
          </div>
        </div>

        {/* main row */}
        <div className="mt-12 grid gap-8 border-b border-ink/10 pb-10 lg:grid-cols-[1.2fr_2fr] lg:items-start">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-6 text-ink/60">{s.footerTagline || s.footerBlurb}</p>
            {socials.length ? (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Social media">
                {socials.map(([network, handle, , url]) => (
                  <li key={network}>
                    <a href={url} target="_blank" rel="noreferrer" aria-label={`${network} — ${handle}`} className="block rounded-full transition hover:-translate-y-0.5 hover:shadow-lg">
                      <SocialBadge network={network} size={40} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <nav aria-label="Footer">
              <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-ink/40">Explore</h2>
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[15px] font-bold text-ink/75">
                {links.map(([label, href]) => (
                  <li key={label + href}>
                    <Link className="group inline-flex items-center gap-1 hover:text-blueBrand-600" href={href || "/"}>
                      {label}
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-ink/40">Contact</h2>
              <ul className="mt-4 grid gap-2.5 text-[15px] text-ink/75">
                <li><a className="inline-flex items-center gap-2 hover:text-blueBrand-600" href={telLink(s.phone)}><Phone className="h-4 w-4 text-ink/40" aria-hidden />{s.phone}</a></li>
                <li><a className="inline-flex items-center gap-2 break-all hover:text-blueBrand-600" href={`mailto:${s.email}`}><Mail className="h-4 w-4 shrink-0 text-ink/40" aria-hidden />{s.email}</a></li>
                <li className="text-sm leading-6 text-ink/55">{s.address}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* legal */}
        <div className="flex flex-col gap-3 pt-6 text-sm text-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {s.siteName} · {s.churchName}</span>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <li><Link className="hover:text-ink" href="/safeguarding/">Safeguarding</Link></li>
            <li><Link className="hover:text-ink" href="/privacy/">Privacy</Link></li>
            <li><Link className="hover:text-ink" href="/terms/">Terms</Link></li>
            <li><Link className="hover:text-ink" href="/accessibility/">Accessibility</Link></li>
            <li><Link className="hover:text-ink" href="/admin/">Staff login</Link></li>
            <li>
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-soft ring-1 ring-ink/10 transition hover:-translate-y-0.5" aria-label="Back to top">
                <ArrowUp className="h-4 w-4" aria-hidden />
              </button>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
