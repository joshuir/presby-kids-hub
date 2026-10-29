"use client";

import { supa } from "@/lib/cms/client";

export type Consent = { necessary: true; analytics: boolean; decidedAt: string };
const KEY = "kh-cookie-consent";
const VISITOR = "kh-visitor";
export const CONSENT_EVENT = "kh-consent-change";

export function getConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

export function setConsent(analytics: boolean) {
  const c: Consent = { necessary: true, analytics, decidedAt: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
    if (!analytics) localStorage.removeItem(VISITOR);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: c }));
}

function visitorId() {
  try {
    let v = localStorage.getItem(VISITOR);
    if (!v) {
      v = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)).toLowerCase();
      localStorage.setItem(VISITOR, v);
    }
    return v;
  } catch {
    return null;
  }
}

/** Anonymous page/event count. Only runs when the visitor accepted analytics cookies. */
export function track(path: string) {
  if (!getConsent()?.analytics) return;
  const v = visitorId();
  if (!v) return;
  let ref = "";
  try {
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host !== location.hostname) ref = host.replace(/^www\./, "");
    }
  } catch {
    /* ignore */
  }
  supa().rpc("kh_track", { p: path, r: ref, v }).then(() => {}, () => {});
}

export const trackEvent = (name: string) => track(`event:${name}`);
