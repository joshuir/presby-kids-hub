import { Link2 } from "lucide-react";
import type { ComponentType } from "react";
import { BRAND } from "./brandIcons";

type IconProps = { className?: string; "aria-hidden"?: boolean | "true" };
type IconCmp = ComponentType<IconProps>;

const ALIAS: Record<string, string> = { twitter: "x", "x (twitter)": "x", fb: "facebook", ig: "instagram", yt: "youtube", wa: "whatsapp" };

/** Brand backgrounds — Instagram uses its real gradient. */
export const BRAND_BG: Record<string, string> = {
  facebook: "#0866FF",
  instagram: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
  youtube: "#FF0000",
  tiktok: "#000000",
  x: "#000000",
  whatsapp: "#25D366",
  linkedin: "#0A66C2",
  threads: "#000000",
  spotify: "#1DB954",
  telegram: "#26A5E4",
};

export function brandKey(network: string) {
  const k = network.trim().toLowerCase();
  return ALIAS[k] ?? k;
}

export function BrandGlyph({ name, className }: { name: string; className?: string }) {
  const b = BRAND[brandKey(name)];
  if (!b) return <Link2 className={className} aria-hidden />;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d={b.path} />
    </svg>
  );
}

/** [Icon component, solid brand colour, badge background] */
export function socialIcon(network: string): [IconCmp, string, string] {
  const key = brandKey(network);
  const Icon: IconCmp = ({ className }) => <BrandGlyph name={key} className={className} />;
  const hex = BRAND[key]?.hex ?? "#2563EB";
  return [Icon, hex === "#000000" ? "#111111" : hex, BRAND_BG[key] ?? hex];
}

/**
 * Logos that are already a full mark (a circle or square with the symbol cut out) are drawn in
 * their real colour over a backing that shows through the cut-out — exactly how the brands
 * present them (Facebook's blue circle with a white "f", YouTube's red play button…).
 */
const FULL_MARK: Record<string, { fill: string; under: string; scale: number }> = {
  facebook: { fill: "#0866FF", under: "#FFFFFF", scale: 1 },
  telegram: { fill: "#26A5E4", under: "#FFFFFF", scale: 1 },
  spotify: { fill: "#1ED760", under: "#000000", scale: 1 },
  youtube: { fill: "#FF0000", under: "#FFFFFF", scale: 0.66 },
  linkedin: { fill: "#0A66C2", under: "#FFFFFF", scale: 0.6 },
};

/** Official-looking brand badge for a social network (falls back to a link icon). */
export function SocialBadge({ network, size = 40, className }: { network: string; size?: number; className?: string }) {
  const key = brandKey(network);
  const b = BRAND[key];
  const full = FULL_MARK[key];
  const base = "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full " + (className ?? "");
  if (b && full) {
    const ringed = full.scale < 1; // square marks sit on a white disc with a hairline ring
    return (
      <span className={base + (ringed ? " ring-1 ring-black/10" : "")} style={{ width: size, height: size, background: full.scale < 1 ? "#FFFFFF" : "transparent" }}>
        <svg viewBox="0 0 24 24" aria-hidden style={{ width: `${full.scale * 100}%`, height: `${full.scale * 100}%` }}>
          {full.scale === 1 ? <circle cx="12" cy="12" r="11.4" fill={full.under} /> : null}
          <path d={b.path} fill={full.fill} />
        </svg>
      </span>
    );
  }
  if (b && key === "tiktok") {
    // TikTok's note with its cyan / red offset glow
    return (
      <span className={base} style={{ width: size, height: size, background: "#000" }}>
        <svg viewBox="-3 -3 30 30" aria-hidden className="h-[62%] w-[62%]">
          <path d={b.path} fill="#25F4EE" transform="translate(-0.9 -0.9)" />
          <path d={b.path} fill="#FE2C55" transform="translate(0.9 0.9)" />
          <path d={b.path} fill="#FFFFFF" />
        </svg>
      </span>
    );
  }
  return (
    <span className={base + " text-white"} style={{ width: size, height: size, background: BRAND_BG[key] ?? "#2563EB" }}>
      <BrandGlyph name={key} className="h-[50%] w-[50%]" />
    </span>
  );
}
