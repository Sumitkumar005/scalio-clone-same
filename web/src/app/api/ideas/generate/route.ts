import { getBusiness, refreshIdeas } from "@/lib/server/business";
import { handler, HttpError, requireUser } from "@/lib/server/session";

export const maxDuration = 60;

export const POST = handler(async () => {
  const user = await requireUser();
  const b = await getBusiness(user.id);
  if (!b?.name) throw new HttpError(409, "Finish onboarding first");
  const created = await refreshIdeas(user.id, b);
  return Response.json({ ideas: created });
});
