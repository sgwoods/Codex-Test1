#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function ensureFile(file){
  if(!fs.existsSync(file)){
    fail('Reference-source integrity check failed: missing required file.', {
      file: path.relative(ROOT, file).replace(/\\/g, '/')
    });
  }
}

function countFiles(dir){
  return fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isFile()).length;
}

function rel(file){
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

const preservedRoot = path.join(ROOT, 'reference-artifacts', 'preserved-sources');
const neoRoot = path.join(preservedRoot, 'neo-galaga-history-2026-03-to-2026-04');
const galRoot = path.join(preservedRoot, 'galaga-classic-recovery-2026-05-17');
const neoManifestFile = path.join(neoRoot, 'source-manifest.json');
const galManifestFile = path.join(galRoot, 'source-manifest.json');

[
  path.join(preservedRoot, 'README.md'),
  path.join(neoRoot, 'README.md'),
  path.join(neoRoot, 'checksums.sha256'),
  neoManifestFile,
  path.join(galRoot, 'README.md'),
  path.join(galRoot, 'checksums.sha256'),
  galManifestFile,
  path.join(galRoot, 'video', 'galaga-stage-reference-video-proxy.mp4')
].forEach(ensureFile);

const neoManifest = readJson(neoManifestFile);
const galManifest = readJson(galManifestFile);

const neoSessionDir = path.join(neoRoot, 'sessions');
const neoVideoDir = path.join(neoRoot, 'videos');
if(neoManifest.pair_count !== 22){
  fail('Reference-source integrity check failed: representative Neo-Galaga pair count drifted.', {
    expected: 22,
    actual: neoManifest.pair_count
  });
}
if(!Array.isArray(neoManifest.items) || neoManifest.items.length !== 22){
  fail('Reference-source integrity check failed: Neo-Galaga manifest item count is wrong.', {
    expected: 22,
    actual: Array.isArray(neoManifest.items) ? neoManifest.items.length : null
  });
}
if(countFiles(neoSessionDir) !== 22 || countFiles(neoVideoDir) !== 22){
  fail('Reference-source integrity check failed: Neo-Galaga preserved-source file counts are wrong.', {
    sessionFiles: countFiles(neoSessionDir),
    videoFiles: countFiles(neoVideoDir)
  });
}

if(galManifest.stage_reference_video?.status !== 'proxy-committed-original-external'){
  fail('Reference-source integrity check failed: Galaga stage-reference provenance status drifted.', {
    actual: galManifest.stage_reference_video?.status || null
  });
}
if(!Array.isArray(galManifest.committed_artifacts) || galManifest.committed_artifacts.length < 5){
  fail('Reference-source integrity check failed: Galaga recovered artifact set is unexpectedly small.', {
    actual: Array.isArray(galManifest.committed_artifacts) ? galManifest.committed_artifacts.length : null
  });
}

const driftWatchFiles = [
  'AUDIO_PLAN.md',
  'tools/harness/analyze-galaga-timing-alignment.js',
  'reference-artifacts/analyses/galaga-stage-reference-video/README.md',
  'reference-artifacts/analyses/galaga-audio-reference-video/README.md',
  'reference-artifacts/analyses/galaga-audio-reference-video-2/README.md',
  'reference-artifacts/analyses/galaga-audio-reference-video-3/README.md',
  'reference-artifacts/analyses/challenge-stage-reference/README.md',
  'reference-artifacts/analyses/galaga-timing-alignment/2026-04-11-main-0549c6f/README.md',
  'reference-artifacts/analyses/galaga-stage-opening-timing/2026-04-12-main-a777fba/README.md'
].map((file) => path.join(ROOT, file));

const staleMarkers = [
  '/Users/stevenwoods/Downloads',
  '/Users/stevenwoods/Documents/Codex-Test1'
];

for(const file of driftWatchFiles){
  ensureFile(file);
  const source = fs.readFileSync(file, 'utf8');
  for(const marker of staleMarkers){
    if(source.includes(marker)){
      fail('Reference-source integrity check failed: stale machine-specific source path is still present.', {
        file: rel(file),
        marker
      });
    }
  }
}

console.log(JSON.stringify({
  ok: true,
  neoRepresentativePairs: neoManifest.pair_count,
  neoSessionFiles: countFiles(neoSessionDir),
  neoVideoFiles: countFiles(neoVideoDir),
  galRecoveredArtifacts: galManifest.committed_artifacts.length,
  stageReferenceStatus: galManifest.stage_reference_video.status
}, null, 2));
