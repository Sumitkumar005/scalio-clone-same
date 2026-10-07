import { z } from "zod";
import { BUSINESS_TYPES, CATEGORIES, GOALS, type GoalId } from "@/lib/domain";

const goalIds = GOALS.map((g) => g.id) as [GoalId, ...GoalId[]];

export const BusinessPatch = z
  .object({
    name: z.string().trim().max(80),
    website: z.string().trim().max(300),
    instagram: z
      .string()
      .trim()
      .max(60)
      .transform((v) => v.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/.*$/, "")),
    category: z.enum(CATEGORIES),
    description: z.string().trim().max(400),
    offerings: z.array(z.string().trim().max(80)).max(20),
    audience: z.string().trim().max(200),
    city: z.string().trim().max(80),
    language: z.string().trim().max(10),
    tone: z.string().trim().max(60),
    goals: z.array(z.enum(goalIds)).max(GOALS.length),
    phone: z.string().trim().max(20).regex(/^[+\d][\d\s-]{5,19}$|^$/, "Enter a valid phone number"),
    tagline: z.string().trim().max(120),
    subCategory: z.string().trim().max(60),
    businessTypes: z.array(z.enum(BUSINESS_TYPES)).max(BUSINESS_TYPES.length),
    toneTags: z.array(z.string().trim().min(1).max(24)).max(8),
    usps: z.array(z.string().trim().min(1).max(140)).max(12),
    brandColors: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).max(6),
    logoUrl: z.string().trim().max(500),
    onboardingStep: z.enum(["welcome", "goals", "website", "business", "instagram", "done"]),
  })
  .partial();
