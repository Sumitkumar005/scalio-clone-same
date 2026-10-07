import type { ClientSession } from "mongodb";
import { creditBalance, credits } from "@/lib/db/models";
import { mongoClient } from "@/lib/db/mongo";
import { HttpError } from "./session";

/**
 * Charge credits and run `work` in one transaction: either both happen or neither.
 * Throws 402 when the balance is too low.
 */
export async function chargeCredits<T>(userId: string, amount: number, reason: string, work: (s: ClientSession) => Promise<T>): Promise<T> {
  const session = mongoClient.startSession();
  try {
    return await session.withTransaction(async () => {
      const [row] = await credits()
        .aggregate<{ total: number }>([{ $match: { userId } }, { $group: { _id: null, total: { $sum: "$delta" } } }], { session })
        .toArray();
      const balance = row?.total ?? 0;
      if (balance < amount) throw new HttpError(402, `This needs ${amount} credits and you have ${balance}.`);
      await credits().insertOne({ userId, delta: -amount, reason, createdAt: new Date() }, { session });
      return work(session);
    });
  } finally {
    await session.endSession();
  }
}

export async function refundCredits(userId: string, amount: number, reason: string) {
  if (amount > 0) await credits().insertOne({ userId, delta: amount, reason, createdAt: new Date() });
}

export { creditBalance };
