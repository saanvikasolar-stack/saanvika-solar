# Saanvika Solar Marketing Agent

Internal marketing agent for **Saanvika Solar Systems** ([saanvikasolar.in](https://saanvikasolar.in)) and Instagram **[@saanvika_solar](https://www.instagram.com/saanvika_solar/)**.

## What it does

Generates on-brand marketing content:

- Instagram captions for `@saanvika_solar`
- WhatsApp broadcasts
- Facebook posts
- Google Ads
- Flyer copy
- Customer FAQ replies
- 7-day campaign plans

Uses verified company facts (PM Surya Ghar vendor status, subsidy structure, Kakinada install stats). Optionally uses OpenAI when `OPENAI_API_KEY` is set; otherwise uses local brand templates.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional AI mode:

```bash
cp .env.example .env.local
# add OPENAI_API_KEY=
```

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — lint

## Brand contacts

- Website: https://saanvikasolar.in
- Instagram: https://www.instagram.com/saanvika_solar/
- WhatsApp / Phone: +91 85198 33679
