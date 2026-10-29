"use client";

import { Suspense, useEffect, useState } from "react";
import QRCode from "qrcode";
import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { SupaForm } from "@/components/site/SupaForm";
import { Faqs } from "@/components/blocks/Faqs";
import { Socials } from "@/components/blocks/Socials";
import { Newsletter } from "@/components/blocks/Newsletter";
import { SectionHeading } from "@/components/ui/Reveal";
import { parts, telLink, useSettings, waLink } from "@/lib/site";

const input = "w-full rounded-2xl bg-paper px-4 py-3 outline-none ring-1 ring-ink/10 focus:bg-white focus:ring-2 focus:ring-blueBrand-500";

export function ContactPage() {
  const s = useSettings();
  const [qr, setQr] = useState("");
  const [len, setLen] = useState(0);
  useEffect(() => {
    QRCode.toDataURL(s.googlePlayUrl || location.origin, { margin: 1, width: 200 }).then(setQr).catch(() => {});
  }, [s.googlePlayUrl]);
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.mapQuery || s.address)}`;
  const cards = [
    { icon: Phone, label: "Call", value: s.phone, href: telLink(s.phone), tone: "bg-sky-soft text-blueBrand-700" },
    { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: waLink(s.whatsapp), tone: "bg-[#DCFCE7] text-[#15803D]" },
    { icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}`, tone: "bg-sun-soft text-[#9A6400]" },
    { icon: MapPin, label: "Visit", value: s.address.replace(/^Presbyterian Church, Accra, /, ""), href: directions, tone: "bg-[#FFE8E1] text-[#C2410C]" },
  ];
  return (
    <div>
      <PageHero eyebrow="Contact" title="We'd love to meet you" intro="A real person from our team will reply.">
        <div className="flex flex-wrap gap-2">
          <a href={telLink(s.phone)} className="btn btn-primary !py-2.5 text-sm"><Phone className="h-4 w-4" aria-hidden /> Call</a>
          <a href={waLink(s.whatsapp)} target="_blank" rel="noreferrer" className="btn btn-ghost !py-2.5 text-sm"><MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp</a>
          <a href="#map" className="btn btn-ghost !py-2.5 text-sm"><MapPin className="h-4 w-4" aria-hidden /> Visit</a>
        </div>
      </PageHero>

      <Container>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ icon: Icon, label, value, href, tone }) => (
            <li key={label}>
              <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="card flex h-full items-center gap-4 p-5 transition hover:-translate-y-0.5">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tone}`}><Icon className="h-6 w-6" aria-hidden /></span>
                <span className="min-w-0">
                  <span className="block font-display text-lg font-bold">{label}</span>
                  <span className="block break-words text-sm text-ink/60">{value}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="mt-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading eyebrow="FAQs" title="Before you visit" intro="Quick answers to the questions we hear most." />
          <Faqs askHref="#form-title" />
        </div>
      </Container>

      <Container className="mt-20">
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
            {qr && s.showApp !== "no" ? (
              <div className="card flex items-center gap-4 p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="QR code to download the app" width={88} height={88} className="rounded-xl" />
                <div><div className="font-bold">Scan to download</div><div className="text-sm text-ink/55">Point your phone camera at the code.</div></div>
              </div>
            ) : null}
          </aside>
        </div>
      </Container>

      <Container className="mt-20">
        <SectionHeading eyebrow="Social" title="Find us on social" intro="Videos, photos and reminders." tone="coral" />
        <div className="mt-6"><Socials /></div>
      </Container>

      <Container className="mt-20">
        <section id="map" className="card scroll-mt-28 overflow-hidden lg:grid lg:grid-cols-[1fr_1.6fr]">
          <div className="p-6 sm:p-8">
            <span className="eyebrow bg-sky-soft text-blueBrand-700">Find us</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold">{s.churchName}, Accra</h2>
            <p className="mt-2 text-ink/65">{s.address}</p>
            <a href={directions} target="_blank" rel="noreferrer" className="btn btn-primary mt-6"><Navigation className="h-4 w-4" aria-hidden /> Get Directions</a>
          </div>
          <iframe title="Map to the church" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-72 w-full lg:h-full" src={`https://www.google.com/maps?q=${encodeURIComponent(s.mapQuery || s.address)}&output=embed`} />
        </section>
      </Container>

      <Newsletter />
    </div>
  );
}
