import { ObjectId } from "mongodb";
import { z } from "zod";
import { businesses, files } from "@/lib/db/models";
import { PHOTO_TAGS } from "@/lib/domain";
import { handler, HttpError, requireUser } from "@/lib/server/session";

export const PATCH = handler(async (req: Request, ctx: RouteContext<"/api/business/media/[fileId]">) => {
  const user = await requireUser();
  const { fileId } = await ctx.params;
  const { tags } = z.object({ tags: z.array(z.enum(PHOTO_TAGS)).max(PHOTO_TAGS.length) }).parse(await req.json());
  const res = await businesses().updateOne({ userId: user.id, "photos.fileId": fileId }, { $set: { "photos.$.tags": tags } });
  if (!res.matchedCount) throw new HttpError(404, "Not found");
  return Response.json({ ok: true });
});

export const DELETE = handler(async (_req: Request, ctx: RouteContext<"/api/business/media/[fileId]">) => {
  const user = await requireUser();
  const { fileId } = await ctx.params;
  const res = await businesses().updateOne({ userId: user.id }, { $pull: { photos: { fileId }, outros: { fileId } } });
  if (res.modifiedCount && ObjectId.isValid(fileId)) await files().delete(new ObjectId(fileId)).catch(() => {});
  return new Response(null, { status: 204 });
});
