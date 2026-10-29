import type { CollectionName } from "@/lib/cms/types";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "color"
  | "date"
  | "lines"
  | "media"
  | "video"
  | "mediaList"
  | "resources"
  | "stock"
  | "colorways"
  | "options"
  | "classRef"
  | "ref"
  | "refs"
  | "imageList";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  help?: string;
  required?: boolean;
  wide?: boolean;
  /** for ref/refs fields: which lookup list to choose from (teachers, classes, events, lessons) */
  source?: string;
  /** for media fields: file types the upload button accepts (default images) */
  accept?: string;
};

const STATUS_HELP = "Use Publish / Unpublish / Schedule below to control when families see it.";

export const SCHEMAS: Record<Exclude<CollectionName, "leaderboard">, Field[]> = {
  settings: [
    { key: "siteName", label: "Site name", type: "text", required: true },
    { key: "churchName", label: "Church name (under the logo)", type: "text" },
    { key: "ctaLabel", label: "Header button text", type: "text" },
    { key: "footerBlurb", label: "Footer description", type: "textarea", wide: true },
    { key: "heroBadge", label: "Home — badge above the headline", type: "text" },
    { key: "heroTitle", label: "Home — headline (first line)", type: "text" },
    { key: "heroWords", label: "Home — typed words (one per line)", type: "lines" },
    { key: "heroSubtitle", label: "Home — subtitle", type: "textarea", wide: true },
    { key: "heroImage", label: "Home — hero photo (optional; replaces the illustration)", type: "media" },
    { key: "serviceTimes", label: "Service times (one per line: Name|Time)", type: "lines", wide: true },
    { key: "welcomeTitle", label: "Welcome — title", type: "text" },
    { key: "welcomeName", label: "Welcome — signed by", type: "text" },
    { key: "welcomeRole", label: "Welcome — role", type: "text" },
    { key: "welcomeText", label: "Welcome — message", type: "textarea", wide: true },
    { key: "stats", label: "Stats (one per line: label|value)", type: "lines", wide: true },
    { key: "sundayTitle", label: "Sunday section — title", type: "text" },
    { key: "sundayImage", label: "Sunday section — photo (optional)", type: "media" },
    { key: "sundayIntro", label: "Sunday section — intro", type: "textarea", wide: true },
    { key: "sundaySteps", label: "Sunday steps (one per line: Title|Text)", type: "lines", wide: true },
    { key: "groups", label: "Age groups (one per line: key|Name|Ages|Description) — keys: beginners, primary, juniors, seniors", type: "lines", wide: true },
    { key: "featuredLessonId", label: "Featured Bible lesson (home page)", type: "ref", source: "lessons", wide: true },
    { key: "aboutTitle", label: "About — headline", type: "text" },
    { key: "aboutSubtitle", label: "About — subtitle", type: "text" },
    { key: "vision", label: "About — vision", type: "textarea", wide: true },
    { key: "missionIntro", label: "About — mission intro", type: "text", wide: true },
    { key: "missionItems", label: "About — mission points (one per line: Title|Text)", type: "lines", wide: true },
    { key: "historyTitle", label: "About — history title", type: "text" },
    { key: "historyPdf", label: "About — full history PDF (optional)", type: "media", accept: "application/pdf" },
    { key: "showApp", label: "Show the mobile app section", type: "select", options: ["yes", "no"] },
    { key: "appTitle", label: "App — title", type: "text" },
    { key: "appText", label: "App — text", type: "text", wide: true },
    { key: "googlePlayUrl", label: "App — Google Play link", type: "text" },
    { key: "appStoreUrl", label: "App — App Store link", type: "text" },
    { key: "socials", label: "Social channels (one per line: Network|Handle|Button|URL)", type: "lines", wide: true },
    { key: "phone", label: "Phone", type: "text" },
    { key: "whatsapp", label: "WhatsApp number", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "address", label: "Address", type: "text", wide: true },
    { key: "mapQuery", label: "Google Maps search", type: "text", wide: true },
    { key: "newsletterTitle", label: "Newsletter — title", type: "text" },
    { key: "newsletterText", label: "Newsletter — text", type: "text" },
    { key: "pagesUpdated", label: "Policy pages — 'last updated' date", type: "text" },
    { key: "safeguardingBody", label: "Safeguarding page (## heading, - bullet, **bold**)", type: "textarea", wide: true },
    { key: "accessibilityBody", label: "Accessibility page", type: "textarea", wide: true },
    { key: "privacyBody", label: "Privacy page", type: "textarea", wide: true },
    { key: "termsBody", label: "Terms page", type: "textarea", wide: true },
  ],
  classes: [
    { key: "name", label: "Class name", type: "text", required: true },
    { key: "group", label: "Age group", type: "select", options: ["beginners", "primary", "juniors", "seniors"] },
    { key: "number", label: "Number within group", type: "number" },
    { key: "ageRange", label: "Age range (e.g. Age 3–4)", type: "text" },
    { key: "room", label: "Room", type: "text" },
    { key: "schedule", label: "Schedule", type: "text" },
    { key: "color", label: "Badge colour", type: "color" },
    { key: "order", label: "Display order", type: "number" },
    { key: "teacherIds", label: "Teachers", type: "refs", source: "teachers", wide: true },
    { key: "description", label: "Description", type: "textarea", wide: true },
  ],
  lessons: [
    { key: "title", label: "Lesson title", type: "text", required: true, wide: true },
    { key: "classId", label: "Class", type: "classRef", required: true },
    { key: "lessonDate", label: "Sunday date", type: "date", required: true },
    { key: "slug", label: "URL name (letters, numbers, dashes)", type: "text", help: "Leave empty to create it from the title." },
    { key: "bibleRef", label: "Bible passage", type: "text", required: true },
    { key: "topic", label: "Topic", type: "text" },
    { key: "memoryVerse", label: "Memory verse (text only)", type: "text", wide: true },
    { key: "memoryRef", label: "Memory verse reference", type: "text" },
    { key: "objective", label: "Lesson objective", type: "textarea", wide: true },
    { key: "story", label: "The Bible story (blank line between paragraphs)", type: "textarea", wide: true },
    { key: "discussion", label: "Discussion questions (one per line)", type: "lines", wide: true },
    { key: "activityTitle", label: "Activity title", type: "text" },
    { key: "activitySteps", label: "Activity steps (one per line)", type: "lines", wide: true },
    { key: "prayer", label: "Prayer", type: "textarea", wide: true },
    { key: "bannerUrl", label: "Banner (wide image)", type: "media" },
    { key: "flyerUrl", label: "Flyer", type: "media" },
    { key: "introVideoUrl", label: "Intro video (YouTube link or upload)", type: "video" },
    { key: "storyMedia", label: "Story pictures & videos", type: "mediaList", wide: true },
    { key: "resources", label: "Downloads (use #print for the printable lesson sheet)", type: "resources", wide: true },
  ],
  teachers: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "role", label: "Role", type: "text" },
    { key: "team", label: "Team (About page filter)", type: "select", options: ["beginners", "primary", "juniors", "seniors", "leadership"] },
    { key: "since", label: "Serving since (year)", type: "text" },
    { key: "photo", label: "Photo (optional — initials shown otherwise)", type: "media" },
    { key: "order", label: "Display order", type: "number" },
    { key: "classIds", label: "Classes", type: "refs", source: "classes", wide: true },
    { key: "bio", label: "Short bio", type: "textarea", wide: true },
    { key: "highlights", label: "Highlights (one per line)", type: "lines", wide: true },
  ],
  posts: [
    { key: "kind", label: "Post type", type: "select", options: ["news", "verse", "photo", "video", "event"] },
    { key: "authorId", label: "Posted by", type: "ref", source: "teachers" },
    { key: "date", label: "Date", type: "date", required: true },
    { key: "pinned", label: "Pin to top", type: "select", options: ["no", "yes"] },
    { key: "body", label: "Post text", type: "textarea", required: true, wide: true },
    { key: "verse", label: "Verse (for verse posts)", type: "text", wide: true },
    { key: "verseRef", label: "Verse reference", type: "text" },
    { key: "eventId", label: "Event (for event posts)", type: "ref", source: "events" },
    { key: "images", label: "Photos", type: "imageList", wide: true },
    { key: "videoUrl", label: "Video (YouTube link or upload)", type: "video" },
    { key: "audioUrl", label: "Audio (MP3 upload or link)", type: "media", accept: "audio/mpeg" },
  ],
  events: [
    { key: "title", label: "Event title", type: "text", required: true, wide: true },
    { key: "date", label: "Date", type: "date", required: true },
    { key: "category", label: "Type", type: "select", options: ["Special days", "Family", "Camp", "Outreach", "Club"] },
    { key: "startTime", label: "Start time (HH:MM)", type: "text" },
    { key: "endTime", label: "End time (HH:MM)", type: "text" },
    { key: "location", label: "Location", type: "text", wide: true },
    { key: "description", label: "Description", type: "textarea", wide: true },
    { key: "image", label: "Image / flyer", type: "media" },
    { key: "registerUrl", label: "Registration link (optional)", type: "text" },
  ],
  gallery: [
    { key: "title", label: "Album title", type: "text", required: true, wide: true },
    { key: "category", label: "Category (e.g. Children Harvest, Camping)", type: "text" },
    { key: "date", label: "Month (YYYY-MM)", type: "text" },
    { key: "featured", label: "Show on the home page", type: "select", options: ["yes", "no"] },
    { key: "order", label: "Display order", type: "number" },
    { key: "cover", label: "Cover photo", type: "media" },
    { key: "description", label: "Description", type: "textarea", wide: true },
    { key: "media", label: "Photos & videos (group photos only, with consent)", type: "mediaList", wide: true },
  ],
  faqs: [
    { key: "question", label: "Question", type: "text", required: true, wide: true },
    { key: "category", label: "Topic", type: "select", options: ["Visiting", "Classes", "Safety", "Parents"] },
    { key: "order", label: "Display order", type: "number" },
    { key: "answer", label: "Answer", type: "textarea", required: true, wide: true },
  ],
  milestones: [
    { key: "year", label: "Year", type: "text", required: true },
    { key: "title", label: "Title", type: "text", required: true },
    { key: "order", label: "Display order", type: "number" },
    { key: "image", label: "Image (optional)", type: "media" },
    { key: "description", label: "Description", type: "textarea", wide: true },
  ],
  units: [
    { key: "title", label: "Unit title", type: "text", required: true },
    { key: "icon", label: "Icon (emoji)", type: "text" },
    { key: "color", label: "Colour", type: "color" },
    { key: "testament", label: "Testament", type: "select", options: ["OT", "NT", "Both"] },
    { key: "order", label: "Order on the path", type: "number" },
    { key: "stories", label: "Stories in this unit (exact story names, one per line; empty = whole testament)", type: "lines", wide: true },
    { key: "description", label: "Description", type: "textarea", wide: true },
  ],
  questions: [
    { key: "question", label: "Question", type: "text", required: true, wide: true },
    { key: "options", label: "Answer options", type: "options", wide: true },
    { key: "story", label: "Story", type: "text", required: true },
    { key: "ref", label: "Bible reference", type: "text" },
    { key: "testament", label: "Testament", type: "select", options: ["OT", "NT"] },
    { key: "difficulty", label: "Level", type: "select", options: ["easy", "medium", "hard", "expert"] },
    { key: "explain", label: "Shown after answering (optional, e.g. the verse)", type: "text", wide: true },
  ],
  mascots: [
    { key: "name", label: "Mascot name", type: "text", required: true },
    { key: "emoji", label: "Character (emoji)", type: "text", help: "Paste an emoji, e.g. 🦁" },
    { key: "color", label: "Default colour", type: "color" },
    { key: "unlockXp", label: "Unlocks at XP (0 = available to everyone)", type: "number" },
    { key: "description", label: "Description", type: "textarea", wide: true },
  ],
  products: [
    { key: "name", label: "Product name", type: "text", required: true, wide: true },
    { key: "category", label: "Garment type", type: "select", options: ["tee", "hoodie", "longsleeve", "other"] },
    { key: "price", label: "Price", type: "number" },
    { key: "currency", label: "Currency", type: "select", options: ["GHS", "GBP", "USD"] },
    { key: "order", label: "Display order", type: "number" },
    { key: "description", label: "Description", type: "textarea", wide: true },
    { key: "frontPrint", label: "Front print text (new line = new line)", type: "textarea" },
    { key: "backPrint", label: "Back print text", type: "textarea" },
    { key: "colorways", label: "Colour variants (tags)", type: "colorways", wide: true },
    { key: "sizes", label: "Sizes (one per line)", type: "lines" },
    { key: "stock", label: "Stock per size", type: "stock" },
    { key: "frontImage", label: "Base photo — front (optional; a white garment on a transparent PNG, recoloured automatically)", type: "media", help: "If set, the photo is shown and tinted live to each colour. Leave empty to use the illustrated garment." },
    { key: "backImage", label: "Base photo — back (optional)", type: "media" },
  ],
};

void STATUS_HELP;

export function blank(col: CollectionName, extra: Record<string, unknown> = {}): Record<string, unknown> {
  const base: Record<string, unknown> = { status: "draft" };
  const today = new Date().toISOString().slice(0, 10);
  const B: Partial<Record<CollectionName, Record<string, unknown>>> = {
    lessons: { title: "", classId: "", slug: "", lessonDate: today, bibleRef: "", topic: "", objective: "", memoryVerse: "", memoryRef: "", story: "", discussion: [], activityTitle: "", activitySteps: [], prayer: "", bannerUrl: "", flyerUrl: "", introVideoUrl: "", storyMedia: [], resources: [{ label: "Take-home sheet", url: "#print", kind: "worksheet" }] },
    classes: { name: "", group: "primary", number: 1, ageRange: "", room: "", schedule: "Sundays 9:00 – 10:45 am", teacherIds: [], color: "#2563EB", order: 99, description: "" },
    questions: { question: "", answer: "", options: ["", "", "", ""], story: "", ref: "", testament: "OT", difficulty: "easy", explain: "" },
    units: { title: "", icon: "⭐", color: "#2563EB", testament: "OT", stories: [], order: 99, description: "" },
    mascots: { name: "", emoji: "🐣", color: "#86EF99", unlockXp: 0, description: "" },
    teachers: { name: "", role: "", team: "primary", classIds: [], since: String(new Date().getFullYear()), bio: "", highlights: ["Safeguarding trained & checked"], photo: "", order: 99 },
    posts: { kind: "news", authorId: "", date: today, pinned: "no", body: "", verse: "", verseRef: "", eventId: "", images: [], videoUrl: "", audioUrl: "", reactions: {} },
    events: { title: "", date: today, startTime: "09:00", endTime: "", location: "", description: "", image: "", category: "Special days", registerUrl: "" },
    gallery: { title: "", category: "", date: today.slice(0, 7), featured: "no", order: 99, cover: "", description: "", media: [] },
    faqs: { question: "", answer: "", category: "Visiting", order: 99 },
    milestones: { year: String(new Date().getFullYear()), title: "", description: "", image: "", order: 99 },
    products: {
      name: "", category: "tee", price: 0, currency: "GHS", order: 99, description: "", frontPrint: "", backPrint: "",
      colorways: [{ name: "White", hex: "#F8F8F8", printHex: "#111111", tagHex: "#F8F8F8" }],
      sizes: ["S", "M", "L", "XL"], stock: { S: 0, M: 0, L: 0, XL: 0 }, frontImage: "", backImage: "",
    },
  };
  return { ...base, ...(B[col] ?? {}), ...extra };
}

export function titleOf(col: CollectionName, d: Record<string, unknown>) {
  if (col === "settings") return "Site settings & page text";
  if (col === "milestones") return `${d.year ?? ""} — ${d.title ?? ""}`;
  if (col === "posts") return String(d.body ?? "").slice(0, 60) || "New post";
  return String(d.title ?? d.name ?? d.question ?? d.id ?? "Untitled");
}
