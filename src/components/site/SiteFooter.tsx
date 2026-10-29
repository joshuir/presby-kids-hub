"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { socialIcon } from "./Social";
import { NAV } from "@/lib/nav";
import { parts, telLink, useSettings, waLink } from "@/lib/site";

export function SiteFooter() {
  const s = useSettings();
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const times = s.serviceTimes.map(parts);
  const groups = s.groups.map(parts);
  const socials = s.socials.map(parts).filter((x) => x[3]);

  return (
    <footer className="mt-24">
      {/* visit band */}
      <Container>
        <div id="visit" className="relative scroll-mt-28 overflow-hidden rounded-[2rem] bg-blueBrand-600 px-6 py-10 text-white sm:px-12 sm:py-14">
          <span aria-hidden className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
          <span aria-hidden className="absolute -bottom-16 right-32 h-40 w-40 rounded-full bg-sun/30" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="eyebrow bg-white/15 text-white">Visit us</span>
              <h2 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl text-balance">Come as you are this Sunday.</h2>
              <ul className="mt-5 grid gap-2 text-white/90">
                {times.map(([a, b]) => (
                  <li key={a} className="flex flex-wrap gap-x-2">
                    <span className="font-bold">{a}</span>
                    <span className="text-white/75">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/contact/#form-title" className="btn btn-sun">{s.ctaLabel}</Link>
              {s.whatsapp ? (
                <a href={waLink(s.whatsapp)} target="_blank" rel="noreferrer" className="btn bg-white text-ink shadow-[0_4px_0_rgba(0,0,0,.2)]">
                  WhatsApp us
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </Container>

      <div className="mt-16 bg-ink text-white">
        <Container className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          <div>
            <Logo name={s.siteName} sub={s.churchName} light size={46} />
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">{s.footerBlurb}</p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">
              <ShieldCheck className="h-4 w-4 text-mint" aria-hidden /> All teachers safeguarding-trained
            </p>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Social media">
              {socials.map(([network, handle, , url]) => {
                const [Icon] = socialIcon(network);
                return (
                  <li key={network}>
                    <a href={url} target="_blank" rel="noreferrer" aria-label={`${network} — ${handle}`} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
                      <Icon className="h-4 w-4" aria-hidden />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
          <nav aria-label="Footer">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/50">Explore</h2>
            <ul className="mt-4 grid gap-2.5 text-sm text-white/80">
              {NAV.flatMap((n) => (n.children ? n.children.map((c) => ({ href: c.href, label: c.label })) : [{ href: n.href, label: n.label }])).map((n) => (
                <li key={n.href}><Link className="hover:text-white" href={n.href}>{n.label}</Link></li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/50">Classes</h2>
            <ul className="mt-4 grid gap-2.5 text-sm text-white/80">
              {groups.map(([key, label, ages]) => (
                <li key={key}>
                  <Link className="hover:text-white" href={`/classes/#${key}`}>
                    {label} <span className="text-white/45">{ages}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/50">Get in touch</h2>
            <ul className="mt-4 grid gap-3 text-sm text-white/80">
              {s.phone ? <li><a className="flex gap-2 hover:text-white" href={telLink(s.phone)}><Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{s.phone}</a></li> : null}
              {s.email ? <li><a className="flex gap-2 break-all hover:text-white" href={`mailto:${s.email}`}><Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{s.email}</a></li> : null}
              <li><Link className="flex gap-2 hover:text-white" href="/contact/#map"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{s.address}</Link></li>
            </ul>
          </div>
        </Container>
        <div className="border-t border-white/10">
          <Container className="flex flex-col gap-3 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Presbyterian Children&apos;s Ministry · {s.churchName}, Accra</span>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              <li><Link href="/privacy/" className="hover:text-white">Privacy</Link></li>
              <li><Link href="/terms/" className="hover:text-white">Terms</Link></li>
              <li><Link href="/safeguarding/" className="hover:text-white">Safeguarding</Link></li>
              <li><Link href="/accessibility/" className="hover:text-white">Accessibility</Link></li>
              <li><Link href="/admin/" className="hover:text-white">Staff login</Link></li>
            </ul>
          </Container>
        </div>
      </div>
    </footer>
  );
}
