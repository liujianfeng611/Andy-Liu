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
