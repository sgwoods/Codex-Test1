#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DASHBOARD_PATH = path.join(ROOT, 'ingestion-dashboard.json');

const SCOPE_CODES = {
  global: 'PLAT',
  games: {
    'aurora-galactica': 'AUR',
    'galaxy-guardians': 'GGD',
    'galaxy-guardians-preview': 'GGD',
    'windigo-invaders': 'WIN'
  }
};

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function padNumber(value){
  return String(value).padStart(3, '0');
}

function maxIdNumber(items, key, prefix){
  let max = 0;
  const pattern = new RegExp(`^${prefix}-(\\d{3})$`);
  for(const item of items || []){
    if(!item || typeof item !== 'object') continue;
    const raw = String(item[key] || '');
    const match = raw.match(pattern);
    if(match){
      max = Math.max(max, Number(match[1]));
    }
  }
  return max;
}

function assignIds(items, key, prefix){
  let next = maxIdNumber(items, key, prefix) + 1;
  for(const item of items || []){
    if(!item || typeof item !== 'object') continue;
    if(!item[key]){
      item[key] = `${prefix}-${padNumber(next)}`;
      next += 1;
    }
  }
  return items;
}

function normalizeGlobalHunt(entry){
  if(typeof entry === 'string'){
    return {
      title: 'Standing hunt',
      detail: entry
    };
  }
  return {
    ...entry,
    title: entry.title || 'Standing hunt',
    detail: entry.detail || entry.text || ''
  };
}

function normalizeGap(entry){
  if(typeof entry === 'string'){
    return {
      title: 'Needed artifact',
      why: entry
    };
  }
  return entry;
}

function ensureReferenceScheme(data){
  if(!data.referenceIdScheme){
    data.referenceIdScheme = {
      format: '<scope>-<kind>-<nnn>',
      description: 'Stable IDs for dashboard artifacts, process docs, plan tracks, and hunt recommendations.',
      scopes: {
        PLAT: 'Shared Platinum or dashboard-wide items',
        AUR: 'Aurora Galactica items',
        GGD: 'Galaxy Guardians items',
        WIN: 'Windigo Invaders items'
      },
      kinds: {
        DOC: 'Shared process or report doc',
        ART: 'Artifact-backed source, analysis, preview, or anchor item',
        PLAN: 'Dashboard plan-track item',
        GAP: 'Game-specific gap or hunt recommendation',
        HUNT: 'Shared cross-game hunt recommendation'
      }
    };
  }
}

function ensureReferenceDoc(data){
  const href = 'ARTIFACT_REFERENCE_ID_SCHEME.md';
  const docs = Array.isArray(data.globalDocs) ? data.globalDocs : [];
  const exists = docs.some((item) => item && item.href === href);
  if(!exists){
    docs.unshift({
      label: 'Artifact Reference ID Scheme',
      hrefType: 'repoDoc',
      href,
      detail: 'Stable ID rules for dashboard artifacts, plan tracks, hunts, and repo reports.'
    });
  }
  data.globalDocs = docs;
}

function assignGameArtifactIds(game, scope){
  const artifactPrefix = `${scope}-ART`;
  const artifactPool = [];

  for(const group of game.artifactGroups || []){
    for(const item of group.items || []){
      artifactPool.push(item);
    }
  }

  for(const preview of game.previews || []){
    artifactPool.push(preview);
  }

  assignIds(artifactPool, 'artifactId', artifactPrefix);
}

function main(){
  const data = readJson(DASHBOARD_PATH);

  ensureReferenceScheme(data);
  ensureReferenceDoc(data);

  data.globalDocs = assignIds(Array.isArray(data.globalDocs) ? data.globalDocs : [], 'docId', `${SCOPE_CODES.global}-DOC`);
  data.globalHunts = assignIds((Array.isArray(data.globalHunts) ? data.globalHunts : []).map(normalizeGlobalHunt), 'huntId', `${SCOPE_CODES.global}-HUNT`);

  for(const game of data.games || []){
    const scope = SCOPE_CODES.games[game.gameKey];
    if(!scope) continue;

    assignGameArtifactIds(game, scope);
    game.planTracks = assignIds(Array.isArray(game.planTracks) ? game.planTracks : [], 'planId', `${scope}-PLAN`);
    game.nextArtifacts = assignIds((Array.isArray(game.nextArtifacts) ? game.nextArtifacts : []).map(normalizeGap), 'gapId', `${scope}-GAP`);
  }

  writeJson(DASHBOARD_PATH, data);
}

main();
