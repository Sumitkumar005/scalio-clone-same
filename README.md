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

Sign in with email or phone: the link / code shows up at
http://localhost:3000/api/dev/outbox (dev only, `NEXT_PUBLIC_DEV_OUTBOX=1`).

## Deploy free

1. Create a free MongoDB Atlas M0 cluster, copy its `mongodb+srv://` URI, allow Vercel IPs (or 0.0.0.0/0 to start).
2. Push to GitHub, import the repo on vercel.com, set **Root Directory = `web`**.
3. Add env vars from `.env.example` (`MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` = your Vercel URL). Do **not** set `NEXT_PUBLIC_DEV_OUTBOX` there.
4. Google sign-in: add `https://<your-app>.vercel.app/api/auth/callback/google` as a redirect URI.

Rename the product in `web/src/config/brand.ts`.
