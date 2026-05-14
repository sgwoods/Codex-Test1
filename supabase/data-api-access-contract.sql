-- Aurora / Platinum Supabase Data API access contract
--
-- Purpose:
--   Keep the browser Data API surface explicit and reproducible after the
--   Supabase public-schema access change.
--
-- Supabase announced:
--   - 2026-05-30: new projects/new public tables no longer get implicit
--     Data API grants.
--   - 2026-10-30: existing projects must also rely on explicit grants.
--
-- This file is not a full schema migration. It is the maintained access
-- contract for the public tables used by the Platinum browser client and
-- release tooling today.

grant usage on schema public to anon, authenticated, service_role;

-- scores
--
-- Runtime use:
--   - anon/authenticated select: public shared and validated leaderboards
--   - anon insert: production guest score submission
--   - authenticated insert: signed-in pilot score submission
--   - authenticated delete: signed-in test-pilot reset path
--   - service_role: production maintenance/reset tooling
grant select, insert on table public.scores to anon;
grant select, insert, delete on table public.scores to authenticated;
grant all privileges on table public.scores to service_role;

alter table public.scores enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'scores'
      and policyname = 'scores are readable by leaderboard clients'
  ) then
    create policy "scores are readable by leaderboard clients"
      on public.scores
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'scores'
      and policyname = 'guests can submit unverified scores'
  ) then
    create policy "guests can submit unverified scores"
      on public.scores
      for insert
      to anon
      with check (
        user_id is null
        and coalesce(is_verified, false) = false
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'scores'
      and policyname = 'pilots can submit their own scores'
  ) then
    create policy "pilots can submit their own scores"
      on public.scores
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'scores'
      and policyname = 'pilots can delete their own scores'
  ) then
    create policy "pilots can delete their own scores"
      on public.scores
      for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

-- profiles
--
-- Runtime use:
--   - authenticated select/upsert: pilot initials and account profile card
--   - service_role: release/admin maintenance if required
grant select, insert, update on table public.profiles to authenticated;
grant all privileges on table public.profiles to service_role;

alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'pilots can read their own profile'
  ) then
    create policy "pilots can read their own profile"
      on public.profiles
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'pilots can create their own profile'
  ) then
    create policy "pilots can create their own profile"
      on public.profiles
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'pilots can update their own profile'
  ) then
    create policy "pilots can update their own profile"
      on public.profiles
      for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- If a table id column is backed by a Postgres sequence instead of UUID/default
-- expression generation, add an explicit sequence grant for that specific
-- sequence after confirming its name. Do not add broad default privileges here;
-- new Data API tables should fail closed until they are added to this contract.
