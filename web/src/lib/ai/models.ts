import { createGoogle } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";

/**
 * Model router. Every feature asks for a *task*, never a vendor model id, so
 * we can swap providers (free tier today, paid tomorrow) in one place.
 *
 * Free-first order: Gemini Flash (Google AI Studio free tier) -> Groq (Llama).
 */
export type AiTask = "chat" | "caption" | "calendar" | "fast";

const MODEL_IDS = {
  google: {
    chat: process.env.GOOGLE_CHAT_MODEL ?? "gemini-2.5-flash",
    fast: process.env.GOOGLE_FAST_MODEL ?? "gemini-2.5-flash-lite",
  },
  groq: {
    chat: process.env.GROQ_CHAT_MODEL ?? "llama-3.3-70b-versatile",
    fast: process.env.GROQ_FAST_MODEL ?? "llama-3.1-8b-instant",
  },
} as const;

export function getModel(task: AiTask) {
  const tier = task === "fast" || task === "caption" ? "fast" : "chat";

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const google = createGoogle({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    return google(MODEL_IDS.google[tier]);
  }
  if (process.env.GROQ_API_KEY) {
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
    return groq(MODEL_IDS.groq[tier]);
  }
  return null;
}

export const SYSTEM_PROMPTS = {
  chat: `You are the marketing copilot inside a small-business marketing app.
Help owners plan posts, write captions, script reels and reply to customers.
Be concrete: give ready-to-post text, hashtags, and a suggested posting time.
Keep answers short. Match the user's language (English, Hindi, Tamil, etc).`,
} as const;
