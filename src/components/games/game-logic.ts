import type { Difficulty } from "@/lib/cms/types";

export type GameQuestion = {
  id: string;
  story: string;
  testament: "OT" | "NT";
  ref: string;
  difficulty: Difficulty;
  question: string;
  answer: string;
  options: string[];
};

export type GameMascot = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  unlockXp: number;
  description: string;
};

export type LeaderRow = {
  id: string;
  name: string;
  mascot: string;
  mascotColor: string;
  xp: number;
  streak: number;
  achievements: string[];
  bestRound: number;
};

export type Player = {
  id: string;
  name: string;
  mascotId: string;
  mascotEmoji: string;
  mascotColor: string;
  accessory: string;
  xp: number;
  streak: number;
  lastPlayDay: string | null;
  achievements: string[];
  seen: string[];
  storyCorrect: Record<string, number>;
  bestRound: number;
  roundsPlayed: number;
  correctTotal: number;
  answeredTotal: number;
};

export const DIFFICULTIES: { key: Difficulty; label: string; xp: number; unlockXp: number; color: string }[] = [
  { key: "easy", label: "Easy", xp: 10, unlockXp: 0, color: "#22C55E" },
  { key: "medium", label: "Medium", xp: 15, unlockXp: 100, color: "#0EA5E9" },
  { key: "hard", label: "Hard", xp: 20, unlockXp: 300, color: "#F59E0B" },
  { key: "expert", label: "Expert", xp: 30, unlockXp: 700, color: "#EF4444" },
];

export const ACCESSORIES = [
  { id: "none", label: "None", glyph: "" },
  { id: "crown", label: "Crown", glyph: "👑" },
  { id: "cap", label: "Cap", glyph: "🧢" },
  { id: "bow", label: "Bow", glyph: "🎀" },
  { id: "star", label: "Star", glyph: "⭐" },
  { id: "halo", label: "Halo", glyph: "😇" },
];

export const MASCOT_COLORS = ["#86EF99", "#00DDFF", "#F4B6C2", "#F5D33A", "#A78BFA", "#FB923C", "#F8F8F8", "#2563EB"];

export const ACHIEVEMENTS: { id: string; label: string; icon: string; desc: string }[] = [
  { id: "first-round", label: "First Steps", icon: "👣", desc: "Finish your first round" },
  { id: "perfect", label: "Perfect Round", icon: "💯", desc: "Answer every question right" },
  { id: "combo5", label: "On Fire", icon: "🔥", desc: "5 correct in a row" },
  { id: "combo10", label: "Unstoppable", icon: "⚡", desc: "10 correct in a row" },
  { id: "streak3", label: "Faithful 3", icon: "📅", desc: "Play 3 days in a row" },
  { id: "streak7", label: "Faithful Week", icon: "🗓️", desc: "Play 7 days in a row" },
  { id: "ot-explorer", label: "Old Testament Explorer", icon: "📜", desc: "Complete 3 Old Testament stories" },
  { id: "nt-explorer", label: "New Testament Explorer", icon: "✝️", desc: "Complete 3 New Testament stories" },
  { id: "xp500", label: "Scholar", icon: "🎓", desc: "Earn 500 XP" },
  { id: "xp1500", label: "Bible Champion", icon: "🏆", desc: "Earn 1,500 XP" },
  { id: "expert", label: "Expert Unlocked", icon: "🧠", desc: "Unlock Expert level" },
  { id: "all-stories", label: "Story Master", icon: "🌟", desc: "Complete every story" },
];

export const STORY_DONE_AT = 5; // correct answers needed to "complete" a story

export function level(xp: number) {
  // Level n needs 100*n*(n+1)/2 XP → 0,100,300,600,1000…
  let n = 0;
  while (100 * ((n + 1) * (n + 2)) / 2 <= xp) n++;
  const cur = (100 * n * (n + 1)) / 2;
  const next = (100 * (n + 1) * (n + 2)) / 2;
  return { level: n + 1, progress: (xp - cur) / (next - cur), toNext: next - xp };
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick a round of questions, avoiding questions the player has already seen. */
export function pickRound(
  all: GameQuestion[],
  opts: { testament: "OT" | "NT" | "ALL"; difficulty: Difficulty; story?: string },
  seen: Set<string>,
  size = 10,
) {
  const pool = all.filter(
    (q) =>
      q.difficulty === opts.difficulty &&
      (opts.testament === "ALL" || q.testament === opts.testament) &&
      (!opts.story || q.story === opts.story),
  );
  let fresh = pool.filter((q) => !seen.has(q.id));
  let recycled = false;
  if (fresh.length < Math.min(size, pool.length)) {
    // Pool exhausted: start a new cycle for this pool only
    recycled = true;
    fresh = shuffle(pool);
  }
  // Spread across stories so rounds feel varied
  const byStory = new Map<string, GameQuestion[]>();
  for (const q of shuffle(fresh)) {
    byStory.set(q.story, [...(byStory.get(q.story) ?? []), q]);
  }
  const picked: GameQuestion[] = [];
  while (picked.length < size && byStory.size) {
    for (const [k, list] of byStory) {
      const q = list.shift();
      if (q) picked.push(q);
      if (!list.length) byStory.delete(k);
      if (picked.length >= size) break;
    }
  }
  return {
    questions: picked.map((q) => ({ ...q, options: shuffle(q.options) })),
    recycled,
    poolIds: pool.map((q) => q.id),
  };
}

export function newPlayer(): Player {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return {
    id: rand.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 36),
    name: "",
    mascotId: "lamb",
    mascotEmoji: "🐑",
    mascotColor: "#86EF99",
    accessory: "none",
    xp: 0,
    streak: 0,
    lastPlayDay: null,
    achievements: [],
    seen: [],
    storyCorrect: {},
    bestRound: 0,
    roundsPlayed: 0,
    correctTotal: 0,
    answeredTotal: 0,
  };
}

export function updateStreak(p: Player): Player {
  const t = today();
  if (p.lastPlayDay === t) return p;
  const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  return { ...p, streak: p.lastPlayDay === y ? p.streak + 1 : 1, lastPlayDay: t };
}

export function evaluateAchievements(
  p: Player,
  ctx: { perfect: boolean; maxCombo: number; stories: { story: string; testament: "OT" | "NT" }[] },
) {
  const got = new Set(p.achievements);
  const add = (id: string) => got.add(id);
  if (p.roundsPlayed >= 1) add("first-round");
  if (ctx.perfect) add("perfect");
  if (ctx.maxCombo >= 5) add("combo5");
  if (ctx.maxCombo >= 10) add("combo10");
  if (p.streak >= 3) add("streak3");
  if (p.streak >= 7) add("streak7");
  if (p.xp >= 500) add("xp500");
  if (p.xp >= 1500) add("xp1500");
  if (p.xp >= 700) add("expert");
  const done = (t: "OT" | "NT") =>
    ctx.stories.filter((s) => s.testament === t && (p.storyCorrect[s.story] ?? 0) >= STORY_DONE_AT).length;
  if (done("OT") >= 3) add("ot-explorer");
  if (done("NT") >= 3) add("nt-explorer");
  if (ctx.stories.length && ctx.stories.every((s) => (p.storyCorrect[s.story] ?? 0) >= STORY_DONE_AT)) add("all-stories");
  const fresh = [...got].filter((a) => !p.achievements.includes(a));
  return { achievements: [...got], fresh };
}
