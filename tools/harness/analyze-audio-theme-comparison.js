#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { withHarnessPage, ROOT } = require('./browser-check-util');

const guide = require(path.join(ROOT, 'application-guide.json'));

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function run(cmd, args, options = {}){
  const res = spawnSync(cmd, args, { encoding: 'utf8', ...options });
  if(res.status !== 0){
    fail(`${cmd} failed`, { args, status: res.status, stdout: res.stdout, stderr: res.stderr });
  }
  return res;
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function slug(text){
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function gitShortHead(){
  return run('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT }).stdout.trim();
}

function decodeToFile(base64, outPath){
  fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
}

function toWav(inPath, outPath){
  run('ffmpeg', ['-y', '-i', inPath, '-ac', '1', '-ar', '22050', outPath]);
}

async function main(){
  const commit = gitShortHead();
  const stamp = new Date().toISOString().slice(0, 10);
  const outRoot = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-audio-theme-comparison', `${stamp}-main-${commit}`);
  const samplesDir = path.join(outRoot, 'samples');
  ensureDir(samplesDir);

  const audioContexts = new Map((guide.audioContexts || []).map(entry => [entry.id, entry]));
  const comparisonSets = (guide.comparisonSets || []).map(item => {
    const entry = audioContexts.get(item.entryId);
    return entry ? { item, entry } : null;
  }).filter(Boolean);
  if(!comparisonSets.length) fail('No comparison sets were found in application-guide.json');

  const manifest = [];

  for(const row of comparisonSets){
    const id = slug(row.item.label || row.entry.label || row.entry.id);
    const auroraPayload = { ...row.entry.preview };
    const cue = String(auroraPayload.cue || '').trim();
    delete auroraPayload.cue;
    if(!cue) fail('Missing cue in comparison entry preview payload', row);

    const aurora = await withHarnessPage({ stage: 8, ships: 3, challenge: false, seed: 24141, skipStart: true }, async ({ page }) => {
      return await page.evaluate(async payload => {
        return await window.__galagaHarness__.captureAudioCue(payload.cue, payload.opts);
      }, { cue, opts: auroraPayload });
    });
    if(!aurora?.ok) fail('Aurora cue capture failed', { row, aurora });

    const galaga = await withHarnessPage({ stage: 8, ships: 3, challenge: false, seed: 24141, skipStart: true }, async ({ page }) => {
      return await page.evaluate(async payload => {
        return await window.__galagaHarness__.captureAudioCue(payload.cue, payload.opts);
      }, { cue, opts: { ...auroraPayload, audioTheme: 'galaga-original-reference' } });
    });
    if(!galaga?.ok) fail('Galaga cue capture failed', { row, galaga });

    const auroraWebm = path.join(samplesDir, `${id}-aurora.webm`);
    const galagaWebm = path.join(samplesDir, `${id}-galaga.webm`);
    const auroraWav = path.join(samplesDir, `${id}-aurora.wav`);
    const galagaWav = path.join(samplesDir, `${id}-galaga.wav`);
    decodeToFile(aurora.base64, auroraWebm);
    decodeToFile(galaga.base64, galagaWebm);
    toWav(auroraWebm, auroraWav);
    toWav(galagaWebm, galagaWav);

    const referenceRel = row.item.referenceClip;
    const referenceSource = path.join(ROOT, 'src', referenceRel.replace(/^assets\//, 'assets/'));
    if(!fs.existsSync(referenceSource)) fail('Reference clip missing', { referenceSource, row });
    const referenceWav = path.join(samplesDir, `${id}-reference.wav`);
    toWav(referenceSource, referenceWav);

    manifest.push({
      id,
      label: row.item.label || row.entry.label || row.entry.id,
      focus: row.item.focus || '',
      cue,
      aurora: {
        label: 'Aurora Application Mix',
        wav: path.relative(outRoot, auroraWav),
        webm: path.relative(outRoot, auroraWebm),
        audioCue: aurora.audioCue || null
      },
      galaga: {
        label: 'Galaga Original Reference (synthetic)',
        wav: path.relative(outRoot, galagaWav),
        webm: path.relative(outRoot, galagaWebm),
        audioCue: galaga.audioCue || null
      },
      reference: {
        label: row.item.referenceLabel || 'Reference',
        source: path.relative(ROOT, referenceSource),
        wav: path.relative(outRoot, referenceWav)
      }
    });
  }

  const manifestPath = path.join(outRoot, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    commit,
    version: require(path.join(ROOT, 'package.json')).version,
    items: manifest
  }, null, 2));

  run('python3', [path.join(ROOT, 'tools', 'harness', 'render-audio-comparison-report.py'), manifestPath], { cwd: ROOT, stdio: 'inherit' });

  console.log(JSON.stringify({ ok: true, outRoot }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
