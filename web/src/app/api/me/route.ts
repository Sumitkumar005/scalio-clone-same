import { creditBalance } from "@/lib/db/models";
import { getBusiness } from "@/lib/server/business";
import { handler, requireUser } from "@/lib/server/session";
import { aiConfigured } from "@/lib/ai/models";

export const GET = handler(async () => {
  const user = await requireUser();
  const [business, balance] = await Promise.all([getBusiness(user.id), creditBalance(user.id)]);
  return Response.json({
    user: { id: user.id, name: user.name, email: user.isAnonymous ? null : user.email, isGuest: Boolean(user.isAnonymous) },
    business,
    credits: balance,
    ai: aiConfigured(),
  });
});
