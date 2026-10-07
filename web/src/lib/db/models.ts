import { db } from "./mongo";
import type { Business, CreditEntry, Idea } from "@/lib/domain";

export * from "@/lib/domain";

export const businesses = () => db.collection<Business>("businesses");
export const ideas = () => db.collection<Idea>("ideas");
export const credits = () => db.collection<CreditEntry>("credit_ledger");

let indexed: Promise<unknown> | null = null;
/** Idempotent; runs once per server instance. */
export function ensureIndexes() {
  indexed ??= Promise.all([
    businesses().createIndex({ userId: 1 }, { unique: true }),
    ideas().createIndex({ userId: 1, createdAt: -1 }),
    credits().createIndex({ userId: 1, createdAt: -1 }),
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
