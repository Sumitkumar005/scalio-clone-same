import { z } from "zod";
import type { Business, ReelPlan } from "@/lib/domain";
import { promptProfile } from "./business";

export const ReelPlanSchema = z.object({
  title: z.string().describe("Short name for this reel, max 6 words"),
  hook: z.string().describe("First 2 seconds: the line that stops the scroll"),
  durationSec: z.number().int().min(8).max(60),
  presenter: z.boolean(),
  scenes: z
    .array(
      z.object({
        n: z.number().int(),
        shot: z.string().describe("What the camera shows"),
        onScreenText: z.string().describe("Text overlay, max 7 words"),
        voiceover: z.string().describe("What is said, one or two short sentences"),
        seconds: z.number().int().min(1).max(15),
      }),
    )
    .min(3)
    .max(7),
  caption: z.string().describe("Instagram caption, 2-4 short lines"),
  hashtags: z.array(z.string()).max(10),
  music: z.string().describe("Music mood, e.g. 'upbeat Bollywood lo-fi'"),
  cta: z.string().describe("Call to action at the end"),
});

export function directorSystemPrompt(b: Business | null, name: string) {
  return `You are ${name}, a friendly short-form video director for small businesses in India.
Your job: turn the owner's goal into a ready-to-shoot reel plan.

How to work:
- Ask at most 2 short questions, one at a time, only if you truly need them (what to feature, offer details, who it's for).
- As soon as you know enough, call the finalize_reel_plan tool with the full plan. Then reply in 1-2 lines saying it's ready and offering one tweak.
- Plans must be phone-shootable, 15-30 seconds, with a strong hook. Use Hinglish when it fits the audience.
- Never invent prices, discounts or claims the owner didn't give you. Leave a clear placeholder like [price] instead.
${b?.name ? `\nBusiness: ${JSON.stringify(promptProfile(b))}` : ""}`;
}

/* ---------- Rule-based director (no AI key) ---------- */

type Turn = { role: "user" | "assistant"; text: string };

/**
 * Deterministic 3-turn flow: goal -> what to feature -> audience/detail -> plan.
 * Keeps the product usable end to end without an LLM.
 */
export function ruleBasedReply(turns: Turn[], b: Business | null): { text: string; plan?: ReelPlan } {
  const userTurns = turns.filter((t) => t.role === "user").map((t) => t.text.trim());
  const goal = userTurns[0] ?? "Get more customers";
  const offer = b?.offerings?.[0];

  if (userTurns.length === 1) {
    return {
      text: `Nice, let's make a reel to **${goal.toLowerCase()}**.\n\nWhat should it feature? A product, a service or an offer${offer ? ` (for example: ${offer})` : ""}. Add the price or deadline if there is one.`,
    };
  }
  if (userTurns.length === 2) {
    return {
      text: `Got it. Who is this reel for, and should a person speak to camera or should it be visuals only?\n\nExample: "Students in Delhi planning a master's, I'll present it myself"`,
    };
  }
  const feature = userTurns[1];
  const audienceLine = userTurns[2] ?? "";
  const presenter = !/no presenter|visuals? only|without (a )?person|no face/i.test(audienceLine);
  const plan = templatePlan(goal, feature, audienceLine, presenter, b);
  return {
    text: `Your reel plan is ready: **${plan.title}** (${plan.durationSec}s). Shoot it scene by scene below. Want a different hook or a Hindi version? Just ask.`,
    plan,
  };
}

function templatePlan(goal: string, feature: string, audience: string, presenter: boolean, b: Business | null): ReelPlan {
  const name = b?.name || "our business";
  const short = feature.length > 40 ? feature.slice(0, 40).trim() + "…" : feature;
  const who = audience.replace(/,?\s*(i'?ll present.*|no presenter.*|visuals? only.*)$/i, "").trim() || b?.audience || "you";
  const hooks: Record<string, string> = {
    "Promote an offer": `Yeh offer sirf kuch dino ke liye hai`,
    "Show off a new product": `Naya aaya hai, aur yeh kamaal hai`,
    "Build trust with reviews": `Hamare customers kya kehte hain, suniye`,
  };
  const hook = hooks[goal] ?? `Stop scrolling if you're ${who.toLowerCase().startsWith("you") ? "looking for this" : who}`;
  const s = (n: number, shot: string, onScreenText: string, voiceover: string, seconds: number) => ({ n, shot, onScreenText, voiceover, seconds });
  const scenes = [
    s(1, presenter ? "Presenter close-up, direct to camera" : "Fast close-up of the product in hand", hook, hook, 3),
    s(2, "Show the problem your customer has", "Sound familiar?", `Most ${who} struggle with this.`, 4),
    s(3, `Reveal: ${short}`, short, `That's why ${name} has ${short}.`, 5),
    s(4, "Detail shots, 2-3 quick cuts", "Why it works", "Here's what you get, simple and clear.", 5),
    s(5, presenter ? "Presenter smiles, points to the text" : "Logo and contact on screen", "DM us today", "Message us now, link in bio.", 3),
  ];
  const tag = (b?.category ?? "smallbusiness").split(" ")[0].toLowerCase();
  return {
    title: `${goal}: ${short}`.slice(0, 60),
    hook,
    durationSec: scenes.reduce((a, x) => a + x.seconds, 0),
    presenter,
    scenes,
    caption: `${hook}\n${short} at ${name}.\nDM us or tap the link in bio to know more.`,
    hashtags: [`#${name.replace(/\W/g, "")}`, `#${tag}`, "#reelsindia", "#smallbusiness", b?.city ? `#${b.city.replace(/\W/g, "")}` : "#india"],
    music: "Upbeat, light Bollywood lo-fi",
    cta: "DM us or tap the link in bio",
  };
}
