// Shared content types for the Kids Hub CMS.

export type Status = "draft" | "published" | "scheduled" | "archived";

export type CollectionName =
  | "classes"
  | "lessons"
  | "questions"
  | "units"
  | "mascots"
  | "products"
  | "leaderboard"
  | "settings"
  | "teachers"
  | "posts"
  | "events"
  | "gallery"
  | "faqs"
  | "milestones"
  | "heroes"
  | "blocks"
  | "custompages";

export const COLLECTIONS: CollectionName[] = [
  "classes", "lessons", "questions", "units", "mascots", "products", "leaderboard",
  "settings", "teachers", "posts", "events", "gallery", "faqs", "milestones", "heroes", "blocks", "custompages",
];

export type BaseDoc = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ClassGroupKey = "beginners" | "primary" | "juniors" | "seniors";

export type ClassDoc = BaseDoc & {
  name: string;
  group: ClassGroupKey;
  number: number; // 1, 2, 3 within the group
  ageRange: string; // "Age 3–4"
  description: string;
  room: string;
  teacherIds: string[];
  schedule: string;
  color: string;
  order: number;
  status: Status;
};

export type MediaItem = { type: "image" | "video"; url: string; caption?: string };
export type ResourceItem = {
  label: string;
  url: string;
  kind: "notes" | "worksheet" | "activity" | "audio" | "image" | "other";
};

export type LessonDoc = BaseDoc & {
  classId: string;
  slug: string;
  title: string;
  lessonDate: string; // YYYY-MM-DD
  bibleRef: string;
  topic: string;
  objective: string;
  memoryVerse: string; // text only
  memoryRef: string;
  story: string; // paragraphs separated by blank lines
  discussion: string[];
  activityTitle: string;
  activitySteps: string[];
  prayer: string;
  bannerUrl: string;
  flyerUrl: string;
  introVideoUrl: string;
  storyMedia: MediaItem[];
  resources: ResourceItem[];
  status: Status;
  publishAt?: string;
};

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export type QuestionDoc = BaseDoc & {
  story: string;
  testament: "OT" | "NT";
  ref: string;
  difficulty: Difficulty;
  question: string;
  answer: string;
  options: string[];
  /** shown after answering, e.g. the verse */
  explain?: string;
  status: Status;
};

/** A game category ("unit") on the learning path. */
export type UnitDoc = BaseDoc & {
  title: string;
  description: string;
  icon: string; // emoji
  color: string;
  testament: "OT" | "NT" | "Both";
  stories: string[]; // story names this unit draws questions from (empty = all in testament)
  order: number;
  status: Status;
};

export type MascotKind = "lamb" | "lion" | "owl" | "bear" | "dove" | "fox";

export type MascotDoc = BaseDoc & {
  name: string;
  /** which character rig to draw */
  kind: MascotKind;
  emoji: string;
  color: string;
  /** belly / cheeks / details */
  accent: string;
  unlockXp: number;
  description: string;
  /** what the mascot says when cheering */
  catchphrase: string;
  /** optional uploaded artwork per mood (PNG/SVG/GIF/WebP); the drawn character is used when empty */
  imageIdle: string;
  imageHappy: string;
  imageSad: string;
  imageCheer: string;
  imageThink: string;
  status: Status;
};

export type Colorway = {
  name: string;
  hex: string; // garment colour
  printHex: string; // print/ink colour
  tagHex?: string;
  frontImage?: string; // optional real photo of this exact colour (shown as-is)
  backImage?: string;
};

export type ProductDoc = BaseDoc & {
  name: string;
  category: "tee" | "hoodie" | "longsleeve" | "other";
  price: number;
  /** optional "was" price shown crossed out */
  compareAtPrice?: number;
  currency: string;
  description: string;
  sizes: string[];
  stock: Record<string, number>;
  frontPrint: string; // lines separated by \n
  backPrint: string;
  colorways: Colorway[];
  frontImage?: string; // optional real photo of a white/light garment (tinted live)
  backImage?: string;
  /** extra product / lifestyle photos shown in the product gallery */
  photos?: string[];
  /** "New" | "Bestseller" | "Limited" | "" */
  badge?: string;
  material?: string;
  care?: string;
  order: number;
  status: Status;
};

export type LeaderboardDoc = BaseDoc & {
  name: string;
  mascot: string;
  mascotColor: string;
  xp: number;
  bestRound: number;
  streak: number;
  achievements: string[];
  storiesCompleted: number;
  status: Status;
};

/** One entry in the header menu. */
export type MenuItem = {
  label: string;
  href: string;
  /** lucide icon name, e.g. "Home" */
  icon?: string;
  /** "classes" shows the classes mega-menu instead of a plain dropdown */
  mega?: string;
  hidden?: boolean;
  children?: { label: string; href: string; description?: string; icon?: string; hidden?: boolean }[];
};

/** One section in a page layout. id is a built-in section or "block:<blockId>". */
export type LayoutItem = { id: string; hidden?: boolean };

/** A reusable content block admins can place on any page. */
export type BlockDoc = BaseDoc & {
  title: string;
  /** text | imageText | cta | cards | video | embed | gallery | buttons | social | spacer */
  type: string;
  eyebrow?: string;
  heading?: string;
  body?: string;
  image?: string;
  images?: string[];
  videoUrl?: string;
  embedUrl?: string;
  /** "Label|URL|style" — style: primary | ghost | dark | sun */
  buttons?: string[];
  /** cards: "Title|Text|Image URL|Link" */
  items?: string[];
  /** white | paper | brand | dark | sun */
  background?: string;
  /** left | center */
  align?: string;
  /** image side for imageText: left | right */
  imageSide?: string;
  status: Status;
};

/** A page the admin creates (served at /p/?s=slug). */
export type CustomPageDoc = BaseDoc & {
  title: string;
  slug: string;
  eyebrow?: string;
  intro?: string;
  heroImage?: string;
  /** block ids in display order */
  blocks: string[];
  seoDescription?: string;
  status: Status;
};

export type SiteSettingsDoc = BaseDoc & {
  status: Status;
  /* ---- design ---- */
  themePrimary?: string;
  themeAccent?: string;
  themeCoral?: string;
  themeMint?: string;
  themeInk?: string;
  themeBg?: string;
  themeSurface?: string;
  fontHeading?: string;
  fontBody?: string;
  /** rounded | soft | sharp */
  themeRadius?: string;
  /** 3d | flat | outline */
  buttonStyle?: string;
  logoUrl?: string;
  /** type | fade | static */
  heroWordsEffect?: string;
  heroWordsSpeed?: number;
  /** desktop placement of every hero element (see lib/heroLayout.ts) */
  heroLayout?: Record<string, { x: number; y: number; w?: number; s?: number; z?: number; hidden?: boolean }>;
  /* ---- structure ---- */
  menu?: MenuItem[];
  ctaUrl?: string;
  showHeaderCta?: string;
  layouts?: Record<string, LayoutItem[]>;
  /** overrides for any registered text / image on the site (see lib/copy.ts) */
  copy?: Record<string, string>;
  showVisitCard?: string;
  legalLinks?: string[];
  /* ---- footer ---- */
  footerBg?: string;
  footerText?: string;
  footerAccent?: string;
  /** slide | glow | lift | none */
  footerHoverEffect?: string;
  showFooterWordmark?: string;
  footerWordmark?: string;
  /** trail | wave | color | none */
  footerWordmarkEffect?: string;
  footerWordmarkColors?: string[];
  footerWordmarkFont?: string;
  footerWordmarkColor?: string;
  siteName: string;
  churchName: string;
  footerBlurb: string;
  ctaLabel: string;
  footerTagline: string;
  footerLinks: string[]; // "Label|/url"
  /** full | reduced | off */
  animationLevel: string;
  /** seconds per gallery rotation step */
  galleryRotateSeconds: number;
  /** what reduce-motion devices get: "gentle" (fades only) | "off" */
  reduceMotionMode?: string;
  /** effect switches: "yes" | "no" */
  fxCursor?: string;
  fxSpotlight?: string;
  fxScramble?: string;
  fxParallax?: string;
  fxMagnetic?: string;
  fxTilt?: string;
  fxHeroIntro?: string;
  fxProgress?: string;
  fxPageFade?: string;
  /** seconds for one full loop of the moving gallery strips */
  galleryStripSeconds?: number;
  /** seconds between slides in the clothing carousels */
  shopRotateSeconds?: number;
  /** About page sections, one per line: id|Jump-bar label|yes/no (order = page order) */
  aboutSections?: string[];
  visionTitle?: string;
  missionTitle?: string;
  /* ---- shop & checkout ---- */
  shopCurrency?: string;
  /** "test" (demo payments allowed, nothing charged) | "live" */
  paymentMode?: string;
  payPaystack?: string;
  payFlutterwave?: string;
  /** pay with cash / MoMo when collecting or on delivery */
  payLater?: string;
  paystackPublicKey?: string;
  flutterwavePublicKey?: string;
  shopDelivery?: string;
  /** "Area|fee" lines */
  deliveryAreas?: string[];
  freeDeliveryOver?: number;
  /** "Place — opening times" lines */
  collectionPoints?: string[];
  /** "Size|Age|Chest cm|Length cm" lines */
  sizeGuide?: string[];
  shopNotice?: string;
  shopReturns?: string;
  /** "yes" | "no" */
  commentsOpen: string;
  commentsNote: string;
  historyIntro: string;
  achievementsTitle: string;
  teamTitle: string;
  teamIntro: string;
  heroBadge: string;
  heroTitle: string; // use *word* to highlight
  heroWords: string[]; // rotating words
  heroSubtitle: string;
  heroImage: string;
  serviceTimes: string[]; // "Sunday Children's Service|9:00 – 10:45 am"
  welcomeTitle: string;
  welcomeText: string;
  welcomeName: string;
  welcomeRole: string;
  stats: string[]; // "age-based classes|9"
  sundayTitle: string;
  sundayIntro: string;
  sundaySteps: string[]; // "Worship together|Songs, actions and prayer…"
  sundayImage: string;
  groups: string[]; // "beginners|Beginners|Ages 3–5|Short stories, songs…"
  featuredLessonId: string;
  aboutTitle: string;
  aboutSubtitle: string;
  vision: string;
  missionIntro: string;
  missionItems: string[]; // "Teach the whole Bible|A three-year teaching plan…"
  historyTitle: string;
  historyPdf: string;
  appTitle: string;
  appText: string;
  googlePlayUrl: string;
  appStoreUrl: string;
  showApp: string; // "yes" | "no"
  socials: string[]; // "Facebook|@pcm.kids|Like our page|https://facebook.com/"
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapQuery: string;
  newsletterTitle: string;
  newsletterText: string;
  safeguardingBody: string;
  accessibilityBody: string;
  privacyBody: string;
  termsBody: string;
  pagesUpdated: string;
  welcomeVideoUrl: string;
};

export type TeacherDoc = BaseDoc & {
  name: string;
  role: string;
  team: string; // beginners | primary | juniors | seniors | leadership
  classIds: string[];
  since: string;
  bio: string;
  highlights: string[];
  photo: string;
  /** a short quote shown with the portrait */
  quote: string;
  order: number;
  status: Status;
};

export type PostKind = "verse" | "photo" | "video" | "news" | "event";

export type PostDoc = BaseDoc & {
  kind: PostKind;
  authorId: string; // teacher id
  body: string;
  verse: string;
  verseRef: string;
  images: string[];
  videoUrl: string;
  audioUrl: string;
  eventId: string;
  date: string; // YYYY-MM-DD
  reactions: Record<string, number>;
  pinned: string; // "yes" | "no"
  status: Status;
  publishAt?: string;
};

export type EventDoc = BaseDoc & {
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;
  location: string;
  description: string;
  image: string;
  /** small round logo/badge for the calendar (falls back to the image) */
  logo: string;
  color: string;
  category: string; // "Special days" | "Family" | …
  registerUrl: string;
  status: Status;
  publishAt?: string;
};

export type GalleryDoc = BaseDoc & {
  title: string;
  category: string;
  date: string; // YYYY-MM
  cover: string;
  media: MediaItem[];
  description: string;
  featured: string; // "yes" | "no"
  /** optional: the event these photos are from (lets gallery search find albums by event) */
  eventId?: string;
  order: number;
  status: Status;
};

export type FaqDoc = BaseDoc & {
  question: string;
  answer: string;
  category: string; // Visiting | Classes | Safety | Parents
  order: number;
  status: Status;
};

export type MilestoneDoc = BaseDoc & {
  /** "milestone" (timeline) or "achievement" (highlights grid) */
  kind: string;
  year: string;
  title: string;
  description: string;
  image: string;
  images: string[];
  /** e.g. "1,200+" for achievements */
  stat: string;
  order: number;
  status: Status;
};

/** Hero banner for a page — id is the page key (home, about, classes, events, blog, gallery, contact, games, collection, history, team…). */
export type HeroDoc = BaseDoc & {
  page: string;
  eyebrow: string;
  title: string; // use *word* to highlight
  intro: string;
  image: string;
  images: string[];
  ctaLabel: string;
  ctaUrl: string;
  cta2Label: string;
  cta2Url: string;
  /** "collage" | "photo" | "plain" */
  style: string;
  status: Status;
};

export type DocFor<C extends CollectionName> = C extends "classes"
  ? ClassDoc
  : C extends "lessons"
    ? LessonDoc
    : C extends "questions"
      ? QuestionDoc
      : C extends "units"
        ? UnitDoc
        : C extends "mascots"
          ? MascotDoc
          : C extends "products"
            ? ProductDoc
            : C extends "settings"
              ? SiteSettingsDoc
              : C extends "teachers"
                ? TeacherDoc
                : C extends "posts"
                  ? PostDoc
                  : C extends "events"
                    ? EventDoc
                    : C extends "gallery"
                      ? GalleryDoc
                      : C extends "faqs"
                        ? FaqDoc
                        : C extends "milestones"
                          ? MilestoneDoc
                          : C extends "heroes"
                            ? HeroDoc
                            : C extends "blocks"
                              ? BlockDoc
                              : C extends "custompages"
                                ? CustomPageDoc
                                : LeaderboardDoc;
/** Content is live when published, or scheduled with a publish time in the past. */
export function isLive(doc: { status?: Status; publishAt?: string }, now = Date.now()) {
  if (doc.status === "published") return true;
  if (doc.status === "scheduled" && doc.publishAt) {
    return new Date(doc.publishAt).getTime() <= now;
  }
  return false;
}
