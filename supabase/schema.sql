create extension if not exists "pgcrypto";

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  name text not null,
  email text not null,
  profession text not null,
  photo_url text,
  interests text[] not null default '{}',
  skills text[] not null default '{}',
  future_interests text[] not null default '{}',
  placed_stickers jsonb not null default '[]'::jsonb,
  accent_color text not null default '#7B61FF',
  card_bg text not null default '#7B61FF',
  x numeric not null default 380,
  y numeric not null default 540,
  rotation numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.participants
  add column if not exists future_interests text[] not null default '{}';

create index if not exists participants_event_created_idx
  on public.participants (event_id, created_at desc);

alter table public.participants enable row level security;

drop policy if exists "participants are readable" on public.participants;
create policy "participants are readable"
  on public.participants
  for select
  using (true);

drop policy if exists "anyone can join event" on public.participants;
create policy "anyone can join event"
  on public.participants
  for insert
  with check (
    length(name) >= 2
    and position('@' in email) > 1
    and length(profession) >= 2
  );

insert into storage.buckets (id, name, public)
values ('participant-photos', 'participant-photos', true)
on conflict (id) do nothing;

drop policy if exists "photos are publicly readable" on storage.objects;
create policy "photos are publicly readable"
  on storage.objects
  for select
  using (bucket_id = 'participant-photos');

drop policy if exists "anyone can upload participant photos" on storage.objects;
create policy "anyone can upload participant photos"
  on storage.objects
  for insert
  with check (bucket_id = 'participant-photos');

do $$
begin
  alter publication supabase_realtime add table public.participants;
exception
  when duplicate_object then null;
end $$;
