import { ObjectId } from "mongodb";
import { z } from "zod";
import { ideas } from "@/lib/db/models";
import { handler, HttpError, requireUser } from "@/lib/server/session";

export const PATCH = handler(async (req: Request, ctx: RouteContext<"/api/ideas/[id]">) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) throw new HttpError(404, "Not found");
  const { status } = z.object({ status: z.enum(["new", "saved", "used"]) }).parse(await req.json());
  const res = await ideas().findOneAndUpdate({ _id: new ObjectId(id), userId: user.id }, { $set: { status } }, { returnDocument: "after" });
  if (!res) throw new HttpError(404, "Not found");
  return Response.json({ idea: res });
});

export const DELETE = handler(async (_req: Request, ctx: RouteContext<"/api/ideas/[id]">) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) throw new HttpError(404, "Not found");
  await ideas().deleteOne({ _id: new ObjectId(id), userId: user.id });
  return new Response(null, { status: 204 });
});
