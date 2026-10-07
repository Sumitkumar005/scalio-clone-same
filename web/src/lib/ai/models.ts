import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogle } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";

/**
 * Model router. Features ask for a *task*, never a vendor model id, so we can
 * swap providers in one place. Priority: DeepSeek -> Gemini -> Groq.
 * With no key set, callers fall back to rule-based logic (see lib/server/*).
 */
export type AiTask = "chat" | "extract" | "ideas" | "fast";

const IDS = {
  deepseek: { smart: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash", fast: process.env.DEEPSEEK_FAST_MODEL ?? "deepseek-v4-flash" },
  google: { smart: process.env.GOOGLE_CHAT_MODEL ?? "gemini-2.5-flash", fast: process.env.GOOGLE_FAST_MODEL ?? "gemini-2.5-flash-lite" },
  groq: { smart: process.env.GROQ_CHAT_MODEL ?? "llama-3.3-70b-versatile", fast: process.env.GROQ_FAST_MODEL ?? "llama-3.1-8b-instant" },
} as const;

export function getModel(task: AiTask) {
  const tier = task === "fast" ? "fast" : "smart";
  if (process.env.DEEPSEEK_API_KEY) return createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY })(IDS.deepseek[tier]);
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return createGoogle({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })(IDS.google[tier]);
  if (process.env.GROQ_API_KEY) return createGroq({ apiKey: process.env.GROQ_API_KEY })(IDS.groq[tier]);
  return null;
}

export const aiConfigured = () =>
  Boolean(process.env.DEEPSEEK_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GROQ_API_KEY);

export const SYSTEM_PROMPTS = {
  chat: `You are the marketing copilot and video director inside a small-business marketing app.
Help owners plan posts, script reels, write captions and reply to customers.
Be concrete: give ready-to-post text, hashtags and a suggested posting time.
Keep answers short. Match the user's language (English, Hinglish, Hindi, Tamil, etc).`,
} as const;
