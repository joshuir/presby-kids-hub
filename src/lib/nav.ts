import type { LucideIcon } from "lucide-react";
import type { MenuItem } from "@/lib/cms/types";
import { iconFor } from "@/lib/icons";

export type NavChild = { href: string; label: string; description: string; icon: LucideIcon };
export type NavItem = { key: string; href: string; label: string; icon: LucideIcon; children?: NavChild[]; mega?: "classes" };

/** Starter menu — admins change it in CMS → Navigation. */
export const DEFAULT_MENU: MenuItem[] = [
  { label: "Home", href: "/", icon: "Home" },
  { label: "About", href: "/about/", icon: "Info" },
  { label: "Classes", href: "/classes/", icon: "GraduationCap", mega: "classes" },
  { label: "Events", href: "/events/", icon: "CalendarDays" },
  { label: "Blog", href: "/blog/", icon: "Newspaper" },
  { label: "Gallery", href: "/gallery/", icon: "Images" },
  {
    label: "Kids Zone",
    href: "/games/",
    icon: "Sparkles",
    children: [
      { href: "/games/", label: "Bible Games", description: "Play through Bible stories, earn XP and badges", icon: "Gamepad2" },
      { href: "/collection/", label: "Clothing Collection", description: "Pick a colour, flip it, shuffle the rack", icon: "Shirt" },
    ],
  },
  { label: "Contact", href: "/contact/", icon: "MessageCircle" },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";

/** Menu from the CMS (or the starter menu) as renderable nav items. */
export function buildNav(menu?: MenuItem[]): NavItem[] {
  const src = Array.isArray(menu) && menu.length ? menu : DEFAULT_MENU;
  return src
    .filter((m) => m && m.label && !m.hidden)
    .map((m, i) => {
      const kids = (m.children ?? []).filter((c) => c.label && !c.hidden);
      return {
        key: `${slug(m.label)}-${i}`,
        href: m.href || "/",
        label: m.label,
        icon: iconFor(m.icon),
        mega: m.mega === "classes" ? "classes" : undefined,
        children: kids.length ? kids.map((c) => ({ href: c.href || "/", label: c.label, description: c.description ?? "", icon: iconFor(c.icon) })) : undefined,
      };
    });
}

const clean = (p: string) => p.split(/[?#]/)[0].replace(/\/+$/, "") || "/";

/** Which top-level item is active for a path (an item is active if it or any of its children match). */
export function activeKey(pathname: string, nav: NavItem[]) {
  const p = clean(pathname);
  if (p === "/") return nav.find((n) => clean(n.href) === "/")?.key ?? "";
  let best = "";
  let len = 0;
  for (const n of nav) {
    for (const h of [n.href, ...(n.children ?? []).map((c) => c.href)]) {
      const c = clean(h);
      if (c !== "/" && (p === c || p.startsWith(c + "/")) && c.length > len) {
        best = n.key;
        len = c.length;
      }
    }
  }
  return best;
}
