"use client";

import Link from "next/link";
import { Container } from "@/components/site/Container";
import { LogoMark } from "@/components/site/Logo";
import { OPEN_COOKIE_SETTINGS } from "@/components/site/CookieBanner";
import { useSettings, waLink } from "@/lib/site";
import { SITE_NAV } from "@/lib/nav";

export function SiteFooter() {
  const s = useSettings();
  const socials = [
    { k: "Facebook", v: s.facebook },
    { k: "YouTube", v: s.youtube },
    { k: "Instagram", v: s.instagram },
  ].filter((x) => x.v);
  return (
    <footer className="relative mt-24 overflow-hidden bg-navy-900 text-white">
      <svg className="absolute -top-px left-0 w-full text-white" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden>
        <path d="M0 0h1440v16c-240 32-480 32-720 16S240 0 0 24z" fill="currentColor" />
      </svg>
      <Container className="relative grid gap-10 pb-10 pt-20 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark size={44} />
            <div>
              <div className="font-[family-name:var(--font-heading)] text-xl">{s.siteName}</div>
              <div className="text-xs text-white/60">{s.churchName}</div>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">{s.tagline} A safe, joyful and Bible-centred place for children to grow in faith.</p>
          {socials.length ? (
            <div className="mt-4 flex gap-2">
              {socials.map((x) => (
                <a key={x.k} href={x.v} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20">
                  {x.k}
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-8 md:col-span-2">
          {SITE_NAV.filter((x) => x.children).map((sec) => {
            const Icon = sec.icon;
            return (
              <div key={sec.key}>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blueBrand-200">
                  <Icon className="h-4 w-4" aria-hidden /> {sec.label}
                </div>
                <ul className="mt-3 grid gap-2 text-sm text-white/75">
                  {sec.children!.map((c) => (
                    <li key={c.href}><Link className="rounded hover:text-white focus-ring" href={c.href}>{c.label}</Link></li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>
        <div className="rounded-3xl bg-white/[0.06] p-5 ring-1 ring-white/10">
          <div className="text-xs font-bold uppercase tracking-widest text-blueBrand-200">Visit us</div>
          <ul className="mt-3 grid gap-1.5 text-sm text-white/80">
            {s.serviceTimes.map((x) => <li key={x}>🕘 {x}</li>)}
            <li>📍 {s.address}</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {s.phone ? <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-navy-900">Call</a> : null}
            {s.whatsapp ? <a href={waLink(s.whatsapp)} target="_blank" rel="noreferrer" className="rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white">WhatsApp</a> : null}
            {s.email ? <a href={`mailto:${s.email}`} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">Email</a> : null}
          </div>
        </div>
      </Container>
      <Container className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-5 text-xs text-white/50">
        <span>© {new Date().getFullYear()} {s.siteName}</span>
        <span className="flex gap-4">
          <button type="button" className="hover:text-white" onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS))}>Cookie settings</button>
          <Link href="/privacy/" className="hover:text-white">Privacy & cookies</Link>
          <Link href="/terms/" className="hover:text-white">Terms</Link>
          <Link href="/admin/" className="hover:text-white">Admin</Link>
        </span>
      </Container>
    </footer>
  );
}
