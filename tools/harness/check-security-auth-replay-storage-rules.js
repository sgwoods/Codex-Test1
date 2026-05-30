#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

const REQUIRED_DOCS = [
  'SECURITY_AUTH_REPLAY_STORAGE_LOCKDOWN.md',
  'EXTERNAL_SERVICES.md',
  'ARTIFACT_POLICY.md',
  'SUPABASE_DATA_API_ACCESS.md',
  'RELEASE_POLICY.md',
  'CODE_REVIEW_MODEL.md'
];

const CLIENT_SCAN_ROOTS = [
  'src',
  'shared'
];

const FORBIDDEN_CLIENT_PATTERNS = [
  { pattern: /\bservice_role\b/i, meaning: 'Supabase service-role material must never be shipped to browser code.' },
  { pattern: /\bclient_secret\b/i, meaning: 'OAuth client secrets must not be present in browser code.' },
  { pattern: /youtube\.googleapis\.com/i, meaning: 'YouTube Data API calls require a server-owned authorization path.' },
  { pattern: /upload\.youtube\.com/i, meaning: 'YouTube uploads must not be attempted directly from browser code.' },
  { pattern: /www\.googleapis\.com\/upload/i, meaning: 'Upload endpoints must stay server-owned.' }
];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function read(file){
  if(!fs.existsSync(file)) fail(`Missing required security/auth/replay artifact: ${rel(file)}`);
  return fs.readFileSync(file, 'utf8');
}

function assertIncludes(file, tokens){
  const text = read(path.join(ROOT, file));
  const missing = tokens.filter(token => !text.includes(token));
  if(missing.length) fail(`${file} is missing required security/auth/replay text`, { missing });
}

function walk(dir, out = []){
  if(!fs.existsSync(dir)) return out;
  for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
    if(entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if(entry.isDirectory()) walk(full, out);
    else if(entry.isFile() && /\.(js|html|css)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function checkForbiddenClientSecrets(){
  const hits = [];
  for(const root of CLIENT_SCAN_ROOTS){
    for(const file of walk(path.join(ROOT, root))){
      const text = fs.readFileSync(file, 'utf8');
      for(const rule of FORBIDDEN_CLIENT_PATTERNS){
        if(rule.pattern.test(text)){
          hits.push({ file: rel(file), pattern: String(rule.pattern), meaning: rule.meaning });
        }
      }
    }
  }
  if(hits.length) fail('Browser-shipped source contains a forbidden external-service or secret pattern.', { hits });
}

function checkRuntimePolicySource(){
  const platform = read(path.join(ROOT, 'src', 'js', '03-platform-services.js'));
  const auth = read(path.join(ROOT, 'src', 'js', '12-auth-session.js'));
  const scores = read(path.join(ROOT, 'src', 'js', '11-leaderboard-service.js'));
  const replayStore = read(path.join(ROOT, 'shared', 'replay-store.js'));
  const replayTelemetry = read(path.join(ROOT, 'src', 'js', '02-replay-telemetry.js'));
  const arcadeMusic = read(path.join(ROOT, 'src', 'js', '01-runtime-shell.js'));

  const requiredSnippets = [
    {
      file: 'src/js/03-platform-services.js',
      text: 'canPostVideo:top10&&signedIn&&confirmed&&authLane'
    },
    {
      file: 'src/js/03-platform-services.js',
      text: 'verifiedScore:top10&&signedIn&&confirmed&&authLane'
    },
    {
      file: 'src/js/12-auth-session.js',
      text: 'NON_PRODUCTION_LANE&&!isConfiguredTestAccountEmail(email)'
    },
    {
      file: 'src/js/12-auth-session.js',
      text: "RELEASE_CHANNEL==='production'&&isSignedInAsTestAccount()"
    },
    {
      file: 'src/js/11-leaderboard-service.js',
      text: 'if(!remoteWriteEnabled())'
    },
    {
      file: 'shared/replay-store.js',
      text: 'indexedDB.open(DB_NAME, DB_VERSION)'
    },
    {
      file: 'shared/replay-store.js',
      text: 'const MAX_REPLAYS = 5'
    },
    {
      file: 'src/js/02-replay-telemetry.js',
      text: 'window.AuroraReplayStore.saveReplay'
    },
    {
      file: 'src/js/01-runtime-shell.js',
      text: 'youtube.com/embed/videoseries'
    }
  ];
  const sourceByFile = {
    'src/js/03-platform-services.js': platform,
    'src/js/12-auth-session.js': auth,
    'src/js/11-leaderboard-service.js': scores,
    'shared/replay-store.js': replayStore,
    'src/js/02-replay-telemetry.js': replayTelemetry,
    'src/js/01-runtime-shell.js': arcadeMusic
  };
  const missing = requiredSnippets.filter(item => !sourceByFile[item.file].includes(item.text));
  if(missing.length) fail('Runtime security/auth/replay policy source checks failed.', { missing });
  if(/\b(fetch|XMLHttpRequest)\b/.test(replayStore)){
    fail('Replay store must remain browser-local; shared/replay-store.js contains network transport APIs.');
  }
}

function main(){
  for(const doc of REQUIRED_DOCS) read(path.join(ROOT, doc));
  assertIncludes('SECURITY_AUTH_REPLAY_STORAGE_LOCKDOWN.md', [
    'Top-10 video posting is authenticated and authorized only',
    'No YouTube upload token or OAuth client secret ships in browser code',
    'Replay video is browser-local IndexedDB by default',
    'Production score trust remains separate from client-side display eligibility',
    'npm run harness:check:security-auth-replay-storage'
  ]);
  assertIncludes('EXTERNAL_SERVICES.md', [
    'High-Score Video Posting',
    'server-owned upload',
    'no client-side YouTube upload credential'
  ]);
  assertIncludes('ARTIFACT_POLICY.md', [
    'Replay Storage Security Rule',
    'browser-local `IndexedDB`',
    'server-owned upload policy'
  ]);
  assertIncludes('RELEASE_POLICY.md', [
    'Security/Auth/Replay Storage Rule',
    'harness:check:security-auth-replay-storage'
  ]);
  assertIncludes('CODE_REVIEW_MODEL.md', [
    'security/auth/replay storage lock-down'
  ]);
  checkForbiddenClientSecrets();
  checkRuntimePolicySource();
  console.log(JSON.stringify({
    ok: true,
    docs: REQUIRED_DOCS,
    scannedRoots: CLIENT_SCAN_ROOTS,
    rules: [
      'no browser service-role/client-secret/YouTube upload credential',
      'top-10 video posting requires signed-in confirmed account eligibility',
      'non-production auth is limited to configured test pilots',
      'production test pilot is disabled',
      'replay storage remains browser-local IndexedDB until server-owned upload policy exists'
    ]
  }, null, 2));
}

main();
