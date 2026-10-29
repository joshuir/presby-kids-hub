// Shared content types for the Kids Hub CMS.

export type Status = "draft" | "published" | "scheduled" | "archived";

export type CollectionName =
  | "classes"
  | "lessons"
  | "questions"
  | "mascots"
  | "products"
  | "leaderboard"
  | "settings"
  | "teachers"
  | "posts"
  | "events"
  | "testimonials"
  | "milestones"
  | "constitution"
  | "policies";

export const COLLECTIONS: CollectionName[] = [
  "classes",
  "lessons",
  "questions",
  "mascots",
  "products",
  "leaderboard",
  "settings",
  "teachers",
  "posts",
  "events",
  "testimonials",
  "milestones",
  "constitution",
  "policies",
];

export type BaseDoc = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ClassGroupKey = "Beginners" | "Primary" | "Juniors" | "Seniors";

export type ClassDoc = BaseDoc & {
  name: string;
  group: ClassGroupKey;
  ageRange: string;
  focus: string;
  teacher: string;
  schedule: string;
  color: string;
  order: number;
  status: Status;
};

export type MediaItem = { type: "image" | "video"; url: string; caption?: string };
export type ResourceItem = {
  label: string;
  url: string;
  kind: "notes" | "worksheet" | "activity" | "other";
};

export type LessonDoc = BaseDoc & {
  classId: string;
  title: string;
  description: string;
  bibleRef: string;
  memoryVerse: string;
  objectives: string[];
  mainThrust: string;
  flyerUrl: string;
  bannerUrl: string;
  introVideoUrl: string;
  storyMedia: MediaItem[];
  resources: ResourceItem[];
  lessonDate: string; // YYYY-MM-DD
  status: Status;
  publishAt?: string; // ISO, used when status === "scheduled"
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
  status: Status;
};

export type MascotDoc = BaseDoc & {
  name: string;
  emoji: string;
  color: string;
  unlockXp: number;
  description: string;
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
  currency: string;
  description: string;
  sizes: string[];
  stock: Record<string, number>;
  frontPrint: string; // lines separated by \n
  backPrint: string;
  colorways: Colorway[];
  frontImage?: string; // optional real photo of a white/light garment (tinted live)
  backImage?: string;
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

export type SiteSettingsDoc = BaseDoc & {
  status: Status;
  siteName: string;
  churchName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  welcomeVideoUrl: string;
  mission: string;
  vision: string;
  values: string[];
  background: string;
  serviceTimes: string[];
  address: string;
  mapQuery: string;
  phone: string;
  whatsapp: string;
  email: string;
  facebook: string;
  youtube: string;
  instagram: string;
  constitutionPdf: string;
  historyIntro: string;
  impactStats: string[]; // "Families served|120+"
  announcement: string;
  privacyBody: string;
  termsBody: string;
};

export type TeacherDoc = BaseDoc & {
  name: string;
  role: string;
  classIds: string[];
  bio: string;
  photo: string;
  order: number;
  status: Status;
};

export type PostCategory = "Bible Stories" | "Devotionals" | "Parent Guides" | "Kids Activities";

export type PostDoc = BaseDoc & {
  title: string;
  slug: string;
  category: PostCategory;
  excerpt: string;
  body: string; // simple markdown: paragraphs, ## headings, - lists, **bold**
  cover: string;
  videoUrl: string;
  audioUrl: string;
  author: string;
  date: string;
  tags: string[];
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
  category: string;
  registerUrl: string;
  status: Status;
  publishAt?: string;
};

export type TestimonialDoc = BaseDoc & {
  quote: string;
  name: string;
  role: string;
  order: number;
  status: Status;
};

export type MilestoneDoc = BaseDoc & {
  year: string;
  title: string;
  description: string;
  image: string;
  order: number;
  status: Status;
};

export type ConstitutionDoc = BaseDoc & {
  title: string;
  body: string;
  order: number;
  status: Status;
};

export type PolicyDoc = BaseDoc & {
  title: string;
  description: string;
  icon: string;
  order: number;
  status: Status;
};

export type DocFor<C extends CollectionName> = C extends "classes"
  ? ClassDoc
  : C extends "lessons"
    ? LessonDoc
    : C extends "questions"
      ? QuestionDoc
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
                  : C extends "testimonials"
                    ? TestimonialDoc
                    : C extends "milestones"
                      ? MilestoneDoc
                      : C extends "constitution"
                        ? ConstitutionDoc
                        : C extends "policies"
                          ? PolicyDoc
                          : LeaderboardDoc;
/** Content is live when published, or scheduled with a publish time in the past. */
export function isLive(doc: { status?: Status; publishAt?: string }, now = Date.now()) {
  if (doc.status === "published") return true;
  if (doc.status === "scheduled" && doc.publishAt) {
    return new Date(doc.publishAt).getTime() <= now;
  }
  return false;
}
