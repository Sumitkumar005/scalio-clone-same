import { ObjectId } from "mongodb";
import { businesses, credits, ideas, type Business } from "@/lib/db/models";
import { generateIdeas } from "./ideas";
import { extractProfile, fetchSite } from "./website";

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

/** Fields the website owns. `overwrite` (Settings → Refresh / Change) may replace only these. */
const SITE_OWNED = new Set(["description", "tagline", "logoUrl", "website"]);

/**
 * Read the business website and update the profile.
 * Empty fields are always filled. With `overwrite`, site-owned fields (description, tagline, logo) are
 * replaced too. Anything the owner curates (services, selling points, phone, city, colours...) is never
 * overwritten once set.
 */
export async function applyWebsite(userId: string, url: string, { overwrite = false } = {}) {
  const site = await fetchSite(url);
  const profile = await extractProfile(site);
  const existing = await getBusiness(userId);
  const isEmpty = (v: unknown) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
  const field = (key: string) => <T,>(cur: T | undefined, next: T | undefined) => {
    if (isEmpty(next)) return cur;
    return isEmpty(cur) || (overwrite && SITE_OWNED.has(key)) ? next : cur;
  };
  const business = await upsertBusiness(userId, {
    website: site.url,
    name: field("name")(existing?.name, profile.name) ?? "",
    category: field("category")(existing?.category, profile.category),
    subCategory: field("subCategory")(existing?.subCategory, profile.subCategory),
    description: field("description")(existing?.description, profile.description),
    tagline: field("tagline")(existing?.tagline, profile.tagline),
    offerings: field("offerings")(existing?.offerings, profile.offerings) ?? [],
    usps: field("usps")(existing?.usps, profile.usps),
    audience: field("audience")(existing?.audience, profile.audience),
    city: field("city")(existing?.city, profile.city),
    tone: field("tone")(existing?.tone, profile.tone),
    phone: field("phone")(existing?.phone, profile.phone),
    instagram: field("instagram")(existing?.instagram, profile.instagram),
    brandColors: field("brandColors")(existing?.brandColors, profile.brandColors) ?? [],
    logoUrl: field("logoUrl")(existing?.logoUrl, profile.logoUrl),
    siteSnapshot: { title: site.title, description: site.description, headings: site.headings.slice(0, 10), fetchedAt: new Date(), source: profile.source },
  });
  return { business, source: profile.source };
}

/** Business fields every AI prompt should see. */
export function promptProfile(b: Business) {
  return {
    name: b.name,
    tagline: b.tagline,
    category: b.category,
    subCategory: b.subCategory,
    description: b.description,
    services: b.offerings,
    sellingPoints: b.usps,
    audience: b.audience,
    city: b.city,
    phone: b.phone,
    brandTone: b.toneTags?.length ? b.toneTags.join(", ") : b.tone,
    language: b.language,
    goals: b.goals,
  };
}
