"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Container } from "@/components/site/Container";
import { Eyebrow } from "@/components/ui/Reveal";
import { useSettings } from "@/lib/site";
import { PhoneMockup } from "./PhoneMockup";

export function AppPromo() {
  const s = useSettings();
  const [qr, setQr] = useState("");
  useEffect(() => {
    const url = s.googlePlayUrl || (typeof location !== "undefined" ? location.origin : "");
    QRCode.toDataURL(url, { margin: 1, width: 240, color: { dark: "#0B1530", light: "#FFFFFF" } }).then(setQr).catch(() => {});
  }, [s.googlePlayUrl]);
  if (s.showApp === "no") return null;
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
          <div data-reveal="right"><PhoneMockup /></div>
        </div>
      </div>
    </Container>
  );
}
