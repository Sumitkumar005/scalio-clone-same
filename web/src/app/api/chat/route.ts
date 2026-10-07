import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getModel, SYSTEM_PROMPTS } from "@/lib/ai/models";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const model = getModel("chat");
  if (!model) {
    return Response.json(
      { error: "No LLM key configured. Set GOOGLE_GENERATIVE_AI_API_KEY or GROQ_API_KEY in .env.local." },
      { status: 503 },
    );
  }
  const result = streamText({
    model,
    system: SYSTEM_PROMPTS.chat,
    messages: await convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse();
}
