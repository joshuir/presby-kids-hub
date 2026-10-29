import {
  BookOpen,
  CalendarDays,
  Gamepad2,
  GraduationCap,
  Heart,
  Home,
  Info,
  Landmark,
  MessageCircle,
  Newspaper,
  Shield,
  Shirt,
  Sparkles,
  UserPlus,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavLink = { href: string; label: string; description: string; icon: LucideIcon };
export type NavSection = { key: string; label: string; href: string; icon: LucideIcon; children?: NavLink[] };

/**
 * Site map: six top-level sections; related pages live under their section
 * (desktop dropdowns, mobile accordion, page-level sub-navigation, footer).
 */
export const SITE_NAV: NavSection[] = [
  { key: "home", label: "Home", href: "/", icon: Home },
  {
    key: "about",
    label: "About",
    href: "/about/",
    icon: Info,
    children: [
      { href: "/about/", label: "Who we are", description: "Mission, vision and values", icon: Heart },
      { href: "/about/#teachers", label: "Our teachers", description: "Meet the team who lead each class", icon: Users },
      { href: "/about/#safety", label: "Child safety", description: "How we keep every child safe", icon: Shield },
      { href: "/history-constitution/", label: "History & constitution", description: "Our story and how we are governed", icon: Landmark },
    ],
  },
  {
    key: "classes",
    label: "Classes",
    href: "/classes/",
    icon: GraduationCap,
    children: [
      { href: "/classes/", label: "All classes & lessons", description: "Weekly lessons, videos and worksheets", icon: BookOpen },
      { href: "/register/", label: "Register a child", description: "Join a class in a couple of minutes", icon: UserPlus },
      { href: "/account/", label: "Parent account", description: "Your children, classes and badges", icon: UserRound },
    ],
  },
  {
    key: "kids",
    label: "Kids Zone",
    href: "/games/",
    icon: Sparkles,
    children: [
      { href: "/games/", label: "Bible games", description: "Quizzes, mascots, streaks and badges", icon: Gamepad2 },
      { href: "/shop/", label: "Clothing collection", description: "Tees and hoodies on the rack", icon: Shirt },
    ],
  },
  {
    key: "news",
    label: "News",
    href: "/blog/",
    icon: Newspaper,
    children: [
      { href: "/blog/", label: "Blog", description: "Bible stories, devotionals and guides", icon: Newspaper },
      { href: "/events/", label: "Events", description: "What’s coming up — add to your calendar", icon: CalendarDays },
    ],
  },
  { key: "contact", label: "Contact", href: "/contact/", icon: MessageCircle },
];

const clean = (p: string) => p.split("#")[0].replace(/\/+$/, "") || "/";

/** True when a link points at the current page (ignores #anchors). */
export function isCurrent(pathname: string, href: string) {
  return clean(pathname) === clean(href);
}

/** The section the current page belongs to. */
export function sectionFor(pathname: string): NavSection | undefined {
  const p = clean(pathname);
  if (p === "/") return SITE_NAV[0];
  if (p.startsWith("/blog")) return SITE_NAV.find((s) => s.key === "news");
  if (p.startsWith("/classes") || p.startsWith("/worksheet")) return SITE_NAV.find((s) => s.key === "classes");
  return SITE_NAV.find((s) => s.href !== "/" && (clean(s.href) === p || s.children?.some((c) => clean(c.href) === p)));
}

/** The page entry (child link) for the current path, if any. */
export function pageFor(pathname: string) {
  const sec = sectionFor(pathname);
  const p = clean(pathname);
  const page = sec?.children?.find((c) => clean(c.href) === p && !c.href.includes("#"));
  return { section: sec, page };
}
