import { z } from "zod";
import { posts } from "@/lib/db/models";
import { POST_FORMATS } from "@/lib/domain";
import { handler, requireUser } from "@/lib/server/session";

const NewPost = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  format: z.enum(POST_FORMATS).default("post"),
  title: z.string().trim().min(1).max(80),
  subtitle: z.string().trim().max(140).default(""),
  caption: z.string().trim().max(2200).default(""),
  hashtags: z.array(z.string().trim().max(40)).max(30).default([]),
  theme: z.string().trim().max(40).default("Custom"),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const body = NewPost.parse(await req.json());
  const now = new Date();
  const doc = { ...body, userId: user.id, status: "draft" as const, palette: Math.floor(Math.random() * 6), source: "manual" as const, createdAt: now, updatedAt: now };
  const { insertedId } = await posts().insertOne(doc);
  return Response.json({ post: { ...doc, _id: insertedId } }, { status: 201 });
});
