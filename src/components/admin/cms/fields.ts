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
  | "classRef";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  help?: string;
  required?: boolean;
  wide?: boolean;
  /** for media fields: file types the upload button accepts (default images) */
  accept?: string;
};

export const SCHEMAS: Record<Exclude<CollectionName, "leaderboard">, Field[]> = {
  lessons: [
    { key: "title", label: "Lesson title", type: "text", required: true, wide: true },
    { key: "classId", label: "Class", type: "classRef", required: true },
    { key: "lessonDate", label: "Lesson date (Sunday)", type: "date", required: true },
    { key: "bibleRef", label: "Bible reference", type: "text", required: true },
    { key: "memoryVerse", label: "Memory verse", type: "text", wide: true },
    { key: "description", label: "Story summary / description", type: "textarea", wide: true },
    { key: "mainThrust", label: "Main thrust (central spiritual takeaway)", type: "textarea", wide: true },
    { key: "objectives", label: "Learning objectives (one per line)", type: "lines", wide: true },
    { key: "bannerUrl", label: "Promotional banner (wide image)", type: "media" },
    { key: "flyerUrl", label: "Lesson flyer (portrait image)", type: "media" },
    { key: "introVideoUrl", label: "Introductory / snippet video (YouTube, Vimeo or upload)", type: "video", wide: true },
    { key: "storyMedia", label: "Bible story pictures & videos", type: "mediaList", wide: true },
    { key: "resources", label: "Downloads (notes, worksheets, activity sheets)", type: "resources", wide: true },
  ],
  classes: [
    { key: "name", label: "Class name", type: "text", required: true },
    { key: "group", label: "Group", type: "select", options: ["Beginners", "Primary", "Juniors", "Seniors"] },
    { key: "ageRange", label: "Age range", type: "text" },
    { key: "schedule", label: "Schedule", type: "text" },
    { key: "teacher", label: "Teacher(s)", type: "text" },
    { key: "color", label: "Accent colour", type: "color" },
    { key: "order", label: "Display order", type: "number" },
    { key: "focus", label: "Learning focus", type: "textarea", wide: true },
  ],
  questions: [
    { key: "question", label: "Question", type: "textarea", required: true, wide: true },
    { key: "options", label: "Answer options (tick the correct one)", type: "options", wide: true },
    { key: "story", label: "Bible story", type: "text", required: true },
    { key: "ref", label: "Bible reference", type: "text" },
    { key: "testament", label: "Testament", type: "select", options: ["OT", "NT"] },
    { key: "difficulty", label: "Difficulty", type: "select", options: ["easy", "medium", "hard", "expert"] },
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
  settings: [
    { key: "siteName", label: "Site name", type: "text", required: true },
    { key: "churchName", label: "Church name", type: "text" },
    { key: "tagline", label: "Tagline", type: "text", wide: true },
    { key: "announcement", label: "Announcement bar (leave empty to hide)", type: "text", wide: true },
    { key: "heroTitle", label: "Home — hero headline", type: "text", wide: true },
    { key: "heroSubtitle", label: "Home — hero subtitle", type: "textarea", wide: true },
    { key: "heroImage", label: "Home — hero photo (optional)", type: "media" },
    { key: "welcomeVideoUrl", label: "Home — welcome video (YouTube link or upload)", type: "video" },
    { key: "impactStats", label: "Home — impact stats (one per line: Label|Value)", type: "lines", wide: true },
    { key: "mission", label: "About — mission", type: "textarea", wide: true },
    { key: "vision", label: "About — vision", type: "textarea", wide: true },
    { key: "values", label: "About — values (one per line)", type: "lines", wide: true },
    { key: "background", label: "About — church background", type: "textarea", wide: true },
    { key: "historyIntro", label: "History — introduction", type: "textarea", wide: true },
    { key: "constitutionPdf", label: "Constitution PDF (optional — otherwise printed from the sections)", type: "media", accept: "application/pdf" },
    { key: "serviceTimes", label: "Service times (one per line)", type: "lines", wide: true },
    { key: "address", label: "Address", type: "text", wide: true },
    { key: "mapQuery", label: "Google Maps search (place name or address)", type: "text", wide: true },
    { key: "phone", label: "Phone", type: "text" },
    { key: "whatsapp", label: "WhatsApp number (with country code)", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "facebook", label: "Facebook URL", type: "text" },
    { key: "youtube", label: "YouTube URL", type: "text" },
    { key: "instagram", label: "Instagram URL", type: "text" },
    { key: "privacyBody", label: "Privacy & cookies page (## heading, - bullet, **bold**)", type: "textarea", wide: true },
    { key: "termsBody", label: "Terms page", type: "textarea", wide: true },
  ],
  teachers: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "role", label: "Role", type: "text" },
    { key: "photo", label: "Photo", type: "media" },
    { key: "order", label: "Display order", type: "number" },
    { key: "classIds", label: "Class IDs taught (one per line, e.g. pri-1)", type: "lines" },
    { key: "bio", label: "Short bio", type: "textarea", wide: true },
  ],
  posts: [
    { key: "title", label: "Title", type: "text", required: true, wide: true },
    { key: "slug", label: "URL slug (letters, numbers, dashes)", type: "text", required: true },
    { key: "category", label: "Category", type: "select", options: ["Bible Stories", "Devotionals", "Parent Guides", "Kids Activities"] },
    { key: "date", label: "Date", type: "date", required: true },
    { key: "author", label: "Author", type: "text" },
    { key: "excerpt", label: "Summary (shown on cards and in Google)", type: "textarea", wide: true },
    { key: "body", label: "Article (## heading, - bullet, **bold**)", type: "textarea", wide: true },
    { key: "cover", label: "Cover image", type: "media" },
    { key: "videoUrl", label: "Video (YouTube link or upload)", type: "video" },
    { key: "audioUrl", label: "Audio (SoundCloud link or MP3 upload)", type: "media", accept: "audio/mpeg" },
    { key: "tags", label: "Tags (one per line)", type: "lines" },
  ],
  events: [
    { key: "title", label: "Event title", type: "text", required: true, wide: true },
    { key: "date", label: "Date", type: "date", required: true },
    { key: "category", label: "Category", type: "text" },
    { key: "startTime", label: "Start time (HH:MM)", type: "text" },
    { key: "endTime", label: "End time (HH:MM)", type: "text" },
    { key: "location", label: "Location", type: "text", wide: true },
    { key: "description", label: "Description", type: "textarea", wide: true },
    { key: "image", label: "Image / flyer", type: "media" },
    { key: "registerUrl", label: "Registration link (optional)", type: "text" },
  ],
  testimonials: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "role", label: "Role (e.g. Parent, Primary 2)", type: "text" },
    { key: "quote", label: "Quote", type: "textarea", required: true, wide: true },
    { key: "order", label: "Display order", type: "number" },
  ],
  milestones: [
    { key: "year", label: "Year", type: "text", required: true },
    { key: "title", label: "Title", type: "text", required: true },
    { key: "description", label: "Description", type: "textarea", wide: true },
    { key: "image", label: "Image (optional)", type: "media" },
    { key: "order", label: "Display order", type: "number" },
  ],
  constitution: [
    { key: "title", label: "Section title", type: "text", required: true, wide: true },
    { key: "body", label: "Section text (## heading, - bullet, **bold**)", type: "textarea", wide: true },
    { key: "order", label: "Display order", type: "number" },
  ],
  policies: [
    { key: "title", label: "Policy title", type: "text", required: true },
    { key: "icon", label: "Icon (emoji)", type: "text" },
    { key: "description", label: "Description", type: "textarea", wide: true },
    { key: "order", label: "Display order", type: "number" },
  ],
};

export function blank(col: CollectionName, extra: Record<string, unknown> = {}): Record<string, unknown> {
  const base: Record<string, unknown> = { status: "draft" };
  switch (col) {
    case "lessons":
      return {
        ...base,
        title: "",
        classId: "",
        lessonDate: new Date().toISOString().slice(0, 10),
        bibleRef: "",
        memoryVerse: "",
        description: "",
        mainThrust: "",
        objectives: [],
        bannerUrl: "",
        flyerUrl: "",
        introVideoUrl: "",
        storyMedia: [],
        resources: [],
        ...extra,
      };
    case "classes":
      return { ...base, name: "", group: "Primary", ageRange: "", schedule: "Sundays • 9:00 AM", teacher: "", color: "#2563EB", order: 99, focus: "", ...extra };
    case "questions":
      return { ...base, question: "", answer: "", options: ["", "", "", ""], story: "", ref: "", testament: "OT", difficulty: "easy", ...extra };
    case "mascots":
      return { ...base, name: "", emoji: "🐣", color: "#86EF99", unlockXp: 0, description: "", ...extra };
    case "products":
      return {
        ...base,
        name: "",
        category: "tee",
        price: 0,
        currency: "GHS",
        order: 99,
        description: "",
        frontPrint: "",
        backPrint: "",
        colorways: [{ name: "White", hex: "#F8F8F8", printHex: "#111111", tagHex: "#F8F8F8" }],
        sizes: ["S", "M", "L", "XL"],
        stock: { S: 0, M: 0, L: 0, XL: 0 },
        frontImage: "",
        backImage: "",
        ...extra,
      };
    case "teachers":
      return { ...base, name: "", role: "", classIds: [], bio: "", photo: "", order: 99, ...extra };
    case "posts":
      return { ...base, title: "", slug: "", category: "Bible Stories", excerpt: "", body: "", cover: "", videoUrl: "", audioUrl: "", author: "Children’s Ministry Team", date: new Date().toISOString().slice(0, 10), tags: [], ...extra };
    case "events":
      return { ...base, title: "", date: new Date().toISOString().slice(0, 10), startTime: "09:00", endTime: "", location: "", description: "", image: "", category: "", registerUrl: "", ...extra };
    case "testimonials":
      return { ...base, quote: "", name: "", role: "", order: 99, ...extra };
    case "milestones":
      return { ...base, year: String(new Date().getFullYear()), title: "", description: "", image: "", order: 99, ...extra };
    case "constitution":
      return { ...base, title: "", body: "", order: 99, ...extra };
    case "policies":
      return { ...base, title: "", icon: "🛡️", description: "", order: 99, ...extra };
    default:
      return { ...base, ...extra };
  }
}

export function titleOf(col: CollectionName, d: Record<string, unknown>) {
  if (col === "settings") return "Site settings & page text";
  if (col === "milestones") return `${d.year ?? ""} — ${d.title ?? ""}`;
  return String(d.title ?? d.name ?? d.question ?? d.id ?? "Untitled");
}
