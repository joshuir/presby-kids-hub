"use client";

import { Suspense, useState } from "react";
import { ArrowUpRight, Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { SupaForm } from "@/components/site/SupaForm";
import { Faqs } from "@/components/blocks/Faqs";
import { BrandGlyph, SocialBadge } from "@/components/site/Social";
import { SectionHeading } from "@/components/ui/Reveal";
import { parts, telLink, useSettings, waLink } from "@/lib/site";

const input = "w-full rounded-2xl bg-paper px-4 py-3 outline-none ring-1 ring-ink/10 focus:bg-white focus:ring-2 focus:ring-blueBrand-500";

/** Solid contact glyphs drawn like the real apps' icons. */
function ContactIcon({ kind }: { kind: "call" | "whatsapp" | "email" | "visit" }) {
  if (kind === "whatsapp")
    return (
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#25D366] text-white shadow-[0_6px_14px_-6px_rgba(37,211,102,.7)]">
        <BrandGlyph name="whatsapp" className="h-6 w-6" />
      </span>
    );
  const map = {
    call: ["bg-[#34C759]", "shadow-[0_6px_14px_-6px_rgba(52,199,89,.7)]", Phone],
    email: ["bg-[#2563EB]", "shadow-[0_6px_14px_-6px_rgba(37,99,235,.7)]", Mail],
    visit: ["bg-[#EA4335]", "shadow-[0_6px_14px_-6px_rgba(234,67,53,.7)]", MapPin],
  } as const;
  const [bg, sh, Icon] = map[kind];
  return (
    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white ${bg} ${sh}`}>
      <Icon className="h-6 w-6" fill={kind === "call" ? "currentColor" : "none"} strokeWidth={kind === "call" ? 0 : 2.2} aria-hidden />
    </span>
  );
}

export function ContactPage() {
  const s = useSettings();
  const [len, setLen] = useState(0);
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.mapQuery || s.address)}`;
  const cards = [
    { kind: "call" as const, label: "Call us", value: s.phone, action: "Call now", href: telLink(s.phone) },
    { kind: "whatsapp" as const, label: "WhatsApp", value: s.whatsapp, action: "Start a chat", href: waLink(s.whatsapp, "Hello! I have a question about the Children's Ministry.") },
    { kind: "email" as const, label: "Email", value: s.email, action: "Write an email", href: `mailto:${s.email}` },
    { kind: "visit" as const, label: "Visit us", value: s.address.replace(/^Presbyterian Church, Accra, /, ""), action: "Get directions", href: directions },
  ].filter((c) => c.value);
  const socials = s.socials.map(parts).filter(([, , , url]) => url);
  return (
    <div>
      <PageHero page="contact" eyebrow="Contact" title="We'd love to meet you" intro="Call, message or drop in on a Sunday — a real person from our team will reply." />

      <Container>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Ways to contact us">
          {cards.map(({ kind, label, value, action, href }) => (
            <li key={kind}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="card group flex h-full flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueBrand-500"
                data-contact={kind}
              >
                <span className="flex items-center gap-3">
                  <ContactIcon kind={kind} />
                  <span className="min-w-0">
                    <span className="block font-display text-lg font-bold">{label}</span>
                    <span className="block break-words text-sm text-ink/60">{value}</span>
                  </span>
                </span>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-extrabold text-blueBrand-700">
                  {action} <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="mt-16">
        <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="card p-6 sm:p-8" aria-labelledby="form-title">
            <h2 id="form-title" className="scroll-mt-28 font-display text-3xl font-extrabold">Send us a message</h2>
            <p className="mt-1 text-ink/60">We reply within two working days.</p>
            <Suspense>
              <SupaForm kind="contact" className="mt-6 grid gap-4 sm:grid-cols-2" successText="Thank you — your message is with our team. We'll reply within two working days.">
                <label className="grid gap-1.5 text-sm font-bold">Full name *<input name="name" required autoComplete="name" className={input} /></label>
                <label className="grid gap-1.5 text-sm font-bold">Email *<input name="email" type="email" required autoComplete="email" className={input} /></label>
                <label className="grid gap-1.5 text-sm font-bold">Phone (optional)<input name="phone" type="tel" autoComplete="tel" className={input} /></label>
                <label className="grid gap-1.5 text-sm font-bold">
                  Subject *
                  <select name="subject" required defaultValue="" className={input}>
                    <option value="" disabled>Choose one…</option>
                    {["Visiting for the first time", "Registering my child", "Volunteering as a teacher", "Safeguarding concern", "Prayer request", "Clothing collection", "Something else"].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm font-bold sm:col-span-2">
                  Message *
                  <textarea name="message" required rows={5} maxLength={2000} onChange={(e) => setLen(e.target.value.length)} className={input} />
                  <span className="text-right text-xs font-semibold text-ink/45">{len}/2000</span>
                </label>
                <p className="text-xs text-ink/50 sm:col-span-2">We use these details only to reply to you. <a className="underline" href="/privacy/">Privacy policy</a></p>
                <div className="sm:col-span-2"><button className="btn btn-primary">Send message</button></div>
              </SupaForm>
            </Suspense>
          </section>
          <aside className="grid gap-4">
            <div className="rounded-[1.75rem] bg-ink p-6 text-white">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Clock className="h-5 w-5 text-sun" aria-hidden /> Service times</h2>
              <ul className="mt-4 grid gap-3">
                {s.serviceTimes.map(parts).map(([a, b]) => (
                  <li key={a} className="flex flex-wrap justify-between gap-2 border-b border-white/10 pb-3 text-sm">
                    <span className="text-white/75">{a}</span><span className="font-bold">{b}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-white/60">First visit? Arrive 15 minutes early.</p>
            </div>
            {socials.length ? (
              <div className="card p-5">
                <h2 className="font-display text-xl font-bold">Follow us</h2>
                <ul className="mt-3 grid gap-1" aria-label="Social media">
                  {socials.map(([network, handle, , url]) => (
                    <li key={network}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-paper" aria-label={`${network}: ${handle}`}>
                        <SocialBadge network={network} size={40} />
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold">{network}</span>
                          <span className="block truncate text-sm text-ink/55">{handle}</span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-ink/40" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </Container>

      <Container className="mt-16">
        <section id="map" className="card scroll-mt-28 overflow-hidden lg:grid lg:grid-cols-[1fr_1.6fr]">
          <div className="p-6 sm:p-8">
            <span className="eyebrow bg-sky-soft text-blueBrand-700">Find us</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold">{s.churchName}, Accra</h2>
            <p className="mt-2 text-ink/65">{s.address}</p>
            <a href={directions} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-6"><Navigation className="h-4 w-4" aria-hidden /> Get directions</a>
          </div>
          <iframe title="Map to the church" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-72 w-full lg:h-full" src={`https://www.google.com/maps?q=${encodeURIComponent(s.mapQuery || s.address)}&output=embed`} />
        </section>
      </Container>

      <Container className="mt-16 pb-16">
        <div className="grid gap-8 [&>*]:min-w-0 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading eyebrow="FAQs" title="Before you visit" intro="Quick answers to the questions we hear most." />
          <Faqs askHref="" />
        </div>
      </Container>
    </div>
  );
}
