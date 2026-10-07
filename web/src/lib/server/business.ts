import { ObjectId } from "mongodb";
import { businesses, credits, ideas, type Business } from "@/lib/db/models";
import { generateIdeas } from "./ideas";

export const WELCOME_CREDITS = 30;

export async function getBusiness(userId: string) {
  return businesses().findOne({ userId });
}

/** Creates the business doc on first write. */
export async function upsertBusiness(userId: string, patch: Partial<Business>) {
  const now = new Date();
  const res = await businesses().findOneAndUpdate(
    { userId },
    {
      $set: { ...patch, updatedAt: now },
      $setOnInsert: {
        userId,
        ...(patch.name === undefined && { name: "" }),
        ...(patch.offerings === undefined && { offerings: [] }),
        ...(patch.brandColors === undefined && { brandColors: [] }),
        ...(patch.goals === undefined && { goals: [] }),
        ...(patch.language === undefined && { language: "en" }),
        ...(patch.onboardingStep === undefined && { onboardingStep: "welcome" as const }),
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: "after" },
  );
  return res!;
}

export async function refreshIdeas(userId: string, b: Business, count = 6) {
  const { ideas: drafts, source } = await generateIdeas(b, count);
  const now = new Date();
  const docs = drafts.map((d, i) => ({
    ...d,
    userId,
    businessId: b._id as ObjectId,
    status: "new" as const,
    source,
    createdAt: new Date(now.getTime() - i), // keep generation order when sorting by newest
  }));
  if (docs.length) await ideas().insertMany(docs);
  return docs;
}

/** Idempotent: credits are granted once, ideas only if none exist yet. */
export async function completeOnboarding(userId: string) {
  const b = await upsertBusiness(userId, { onboardingStep: "done", onboardedAt: new Date() });
  const granted = await credits().updateOne(
    { userId, reason: "welcome" },
    { $setOnInsert: { userId, delta: WELCOME_CREDITS, reason: "welcome", createdAt: new Date() } },
    { upsert: true },
  );
  if ((await ideas().countDocuments({ userId })) === 0) await refreshIdeas(userId, b);
  return { business: b, creditsGranted: granted.upsertedCount ? WELCOME_CREDITS : 0 };
}
