import {
  Blocks, CalendarDays, FileText, FolderOpen, GraduationCap, HelpCircle, History, Image as ImageIcon, Images, Inbox, KeyRound, LayoutDashboard,
  LayoutTemplate, ListOrdered, Map, Move, MessageSquare, Navigation, Newspaper, Palette, PanelBottom, PanelTop, Receipt, Settings, Shirt, Smile, Trophy,
  Type, Users, UserCog, type LucideIcon,
} from "lucide-react";

export type CmsTab =
  | "dashboard" | "theme" | "herolayout" | "navigation" | "footer" | "layouts" | "copy" | "settings" | "heroes" | "custompages" | "blocks"
  | "posts" | "events" | "gallery" | "classes" | "lessons" | "teachers" | "faqs" | "milestones"
  | "units" | "questions" | "mascots" | "leaderboard" | "products" | "orders"
  | "messages" | "comments" | "media" | "team" | "account";

export type TabDef = { key: CmsTab; label: string; icon: LucideIcon; group: string; perm?: string; keywords?: string };

export const TABS: TabDef[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "" },

  { key: "theme", label: "Theme & fonts", icon: Palette, group: "Website", perm: "pages", keywords: "colours colors fonts logo brand buttons corners design style" },
  { key: "navigation", label: "Navigation", icon: Navigation, group: "Website", perm: "pages", keywords: "menu header dropdown links button cta" },
  { key: "footer", label: "Footer", icon: PanelBottom, group: "Website", perm: "pages", keywords: "footer links social icons wordmark hover animation" },
  { key: "layouts", label: "Page layouts", icon: LayoutTemplate, group: "Website", perm: "pages", keywords: "sections order hide rearrange home page" },
  { key: "herolayout", label: "Home hero layout", icon: Move, group: "Website", perm: "pages", keywords: "hero drag move resize position image picture headline visual editor" },
  { key: "custompages", label: "Custom pages", icon: FileText, group: "Website", perm: "pages", keywords: "new page subpage" },
  { key: "blocks", label: "Blocks", icon: Blocks, group: "Website", perm: "pages", keywords: "sections banner cards video embed map cta" },
  { key: "heroes", label: "Page heroes", icon: PanelTop, group: "Website", perm: "pages", keywords: "banner heading top of page" },
  { key: "copy", label: "Site text & images", icon: Type, group: "Website", perm: "pages", keywords: "headings labels buttons wording copy" },
  { key: "settings", label: "Site settings", icon: Settings, group: "Website", perm: "pages", keywords: "contact phone email address animations payments shop policy" },

  { key: "posts", label: "Blog posts", icon: Newspaper, group: "Content", perm: "blog", keywords: "news verse feed" },
  { key: "events", label: "Events", icon: CalendarDays, group: "Content", perm: "events", keywords: "calendar" },
  { key: "gallery", label: "Gallery", icon: Images, group: "Content", perm: "gallery", keywords: "photos albums videos" },
  { key: "classes", label: "Classes", icon: GraduationCap, group: "Content", perm: "classes" },
  { key: "lessons", label: "Lessons", icon: ListOrdered, group: "Content", perm: "lessons" },
  { key: "teachers", label: "Teachers", icon: Users, group: "Content", perm: "teachers", keywords: "team staff" },
  { key: "faqs", label: "FAQs", icon: HelpCircle, group: "Content", perm: "pages", keywords: "questions" },
  { key: "milestones", label: "History & achievements", icon: History, group: "Content", perm: "pages", keywords: "timeline" },

  { key: "units", label: "Game units", icon: Map, group: "Kids Zone", perm: "questions" },
  { key: "questions", label: "Game questions", icon: HelpCircle, group: "Kids Zone", perm: "questions", keywords: "quiz bible" },
  { key: "mascots", label: "Mascots", icon: Smile, group: "Kids Zone", perm: "mascots" },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy, group: "Kids Zone", perm: "leaderboard", keywords: "scores players" },

  { key: "products", label: "Clothing", icon: Shirt, group: "Shop", perm: "products", keywords: "products stock sizes prices" },
  { key: "orders", label: "Orders", icon: Receipt, group: "Shop", perm: "products", keywords: "payments delivery" },

  { key: "messages", label: "Messages", icon: Inbox, group: "Inbox", perm: "messages", keywords: "contact form registrations" },
  { key: "comments", label: "Comments", icon: MessageSquare, group: "Inbox", perm: "blog" },

  { key: "media", label: "Media library", icon: ImageIcon, group: "Admin", keywords: "uploads files images" },
  { key: "team", label: "Sub-admins", icon: UserCog, group: "Admin", keywords: "users permissions staff" },
  { key: "account", label: "My account", icon: KeyRound, group: "Admin", keywords: "password" },
];

export const GROUP_ICON: Record<string, LucideIcon> = { Website: Palette, Content: FolderOpen };
