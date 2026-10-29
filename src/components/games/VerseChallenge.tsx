"use client";

import { useMemo, useState } from "react";
import { Eye, RotateCcw } from "lucide-react";
import { Mascot, type Mood } from "./Mascot";
import { cn } from "@/lib/cn";

const PLAYER_KEY = "cm_player_v1";

function playerMascot() {
  try {
    const p = JSON.parse(localStorage.getItem(PLAYER_KEY) ?? "null");
    if (p?.mascotEmoji) return { emoji: p.mascotEmoji as string, color: p.mascotColor as string, accessory: p.accessory as string, name: p.name as string };
  } catch {}
  return null;
}

/**
 * Memory-verse game for lesson pages: tap "Hide a word" until the verse is gone,
 * saying it aloud each time. The child's own game mascot (or Leo) coaches and celebrates.
 */
export function VerseChallenge({ verse, reference }: { verse: string; reference: string }) {
  const words = useMemo(() => verse.split(/\s+/).filter(Boolean), [verse]);
  const order = useMemo(() => {
    // hide words in a fixed, friendly shuffle (long words last)
    return words.map((w, i) => ({ i, k: (i * 7919) % 13 + w.length / 3 })).sort((a, b) => a.k - b.k).map((x) => x.i);
  }, [words]);
  const [hidden, setHidden] = useState(0);
  const [peek, setPeek] = useState(false);
  const [me] = useState(playerMascot);
  const hiddenSet = new Set(order.slice(0, hidden));
  const done = hidden >= words.length;
  const mood: Mood = done ? "cheer" : peek ? "think" : hidden === 0 ? "wave" : "happy";
  const say = done
    ? `You know it by heart${me?.name ? `, ${me.name}` : ""}! 🎉`
    : peek
      ? "Have a little peek…"
      : hidden === 0
        ? "Read it aloud, then hide a word!"
        : `Say it again — ${words.length - hidden} word${words.length - hidden === 1 ? "" : "s"} left to hide.`;

  return (
    <section className="no-print mt-8 overflow-hidden rounded-[2rem] bg-sun-soft p-5 sm:p-8" aria-labelledby="verse-game">
      <div className="flex flex-wrap items-end gap-4">
        <Mascot emoji={me?.emoji ?? "🦁"} color={me?.color ?? "#F59E0B"} accessory={me?.accessory} mood={mood} size={96} say={say} bubbleClassName="max-w-[220px] sm:max-w-[300px]" />
      </div>
      <h2 id="verse-game" className="mt-4 font-display text-2xl font-extrabold">Memory verse challenge</h2>
      <p className="mt-3 flex flex-wrap gap-x-2 gap-y-1.5 font-display text-2xl font-extrabold leading-snug sm:text-3xl" aria-live="polite">
        {words.map((w, i) => {
          const gone = hiddenSet.has(i) && !peek;
          return (
            <span key={i} className={cn("rounded-lg px-1 transition-all duration-300", gone ? "bg-ink/10 text-transparent" : "text-ink")} aria-hidden={gone}>
              {gone ? w.replace(/./g, "_") : w}
            </span>
          );
        })}
      </p>
      <p className="mt-2 font-bold text-ink/60">{reference}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => setHidden((h) => Math.min(words.length, h + 1))} disabled={done} className="btn btn-dark disabled:opacity-40">
          Hide a word
        </button>
        <button type="button" onPointerDown={() => setPeek(true)} onPointerUp={() => setPeek(false)} onPointerLeave={() => setPeek(false)} onKeyDown={(e) => e.key === " " && setPeek(true)} onKeyUp={() => setPeek(false)} onBlur={() => setPeek(false)} disabled={!hidden} className="btn btn-ghost disabled:opacity-40">
          <Eye className="h-4 w-4" aria-hidden /> Hold to peek
        </button>
        <button type="button" onClick={() => setHidden(0)} disabled={!hidden} className="btn btn-ghost disabled:opacity-40">
          <RotateCcw className="h-4 w-4" aria-hidden /> Start again
        </button>
      </div>
    </section>
  );
}
