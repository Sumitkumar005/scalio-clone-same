# Kreo: AI marketing app for small businesses

A product inspired by the structure of web.scalio.app, built with an original
brand. Content, reels, product shoots, a content calendar, Google growth and
an AI copilot in one app.

- `web/`: Next.js 16 app (login, app shell, copilot live; other modules stubbed)
- `docs/SCRAPE_REPORT.md`: teardown of the reference product
- `docs/TECH_STACK.md`: free-tier stack, AI model picks, practices
- `docs/ROADMAP.md`: build order

## Run locally

```bash
cd web
cp .env.example .env.local   # optional: add keys, otherwise demo mode
npm install
npm run dev                  # http://localhost:3000
```

## Deploy free

1. Push to GitHub, import the repo on vercel.com, set **Root Directory = `web`**.
2. Add env vars from `.env.example`.
3. In Supabase: Auth > URL config, add `https://<your-app>.vercel.app/auth/callback`; enable Google provider.

Rename the product in `web/src/config/brand.ts`.
