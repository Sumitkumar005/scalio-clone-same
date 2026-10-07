import { ObjectId } from "mongodb";
import { threads } from "@/lib/db/models";
import { handler, HttpError, requireUser } from "@/lib/server/session";

async function find(userId: string, id: string) {
  if (!ObjectId.isValid(id)) throw new HttpError(404, "Not found");
  const t = await threads().findOne({ _id: new ObjectId(id), userId });
  if (!t) throw new HttpError(404, "Not found");
  return t;
}

export const GET = handler(async (_req: Request, ctx: RouteContext<"/api/director/threads/[id]">) => {
  const user = await requireUser();
  const t = await find(user.id, (await ctx.params).id);
  return Response.json({ thread: { ...t, messages: Array.isArray(t.messages) ? t.messages : [] } });
});

export const DELETE = handler(async (_req: Request, ctx: RouteContext<"/api/director/threads/[id]">) => {
  const user = await requireUser();
  const t = await find(user.id, (await ctx.params).id);
  await threads().deleteOne({ _id: t._id });
  return new Response(null, { status: 204 });
});
