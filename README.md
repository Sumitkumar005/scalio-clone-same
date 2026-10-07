# Kreo: AI marketing app for small businesses

A product inspired by the structure of web.scalio.app, built with an original
brand. Content, reels, product shoots, a content calendar, Google growth and
an AI copilot in one app.

- `web/`: Next.js 16 app + API routes, MongoDB, Better Auth (login, app shell, copilot live; other modules stubbed)
- `docs/SCRAPE_REPORT.md`: teardown of the reference product
- `docs/TECH_STACK.md`: free-tier stack, AI model picks, practices
- `docs/ROADMAP.md`: build order

## Run locally

```bash
# 1. MongoDB as a single-node replica set (auth needs transactions)
docker run -d --name kreo-mongo -p 27017:27017 mongo:8 --replSet rs0
docker exec kreo-mongo mongosh --quiet --eval "rs.initiate()"

# 2. App
cd web
cp .env.example .env.local   # set BETTER_AUTH_SECRET (openssl rand -base64 32)
npm install
npm run dev                  # http://localhost:3000
```

Open http://localhost:3000. No sign-up needed: you get a guest account and go
straight into onboarding. Paste your website and it fills your business
profile, then you land on Home with ideas made for your business.

- Add `DEEPSEEK_API_KEY` to turn on AI (website reading, ideas, chat). Without it, ideas come from built-in templates.
- Signing in (email or phone) keeps your guest data. Locally, the link / code shows up at
  http://localhost:3000/api/dev/outbox (`NEXT_PUBLIC_DEV_OUTBOX=1`).

## API (Next.js route handlers, MongoDB)

| Route | What it does |
|---|---|
| `GET /api/me` | User, business profile, credit balance, AI status |
| `PATCH /api/business` | Update business profile / onboarding step (zod-validated) |
| `POST /api/onboarding/website` | Fetch site (SSRF-guarded), extract profile with AI or rules |
| `POST /api/onboarding/complete` | Finish setup, grant 30 welcome credits once, generate first ideas |
| `GET /api/ideas` · `POST /api/ideas/generate` · `PATCH/DELETE /api/ideas/:id` | Personalised content ideas |
| `POST /api/chat` | Streaming chat with business context |
| `GET/POST /api/director/threads` · `GET/DELETE /api/director/threads/:id` | Reel conversations, search, weekly AI usage |
| `POST /api/director/chat` | Video director: asks what it needs, then saves a reel plan (AI tool call, or rule-based without a key) |
| `GET /api/calendar?month=YYYY-MM` | Month of posts, festivals, status counts, plan settings |
| `POST /api/calendar/generate` | Fill empty future days (never overwrites existing posts) |
| `POST /api/calendar/posts` · `PATCH/DELETE /api/calendar/posts/:id` | Create, edit, mark ready / scheduled / published |
| `GET /api/calendar/posts/:id/image` | On-brand post creative (SVG) |
| `PUT /api/calendar/prefs` | Posts per week, formats, themes, posting time |
| `POST /api/files` · `GET /api/files/:id` | Upload garment photos (type-sniffed, 8 MB max), stored in MongoDB GridFS |
| `POST /api/studio/jobs` | Photoshoot or marketplace pack; credits charged in a transaction, refunded on failure |
| `GET /api/creations` · `GET/PATCH/DELETE /api/creations/:id` | Library feed across studios, report a problem, delete |
| `/api/auth/*` | Better Auth: guest, Google, email magic link, phone OTP |

MongoDB collections: `user`, `session`, `account`, `verification` (auth),
`businesses`, `ideas`, `credit_ledger`, `reel_threads`, `ai_usage`,
`calendar_posts`, `creations`, `files.*` (GridFS).

Optional keys: `DEEPSEEK_API_KEY` (AI text), `FAL_KEY` (real model photos in
Fashion Studio). Without them every screen still works: the director runs a
guided 3-question flow, the calendar uses templates, and studio outputs are
clearly marked previews.

## Deploy free

1. Create a free MongoDB Atlas M0 cluster, copy its `mongodb+srv://` URI, allow Vercel IPs (or 0.0.0.0/0 to start).
2. Push to GitHub, import the repo on vercel.com, set **Root Directory = `web`**.
3. Add env vars from `.env.example` (`MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` = your Vercel URL). Do **not** set `NEXT_PUBLIC_DEV_OUTBOX` there.
4. Google sign-in: add `https://<your-app>.vercel.app/api/auth/callback/google` as a redirect URI.

Rename the product in `web/src/config/brand.ts`.
