"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Brain, Check, Puzzle, RotateCcw, Timer, X, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { shuffle, type GameQuestion } from "./game-logic";

/* ------------------------------------------------------------------ content */

/** Who ↔ what they are remembered for (all from stories in the question bank). */
const PAIRS: [string, string][] = [
  ["Jonah", "Swallowed by a huge fish"],
  ["Abraham", "Found a ram caught in a thicket"],
  ["Gideon", "Asked God for a sign with a fleece"],
  ["Moses", "Brought the Ten Commandments down Mount Sinai"],
  ["Adam & Eve", "Lived in the Garden of Eden"],
  ["Josiah", "Became king at eight years old"],
  ["Solomon", "Was told by David to be strong and obey God"],
  ["Nicodemus", "Visited Jesus at night"],
  ["Mary Magdalene", "First saw Jesus alive in the garden"],
  ["Cleopas", "Walked with Jesus on the road to Emmaus"],
  ["Paul & Silas", "Sang hymns in prison at midnight"],
  ["Lydia", "Sold purple cloth in Philippi"],
  ["Judas", "Betrayed Jesus for thirty pieces of silver"],
  ["Joseph of Arimathea", "Laid Jesus in his new tomb"],
];

/** Short memory verses (World English Bible — public domain). */
const VERSES: { ref: string; text: string }[] = [
  { ref: "Psalm 119:105", text: "Your word is a lamp to my feet, and a light for my path." },
  { ref: "John 11:25", text: "I am the resurrection and the life." },
  { ref: "John 13:34", text: "Just as I have loved you, you also love one another." },
  { ref: "Philippians 4:4", text: "Rejoice in the Lord always! Again I will say, Rejoice!" },
  { ref: "Joshua 1:9", text: "Be strong and courageous. Don't be afraid." },
  { ref: "Psalm 118:24", text: "This is the day that Yahweh has made. We will rejoice and be glad in it!" },
  { ref: "Acts 16:31", text: "Believe in the Lord Jesus Christ, and you will be saved." },
  { ref: "Matthew 28:6", text: "He is not here, for he has risen, just like he said." },
  { ref: "Psalm 23:1", text: "Yahweh is my shepherd: I shall lack nothing." },
  { ref: "1 John 4:19", text: "We love Him, because he first loved us." },
];

type GameKey = "memory" | "verse" | "quick";
const GAMES: { key: GameKey; title: string; blurb: string; icon: typeof Brain; color: string; xp: string }[] = [
  { key: "quick", title: "Quick-fire 60", blurb: "True or false? Answer as many as you can in 60 seconds.", icon: Timer, color: "#EF4444", xp: "2 XP per right answer" },
  { key: "memory", title: "Memory match", blurb: "Flip the cards and match each Bible person to their story.", icon: Brain, color: "#8B5CF6", xp: "Up to 30 XP" },
  { key: "verse", title: "Verse builder", blurb: "Tap the words in the right order to build a memory verse.", icon: Puzzle, color: "#0EA5E9", xp: "10 XP per verse" },
];

const BEST_KEY = "cm_arcade_best_v1";
function readBest(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeBest(k: string, v: number) {
  try {
    const b = readBest();
    if (v > (b[k] ?? 0)) localStorage.setItem(BEST_KEY, JSON.stringify({ ...b, [k]: v }));
  } catch {
    /* storage unavailable */
  }
}

/* ------------------------------------------------------------------ shell */

export function Arcade({ questions, onXp }: { questions: GameQuestion[]; onXp: (xp: number) => void }) {
  const [game, setGame] = useState<GameKey | null>(null);
  const [best, setBest] = useState<Record<string, number>>(readBest);
  const top = useRef<HTMLDivElement>(null);
  const go = (g: GameKey | null) => {
    setBest(readBest());
    setGame(g);
    // bring the game into view (the page is long on phones)
    requestAnimationFrame(() => {
      const el = top.current;
      if (el && el.getBoundingClientRect().top < 90) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const meta = GAMES.find((g) => g.key === game);

  if (game && meta) {
    return (
      <div ref={top} className="card scroll-mt-40 overflow-hidden" data-testid={`arcade-${game}`}>
        <div className="flex items-center gap-3 border-b border-ink/5 p-3 sm:p-4">
          <button type="button" onClick={() => go(null)} className="grid h-10 w-10 place-items-center rounded-full bg-paper hover:bg-ink/10" aria-label="Back to all games">
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </button>
          <span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: meta.color }}><meta.icon className="h-5 w-5" aria-hidden /></span>
          <div className="min-w-0">
            <h2 className="font-display text-xl font-extrabold leading-tight">{meta.title}</h2>
            <p className="truncate text-xs font-bold text-ink/50">{best[game] ? `Your best: ${best[game]}` : meta.xp}</p>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          {game === "quick" ? <QuickFire questions={questions} onXp={onXp} /> : null}
          {game === "memory" ? <MemoryMatch onXp={onXp} /> : null}
          {game === "verse" ? <VerseBuilder onXp={onXp} /> : null}
        </div>
      </div>
    );
  }

  return (
    <div ref={top} className="scroll-mt-40">
      <h2 className="font-display text-2xl font-extrabold">Arcade</h2>
      <p className="mt-1 text-ink/60">Quick games to play any time. Every game earns XP for the leaderboard.</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {GAMES.map((g) => (
          <li key={g.key}>
            <button
              type="button"
              onClick={() => go(g.key)}
              className="group flex h-full w-full flex-col rounded-[1.6rem] bg-white p-5 text-left shadow-soft ring-1 ring-ink/5 transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueBrand-500"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-[0_4px_0_rgba(0,0,0,.15)]" style={{ background: g.color }}>
                <g.icon className="h-6 w-6" aria-hidden />
              </span>
              <span className="mt-4 font-display text-xl font-extrabold">{g.title}</span>
              <span className="mt-1 flex-1 text-sm leading-6 text-ink/60">{g.blurb}</span>
              <span className="mt-4 flex items-center justify-between text-xs font-extrabold">
                <span className="text-ink/45">{best[g.key] ? `Best: ${best[g.key]}` : g.xp}</span>
                <span className="rounded-full px-3 py-1.5 text-white transition group-hover:scale-105" style={{ background: g.color }}>Play</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Finish({ title, line, onAgain }: { title: string; line: string; onAgain: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="grid place-items-center py-6 text-center" role="status">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-[#58CC02] text-white shadow-[0_5px_0_#46A302]"><Check className="h-8 w-8" aria-hidden /></div>
      <div className="mt-4 font-display text-3xl font-extrabold">{title}</div>
      <p className="mt-1 text-ink/60">{line}</p>
      <button type="button" onClick={onAgain} className="btn btn-primary mt-5"><RotateCcw className="h-4 w-4" aria-hidden /> Play again</button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ quick-fire */

type TF = { id: string; q: string; claim: string; right: boolean; answer: string; story: string };
function makeTF(questions: GameQuestion[]): TF[] {
  const pool = questions.filter((q) => q.difficulty === "easy" || q.difficulty === "medium");
  return shuffle(pool).slice(0, 80).map((q) => {
    const right = Math.random() < 0.5;
    const wrong = q.options.filter((o) => o !== q.answer);
    return { id: q.id, q: q.question, claim: right || !wrong.length ? q.answer : wrong[Math.floor(Math.random() * wrong.length)], right: right || !wrong.length, answer: q.answer, story: q.story };
  });
}

function QuickFire({ questions, onXp }: { questions: GameQuestion[]; onXp: (xp: number) => void }) {
  const [deck, setDeck] = useState<TF[]>([]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60);
  const [phase, setState] = useState<"ready" | "play" | "done">("ready");
  const [flash, setFlash] = useState<null | { ok: boolean; answer: string }>(null);
  const awarded = useRef(false);

  const state = phase === "play" && (time <= 0 || i >= deck.length) ? "done" : phase;
  useEffect(() => {
    if (state !== "play") return;
    const t = setInterval(() => setTime((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [state]);
  useEffect(() => {
    if (state === "done" && !awarded.current) {
      awarded.current = true;
      writeBest("quick", score);
      if (score) onXp(score * 2);
    }
  }, [state, score, onXp]);

  const begin = () => {
    awarded.current = false;
    setDeck(makeTF(questions));
    setI(0);
    setScore(0);
    setTime(60);
    setFlash(null);
    setState("play");
  };
  const answer = (v: boolean) => {
    const c = deck[i];
    if (!c || flash) return;
    const ok = v === c.right;
    if (ok) setScore((s) => s + 1);
    setFlash({ ok, answer: c.answer });
    setTimeout(() => {
      setFlash(null);
      setI((n) => n + 1);
    }, ok ? 450 : 1300);
  };

  if (state === "ready")
    return (
      <div className="grid place-items-center py-6 text-center">
        <Timer className="h-12 w-12 text-[#EF4444]" aria-hidden />
        <p className="mt-3 max-w-sm text-ink/65">You’ll see a question and an answer. Tap <b>True</b> if the answer is right, <b>False</b> if it’s wrong. Go!</p>
        <button type="button" onClick={begin} className="btn btn-primary mt-5">Start the clock</button>
      </div>
    );
  if (state === "done") return <Finish title={`${score} correct!`} line={score ? `+${score * 2} XP added to your total.` : "Have another go — you can do it!"} onAgain={begin} />;

  const c = deck[i];
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-extrabold">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5", time <= 10 ? "bg-[#FFDFE0] text-[#B91C1C]" : "bg-paper")} aria-live="off"><Timer className="h-4 w-4" aria-hidden /> {time}s</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-[#1CB0F6]"><Zap className="h-4 w-4 fill-current" aria-hidden /> {score}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10"><div className="h-full bg-[#EF4444] transition-[width] duration-1000 ease-linear" style={{ width: `${(time / 60) * 100}%` }} /></div>
      <AnimatePresence mode="wait">
        {c ? (
          <motion.div key={c.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }} className="mt-5 rounded-3xl bg-paper p-5 sm:p-7">
            <div className="text-xs font-extrabold uppercase tracking-wider text-ink/45">{c.story}</div>
            <p className="mt-2 font-display text-xl font-extrabold leading-snug sm:text-2xl">{c.q}</p>
            <p className="mt-4 rounded-2xl bg-white p-4 text-lg font-bold ring-1 ring-ink/10">“{c.claim}”</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="mt-3 min-h-6 text-center text-sm font-bold" role="status">
        {flash ? (flash.ok ? <span className="text-[#15803D]">Correct!</span> : <span className="text-[#B91C1C]">Not quite — the answer is “{flash.answer}”.</span>) : null}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button type="button" onClick={() => answer(true)} disabled={!!flash} className="btn !py-4 text-lg text-white" style={{ background: "#58CC02", boxShadow: "0 4px 0 #46A302" }}><Check className="h-5 w-5" aria-hidden /> True</button>
        <button type="button" onClick={() => answer(false)} disabled={!!flash} className="btn !py-4 text-lg text-white" style={{ background: "#EF4444", boxShadow: "0 4px 0 #B91C1C" }}><X className="h-5 w-5" aria-hidden /> False</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ memory */

type Card = { id: string; pair: number; text: string; kind: "who" | "what" };
function deal(): Card[] {
  const picks = shuffle(PAIRS.map((p, i) => [p, i] as const)).slice(0, 6);
  return shuffle(picks.flatMap(([[who, what], i]) => [
    { id: `w${i}`, pair: i, text: who, kind: "who" as const },
    { id: `t${i}`, pair: i, text: what, kind: "what" as const },
  ]));
}

function MemoryMatch({ onXp }: { onXp: (xp: number) => void }) {
  const [cards, setCards] = useState<Card[]>(deal);
  const [open, setOpen] = useState<string[]>([]);
  const [done, setDone] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const awarded = useRef(false);
  const finished = cards.length > 0 && done.length === cards.length / 2;
  const xp = Math.max(10, 30 - Math.max(0, moves - 6) * 2);

  useEffect(() => {
    if (finished && !awarded.current) {
      awarded.current = true;
      writeBest("memory", xp);
      onXp(xp);
    }
  }, [finished, xp, onXp]);

  const flip = (c: Card) => {
    if (open.length === 2 || open.includes(c.id) || done.includes(c.pair)) return;
    const next = [...open, c.id];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((id) => cards.find((x) => x.id === id)!);
      if (a.pair === b.pair) {
        setTimeout(() => { setDone((d) => [...d, a.pair]); setOpen([]); }, 350);
      } else setTimeout(() => setOpen([]), 1000);
    }
  };
  const again = () => { awarded.current = false; setCards(deal()); setOpen([]); setDone([]); setMoves(0); };

  if (finished) return <Finish title="All matched!" line={`${moves} moves · +${xp} XP`} onAgain={again} />;
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-extrabold text-ink/60">
        <span>Match the person to their story</span>
        <span aria-live="polite">{done.length}/{cards.length / 2 || 6} pairs · {moves} moves</span>
      </div>
      <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
        {cards.map((c) => {
          const up = open.includes(c.id) || done.includes(c.pair);
          const matched = done.includes(c.pair);
          return (
            <li key={c.id} className="[perspective:800px]">
              <button
                type="button"
                onClick={() => flip(c)}
                aria-label={up ? c.text : "Hidden card"}
                aria-pressed={up}
                className="relative block aspect-[4/5] w-full transition-transform duration-300 [transform-style:preserve-3d] sm:aspect-[5/4]"
                style={{ transform: up ? "rotateY(180deg)" : "none" }}
              >
                <span className="absolute inset-0 grid place-items-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white shadow-[0_4px_0_#5B21B6] [backface-visibility:hidden]">
                  <Brain className="h-7 w-7 opacity-80" aria-hidden />
                </span>
                <span
                  className={cn(
                    "absolute inset-0 grid place-items-center rounded-2xl p-2 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]",
                    matched ? "bg-[#DCFCE7] text-[#15803D] ring-2 ring-[#58CC02]" : "bg-white ring-2 ring-[#8B5CF6]",
                    c.kind === "who" ? "font-display text-base font-extrabold sm:text-lg" : "text-[11px] font-bold leading-snug sm:text-sm",
                  )}
                >
                  {c.text}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ verse builder */

function VerseBuilder({ onXp }: { onXp: (xp: number) => void }) {
  const [order] = useState(() => shuffle(VERSES.map((_, i) => i)));
  const [n, setN] = useState(0);
  const [solved, setSolved] = useState(0);
  const v = VERSES[order[n % order.length]];
  return (
    <VerseRound
      key={n}
      v={v}
      solved={solved}
      onSolved={() => {
        setSolved((x) => x + 1);
        writeBest("verse", solved + 1);
        onXp(10);
      }}
      onNext={() => setN((x) => x + 1)}
    />
  );
}

function VerseRound({ v, solved, onSolved, onNext }: { v: { ref: string; text: string }; solved: number; onSolved: () => void; onNext: () => void }) {
  const words = useMemo(() => v.text.split(" ").map((w, i) => ({ w, i })), [v]);
  const [bank, setBank] = useState(() => shuffle(words));
  const [built, setBuilt] = useState<{ w: string; i: number }[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const complete = built.length === words.length;

  const tap = (t: { w: string; i: number }) => {
    // accept any word with the same text as the next expected word (handles repeated words)
    const expected = words[built.length];
    if (t.w === expected.w) {
      const nb = [...built, t];
      setBuilt(nb);
      setBank((b) => b.filter((x) => x.i !== t.i));
      if (nb.length === words.length) onSolved();
    } else {
      setWrong(t.i);
      setTimeout(() => setWrong(null), 450);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between text-sm font-extrabold text-ink/60">
        <span>{v.ref}</span>
        <span>{solved} built</span>
      </div>
      <div className="mt-3 flex min-h-[7rem] flex-wrap content-start gap-2 rounded-3xl bg-paper p-4" aria-live="polite" aria-label="Your verse so far">
        {built.map((t) => (
          <motion.span key={t.i} layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-xl bg-white px-3 py-2 font-bold ring-1 ring-ink/10">{t.w}</motion.span>
        ))}
        {!built.length ? <span className="self-center text-ink/40">Tap the words below in order…</span> : null}
      </div>
      {complete ? (
        <div className="mt-4 rounded-2xl bg-[#DCFCE7] p-4 text-center" role="status">
          <div className="font-display text-xl font-extrabold text-[#15803D]">Well done! +10 XP</div>
          <p className="mt-1 text-sm text-ink/65">Say it out loud three times to remember it.</p>
          <button type="button" onClick={onNext} className="btn btn-primary mt-3">Next verse</button>
        </div>
      ) : (
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {bank.map((t) => (
            <li key={t.i}>
              <motion.button
                type="button"
                layout
                onClick={() => tap(t)}
                animate={wrong === t.i ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.35 }}
                className={cn("rounded-xl bg-white px-3.5 py-2.5 text-base font-bold shadow-[0_3px_0_rgba(0,0,0,.12)] ring-1 ring-ink/10 transition hover:bg-sky-soft", wrong === t.i && "bg-[#FFDFE0] ring-[#EF4444]")}
              >
                {t.w}
              </motion.button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 text-center">
        <button type="button" onClick={onNext} className="text-sm font-bold text-ink/50 underline-offset-4 hover:underline">Skip to another verse</button>
      </div>
    </div>
  );
}
