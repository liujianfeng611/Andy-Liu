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
- `OPENAI_API_KEY`, optional, for GPT models in the note processor
- `GLM_API_KEY`, optional, for GLM models in the note processor
- `MINIMAX_API_KEY`, optional, for MiniMax models in the note processor
- `MIMO_API_KEY`, optional, for Mimo models in the note processor
- `OPENAI_BASE_URL`, `GLM_BASE_URL`, `MINIMAX_BASE_URL`, `MIMO_BASE_URL`, optional provider endpoints. For OpenAI-compatible providers, either the base URL ending in `/v1` or the full `/chat/completions` URL works.

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
