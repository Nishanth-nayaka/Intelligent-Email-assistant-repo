create table if not exists public.gmail_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  provider text not null default 'gmail' check (provider = 'gmail'),
  encrypted_access_token text not null,
  encrypted_refresh_token text,
  token_expiry timestamptz,
  scopes text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gmail_connections_user_id_idx on public.gmail_connections(user_id);
