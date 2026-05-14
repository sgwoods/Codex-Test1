#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { withHarnessPage, ROOT } = require('./browser-check-util');
const { renderSpecToWav, specScheduledDurationSeconds } = require('./audio-spec-renderer');

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

function referenceWindowArgs(window){
  if(!window) return [];
  const start = Number(window.startSeconds);
  const end = Number(window.endSeconds);
  if(!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];
  return ['-ss', String(start), '-t', String(end - start)];
}

function toWav(inPath, outPath, window = null){
  run('ffmpeg', ['-y', '-i', inPath, ...referenceWindowArgs(window), '-ac', '1', '-ar', '22050', outPath]);
}

function decodedBytes(result){
  if(!result?.base64) return 0;
  try{
    return Buffer.from(result.base64, 'base64').length;
  }catch{
    return 0;
  }
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function analysisWindowFromCapture(capture){
  const prerollMs = Number(capture?.capturePrerollMs);
  const specDuration = specScheduledDurationSeconds(capture?.audioSpec || {});
  const cueDuration = Number(capture?.audioCue?.referenceClipDuration);
  const duration = Number.isFinite(specDuration) && specDuration > 0 ? specDuration : cueDuration;
  if(!Number.isFinite(prerollMs) || !Number.isFinite(duration) || duration <= 0) return null;
  return {
    start_s: round(prerollMs / 1000, 3),
    duration_s: round(duration, 3),
    source: 'captured-cue-preroll-and-runtime-reference-duration'
  };
}

function referenceAnalysisWindow(item){
  const segments = item?.referenceSegmentation?.segments || [];
  const starts = segments.map(segment => Number(segment.startSeconds ?? segment.start_s)).filter(Number.isFinite);
  const ends = segments.map(segment => Number(segment.endSeconds ?? segment.end_s)).filter(Number.isFinite);
  if(starts.length && ends.length){
    const start = Math.min(...starts);
    const end = Math.max(...ends);
    if(end > start){
      return {
        start_s: round(start, 3),
        duration_s: round(end - start, 3),
        source: 'curated-reference-segmentation-span'
      };
    }
  }
  return null;
}

async function captureCueWithRetry(row, cue, opts, label){
  const attempts = Math.max(1, Number(process.env.AURORA_AUDIO_CAPTURE_RETRIES || 3));
  let last = null;
  for(let attempt = 1; attempt <= attempts; attempt += 1){
    const capture = await withHarnessPage({ stage: 8, ships: 3, challenge: false, seed: 24141 + attempt, skipStart: true }, async ({ page }) => {
      await page.evaluate(() => installGamePack('aurora-galactica', { persist: false }));
      return await page.evaluate(async payload => {
        return await window.__galagaHarness__.captureAudioCue(payload.cue, payload.opts);
      }, {
        cue,
        opts: {
          ...opts,
          allowIdle: true,
          minCaptureBytes: 512
        }
      });
    });
    const byteLength = decodedBytes(capture);
    last = Object.assign({}, capture || {}, { byteLength, attempt });
    const capturedCue = String(capture?.audioCue?.cue || '').trim();
    if(capture?.ok && byteLength >= 512 && capturedCue === cue) return last;
    if(attempt === attempts && capture?.audioSpec && capturedCue === cue){
      return Object.assign({}, last, {
        ok: true,
        offlineRender: true,
        offlineReason: capture?.error || 'Browser MediaRecorder returned no decodable bytes; rendered resolved cue spec offline.'
      });
    }
    if(capture?.ok && byteLength >= 512 && capturedCue !== cue){
      last.captureMismatch = { expectedCue: cue, capturedCue: capturedCue || '(none)' };
    }
  }
  fail(`${label} cue capture failed after retries`, { row: row.item.id, cue, last });
}

function writeCaptureAudioFiles(capture, webmPath, wavPath){
  if(capture.offlineRender){
    renderSpecToWav(capture.audioSpec || {}, wavPath, capture.capturePrerollMs || 80);
    return {
      webm: null,
      wav: wavPath,
      renderMode: 'offline-spec-render',
      offlineReason: capture.offlineReason || ''
    };
  }
  decodeToFile(capture.base64, webmPath);
  toWav(webmPath, wavPath);
  return {
    webm: webmPath,
    wav: wavPath,
    renderMode: 'browser-media-recorder',
    offlineReason: ''
  };
}

function pythonForAudioReport(){
  const bundled = path.join(process.env.HOME || '', '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'python', 'bin', 'python3');
  return fs.existsSync(bundled) ? bundled : 'python3';
}

async function main(){
  const commit = gitShortHead();
  const generatedAt = new Date().toISOString();
  const stamp = generatedAt.slice(0, 10);
  const runClock = generatedAt.slice(11, 19).replace(/:/g, '');
  const outRoot = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-audio-theme-comparison', `${stamp}-main-${commit}-${runClock}`);
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
    const auroraPayload = { ...row.entry.preview, audioTheme: 'aurora-application' };
    const cue = String(auroraPayload.cue || '').trim();
    delete auroraPayload.cue;
    if(!cue) fail('Missing cue in comparison entry preview payload', row);

    const aurora = await captureCueWithRetry(row, cue, auroraPayload, 'Aurora');
    const galaga = await captureCueWithRetry(row, cue, { ...auroraPayload, audioTheme: 'galaga-original-reference' }, 'Galaga');

    const auroraWebm = path.join(samplesDir, `${id}-aurora.webm`);
    const galagaWebm = path.join(samplesDir, `${id}-galaga.webm`);
    const auroraWav = path.join(samplesDir, `${id}-aurora.wav`);
    const galagaWav = path.join(samplesDir, `${id}-galaga.wav`);
    const auroraFiles = writeCaptureAudioFiles(aurora, auroraWebm, auroraWav);
    const galagaFiles = writeCaptureAudioFiles(galaga, galagaWebm, galagaWav);

    const referenceRel = row.item.referenceClip;
    const referenceSource = path.join(ROOT, 'src', referenceRel.replace(/^assets\//, 'assets/'));
    if(!fs.existsSync(referenceSource)) fail('Reference clip missing', { referenceSource, row });
    const referenceWav = path.join(samplesDir, `${id}-reference.wav`);
    const referenceWindow = row.item.referenceWindow || null;
    toWav(referenceSource, referenceWav, referenceWindow);

    manifest.push({
      id,
      label: row.item.label || row.entry.label || row.entry.id,
      focus: row.item.focus || '',
      cue,
      analysisPolicy: row.item.analysisPolicy || null,
      aurora: {
        label: 'Aurora Application Mix',
        wav: path.relative(outRoot, auroraWav),
        webm: auroraFiles.webm ? path.relative(outRoot, auroraFiles.webm) : null,
        renderMode: auroraFiles.renderMode,
        offlineReason: auroraFiles.offlineReason,
        audioCue: aurora.audioCue || null,
        capture: {
          attempt: aurora.attempt || 1,
          byteLength: aurora.byteLength || 0,
          captureMs: aurora.captureMs || null,
          capturePrerollMs: aurora.capturePrerollMs || null
        },
        analysisWindow: analysisWindowFromCapture(aurora),
        captureAttempt: aurora.attempt || 1,
        captureBytes: aurora.byteLength || 0
      },
      galaga: {
        label: 'Galaga Original Reference (synthetic)',
        wav: path.relative(outRoot, galagaWav),
        webm: galagaFiles.webm ? path.relative(outRoot, galagaFiles.webm) : null,
        renderMode: galagaFiles.renderMode,
        offlineReason: galagaFiles.offlineReason,
        audioCue: galaga.audioCue || null,
        capture: {
          attempt: galaga.attempt || 1,
          byteLength: galaga.byteLength || 0,
          captureMs: galaga.captureMs || null,
          capturePrerollMs: galaga.capturePrerollMs || null
        },
        analysisWindow: analysisWindowFromCapture(galaga),
        captureAttempt: galaga.attempt || 1,
        captureBytes: galaga.byteLength || 0
      },
      reference: {
        label: row.item.referenceLabel || 'Reference',
        source: path.relative(ROOT, referenceSource),
        wav: path.relative(outRoot, referenceWav),
        window: referenceWindow,
        analysisWindow: referenceAnalysisWindow(row.item),
        segmentation: row.item.referenceSegmentation || null
      }
    });
  }

  const manifestPath = path.join(outRoot, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    generatedAt,
    commit,
    version: require(path.join(ROOT, 'package.json')).version,
    items: manifest
  }, null, 2));

  run(pythonForAudioReport(), [path.join(ROOT, 'tools', 'harness', 'render-audio-comparison-report.py'), manifestPath], { cwd: ROOT, stdio: 'inherit' });

  console.log(JSON.stringify({ ok: true, outRoot }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
