"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { cn } from "@/lib/cn";
import { getLeaderboard, getPublic, submitScore as saveScore } from "@/lib/cms/client";
import { trackEvent } from "@/lib/consent";
import { isLive } from "@/lib/cms/types";
import type { Difficulty } from "@/lib/cms/types";
import {
  ACCESSORIES,
  ACHIEVEMENTS,
  DIFFICULTIES,
  MASCOT_COLORS,
  STORY_DONE_AT,
  evaluateAchievements,
  level,
  newPlayer,
  pickRound,
  updateStreak,
  type GameMascot,
  type GameQuestion,
  type LeaderRow,
  type Player,
} from "./game-logic";

const LS_KEY = "kh_player_v1";
const ROUND_SIZE = 10;
const HEARTS = 3;

type Screen = "loading" | "setup" | "home" | "play" | "results";
type Tab = "play" | "leaderboard" | "progress" | "awards";

function load(): Player | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Player) : null;
  } catch {
    return null;
  }
}
function save(p: Player) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(p));
  } catch {
    /* private mode */
  }
}

export function Mascot({
  emoji,
  color,
  accessory,
  size = 96,
  className,
  innerRef,
}: {
  emoji: string;
  color: string;
  accessory: string;
  size?: number;
  className?: string;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  const acc = ACCESSORIES.find((a) => a.id === accessory)?.glyph ?? "";
  return (
    <div
      ref={innerRef}
      className={cn("relative grid shrink-0 place-items-center rounded-full shadow-card ring-4 ring-white", className)}
      style={{ width: size, height: size, background: color }}
      aria-hidden
    >
      <span style={{ fontSize: size * 0.55, lineHeight: 1 }}>{emoji}</span>
      {acc ? (
        <span className="absolute" style={{ top: -size * 0.18, fontSize: size * 0.34 }}>
          {acc}
        </span>
      ) : null}
    </div>
  );
}

function Confetti({ fire }: { fire: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!fire || !ref.current) return;
    const host = ref.current;
    const colors = ["#86EF99", "#00DDFF", "#F5D33A", "#F4B6C2", "#2563EB", "#FB923C"];
    const bits: HTMLSpanElement[] = [];
    for (let i = 0; i < 70; i++) {
      const s = document.createElement("span");
      s.style.cssText = `position:absolute;left:50%;top:40%;width:10px;height:14px;border-radius:3px;background:${colors[i % colors.length]}`;
      host.appendChild(s);
      bits.push(s);
      gsap.to(s, {
        x: (Math.random() - 0.5) * window.innerWidth * 0.9,
        y: Math.random() * window.innerHeight * 0.7 - window.innerHeight * 0.35,
        rotation: Math.random() * 720,
        opacity: 0,
        duration: 1.6 + Math.random(),
        ease: "power2.out",
        onComplete: () => s.remove(),
      });
    }
    return () => bits.forEach((b) => b.remove());
  }, [fire]);
  return <div ref={ref} className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden />;
}

export function BibleGame() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [tab, setTab] = useState<Tab>("play");
  const [player, setPlayer] = useState<Player>(() => newPlayer());
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [mascots, setMascots] = useState<GameMascot[]>([]);
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [testament, setTestament] = useState<"ALL" | "OT" | "NT">("ALL");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [story, setStory] = useState<string>("");

  // round state
  const [round, setRound] = useState<GameQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [hearts, setHearts] = useState(HEARTS);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [roundXp, setRoundXp] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [freshAwards, setFreshAwards] = useState<string[]>([]);
  const [confetti, setConfetti] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const mascotRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [qs, ms, lb] = await Promise.all([getPublic("questions"), getPublic("mascots"), getLeaderboard()]);
      setQuestions(qs.filter((q) => isLive(q)) as GameQuestion[]);
      setMascots(ms as GameMascot[]);
      setLeaders(lb);
      setLoadError(null);
    } catch {
      setLoadError("Couldn’t load the questions. Check your connection and try again.");
    }
  }, []);

  useEffect(() => {
    const p = load();
    if (p) setPlayer(p);
    setScreen(p?.name ? "home" : "setup");
    fetchData();
  }, [fetchData]);

  const stories = useMemo(() => {
    const m = new Map<string, { story: string; testament: "OT" | "NT"; ref: string; count: number }>();
    for (const q of questions) {
      const e = m.get(q.story) ?? { story: q.story, testament: q.testament, ref: q.ref, count: 0 };
      e.count++;
      m.set(q.story, e);
    }
    return [...m.values()];
  }, [questions]);

  const persist = (p: Player) => {
    setPlayer(p);
    save(p);
  };

  const submitScore = async (p: Player) => {
    try {
      await saveScore({
        playerId: p.id,
        name: p.name,
        mascot: p.mascotEmoji,
        mascotColor: p.mascotColor,
        xp: p.xp,
        bestRound: p.bestRound,
        streak: p.streak,
        achievements: p.achievements,
        storiesCompleted: Object.values(p.storyCorrect).filter((n) => n >= STORY_DONE_AT).length,
      });
      setLeaders(await getLeaderboard());
    } catch {
      /* offline — progress still saved locally */
    }
  };

  // ---------- round flow ----------
  const start = () => {
    const seen = new Set(player.seen);
    const { questions: qs, recycled, poolIds } = pickRound(
      questions,
      { testament, difficulty, story: story || undefined },
      seen,
      ROUND_SIZE,
    );
    if (!qs.length) {
      setNotice("No questions in this mix yet — try another level or testament.");
      return;
    }
    if (recycled) {
      // forget this pool so the next cycle is fresh
      const pool = new Set(poolIds);
      persist({ ...player, seen: player.seen.filter((id) => !pool.has(id)) });
      setNotice("You’ve seen every question here — shuffling them for a new challenge!");
    } else setNotice(null);
    setRound(qs);
    setIdx(0);
    setPicked(null);
    setHearts(HEARTS);
    setCombo(0);
    setMaxCombo(0);
    setRoundXp(0);
    setCorrect(0);
    setScreen("play");
  };

  useEffect(() => {
    if (screen !== "play" || !cardRef.current) return;
    gsap.fromTo(cardRef.current, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
  }, [idx, screen]);

  const q = round[idx];
  const diffXp = DIFFICULTIES.find((d) => d.key === difficulty)?.xp ?? 10;

  const choose = (opt: string) => {
    if (picked || !q) return;
    setPicked(opt);
    const ok = opt === q.answer;
    const m = mascotRef.current;
    if (ok) {
      const c = combo + 1;
      setCombo(c);
      setMaxCombo((x) => Math.max(x, c));
      setCorrect((x) => x + 1);
      setRoundXp((x) => x + diffXp + (c >= 3 ? 5 : 0));
      if (m) gsap.fromTo(m, { y: 0, scale: 1 }, { y: -26, scale: 1.12, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" });
    } else {
      setCombo(0);
      setHearts((h) => h - 1);
      if (m) gsap.fromTo(m, { x: -10 }, { x: 10, duration: 0.07, repeat: 5, yoyo: true, clearProps: "x" });
    }
  };

  const finish = (finalCorrect: number, finalXp: number, answered: GameQuestion[]) => {
    const perfect = finalCorrect === round.length;
    const bonus = perfect ? 50 : 0;
    const storyCorrect = { ...player.storyCorrect };
    // Count correct answers per story from this round
    answered.forEach((aq) => {
      if ((aq as GameQuestion & { _ok?: boolean })._ok) storyCorrect[aq.story] = (storyCorrect[aq.story] ?? 0) + 1;
    });
    let next: Player = updateStreak({
      ...player,
      xp: player.xp + finalXp + bonus,
      seen: [...new Set([...player.seen, ...answered.map((a) => a.id)])].slice(-5000),
      storyCorrect,
      roundsPlayed: player.roundsPlayed + 1,
      bestRound: Math.max(player.bestRound, finalXp + bonus),
      correctTotal: player.correctTotal + finalCorrect,
      answeredTotal: player.answeredTotal + answered.length,
    });
    const ach = evaluateAchievements(next, { perfect, maxCombo, stories });
    next = { ...next, achievements: ach.achievements };
    setFreshAwards(ach.fresh);
    setRoundXp(finalXp + bonus);
    persist(next);
    submitScore(next);
    trackEvent("game_round");
    setScreen("results");
    if (finalCorrect > 0) setConfetti((c) => c + 1);
  };

  const answeredRef = useRef<GameQuestion[]>([]);
  useEffect(() => {
    if (screen === "play" && idx === 0) answeredRef.current = [];
  }, [screen, idx]);

  const next = () => {
    if (!q) return;
    const ok = picked === q.answer;
    answeredRef.current.push({ ...q, _ok: ok } as GameQuestion);
    const outOfHearts = !ok && hearts <= 0;
    if (idx + 1 >= round.length || outOfHearts) {
      finish(correct, roundXp, answeredRef.current);
      return;
    }
    setIdx(idx + 1);
    setPicked(null);
  };

  // ---------- rendering ----------
  const lv = level(player.xp);
  const currentMascot = mascots.find((m) => m.id === player.mascotId);

  if (screen === "loading") {
    return <div className="grid min-h-[50dvh] place-items-center text-black/50">Loading the game…</div>;
  }

  if (screen === "setup") {
    return (
      <SetupScreen
        player={player}
        mascots={mascots}
        onDone={(p) => {
          persist(p);
          setScreen("home");
          submitScore(p);
        }}
      />
    );
  }

  if (screen === "play" && q) {
    const isRight = picked === q.answer;
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setScreen("home")}
            className="grid h-10 w-10 place-items-center rounded-full text-xl text-black/50 hover:bg-black/5"
            aria-label="Quit round"
          >
            ✕
          </button>
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-black/10" role="progressbar" aria-valuenow={idx} aria-valuemax={round.length}>
            <div className="h-full rounded-full bg-[#58CC02] transition-all duration-500" style={{ width: `${(idx / round.length) * 100}%` }} />
          </div>
          <div className="text-lg font-bold text-rose-500" aria-label={`${hearts} hearts left`}>
            {"❤️".repeat(Math.max(0, hearts))}
            <span className="opacity-30">{"🤍".repeat(Math.max(0, HEARTS - hearts))}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Mascot innerRef={mascotRef} emoji={player.mascotEmoji} color={player.mascotColor} accessory={player.accessory} size={72} />
          <div className="relative rounded-3xl bg-white px-4 py-3 text-sm font-semibold shadow-soft ring-1 ring-black/5">
            {picked ? (isRight ? (combo >= 3 ? `${combo} in a row! 🔥` : "Great job! 🎉") : "Nice try — keep going! 💪") : `${q.story} • ${q.ref}`}
          </div>
          <div className="ml-auto text-right text-xs font-bold text-black/50">
            {idx + 1}/{round.length}
            <div className="text-base text-amber-500">+{roundXp} XP</div>
          </div>
        </div>

        <div ref={cardRef} className="mt-6">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-snug sm:text-3xl">{q.question}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {q.options.map((o, i) => {
              const state = !picked ? "idle" : o === q.answer ? "right" : o === picked ? "wrong" : "dim";
              return (
                <button
                  key={o + i}
                  type="button"
                  disabled={!!picked}
                  onClick={() => choose(o)}
                  className={cn(
                    "min-h-16 rounded-2xl border-2 border-b-4 px-4 py-3 text-left text-base font-semibold transition active:translate-y-0.5",
                    state === "idle" && "border-black/10 bg-white hover:bg-blueBrand-50",
                    state === "right" && "border-[#58A700] bg-[#D7FFB8] text-[#3C7A00]",
                    state === "wrong" && "border-rose-500 bg-rose-50 text-rose-700",
                    state === "dim" && "border-black/5 bg-white opacity-50",
                  )}
                >
                  <span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-lg border border-black/10 text-xs">{i + 1}</span>
                  {o}
                </button>
              );
            })}
          </div>
        </div>

        {picked ? (
          <div
            className={cn(
              "fixed inset-x-0 bottom-0 z-40 border-t-2 p-4 sm:p-6",
              isRight ? "border-[#58A700]/30 bg-[#D7FFB8]" : "border-rose-200 bg-rose-50",
            )}
          >
            <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3">
              <div>
                <div className={cn("text-xl font-extrabold", isRight ? "text-[#3C7A00]" : "text-rose-700")}>
                  {isRight ? "Correct!" : "Correct answer:"}
                </div>
                {!isRight ? <div className="font-semibold text-rose-700">{q.answer}</div> : null}
                <div className="text-xs text-black/50">Read it in {q.ref}</div>
              </div>
              <button
                type="button"
                autoFocus
                onClick={next}
                className={cn(
                  "rounded-2xl border-b-4 px-8 py-3 text-base font-extrabold uppercase tracking-wide text-white",
                  isRight ? "border-[#58A700] bg-[#58CC02]" : "border-rose-700 bg-rose-500",
                )}
              >
                {(!isRight && hearts <= 0) || idx + 1 >= round.length ? "Finish" : "Continue"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (screen === "results") {
    return (
      <div className="mx-auto max-w-xl text-center">
        <Confetti fire={confetti} />
        <Mascot emoji={player.mascotEmoji} color={player.mascotColor} accessory={player.accessory} size={120} className="mx-auto" />
        <h2 className="mt-6 font-[family-name:var(--font-heading)] text-4xl">
          {correct === round.length ? "Perfect round!" : correct >= round.length / 2 ? "Well done!" : "Keep practising!"}
        </h2>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="XP earned" value={`+${roundXp}`} tone="#F59E0B" />
          <Stat label="Correct" value={`${correct}/${round.length}`} tone="#58CC02" />
          <Stat label="Best combo" value={`${maxCombo}`} tone="#EF4444" />
        </div>
        {freshAwards.length ? (
          <div className="mt-6 rounded-3xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <div className="font-bold">New achievements!</div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {freshAwards.map((a) => {
                const d = ACHIEVEMENTS.find((x) => x.id === a);
                return (
                  <span key={a} className="rounded-full bg-white px-3 py-1 text-sm font-semibold shadow-soft">
                    {d?.icon} {d?.label}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <BigButton onClick={start}>Play again</BigButton>
          <BigButton variant="secondary" onClick={() => { setScreen("home"); setTab("leaderboard"); }}>
            Leaderboard
          </BigButton>
          <BigButton variant="secondary" onClick={() => setScreen("home")}>Home</BigButton>
        </div>
      </div>
    );
  }

  // ---------- home ----------
  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="grid content-start gap-4">
        <div className="rounded-[2rem] bg-white p-5 text-center shadow-soft ring-1 ring-black/5">
          <Mascot emoji={player.mascotEmoji} color={player.mascotColor} accessory={player.accessory} size={96} className="mx-auto" />
          <div className="mt-3 font-[family-name:var(--font-heading)] text-2xl">{player.name}</div>
          <div className="text-xs text-black/50">{currentMascot?.name ?? "Your mascot"}</div>
          <button type="button" className="mt-2 text-xs font-semibold text-blueBrand-700 underline" onClick={() => setScreen("setup")}>
            Edit name & mascot
          </button>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Stat label="Streak" value={`🔥 ${player.streak}`} tone="#F97316" small />
            <Stat label="XP" value={`${player.xp}`} tone="#F59E0B" small />
            <Stat label="Level" value={`${lv.level}`} tone="#2563EB" small />
          </div>
          <div className="mt-4 text-left text-xs font-semibold text-black/50">
            Level {lv.level} → {lv.level + 1} · {lv.toNext} XP to go
          </div>
          <div className="mt-1 h-3 overflow-hidden rounded-full bg-black/10">
            <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.round(lv.progress * 100)}%` }} />
          </div>
        </div>
      </aside>

      <div>
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
          {(["play", "leaderboard", "progress", "awards"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-bold capitalize ring-1 ring-black/10",
                tab === t ? "bg-ink-950 text-white" : "bg-white hover:bg-blueBrand-50",
              )}
            >
              {t === "awards" ? "Achievements" : t}
            </button>
          ))}
        </div>

        {loadError ? (
          <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
            {loadError} <button className="underline" onClick={fetchData}>Retry</button>
          </div>
        ) : null}

        {tab === "play" ? (
          <div className="mt-5 grid gap-5">
            <Section title="1. Choose the Testament">
              <div className="flex flex-wrap gap-2">
                {([["ALL", "Whole Bible 📖"], ["OT", "Old Testament 📜"], ["NT", "New Testament ✝️"]] as const).map(([k, l]) => (
                  <Chip key={k} active={testament === k} onClick={() => { setTestament(k); setStory(""); }}>{l}</Chip>
                ))}
              </div>
            </Section>
            <Section title="2. Pick a level">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {DIFFICULTIES.map((d) => {
                  const locked = player.xp < d.unlockXp;
                  const count = questions.filter((x) => x.difficulty === d.key && (testament === "ALL" || x.testament === testament)).length;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      disabled={locked}
                      onClick={() => setDifficulty(d.key)}
                      className={cn(
                        "rounded-3xl border-2 border-b-4 p-4 text-left transition",
                        difficulty === d.key ? "border-ink-950" : "border-black/10",
                        locked ? "cursor-not-allowed bg-black/5 opacity-60" : "bg-white hover:-translate-y-0.5",
                      )}
                    >
                      <div className="text-lg font-extrabold" style={{ color: d.color }}>{locked ? "🔒 " : ""}{d.label}</div>
                      <div className="text-xs text-black/50">{locked ? `Unlocks at ${d.unlockXp} XP` : `${count} questions · ${d.xp} XP each`}</div>
                    </button>
                  );
                })}
              </div>
            </Section>
            <Section title="3. Focus on a story (optional)">
              <select
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-black/10"
                aria-label="Story"
              >
                <option value="">Mix of stories</option>
                {stories
                  .filter((s) => testament === "ALL" || s.testament === testament)
                  .map((s) => (
                    <option key={s.story} value={s.story}>
                      {s.testament === "OT" ? "📜" : "✝️"} {s.story} ({s.ref})
                    </option>
                  ))}
              </select>
            </Section>
            {notice ? <div className="rounded-2xl bg-blueBrand-50 p-3 text-sm">{notice}</div> : null}
            <BigButton onClick={start} disabled={!questions.length}>Start round ▶</BigButton>
          </div>
        ) : null}

        {tab === "leaderboard" ? (
          <ol className="mt-5 grid gap-2">
            {leaders.length === 0 ? <li className="text-sm text-black/50">No scores yet — be the first!</li> : null}
            {leaders.map((r, i) => (
              <li
                key={r.id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/5",
                  r.id === player.id && "ring-2 ring-[#58CC02]",
                )}
              >
                <span className="w-8 text-center text-lg font-extrabold text-black/60">{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</span>
                <Mascot emoji={r.mascot} color={r.mascotColor} accessory="none" size={40} className="ring-2" />
                <span className="flex-1">
                  <span className="block font-bold">{r.name}{r.id === player.id ? " (you)" : ""}</span>
                  <span className="block text-xs text-black/50">🔥 {r.streak} day streak · {r.achievements.length} badges</span>
                </span>
                <span className="font-extrabold text-amber-500">{r.xp} XP</span>
              </li>
            ))}
          </ol>
        ) : null}

        {tab === "progress" ? (
          <div className="mt-5 grid gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Rounds" value={`${player.roundsPlayed}`} tone="#2563EB" />
              <Stat label="Accuracy" value={player.answeredTotal ? `${Math.round((player.correctTotal / player.answeredTotal) * 100)}%` : "—"} tone="#58CC02" />
              <Stat label="Best round" value={`${player.bestRound} XP`} tone="#F59E0B" />
              <Stat label="Questions seen" value={`${player.seen.length}`} tone="#8B5CF6" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {stories.map((s) => {
                const n = player.storyCorrect[s.story] ?? 0;
                const pct = Math.min(1, n / STORY_DONE_AT);
                return (
                  <div key={s.story} className="rounded-2xl bg-white p-3 ring-1 ring-black/5">
                    <div className="flex items-center justify-between gap-2 text-sm font-semibold">
                      <span>{s.testament === "OT" ? "📜" : "✝️"} {s.story}</span>
                      <span>{pct >= 1 ? "✅" : `${n}/${STORY_DONE_AT}`}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
                      <div className="h-full rounded-full bg-[#58CC02]" style={{ width: `${pct * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {tab === "awards" ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ACHIEVEMENTS.map((a) => {
              const has = player.achievements.includes(a.id);
              return (
                <div key={a.id} className={cn("rounded-3xl p-4 text-center ring-1 ring-black/5", has ? "bg-amber-50" : "bg-white opacity-50 grayscale")}>
                  <div className="text-4xl">{a.icon}</div>
                  <div className="mt-2 font-bold">{a.label}</div>
                  <div className="text-xs text-black/60">{a.desc}</div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SetupScreen({
  player,
  mascots,
  onDone,
}: {
  player: Player;
  mascots: GameMascot[];
  onDone: (p: Player) => void;
}) {
  const [draft, setDraft] = useState<Player>(player);
  const previewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (previewRef.current) gsap.fromTo(previewRef.current, { rotate: -8, scale: 0.9 }, { rotate: 0, scale: 1, duration: 0.5, ease: "back.out(3)" });
  }, [draft.mascotId, draft.mascotColor, draft.accessory]);

  return (
    <form
      className="mx-auto grid max-w-3xl gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (draft.name.trim()) onDone({ ...draft, name: draft.name.trim().slice(0, 24) });
      }}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <Mascot innerRef={previewRef} emoji={draft.mascotEmoji} color={draft.mascotColor} accessory={draft.accessory} size={140} />
        <h2 className="font-[family-name:var(--font-heading)] text-3xl">Make your Bible buddy</h2>
        <p className="text-sm text-black/60">No sign-up needed — your progress saves on this device.</p>
      </div>

      <Section title="Your name">
        <input
          required
          maxLength={24}
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="e.g. Ama"
          className="w-full rounded-2xl bg-white px-4 py-3 text-lg font-semibold ring-1 ring-black/10"
          aria-label="Your name"
        />
      </Section>

      <Section title="Choose a mascot">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {mascots.map((m) => {
            const locked = draft.xp < m.unlockXp;
            return (
              <button
                key={m.id}
                type="button"
                disabled={locked}
                title={locked ? `Unlocks at ${m.unlockXp} XP` : m.name}
                onClick={() => setDraft({ ...draft, mascotId: m.id, mascotEmoji: m.emoji })}
                className={cn(
                  "grid place-items-center gap-1 rounded-3xl border-2 p-3 text-xs font-semibold",
                  draft.mascotId === m.id ? "border-ink-950 bg-white" : "border-black/10 bg-white",
                  locked && "opacity-40",
                )}
              >
                <span className="text-4xl">{locked ? "🔒" : m.emoji}</span>
                <span className="line-clamp-1">{m.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Colour">
        <div className="flex flex-wrap gap-3">
          {MASCOT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Colour ${c}`}
              onClick={() => setDraft({ ...draft, mascotColor: c })}
              className={cn("h-11 w-11 rounded-full ring-1 ring-black/10", draft.mascotColor === c && "ring-4 ring-ink-950")}
              style={{ background: c }}
            />
          ))}
        </div>
      </Section>

      <Section title="Outfit">
        <div className="flex flex-wrap gap-2">
          {ACCESSORIES.map((a) => (
            <Chip key={a.id} active={draft.accessory === a.id} onClick={() => setDraft({ ...draft, accessory: a.id })}>
              {a.glyph} {a.label}
            </Chip>
          ))}
        </div>
      </Section>

      <BigButton type="submit">Let’s play!</BigButton>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wider text-black/50">{title}</h3>
      {children}
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-2xl border-2 border-b-4 px-4 py-2 text-sm font-bold",
        active ? "border-ink-950 bg-ink-950 text-white" : "border-black/10 bg-white hover:bg-blueBrand-50",
      )}
    >
      {children}
    </button>
  );
}

function BigButton({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  return (
    <button
      {...props}
      className={cn(
        "rounded-2xl border-b-4 px-8 py-4 text-base font-extrabold uppercase tracking-wide transition active:translate-y-0.5 disabled:opacity-50",
        variant === "primary" ? "border-[#58A700] bg-[#58CC02] text-white hover:brightness-105" : "border-black/15 bg-white text-ink-950 ring-1 ring-black/10",
        className,
      )}
    />
  );
}

function Stat({ label, value, tone, small }: { label: string; value: string; tone: string; small?: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-black/5">
      <div className={cn("font-extrabold", small ? "text-base" : "text-2xl")} style={{ color: tone }}>{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-black/45">{label}</div>
    </div>
  );
}
