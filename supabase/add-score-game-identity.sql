-- Additive preparation only. Do not enable other games until old readers
-- are isolated or upgraded: old clients read all scores as Aurora.
-- Run in Supabase SQL Editor for the confirmed Galaga Tribute project.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- Abort on unexpected existing columns instead of modifying their data.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'scores'
      and column_name in ('game_key', 'game_title')
  ) then
    raise exception 'Game identity columns already exist; inspect before proceeding';
  end if;
end $$;

-- Constant defaults classify existing rows and preserve legacy inserts.
-- No existing score, user, ID, verification or timestamp field is changed.
alter table public.scores
  add column game_key text not null default 'aurora-galactica',
  add column game_title text not null default 'Aurora Galactica';

comment on column public.scores.game_key is
  'Stable platform game ID. Legacy rows and clients default to Aurora. Other-game writes require upgraded or isolated legacy readers.';

-- Grants and row-level policies are deliberately unchanged.
notify pgrst, 'reload schema';
commit;

-- Aggregate verification only; no account or score records are returned.
select game_key, game_title, count(*) as score_count
from public.scores
group by game_key, game_title;
