import type {
  ClassDoc,
  LessonDoc,
  MascotDoc,
  ProductDoc,
  LeaderboardDoc,
  CollectionName,
} from "../types";


const t = "2026-10-28T00:00:00.000Z";

export const seedClasses: ClassDoc[] = [
  { id: "beg-1", group: "Beginners", name: "Beginners 1", ageRange: "Ages 2–3", focus: "Foundations: worship, simple Bible stories, kindness.", teacher: "Teacher A", schedule: "Sundays • 9:00 AM", color: "#F59E0B", order: 1, status: "published" },
  { id: "beg-2", group: "Beginners", name: "Beginners 2", ageRange: "Ages 4–5", focus: "Bible stories, prayer routines, listening & sharing.", teacher: "Teacher A", schedule: "Sundays • 9:00 AM", color: "#F97316", order: 2, status: "published" },
  { id: "pri-1", group: "Primary", name: "Primary 1", ageRange: "Ages 6–7", focus: "Bible overview, memory verses, interactive activities.", teacher: "Teacher B", schedule: "Sundays • 9:00 AM", color: "#22C55E", order: 3, status: "published" },
  { id: "pri-2", group: "Primary", name: "Primary 2", ageRange: "Ages 8–9", focus: "Character, discipleship habits, Bible reading basics.", teacher: "Teacher B", schedule: "Sundays • 9:00 AM", color: "#10B981", order: 4, status: "published" },
  { id: "pri-3", group: "Primary", name: "Primary 3", ageRange: "Ages 10–11", focus: "Gospel clarity, prayer, service and teamwork.", teacher: "Teacher B", schedule: "Sundays • 9:00 AM", color: "#06B6D4", order: 5, status: "published" },
  { id: "jun", group: "Juniors", name: "Juniors", ageRange: "Ages 12–13", focus: "Discussion-based learning and spiritual disciplines.", teacher: "Teacher C", schedule: "Sundays • 9:00 AM", color: "#3B82F6", order: 6, status: "published" },
  { id: "sen-1", group: "Seniors", name: "Seniors 1", ageRange: "Ages 14–15", focus: "Christian identity, apologetics basics, mentorship.", teacher: "Teacher C", schedule: "Sundays • 9:00 AM", color: "#8B5CF6", order: 7, status: "published" },
  { id: "sen-2", group: "Seniors", name: "Seniors 2", ageRange: "Ages 16–17", focus: "Leadership, service projects, deeper Bible study.", teacher: "Teacher C", schedule: "Sundays • 9:00 AM", color: "#EC4899", order: 8, status: "published" },
];

type LessonSeed = Pick<
  LessonDoc,
  "title" | "bibleRef" | "memoryVerse" | "mainThrust" | "description" | "objectives"
>;

const stories: Record<string, LessonSeed> = {
  eden: {
    title: "God Made a Beautiful Garden",
    bibleRef: "Genesis 2–3",
    memoryVerse: "“God saw all that he had made, and it was very good.” — Genesis 1:31",
    mainThrust: "God made everything good and wants us to trust and obey Him.",
    description: "Adam and Eve live in God’s garden. They choose to disobey, yet God still cares for them.",
    objectives: ["Name things God made", "Say why obeying God matters", "Know that God still loves us when we fail"],
  },
  jonah: {
    title: "Jonah Runs, God Rescues",
    bibleRef: "Jonah 1–3",
    memoryVerse: "“Salvation comes from the Lord.” — Jonah 2:9",
    mainThrust: "We cannot run away from God, and He gives second chances.",
    description: "Jonah runs from God’s call, is swallowed by a great fish, prays, and finally obeys.",
    objectives: ["Retell Jonah’s journey in order", "Explain what Jonah learned", "Practise saying sorry to God in prayer"],
  },
  abraham: {
    title: "Abraham Trusts God",
    bibleRef: "Genesis 22:1–19",
    memoryVerse: "“The Lord will provide.” — Genesis 22:14",
    mainThrust: "God tests our faith and always provides what we truly need.",
    description: "God tests Abraham, and at the mountain God provides a ram in Isaac’s place.",
    objectives: ["Describe how Abraham showed trust", "Identify how God provided", "Connect the story to Jesus, God’s provision"],
  },
  gideon: {
    title: "Gideon: Mighty Through God",
    bibleRef: "Judges 6",
    memoryVerse: "“The Lord is with you, mighty warrior.” — Judges 6:12",
    mainThrust: "God uses ordinary people who trust Him to do great things.",
    description: "Israel is oppressed by Midian; the angel of the Lord calls fearful Gideon to lead.",
    objectives: ["Explain why Israel cried out to God", "Describe Gideon’s fears and God’s answer", "Name one way God can use you"],
  },
  sinai: {
    title: "God Gives the Ten Commandments",
    bibleRef: "Exodus 19–20",
    memoryVerse: "“You shall have no other gods before me.” — Exodus 20:3",
    mainThrust: "God’s laws show us how to love Him and love others.",
    description: "At Mount Sinai God meets His people and gives them His covenant laws.",
    objectives: ["List the Ten Commandments", "Group them into love for God and love for others", "Apply one commandment this week"],
  },
  josiah: {
    title: "Young King Josiah Finds God’s Word",
    bibleRef: "2 Kings 22–23",
    memoryVerse: "“Your word is a lamp for my feet.” — Psalm 119:105",
    mainThrust: "When we hear God’s Word, we should respond with humility and obedience.",
    description: "During Temple repairs the Book of the Law is found, and Josiah leads the nation back to God.",
    objectives: ["Tell how the Book of the Law was found", "Explain Josiah’s response", "Commit to reading God’s Word"],
  },
  solomon: {
    title: "David’s Charge to Solomon",
    bibleRef: "1 Kings 2:1–4",
    memoryVerse: "“Be strong, act like a man, and observe what the Lord your God requires.” — 1 Kings 2:2–3",
    mainThrust: "True leadership begins with walking faithfully with God.",
    description: "Before he dies, David tells Solomon to be strong and keep God’s commands.",
    objectives: ["Summarise David’s instructions", "Describe a godly leader", "Choose one leadership habit to practise"],
  },
  nicodemus: {
    title: "Jesus and Nicodemus",
    bibleRef: "John 3:1–21",
    memoryVerse: "“For God so loved the world that he gave his one and only Son…” — John 3:16",
    mainThrust: "To see God’s kingdom we must be born again through faith in Jesus.",
    description: "A religious leader visits Jesus at night and learns about new birth and God’s love.",
    objectives: ["Explain what ‘born again’ means", "Memorise John 3:16", "Discuss light and darkness in the passage"],
  },
  richman: {
    title: "The Rich Young Man",
    bibleRef: "Matthew 19:16–30",
    memoryVerse: "“With God all things are possible.” — Matthew 19:26",
    mainThrust: "Following Jesus means loving Him more than anything we own.",
    description: "A wealthy young man asks Jesus about eternal life but walks away sad.",
    objectives: ["Identify what the young man lacked", "Discuss treasure in heaven", "Name things that compete for our heart"],
  },
  philippi: {
    title: "Paul and Silas Sing in Prison",
    bibleRef: "Acts 16:16–34",
    memoryVerse: "“Believe in the Lord Jesus, and you will be saved.” — Acts 16:31",
    mainThrust: "God is at work even in hard places; praise opens doors.",
    description: "Paul and Silas are jailed, worship at midnight, and the jailer’s family is saved.",
    objectives: ["Retell the events at Philippi", "Explain why the jailer believed", "Practise praising God in difficulty"],
  },
  emmaus: {
    title: "The Road to Emmaus",
    bibleRef: "Luke 24:13–35",
    memoryVerse: "“Were not our hearts burning within us…?” — Luke 24:32",
    mainThrust: "The risen Jesus walks with us and opens the Scriptures to us.",
    description: "Two disciples meet the risen Jesus on the road and recognise Him when He breaks bread.",
    objectives: ["Explain why the disciples were sad", "Show how Jesus used Scripture", "Share the good news of the resurrection"],
  },
  entry: {
    title: "Jesus Rides into Jerusalem",
    bibleRef: "Luke 19:28–40",
    memoryVerse: "“Blessed is the king who comes in the name of the Lord!” — Luke 19:38",
    mainThrust: "Jesus is the humble King who deserves our praise.",
    description: "Jesus rides a colt into Jerusalem while crowds praise God.",
    objectives: ["Describe the triumphal entry", "Explain why Jesus rode a colt", "Write a short praise to King Jesus"],
  },
};

// Which stories each class has: [current, ...archived]
const plan: Record<string, string[]> = {
  "beg-1": ["eden", "jonah"],
  "beg-2": ["jonah", "eden"],
  "pri-1": ["abraham", "gideon"],
  "pri-2": ["gideon", "sinai"],
  "pri-3": ["sinai", "entry"],
  jun: ["josiah", "philippi"],
  "sen-1": ["nicodemus", "richman"],
  "sen-2": ["solomon", "emmaus"],
};

function lessonFor(classId: string, key: string, idx: number): LessonDoc {
  const s = stories[key];
  const date = new Date(Date.UTC(2026, 10, 1) - idx * 7 * 86400000)
    .toISOString()
    .slice(0, 10);
  const id = `${classId}-${key}`;
  return {
    id,
    classId,
    ...s,
    flyerUrl: "", // empty = auto-generated artwork
    bannerUrl: "",
    introVideoUrl: "",
    storyMedia: [
      { type: "image", url: "art:scene:1", caption: s.bibleRef },
      { type: "image", url: "art:scene:2", caption: s.mainThrust },
    ],
    resources: [
      { label: "Lesson notes (printable)", url: `/worksheet/?lesson=${id}&type=notes`, kind: "notes" },
      { label: "Worksheet & quiz", url: `/worksheet/?lesson=${id}&type=worksheet`, kind: "worksheet" },
      { label: "Colouring & activity sheet", url: `/worksheet/?lesson=${id}&type=activity`, kind: "activity" },
    ],
    lessonDate: date,
    status: idx === 0 ? "published" : "archived",
    createdAt: t,
    updatedAt: t,
  };
}

export const seedLessons: LessonDoc[] = Object.entries(plan).flatMap(([cid, keys]) =>
  keys.map((k, i) => lessonFor(cid, k, i)),
);

export const seedMascots: MascotDoc[] = [
  { id: "lamb", name: "Lumi the Lamb", emoji: "🐑", color: "#F1F5F9", unlockXp: 0, description: "Gentle and brave — a great first friend.", status: "published" },
  { id: "lion", name: "Leo the Lion", emoji: "🦁", color: "#F59E0B", unlockXp: 0, description: "Bold like the Lion of Judah.", status: "published" },
  { id: "dove", name: "Dot the Dove", emoji: "🕊️", color: "#E0F2FE", unlockXp: 0, description: "Peaceful and kind.", status: "published" },
  { id: "fish", name: "Gill the Great Fish", emoji: "🐋", color: "#38BDF8", unlockXp: 150, description: "Unlocked at 150 XP — ask Jonah!", status: "published" },
  { id: "donkey", name: "Dash the Donkey", emoji: "🫏", color: "#A8A29E", unlockXp: 300, description: "Unlocked at 300 XP — carried a King.", status: "published" },
  { id: "camel", name: "Cam the Camel", emoji: "🐪", color: "#D6A15A", unlockXp: 600, description: "Unlocked at 600 XP — needle not included.", status: "published" },
];

export const seedProducts: ProductDoc[] = [
  {
    id: "its-us-tee",
    name: "It’s Us Never Them Tee",
    category: "tee",
    price: 180,
    currency: "GHS",
    description: "Heavyweight cotton tee with a bold chest print. Unity over division — we are one family in Christ.",
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 12, M: 20, L: 14, XL: 0 },
    frontPrint: "IT’S US\nNEVER\nTHEM.",
    backPrint: "ONE BODY\nMANY PARTS\n1 COR 12:12",
    colorways: [
      { name: "Blossom", hex: "#F4B6C2", printHex: "#FFFFFF", tagHex: "#F4B6C2" },
      { name: "Midnight", hex: "#14161C", printHex: "#F4F4F5", tagHex: "#14161C" },
      { name: "Lemon", hex: "#F5D33A", printHex: "#FFFFFF", tagHex: "#F5D33A" },
    ],
    order: 1,
    status: "published",
  },
  {
    id: "light-hoodie",
    name: "Light of the World Hoodie",
    category: "hoodie",
    price: 350,
    currency: "GHS",
    description: "Brushed-fleece hoodie with kangaroo pocket. Matthew 5:14 printed on the back.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: { S: 5, M: 9, L: 9, XL: 4, XXL: 2 },
    frontPrint: "LIGHT\nOF THE\nWORLD",
    backPrint: "YOU ARE THE\nLIGHT\nMATT 5:14",
    colorways: [
      { name: "Sky", hex: "#7CB7F2", printHex: "#FFFFFF", tagHex: "#7CB7F2" },
      { name: "Forest", hex: "#1F5135", printHex: "#E9F5DB", tagHex: "#1F5135" },
      { name: "Cream", hex: "#EFE6D2", printHex: "#1D1313", tagHex: "#EFE6D2" },
    ],
    order: 2,
    status: "published",
  },
  {
    id: "kids-crew-tee",
    name: "Little Disciples Kids Tee",
    category: "tee",
    price: 120,
    currency: "GHS",
    description: "Soft kids’ tee for Sunday school and every day. Sizes for ages 3–13.",
    sizes: ["3-4", "5-6", "7-8", "9-10", "11-13"],
    stock: { "3-4": 10, "5-6": 10, "7-8": 8, "9-10": 6, "11-13": 3 },
    frontPrint: "LITTLE\nDISCIPLES",
    backPrint: "LET THE\nCHILDREN COME\nMATT 19:14",
    colorways: [
      { name: "Grass", hex: "#86EF99", printHex: "#14161C", tagHex: "#86EF99" },
      { name: "Aqua", hex: "#00DDFF", printHex: "#FFFFFF", tagHex: "#00DDFF" },
      { name: "Snow", hex: "#F8F8F8", printHex: "#2563EB", tagHex: "#E5E7EB" },
    ],
    order: 3,
    status: "published",
  },
  {
    id: "presby-longsleeve",
    name: "Presby Kids Long Sleeve",
    category: "longsleeve",
    price: 220,
    currency: "GHS",
    description: "Midweight long sleeve with sleeve print. Perfect for harmattan mornings.",
    sizes: ["S", "M", "L", "XL"],
    stock: { S: 4, M: 6, L: 0, XL: 2 },
    frontPrint: "PRESBY\nKIDS",
    backPrint: "ACCRA\nEST. FAITH",
    colorways: [
      { name: "Ink", hex: "#1E3A8A", printHex: "#FFFFFF", tagHex: "#1E3A8A" },
      { name: "Clay", hex: "#C2410C", printHex: "#FFF7ED", tagHex: "#C2410C" },
      { name: "Stone", hex: "#D6D3D1", printHex: "#1D1313", tagHex: "#D6D3D1" },
    ],
    order: 4,
    status: "published",
  },
];

export const seedLeaderboard: LeaderboardDoc[] = [];

import {
  seedConstitution,
  seedEvents,
  seedMilestones,
  seedPolicies,
  seedPosts,
  seedSettings,
  seedTeachers,
  seedTestimonials,
} from "./pages";

export const SEEDS: Record<CollectionName, Array<{ id: string }>> = {
  settings: seedSettings,
  teachers: seedTeachers,
  posts: seedPosts,
  events: seedEvents,
  testimonials: seedTestimonials,
  milestones: seedMilestones,
  constitution: seedConstitution,
  policies: seedPolicies,
  classes: seedClasses,
  lessons: seedLessons,
  questions: [], // loaded on demand from ./questions.json (large)
  mascots: seedMascots,
  products: seedProducts,
  leaderboard: seedLeaderboard,
};
