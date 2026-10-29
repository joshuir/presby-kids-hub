"use client";

import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/ui/RichText";
import { useSettings } from "@/lib/site";

const DOCS = {
  safeguarding: { eyebrow: "Child safety", title: "Keeping every child safe", intro: "Safeguarding isn't a policy we keep in a drawer — it shapes how we teach, how we check children in and out, and how this website works.", key: "safeguardingBody" },
  accessibility: { eyebrow: "Accessibility", title: "A website for every family", intro: "We want every parent, carer and child to be able to use this site, whatever device or assistive technology they use.", key: "accessibilityBody" },
  privacy: { eyebrow: "Privacy", title: "Your privacy", intro: "What we collect, why, and the choices you have.", key: "privacyBody" },
  terms: { eyebrow: "Terms", title: "Terms of use", intro: "The simple rules for using this website.", key: "termsBody" },
} as const;

export function DocPage({ kind }: { kind: keyof typeof DOCS }) {
  const s = useSettings();
  const d = DOCS[kind];
  return (
    <div>
      <PageHero page={kind} eyebrow={d.eyebrow} title={d.title} intro={d.intro}>
        <p className="text-sm font-semibold text-ink/50">Last updated {s.pagesUpdated}</p>
      </PageHero>
      <Container className="max-w-3xl">
        <div className="card p-6 sm:p-10">
          <RichText text={s[d.key]} className="prose-kids text-[17px] text-ink/80 [&>h2:first-child]:mt-0" />
        </div>
      </Container>
    </div>
  );
}
