import { generateText, Output } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai/models";
import type { Business, Idea, Scene } from "@/lib/db/models";
import { promptProfile } from "./business";

type Draft = Omit<Idea, "_id" | "userId" | "businessId" | "status" | "createdAt" | "source">;

const IdeasSchema = z.object({
  ideas: z
    .array(
      z.object({
        tag: z.string().describe("2-3 word theme label, Title Case"),
        title: z.string().describe("Punchy title, max 8 words"),
        hook: z.string().describe("First line spoken or shown, max 14 words, can be Hinglish for India"),
        durationSec: z.number().int().min(8).max(45),
        presenter: z.boolean().describe("true if a person talks to camera"),
        format: z.enum(["video", "post"]),
        scenes: z
          .array(z.object({ n: z.number().int(), caption: z.string(), visual: z.string().describe("What the shot shows") }))
          .min(3)
          .max(5),
      }),
    )
    .min(4)
    .max(8),
});

export async function generateIdeas(b: Business, count = 6): Promise<{ ideas: Draft[]; source: "ai" | "rules" }> {
  const model = getModel("ideas");
  if (model) {
    try {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: IdeasSchema }),
        system:
          "You are a short-form video and social media strategist for small businesses. Ideas must be specific to the business, practical to shoot on a phone, and built to get enquiries. Mix presenter-led and no-presenter formats.",
        prompt: `Business profile:
${JSON.stringify(promptProfile(b))}\n\nWrite ${count} content ideas.`,
      });
      return { ideas: output.ideas.slice(0, count), source: "ai" };
    } catch (e) {
      console.warn("[generateIdeas] AI failed, using templates", e);
    }
  }
  return { ideas: templateIdeas(b).slice(0, count), source: "rules" };
}

/* ---------- Rule-based fallback: works with zero API keys ---------- */

type Tpl = { tag: string; title: string; hook: string; durationSec: number; presenter: boolean; scenes: [string, string][] };

const T = (o: Tpl) => o;

const GENERIC: Tpl[] = [
  T({ tag: "Offer Spotlight", title: "This week's offer at {name}", hook: "Sirf is hafte: {offer} ka special deal", durationSec: 20, presenter: true, scenes: [["Owner greets the camera", "Presenter at the counter"], ["What's on offer: {offer}", "Close-up of the product"], ["Why customers pick us", "Happy customer moment"], ["DM or call to book", "Logo + contact card"]] }),
  T({ tag: "Behind The Scenes", title: "How we prepare every order", hook: "Ever wondered what happens before your order reaches you?", durationSec: 15, presenter: false, scenes: [["It starts here", "Workspace wide shot"], ["Every detail checked", "Hands at work"], ["Packed with care", "Packing close-up"], ["Ready for you", "Finished product hero shot"]] }),
  T({ tag: "Customer Story", title: "What our customers say", hook: "Don't take our word for it", durationSec: 20, presenter: true, scenes: [["Customer intro", "Customer speaking to camera"], ["The problem they had", "B-roll of the problem"], ["How {name} helped", "Product or service in use"], ["Your turn", "CTA card"]] }),
  T({ tag: "Myth Buster", title: "3 myths about {topic}", hook: "Myth number 1 sun ke shock ho jaoge", durationSec: 25, presenter: true, scenes: [["Myth 1", "Presenter with text overlay"], ["Myth 2", "Presenter, new angle"], ["Myth 3", "Presenter close-up"], ["Ask us anything", "Comment prompt"]] }),
  T({ tag: "Quick Tips", title: "{topic}: 3 tips in 15 seconds", hook: "Save this before you forget", durationSec: 15, presenter: false, scenes: [["Tip 1", "Text on clean background"], ["Tip 2", "Product in hand"], ["Tip 3", "Before/after"], ["Follow for more", "Logo end card"]] }),
  T({ tag: "Festival Special", title: "Celebrate the season with {name}", hook: "Is festive season, kuch special ho jaye?", durationSec: 20, presenter: false, scenes: [["Festive mood", "Decor and lights"], ["Our festive pick: {offer}", "Product styled for festival"], ["Limited time", "Countdown overlay"], ["Order today", "CTA card"]] }),
];

const BY_CATEGORY: Record<string, Tpl[]> = {
  "Education & Coaching": [
    T({ tag: "Offer Spotlight", title: "Apply abroad without paying application fees", hook: "Har university ki fee alag se? Ab nahi", durationSec: 20, presenter: true, scenes: [["Counsellor greets students", "Presenter at a desk with laptop"], ["The fee problem", "Laptop showing a fee page"], ["How {name} waives it", "Presenter explains"], ["Book a free call", "Logo + contact card"]] }),
    T({ tag: "Visa And Admissions", title: "Student visa: avoid these 3 mistakes", hook: "Visa file karne se pehle yeh zaroor dekho", durationSec: 15, presenter: false, scenes: [["Passport and documents", "Hands with passport on desk"], ["Common mistakes", "Checklist overlay"], ["Our document check", "Laptop with checklist"], ["Talk to an expert", "CTA card"]] }),
    T({ tag: "Loan Demystified", title: "Education loans without the stress", hook: "Funding abroad ki tension? Yeh dekho", durationSec: 20, presenter: true, scenes: [["Student worried about funding", "Presenter in office"], ["Loan options explained", "Tablet showing rates"], ["Collateral vs non-collateral", "Split screen graphic"], ["Check eligibility", "CTA card"]] }),
    T({ tag: "Scholarship Spotlight", title: "Scholarships most students never apply for", hook: "Masters abroad, aadhi fees mein? Possible hai", durationSec: 20, presenter: false, scenes: [["Dream destination", "City landmark on phone screen"], ["Scholarship facts", "Text overlay with numbers"], ["Who qualifies", "Student typing application"], ["Apply with {name}", "CTA card"]] }),
    T({ tag: "Partner Growth", title: "Grow your study abroad consultancy", hook: "Loan ki wajah se students drop ho rahe hain?", durationSec: 30, presenter: true, scenes: [["Consultant pain point", "Presenter in office"], ["What partners get", "Tablet with dashboard"], ["Results from partners", "Chart on screen"], ["Partner with us", "CTA card"]] }),
    T({ tag: "Student Story", title: "From application to campus in 90 days", hook: "Ek student ki real journey, start to finish", durationSec: 25, presenter: true, scenes: [["Student intro", "Student talking to camera"], ["The shortlist", "Laptop with university list"], ["Offer letter day", "Phone showing offer email"], ["Your turn", "CTA card"]] }),
  ],
  "Fashion & Clothing": [
    T({ tag: "New Arrivals", title: "New {offer} collection just dropped", hook: "Yeh collection miss mat karna", durationSec: 15, presenter: false, scenes: [["Rack reveal", "Clothes on rack"], ["Fabric close-up", "Texture detail"], ["Styled on model", "Model walk"], ["Shop now", "CTA card"]] }),
    T({ tag: "Style Guide", title: "3 ways to style one {offer}", hook: "Ek outfit, teen looks", durationSec: 20, presenter: true, scenes: [["Look 1: casual", "Model outfit 1"], ["Look 2: office", "Model outfit 2"], ["Look 3: festive", "Model outfit 3"], ["Which is your fav?", "Comment prompt"]] }),
  ],
  "Food & Restaurant": [
    T({ tag: "Menu Hero", title: "The dish everyone orders at {name}", hook: "Yeh dish khatam hone se pehle aa jao", durationSec: 15, presenter: false, scenes: [["Sizzle shot", "Pan close-up"], ["Plating", "Overhead plating"], ["First bite", "Customer reaction"], ["Order now", "CTA card"]] }),
  ],
  "Beauty & Salon": [
    T({ tag: "Transformation", title: "Before and after at {name}", hook: "Wait for the final look", durationSec: 15, presenter: false, scenes: [["Before", "Client before"], ["The process", "Stylist at work"], ["Reveal", "Client after"], ["Book your slot", "CTA card"]] }),
  ],
  "Health & Clinic": [
    T({ tag: "Doctor Explains", title: "When should you see a doctor for {topic}?", hook: "In 3 signs ko ignore mat kijiye", durationSec: 25, presenter: true, scenes: [["Doctor intro", "Doctor in clinic"], ["Sign 1 and 2", "Text overlay"], ["Sign 3", "Doctor close-up"], ["Book a consultation", "CTA card"]] }),
  ],
};

function fill(s: string, b: Business) {
  const offer = b.offerings[0] ?? "our bestseller";
  const topic = b.offerings[1] ?? b.offerings[0] ?? b.category?.split(" & ")[0]?.toLowerCase() ?? "this";
  return s.replaceAll("{name}", b.name).replaceAll("{offer}", offer).replaceAll("{topic}", topic);
}

function templateIdeas(b: Business): Draft[] {
  const specific = BY_CATEGORY[b.category ?? ""] ?? [];
  return [...specific, ...GENERIC].map((t) => ({
    tag: t.tag,
    title: fill(t.title, b),
    hook: fill(t.hook, b),
    durationSec: t.durationSec,
    presenter: t.presenter,
    format: "video" as const,
    scenes: t.scenes.map(([caption, visual], i): Scene => ({ n: i + 1, caption: fill(caption, b), visual })),
  }));
}
