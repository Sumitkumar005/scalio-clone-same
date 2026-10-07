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
