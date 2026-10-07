import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getModel, SYSTEM_PROMPTS } from "@/lib/ai/models";
import { getBusiness } from "@/lib/server/business";
import { handler, requireUser } from "@/lib/server/session";

export const maxDuration = 30;

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const { messages }: { messages: UIMessage[] } = await req.json();
  const model = getModel("chat");
  if (!model) {
    return Response.json({ error: "No AI key configured. Set DEEPSEEK_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY / GROQ_API_KEY)." }, { status: 503 });
  }
  const b = await getBusiness(user.id);
  const context = b?.name
    ? `\n\nThe user's business:\n${JSON.stringify({ name: b.name, category: b.category, description: b.description, offerings: b.offerings, audience: b.audience, city: b.city, tone: b.tone, instagram: b.instagram })}`
    : "";
  const result = streamText({ model, system: SYSTEM_PROMPTS.chat + context, messages: await convertToModelMessages(messages) });
  return result.toUIMessageStreamResponse();
});
