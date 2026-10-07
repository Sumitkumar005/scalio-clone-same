import { z } from "zod";
import { applyWebsite } from "@/lib/server/business";
import { handler, requireUser } from "@/lib/server/session";

export const maxDuration = 30;

/** Reads the business website and pre-fills the profile so the owner types as little as possible. */
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const { url } = z.object({ url: z.string().min(3).max(300) }).parse(await req.json());
  return Response.json(await applyWebsite(user.id, url));
});
