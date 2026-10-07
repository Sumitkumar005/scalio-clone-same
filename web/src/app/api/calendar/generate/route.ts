import { z } from "zod";
import { parseMonth } from "@/lib/festivals";
import { getBusiness } from "@/lib/server/business";
import { fillMonth } from "@/lib/server/calendar";
import { handler, HttpError, requireUser } from "@/lib/server/session";

export const maxDuration = 60;

/** "Check for updates": plan the month's empty future days. Existing posts are never touched. */
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const { month } = z.object({ month: z.string() }).parse(await req.json());
  const m = parseMonth(month);
  const b = await getBusiness(user.id);
  if (!b?.name) throw new HttpError(409, "Finish onboarding first");
  const created = await fillMonth(user.id, b, m.year, m.month);
  return Response.json({ created: created.length });
});
