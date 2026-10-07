import { generateText, Output } from "ai";
import * as cheerio from "cheerio";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { z } from "zod";
import { getModel } from "@/lib/ai/models";
import { CATEGORIES } from "@/lib/domain";
import { HttpError } from "./session";

export type SiteFacts = {
  url: string;
  title?: string;
  description?: string;
  siteName?: string;
  headings: string[];
  text: string;
  instagram?: string;
  themeColor?: string;
  logoUrl?: string;
};

export type ExtractedProfile = {
  name: string;
  category: string;
  description: string;
  offerings: string[];
  audience: string;
  city: string;
  tone: string;
  instagram?: string;
  brandColors: string[];
  logoUrl?: string;
  source: "ai" | "rules";
};

export function normalizeUrl(input: string) {
  const raw = input.trim();
  const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  if (!["http:", "https:"].includes(url.protocol)) throw new HttpError(400, "Only http(s) links");
  if (!url.hostname.includes(".")) throw new HttpError(400, "That doesn't look like a website");
  return url;
}

function isPrivateAddress(ip: string) {
  if (ip.includes(":")) return ip === "::1" || /^f[cd]/i.test(ip) || /^fe80/i.test(ip) || ip.startsWith("::ffff:127.");
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

/** SSRF guard: never let a user-supplied URL reach internal services. */
async function assertPublicHost(hostname: string) {
  const addrs = isIP(hostname) ? [{ address: hostname }] : await lookup(hostname, { all: true }).catch(() => []);
  if (addrs.length === 0) throw new HttpError(400, "We couldn't find that website");
  if (addrs.some((a) => isPrivateAddress(a.address))) throw new HttpError(400, "That address isn't allowed");
}

const MAX_BYTES = 1_500_000;

export async function fetchSite(input: string): Promise<SiteFacts> {
  let url = normalizeUrl(input);
  let res: Response | null = null;
  for (let hop = 0; hop < 4; hop++) {
    await assertPublicHost(url.hostname);
    res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
      headers: { "user-agent": "Mozilla/5.0 (compatible; KreoBot/1.0; +https://example.com/bot)", accept: "text/html" },
    }).catch(() => null);
    if (!res) throw new HttpError(422, "We couldn't open that website");
    const loc = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && loc) {
      url = new URL(loc, url);
      continue;
    }
    break;
  }
  if (!res || !res.ok) throw new HttpError(422, `The website answered with ${res?.status ?? "an error"}`);

  const reader = res.body?.getReader();
  let html = "";
  if (reader) {
    const decoder = new TextDecoder();
    let size = 0;
    while (size < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      html += decoder.decode(value, { stream: true });
    }
    reader.cancel().catch(() => {});
  }

  const $ = cheerio.load(html);
  const meta = (sel: string) => $(sel).attr("content")?.trim() || undefined;
  const abs = (href?: string) => {
    try {
      return href ? new URL(href, url).toString() : undefined;
    } catch {
      return undefined;
    }
  };

  const igHref = $('a[href*="instagram.com/"]')
    .map((_, el) => $(el).attr("href"))
    .get()
    .find((h) => /instagram\.com\/[A-Za-z0-9_.]+/.test(h));
  const instagram = igHref?.match(/instagram\.com\/([A-Za-z0-9_.]+)/)?.[1];

  $("script,style,noscript,svg,iframe").remove();
  const headings = $("h1,h2,h3")
    .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
    .get()
    .filter((t) => t.length > 2 && t.length < 140)
    .slice(0, 25);

  return {
    url: url.toString(),
    title: $("title").first().text().trim() || undefined,
    description: meta('meta[name="description"]') ?? meta('meta[property="og:description"]'),
    siteName: meta('meta[property="og:site_name"]'),
    headings: [...new Set(headings)],
    text: $("body").text().replace(/\s+/g, " ").trim().slice(0, 6000),
    instagram: instagram && !["p", "reel", "explore"].includes(instagram) ? instagram : undefined,
    themeColor: meta('meta[name="theme-color"]'),
    logoUrl: abs($('link[rel~="icon"]').attr("href")) ?? abs(meta('meta[property="og:image"]')),
  };
}

const ProfileSchema = z.object({
  name: z.string().describe("Business or brand name"),
  category: z.enum(CATEGORIES),
  description: z.string().describe("One sentence, plain words, what the business does"),
  offerings: z.array(z.string()).max(6).describe("Main products or services, 2-4 words each"),
  audience: z.string().describe("Who buys, e.g. 'Indian students planning a master's abroad'"),
  city: z.string().describe("City or region if stated, else empty string"),
  tone: z.string().describe("Brand voice in 2-4 words"),
});

export async function extractProfile(site: SiteFacts): Promise<ExtractedProfile> {
  const base = {
    instagram: site.instagram,
    brandColors: site.themeColor ? [site.themeColor] : [],
    logoUrl: site.logoUrl,
  };
  const model = getModel("extract");
  if (model) {
    try {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: ProfileSchema }),
        system: "You read a small business website and fill a marketing profile. Only use facts from the page. Be brief.",
        prompt: JSON.stringify({ url: site.url, title: site.title, description: site.description, siteName: site.siteName, headings: site.headings, text: site.text.slice(0, 4000) }),
      });
      return { ...output, ...base, source: "ai" };
    } catch (e) {
      console.warn("[extractProfile] AI failed, using rules", e);
    }
  }
  return { ...rulesProfile(site), ...base, source: "rules" };
}

const CATEGORY_KEYWORDS: [string, RegExp][] = [
  ["Education & Coaching", /study abroad|admission|universit|course|coaching|tuition|student|visa|ielts|education|academy|school/i],
  ["Fashion & Clothing", /saree|kurti|fashion|apparel|clothing|boutique|lehenga|ethnic wear|dress/i],
  ["Jewellery & Accessories", /jewel|gold|diamond|silver|bangle|necklace|earring/i],
  ["Beauty & Salon", /salon|beauty|makeup|skin ?care|spa|hair|nail|cosmetic/i],
  ["Health & Clinic", /clinic|doctor|hospital|dental|physio|health|homeopath|ayurved|therapy/i],
  ["Food & Restaurant", /restaurant|cafe|bakery|food|kitchen|menu|sweets|catering|cloud kitchen/i],
  ["Real Estate", /real estate|property|apartment|villa|plot|bhk|builder/i],
  ["Travel", /travel|tour|holiday|trip|itinerary/i],
  ["Home & Decor", /furniture|decor|interior|home/i],
];

function rulesProfile(site: SiteFacts) {
  const haystack = [site.title, site.description, ...site.headings, site.text.slice(0, 3000)].join(" ");
  const category = CATEGORY_KEYWORDS.find(([, re]) => re.test(haystack))?.[0] ?? "Retail & Shop";
  const host = new URL(site.url).hostname.replace(/^www\./, "");
  const fromTitle = site.title?.split(/\s[|\-–:·]\s/)[0]?.trim();
  const name = site.siteName ?? (fromTitle && fromTitle.length <= 40 ? fromTitle : undefined) ?? host.split(".")[0];
  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    category,
    description: site.description ?? site.headings[0] ?? `${name} on the web at ${host}`,
    offerings: site.headings.filter((h) => h.split(" ").length <= 5).slice(0, 4),
    audience: "",
    city: "",
    tone: "Friendly and clear",
  };
}
