#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SQL_PATH = path.join(ROOT, 'supabase', 'data-api-access-contract.sql');
const DOC_PATH = path.join(ROOT, 'SUPABASE_DATA_API_ACCESS.md');

const REQUIRED_TABLES = {
  scores: {
    grants: {
      anon: ['select', 'insert'],
      authenticated: ['select', 'insert', 'delete'],
      service_role: ['all']
    },
    policies: [
      'scores are readable by leaderboard clients',
      'guests can submit unverified scores',
      'pilots can submit their own scores',
      'pilots can delete their own scores'
    ]
  },
  profiles: {
    grants: {
      authenticated: ['select', 'insert', 'update'],
      service_role: ['all']
    },
    policies: [
      'pilots can read their own profile',
      'pilots can create their own profile',
      'pilots can update their own profile'
    ]
  }
};

const SCAN_ROOTS = [
  'src',
  'tools',
  'shared'
];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readRequired(file){
  if(!fs.existsSync(file)) fail(`Missing required Supabase Data API artifact: ${path.relative(ROOT, file)}`);
  return fs.readFileSync(file, 'utf8');
}

function normalizeSql(sql){
  return sql
    .replace(/--.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function walk(dir, out = []){
  if(!fs.existsSync(dir)) return out;
  for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
    if(entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if(entry.isDirectory()){
      walk(full, out);
    }else if(entry.isFile() && entry.name.endsWith('.js')){
      out.push(full);
    }
  }
  return out;
}

function findDataApiTables(){
  const refs = [];
  const fromPattern = /\.from\(\s*['"`]([A-Za-z0-9_]+)['"`]\s*\)/g;
  for(const root of SCAN_ROOTS){
    for(const file of walk(path.join(ROOT, root))){
      const rel = path.relative(ROOT, file);
      const source = fs.readFileSync(file, 'utf8');
      let match;
      while((match = fromPattern.exec(source))){
        refs.push({
          table: match[1],
          file: rel
        });
      }
    }
  }
  return refs;
}

function unique(values){
  return Array.from(new Set(values));
}

function contractTables(sql){
  return unique(Array.from(sql.matchAll(/\bpublic\.([a-z_][a-z0-9_]*)\b/gi)).map(match => match[1]));
}

function grantHasActions(grantText, actions){
  if(/\ball(?:\s+privileges)?\b/.test(grantText)) return true;
  return actions.every(action => new RegExp(`\\b${action}\\b`).test(grantText));
}

function assertGrant(sql, table, role, actions){
  const grantPattern = new RegExp(`grant\\s+([^;]+?)\\s+on\\s+table\\s+public\\.${table}\\s+to\\s+([^;]+?);`, 'g');
  const matches = Array.from(sql.matchAll(grantPattern));
  const ok = matches.some(match => {
    const grants = match[1];
    const roles = match[2];
    return new RegExp(`\\b${role}\\b`).test(roles) && grantHasActions(grants, actions);
  });
  if(!ok){
    fail(`Supabase Data API contract is missing ${role} grant for public.${table}`, {
      expectedActions: actions,
      contract: path.relative(ROOT, SQL_PATH)
    });
  }
}

function assertTableContract(sql, table, spec){
  if(!new RegExp(`alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security\\s*;`).test(sql)){
    fail(`Supabase Data API contract does not enable RLS for public.${table}`, {
      contract: path.relative(ROOT, SQL_PATH)
    });
  }
  for(const [role, actions] of Object.entries(spec.grants)){
    assertGrant(sql, table, role, actions);
  }
  for(const policy of spec.policies){
    if(!sql.includes(policy.toLowerCase())){
      fail(`Supabase Data API contract is missing policy "${policy}"`, {
        table: `public.${table}`,
        contract: path.relative(ROOT, SQL_PATH)
      });
    }
  }
}

function main(){
  const sqlRaw = readRequired(SQL_PATH);
  const doc = readRequired(DOC_PATH);
  const sql = normalizeSql(sqlRaw);
  const tablesInContract = contractTables(sqlRaw);
  const refs = findDataApiTables();
  const usedTables = unique(refs.map(ref => ref.table)).sort();
  const missingTables = usedTables.filter(table => !tablesInContract.includes(table));
  if(missingTables.length){
    fail('Supabase Data API table usage is missing from the access contract', {
      missingTables,
      refs: refs.filter(ref => missingTables.includes(ref.table))
    });
  }
  for(const [table, spec] of Object.entries(REQUIRED_TABLES)){
    if(!tablesInContract.includes(table)){
      fail(`Supabase Data API contract does not mention required table public.${table}`, {
        contract: path.relative(ROOT, SQL_PATH)
      });
    }
    assertTableContract(sql, table, spec);
    if(!doc.includes(`public.${table}`)){
      fail(`Supabase Data API explainer does not document public.${table}`, {
        doc: path.relative(ROOT, DOC_PATH)
      });
    }
  }
  for(const required of ['May 30, 2026', 'October 30, 2026', 'supabase/data-api-access-contract.sql', 'harness:check:supabase-data-api-contract']){
    if(!doc.includes(required)){
      fail(`Supabase Data API explainer is missing "${required}"`, {
        doc: path.relative(ROOT, DOC_PATH)
      });
    }
  }
  console.log(JSON.stringify({
    ok: true,
    contract: path.relative(ROOT, SQL_PATH),
    documentedTables: Object.keys(REQUIRED_TABLES),
    runtimeTables: usedTables,
    refs
  }, null, 2));
}

main();
