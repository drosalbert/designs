-- Trip Log schema
-- Run this in your Supabase project's SQL Editor (one-time setup).

create extension if not exists "pgcrypto";

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_date date not null,
  start_location text not null,
  end_location text not null,
  distance_km numeric(10, 2) not null check (distance_km >= 0),
  created_at timestamptz not null default now()
);

create index if not exists trips_user_date_idx
  on public.trips (user_id, trip_date desc);

alter table public.trips enable row level security;

drop policy if exists "users select own trips" on public.trips;
create policy "users select own trips" on public.trips
  for select using (auth.uid() = user_id);

drop policy if exists "users insert own trips" on public.trips;
create policy "users insert own trips" on public.trips
  for insert with check (auth.uid() = user_id);

drop policy if exists "users update own trips" on public.trips;
create policy "users update own trips" on public.trips
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users delete own trips" on public.trips;
create policy "users delete own trips" on public.trips
  for delete using (auth.uid() = user_id);
