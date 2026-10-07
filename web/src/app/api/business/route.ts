import { upsertBusiness } from "@/lib/server/business";
import { handler, requireUser } from "@/lib/server/session";
import { BusinessPatch } from "@/lib/validators";

export const PATCH = handler(async (req: Request) => {
  const user = await requireUser();
  const patch = BusinessPatch.parse(await req.json());
  const business = await upsertBusiness(user.id, patch);
  return Response.json({ business });
});
