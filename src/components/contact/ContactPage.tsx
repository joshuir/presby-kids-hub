"use client";

import { Suspense } from "react";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { SupaForm } from "@/components/site/SupaForm";
import { Field, PrimaryButton, inputCls } from "@/components/forms/Field";
import { useSettings, waLink } from "@/lib/site";

export function ContactPage() {
  const s = useSettings();
  const tel = s.phone.replace(/[^\d+]/g, "");
  return (
    <div>
      <PageHero eyebrow="Contact" title="We’d love to hear from you" intro="Questions about classes, registration, safety or events? Send a message, call or WhatsApp us.">
        <div className="flex flex-wrap gap-3">
          {tel ? <a href={`tel:${tel}`} className="rounded-full bg-white px-5 py-3 text-sm font-bold text-navy-900 shadow-lg transition hover:-translate-y-0.5">📞 Call {s.phone}</a> : null}
          {s.whatsapp ? <a href={waLink(s.whatsapp, "Hello! I have a question about the children’s service.")} target="_blank" rel="noreferrer" className="rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5">WhatsApp us</a> : null}
        </div>
      </PageHero>
      <Container className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-black/5 sm:p-8">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl text-navy-900">Send a message</h2>
          <p className="mt-1 text-sm text-black/55">We aim to reply within 24–48 hours.</p>
          <Suspense>
            <SupaForm kind="contact" className="mt-6 grid gap-4 sm:grid-cols-2" successText="Your message has been sent. We’ll get back to you soon.">
              <Field label="Your name"><input name="name" required className={inputCls} autoComplete="name" /></Field>
              <Field label="Email"><input name="email" type="email" required className={inputCls} autoComplete="email" /></Field>
              <Field label="Phone (optional)"><input name="phone" type="tel" className={inputCls} autoComplete="tel" /></Field>
              <Field label="Topic">
                <select name="topic" className={inputCls} defaultValue="General">
                  {["General", "Classes", "Registration", "Safety", "Events", "Clothing collection"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Message" className="sm:col-span-2"><textarea name="message" required rows={5} className={inputCls} /></Field>
              <div className="sm:col-span-2"><PrimaryButton type="submit">Send message</PrimaryButton></div>
            </SupaForm>
          </Suspense>
        </div>
        <div className="grid gap-6">
          <div className="rounded-[2rem] bg-navy-900 p-6 text-white shadow-card sm:p-8">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl">Service times</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {s.serviceTimes.map((t) => <li key={t} className="flex gap-2"><span className="text-sun-400">●</span>{t}</li>)}
            </ul>
            <div className="mt-6 space-y-1 text-sm text-white/70">
              <div>📍 {s.address}</div>
              {s.email ? <div>✉️ <a className="underline" href={`mailto:${s.email}`}>{s.email}</a></div> : null}
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] shadow-card ring-1 ring-black/5">
            <iframe
              title="Map"
              className="h-72 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(s.mapQuery || s.address)}&output=embed`}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
