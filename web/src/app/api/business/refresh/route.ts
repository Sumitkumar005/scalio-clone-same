import { z } from "zod";
import { applyWebsite, getBusiness } from "@/lib/server/business";
import { handler, HttpError, requireUser } from "@/lib/server/session";

export const maxDuration = 30;

/** Settings → "Refresh" / "Check for updates" / "Change" website. */
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const body = z.object({ url: z.string().min(3).max(300).optional(), overwrite: z.boolean().default(false) }).parse(await req.json().catch(() => ({})));
  const url = body.url ?? (await getBusiness(user.id))?.website;
  if (!url) throw new HttpError(400, "Add your website first");
  return Response.json(await applyWebsite(user.id, url, { overwrite: body.overwrite }));
});
