import { ObjectId } from "mongodb";
import { posts } from "@/lib/db/models";
import { getBusiness } from "@/lib/server/business";
import { renderPostSvg } from "@/lib/server/creative";
import { handler, HttpError, requireUser } from "@/lib/server/session";

export const GET = handler(async (_req: Request, ctx: RouteContext<"/api/calendar/posts/[id]/image">) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) throw new HttpError(404, "Not found");
  const [post, b] = await Promise.all([posts().findOne({ _id: new ObjectId(id), userId: user.id }), getBusiness(user.id)]);
  if (!post) throw new HttpError(404, "Not found");
  const svg = renderPostSvg({ title: post.title, subtitle: post.subtitle, brand: b?.name || "Your brand", badge: post.festival, palette: post.palette, brandColor: b?.brandColors?.[0], phone: b?.phone });
  return new Response(svg, {
    headers: { "content-type": "image/svg+xml", "cache-control": "private, max-age=60", "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'" },
  });
});
