"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Container } from "@/components/site/Container";
import { Eyebrow } from "@/components/ui/Reveal";
import { useSettings } from "@/lib/site";
import { useContent } from "@/lib/useContent";
import { classLessons, fmtDate, upcoming } from "@/lib/format";

export function AppPromo() {
  const s = useSettings();
  const lessons = useContent("lessons") ?? [];
  const events = useContent("events") ?? [];
  const [qr, setQr] = useState("");
  useEffect(() => {
    const url = s.googlePlayUrl || (typeof location !== "undefined" ? location.origin : "");
    QRCode.toDataURL(url, { margin: 1, width: 240, color: { dark: "#0B1530", light: "#FFFFFF" } }).then(setQr).catch(() => {});
  }, [s.googlePlayUrl]);
  if (s.showApp === "no") return null;
  const { current } = classLessons(lessons, "primary-2");
  const ev = upcoming(events)[0];
  return (
    <Container className="mt-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink p-6 text-white sm:p-12">
        <div aria-hidden className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-blueBrand-600/40 blur-3xl" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Eyebrow tone="white">Mobile app</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl text-balance">{s.appTitle}</h2>
            <p className="mt-3 max-w-md text-white/70">{s.appText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={s.googlePlayUrl} target="_blank" rel="noreferrer" className="btn bg-white text-ink">Get it on Google Play</a>
              <a href={s.appStoreUrl} target="_blank" rel="noreferrer" className="btn bg-white/10 text-white ring-1 ring-white/20">Download on the App Store</a>
            </div>
            {qr ? (
              <div className="mt-6 hidden items-center gap-4 sm:flex">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="QR code to download the app" width={96} height={96} className="rounded-xl bg-white p-1.5" />
                <div className="text-sm">
                  <div className="font-bold">Scan to download</div>
                  <div className="text-white/60">Point your phone camera here.</div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="mx-auto w-[260px] rounded-[2.4rem] bg-white p-3 text-ink shadow-2xl ring-8 ring-white/10">
            <div className="rounded-[1.9rem] bg-cream p-4">
              <div className="flex items-center gap-2 text-xs font-bold">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logo.png" alt="" width={22} height={25} /> {s.siteName}
              </div>
              {current ? (
                <div className="mt-4 rounded-2xl bg-blueBrand-600 p-4 text-white">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">This Sunday · Primary 2</div>
                  <div className="mt-1 font-display text-lg font-bold">{current.title}</div>
                  <div className="mt-3 rounded-xl bg-white/15 p-2 text-xs">
                    <div className="font-bold text-white/70">Memory verse</div>“{current.memoryVerse}”
                  </div>
                </div>
              ) : null}
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-bold">
                <div className="rounded-xl bg-sun-soft p-3">🖍️ Colouring</div>
                <div className="rounded-xl bg-sky-soft p-3">📖 Story</div>
              </div>
              {ev ? (
                <div className="mt-3 rounded-xl bg-white p-3 text-xs shadow-soft">
                  <div className="font-bold">{ev.title}</div>
                  <div className="text-ink/55">{fmtDate(ev.date, { weekday: "short", day: "numeric", month: "short" })}</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
