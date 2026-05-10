# Andy Workstation deploy notes

## Supabase

1. Open Supabase SQL Editor.
2. Run `supabase/schema.sql`.
3. Copy your project URL and service role key.

## Cloudflare Pages

Set these environment variables in Cloudflare Pages:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_AI_API_KEY`
- `GOOGLE_AI_MODEL`, optional, defaults to `gemini-2.5-flash`
- `OPENAI_API_KEY`, optional, for GPT models in the note processor
- `GLM_API_KEY`, optional, for GLM models in the note processor
- `MINIMAX_API_KEY`, optional, for MiniMax models in the note processor
- `MIMO_API_KEY`, optional, for Mimo models in the note processor
- `OPENAI_BASE_URL`, `GLM_BASE_URL`, `MINIMAX_BASE_URL`, `MIMO_BASE_URL`, optional. For OpenAI-compatible providers, either a base URL ending in `/v1` or the full `/chat/completions` URL works.

Build settings:

- Framework preset: `None`
- Build command: leave empty, or `npm run check`
- Output directory: `public`

Local Cloudflare-style dev:

```bash
npm install
npm run dev
```

Classic local static server:

```bash
npm start
```
