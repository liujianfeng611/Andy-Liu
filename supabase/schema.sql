create extension if not exists pgcrypto;

create table if not exists public.companies (
  id text primary key,
  name text not null,
  ticker text,
  cik text,
  topics text[] not null default '{}',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.intel_items (
  id text primary key,
  company_id text references public.companies(id) on delete cascade,
  type text not null check (type in ('open', 'filing', 'local', 'ai', 'decision')),
  title text not null,
  summary text not null default '',
  source text,
  url text,
  form text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  raw jsonb not null default '{}'::jsonb
);

create table if not exists public.pm_actions (
  id uuid primary key default gen_random_uuid(),
  company_id text references public.companies(id) on delete cascade,
  action text not null check (action in ('add', 'trim', 'hold', 'hedge', 'watch')),
  thesis text not null default '',
  expected_impact text not null default '',
  confidence integer not null default 3 check (confidence between 1 and 5),
  created_at timestamptz not null default now()
);

create index if not exists intel_items_company_published_idx
  on public.intel_items (company_id, published_at desc nulls last);

create index if not exists intel_items_type_idx
  on public.intel_items (type);

alter table public.companies enable row level security;
alter table public.intel_items enable row level security;
alter table public.pm_actions enable row level security;

drop policy if exists "service role manages companies" on public.companies;
drop policy if exists "service role manages intel items" on public.intel_items;
drop policy if exists "service role manages pm actions" on public.pm_actions;

create policy "service role manages companies"
  on public.companies
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages intel items"
  on public.intel_items
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages pm actions"
  on public.pm_actions
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
