import type { SiteSettingsDoc } from "@/lib/cms/types";

/** Google Fonts the CMS offers, with the weight spec Google accepts for each. "local" = bundled with the site. */
export const FONTS: { name: string; kind: "heading" | "body" | "both"; spec: string; local?: boolean; style: string }[] = [
  { name: "Bricolage Grotesque", kind: "heading", spec: "wght@400..800", local: true, style: "Friendly grotesque" },
  { name: "Nunito Sans", kind: "body", spec: "wght@400..800", local: true, style: "Soft & readable" },
  { name: "Fredoka", kind: "heading", spec: "wght@400..700", style: "Rounded & playful" },
  { name: "Baloo 2", kind: "heading", spec: "wght@400..800", style: "Bubbly" },
  { name: "Poppins", kind: "both", spec: "wght@400;500;600;700;800", style: "Geometric" },
  { name: "Montserrat", kind: "both", spec: "wght@400..800", style: "Bold & modern" },
  { name: "Outfit", kind: "both", spec: "wght@400..800", style: "Clean geometric" },
  { name: "Plus Jakarta Sans", kind: "both", spec: "wght@400..800", style: "Crisp" },
  { name: "Quicksand", kind: "both", spec: "wght@400..700", style: "Light & rounded" },
  { name: "Nunito", kind: "both", spec: "wght@400..800", style: "Rounded sans" },
  { name: "Raleway", kind: "both", spec: "wght@400..800", style: "Elegant sans" },
  { name: "Space Grotesk", kind: "heading", spec: "wght@400..700", style: "Techy" },
  { name: "Playfair Display", kind: "heading", spec: "wght@400..800", style: "Classic serif" },
  { name: "DM Serif Display", kind: "heading", spec: "ital@0;1", style: "Editorial serif" },
  { name: "Merriweather", kind: "both", spec: "wght@400;700;900", style: "Sturdy serif" },
  { name: "Lora", kind: "both", spec: "wght@400..700", style: "Book serif" },
  { name: "Inter", kind: "both", spec: "wght@400..800", style: "Neutral UI" },
  { name: "Open Sans", kind: "body", spec: "wght@400..800", style: "Classic web" },
  { name: "Lato", kind: "body", spec: "wght@400;700;900", style: "Warm" },
  { name: "Roboto", kind: "body", spec: "wght@400;500;700;900", style: "Familiar" },
  { name: "Source Sans 3", kind: "body", spec: "wght@400..800", style: "Plain & clear" },
  { name: "DM Sans", kind: "body", spec: "wght@400..800", style: "Low-contrast" },
  { name: "Work Sans", kind: "body", spec: "wght@400..800", style: "Grotesk" },
  { name: "Mulish", kind: "body", spec: "wght@400..800", style: "Minimal" },
];

export const THEME_DEFAULTS = {
  themePrimary: "#2563EB",
  themeAccent: "#FFC53D",
  themeCoral: "#FF7A59",
  themeMint: "#22C55E",
  themeInk: "#0B1530",
  themeBg: "#FBFAF7",
  themeSurface: "#F4F1EA",
  fontHeading: "Bricolage Grotesque",
  fontBody: "Nunito Sans",
  themeRadius: "rounded",
  buttonStyle: "3d",
} as const;

export const THEME_PRESETS: { name: string; values: Partial<Record<keyof typeof THEME_DEFAULTS, string>> }[] = [
  { name: "Ministry blue (original)", values: { ...THEME_DEFAULTS } },
  { name: "Sunrise", values: { themePrimary: "#EA580C", themeAccent: "#FACC15", themeCoral: "#E11D48", themeMint: "#16A34A", themeInk: "#1C1917", themeBg: "#FFFBF5", themeSurface: "#FDF0E1" } },
  { name: "Forest", values: { themePrimary: "#15803D", themeAccent: "#FBBF24", themeCoral: "#F97316", themeMint: "#10B981", themeInk: "#052E16", themeBg: "#F7FAF5", themeSurface: "#EAF2E6" } },
  { name: "Royal", values: { themePrimary: "#7C3AED", themeAccent: "#F59E0B", themeCoral: "#EC4899", themeMint: "#14B8A6", themeInk: "#1E1B4B", themeBg: "#FAF8FF", themeSurface: "#F0ECFB" } },
  { name: "Ocean", values: { themePrimary: "#0891B2", themeAccent: "#FDE047", themeCoral: "#FB7185", themeMint: "#22C55E", themeInk: "#0C2A36", themeBg: "#F6FBFC", themeSurface: "#E5F3F6" } },
  { name: "Berry", values: { themePrimary: "#BE185D", themeAccent: "#FCD34D", themeCoral: "#F97316", themeMint: "#22C55E", themeInk: "#2A0A1B", themeBg: "#FFF8FB", themeSurface: "#FBE9F1" } },
];

const HEX = /^#[0-9a-f]{6}$/i;
const pick = (v: unknown, d: string) => (typeof v === "string" && HEX.test(v.trim()) ? v.trim() : d);
const mix = (c: string, pct: number, with_: string) => `color-mix(in srgb, ${c} ${pct}%, ${with_})`;

/** CSS for the current theme, as custom properties on :root. */
export function themeCss(s: Partial<SiteSettingsDoc>) {
  const P = pick(s.themePrimary, THEME_DEFAULTS.themePrimary);
  const A = pick(s.themeAccent, THEME_DEFAULTS.themeAccent);
  const C = pick(s.themeCoral, THEME_DEFAULTS.themeCoral);
  const M = pick(s.themeMint, THEME_DEFAULTS.themeMint);
  const I = pick(s.themeInk, THEME_DEFAULTS.themeInk);
  const B = pick(s.themeBg, THEME_DEFAULTS.themeBg);
  const S = pick(s.themeSurface, THEME_DEFAULTS.themeSurface);
  const fh = FONTS.find((f) => f.name === s.fontHeading)?.name ?? THEME_DEFAULTS.fontHeading;
  const fb = FONTS.find((f) => f.name === s.fontBody)?.name ?? THEME_DEFAULTS.fontBody;
  const local = (n: string) => (FONTS.find((f) => f.name === n)?.local ? `"${n} Variable", "${n}"` : `"${n}"`);
  const radius = s.themeRadius === "sharp" ? ".5rem" : s.themeRadius === "soft" ? "1.1rem" : "1.75rem";
  const btnRadius = s.themeRadius === "sharp" ? ".5rem" : s.themeRadius === "soft" ? ".9rem" : "9999px";
  const vars: Record<string, string> = {
    "--color-blueBrand-50": mix(P, 7, "white"),
    "--color-blueBrand-100": mix(P, 15, "white"),
    "--color-blueBrand-200": mix(P, 28, "white"),
    "--color-blueBrand-300": mix(P, 45, "white"),
    "--color-blueBrand-400": mix(P, 70, "white"),
    "--color-blueBrand-500": mix(P, 88, "white"),
    "--color-blueBrand-600": P,
    "--color-blueBrand-700": mix(P, 85, "black"),
    "--color-blueBrand-800": mix(P, 70, "black"),
    "--color-blueBrand-900": mix(P, 55, "black"),
    "--color-sky-soft": mix(P, 10, "white"),
    "--color-sun": A,
    "--color-sun-soft": mix(A, 18, "white"),
    "--color-coral": C,
    "--color-mint": M,
    "--color-ink": I,
    "--color-ink-2": mix(I, 80, "white"),
    "--color-navy-800": mix(I, 85, "white"),
    "--color-cream": B,
    "--color-paper": S,
    "--font-heading": local(fh),
    "--font-sans": local(fb),
    "--cm-radius": radius,
    "--cm-btn-radius": btnRadius,
  };
  return `:root{${Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(";")}}`;
}

/** Google Fonts stylesheet URL for fonts that aren't bundled (null if both are local). */
export function fontHref(s: Partial<SiteSettingsDoc>) {
  const names = [s.fontHeading, s.fontBody]
    .map((n) => FONTS.find((f) => f.name === n))
    .filter((f): f is (typeof FONTS)[number] => !!f && !f.local);
  if (!names.length) return null;
  const fam = [...new Map(names.map((f) => [f.name, f])).values()].map((f) => `family=${f.name.replace(/ /g, "+")}:${f.spec}`).join("&");
  return `https://fonts.googleapis.com/css2?${fam}&display=swap`;
}

export function fontPreviewHref(names: string[]) {
  const fs = FONTS.filter((f) => names.includes(f.name) && !f.local);
  if (!fs.length) return null;
  return `https://fonts.googleapis.com/css2?${fs.map((f) => `family=${f.name.replace(/ /g, "+")}:${f.spec}`).join("&")}&display=swap`;
}
