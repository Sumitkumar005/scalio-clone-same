import { ideas } from "@/lib/db/models";
import { handler, requireUser } from "@/lib/server/session";

export const GET = handler(async (req: Request) => {
  const user = await requireUser();
  const sp = new URL(req.url).searchParams;
  const limit = Math.min(Number(sp.get("limit") ?? 20) || 20, 100);
  const status = sp.get("status");
  const filter = { userId: user.id, ...(status ? { status: status as "new" | "saved" | "used" } : {}) };
  const items = await ideas().find(filter).sort({ createdAt: -1 }).limit(limit).toArray();
  return Response.json({ ideas: items });
});
