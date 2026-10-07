import { ObjectId } from "mongodb";
import { z } from "zod";
import { ideas, threads } from "@/lib/db/models";
import { handler, requireUser } from "@/lib/server/session";
import { weeklyUsage } from "@/lib/server/usage";

export const GET = handler(async (req: Request) => {
  const user = await requireUser();
  const q = new URL(req.url).searchParams.get("q")?.trim();
  const filter = { userId: user.id, ...(q ? { title: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {}) };
  const [items, usage] = await Promise.all([
    threads().find(filter, { projection: { messages: 0 } }).sort({ updatedAt: -1 }).limit(50).toArray(),
    weeklyUsage(user.id),
  ]);
  return Response.json({ threads: items, usage });
});

/** Start a reel. Optionally seeded from an idea card. */
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const { ideaId } = z.object({ ideaId: z.string().optional() }).parse(await req.json().catch(() => ({})));
  let title = "New reel";
  if (ideaId && ObjectId.isValid(ideaId)) {
    const idea = await ideas().findOne({ _id: new ObjectId(ideaId), userId: user.id });
    if (idea) title = idea.title;
  }
  const now = new Date();
  const doc = { userId: user.id, title, status: "drafting" as const, messages: [], ideaId, createdAt: now, updatedAt: now };
  const { insertedId } = await threads().insertOne(doc);
  return Response.json({ thread: { ...doc, _id: insertedId } }, { status: 201 });
});
