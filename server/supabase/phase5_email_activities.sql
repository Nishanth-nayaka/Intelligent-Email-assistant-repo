-- Phase 5: Email Activities Table
create table if not exists public.email_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  email_id text,
  activity_type text not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists email_activities_user_id_created_at_idx 
  on public.email_activities(user_id, created_at desc);

create index if not exists email_activities_activity_type_idx 
  on public.email_activities(activity_type);
