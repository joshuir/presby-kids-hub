import type { CollectionName, LeaderboardDoc, MascotDoc, ProductDoc } from "../types";
import {
  seedClasses,
  seedEvents,
  seedFaqs,
  seedGallery,
  seedLessons,
  seedMilestones,
  seedPosts,
  seedSettings,
  seedTeachers,
  seedUnits,
} from "./content";

export * from "./content";

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

export const SEEDS: Record<CollectionName, Array<{ id: string }>> = {
  settings: seedSettings,
  teachers: seedTeachers,
  posts: seedPosts,
  events: seedEvents,
  gallery: seedGallery,
  faqs: seedFaqs,
  milestones: seedMilestones,
  classes: seedClasses,
  lessons: seedLessons,
  units: seedUnits,
  questions: [], // loaded on demand from ./questions.json (large)
  mascots: seedMascots,
  products: seedProducts,
  leaderboard: seedLeaderboard,
};
