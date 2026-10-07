import { z } from "zod";
import { getBusiness, upsertBusiness } from "@/lib/server/business";
import { handler, requireUser } from "@/lib/server/session";
import { extractProfile, fetchSite } from "@/lib/server/website";

export const maxDuration = 30;

/** Reads the business website and pre-fills the profile so the owner types as little as possible. */
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const { url } = z.object({ url: z.string().min(3).max(300) }).parse(await req.json());
  const site = await fetchSite(url);
  const profile = await extractProfile(site);
  const existing = await getBusiness(user.id);

  // Fill only what the owner hasn't already set.
  const keep = <T,>(cur: T | undefined, next: T) => (cur && (!Array.isArray(cur) || cur.length) ? cur : next);
  const business = await upsertBusiness(user.id, {
    website: site.url,
    name: keep(existing?.name, profile.name),
    category: keep(existing?.category, profile.category),
    description: keep(existing?.description, profile.description),
    offerings: keep(existing?.offerings, profile.offerings),
    audience: keep(existing?.audience, profile.audience),
    city: keep(existing?.city, profile.city),
    tone: keep(existing?.tone, profile.tone),
    instagram: keep(existing?.instagram, profile.instagram ?? ""),
    brandColors: keep(existing?.brandColors, profile.brandColors),
    logoUrl: keep(existing?.logoUrl, profile.logoUrl ?? ""),
    siteSnapshot: { title: site.title, description: site.description, headings: site.headings.slice(0, 10), fetchedAt: new Date(), source: profile.source },
  });
  return Response.json({ business, source: profile.source });
});
