import { z } from "zod";
import { DEFAULT_CALENDAR_PREFS, POST_FORMATS } from "@/lib/domain";
import { upsertBusiness } from "@/lib/server/business";
import { handler, requireUser } from "@/lib/server/session";

const Prefs = z.object({
  postsPerWeek: z.number().int().min(1).max(7),
  formats: z.array(z.enum(POST_FORMATS)).min(1),
  themes: z.array(z.string().trim().min(1).max(40)).min(1).max(10),
  postTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const PUT = handler(async (req: Request) => {
  const user = await requireUser();
  const prefs = Prefs.parse({ ...DEFAULT_CALENDAR_PREFS, ...(await req.json()) });
  await upsertBusiness(user.id, { calendarPrefs: prefs });
  return Response.json({ prefs });
});
