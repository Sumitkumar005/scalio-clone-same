import { z } from "zod";
import { CATEGORIES, GOALS, type GoalId } from "@/lib/domain";

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
    offerings: z.array(z.string().trim().max(60)).max(10),
    audience: z.string().trim().max(200),
    city: z.string().trim().max(80),
    language: z.string().trim().max(10),
    tone: z.string().trim().max(60),
    goals: z.array(z.enum(goalIds)).max(GOALS.length),
    onboardingStep: z.enum(["welcome", "goals", "website", "business", "instagram", "done"]),
  })
  .partial();
