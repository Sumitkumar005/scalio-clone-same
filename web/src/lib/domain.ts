/** Shared types and constants. Safe to import from client components (no DB driver). */
import type { ObjectId } from "mongodb";

export const GOALS = [
  { id: "videos", label: "Reels & videos" },
  { id: "posts", label: "Social media posts" },
  { id: "photos", label: "Product photoshoots" },
  { id: "ads", label: "Ads that bring customers" },
  { id: "google", label: "More Google reviews & calls" },
  { id: "calendar", label: "A monthly content plan" },
] as const;
export type GoalId = (typeof GOALS)[number]["id"];

export const CATEGORIES = [
  "Education & Coaching",
  "Fashion & Clothing",
  "Jewellery & Accessories",
  "Beauty & Salon",
  "Health & Clinic",
  "Food & Restaurant",
  "Real Estate",
  "Travel",
  "Home & Decor",
  "Retail & Shop",
  "Services",
  "Other",
] as const;

export type OnboardingStep = "welcome" | "goals" | "website" | "business" | "instagram" | "done";

export interface Business {
  _id?: ObjectId;
  userId: string;
  name: string;
  website?: string;
  instagram?: string;
  category?: string;
  description?: string;
  offerings: string[];
  audience?: string;
  city?: string;
  language: string;
  tone?: string;
  brandColors: string[];
  logoUrl?: string;
  goals: GoalId[];
  calendarPrefs?: CalendarPrefs;
  siteSnapshot?: { title?: string; description?: string; headings: string[]; fetchedAt: Date; source: "ai" | "rules" };
  onboardingStep: OnboardingStep;
  onboardedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Scene {
  n: number;
  caption: string;
  visual: string;
}

export interface Idea {
  _id?: ObjectId;
  userId: string;
  businessId: ObjectId;
  tag: string;
  title: string;
  hook: string;
  durationSec: number;
  presenter: boolean;
  format: "video" | "post";
  scenes: Scene[];
  status: "new" | "saved" | "used";
  source: "ai" | "rules";
  createdAt: Date;
}

export interface CreditEntry {
  _id?: ObjectId;
  userId: string;
  delta: number;
  reason: string;
  createdAt: Date;
}

/* ---------- Director (video agent) ---------- */

export const REEL_GOALS = ["Get more customers", "Promote an offer", "Show off a new product", "Build trust with reviews"] as const;

export interface ReelPlan {
  title: string;
  hook: string;
  durationSec: number;
  presenter: boolean;
  scenes: { n: number; shot: string; onScreenText: string; voiceover: string; seconds: number }[];
  caption: string;
  hashtags: string[];
  music: string;
  cta: string;
}

export interface ReelThread {
  _id?: ObjectId;
  userId: string;
  title: string;
  status: "drafting" | "ready";
  messages: unknown[]; // UIMessage[] from the AI SDK, stored as-is
  plan?: ReelPlan;
  ideaId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiUsage {
  _id?: ObjectId;
  userId: string;
  feature: "director" | "chat" | "ideas" | "calendar" | "extract";
  tokens: number;
  createdAt: Date;
}

export const WEEKLY_TOKEN_LIMIT = 3_000_000;

/* ---------- Calendar ---------- */

export const POST_STATUSES = ["draft", "ready", "scheduled", "published", "needs_attention"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];
export const POST_FORMATS = ["post", "carousel", "reel", "story"] as const;
export type PostFormat = (typeof POST_FORMATS)[number];

export interface CalendarPost {
  _id?: ObjectId;
  userId: string;
  date: string; // YYYY-MM-DD, business local date
  time?: string; // HH:mm
  format: PostFormat;
  status: PostStatus;
  title: string; // headline on the creative
  subtitle?: string;
  caption: string;
  hashtags: string[];
  theme: string; // e.g. "Festival", "Offer", "Tips"
  festival?: string;
  palette: number; // index into creative palettes
  source: "ai" | "rules" | "manual";
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarPrefs {
  postsPerWeek: number;
  formats: PostFormat[];
  themes: string[];
  postTime: string;
}

export const DEFAULT_CALENDAR_PREFS: CalendarPrefs = {
  postsPerWeek: 5,
  formats: ["post", "carousel", "reel"],
  themes: ["Offer", "Tips", "Behind the scenes", "Customer story", "Festival"],
  postTime: "19:00",
};

/* ---------- Studio + Library ---------- */

export const MARKETPLACES = [
  { id: "myntra", label: "Myntra", ratio: "3:4", width: 1080, height: 1440 },
  { id: "flipkart", label: "Flipkart", ratio: "3:4", width: 1080, height: 1440 },
  { id: "amazon", label: "Amazon", ratio: "1:1", width: 2000, height: 2000 },
  { id: "ajio", label: "Ajio", ratio: "3:4", width: 1080, height: 1440 },
  { id: "meesho", label: "Meesho", ratio: "1:1", width: 1080, height: 1080 },
] as const;
export type MarketplaceId = (typeof MARKETPLACES)[number]["id"];

export const PACK_POSES = ["Front view", "Side view", "Close-up", "Hands clasped pose"] as const;

export const MODELS = [
  { id: "aanya", name: "Aanya", desc: "Woman, 20s, warm skin tone, long dark hair", tone: "from-amber-300 to-orange-400" },
  { id: "meera", name: "Meera", desc: "Woman, 30s, wheatish skin tone, hair in a bun", tone: "from-rose-300 to-pink-400" },
  { id: "kabir", name: "Kabir", desc: "Man, late 20s, medium skin tone, short beard", tone: "from-stone-400 to-stone-600" },
  { id: "riya", name: "Riya", desc: "Woman, early 20s, fair skin tone, shoulder-length hair", tone: "from-sky-300 to-indigo-400" },
  { id: "arjun", name: "Arjun", desc: "Man, 30s, deep skin tone, clean shaven", tone: "from-emerald-400 to-teal-600" },
] as const;

export const POSES = [
  { id: "standing", label: "Standing, facing camera" },
  { id: "walking", label: "Mid-stride walk" },
  { id: "three-quarter", label: "Three-quarter turn" },
  { id: "seated", label: "Seated, relaxed" },
  { id: "over-shoulder", label: "Looking over shoulder" },
] as const;

export const SCENES = [
  { id: "palace", label: "Heritage palace courtyard", tone: "from-amber-200 to-rose-300" },
  { id: "studio", label: "Clean studio backdrop", tone: "from-slate-100 to-slate-300" },
  { id: "lake", label: "Lakeside at sunset", tone: "from-orange-300 to-purple-400" },
  { id: "street", label: "City street, daylight", tone: "from-sky-200 to-slate-400" },
  { id: "festive", label: "Festive home with diyas", tone: "from-yellow-200 to-orange-400" },
  { id: "garden", label: "Garden with flowers", tone: "from-lime-200 to-emerald-400" },
] as const;

export type CreationSource = "fashion_photoshoot" | "marketplace_pack" | "image_studio" | "director";
export type CreationStatus = "queued" | "processing" | "ready" | "failed";

export interface CreationOutput {
  fileId: string;
  label: string;
  width: number;
  height: number;
  preview: boolean; // true = placeholder render, no image model connected
}

export interface Creation {
  _id?: ObjectId;
  userId: string;
  source: CreationSource;
  kind: "image" | "video";
  title: string;
  status: CreationStatus;
  inputFileId?: string;
  params: Record<string, unknown>;
  outputs: CreationOutput[];
  creditsCharged: number;
  flagged?: boolean;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}
