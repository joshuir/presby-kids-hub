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

/** Round brand badge (white glyph on the brand colour). */
export function SocialBadge({ network, size = 40, className }: { network: string; size?: number; className?: string }) {
  const key = brandKey(network);
  return (
    <span
      className={"inline-grid shrink-0 place-items-center rounded-full text-white " + (className ?? "")}
      style={{ width: size, height: size, background: BRAND_BG[key] ?? "#2563EB" }}
    >
      <BrandGlyph name={key} className="h-[48%] w-[48%]" />
    </span>
  );
}
