-- Phase 2: isolate non-Aurora scores from legacy, unfiltered clients.
-- Requires the previously applied add-score-game-identity.sql.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

alter table public.scores add constraint scores_aurora_only
  check (game_key = 'aurora-galactica');

-- Restrict new submissions without changing or reclassifying historical rows.
create policy "new scores require unverified valid input" on public.scores
  as restrictive for insert to anon, authenticated with check (
    is_verified = false and initials ~ '^[A-Z0-9-]{3}$'
    and score between 0 and 2147483647 and stage >= 1
    and build is not null and length(build) <= 200
  );

create table public.game_scores (
  id uuid primary key default gen_random_uuid(),
  initials text not null check (initials ~ '^[A-Z0-9-]{3}$'),
  score bigint not null check (score between 0 and 2147483647),
  stage integer not null check (stage >= 1),
  build text not null check (length(build) <= 200),
  achieved_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  is_verified boolean not null default false check (is_verified = false),
  game_key text not null check (game_key in ('galaxy-guardians-preview')),
  game_title text not null
);
create index game_scores_ranking on public.game_scores(game_key, score desc, stage desc);
create index game_scores_owner on public.game_scores(user_id, game_key, score desc, stage desc);
alter table public.game_scores enable row level security;
grant select, insert on table public.game_scores to anon;
grant select, insert, delete on table public.game_scores to authenticated;
grant all privileges on table public.game_scores to service_role;
create policy "game scores public read" on public.game_scores
  for select to anon, authenticated using (true);
create policy "game scores guest insert" on public.game_scores
  for insert to anon with check (user_id is null and is_verified = false);
create policy "game scores owner insert" on public.game_scores
  for insert to authenticated with check (auth.uid() = user_id);
create policy "game scores owner delete" on public.game_scores
  for delete to authenticated using (auth.uid() = user_id);

-- Public packages submit through this checked, invoker-rights endpoint.
-- Ownership comes from the session, never a caller-supplied user ID.
create function public.submit_platform_score(
 p_game_key text, p_initials text, p_score bigint, p_stage integer, p_build text
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare new_id uuid;
begin
 if auth.uid() is null then raise exception 'Sign in to save online scores'; end if;
 if p_game_key is null or p_game_key not in ('aurora-galactica','galaxy-guardians-preview')
    or p_initials is null or p_initials !~ '^[A-Z0-9-]{3}$'
    or p_score is null or p_score < 0 or p_score > 2147483647
    or p_stage is null or p_stage < 1
    or p_build is null or length(p_build) > 200 then
   raise exception 'Invalid score submission';
 end if;
 if p_game_key = 'aurora-galactica' then
   insert into public.scores(initials,score,stage,build,user_id,is_verified,game_key,game_title)
   values(p_initials,p_score,p_stage,p_build,auth.uid(),false,p_game_key,'Aurora Galactica') returning id into new_id;
 else
   insert into public.game_scores(initials,score,stage,build,user_id,is_verified,game_key,game_title)
   values(p_initials,p_score,p_stage,p_build,auth.uid(),false,p_game_key,'Galaxy Guardians') returning id into new_id;
 end if;
 return new_id;
end;
$$;
revoke all on function public.submit_platform_score(text,text,bigint,integer,text) from public;
grant execute on function public.submit_platform_score(text,text,bigint,integer,text) to authenticated;
notify pgrst, 'reload schema';
commit;

select 'scores' as storage, game_key, count(*) as score_count
from public.scores group by game_key
union all
select 'game_scores', 'galaxy-guardians-preview', count(*) from public.game_scores;
