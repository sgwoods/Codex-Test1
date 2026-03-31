#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');

const DEFAULT_SUPABASE_URL = 'https://iddyodcknmxupavnuuwg.supabase.co';
const REQUIRED_CONFIRM = '1.0-reset';

function parseArgs(argv){
  const args = {};
  for(let i = 0; i < argv.length; i++){
    const token = argv[i];
    if(!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if(!next || next.startsWith('--')){
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function requireEnv(name){
  const value = String(process.env[name] || '').trim();
  if(value) return value;
  throw new Error(`Missing ${name}. This release operation requires admin Supabase credentials.`);
}

async function fetchCount(client){
  const { count, error } = await client
    .from('scores')
    .select('id', { count: 'exact', head: true });
  if(error) throw error;
  return count || 0;
}

async function fetchTopRows(client){
  const { data, error } = await client
    .from('scores')
    .select('id,user_id,initials,score,stage,achieved_at,is_verified')
    .order('score', { ascending: false })
    .order('stage', { ascending: false })
    .limit(10);
  if(error) throw error;
  return Array.isArray(data) ? data : [];
}

async function deleteAllScores(client){
  const { error } = await client
    .from('scores')
    .delete()
    .not('id', 'is', null);
  if(error) throw error;
}

async function main(){
  const args = parseArgs(process.argv.slice(2));
  const execute = !!args.execute;
  const confirm = String(args.confirm || '').trim();
  const supabaseUrl = String(
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL
  ).trim();
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const beforeCount = await fetchCount(client);
  const topRows = await fetchTopRows(client);
  const summary = {
    ok: true,
    dryRun: !execute,
    url: supabaseUrl,
    beforeCount,
    topRows
  };

  if(!execute){
    console.log(JSON.stringify(summary, null, 2));
    console.log(`Dry run only. To delete all production leaderboard rows, rerun with: node tools/build/reset-production-leaderboard.js --execute --confirm ${REQUIRED_CONFIRM}`);
    return;
  }

  if(confirm !== REQUIRED_CONFIRM){
    throw new Error(`Refusing to delete production leaderboard rows without --confirm ${REQUIRED_CONFIRM}`);
  }

  await deleteAllScores(client);
  const afterCount = await fetchCount(client);
  if(afterCount !== 0){
    throw new Error(`Production leaderboard reset did not complete cleanly. ${afterCount} rows remain in scores.`);
  }

  console.log(JSON.stringify({
    ...summary,
    dryRun: false,
    deleted: beforeCount,
    afterCount
  }, null, 2));
}

if(require.main === module){
  main().catch(err => {
    console.error(err.message || err);
    process.exit(1);
  });
}
