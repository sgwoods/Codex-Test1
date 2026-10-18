#!/usr/bin/env node
// Pass an isolated @electric-sql/pglite installation path; no network/database access.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require(path.resolve(process.argv[2]));
(async () => {
 const db = new PGlite();
 const owner = '00000000-0000-0000-0000-000000000001';
 const other = '00000000-0000-0000-0000-000000000002';
 await db.exec(`create role anon; create role authenticated; create role service_role;
 create schema auth; create table auth.users(id uuid primary key);
 insert into auth.users values ('${owner}'),('${other}');
 create function auth.uid() returns uuid language sql stable as
 $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema public,auth to anon,authenticated;
 create table public.scores(id uuid primary key default gen_random_uuid(), initials text,
 score bigint,stage integer,build text,achieved_at timestamptz default now(),user_id uuid,is_verified boolean);
 insert into public.scores(initials,score,stage,is_verified) select 'OLD',n,1,false from generate_series(1,42) n;
 alter table public.scores enable row level security;
 grant select,insert on scores to authenticated;
 create policy fixture_read on scores for select to authenticated using(true);
 create policy fixture_owner on scores for insert to authenticated with check(auth.uid()=user_id);`);
 const before = (await db.query('select * from scores order by score')).rows;
 await db.exec(fs.readFileSync(path.join(__dirname,'../../supabase/add-score-game-identity.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(__dirname,'../../supabase/add-platform-game-scores.sql'),'utf8'));
 const after = (await db.query('select * from scores order by score')).rows;
 assert.deepEqual(after.map(({game_key,game_title,...row})=>row),before);
 assert(after.every(row=>row.game_key==='aurora-galactica'));
 async function denied(sql){ await assert.rejects(()=>db.exec(sql)); }
 await denied("insert into scores(game_key) values ('galaxy-guardians-preview')");
 await db.exec(`set role anon`);
 await denied("select public.submit_platform_score('aurora-galactica','YES',10,1,'fixture')");
 await denied(`insert into game_scores(initials,score,stage,game_key,game_title,user_id) values ('BAD',1,1,'galaxy-guardians-preview','Guardians','${owner}')`);
 await denied("insert into game_scores(initials,score,stage,game_key,game_title,is_verified) values ('BAD',1,1,'galaxy-guardians-preview','Guardians',true)");
 await db.exec(`reset role; set request.jwt.claim.sub='${owner}'; set role authenticated;`);
 await denied("select public.submit_platform_score('unknown','YES',10,1,'fixture')");
 await denied("select public.submit_platform_score('aurora-galactica','YES',-1,1,'fixture')");
 await db.exec("select public.submit_platform_score('aurora-galactica','YES',10,1,'fixture')");
 const saved=(await db.query("select user_id,is_verified,game_key from scores where initials='YES'")).rows[0];
 assert.equal(saved.user_id,owner);assert.equal(saved.is_verified,false);assert.equal(saved.game_key,'aurora-galactica');
 await db.exec("select public.submit_platform_score('galaxy-guardians-preview','RPC',11,1,'fixture')");
 await denied(`insert into game_scores(initials,score,stage,game_key,game_title,user_id) values ('BAD',1,1,'galaxy-guardians-preview','Guardians','${other}')`);
 for(const table of ['scores','game_scores']){
  const game=table==='scores'?'aurora-galactica':'galaxy-guardians-preview';
  await denied(`insert into ${table}(initials,score,stage,build,game_key,game_title,user_id,is_verified) values ('BAD',1,1,'fixture','${game}','Game','${owner}',true)`);
  await denied(`insert into ${table}(initials,score,stage,build,game_key,game_title,user_id,is_verified) values ('!',1,1,'fixture','${game}','Game','${owner}',false)`);
 }
 await db.exec(`insert into game_scores(initials,score,stage,build,game_key,game_title,user_id) values ('YES',12,2,'fixture','galaxy-guardians-preview','Guardians','${owner}')`);
 await denied("update game_scores set score=999");
 await db.exec(`reset role; set request.jwt.claim.sub='${other}'; set role authenticated; delete from game_scores;`);
 assert.equal((await db.query('select count(*)::int as n from game_scores')).rows[0].n,2);
 await db.exec(`reset role; set request.jwt.claim.sub='${owner}'; set role authenticated; delete from game_scores;`);
 assert.equal((await db.query('select count(*)::int as n from game_scores')).rows[0].n,0);
 await db.close();
 console.log('PASS: PostgreSQL migration preserves all 42 full rows; legacy isolation, owner insert/delete, cross-user denial, anonymous impersonation/verification denial, no client updates.');
})().catch(e=>{console.error(e);process.exitCode=1;});
