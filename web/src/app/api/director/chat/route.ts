import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getModel } from "@/lib/ai/models";
import { DIRECTOR_NAME } from "@/config/nav";
import { ideas, threads } from "@/lib/db/models";
import type { ReelPlan } from "@/lib/domain";
import { getBusiness } from "@/lib/server/business";
import { directorSystemPrompt, ReelPlanSchema, ruleBasedReply } from "@/lib/server/director";
import { handler, HttpError, requireUser } from "@/lib/server/session";
import { estimateTokens, recordUsage, weeklyUsage } from "@/lib/server/usage";

export const maxDuration = 60;

const Body = z.object({ threadId: z.string(), messages: z.array(z.any()).min(1).max(80) });

const textOf = (m: UIMessage) =>
  m.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("\n");

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const { threadId, messages } = Body.parse(await req.json());
  if (!ObjectId.isValid(threadId)) throw new HttpError(404, "Not found");
  const _id = new ObjectId(threadId);
  const thread = await threads().findOne({ _id, userId: user.id });
  if (!thread) throw new HttpError(404, "Not found");
  if ((await weeklyUsage(user.id)).left <= 0) throw new HttpError(429, "Weekly AI limit reached. It resets on Monday.");

  const uiMessages = messages as UIMessage[];
  const business = await getBusiness(user.id);
  const firstUser = uiMessages.find((m) => m.role === "user");
  const title = thread.title === "New reel" && firstUser ? textOf(firstUser).slice(0, 48) : thread.title;

  let plan: ReelPlan | undefined;
  const save = async (all: UIMessage[]) => {
    await threads().updateOne(
      { _id },
      { $set: { messages: all, title: plan?.title ?? title, updatedAt: new Date(), ...(plan ? { plan, status: "ready" as const } : {}) } },
    );
    if (plan && thread.ideaId && ObjectId.isValid(thread.ideaId)) {
      await ideas().updateOne({ _id: new ObjectId(thread.ideaId), userId: user.id }, { $set: { status: "used" } });
    }
  };

  const model = getModel("chat");

  if (!model) {
    // No AI key: deterministic director so the flow still works end to end.
    const turns = uiMessages.map((m) => ({ role: m.role === "user" ? ("user" as const) : ("assistant" as const), text: textOf(m) }));
    const reply = ruleBasedReply(turns, business);
    plan = reply.plan;
    const stream = createUIMessageStream({
      originalMessages: uiMessages,
      execute: async ({ writer }) => {
        const id = crypto.randomUUID();
        writer.write({ type: "text-start", id });
        for (const word of reply.text.split(/(\s+)/)) {
          writer.write({ type: "text-delta", id, delta: word });
          await new Promise((r) => setTimeout(r, 8));
        }
        writer.write({ type: "text-end", id });
      },
      onFinish: async ({ messages: all }) => {
        await save(all);
        await recordUsage(user.id, "director", estimateTokens(reply.text + turns.map((t) => t.text).join(" ")));
      },
    });
    return createUIMessageStreamResponse({ stream });
  }

  const result = streamText({
    model,
    system: directorSystemPrompt(business, DIRECTOR_NAME),
    messages: await convertToModelMessages(uiMessages),
    stopWhen: stepCountIs(3),
    tools: {
      finalize_reel_plan: tool({
        description: "Save the finished reel plan. Call once you have enough detail.",
        inputSchema: ReelPlanSchema,
        execute: async (input) => {
          plan = input;
          return { saved: true };
        },
      }),
    },
    onFinish: async ({ totalUsage }) => {
      await recordUsage(user.id, "director", totalUsage?.totalTokens ?? 0);
    },
  });

  return result.toUIMessageStreamResponse({ originalMessages: uiMessages, onFinish: ({ messages: all }) => save(all) });
});
