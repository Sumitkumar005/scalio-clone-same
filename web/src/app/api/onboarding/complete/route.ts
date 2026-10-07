import { completeOnboarding } from "@/lib/server/business";
import { handler, requireUser } from "@/lib/server/session";

export const maxDuration = 60;

export const POST = handler(async () => {
  const user = await requireUser();
  return Response.json(await completeOnboarding(user.id));
});
