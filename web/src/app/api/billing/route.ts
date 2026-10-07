import { creditBalance, credits } from "@/lib/db/models";
import { handler, HttpError, requireUser } from "@/lib/server/session";

/** Plans shown on Settings → Billing. Payments (Razorpay) are not wired yet. */
const PLANS = [
  { id: "free", name: "Free", priceInr: 0, credits: 30, features: ["30 welcome credits", "Content calendar", "Video director plans", "Preview photoshoots"] },
  { id: "starter", name: "Starter", priceInr: 999, credits: 150, features: ["150 credits a month", "Real model photoshoots", "Marketplace photo packs", "Email support"] },
  { id: "growth", name: "Growth", priceInr: 2499, credits: 500, features: ["500 credits a month", "Everything in Starter", "Priority generation", "WhatsApp support"] },
];

const REASON_LABEL: Record<string, string> = {
  welcome: "Welcome credits",
  "studio:photoshoot": "Fashion photoshoot",
  "studio:pack": "Marketplace photo pack",
  dev_topup: "Test credits",
};

export const GET = handler(async () => {
  const user = await requireUser();
  const [balance, ledger] = await Promise.all([creditBalance(user.id), credits().find({ userId: user.id }).sort({ createdAt: -1 }).limit(50).toArray()]);
  return Response.json({
    balance,
    plan: "free",
    plans: PLANS,
    paymentsEnabled: false,
    devTopup: process.env.NEXT_PUBLIC_DEV_OUTBOX === "1",
    ledger: ledger.map((l) => ({ id: l._id.toString(), delta: l.delta, label: REASON_LABEL[l.reason] ?? (l.reason.startsWith("refund:") ? "Refund" : l.reason), createdAt: l.createdAt })),
  });
});

/** Dev only: add test credits so flows can be tried locally without payments. */
export const POST = handler(async () => {
  if (process.env.NEXT_PUBLIC_DEV_OUTBOX !== "1") throw new HttpError(404, "Not found");
  const user = await requireUser();
  await credits().insertOne({ userId: user.id, delta: 50, reason: "dev_topup", createdAt: new Date() });
  return Response.json({ balance: await creditBalance(user.id) });
});
