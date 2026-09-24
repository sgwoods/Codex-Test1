#!/usr/bin/env node
const path = require('path');
const { loadPlatinumGameProfile } = require('./platinum-game-profile-lib');

const ROOT = path.resolve(__dirname, '..', '..');
const files = [
  ['galaxy-guardians-preview', 'reference-artifacts/analyses/galaxy-guardians-identity/platinum-game-profile-0.1.json'],
  ['aurora-galactica', 'reference-artifacts/analyses/galaxy-guardians-identity/aurora-platinum-game-profile-fixture-0.1.json']
];

try {
  const profiles = files.map(([gameKey, relative]) => loadPlatinumGameProfile(path.join(ROOT, relative), { expectedGameKey: gameKey }));
  const mappings = require(path.join(ROOT, 'reference-artifacts/analyses/galaxy-guardians-identity/video-ingestion-profile-mapping-0.1.json'));
  if(mappings.artifactType !== 'platinum-video-ingestion-profile-mapping' || !mappings.mappings?.length) throw new Error('Missing video-ingestion mapping contract.');
  console.log(JSON.stringify({ ok: true, profiles: profiles.map(profile => ({ gameKey: profile.gameKey, layerCount: Object.keys(profile.layers).length })), ingestionMappingCount: mappings.mappings.length }, null, 2));
} catch(err){
  console.error(err && err.stack || String(err));
  process.exit(1);
}
