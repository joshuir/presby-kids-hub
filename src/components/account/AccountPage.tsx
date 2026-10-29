"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { Loading } from "@/components/site/LoadState";
import { Field, PrimaryButton, inputCls } from "@/components/forms/Field";
import { getPublic, supa } from "@/lib/cms/client";
import type { ClassDoc } from "@/lib/cms/types";
import { ACHIEVEMENTS, level } from "@/components/games/game-logic";
import { ageFrom, childDelete, childLinkPlayer, childSave, devicePlayer, parentMe, parentSave, type Child, type ParentMe } from "@/lib/parent";
import { AuthForm } from "./AuthForm";
import { ChildForm } from "./ChildForm";
import { cn } from "@/lib/cn";

const STATUS: Record<Child["status"], [string, string]> = {
  pending: ["Awaiting confirmation", "bg-amber-100 text-amber-900"],
  confirmed: ["Confirmed", "bg-emerald-100 text-emerald-900"],
  declined: ["Please contact us", "bg-red-100 text-red-800"],
};

function NewPassword({ done }: { done: () => void }) {
  const [msg, setMsg] = useState("");
  return (
    <form
      className="mx-auto grid max-w-md gap-4 rounded-[2rem] bg-white p-8 shadow-card ring-1 ring-black/5"
      onSubmit={async (e) => {
        e.preventDefault();
        const pw = String(new FormData(e.currentTarget).get("pw"));
        const { error } = await supa().auth.updateUser({ password: pw });
        if (error) setMsg(error.message);
        else done();
      }}
    >
      <h2 className="font-[family-name:var(--font-heading)] text-2xl text-navy-900">Choose a new password</h2>
      <Field label="New password"><input name="pw" type="password" minLength={8} required className={inputCls} autoComplete="new-password" /></Field>
      {msg ? <div className="text-sm text-red-700">{msg}</div> : null}
      <PrimaryButton type="submit">Save password</PrimaryButton>
    </form>
  );
}

function ChildCard({ c, classes, onChanged }: { c: Child; classes: ClassDoc[]; onChanged: () => void }) {
  const [edit, setEdit] = useState(false);
  const [note, setNote] = useState("");
  const cls = classes.find((k) => k.id === c.classId);
  const dp = devicePlayer();
  const lv = c.game ? level(c.game.xp) : null;
  const [label, tone] = STATUS[c.status];

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5">
      {edit ? (
        <ChildForm
          child={c}
          classes={classes}
          onCancel={() => setEdit(false)}
          onSave={async (v) => {
            await childSave(v);
            setEdit(false);
            onChanged();
          }}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl text-lg font-black text-white" style={{ background: cls?.color ?? "#2563EB" }}>{c.name.slice(0, 1).toUpperCase()}</div>
              <div>
                <div className="font-[family-name:var(--font-heading)] text-xl text-navy-900">{c.name}</div>
                <div className="text-sm text-black/55">{[ageFrom(c.birthDate), cls?.name ?? "Class to be advised"].filter(Boolean).join(" · ")}</div>
              </div>
            </div>
            <span className={cn("rounded-full px-3 py-1 text-xs font-bold", tone)}>{label}</span>
          </div>

          {cls ? (
            <div className="mt-4 rounded-2xl bg-sky-soft p-4 text-sm text-navy-900">
              <div className="font-semibold">🗓 {cls.schedule}</div>
              <div className="mt-1 text-navy-900/70">Teacher: {cls.teacher}</div>
              <Link href={`/classes/view/?id=${cls.id}`} className="mt-2 inline-block font-bold text-blueBrand-700">This week’s lesson →</Link>
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border border-black/5 p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-black/45">Bible games</div>
            {c.game && lv ? (
              <div className="mt-2">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                  <span className="text-2xl font-black text-navy-900">Level {lv.level}</span>
                  <span>{c.game.xp} XP</span>
                  <span>🔥 {c.game.streak}-day streak</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-blueBrand-500" style={{ width: `${Math.round(lv.progress * 100)}%` }} /></div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ACHIEVEMENTS.filter((a) => c.game!.achievements.includes(a.id)).map((a) => (
                    <span key={a.id} title={a.desc} className="rounded-full bg-sun-400/25 px-2.5 py-1 text-xs font-semibold">{a.icon} {a.label}</span>
                  ))}
                  {!c.game.achievements.length ? <span className="text-xs text-black/45">No badges yet — keep playing!</span> : null}
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-black/55">
                {dp ? (
                  <>This device has a game player <b>{dp.name}</b>.{" "}
                    <button type="button" className="font-bold text-blueBrand-700" onClick={async () => { try { await childLinkPlayer(c.id, dp.id); onChanged(); } catch (x) { setNote((x as Error).message); } }}>
                      Link to {c.name}
                    </button>
                  </>
                ) : (
                  <>No game progress linked yet. <Link className="font-bold text-blueBrand-700" href="/games/">Play on this device</Link>, then link it here.</>
                )}
              </p>
            )}
            {note ? <p className="mt-2 text-xs text-red-700">{note}</p> : null}
          </div>

          <div className="mt-4 flex gap-2 text-sm">
            <button type="button" onClick={() => setEdit(true)} className="rounded-full bg-sky-soft px-4 py-2 font-bold text-navy-900">Edit</button>
            <button
              type="button"
              onClick={async () => {
                if (!confirm(`Remove ${c.name} from your account?`)) return;
                await childDelete(c.id);
                onChanged();
              }}
              className="rounded-full px-4 py-2 font-bold text-red-700 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}

export function AccountPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [recovery, setRecovery] = useState(false);
  const [me, setMe] = useState<ParentMe | null>(null);
  const [classes, setClasses] = useState<ClassDoc[]>([]);
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);
  const preset = typeof window !== "undefined" ? new URLSearchParams(location.search).get("class") ?? undefined : undefined;

  const load = useCallback(async () => {
    try {
      setMe(await parentMe());
      setErr("");
    } catch (x) {
      setErr((x as Error).message);
    }
  }, []);

  useEffect(() => {
    getPublic("classes").then((c) => setClasses([...c].sort((a, b) => a.order - b.order))).catch(() => {});
    supa().auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data } = supa().auth.onAuthStateChange((ev, session) => {
      if (ev === "PASSWORD_RECOVERY") setRecovery(true);
      setAuthed(!!session);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authed) load();
    else setMe(null);
  }, [authed, load]);

  useEffect(() => {
    if (preset && me && !me.children.length) setAdding(true);
  }, [preset, me]);

  return (
    <div>
      <PageHero eyebrow="Parents" title={me?.name ? `Welcome, ${me.name.split(" ")[0]}` : "Parent account"} intro="Register your children, follow their class, and see their Bible game badges — all in one place." />
      <Container className="mt-10 max-w-5xl">
        {authed === null ? <Loading /> : null}
        {recovery ? <NewPassword done={() => setRecovery(false)} /> : null}
        {authed === false && !recovery ? (
          <div className="grid items-start gap-8 lg:grid-cols-2">
            <AuthForm onDone={() => setAuthed(true)} />
            <div className="space-y-4 text-black/70">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl text-navy-900">Why create an account?</h2>
              {[
                ["🧒", "Register each child once", "Add every child with their class and care notes; a teacher confirms the placement."],
                ["📚", "Follow this week’s lesson", "Jump straight to your child’s class page, worksheets and videos."],
                ["🏅", "See game progress", "Link the Bible games on your device to see levels, streaks and badges."],
              ].map(([i, t, d]) => (
                <div key={t} className="flex gap-4 rounded-3xl bg-sky-soft p-5">
                  <div className="text-3xl">{i}</div>
                  <div><div className="font-bold text-navy-900">{t}</div><div className="text-sm">{d}</div></div>
                </div>
              ))}
              <p className="text-xs text-black/45">We only use your details to care for your children and contact you about the ministry. See our <Link className="underline" href="/privacy/">privacy notice</Link>.</p>
            </div>
          </div>
        ) : null}

        {authed && !recovery ? (
          <>
            {err ? <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{err}</div> : null}
            {!me && !err ? <Loading label="Loading your account…" /> : null}
            {me ? (
              <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px]">
                <section>
                  <div className="flex items-center justify-between">
                    <h2 className="font-[family-name:var(--font-heading)] text-2xl text-navy-900">Your children</h2>
                    {!adding ? <PrimaryButton type="button" onClick={() => setAdding(true)}>+ Add child</PrimaryButton> : null}
                  </div>
                  <AnimatePresence>
                    {adding ? (
                      <motion.div key="add" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="mt-4 rounded-3xl bg-white p-6 shadow-card ring-2 ring-blueBrand-200">
                          <ChildForm classes={classes} preset={preset} onCancel={() => setAdding(false)} onSave={async (v) => { await childSave(v); setAdding(false); await load(); }} />
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                  <div className="mt-4 grid gap-4">
                    <AnimatePresence>
                      {me.children.map((c) => <ChildCard key={c.id} c={c} classes={classes} onChanged={load} />)}
                    </AnimatePresence>
                    {!me.children.length && !adding ? <p className="rounded-3xl bg-sky-soft p-8 text-center text-black/60">No children added yet. Click <b>Add child</b> to register.</p> : null}
                  </div>
                </section>
                <aside className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5">
                  <h2 className="font-[family-name:var(--font-heading)] text-xl text-navy-900">Your details</h2>
                  <div className="mt-1 text-sm text-black/50">{me.email}</div>
                  <form
                    className="mt-4 grid gap-3"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      await parentSave(String(fd.get("name")), String(fd.get("phone")), String(fd.get("whatsapp")));
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2500);
                      load();
                    }}
                  >
                    <Field label="Name"><input name="name" defaultValue={me.name} className={inputCls} /></Field>
                    <Field label="Phone"><input name="phone" type="tel" defaultValue={me.phone} className={inputCls} /></Field>
                    <Field label="WhatsApp"><input name="whatsapp" type="tel" defaultValue={me.whatsapp} className={inputCls} /></Field>
                    <PrimaryButton type="submit">{saved ? "Saved ✓" : "Save details"}</PrimaryButton>
                  </form>
                  <button type="button" onClick={() => supa().auth.signOut()} className="mt-4 w-full rounded-full py-2 text-sm font-bold text-black/60 hover:bg-black/5">Sign out</button>
                </aside>
              </div>
            ) : null}
          </>
        ) : null}
      </Container>
    </div>
  );
}
