import { devOutbox } from "@/lib/db/mongo";
import { env } from "@/lib/env";

/** Dev only: latest magic links / OTPs, so local sign-in works without email or SMS. */
export async function GET() {
  if (!env.devOutbox) return new Response("Not found", { status: 404 });
  const items = await devOutbox().find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(10).toArray();
  return Response.json(items);
}
