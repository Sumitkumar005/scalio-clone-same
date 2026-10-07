# Stack: what we use, what it costs, why

Rule: start on free tiers, keep every vendor behind one adapter file so a
switch is a config change. Free-tier limits move often; check each vendor's
pricing page before you rely on a number below.

## Core app (all free to start)

| Need | Pick | Free tier | Why this one |
|---|---|---|---|
| Web app | **Next.js 16 + TypeScript + Tailwind v4** (`/web`) | OSS | What most YC teams ship on; server + client in one repo |
| Hosting | **Vercel Hobby** | Free, non-commercial | Zero-config Next.js. Move to Pro ($20/mo) once you charge money, or to **Cloudflare Workers** (OpenNext) which allows commercial use on free |
| DB + Auth + Storage | **Supabase** | 2 projects, 500 MB Postgres, 1 GB storage, 50k MAU | Google / magic link / phone OTP built in, row-level security, pgvector for RAG |
| Background jobs | **Inngest** or **Trigger.dev** | Free monthly runs | Image/video generation takes 10s to minutes; never run it inside a request |
| Media CDN | **Cloudflare R2** | 10 GB, zero egress fees | Generated videos get heavy; R2 has no bandwidth bill |
| Email | **Resend** | 3k emails/mo | Magic links, receipts |
| Analytics | **PostHog** | 1M events/mo | Product analytics + session replay + feature flags in one |
| Errors | **Sentry** | 5k errors/mo | |
| Payments | **Razorpay** (India), **Stripe** (global) | Pay per transaction | No monthly fee |
| WhatsApp | **Meta WhatsApp Cloud API** | Service conversations free, templates paid per message | Needed for the AI receptionist |
| Mobile app (later) | **Expo** | Free, EAS builds have a free quota | Same choice as the reference product; share types/API with web |

## AI models

All LLM calls go through `web/src/lib/ai/models.ts` (Vercel AI SDK), keyed by
task, not vendor.

### Text (copilot, captions, calendar, review replies)

| Use | Free option | Paid upgrade |
|---|---|---|
| Default chat | **Gemini 2.5 Flash** via Google AI Studio (free tier, rate limited; free-tier data may be used to improve Google products) | Claude Sonnet 5.5 for quality, Gemini paid tier for scale |
| Fast/cheap (captions, hashtags, classification) | **Gemini Flash-Lite**, or **Groq** Llama 3.x (free tier, very fast) | Claude Haiku 4.5 |
| Indian languages | Gemini handles Hindi/Tamil/etc well; **Sarvam AI** for Indic-first models and TTS | |
| Agent with tools (copilot that creates posts) | Gemini Flash with tool calling | **Claude** (best tool use reliability) |
| Embeddings (knowledge base) | Gemini embeddings (free tier) into Supabase pgvector | |

### Images (product shoots, posts, ad creatives)

| Use | Free / cheap option | Paid upgrade |
|---|---|---|
| Garment on model, scene swap, edits | **Gemini image models ("Nano Banana")** via AI Studio, limited free quota | Same model on paid tier; **FLUX Kontext** on fal.ai for edit-in-place |
| Text-to-image posts | **Cloudflare Workers AI** (FLUX.1 schnell, daily free allocation), **Together AI** FLUX schnell free endpoint | FLUX 1.1 Pro / Imagen on fal.ai or Vertex |
| Background removal | `@imgly/background-removal` runs in the browser for free | Remove.bg API |
| Upscale | Real-ESRGAN on Replicate (cents per image) | |

### Video (reels, avatars, image-to-video)

There is no good free video generation API. Plan for this cost from day one.

| Use | Cheapest path | Quality path |
|---|---|---|
| Template reels (80% of value) | **Remotion** (React to MP4) or ffmpeg templates: product photos + text + music, rendered on a worker. Near-zero cost per reel. Remotion is free for teams of up to 3, then needs a company license | same |
| Image-to-video (product comes alive) | **Wan 2.x** open weights on fal.ai / Replicate (pay per second) | **Kling**, **Veo 3**, **Runway**, **Hailuo** via fal.ai (single API, many models) |
| AI avatar presenter | **HeyGen** / **D-ID** API (paid) | same |
| Voiceover | **Edge TTS** (free, many Indian voices), **Gemini TTS**, **Sarvam** Bulbul for Indic | **ElevenLabs** |
| Captions / subtitles | **Groq Whisper** (free tier) | |
| Music | Royalty-free library (Pixabay Music, YouTube Audio Library). Avoid AI music for commercial reels until licensing settles | |

Recommendation: use **fal.ai** as the one gateway for image and video models.
One key, pay per call, you can switch model by changing a string.

## Engineering practices in this repo

- TypeScript strict, ESLint, CI on every PR (`.github/workflows/ci.yml`: lint, typecheck, build).
- Secrets only in env vars; `.env.example` lists every key, `.env*` is git-ignored.
- Demo mode: app runs with zero keys so anyone can clone and click around.
- Auth gate in `src/proxy.ts` (Next 16 renamed middleware to proxy).
- Vendor adapters in `src/lib/*` so features never import a vendor SDK directly.
- Long AI jobs: request creates a job row, worker processes it, UI polls or subscribes (Supabase Realtime). Never block an HTTP request on video generation.
- Credits ledger table: every generation debits credits in the same transaction that creates the job.
- Next to add: Playwright smoke tests, Sentry, PostHog, preview deploys per PR.

## Legal guardrails

- Build an original brand. Do not reuse the reference product's name, logo,
  copy, images or code. The login screen here uses CSS illustrations and our
  own text.
- India DPDP Act 2023 consent for phone/email capture; GDPR if you sell to EU.
- AI images of people: label as AI-generated where platforms require it
  (Meta does), and get rights for any real model photos you train on or use.
