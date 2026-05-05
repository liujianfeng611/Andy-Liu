# Andy Workstation

Andy Workstation is a fund-manager workflow app for monitoring portfolio companies, collecting open-internet updates, importing subscribed/local research, and turning information into PM actions.

## What is built

- Dark workstation UI for daily brief, market monitor, portfolio radar, impact matrix, and research queue.
- Open internet ingestion through GDELT with Google News RSS fallback.
- SEC EDGAR filings fetch by CIK.
- Local/subscribed document import from the browser.
- Cloudflare Pages Functions API.
- Supabase persistence for companies, intelligence items, and PM actions.
- Google AI Studio / Gemini endpoint for Andy PM Agent answers.

## Local development

```bash
npm install
npm start
```

Open:

```text
http://localhost:4173
```

Cloudflare-compatible local development:

```bash
npm run dev
```

## Environment variables

Use `.env.example` as the template.

For Cloudflare Pages, configure:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_AI_API_KEY`
- `GOOGLE_AI_MODEL`, optional, defaults to `gemini-2.5-flash`

Do not commit `.env` or `.dev.vars`.

## Supabase

Run the SQL in:

```text
supabase/schema.sql
```

Tables:

- `companies`
- `intel_items`
- `pm_actions`

## Deploy

```bash
npm run deploy
```

Cloudflare Pages settings:

- Output directory: `public`
- Functions directory: `functions`
- Build command: optional, `npm run check`

More notes: `docs/deploy.md`.
