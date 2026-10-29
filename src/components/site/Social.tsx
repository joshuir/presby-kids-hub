import { Facebook, Instagram, MessageCircle, Music2, Twitter, Youtube, Link2, type LucideIcon } from "lucide-react";

const ICONS: Record<string, [LucideIcon, string]> = {
  facebook: [Facebook, "#1877F2"],
  instagram: [Instagram, "#E1306C"],
  youtube: [Youtube, "#FF0000"],
  tiktok: [Music2, "#111111"],
  x: [Twitter, "#111111"],
  twitter: [Twitter, "#111111"],
  whatsapp: [MessageCircle, "#25D366"],
};

export function socialIcon(network: string): [LucideIcon, string] {
  return ICONS[network.toLowerCase()] ?? [Link2, "#2563EB"];
}
