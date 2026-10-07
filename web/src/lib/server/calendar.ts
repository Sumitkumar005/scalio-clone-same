import { generateText, Output } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai/models";
import { posts } from "@/lib/db/models";
import { DEFAULT_CALENDAR_PREFS, type Business, type CalendarPost, type PostFormat } from "@/lib/domain";
import { daysInMonth, festivalsFor } from "@/lib/festivals";
import { recordUsage } from "./usage";

type Slot = { date: string; theme: string; format: PostFormat; festival?: string };
type Copy = { title: string; subtitle: string; caption: string; hashtags: string[] };

// Weekday patterns by posts-per-week (0 = Sunday).
const PATTERNS: Record<number, number[]> = { 1: [3], 2: [2, 5], 3: [1, 3, 5], 4: [1, 3, 4, 6], 5: [1, 3, 4, 5, 6], 6: [1, 2, 3, 4, 5, 6], 7: [0, 1, 2, 3, 4, 5, 6] };

export function planSlots(year: number, month: number, b: Business, fromDate: string): Slot[] {
  const prefs = { ...DEFAULT_CALENDAR_PREFS, ...b.calendarPrefs };
  const days = PATTERNS[Math.min(7, Math.max(1, prefs.postsPerWeek))];
  const festivals = new Map(festivalsFor(year, month).map((f) => [f.date, f.name]));
  const themes = prefs.themes.filter((t) => t !== "Festival");
  const slots: Slot[] = [];
  let i = 0;
  for (let d = 1; d <= daysInMonth(year, month); d++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (date < fromDate) continue;
    const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
    const festival = festivals.get(date);
    if (festival) slots.push({ date, theme: "Festival", format: "post", festival });
    else if (days.includes(dow)) {
      slots.push({ date, theme: themes[i % themes.length] ?? "Tips", format: prefs.formats[i % prefs.formats.length] ?? "post" });
      i++;
    }
  }
  return slots;
}

const CopySchema = z.object({
  posts: z.array(
    z.object({
      date: z.string(),
      title: z.string().describe("Headline on the creative, max 6 words"),
      subtitle: z.string().describe("Supporting line on the creative, max 12 words"),
      caption: z.string().describe("Instagram caption, 2-4 short lines, ends with a call to action"),
      hashtags: z.array(z.string()).max(8),
    }),
  ),
});

export async function writeCopy(userId: string, b: Business, slots: Slot[]): Promise<{ copy: Map<string, Copy>; source: "ai" | "rules" }> {
  const model = getModel("ideas");
  if (model && slots.length) {
    try {
      const { output, usage } = await generateText({
        model,
        output: Output.object({ schema: CopySchema }),
        system:
          "You write a month of social media posts for a small Indian business. Each post must be specific to the business, useful to its customers, and never invent prices or discounts. Festival posts greet warmly and link back to the business.",
        prompt: JSON.stringify({
          business: { name: b.name, category: b.category, description: b.description, offerings: b.offerings, audience: b.audience, city: b.city, tone: b.tone, language: b.language },
          slots,
        }),
      });
      await recordUsage(userId, "calendar", usage?.totalTokens ?? 0);
      return { copy: new Map(output.posts.map((p) => [p.date, p])), source: "ai" };
    } catch (e) {
      console.warn("[calendar] AI copy failed, using templates", e);
    }
  }
  return { copy: new Map(slots.map((s, i) => [s.date, templateCopy(s, b, i)])), source: "rules" };
}

function templateCopy(s: Slot, b: Business, i: number): Copy {
  const name = b.name || "Our business";
  const offer = b.offerings[i % Math.max(1, b.offerings.length)] ?? "what we do best";
  const tag = `#${name.replace(/\W/g, "")}`;
  const cityTag = b.city ? `#${b.city.replace(/\W/g, "")}` : "#india";
  const T: Record<string, Copy> = {
    Festival: { title: `Happy ${s.festival}`, subtitle: `Warm wishes from all of us at ${name}`, caption: `Wishing you and your family a joyful ${s.festival}! 🎉\nThank you for being part of the ${name} family.`, hashtags: [tag, `#${(s.festival ?? "").replace(/\W/g, "")}`, "#festivevibes", cityTag] },
    Offer: { title: `This week: ${offer}`, subtitle: "Ask us for details today", caption: `Looking for ${offer}? We've got you.\nDM us or call to know more. Limited slots this week.`, hashtags: [tag, "#offer", "#smallbusiness", cityTag] },
    Tips: { title: "3 tips before you decide", subtitle: `Quick guide to ${offer}`, caption: `Save this for later 📌\nThree things to check before choosing ${offer}.\nQuestions? Drop them in the comments.`, hashtags: [tag, "#tips", "#knowbeforeyougo", cityTag] },
    "Behind the scenes": { title: "A day at " + name, subtitle: "How we get it right, every time", caption: `Ever wondered what goes on behind the scenes at ${name}?\nHere's a peek. Follow for more.`, hashtags: [tag, "#behindthescenes", "#teamwork", cityTag] },
    "Customer story": { title: "Our customers say it best", subtitle: "Real stories, real results", caption: `Nothing makes us happier than stories like this ❤️\nWant to be our next success story? DM us.`, hashtags: [tag, "#happycustomers", "#testimonial", cityTag] },
  };
  return T[s.theme] ?? T.Tips;
}

/** Fill empty future slots for the month. Never overwrites posts that already exist. */
export async function fillMonth(userId: string, b: Business, year: number, month: number) {
  const today = new Date().toISOString().slice(0, 10);
  const slots = planSlots(year, month, b, today);
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const taken = new Set((await posts().find({ userId, date: { $regex: `^${prefix}` } }, { projection: { date: 1 } }).toArray()).map((p) => p.date));
  const open = slots.filter((s) => !taken.has(s.date));
  if (!open.length) return [];
  const { copy, source } = await writeCopy(userId, b, open);
  const prefs = { ...DEFAULT_CALENDAR_PREFS, ...b.calendarPrefs };
  const now = new Date();
  const docs: CalendarPost[] = open.map((s, i) => {
    const c = copy.get(s.date) ?? templateCopy(s, b, i);
    return {
      userId,
      date: s.date,
      time: prefs.postTime,
      format: s.format,
      status: "draft",
      title: c.title,
      subtitle: c.subtitle,
      caption: c.caption,
      hashtags: c.hashtags,
      theme: s.theme,
      festival: s.festival,
      palette: (i + Number(s.date.slice(-2))) % 6,
      source,
      createdAt: now,
      updatedAt: now,
    };
  });
  await posts().insertMany(docs);
  return docs;
}
