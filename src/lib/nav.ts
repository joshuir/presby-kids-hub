import {
  CalendarDays,
  Gamepad2,
  GraduationCap,
  History,
  Users,
  Home,
  Images,
  Info,
  MessageCircle,
  Newspaper,
  Shirt,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type NavChild = { href: string; label: string; description: string; icon: LucideIcon };
export type NavItem = { key: string; href: string; label: string; icon: LucideIcon; children?: NavChild[]; mega?: "classes" };

/** Main menu — mirrors the reference site, plus a Kids Zone for games and the collection. */
export const NAV: NavItem[] = [
  { key: "home", href: "/", label: "Home", icon: Home },
  {
    key: "about",
    href: "/about/",
    label: "About",
    icon: Info,
    children: [
      { href: "/about/#about-us", label: "Vision & mission", description: "Our vision, mission and what we believe", icon: Info },
      { href: "/about/#team", label: "Our team", description: "Meet the teachers behind every class", icon: Users },
      { href: "/about/#history", label: "History & achievements", description: "Twenty years of growing faith", icon: History },
    ],
  },
  { key: "classes", href: "/classes/", label: "Classes", icon: GraduationCap, mega: "classes" },
  { key: "events", href: "/events/", label: "Events", icon: CalendarDays },
  { key: "blog", href: "/blog/", label: "Blog", icon: Newspaper },
  { key: "gallery", href: "/gallery/", label: "Gallery", icon: Images },
  {
    key: "kids",
    href: "/games/",
    label: "Kids Zone",
    icon: Sparkles,
    children: [
      { href: "/games/", label: "Bible Games", description: "Play through Bible stories, earn XP and badges", icon: Gamepad2 },
      { href: "/collection/", label: "Clothing Collection", description: "Pick a colour, flip it, shuffle the rack", icon: Shirt },
    ],
  },
  { key: "contact", href: "/contact/", label: "Contact", icon: MessageCircle },
];

const clean = (p: string) => p.split(/[?#]/)[0].replace(/\/+$/, "") || "/";

export function activeKey(pathname: string) {
  const p = clean(pathname);
  if (p === "/") return "home";
  if (p.startsWith("/classes")) return "classes";
  if (p.startsWith("/games") || p.startsWith("/collection")) return "kids";
  const hit = NAV.find((n) => n.href !== "/" && p.startsWith(clean(n.href)));
  return hit?.key ?? "";
}
