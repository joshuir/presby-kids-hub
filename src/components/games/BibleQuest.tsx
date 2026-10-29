"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { BookOpen, Check, Crown, Flame, Heart, Lock, Star, Trophy, X, Zap } from "lucide-react";
import { getLeaderboard, getPublic, submitScore as saveScore } from "@/lib/cms/client";
import type { UnitDoc } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { Dropdown } from "@/components/ui/Dropdown";
import {
  ACCESSORIES,
  ACHIEVEMENTS,
  MASCOT_COLORS,
  STORY_DONE_AT,
  evaluateAchievements,
  level,
  newPlayer,
  updateStreak,
  type GameMascot,
  type GameQuestion,
  type LeaderRow,
  type Player,
} from "./game-logic";
import { NODE_LABEL, NODE_XP, PASS_MARK, buildLesson, pathState, type LessonQ, type NodeKind } from "./path";
import { Buddy, Mascot, useMascotDoc, type Mood } from "./Mascot";

const LS_KEY = "cm_player_v1";
const HEARTS = 5;

const CHEERS = ["Excellent!", "Amazing!", "You got it!", "Brilliant!", "Great job!", "Well done!"];
const ENCOURAGE = ["Nearly! Keep going.", "That's okay — try the next one!", "Good try! You'll get it.", "Don't give up!"];

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

/* ------------------------------------------------------------------ setup */

function Setup({ mascots, initial, onDone, onCancel }: { mascots: GameMascot[]; initial: Player; onDone: (p: Player) => void; onCancel?: () => void }) {
  const [name, setName] = useState(initial.name);
  const [m, setM] = useState(mascots.find((x) => x.id === initial.mascotId) ?? mascots[0]);
  const [color, setColor] = useState(initial.mascotColor);
  const [acc, setAcc] = useState(initial.accessory);
  const free = mascots.filter((x) => x.unlockXp <= initial.xp);
  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-6 sm:p-8">
        <h2 className="font-display text-3xl font-extrabold">{initial.name ? "Change your mascot" : "Choose your mascot"}</h2>
        <p className="mt-1 text-ink/60">Pick a nickname (not your full name) and a friend to cheer you on.</p>
        <div className="mt-6 flex justify-center">{m ? <Mascot emoji={m.emoji} color={color} accessory={acc} mood="wave" size={120} say={name ? `Hi ${name}! I'm ${m.name.split(" ")[0]}.` : `Hi there! I'm ${m.name.split(" ")[0]}.`} /> : null}</div>
        <label className="mt-6 grid gap-1.5 text-sm font-bold">
          Your name
          <input aria-label="Your name" value={name} maxLength={20} onChange={(e) => setName(e.target.value.replace(/[<>]/g, ""))} placeholder="e.g. Kofi" className="h-12 rounded-2xl bg-paper px-4 text-base outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-blueBrand-500" />
        </label>
        <div className="mt-5 text-sm font-bold">Mascot</div>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {mascots.map((x) => {
            const locked = x.unlockXp > initial.xp;
            return (
              <button
                key={x.id}
                type="button"
                title={x.name}
                aria-label={locked ? `${x.name} (unlocks at ${x.unlockXp} XP)` : x.name}
                disabled={locked}
                onClick={() => {
                  setM(x);
                  setColor(x.color);
                }}
                className={cn("relative grid aspect-square place-items-center rounded-2xl transition", m?.id === x.id ? "bg-blueBrand-600 shadow-[0_4px_0_#173EA8]" : "bg-paper hover:bg-sky-soft", locked && "opacity-40 grayscale")}
              >
                <Buddy kind={(x as { kind?: Parameters<typeof Buddy>[0]["kind"] }).kind ?? "lion"} color={x.color} accent={(x as { accent?: string }).accent} size={58} look={false} mood={m?.id === x.id ? "happy" : "idle"} />
                {locked ? <span className="absolute bottom-1 text-[10px] font-extrabold text-ink">{x.unlockXp} XP</span> : null}
              </button>
            );
          })}
        </div>
        <div className="mt-5 text-sm font-bold">Colour</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {MASCOT_COLORS.map((c) => (
            <button key={c} type="button" aria-label={`Colour ${c}`} aria-pressed={color === c} onClick={() => setColor(c)} className={cn("h-10 w-10 rounded-full ring-2 ring-offset-2 transition", color === c ? "ring-ink" : "ring-transparent")} style={{ background: c }} />
          ))}
        </div>
        <div className="mt-5 text-sm font-bold">Accessory</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {ACCESSORIES.map((a) => (
            <button key={a.id} type="button" aria-pressed={acc === a.id} onClick={() => setAcc(a.id)} className={cn("h-11 min-w-11 rounded-xl px-3 text-xl font-bold", acc === a.id ? "bg-ink text-white" : "bg-paper")}>
              {a.glyph || <span className="text-xs">None</span>}
            </button>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!name.trim() || !m}
            className="btn btn-primary"
            onClick={() => onDone({ ...initial, name: name.trim(), mascotId: m!.id, mascotEmoji: m!.emoji, mascotColor: color, accessory: acc })}
          >
            Let’s play!
          </button>
          {onCancel ? <button type="button" onClick={onCancel} className="btn btn-ghost">Cancel</button> : null}
        </div>
        {!free.length ? null : <p className="mt-4 text-xs text-ink/45">Earn XP to unlock more mascots.</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ path */

const OFFSETS = [0, 52, 72, 52, 0, -52, -72, -52];

function PathView({ units, player, onStart }: { units: UnitDoc[]; player: Player; onStart: (u: UnitDoc, k: NodeKind) => void }) {
  const state = pathState(units, player);
  const [guide, setGuide] = useState<string | null>(null);
  const currentRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);
  const currentId = state.flatMap((s) => (s.unlocked ? s.nodes : [])).find((x) => x.state === "current")?.id;
  const currentUnit = state.find((s) => s.nodes.some((n) => n.id === currentId))?.unit.id ?? state[0]?.unit.id ?? "";
  const [jump, setJump] = useState(currentUnit);
  const tLabel = (t: UnitDoc["testament"]) => (t === "OT" ? "Old Testament" : t === "NT" ? "New Testament" : "Whole Bible");
  return (
    <div className="grid gap-10">
      {state.length > 1 ? (
        <div className="sticky top-[76px] z-20 -mx-2 -mb-4 rounded-2xl bg-cream/90 px-2 py-2 backdrop-blur-md">
          <Dropdown
            label="Jump to a unit"
            hideLabel
            testId="unit-jump"
            className="w-full sm:w-80"
            value={jump}
            onChange={(id) => {
              setJump(id);
              document.getElementById(`unit-sec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            options={state.map(({ unit: u, unlocked, complete, nodes }, ui) => ({
              value: u.id,
              label: `${ui + 1}. ${u.title}`,
              icon: u.icon,
              group: tLabel(u.testament),
              hint: complete ? "Complete ✓" : !unlocked ? "Locked — finish the unit before" : `${nodes.filter((n) => n.state === "done").length}/${nodes.length} levels done · ${u.stories.length} ${u.stories.length === 1 ? "story" : "stories"}`,
            }))}
          />
        </div>
      ) : null}
      {state.map(({ unit: u, unlocked, complete, nodes }, ui) => (
        <section key={u.id} id={`unit-sec-${u.id}`} className="scroll-mt-40" aria-labelledby={`unit-${u.id}`}>
          <div className="flex items-stretch overflow-hidden rounded-2xl text-white shadow-[0_5px_0_rgba(0,0,0,.18)]" style={{ background: unlocked ? u.color : "#A8A29E" }}>
            <div className="flex-1 p-4 sm:p-5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-white/80">Unit {ui + 1} · {u.testament === "Both" ? "Whole Bible" : u.testament === "OT" ? "Old Testament" : "New Testament"}</div>
              <h3 id={`unit-${u.id}`} className="mt-0.5 font-display text-2xl font-extrabold">{u.icon} {u.title}</h3>
              <p className="text-sm text-white/85">{u.description}</p>
            </div>
            <button type="button" onClick={() => setGuide(guide === u.id ? null : u.id)} aria-expanded={guide === u.id} className="grid w-16 place-items-center border-l-2 border-black/10 hover:bg-black/10" aria-label={`Stories in ${u.title}`}>
              <BookOpen className="h-6 w-6" aria-hidden />
            </button>
          </div>
          <AnimatePresence>
            {guide === u.id ? (
              <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 grid gap-1 overflow-hidden rounded-2xl bg-white p-3 text-sm ring-1 ring-ink/10">
                {(u.stories.length ? u.stories : ["Stories from the " + (u.testament === "OT" ? "Old" : "New") + " Testament"]).map((s) => {
                  const n = player.storyCorrect[s] ?? 0;
                  return (
                    <li key={s} className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{s}</span>
                      <span className={cn("text-xs font-bold", n >= STORY_DONE_AT ? "text-[#15803D]" : "text-ink/45")}>{n >= STORY_DONE_AT ? "Mastered ✓" : `${n}/${STORY_DONE_AT}`}</span>
                    </li>
                  );
                })}
              </motion.ul>
            ) : null}
          </AnimatePresence>
          <ol className="relative mt-6 flex flex-col items-center gap-5">
            {nodes.map((n, i) => {
              const isCurrent = n.id === currentId;
              const locked = n.state === "locked" || !unlocked;
              const Icon = n.kind === "challenge" ? Trophy : n.state === "done" ? Check : Star;
              return (
                <li key={n.id} className="relative" style={{ transform: `translateX(${OFFSETS[(i + ui * 3) % OFFSETS.length]}px)` }}>
                  {isCurrent ? (
                    <div className={cn("pointer-events-none absolute top-1/2 z-10 -translate-y-1/2", OFFSETS[(i + ui * 3) % OFFSETS.length] > 0 ? "right-[calc(100%+14px)]" : "left-[calc(100%+14px)]")} aria-hidden>
                      <Mascot emoji={player.mascotEmoji} color={player.mascotColor} accessory={player.accessory} mood="wave" size={70} />
                    </div>
                  ) : null}
                  {isCurrent ? (
                    <motion.div initial={{ y: 4 }} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.4 }} className="absolute -top-11 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl border-2 border-ink/10 bg-white px-3 py-1.5 text-sm font-extrabold uppercase" style={{ color: u.color }}>
                      {player.path?.[n.id] ? "Practise" : "Start"}
                    </motion.div>
                  ) : null}
                  <button
                    ref={isCurrent ? currentRef : undefined}
                    type="button"
                    disabled={locked}
                    onClick={() => onStart(u, n.kind)}
                    aria-label={`${u.title}: ${NODE_LABEL[n.kind]}${n.state === "done" ? ` — completed, best ${n.best}%` : locked ? " — locked" : ""}`}
                    className={cn(
                      "relative grid place-items-center rounded-full text-white transition active:translate-y-1",
                      n.kind === "challenge" ? "h-20 w-20" : "h-[72px] w-[72px]",
                      locked && "cursor-not-allowed",
                      isCurrent && "ring-8 ring-offset-0",
                    )}
                    style={{
                      background: locked ? "#E5E5E5" : n.state === "done" ? "#FFC53D" : u.color,
                      boxShadow: `0 6px 0 ${locked ? "#C4C4C4" : n.state === "done" ? "#D99A12" : "rgba(0,0,0,.25)"}`,
                      ["--tw-ring-color" as string]: isCurrent ? `${u.color}33` : undefined,
                    }}
                  >
                    {locked ? <Lock className="h-7 w-7 text-[#AFAFAF]" aria-hidden /> : <Icon className="h-8 w-8" aria-hidden />}
                  </button>
                  <div className="mt-2 text-center text-xs font-extrabold text-ink/50">{NODE_LABEL[n.kind]}</div>
                </li>
              );
            })}
            {complete ? <li className="text-sm font-extrabold text-[#15803D]">Unit complete! 🎉</li> : null}
          </ol>
        </section>
      ))}
    </div>
  );
}

function ResultMascot({ player, passed }: { player: Player; passed: boolean }) {
  const doc = useMascotDoc(player.mascotEmoji);
  return (
    <Mascot
      emoji={player.mascotEmoji}
      color={player.mascotColor}
      accessory={player.accessory}
      mood={passed ? "cheer" : "sad"}
      size={130}
      say={passed ? doc?.catchphrase || "Well done!" : "Let's try again together!"}
    />
  );
}

/* ------------------------------------------------------------------ lesson */

type LessonResult = { correct: number; total: number; xp: number; seconds: number; maxCombo: number; answered: LessonQ[]; failed: boolean };

function Lesson({ player, unit, kind, questions, onExit, onFinish }: { player: Player; unit: UnitDoc; kind: NodeKind; questions: LessonQ[]; onExit: () => void; onFinish: (r: LessonResult) => void }) {
  const [queue, setQueue] = useState<LessonQ[]>(questions);
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [hearts, setHearts] = useState(HEARTS);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [mood, setMood] = useState<Mood>("think");
  const [say, setSay] = useState<string | undefined>(undefined);
  const answered = useRef<LessonQ[]>([]);
  const [started] = useState(() => Date.now());
  const firstTry = useRef(new Set<string>());
  const q = queue[pos];
  const progress = pos / queue.length;

  const check = useCallback(() => {
    if (!picked || checked !== null || !q) return;
    const ok = picked === q.correct;
    setChecked(ok);
    answered.current.push(q);
    if (ok) {
      if (!q.retry) {
        setCorrect((c) => c + 1);
        firstTry.current.add(q.id);
      }
      const c = combo + 1;
      setCombo(c);
      setMaxCombo((m) => Math.max(m, c));
      setMood(c >= 3 ? "cheer" : "happy");
      setSay(c >= 3 ? `${c} in a row! 🔥` : CHEERS[Math.floor(Math.random() * CHEERS.length)]);
    } else {
      setCombo(0);
      setHearts((h) => h - 1);
      setMood("sad");
      setSay(ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]);
      // Duolingo-style: a missed question comes back at the end
      if (!q.retry) setQueue((qs) => [...qs, { ...q, retry: true }]);
    }
  }, [picked, checked, q, combo]);

  const next = useCallback(() => {
    const total = questions.length;
    const out = hearts <= 0;
    if (out || pos + 1 >= queue.length) {
      const pct = Math.round((correct / total) * 100);
      onFinish({ correct, total, xp: out ? 0 : Math.round((NODE_XP[kind] * correct) / 2) + (pct === 100 ? 10 : 0), seconds: Math.round((Date.now() - started) / 1000), maxCombo, answered: answered.current, failed: out });
      return;
    }
    setPos((p) => p + 1);
    setPicked(null);
    setChecked(null);
    setMood("think");
    setSay(undefined);
  }, [hearts, pos, queue.length, correct, questions.length, kind, maxCombo, onFinish, started]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (!q) return;
      if (e.key === "Enter") {
        e.preventDefault();
        if (checked === null) check();
        else next();
      }
      const n = Number(e.key);
      if (checked === null && n >= 1 && n <= q.choices.length) setPicked(q.choices[n - 1]);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [q, checked, check, next]);

  if (!q) return null;
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-2xl flex-col">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onExit} aria-label="Quit lesson" className="grid h-10 w-10 place-items-center rounded-full text-ink/50 hover:bg-paper"><X className="h-6 w-6" aria-hidden /></button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Lesson progress">
          <motion.div className="h-full rounded-full" style={{ background: unit.color }} animate={{ width: `${Math.max(4, progress * 100)}%` }} transition={{ type: "spring", stiffness: 120, damping: 18 }}>
            <div className="mx-2 mt-1 h-1 rounded-full bg-white/40" />
          </motion.div>
        </div>
        <div className="flex items-center gap-1 font-extrabold text-[#E11D48]" aria-label={`${hearts} hearts left`}><Heart className="h-6 w-6 fill-current" aria-hidden />{hearts}</div>
      </div>

      <div className="mt-6 flex-1">
        {q.retry ? <div className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#C2410C]">↻ Previous mistake</div> : null}
        <div className="text-xs font-extrabold uppercase tracking-wider" style={{ color: unit.color }}>{unit.icon} {q.story} · {q.ref}</div>
        <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{q.prompt}</h2>
        <div className="mt-5">
          <Mascot emoji={player.mascotEmoji} color={player.mascotColor} accessory={player.accessory} mood={mood} size={84} say={say ?? (q.type === "choice" ? q.question : q.type === "truefalse" ? `${q.question} — “${q.claim}”` : `“${q.question} — ${q.claim}”`)} />
        </div>
        <div className={cn("mt-6 grid gap-3", q.type === "truefalse" ? "grid-cols-2" : "sm:grid-cols-2")} role="radiogroup" aria-label="Answers">
          {q.choices.map((c, i) => {
            const isPicked = picked === c;
            const isRight = checked !== null && c === q.correct;
            const isWrong = checked === false && isPicked;
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={isPicked}
                disabled={checked !== null}
                onClick={() => setPicked(c)}
                className={cn(
                  "flex min-h-16 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-base font-bold transition active:translate-y-0.5",
                  isRight ? "border-[#58CC02] bg-[#D7FFB8] text-[#3C8C00]" : isWrong ? "border-[#EA2B2B] bg-[#FFDFE0] text-[#B91C1C]" : isPicked ? "border-blueBrand-400 bg-sky-soft text-blueBrand-800" : "border-ink/10 bg-white hover:bg-paper",
                )}
                style={{ boxShadow: `0 4px 0 ${isRight ? "#58CC02" : isWrong ? "#EA2B2B" : isPicked ? "#93C5FD" : "rgba(11,21,48,.1)"}` }}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 border-current text-xs opacity-60">{i + 1}</span>
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {checked === null ? (
          <motion.div key="check" className="mt-8 border-t-2 border-ink/5 pt-5">
            <button type="button" disabled={!picked} onClick={check} className="btn w-full !py-4 text-base disabled:bg-ink/10 disabled:text-ink/35 disabled:shadow-none" style={picked ? { background: "#58CC02", color: "#fff", boxShadow: "0 4px 0 #46A302" } : undefined}>
              Check
            </button>
          </motion.div>
        ) : (
          <motion.div key="fb" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={cn("-mx-4 mt-8 rounded-t-3xl p-5 sm:mx-0 sm:rounded-3xl", checked ? "bg-[#D7FFB8]" : "bg-[#FFDFE0]")} role="alert">
            <div className={cn("flex items-center gap-2 font-display text-2xl font-extrabold", checked ? "text-[#3C8C00]" : "text-[#B91C1C]")}>
              {checked ? <Check className="h-7 w-7" aria-hidden /> : <X className="h-7 w-7" aria-hidden />}
              {checked ? CHEERS[pos % CHEERS.length] : "Not quite"}
            </div>
            {!checked ? (
              <p className="mt-1 font-bold text-[#B91C1C]">
                Correct answer: <span className="font-extrabold">{q.correct}</span>
                {q.type === "truefalse" ? <span className="block text-sm font-semibold">The answer is “{q.answer}”.</span> : null}
              </p>
            ) : null}
            {q.explain ? <p className="mt-1 text-sm font-semibold text-ink/70">{q.explain}</p> : <p className="mt-1 text-sm font-semibold text-ink/60">{q.ref}</p>}
            <button type="button" autoFocus onClick={next} className="btn mt-4 w-full !py-4 text-base text-white" style={{ background: checked ? "#58CC02" : "#EA2B2B", boxShadow: `0 4px 0 ${checked ? "#46A302" : "#B91C1C"}` }}>
              {hearts <= 0 ? "See results" : pos + 1 >= queue.length ? "Finish" : "Continue"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ results */

function Results({ r, player, unit, kind, fresh, onContinue, onRetry }: { r: LessonResult; player: Player; unit: UnitDoc; kind: NodeKind; fresh: string[]; onContinue: () => void; onRetry: () => void }) {
  const pct = Math.round((r.correct / r.total) * 100);
  const passed = !r.failed && pct >= PASS_MARK;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!passed || !ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    const bits = Array.from({ length: 36 }, (_, i) => {
      const d = document.createElement("span");
      d.className = "pointer-events-none absolute left-1/2 top-24 h-3 w-2 rounded-sm";
      d.style.background = ["#58CC02", "#FFC53D", "#2563EB", "#FF7A59", "#A78BFA"][i % 5];
      el.appendChild(d);
      return d;
    });
    const tl = gsap.timeline();
    bits.forEach((b) => {
      tl.fromTo(b, { x: 0, y: 0, rotate: 0, opacity: 1 }, { x: gsap.utils.random(-260, 260), y: gsap.utils.random(120, 420), rotate: gsap.utils.random(-540, 540), opacity: 0, duration: gsap.utils.random(1.2, 2.2), ease: "power2.out" }, 0);
    });
    return () => {
      tl.kill();
      bits.forEach((b) => b.remove());
    };
  }, [passed]);
  const mm = `${Math.floor(r.seconds / 60)}:${String(r.seconds % 60).padStart(2, "0")}`;
  return (
    <div ref={ref} className="relative mx-auto max-w-xl overflow-hidden text-center">
      <div className="flex justify-center pt-4">
        <ResultMascot player={player} passed={passed} />
      </div>
      <h2 className={cn("mt-6 font-display text-4xl font-extrabold", passed ? "text-[#E5A300]" : "text-[#B91C1C]")}>
        {r.failed ? "Out of hearts!" : passed ? `${NODE_LABEL[kind]} complete!` : "So close!"}
      </h2>
      <p className="mt-1 text-ink/60">{passed ? `${unit.icon} ${unit.title}` : `Get ${PASS_MARK}% to unlock the next level — you can do it!`}</p>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          ["Total XP", `${r.xp}`, Zap, "#FFC53D"],
          [pct >= 90 ? "Amazing" : pct >= 60 ? "Great" : "Accuracy", `${pct}%`, Star, "#58CC02"],
          ["Time", mm, Flame, "#1CB0F6"],
        ].map(([l, v, I, c]) => {
          const Icon = I as typeof Zap;
          return (
            <div key={l as string} className="overflow-hidden rounded-2xl border-2" style={{ borderColor: c as string }}>
              <div className="py-1 text-[11px] font-extrabold uppercase text-white" style={{ background: c as string }}>{l as string}</div>
              <div className="flex items-center justify-center gap-1 py-3 font-display text-xl font-extrabold" style={{ color: c as string }}><Icon className="h-5 w-5" aria-hidden />{v as string}</div>
            </div>
          );
        })}
      </div>
      {fresh.length ? (
        <div className="mt-6 rounded-2xl bg-sun-soft p-4">
          <div className="text-sm font-extrabold">New badge{fresh.length > 1 ? "s" : ""}!</div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {fresh.map((id) => {
              const a = ACHIEVEMENTS.find((x) => x.id === id);
              return a ? <span key={id} className="rounded-full bg-white px-3 py-1.5 text-sm font-bold shadow-soft">{a.icon} {a.label}</span> : null;
            })}
          </div>
        </div>
      ) : null}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={onRetry} className="btn btn-ghost">{passed ? "Practise again" : "Try again"}</button>
        <button type="button" onClick={onContinue} className="btn text-white" style={{ background: "#1CB0F6", boxShadow: "0 4px 0 #1899D6" }}>Continue</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ main */

type Tab = "learn" | "leaderboard" | "badges";

export function BibleQuest() {
  const [questions, setQuestions] = useState<GameQuestion[] | null>(null);
  const [units, setUnits] = useState<UnitDoc[]>([]);
  const [mascots, setMascots] = useState<GameMascot[]>([]);
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<Tab>("learn");
  const [lesson, setLesson] = useState<{ unit: UnitDoc; kind: NodeKind; qs: LessonQ[] } | null>(null);
  const [result, setResult] = useState<{ r: LessonResult; fresh: string[] } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setPlayer(load());
    setReady(true);
    Promise.all([getPublic("questions"), getPublic("units"), getPublic("mascots")])
      .then(([q, u, m]) => {
        setQuestions(q as GameQuestion[]);
        setUnits([...u].sort((a, b) => a.order - b.order));
        setMascots([...m].sort((a, b) => a.unlockXp - b.unlockXp) as GameMascot[]);
      })
      .catch((e) => setError((e as Error).message));
    getLeaderboard().then(setLeaders).catch(() => {});
  }, []);

  const persist = (p: Player) => {
    setPlayer(p);
    save(p);
  };

  const submit = async (p: Player) => {
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

  const start = (unit: UnitDoc, kind: NodeKind) => {
    if (!questions || !player) return;
    const qs = buildLesson(questions, unit, kind, new Set(player.seen));
    if (!qs.length) {
      setError("No questions in this unit yet — ask a teacher to add some in the CMS.");
      return;
    }
    setResult(null);
    setLesson({ unit, kind, qs });
    window.scrollTo({ top: 0 });
  };

  const finish = (r: LessonResult) => {
    if (!player || !lesson) return;
    const { unit, kind } = lesson;
    const pct = Math.round((r.correct / r.total) * 100);
    let p = updateStreak(player);
    const storyCorrect = { ...p.storyCorrect };
    r.answered.filter((q) => !q.retry).forEach((q) => {
      storyCorrect[q.story] = (storyCorrect[q.story] ?? 0) + 1;
    });
    const id = `${unit.id}:${kind}`;
    const path = { ...(p.path ?? {}) };
    if (!r.failed) path[id] = Math.max(path[id] ?? 0, pct);
    p = {
      ...p,
      xp: p.xp + r.xp,
      seen: Array.from(new Set([...p.seen, ...r.answered.map((q) => q.id)])).slice(-2000),
      storyCorrect,
      path,
      bestRound: Math.max(p.bestRound, r.correct),
      roundsPlayed: p.roundsPlayed + 1,
      correctTotal: p.correctTotal + r.correct,
      answeredTotal: p.answeredTotal + r.total,
    };
    const stories = Array.from(new Map((questions ?? []).map((q) => [q.story, { story: q.story, testament: q.testament }])).values());
    const ev = evaluateAchievements(p, { perfect: pct === 100 && !r.failed, maxCombo: r.maxCombo, stories });
    const got = new Set(ev.achievements);
    const st = pathState(units, { ...p, achievements: [...got] });
    if (st.some((u) => u.complete)) got.add("unit-champion");
    if (st.length && st.every((u) => u.complete)) got.add("path-finisher");
    const fresh = [...got].filter((a) => !player.achievements.includes(a));
    p = { ...p, achievements: [...got] };
    persist(p);
    submit(p);
    setResult({ r, fresh });
  };

  const lv = useMemo(() => level(player?.xp ?? 0), [player?.xp]);

  if (!ready) return null;
  if (error && !questions) return <p className="card p-6 text-[#B91C1C]">Couldn’t load the games: {error}</p>;
  if (!player || editing) {
    return mascots.length ? (
      <Setup
        mascots={mascots}
        initial={player ?? newPlayer()}
        onCancel={player ? () => setEditing(false) : undefined}
        onDone={(p) => {
          persist(p);
          setEditing(false);
          submit(p);
        }}
      />
    ) : (
      <p className="card p-6 text-ink/60">Loading…</p>
    );
  }

  if (lesson && result) {
    return (
      <Results
        r={result.r}
        player={player}
        unit={lesson.unit}
        kind={lesson.kind}
        fresh={result.fresh}
        onRetry={() => start(lesson.unit, lesson.kind)}
        onContinue={() => {
          setLesson(null);
          setResult(null);
        }}
      />
    );
  }
  if (lesson) {
    return <Lesson key={lesson.qs.map((q) => q.id).join()} player={player} unit={lesson.unit} kind={lesson.kind} questions={lesson.qs} onExit={() => setLesson(null)} onFinish={finish} />;
  }

  const myRank = leaders.findIndex((l) => l.id === player.id);
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        <div className="sticky top-[84px] z-20 -mx-1 mb-6 flex items-center justify-between gap-2 rounded-2xl bg-cream/95 px-1 py-2 backdrop-blur">
          <div className="flex rounded-full bg-white p-1 ring-1 ring-ink/10" role="tablist" aria-label="Game sections">
            {(
              [
                ["learn", "Learn", BookOpen],
                ["leaderboard", "Leaderboard", Crown],
                ["badges", "Badges", Trophy],
              ] as const
            ).map(([k, l, I]) => (
              <button key={k} type="button" role="tab" aria-label={l} aria-selected={tab === k} onClick={() => setTab(k)} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-extrabold sm:px-4", tab === k ? "bg-ink text-white" : "text-ink/60")}>
                <I className="h-4 w-4" aria-hidden /> <span className={k === "learn" ? "" : "hidden sm:inline"}>{l}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-sm font-extrabold">
            <span className="flex items-center gap-1 text-[#FF9600]" title="Day streak"><Flame className="h-5 w-5 fill-current" aria-hidden />{player.streak}</span>
            <span className="flex items-center gap-1 text-[#1CB0F6]" title="Total XP"><Zap className="h-5 w-5 fill-current" aria-hidden />{player.xp}</span>
          </div>
        </div>
        {error ? <p className="mb-4 rounded-2xl bg-[#FFDFE0] p-3 text-sm font-bold text-[#B91C1C]">{error}</p> : null}

        {tab === "learn" ? (questions ? <PathView units={units} player={player} onStart={start} /> : <p className="text-ink/55">Loading questions…</p>) : null}

        {tab === "leaderboard" ? (
          <div className="card p-4 sm:p-6">
            <h2 className="font-display text-2xl font-extrabold">Leaderboard</h2>
            <ol className="mt-4 grid gap-2">
              {leaders.slice(0, 30).map((l, i) => (
                <li key={l.id} className={cn("flex items-center gap-3 rounded-2xl p-2.5", l.id === player.id ? "bg-sky-soft ring-2 ring-blueBrand-400" : "bg-paper")}>
                  <span className={cn("w-7 text-center font-display text-lg font-extrabold", i < 3 ? "text-[#E5A300]" : "text-ink/45")}>{i + 1}</span>
                  <span className="grid h-10 w-10 place-items-center rounded-full text-xl" style={{ background: l.mascotColor }}>{l.mascot}</span>
                  <span className="min-w-0 flex-1 truncate font-bold">{l.name}{l.id === player.id ? " (you)" : ""}</span>
                  <span className="text-sm font-extrabold text-ink/60">{l.xp} XP</span>
                </li>
              ))}
              {!leaders.length ? <li className="text-ink/55">Be the first on the board!</li> : null}
            </ol>
          </div>
        ) : null}

        {tab === "badges" ? (
          <div className="card p-4 sm:p-6">
            <h2 className="font-display text-2xl font-extrabold">Badges</h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {ACHIEVEMENTS.map((a) => {
                const got = player.achievements.includes(a.id);
                return (
                  <li key={a.id} className={cn("rounded-2xl p-4 text-center", got ? "bg-sun-soft" : "bg-paper opacity-60")}>
                    <div className={cn("text-4xl", !got && "grayscale")} aria-hidden>{a.icon}</div>
                    <div className="mt-2 font-bold">{a.label}</div>
                    <div className="text-xs text-ink/55">{a.desc}</div>
                    <div className="sr-only">{got ? "Earned" : "Not earned yet"}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      <aside className="grid gap-4 lg:sticky lg:top-28">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <Mascot emoji={player.mascotEmoji} color={player.mascotColor} accessory={player.accessory} size={64} />
            <div className="min-w-0">
              <div className="truncate font-display text-xl font-extrabold">{player.name}</div>
              <div className="text-sm font-bold text-ink/55">Level {lv.level}{myRank >= 0 ? ` · #${myRank + 1}` : ""}</div>
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={Math.round(lv.progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next level">
            <div className="h-full rounded-full bg-[#58CC02]" style={{ width: `${Math.round(lv.progress * 100)}%` }} />
          </div>
          <div className="mt-1 text-xs font-bold text-ink/50">{lv.toNext} XP to level {lv.level + 1}</div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-paper p-2"><div className="font-display text-lg font-extrabold text-[#FF9600]">{player.streak}</div><div className="text-[11px] font-bold text-ink/50">day streak</div></div>
            <div className="rounded-xl bg-paper p-2"><div className="font-display text-lg font-extrabold text-[#1CB0F6]">{player.xp}</div><div className="text-[11px] font-bold text-ink/50">XP</div></div>
            <div className="rounded-xl bg-paper p-2"><div className="font-display text-lg font-extrabold text-[#E5A300]">{player.achievements.length}</div><div className="text-[11px] font-bold text-ink/50">badges</div></div>
          </div>
          <button type="button" onClick={() => setEditing(true)} className="btn btn-ghost mt-4 w-full !py-2.5 text-sm">Change mascot</button>
        </div>
        <div className="rounded-[1.6rem] bg-[#DCFCE7] p-5 text-sm leading-6">
          <div className="font-display text-lg font-bold">How it works</div>
          <ul className="mt-2 grid gap-1 text-ink/70">
            <li>⭐ Each unit has four levels and a challenge.</li>
            <li>✅ Score {PASS_MARK}% to unlock the next level.</li>
            <li>❤️ You have {HEARTS} hearts per lesson.</li>
            <li>↻ Missed questions come back at the end.</li>
            <li>🔥 Play every day to grow your streak.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
