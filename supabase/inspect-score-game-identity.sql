-- Read-only preflight. Run before add-score-game-identity.sql.
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'scores'
order by ordinal_position;

select count(*) as score_count from public.scores;

select relrowsecurity as row_security_enabled
from pg_class where oid = 'public.scores'::regclass;

select policyname, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public' and tablename = 'scores';
