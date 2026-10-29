"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, type TargetAndTransition } from "framer-motion";
import { useContent } from "@/lib/useContent";
import { useMotionLevel } from "@/components/motion/MotionDirector";
import type { MascotDoc, MascotKind } from "@/lib/cms/types";
import { cn } from "@/lib/cn";

export type Mood = "idle" | "happy" | "sad" | "cheer" | "think" | "wave";

const EMOJI_KIND: Record<string, MascotKind> = { "🐑": "lamb", "🦁": "lion", "🦉": "owl", "🐻": "bear", "🕊️": "dove", "🕊": "dove", "🦊": "fox" };

// ---------- colour helpers ----------
function hexToRgb(h: string) {
  const m = h.replace("#", "").match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return [200, 200, 200];
  const s = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
}
function mix(h: string, to: number, amt: number) {
  const [r, g, b] = hexToRgb(h);
  const f = (c: number) => Math.round(c + (to - c) * amt).toString(16).padStart(2, "0");
  return `#${f(r)}${f(g)}${f(b)}`;
}
const lighten = (h: string, a: number) => mix(h, 255, a);
const darken = (h: string, a: number) => mix(h, 0, a);
const isLight = (h: string) => {
  const [r, g, b] = hexToRgb(h);
  return 0.299 * r + 0.587 * g + 0.114 * b > 200;
};

// ---------- body language ----------
const BODY: Record<Mood, TargetAndTransition> = {
  idle: { y: [0, -4, 0], scaleY: [1, 1.025, 1], rotate: 0, transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } },
  happy: { y: [0, -24, 0, -9, 0], scaleY: [1, 0.9, 1.06, 0.97, 1], rotate: 0, transition: { duration: 0.9, ease: "easeOut" } },
  sad: { y: [0, 5, 4], rotate: [0, -4, -3], scaleY: [1, 0.96, 0.97], transition: { duration: 0.8, ease: "easeOut" } },
  cheer: { y: [0, -40, 0, -14, 0], rotate: [0, -10, 10, -4, 0], scale: [1, 1.08, 0.95, 1.03, 1], transition: { duration: 1.1, ease: "easeOut" } },
  think: { rotate: [-4, 4, -4], y: 0, transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } },
  wave: { y: [0, -3, 0], rotate: [0, 2, 0], transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" } },
};
const ARM_L: Record<Mood, TargetAndTransition> = {
  idle: { rotate: [0, 6, 0], transition: { duration: 2.6, repeat: Infinity } },
  happy: { rotate: [0, 60, 20], transition: { duration: 0.6 } },
  sad: { rotate: -10 },
  cheer: { rotate: [0, 140, 120], transition: { duration: 0.5 } },
  think: { rotate: 10 },
  wave: { rotate: 8 },
};
const ARM_R: Record<Mood, TargetAndTransition> = {
  idle: { rotate: [0, -6, 0], transition: { duration: 2.6, repeat: Infinity } },
  happy: { rotate: [0, -60, -20], transition: { duration: 0.6 } },
  sad: { rotate: 10 },
  cheer: { rotate: [0, -140, -120], transition: { duration: 0.5 } },
  think: { rotate: [-115, -125, -115], transition: { duration: 2.2, repeat: Infinity } },
  wave: { rotate: [-130, -100, -140, -100, -130], transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } },
};
const MOUTH: Record<Mood, { d: string; open: boolean }> = {
  idle: { d: "M88 140 Q100 150 112 140", open: false },
  happy: { d: "M84 136 Q100 160 116 136 Z", open: true },
  sad: { d: "M88 149 Q100 139 112 149", open: false },
  cheer: { d: "M80 134 Q100 168 120 134 Z", open: true },
  think: { d: "M93 145 Q103 141 111 144", open: false },
  wave: { d: "M84 136 Q100 158 116 136 Z", open: true },
};
const BROWS: Record<Mood, [string, string]> = {
  idle: ["M66 86 Q78 80 90 85", "M110 85 Q122 80 134 86"],
  happy: ["M66 84 Q78 76 90 82", "M110 82 Q122 76 134 84"],
  sad: ["M66 82 Q78 88 90 92", "M110 92 Q122 88 134 82"],
  cheer: ["M66 80 Q78 72 90 79", "M110 79 Q122 72 134 80"],
  think: ["M66 88 Q78 85 90 88", "M110 80 Q122 74 134 82"],
  wave: ["M66 84 Q78 76 90 82", "M110 82 Q122 76 134 84"],
};

const origin = (x: string, y: string) => ({ transformBox: "fill-box" as const, originX: x, originY: y });

/** Polished, expressive mascot character (pure SVG, so it stays crisp at any size). */
export function Buddy({
  kind,
  color,
  accent,
  accessory = "none",
  mood = "idle",
  size = 120,
  look = true,
  title,
}: {
  kind: MascotKind;
  color: string;
  accent?: string;
  accessory?: string;
  mood?: Mood;
  size?: number;
  look?: boolean;
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const level = useMotionLevel();
  const still = level === "off";
  const svgRef = useRef<SVGSVGElement>(null);
  const px = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const py = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });

  useEffect(() => {
    if (!look || still) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = svgRef.current?.getBoundingClientRect();
        if (!r) return;
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height * 0.45);
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 300);
        px.set((dx / d) * 4.5 * k);
        py.set((dy / d) * 4 * k);
      });
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, [look, still, px, py]);

  const base = color || "#F59E0B";
  const acc = accent || lighten(base, 0.55);
  const line = darken(base, isLight(base) ? 0.32 : 0.42);
  const mane = darken(base, 0.28);
  const m = MOUTH[mood];
  const [bl, br] = BROWS[mood];
  const anim = (a: TargetAndTransition) => (still ? undefined : a);

  const ears = (() => {
    switch (kind) {
      case "lion":
        return (
          <g>
            {Array.from({ length: 16 }).map((_, i) => {
              const a = (i / 16) * Math.PI * 2;
              return <circle key={i} cx={100 + Math.cos(a) * 60} cy={108 + Math.sin(a) * 58} r="22" fill={mane} stroke={darken(mane, 0.25)} strokeWidth="3" />;
            })}
            <circle cx="62" cy="62" r="15" fill={base} stroke={line} strokeWidth="3" />
            <circle cx="138" cy="62" r="15" fill={base} stroke={line} strokeWidth="3" />
            <circle cx="62" cy="62" r="7" fill={acc} />
            <circle cx="138" cy="62" r="7" fill={acc} />
          </g>
        );
      case "bear":
        return (
          <g>
            <circle cx="56" cy="62" r="20" fill={base} stroke={line} strokeWidth="3" />
            <circle cx="144" cy="62" r="20" fill={base} stroke={line} strokeWidth="3" />
            <circle cx="56" cy="62" r="10" fill={acc} />
            <circle cx="144" cy="62" r="10" fill={acc} />
          </g>
        );
      case "fox":
        return (
          <g>
            <path d="M178 178 C214 160 206 108 176 104 C188 132 170 150 150 160 Z" fill={base} stroke={line} strokeWidth="3" strokeLinejoin="round" />
            <path d="M190 112 C200 124 198 140 188 150 C190 134 186 122 176 112 Z" fill="#fff" />
            <path d="M50 78 L52 26 L92 58 Z" fill={base} stroke={line} strokeWidth="3" strokeLinejoin="round" />
            <path d="M150 78 L148 26 L108 58 Z" fill={base} stroke={line} strokeWidth="3" strokeLinejoin="round" />
            <path d="M58 66 L59 40 L80 58 Z" fill={acc} />
            <path d="M142 66 L141 40 L120 58 Z" fill={acc} />
          </g>
        );
      case "owl":
        return (
          <g>
            <path d="M52 76 L56 36 L84 60 Z" fill={darken(base, 0.1)} stroke={line} strokeWidth="3" strokeLinejoin="round" />
            <path d="M148 76 L144 36 L116 60 Z" fill={darken(base, 0.1)} stroke={line} strokeWidth="3" strokeLinejoin="round" />
          </g>
        );
      case "lamb":
        return (
          <g>
            <ellipse cx="40" cy="104" rx="22" ry="11" transform="rotate(-28 40 104)" fill={acc} stroke={line} strokeWidth="3" />
            <ellipse cx="160" cy="104" rx="22" ry="11" transform="rotate(28 160 104)" fill={acc} stroke={line} strokeWidth="3" />
          </g>
        );
      case "dove":
        return (
          <g>
            <path d="M92 52 C92 34 104 30 110 40 C104 40 100 46 100 54 Z" fill={lighten(base, 0.2)} stroke={line} strokeWidth="3" strokeLinejoin="round" />
            <path d="M160 168 L192 186 L186 160 Z" fill={darken(base, 0.06)} stroke={line} strokeWidth="3" strokeLinejoin="round" />
          </g>
        );
    }
  })();

  const topper = kind === "lamb" ? (
    <g>
      {[52, 70, 88, 106, 124, 142].map((x, i) => (
        <circle key={x} cx={x + 3} cy={i % 2 ? 58 : 64} r="17" fill={lighten(base, 0.35)} stroke={line} strokeWidth="3" />
      ))}
      {[62, 84, 106, 128].map((x) => (
        <circle key={x} cx={x + 4} cy="46" r="14" fill={lighten(base, 0.45)} stroke={line} strokeWidth="3" />
      ))}
    </g>
  ) : null;

  const armShape = (side: "l" | "r") => {
    const wing = kind === "owl" || kind === "dove";
    return wing ? (
      <path d={side === "l" ? "M46 112 C22 124 22 156 40 170 C46 152 52 134 52 120 Z" : "M154 112 C178 124 178 156 160 170 C154 152 148 134 148 120 Z"} fill={darken(base, 0.08)} stroke={line} strokeWidth="3" strokeLinejoin="round" />
    ) : (
      <path d={side === "l" ? "M44 124 C30 128 24 150 30 164 C34 172 46 170 48 160 C50 150 52 136 50 126 Z" : "M156 124 C170 128 176 150 170 164 C166 172 154 170 152 160 C150 150 148 136 150 126 Z"} fill={darken(base, 0.04)} stroke={line} strokeWidth="3" strokeLinejoin="round" />
    );
  };

  const accessoryArt = (() => {
    switch (accessory) {
      case "crown":
        return <path d="M72 46 L76 20 L90 36 L100 16 L110 36 L124 20 L128 46 Z" fill="#FACC15" stroke="#A16207" strokeWidth="3" strokeLinejoin="round" />;
      case "cap":
        return (
          <g>
            <path d="M62 56 C64 26 136 26 138 56 Z" fill="#2563EB" stroke="#1E3A8A" strokeWidth="3" />
            <path d="M126 54 L168 58 C166 64 140 64 126 60 Z" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="100" cy="28" r="5" fill="#1E3A8A" />
          </g>
        );
      case "bow":
        return (
          <g>
            <path d="M120 44 L102 32 L104 58 Z M120 44 L140 30 L138 58 Z" fill="#F472B6" stroke="#BE185D" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="120" cy="44" r="7" fill="#EC4899" stroke="#BE185D" strokeWidth="3" />
          </g>
        );
      case "star":
        return <path d="M100 8 L108 26 L128 28 L113 40 L118 60 L100 49 L82 60 L87 40 L72 28 L92 26 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="3" strokeLinejoin="round" />;
      case "halo":
        return <ellipse cx="100" cy="24" rx="34" ry="9" fill="none" stroke="#FACC15" strokeWidth="6" />;
      default:
        return null;
    }
  })();

  return (
    <svg ref={svgRef} viewBox="-10 -10 220 230" width={size} height={size * 1.045} role="img" aria-label={title ?? `${kind} mascot`} className="overflow-visible">
      <defs>
        <radialGradient id={`b-${uid}`} cx="38%" cy="30%" r="75%">
          <stop offset="0" stopColor={lighten(base, 0.38)} />
          <stop offset="0.55" stopColor={base} />
          <stop offset="1" stopColor={darken(base, 0.16)} />
        </radialGradient>
        <radialGradient id={`s-${uid}`}>
          <stop offset="0" stopColor="#0B1530" stopOpacity=".28" />
          <stop offset="1" stopColor="#0B1530" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* ground shadow */}
      <motion.ellipse cx="100" cy="204" rx="58" ry="9" fill={`url(#s-${uid})`} animate={anim(mood === "cheer" || mood === "happy" ? { scaleX: [1, 0.7, 1] } : { scaleX: 1 })} style={origin("50%", "50%")} />
      <motion.g key={mood} animate={anim(BODY[mood])} style={origin("50%", "100%")}>
        {ears}
        {/* feet */}
        <ellipse cx="76" cy="192" rx="18" ry="10" fill={darken(base, 0.12)} stroke={line} strokeWidth="3" />
        <ellipse cx="124" cy="192" rx="18" ry="10" fill={darken(base, 0.12)} stroke={line} strokeWidth="3" />
        {/* body */}
        <path d="M100 42 C150 42 166 88 166 128 C166 172 138 196 100 196 C62 196 34 172 34 128 C34 88 50 42 100 42 Z" fill={`url(#b-${uid})`} stroke={line} strokeWidth="3.5" />
        {topper}
        {/* belly */}
        {kind === "owl" ? (
          <g fill="none" stroke={darken(acc, 0.25)} strokeWidth="3" strokeLinecap="round">
            <ellipse cx="100" cy="160" rx="34" ry="28" fill={acc} stroke="none" />
            {[150, 162, 174].map((y) => (
              <path key={y} d={`M82 ${y} q6 6 12 0 q6 6 12 0 q6 6 12 0`} />
            ))}
          </g>
        ) : (
          <ellipse cx="100" cy="162" rx="34" ry="27" fill={acc} opacity={kind === "lamb" ? 0.9 : 0.85} />
        )}
        {/* muzzle */}
        {kind === "bear" || kind === "fox" || kind === "lion" ? <ellipse cx="100" cy="138" rx="24" ry="17" fill={kind === "fox" ? "#fff" : acc} /> : null}
        {/* arms */}
        <motion.g animate={anim(ARM_L[mood])} style={origin("70%", "8%")}>{armShape("l")}</motion.g>
        <motion.g animate={anim(ARM_R[mood])} style={origin("30%", "8%")}>{armShape("r")}</motion.g>
        {/* eyes */}
        {kind === "owl" ? (
          <g>
            <circle cx="78" cy="108" r="22" fill={lighten(acc, 0.4)} stroke={line} strokeWidth="3" />
            <circle cx="122" cy="108" r="22" fill={lighten(acc, 0.4)} stroke={line} strokeWidth="3" />
          </g>
        ) : null}
        <motion.g animate={still ? undefined : { scaleY: [1, 1, 0.08, 1] }} transition={{ duration: 4.2, times: [0, 0.93, 0.965, 1], repeat: Infinity, repeatDelay: 0.6 }} style={origin("50%", "50%")}>
          {[78, 122].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy="108" rx="14" ry={mood === "sad" ? 13 : 16} fill="#fff" stroke={line} strokeWidth="2.5" />
              <motion.g style={{ x: px, y: py }}>
                <circle cx={cx} cy="110" r="9" fill="#0B1530" />
                <circle cx={cx + 3} cy="106" r="3.4" fill="#fff" />
                <circle cx={cx - 3} cy="113" r="1.6" fill="#fff" opacity=".8" />
              </motion.g>
            </g>
          ))}
        </motion.g>
        {/* brows */}
        <g stroke={darken(line, 0.2)} strokeWidth="4" strokeLinecap="round" fill="none">
          <path d={bl} style={{ transition: "d .25s ease" }} />
          <path d={br} style={{ transition: "d .25s ease" }} />
        </g>
        {/* nose / beak */}
        {kind === "owl" || kind === "dove" ? (
          <path d="M92 124 L108 124 L100 138 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" strokeLinejoin="round" />
        ) : (
          <ellipse cx="100" cy="128" rx={kind === "lamb" ? 6 : 8} ry={kind === "lamb" ? 4 : 6} fill="#3B2316" />
        )}
        {/* cheeks */}
        <ellipse cx="62" cy="132" rx="10" ry="6" fill="#FB7185" opacity={mood === "sad" ? 0.2 : 0.45} />
        <ellipse cx="138" cy="132" rx="10" ry="6" fill="#FB7185" opacity={mood === "sad" ? 0.2 : 0.45} />
        {/* mouth */}
        {kind === "owl" || kind === "dove" ? null : m.open ? (
          <g>
            <path d={m.d} fill="#5B1A1A" stroke="#3B0F0F" strokeWidth="2.5" strokeLinejoin="round" />
            <ellipse cx="100" cy={mood === "cheer" ? 152 : 148} rx="8" ry="4.5" fill="#FB7185" />
          </g>
        ) : (
          <path d={m.d} fill="none" stroke="#3B0F0F" strokeWidth="3.5" strokeLinecap="round" />
        )}
        {accessoryArt}
        {/* mood extras */}
        {mood === "sad" && !still ? (
          <motion.path d="M134 118 q5 9 0 12 q-5 -3 0 -12 Z" fill="#60A5FA" initial={{ y: 0, opacity: 0 }} animate={{ y: [0, 26], opacity: [0, 1, 0] }} transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.6 }} />
        ) : null}
        {mood === "think" ? (
          <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: [0, -4, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
            <circle cx="170" cy="40" r="16" fill="#fff" stroke={line} strokeWidth="2.5" />
            <text x="170" y="47" textAnchor="middle" fontSize="20" fontWeight="900" fill="#2563EB">?</text>
            <circle cx="150" cy="64" r="5" fill="#fff" stroke={line} strokeWidth="2" />
          </motion.g>
        ) : null}
      </motion.g>
      {mood === "cheer" && !still ? (
        <g>
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            const colors = ["#FACC15", "#22C55E", "#3B82F6", "#F472B6", "#FB923C"];
            return (
              <motion.rect
                key={i}
                x="96"
                y="80"
                width="8"
                height="8"
                rx="2"
                fill={colors[i % colors.length]}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{ x: Math.cos(a) * 110, y: Math.sin(a) * 90 - 20, opacity: 0, rotate: 360 }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
              />
            );
          })}
        </g>
      ) : null}
    </svg>
  );
}

/** Finds the CMS mascot (for colours, uploaded artwork and catchphrase) by emoji/kind. */
export function useMascotDoc(emoji?: string, kind?: MascotKind): MascotDoc | undefined {
  const all = useContent("mascots");
  return all?.find((m) => (kind && m.kind === kind) || (emoji && m.emoji === emoji));
}

const IMG_KEY: Record<Mood, keyof MascotDoc> = { idle: "imageIdle", happy: "imageHappy", sad: "imageSad", cheer: "imageCheer", think: "imageThink", wave: "imageHappy" };

/** The player's mascot with mood reactions and an optional speech bubble. */
export function Mascot({
  emoji,
  kind,
  color,
  accessory = "none",
  mood = "idle",
  say,
  size = 96,
  className,
  bubbleClassName,
}: {
  emoji?: string;
  kind?: MascotKind;
  color: string;
  accessory?: string;
  mood?: Mood;
  say?: string;
  size?: number;
  className?: string;
  bubbleClassName?: string;
}) {
  const doc = useMascotDoc(emoji, kind);
  const k: MascotKind = kind ?? doc?.kind ?? EMOJI_KIND[emoji ?? ""] ?? "lion";
  const img = (doc?.[IMG_KEY[mood]] as string) || (mood !== "idle" ? "" : "") || "";
  const fallbackImg = doc?.imageIdle || "";
  const level = useMotionLevel();
  return (
    <div className={cn("flex items-end gap-2", className)}>
      {img || fallbackImg ? (
        <motion.div key={mood} animate={level === "off" ? undefined : BODY[mood]} style={{ width: size, height: size, transformOrigin: "50% 100%" }} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img || fallbackImg} alt={doc?.name ?? "mascot"} className="h-full w-full object-contain" />
        </motion.div>
      ) : (
        <div className="shrink-0" style={{ width: size }}>
          <Buddy kind={k} color={color || doc?.color || "#F59E0B"} accent={doc?.accent} accessory={accessory} mood={mood} size={size} title={doc?.name} />
        </div>
      )}
      <AnimatePresence mode="wait">
        {say ? (
          <motion.div
            key={say}
            initial={{ opacity: 0, scale: 0.8, x: -6 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className={cn("relative mb-6 max-w-[280px] rounded-2xl border-2 border-ink/10 bg-white px-4 py-2.5 text-sm font-bold text-ink shadow-[0_4px_0_rgba(11,21,48,.06)]", bubbleClassName)}
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
