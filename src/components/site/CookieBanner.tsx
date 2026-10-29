"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CONSENT_EVENT, getConsent, setConsent, track } from "@/lib/consent";

export const OPEN_COOKIE_SETTINGS = "kh-open-cookie-settings";

/** Cookie consent banner + preferences. Analytics only runs after the visitor agrees. */
export function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const c = getConsent();
    if (!c) setOpen(true);
    else setAnalytics(c.analytics);
    const reopen = () => {
      setAnalytics(getConsent()?.analytics ?? true);
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS, reopen);
  }, []);

  // page views (only counted with consent; admin pages never counted)
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    track(pathname);
    const onChange = () => track(pathname);
    window.addEventListener(CONSENT_EVENT, onChange, { once: true });
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, [pathname]);

  const decide = (a: boolean) => {
    setConsent(a);
    setOpen(false);
    setDetails(false);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-label="Cookie preferences"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 260 }}
          className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-xl rounded-3xl bg-white p-5 shadow-[0_20px_60px_rgba(10,31,68,0.25)] ring-1 ring-black/5 sm:inset-x-auto sm:left-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden>🍪</span>
            <div className="text-sm leading-6 text-black/75">
              <div className="font-[family-name:var(--font-heading)] text-lg text-navy-900">We use a few cookies</div>
              Essential storage keeps you signed in and remembers your game progress. With your permission we also count
              visits anonymously to improve the site — no ads, no tracking across other websites.
            </div>
          </div>
          {details ? (
            <div className="mt-4 grid gap-2 text-sm">
              <label className="flex items-start gap-3 rounded-2xl bg-sky-soft p-3">
                <input type="checkbox" checked disabled className="mt-1" />
                <span>
                  <b>Essential</b> — sign-in, game progress, this cookie choice. Always on.
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-2xl bg-sky-soft p-3">
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1" />
                <span>
                  <b>Anonymous analytics</b> — counts page visits so the ministry team can see what helps families.
                </span>
              </label>
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => decide(true)} className="rounded-full bg-blueBrand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blueBrand-700">
              Accept all
            </button>
            {details ? (
              <button type="button" onClick={() => decide(analytics)} className="rounded-full px-5 py-2.5 text-sm font-bold ring-1 ring-black/15">
                Save choices
              </button>
            ) : (
              <button type="button" onClick={() => setDetails(true)} className="rounded-full px-5 py-2.5 text-sm font-bold ring-1 ring-black/15">
                Choose
              </button>
            )}
            <button type="button" onClick={() => decide(false)} className="rounded-full px-5 py-2.5 text-sm font-semibold text-black/60 hover:text-black">
              Essential only
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
