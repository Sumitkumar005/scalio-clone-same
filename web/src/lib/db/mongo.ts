import { MongoClient, type Db } from "mongodb";
import { env } from "@/lib/env";

// Reuse one client across hot reloads and serverless invocations.
const globalForMongo = globalThis as unknown as { mongoClient?: MongoClient };

export const mongoClient = globalForMongo.mongoClient ?? new MongoClient(env.mongoUri);
if (env.isDev) globalForMongo.mongoClient = mongoClient;

export const db: Db = mongoClient.db(env.mongoDb);

/** Dev-only store for magic links and OTPs so you can sign in without an email/SMS provider. */
export type OutboxMessage = { channel: "email" | "sms"; to: string; body: string; link?: string; createdAt: Date };
export const devOutbox = () => db.collection<OutboxMessage>("dev_outbox");
