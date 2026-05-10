#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const APP_GUIDE = path.join(ROOT, 'application-guide.json');
const AURORA_PACK = path.join(ROOT, 'src', 'js', '13-aurora-game-pack.js');
const GAME_CATALOG = path.join(ROOT, 'GAME_CONFORMANCE_CATALOG.md');
const DASHBOARD = path.join(ROOT, 'reference-artifacts', 'analyses', 'release-conformance-dashboard', 'latest.json');
const DIST_PUBLIC_PAGE = path.join(ROOT, 'dist', 'dev', 'public-project-page.html');
const LOCAL_PUBLIC_PREVIEW = path.join(ROOT, 'local-dev', 'public-aurora-galactica-preview.html');

const CHECKED_AUDIO_EVENTS = [
  { entryId: 'formation-arrival', cue: 'formationArrival' },
  { entryId: 'stage-transition', cue: 'stageTransition' },
  { entryId: 'challenge-transition', cue: 'challengeTransition' },
  { entryId: 'challenge-results', cue: 'challengeResults' },
  { entryId: 'challenge-perfect', cue: 'challengePerfect' }
];

function read(file){
  return fs.readFileSync(file, 'utf8');
}

function readJson(file){
  return JSON.parse(read(file));
}

function fail(message, extra = {}){
  console.error(JSON.stringify({ ok: false, message, ...extra }, null, 2));
  process.exit(1);
}

function sourceCueBlock(source, cue){
  const escaped = cue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`${escaped}:referenceAudioCue\\([^,]+,\\s*\\{([\\s\\S]*?)\\n\\s*\\}\\),?`));
  return match ? match[1] : '';
}

function sourceClipDuration(source, cue){
  const block = sourceCueBlock(source, cue);
  const match = block.match(/clipDuration:\s*(\d*\.?\d+)/);
  if(!match) return null;
  return +match[1];
}

function eventClipDuration(entry){
  const match = String(entry?.audioName || '').match(/excerpt\s+0\.00s-(\d+(?:\.\d+)?)s/i);
  if(!match) return null;
  return +match[1];
}

function nearlyEqual(a, b){
  return Math.abs(a - b) <= 0.005;
}

function releaseGateCurrent(name, dashboard){
  const gate = (dashboard.releaseGate || []).find(row => String(row.Gate || '').toLowerCase() === name.toLowerCase());
  return gate?.Current || '';
}

function publicSyncMarker(html){
  return String(html.match(/public-sync:[^>]+/)?.[0] || '').trim();
}

const guide = readJson(APP_GUIDE);
const source = read(AURORA_PACK);
const catalog = read(GAME_CATALOG);
const dashboard = readJson(DASHBOARD);

const eventsById = new Map((guide.audioEventMatrix || []).map(event => [event.entryId, event]));
const mismatchedEvents = [];
for(const check of CHECKED_AUDIO_EVENTS){
  const event = eventsById.get(check.entryId);
  if(!event){
    mismatchedEvents.push({ entryId: check.entryId, cue: check.cue, reason: 'missing application-guide event' });
    continue;
  }
  const expected = sourceClipDuration(source, check.cue);
  const documented = eventClipDuration(event);
  if(!Number.isFinite(expected) || !Number.isFinite(documented) || !nearlyEqual(expected, documented)){
    mismatchedEvents.push({
      entryId: check.entryId,
      cue: check.cue,
      expected,
      documented,
      audioName: event.audioName
    });
  }
}
if(mismatchedEvents.length){
  fail('Application audio event matrix is stale against runtime cue clip durations.', { mismatchedEvents });
}

const audioCurrent = releaseGateCurrent('Audio identity', dashboard);
const requiredCatalogText = [
  `audio identity category is now ${audioCurrent}`,
  'stageTransition` was too abbreviated, so the reference-backed phrase was widened to 3.35s',
  '`challengeTransition` now uses a 1.6s measured phrase',
  '`challengeResults` uses 1.95s',
  '`challengePerfect` uses 2.15s'
].filter(Boolean);
const missingCatalogText = requiredCatalogText.filter(text => !catalog.includes(text));
if(missingCatalogText.length){
  fail('Game conformance catalog is missing current audio/doc freshness text.', { missingCatalogText });
}

if(fs.existsSync(DIST_PUBLIC_PAGE) && fs.existsSync(LOCAL_PUBLIC_PREVIEW)){
  const distMarker = publicSyncMarker(read(DIST_PUBLIC_PAGE));
  const localMarker = publicSyncMarker(read(LOCAL_PUBLIC_PREVIEW));
  if(distMarker && localMarker && distMarker !== localMarker){
    fail('Local public project preview is stale against dist/dev/public-project-page.html.', {
      distMarker,
      localMarker,
      expectedAction: 'Run npm run build so local-dev/public-aurora-galactica-preview.html is refreshed.'
    });
  }
}

console.log(JSON.stringify({
  ok: true,
  checkedAudioEvents: CHECKED_AUDIO_EVENTS.length,
  audioCurrent,
  catalog: path.relative(ROOT, GAME_CATALOG),
  applicationGuide: path.relative(ROOT, APP_GUIDE)
}, null, 2));
