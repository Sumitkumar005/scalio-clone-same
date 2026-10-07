import { aiUsage } from "@/lib/db/models";
import { WEEKLY_TOKEN_LIMIT, type AiUsage } from "@/lib/domain";

function weekStart(d = new Date()) {
  const s = new Date(d);
  const day = (s.getUTCDay() + 6) % 7; // Monday = 0
  s.setUTCDate(s.getUTCDate() - day);
  s.setUTCHours(0, 0, 0, 0);
  return s;
}

export async function recordUsage(userId: string, feature: AiUsage["feature"], tokens: number) {
  if (tokens > 0) await aiUsage().insertOne({ userId, feature, tokens: Math.round(tokens), createdAt: new Date() });
}

export async function weeklyUsage(userId: string) {
  const [row] = await aiUsage()
    .aggregate<{ total: number }>([{ $match: { userId, createdAt: { $gte: weekStart() } } }, { $group: { _id: null, total: { $sum: "$tokens" } } }])
    .toArray();
  const used = row?.total ?? 0;
  return { used, limit: WEEKLY_TOKEN_LIMIT, left: Math.max(0, WEEKLY_TOKEN_LIMIT - used), pct: Math.min(100, (used / WEEKLY_TOKEN_LIMIT) * 100) };
}

/** Rough token estimate for rule-based replies (≈4 chars per token). */
export const estimateTokens = (text: string) => Math.ceil(text.length / 4);
