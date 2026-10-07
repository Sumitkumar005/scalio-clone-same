import { db } from "./mongo";
import { GridFSBucket } from "mongodb";
import type { AiUsage, Business, CalendarPost, Creation, CreditEntry, Idea, ReelThread } from "@/lib/domain";

export * from "@/lib/domain";

export const businesses = () => db.collection<Business>("businesses");
export const ideas = () => db.collection<Idea>("ideas");
export const credits = () => db.collection<CreditEntry>("credit_ledger");
export const threads = () => db.collection<ReelThread>("reel_threads");
export const aiUsage = () => db.collection<AiUsage>("ai_usage");
export const posts = () => db.collection<CalendarPost>("calendar_posts");
export const creations = () => db.collection<Creation>("creations");
/** Uploaded garments and generated images live in MongoDB GridFS. Move to R2/S3 when volume grows. */
export const files = () => new GridFSBucket(db, { bucketName: "files" });

let indexed: Promise<unknown> | null = null;
/** Idempotent; runs once per server instance. */
export function ensureIndexes() {
  indexed ??= Promise.all([
    businesses().createIndex({ userId: 1 }, { unique: true }),
    ideas().createIndex({ userId: 1, createdAt: -1 }),
    credits().createIndex({ userId: 1, createdAt: -1 }),
    credits().createIndex({ userId: 1, reason: 1 }),
    threads().createIndex({ userId: 1, updatedAt: -1 }),
    aiUsage().createIndex({ userId: 1, createdAt: -1 }),
    posts().createIndex({ userId: 1, date: 1 }),
    creations().createIndex({ userId: 1, createdAt: -1 }),
  ]).catch((e) => {
    indexed = null;
    throw e;
  });
  return indexed;
}

export async function creditBalance(userId: string) {
  const [row] = await credits()
    .aggregate<{ total: number }>([{ $match: { userId } }, { $group: { _id: null, total: { $sum: "$delta" } } }])
    .toArray();
  return row?.total ?? 0;
}
