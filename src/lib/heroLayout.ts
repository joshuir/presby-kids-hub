/**
 * Free-form layout for the home hero on desktop (≥1024px): every text block and image is placed on
 * a canvas by x / y (top-left, % of the canvas), width (% of the canvas width), size (zoom) and layer.
 * Phones and tablets keep the tidy stacked layout but respect "hidden".
 */
export type HeroBox = { x: number; y: number; w?: number; s?: number; z?: number; hidden?: boolean };
export type HeroLayout = Record<string, HeroBox>;

export const HERO_ELEMENTS: { id: string; label: string; kind: "text" | "image" | "chip"; resizable: "width" | "size" }[] = [
  { id: "badge", label: "Badge above the heading", kind: "chip", resizable: "size" },
  { id: "heading", label: "Heading", kind: "text", resizable: "width" },
  { id: "subtitle", label: "Subtitle", kind: "text", resizable: "width" },
  { id: "buttons", label: "Buttons", kind: "chip", resizable: "size" },
  { id: "times", label: "Service times", kind: "text", resizable: "width" },
  { id: "image", label: "Main picture", kind: "image", resizable: "width" },
  { id: "logo", label: "Logo badge", kind: "image", resizable: "width" },
  { id: "classes", label: "“9 classes” label", kind: "chip", resizable: "size" },
  { id: "teachers", label: "“Safe & trained teachers” label", kind: "chip", resizable: "size" },
  { id: "lesson", label: "“This Sunday” lesson card", kind: "chip", resizable: "size" },
];

/** The canvas is this shape at every desktop width, so a layout looks the same on any screen. */
export const HERO_CANVAS_RATIO = 1216 / 660;

export const DEFAULT_HERO_LAYOUT: HeroLayout = {
  badge: { x: 0, y: 6, s: 1 },
  heading: { x: 0, y: 14, w: 54, s: 1 },
  subtitle: { x: 0, y: 56, w: 42, s: 1 },
  buttons: { x: 0, y: 72, s: 1 },
  times: { x: 0, y: 85, w: 56, s: 1 },
  image: { x: 57, y: 8, w: 39, z: 1 },
  logo: { x: 53.5, y: 3, w: 9, z: 3 },
  classes: { x: 86, y: 12, s: 1, z: 3 },
  teachers: { x: 70, y: 72, s: 1, z: 3 },
  // the text card used to sit on top of the picture — hidden by default for a cleaner look
  lesson: { x: 52, y: 58, s: 1, z: 3, hidden: true },
};

const num = (v: unknown, d: number, lo: number, hi: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d;
};

/** Saved layout merged over the defaults, with every number clamped to a sane range. */
export function resolveHeroLayout(saved?: Partial<HeroLayout> | null): HeroLayout {
  const out: HeroLayout = {};
  for (const el of HERO_ELEMENTS) {
    const d = DEFAULT_HERO_LAYOUT[el.id];
    const s = (saved?.[el.id] ?? {}) as Partial<HeroBox>;
    out[el.id] = {
      x: num(s.x, d.x, -10, 100),
      y: num(s.y, d.y, -10, 100),
      w: d.w !== undefined || s.w !== undefined ? num(s.w, d.w ?? 30, 4, 100) : undefined,
      s: num(s.s, d.s ?? 1, 0.4, 2.5),
      z: num(s.z, d.z ?? 2, 0, 9),
      hidden: typeof s.hidden === "boolean" ? s.hidden : !!d.hidden,
    };
  }
  return out;
}
