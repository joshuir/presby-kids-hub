import type { LayoutItem } from "@/lib/cms/types";

/** Built-in sections of each page, in their default order. Admins reorder / hide them in CMS → Page layouts. */
export const PAGE_SECTIONS: Record<string, { label: string; path: string; sections: { id: string; label: string }[] }> = {
  home: {
    label: "Home",
    path: "/",
    sections: [
      { id: "hero", label: "Hero (big heading & photos)" },
      { id: "photowall", label: "Photo wall" },
      { id: "welcome", label: "Welcome message & stats" },
      { id: "sunday", label: "Sunday service" },
      { id: "classes", label: "Classes" },
      { id: "events", label: "Upcoming events & calendar" },
      { id: "lesson", label: "Featured Bible lesson" },
      { id: "kids", label: "Kids Zone (games & clothing)" },
      { id: "feed", label: "Latest blog posts" },
      { id: "gallery", label: "Gallery rail" },
      { id: "team", label: "Teachers" },
      { id: "app", label: "Mobile app promo" },
      { id: "social", label: "Social media" },
      { id: "faqs", label: "FAQs" },
      { id: "newsletter", label: "Newsletter sign-up" },
    ],
  },
  about: {
    label: "About",
    path: "/about/",
    sections: [
      { id: "hero", label: "Page hero" },
      { id: "about-us", label: "Vision & mission" },
      { id: "team", label: "Our team" },
      { id: "history", label: "History timeline" },
      { id: "achievements", label: "Achievements" },
    ],
  },
  classes: { label: "Classes", path: "/classes/", sections: [{ id: "hero", label: "Page hero" }, { id: "groups", label: "Age groups & classes" }] },
  events: {
    label: "Events",
    path: "/events/",
    sections: [{ id: "hero", label: "Page hero" }, { id: "upcoming", label: "Coming up (with add-to-calendar)" }, { id: "calendar", label: "Calendar / list & past events" }],
  },
  blog: { label: "Blog", path: "/blog/", sections: [{ id: "hero", label: "Page hero" }, { id: "feed", label: "Posts feed & sidebar" }] },
  gallery: { label: "Gallery", path: "/gallery/", sections: [{ id: "hero", label: "Page hero" }, { id: "main", label: "Albums, search & photos" }] },
  games: { label: "Bible Games", path: "/games/", sections: [{ id: "hero", label: "Page hero" }, { id: "game", label: "The game" }] },
  collection: { label: "Clothing collection", path: "/collection/", sections: [{ id: "hero", label: "Page hero" }, { id: "shop", label: "Showcase & shop" }] },
  contact: {
    label: "Contact",
    path: "/contact/",
    sections: [{ id: "hero", label: "Page hero" }, { id: "cards", label: "Call / WhatsApp / Email / Visit cards" }, { id: "form", label: "Message form, service times & socials" }, { id: "map", label: "Map" }, { id: "faqs", label: "FAQs" }],
  },
};

/** The page's sections in display order: saved layout first, then any new built-in sections not in it yet. */
export function resolveLayout(page: string, saved?: LayoutItem[]): LayoutItem[] {
  const def = PAGE_SECTIONS[page]?.sections ?? [];
  const list = Array.isArray(saved) ? saved.filter((x) => x && typeof x.id === "string") : [];
  const known = new Set(list.map((x) => x.id));
  const out = [...list];
  def.forEach((d, i) => {
    if (known.has(d.id)) return;
    // insert a newly added built-in section after its default predecessor
    const prev = def[i - 1]?.id;
    const at = prev ? out.findIndex((x) => x.id === prev) : -1;
    out.splice(at + 1, 0, { id: d.id });
  });
  return out.filter((x) => x.id.startsWith("block:") || def.some((d) => d.id === x.id));
}
