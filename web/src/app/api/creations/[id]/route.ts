import { ObjectId } from "mongodb";
import { z } from "zod";
import { creations, files } from "@/lib/db/models";
import { fileUrl } from "@/lib/server/files";
import { handler, HttpError, requireUser } from "@/lib/server/session";

async function find(userId: string, id: string) {
  if (!ObjectId.isValid(id)) throw new HttpError(404, "Not found");
  const c = await creations().findOne({ _id: new ObjectId(id), userId });
  if (!c) throw new HttpError(404, "Not found");
  return c;
}

export const GET = handler(async (_req: Request, ctx: RouteContext<"/api/creations/[id]">) => {
  const user = await requireUser();
  const c = await find(user.id, (await ctx.params).id);
  return Response.json({
    creation: {
      ...c,
      inputUrl: c.inputFileId ? fileUrl(c.inputFileId) : undefined,
      outputs: c.outputs.map((o) => ({ ...o, url: fileUrl(o.fileId) })),
    },
  });
});

/** Flag a bad result (for review / refund) or rename. */
export const PATCH = handler(async (req: Request, ctx: RouteContext<"/api/creations/[id]">) => {
  const user = await requireUser();
  const c = await find(user.id, (await ctx.params).id);
  const patch = z.object({ flagged: z.boolean().optional(), title: z.string().trim().min(1).max(80).optional() }).parse(await req.json());
  await creations().updateOne({ _id: c._id }, { $set: { ...patch, updatedAt: new Date() } });
  return Response.json({ ok: true });
});

export const DELETE = handler(async (_req: Request, ctx: RouteContext<"/api/creations/[id]">) => {
  const user = await requireUser();
  const c = await find(user.id, (await ctx.params).id);
  await Promise.all(c.outputs.map((o) => files().delete(new ObjectId(o.fileId)).catch(() => {})));
  await creations().deleteOne({ _id: c._id });
  return new Response(null, { status: 204 });
});
