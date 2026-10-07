# Reference product teardown: web.scalio.app

Scraped 2026-10-07 with headless Chromium (desktop 1440px and mobile 390px).
Raw HTML, screenshots and bundles were kept out of the repo on purpose: we copy
the *product structure*, not their brand, copy, images or code.

## What it is

An AI marketing app for small businesses (strong India focus: kurti/saree
examples, Hindi and four South Indian languages, Juspay payments). One app
covers content creation, scheduling, Google growth and customer messaging.

## Tech they use (from page source and network calls)

| Layer | What we saw |
|---|---|
| App | Expo (React Native) exported to web, installable PWA, version 1.9.4 |
| Fonts | Hanken Grotesk, Figtree, Bricolage Grotesque (Google Fonts) |
| Palette | Mint bg `#EEFFF4`, ink `#0E1A12`, brand green `#1D7539`, muted `#6B7B71` |
| Media | CloudFront CDN for the login video, WebP everywhere |
| Analytics | GA4 consent mode, Microsoft Clarity, Meta Pixel, Bing UET, ip-api geo lookup |
| Payments | Juspay (India) via `/api/juspay/*` plus a web billing API |
| Auth | Google, email magic link, phone OTP |

## Public screens (everything else needs login)

**Login, desktop:** split screen. Left: dark green panel with 5 auto-rotating
tabs (Fashion, Reels & Videos, Calendar, Growth, Get the app), each with a
layered 3D-style illustration, a headline and a two-line pitch. Right: logo,
language dropdown, "Welcome" heading, Google and email icon buttons,
Terms / Privacy / Need help, version tag.

**Login, mobile:** full-bleed collage of AI-generated product shots behind a
dark top gradient, logo + tagline + language pill at top, white bottom sheet
with "Continue with Google", "Sign in with email", "Sign in with phone number".

**Email step:** single field, "send sign-in link" button (passwordless).

**Languages (8):** English, Hindi, Gujarati, Tamil, Telugu, Malayalam,
Indonesian, Turkish.

## Logged-in product map (from 72 API endpoints in the JS bundle)

| Module | Endpoints (grouped) | What it does |
|---|---|---|
| Onboarding | `onboarding-v3` | Business profile questions that seed every AI feature |
| Photo Studio | `studio/traditional-studio/jobs`, `studio/outros`, `image-studio` | Garment/product photo to model shots in new scenes and poses |
| Reels / Video | `vid/proven-templates(+categories, requests)`, `vid/avatars`, `vid/tasks`, `video-agent/reels`, `video-agent/threads`, `image-to-video`, `video-conversion`, `video-feedback` | Template-led reels, AI avatars, image-to-video, chat-driven video edits |
| Calendar | `calendar/ideas` (13 calls) | Monthly AI content plan, idea generate/regenerate/approve |
| Publishing | `output-publish/jobs`, `social-media/instagram/media`, `.../insights` | Post to Instagram and pull performance |
| Growth (Google) | `google-growth/oauth`, `locations/sync`, `dashboard`, `content`, `optimizer`, `actions`, `google-reviews` | Google Business Profile connect, reviews, posts, profile optimizer |
| Ads | `final-ads` | Meta and Google ad creatives and campaigns |
| Inbox / CRM | `conversations`, `messages`, `contacts`, `comments`, `whatsapp/templates`, `whatsapp/template-analytics` | WhatsApp + comments inbox with an AI receptionist |
| Copilot | `copilot/threads`, `tool-drafts`, `tool-runs`, `results`, `voice`, `/api/chat`, `/api/completion` | Agent chat that calls tools (create post, reply, plan) incl. voice |
| Knowledge base | `kb/documents`, `kb/entries` | Business docs the AI answers from (RAG) |
| Billing | `billing/web/{config,checkout,change-plan,manage,refresh,status,upgrade-trial}`, `organizations/current/plan` | Plans, trial, credits |
| Attribution | `attribution/capture`, `web-config`, `complete-registration` | UTM/referrer capture for paid acquisition |

In-app routes seen: `/(tabs)/vid-review`, `/proven-template/[id]`,
`/proven-template/[id]/build`, `/video-generator`, `/m/calendar`,
`/google-growth/{manage,profile,publish,reviews}`, `/billing`.
