"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { SupaForm } from "@/components/site/SupaForm";
import { Field, PrimaryButton, inputCls } from "@/components/forms/Field";
import { getPublic, supa } from "@/lib/cms/client";
import type { ClassDoc } from "@/lib/cms/types";

function Inner() {
  const sp = useSearchParams();
  const preset = sp.get("class") ?? "";
  const [classes, setClasses] = useState<ClassDoc[]>([]);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    getPublic("classes").then((c) => setClasses([...c].sort((a, b) => a.order - b.order))).catch(() => {});
    supa().auth.getSession().then(({ data }) => setAuthed(!!data.session));
  }, []);

  const accountHref = `/account/${preset ? `?class=${encodeURIComponent(preset)}` : ""}`;
  const presetName = classes.find((c) => c.id === preset)?.name ?? preset;

  return (
    <Container className="mt-10 grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-black/5 sm:p-8">
        {authed ? (
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl text-navy-900">You’re signed in</h2>
            <p className="mt-2 text-black/65">Add your child from your parent account — you’ll see their class status and game badges there.</p>
            <Link href={accountHref} className="mt-5 inline-flex rounded-full bg-blueBrand-600 px-6 py-3 text-sm font-bold text-white">Go to my account →</Link>
          </div>
        ) : (
          <>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl text-navy-900">Quick registration</h2>
            <p className="mt-1 text-sm text-black/55">No account needed. A teacher will confirm your child’s class.</p>
            <SupaForm kind="register" className="mt-6 grid gap-4 sm:grid-cols-2" successText="Your registration has been received. A teacher will be in touch to confirm. Create a parent account any time to follow your child’s class.">
              <Field label="Class" className="sm:col-span-2">
                <select name="class" defaultValue={presetName} key={presetName} className={inputCls}>
                  <option value="">Not sure — please advise</option>
                  {classes.map((c) => <option key={c.id} value={c.name}>{c.name} ({c.ageRange})</option>)}
                </select>
              </Field>
              <Field label="Parent/guardian name"><input name="parentName" required className={inputCls} autoComplete="name" /></Field>
              <Field label="Email"><input name="email" type="email" required className={inputCls} autoComplete="email" /></Field>
              <Field label="Phone / WhatsApp"><input name="phone" type="tel" className={inputCls} autoComplete="tel" /></Field>
              <Field label="Child’s name"><input name="childName" required className={inputCls} /></Field>
              <Field label="Child’s date of birth"><input name="birthDate" type="date" className={inputCls} /></Field>
              <Field label="Care notes (optional)" className="sm:col-span-2"><textarea name="notes" rows={3} className={inputCls} /></Field>
              <label className="flex items-start gap-2 text-xs text-black/60 sm:col-span-2">
                <input type="checkbox" name="consent" value="yes" required className="mt-0.5" />
                I agree that the children’s ministry may store these details to care for my child, as described in the <Link href="/privacy/" className="underline">privacy notice</Link>.
              </label>
              <div className="sm:col-span-2"><PrimaryButton type="submit">Submit registration</PrimaryButton></div>
            </SupaForm>
          </>
        )}
      </div>
      <div className="grid gap-6">
        {!authed ? (
          <div className="rounded-[2rem] bg-hero-blue p-6 text-white shadow-card sm:p-8">
            <div className="text-3xl">👨‍👩‍👧</div>
            <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">Have more than one child?</h2>
            <p className="mt-2 text-sm text-white/80">Create a free parent account to register every child, see confirmation status and follow their Bible game badges.</p>
            <Link href={accountHref} className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-navy-900">Create parent account</Link>
          </div>
        ) : null}
        <div className="rounded-[2rem] bg-sky-soft p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-heading)] text-xl text-navy-900">What happens next?</h2>
          <ol className="mt-3 space-y-3 text-sm text-black/70">
            {["A teacher reviews the registration and confirms the class.", "We contact you by email or WhatsApp with first-Sunday details.", "On your first visit, you’ll complete a short check-in at the classroom."].map((t, i) => (
              <li key={t} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy-900 text-xs font-bold text-white">{i + 1}</span>{t}</li>
            ))}
          </ol>
        </div>
      </div>
    </Container>
  );
}

export function RegisterPage() {
  return (
    <div>
      <PageHero eyebrow="Register" title="Join the children’s service" intro="Register your child for a class in a couple of minutes." />
      <Suspense>
        <Inner />
      </Suspense>
    </div>
  );
}
