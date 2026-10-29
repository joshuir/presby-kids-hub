"use client";

import { AnimatePresence, motion, type TargetAndTransition } from "framer-motion";
import { ACCESSORIES } from "./game-logic";
import { cn } from "@/lib/cn";

export type Mood = "idle" | "happy" | "sad" | "cheer" | "think";

const ANIM: Record<Mood, TargetAndTransition> = {
  idle: { y: [0, -6, 0], rotate: 0, transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } },
  think: { rotate: [0, -6, 6, 0], transition: { duration: 1.8, repeat: Infinity } },
  happy: { y: [0, -26, 0, -12, 0], scale: [1, 1.08, 1], transition: { duration: 0.8 } },
  sad: { x: [0, -10, 10, -8, 8, 0], rotate: [0, -4, 4, 0], transition: { duration: 0.6 } },
  cheer: { rotate: [0, 360], y: [0, -30, 0], scale: [1, 1.15, 1], transition: { duration: 0.9 } },
};

const FACE: Record<Mood, string> = { idle: "", think: "🤔", happy: "✨", sad: "💧", cheer: "🎉" };

/** The player's mascot with mood reactions and an optional speech bubble. */
export function Mascot({
  emoji,
  color,
  accessory = "none",
  mood = "idle",
  say,
  size = 96,
  className,
}: {
  emoji: string;
  color: string;
  accessory?: string;
  mood?: Mood;
  say?: string;
  size?: number;
  className?: string;
}) {
  const acc = ACCESSORIES.find((a) => a.id === accessory)?.glyph;
  return (
    <div className={cn("flex items-end gap-2", className)}>
      <motion.div key={mood} animate={ANIM[mood]} className="relative shrink-0" style={{ width: size, height: size }} aria-hidden>
        <div className="grid h-full w-full place-items-center rounded-full shadow-[inset_0_-8px_0_rgba(0,0,0,.12),0_6px_0_rgba(0,0,0,.08)]" style={{ background: color }}>
          <span style={{ fontSize: size * 0.56 }} className="leading-none">{emoji}</span>
        </div>
        {acc ? <span className="absolute -top-3 left-1/2 -translate-x-1/2" style={{ fontSize: size * 0.32 }}>{acc}</span> : null}
        {FACE[mood] ? <span className="absolute -right-1 top-0" style={{ fontSize: size * 0.26 }}>{FACE[mood]}</span> : null}
      </motion.div>
      <AnimatePresence mode="wait">
        {say ? (
          <motion.div
            key={say}
            initial={{ opacity: 0, scale: 0.8, x: -6 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="relative mb-6 max-w-[260px] rounded-2xl border-2 border-ink/10 bg-white px-4 py-2.5 text-sm font-bold text-ink"
            role="status"
          >
            {say}
            <span className="absolute -left-2 bottom-3 h-3.5 w-3.5 rotate-45 border-b-2 border-l-2 border-ink/10 bg-white" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
