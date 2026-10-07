import { creditBalance, posts } from "@/lib/db/models";
import { DEFAULT_CALENDAR_PREFS } from "@/lib/domain";
import { festivalsFor, parseMonth } from "@/lib/festivals";
import { getBusiness } from "@/lib/server/business";
import { handler, HttpError, requireUser } from "@/lib/server/session";

/** Month view: posts, festivals and status counts. `month=YYYY-MM`. Week/list views reuse it. */
export const GET = handler(async (req: Request) => {
  const user = await requireUser();
  let m;
  try {
    m = parseMonth(new URL(req.url).searchParams.get("month"));
  } catch {
    throw new HttpError(400, "month must be YYYY-MM");
  }
  // Include the trailing/leading days shown in a Monday-first month grid.
  const from = new Date(Date.UTC(m.year, m.month - 1, -6)).toISOString().slice(0, 10);
  const to = new Date(Date.UTC(m.year, m.month, 7)).toISOString().slice(0, 10);
  const [items, business] = await Promise.all([
    posts().find({ userId: user.id, date: { $gte: from, $lte: to } }).sort({ date: 1 }).toArray(),
    getBusiness(user.id),
    creditBalance(user.id),
  ]);
  const inMonth = items.filter((p) => p.date.startsWith(m.key));
  const counts = {
    all: inMonth.length,
    ready: inMonth.filter((p) => p.status === "ready" || p.status === "scheduled").length,
    draft: inMonth.filter((p) => p.status === "draft").length,
    needs_attention: inMonth.filter((p) => p.status === "needs_attention").length,
    published: inMonth.filter((p) => p.status === "published").length,
  };
  return Response.json({
    month: m.key,
    posts: items,
    festivals: festivalsFor(m.year, m.month),
    counts,
    prefs: { ...DEFAULT_CALENDAR_PREFS, ...business?.calendarPrefs },
    business: business ? { name: business.name, logoUrl: business.logoUrl, brandColor: business.brandColors?.[0] } : null,
  });
});
