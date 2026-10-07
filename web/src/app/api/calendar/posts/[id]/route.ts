import { ObjectId } from "mongodb";
import { z } from "zod";
import { posts } from "@/lib/db/models";
import { POST_FORMATS, POST_STATUSES } from "@/lib/domain";
import { handler, HttpError, requireUser } from "@/lib/server/session";

const Patch = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    format: z.enum(POST_FORMATS),
    status: z.enum(POST_STATUSES),
    title: z.string().trim().min(1).max(80),
    subtitle: z.string().trim().max(140),
    caption: z.string().trim().max(2200),
    hashtags: z.array(z.string().trim().max(40)).max(30),
    palette: z.number().int().min(0).max(5),
  })
  .partial();

const oid = (id: string) => {
  if (!ObjectId.isValid(id)) throw new HttpError(404, "Not found");
  return new ObjectId(id);
};

export const PATCH = handler(async (req: Request, ctx: RouteContext<"/api/calendar/posts/[id]">) => {
  const user = await requireUser();
  const patch = Patch.parse(await req.json());
  const post = await posts().findOneAndUpdate({ _id: oid((await ctx.params).id), userId: user.id }, { $set: { ...patch, updatedAt: new Date() } }, { returnDocument: "after" });
  if (!post) throw new HttpError(404, "Not found");
  return Response.json({ post });
});

export const DELETE = handler(async (_req: Request, ctx: RouteContext<"/api/calendar/posts/[id]">) => {
  const user = await requireUser();
  await posts().deleteOne({ _id: oid((await ctx.params).id), userId: user.id });
  return new Response(null, { status: 204 });
});
