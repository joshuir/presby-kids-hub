import type { Difficulty, UnitDoc } from "@/lib/cms/types";
import { shuffle, type GameQuestion, type Player } from "./game-logic";

export type NodeKind = Difficulty | "challenge";
export const NODE_KINDS: NodeKind[] = ["easy", "medium", "hard", "expert", "challenge"];
export const NODE_LABEL: Record<NodeKind, string> = { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert", challenge: "Unit challenge" };
export const NODE_XP: Record<NodeKind, number> = { easy: 10, medium: 15, hard: 20, expert: 30, challenge: 25 };
export const PASS_MARK = 60; // % correct needed to complete a node

export const nodeId = (u: UnitDoc, k: NodeKind) => `${u.id}:${k}`;

export type QType = "choice" | "truefalse" | "story";
export type LessonQ = GameQuestion & { type: QType; prompt: string; choices: string[]; correct: string; claim?: string; retry?: boolean };

export function unitPool(all: GameQuestion[], u: UnitDoc) {
  return all.filter((q) => (u.stories.length ? u.stories.includes(q.story) : u.testament === "Both" || q.testament === u.testament));
}

/** Units in order with lock/complete state for this player. */
export function pathState(units: UnitDoc[], p: Player | null) {
  const done = (id: string) => (p?.path?.[id] ?? 0) >= PASS_MARK;
  let prevUnitDone = true;
  return units.map((u) => {
    const unlocked = prevUnitDone;
    let prevNode = unlocked;
    const nodes = NODE_KINDS.map((k) => {
      const id = nodeId(u, k);
      const isDone = done(id);
      const state = isDone ? "done" : prevNode ? "current" : "locked";
      prevNode = isDone;
      return { kind: k, id, state: state as "done" | "current" | "locked", best: p?.path?.[id] ?? 0 };
    });
    const complete = done(nodeId(u, "challenge"));
    prevUnitDone = complete;
    return { unit: u, unlocked, complete, nodes };
  });
}

/** Build a lesson: mixes multiple choice, true/false and "which story?" questions; avoids repeats. */
export function buildLesson(all: GameQuestion[], u: UnitDoc, k: NodeKind, seen: Set<string>): LessonQ[] {
  const pool = unitPool(all, u);
  const size = k === "challenge" ? 12 : 8;
  let base = k === "challenge" ? pool : pool.filter((q) => q.difficulty === k);
  if (base.length < 4) base = pool;
  let fresh = base.filter((q) => !seen.has(q.id));
  if (fresh.length < size) fresh = base; // whole pool seen → start a new cycle
  // spread across stories
  const byStory = new Map<string, GameQuestion[]>();
  shuffle(fresh).forEach((q) => byStory.set(q.story, [...(byStory.get(q.story) ?? []), q]));
  const picked: GameQuestion[] = [];
  while (picked.length < size && byStory.size) {
    for (const [s, list] of byStory) {
      const q = list.shift();
      if (q) picked.push(q);
      if (!list.length) byStory.delete(s);
      if (picked.length >= size) break;
    }
  }
  const storyNames = Array.from(new Set(all.map((q) => q.story)));
  return picked.map((q, i) => {
    const slot = i % 5;
    if (slot === 3) {
      const wrong = q.options.filter((o) => o !== q.answer);
      const claim = Math.random() < 0.5 || !wrong.length ? q.answer : wrong[Math.floor(Math.random() * wrong.length)];
      return { ...q, type: "truefalse", prompt: "True or false?", claim, choices: ["True", "False"], correct: claim === q.answer ? "True" : "False" };
    }
    if (slot === 4 && storyNames.length >= 4) {
      const others = shuffle(storyNames.filter((s) => s !== q.story)).slice(0, 3);
      return { ...q, type: "story", prompt: "Which Bible story is this from?", claim: q.answer, choices: shuffle([q.story, ...others]), correct: q.story };
    }
    return { ...q, type: "choice", prompt: "Select the correct answer", choices: shuffle(q.options), correct: q.answer };
  });
}
