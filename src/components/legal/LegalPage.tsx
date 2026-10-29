"use client";

import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/ui/RichText";
import { OPEN_COOKIE_SETTINGS } from "@/components/site/CookieBanner";
import { useSettings } from "@/lib/site";

export function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const s = useSettings();
  return (
    <div>
      <PageHero eyebrow={kind === "privacy" ? "Privacy & cookies" : "Terms"} title={kind === "privacy" ? "Your privacy" : "Terms of use"} intro={kind === "privacy" ? "What we collect, why, and the choices you have." : "The simple rules for using this website."} />
      <Container className="mt-10 max-w-3xl">
        <RichText text={kind === "privacy" ? s.privacyBody : s.termsBody} className="prose-kids text-black/75" />
        {kind === "privacy" ? (
          <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS))} className="mt-8 rounded-full bg-navy-900 px-5 py-3 text-sm font-bold text-white">
            Change cookie settings
          </button>
        ) : null}
      </Container>
    </div>
  );
}
