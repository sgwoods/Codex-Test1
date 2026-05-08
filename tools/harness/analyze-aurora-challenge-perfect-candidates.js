#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');
const { withHarnessPage, ROOT } = require('./browser-check-util');

const GUIDE = require(path.join(ROOT, 'application-guide.json'));
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'aurora-audio-cue-candidates');
const CUE = 'challengePerfect';
const ENTRY_ID = 'challenge-perfect';

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

function rel(file, base = ROOT){
  return path.relative(base, file).split(path.sep).join('/');
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function slug(text){
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'candidate';
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

function pythonForAudioReport(){
  const bundled = path.join(process.env.HOME || '', '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'python', 'bin', 'python3');
  return fs.existsSync(bundled) ? bundled : 'python3';
}

function comparisonSet(){
  const set = (GUIDE.comparisonSets || []).find(item => item.entryId === ENTRY_ID || item.id === 'challenge-perfect-compare');
  if(!set) fail('Challenge Perfect comparison set is missing from application-guide.json');
  const entry = (GUIDE.audioContexts || []).find(ctx => ctx.id === set.entryId);
  if(!entry) fail('Challenge Perfect audio context is missing from application-guide.json', set);
  return { set, entry };
}

function candidateSpecs(){
  return [
    {
      id: 'baseline-current',
      label: 'Current Aurora baseline',
      baseline: true
    },
    {
      id: 'thin-bright-triangle',
      label: 'Thin bright triangle ladder',
      spec: { seq: [784, 1175, 1568, 2093, 2794], step: .048, wave: 'triangle', volume: .0098, slide: 34, lpHz: 6200, tones: [{ freq: 3136, duration: .12, wave: 'triangle', volume: .0038, slide: 18, lpHz: 7200, delay: .192 }] }
    },
    {
      id: 'thin-bright-square-top',
      label: 'Thin bright square top',
      spec: { seq: [784, 1175, 1568, 2093, 2794], step: .048, wave: 'triangle', volume: .0094, slide: 26, lpHz: 6500, tones: [{ freq: 3136, duration: .11, wave: 'square', volume: .0032, slide: 8, lpHz: 7600, delay: .192 }] }
    },
    {
      id: 'thin-bright-square-held',
      label: 'Thin bright square held',
      spec: { seq: [784, 1175, 1568, 2093, 2794], step: .049, wave: 'triangle', volume: .0088, slide: 24, lpHz: 6500, tones: [{ freq: 3136, duration: .145, wave: 'square', volume: .0027, slide: 4, lpHz: 7600, delay: .192 }] }
    },
    {
      id: 'thin-bright-square-soft-held',
      label: 'Thin bright square soft held',
      spec: { seq: [784, 1175, 1568, 2093, 2794], step: .05, wave: 'triangle', volume: .0082, slide: 22, lpHz: 6400, tones: [{ freq: 3136, duration: .15, wave: 'square', volume: .0022, slide: 0, lpHz: 7400, delay: .19 }] }
    },
    {
      id: 'thin-bright-square-quiet-held',
      label: 'Thin bright square quiet held',
      spec: { seq: [784, 1175, 1568, 2093, 2794], step: .049, wave: 'triangle', volume: .0058, slide: 22, lpHz: 6500, tones: [{ freq: 3136, duration: .145, wave: 'square', volume: .00145, slide: 0, lpHz: 7600, delay: .192 }] }
    },
    {
      id: 'thin-bright-square-micro-held',
      label: 'Thin bright square micro held',
      spec: { seq: [784, 1175, 1568, 2093, 2794], step: .049, wave: 'triangle', volume: .0042, slide: 22, lpHz: 6500, tones: [{ freq: 3136, duration: .145, wave: 'square', volume: .001, slide: 0, lpHz: 7600, delay: .192 }] }
    },
    {
      id: 'thin-bright-square-quiet-tail',
      label: 'Thin bright square quiet tail',
      spec: { seq: [784, 1175, 1568, 2093, 2794], step: .049, wave: 'triangle', volume: .005, slide: 22, lpHz: 6500, tones: [{ freq: 3136, duration: .11, wave: 'square', volume: .00125, slide: 0, lpHz: 7600, delay: .192 }, { freq: 2794, duration: .05, wave: 'triangle', volume: .0008, slide: 0, lpHz: 6500, delay: .29 }] }
    },
    {
      id: 'high-square-stair',
      label: 'High square stair',
      spec: { seq: [932, 1245, 1661, 2217, 2960], step: .047, wave: 'square', volume: .0076, slide: 16, lpHz: 5600, tones: [{ freq: 3520, duration: .105, wave: 'triangle', volume: .0028, slide: 8, lpHz: 7000, delay: .188 }] }
    },
    {
      id: 'octave-chime-thin',
      label: 'Octave chime thin',
      spec: { seq: [1047, 1318, 1760, 2349, 3136], step: .046, wave: 'triangle', volume: .0088, slide: 18, lpHz: 6800, tones: [{ freq: 4186, duration: .09, wave: 'sine', volume: .0026, slide: 0, lpHz: 7600, delay: .184 }] }
    },
    {
      id: 'staccato-bright',
      label: 'Staccato bright',
      spec: { seq: [880, 1175, 1568, 2093, 2794, 3520], step: .039, wave: 'triangle', volume: .0086, slide: 10, lpHz: 6900, tones: [{ freq: 3136, duration: .075, wave: 'square', volume: .0027, slide: 0, lpHz: 7600, delay: .195 }] }
    },
    {
      id: 'sparkle-noise-light',
      label: 'Sparkle with light noise',
      spec: { seq: [784, 1175, 1568, 2093, 2794], step: .048, wave: 'triangle', volume: .0088, slide: 24, lpHz: 6200, tones: [{ freq: 3520, duration: .1, wave: 'sine', volume: .0026, slide: 0, lpHz: 7600, delay: .19 }], noise: [{ duration: .045, volume: .0011, hp: 3800, delay: .21 }] }
    },
    {
      id: 'sparkle-low-rms',
      label: 'Sparkle low RMS',
      spec: { seq: [784, 1175, 1568, 2093, 2794], step: .048, wave: 'triangle', volume: .0077, slide: 24, lpHz: 6400, tones: [{ freq: 3520, duration: .092, wave: 'sine', volume: .002, slide: 0, lpHz: 7600, delay: .19 }], noise: [{ duration: .034, volume: .00045, hp: 4200, delay: .21 }] }
    },
    {
      id: 'sparkle-low-rms-square-edge',
      label: 'Sparkle low RMS square edge',
      spec: { seq: [784, 1175, 1568, 2093, 2794], step: .048, wave: 'triangle', volume: .0075, slide: 24, lpHz: 6400, tones: [{ freq: 3520, duration: .082, wave: 'square', volume: .0015, slide: 0, lpHz: 7600, delay: .19 }], noise: [{ duration: .024, volume: .00028, hp: 4200, delay: .212 }] }
    },
    {
      id: 'sparkle-low-rms-centered-zcr',
      label: 'Sparkle low RMS centered ZCR',
      spec: { seq: [784, 1175, 1568, 2093, 2794], step: .048, wave: 'triangle', volume: .0076, slide: 24, lpHz: 6400, tones: [{ freq: 3520, duration: .09, wave: 'triangle', volume: .0018, slide: 0, lpHz: 7600, delay: .19 }, { freq: 3136, duration: .05, wave: 'square', volume: .0009, slide: 0, lpHz: 7200, delay: .235 }], noise: [{ duration: .024, volume: .00025, hp: 4200, delay: .212 }] }
    },
    {
      id: 'sparkle-short-tail',
      label: 'Sparkle short tail',
      spec: { seq: [784, 1175, 1568, 2093, 2794], step: .045, wave: 'triangle', volume: .008, slide: 20, lpHz: 6600, tones: [{ freq: 3520, duration: .07, wave: 'sine', volume: .0021, slide: 0, lpHz: 7800, delay: .18 }], noise: [{ duration: .026, volume: .00035, hp: 4400, delay: .198 }] }
    },
    {
      id: 'low-rms-harmonic',
      label: 'Low RMS harmonic',
      spec: { seq: [698, 1047, 1397, 2093, 3136], step: .05, wave: 'triangle', volume: .0082, slide: 36, lpHz: 7000, tones: [{ freq: 4186, duration: .1, wave: 'triangle', volume: .0028, slide: 12, lpHz: 8000, delay: .2 }] }
    },
    {
      id: 'low-rms-brighter',
      label: 'Low RMS brighter',
      spec: { seq: [784, 1047, 1397, 2093, 3136], step: .048, wave: 'triangle', volume: .0078, slide: 32, lpHz: 7400, tones: [{ freq: 4186, duration: .088, wave: 'triangle', volume: .0022, slide: 6, lpHz: 8200, delay: .192 }] }
    },
    {
      id: 'low-rms-square-edge',
      label: 'Low RMS square edge',
      spec: { seq: [784, 1047, 1397, 2093, 3136], step: .048, wave: 'triangle', volume: .0072, slide: 28, lpHz: 6900, tones: [{ freq: 3520, duration: .078, wave: 'square', volume: .0017, slide: 0, lpHz: 7600, delay: .188 }] }
    }
  ];
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function clamp(value, min, max){
  return Math.max(min, Math.min(max, value));
}

function argValue(name){
  const prefix = `--${name}=`;
  const inline = process.argv.find(arg => arg.startsWith(prefix));
  if(inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : '';
}

function repeatCount(){
  const requested = Number(argValue('repeats') || process.env.AURORA_AUDIO_CANDIDATE_REPEATS || 1);
  return Number.isFinite(requested) ? Math.max(1, Math.min(5, Math.floor(requested))) : 1;
}

function candidateFilter(){
  const raw = argValue('candidate-ids') || process.env.AURORA_AUDIO_CANDIDATE_IDS || '';
  return new Set(String(raw).split(',').map(item => item.trim()).filter(Boolean));
}

function mean(values){
  const numeric = values.filter(value => Number.isFinite(+value)).map(Number);
  return numeric.length ? numeric.reduce((sum, value) => sum + value, 0) / numeric.length : null;
}

function stddev(values){
  const numeric = values.filter(value => Number.isFinite(+value)).map(Number);
  if(numeric.length < 2) return 0;
  const avg = mean(numeric);
  return Math.sqrt(numeric.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / numeric.length);
}

function riskFromComparison(comparison){
  const durationGap = +comparison.duration_s || 0;
  const centroidGap = +comparison.spectral_centroid_hz || 0;
  const zcrGap = +comparison.zero_crossings_per_s || 0;
  const rmsGap = +comparison.rms || 0;
  const raw =
    clamp(durationGap / 3, 0, 3.4) +
    clamp(centroidGap / 500, 0, 2.5) +
    clamp(zcrGap / 1200, 0, 2.1) +
    clamp(rmsGap / .13, 0, 1.5) +
    .45;
  return round(clamp(raw * 1.05, 0, 10), 2);
}

function decisionFor(rows){
  const baseline = rows.find(row => row.id === 'baseline-current');
  const candidates = rows.filter(row => row.id !== 'baseline-current');
  if(!baseline){
    return {
      status: 'no-keeper',
      keep: false,
      baseline: null,
      best: null,
      measuredBest: null,
      reason: 'Baseline Challenge Perfect row was not captured.'
    };
  }
  const measuredBest = candidates
    .filter(row => row.durationGapSeconds <= .08)
    .sort((a, b) => a.risk10 - b.risk10 || a.rmsGap - b.rmsGap || a.centroidGapHz - b.centroidGapHz)[0] || null;
  const gated = candidates
    .filter(row => row.durationGapSeconds <= .08)
    .map(row => {
      const riskDelta = round(baseline.risk10 - row.risk10, 3);
      const centroidDelta = round(baseline.centroidGapHz - row.centroidGapHz, 1);
      const rmsDelta = round(baseline.rmsGap - row.rmsGap, 4);
      return { row, riskDelta, centroidDelta, rmsDelta };
    })
    .filter(item => item.riskDelta >= .25 && item.centroidDelta > 0 && item.rmsDelta >= -.01)
    .sort((a, b) => b.riskDelta - a.riskDelta || b.centroidDelta - a.centroidDelta || b.rmsDelta - a.rmsDelta);
  const selected = gated[0] || null;
  if(!selected){
    return {
      status: 'no-keeper',
      keep: false,
      baseline: baseline.id,
      best: null,
      measuredBest: measuredBest?.id || null,
      reason: measuredBest
        ? 'The lowest-risk candidate did not clear all keeper gates, and no other candidate did either.'
        : 'No candidate preserved Challenge Perfect duration closely enough to be considered.'
    };
  }
  const best = selected.row;
  const riskDelta = round(baseline.risk10 - best.risk10, 3);
  const centroidDelta = round(baseline.centroidGapHz - best.centroidGapHz, 1);
  const rmsDelta = round(baseline.rmsGap - best.rmsGap, 4);
  return {
    status: 'candidate-recommended',
    keep: true,
    baseline: baseline.id,
    best: best.id,
    measuredBest: measuredBest?.id || null,
    riskDelta,
    centroidDelta,
    rmsDelta,
    reason: 'Selected candidate clears risk, centroid, RMS, and duration gates. The measured-lowest-risk candidate is tracked separately so the next sweep can still learn from it.'
  };
}

function baseCandidateId(id){
  return String(id || '').replace(/-r\d+$/, '');
}

function aggregateRows(sampleRows){
  const groups = new Map();
  for(const row of sampleRows){
    const id = baseCandidateId(row.id);
    if(!groups.has(id)) groups.set(id, []);
    groups.get(id).push(row);
  }
  const rows = [];
  for(const [id, group] of groups){
    const first = group[0];
    const avgComparison = {
      duration_s: round(mean(group.map(row => row.comparison.duration_s)), 3),
      spectral_centroid_hz: round(mean(group.map(row => row.comparison.spectral_centroid_hz)), 1),
      zero_crossings_per_s: round(mean(group.map(row => row.comparison.zero_crossings_per_s)), 1),
      rms: round(mean(group.map(row => row.comparison.rms)), 4)
    };
    rows.push({
      id,
      label: first.baseLabel || first.label,
      risk10: riskFromComparison(avgComparison),
      durationGapSeconds: avgComparison.duration_s,
      centroidGapHz: avgComparison.spectral_centroid_hz,
      zeroCrossingGapPerSecond: avgComparison.zero_crossings_per_s,
      rmsGap: avgComparison.rms,
      activeMetrics: {
        duration_s: round(mean(group.map(row => row.activeMetrics.duration_s)), 3),
        peak: round(mean(group.map(row => row.activeMetrics.peak)), 4),
        rms: round(mean(group.map(row => row.activeMetrics.rms)), 4),
        spectral_centroid_hz: round(mean(group.map(row => row.activeMetrics.spectral_centroid_hz)), 1),
        zero_crossings_per_s: round(mean(group.map(row => row.activeMetrics.zero_crossings_per_s)), 1)
      },
      comparison: avgComparison,
      stability: {
        repetitions: group.length,
        riskStd: round(stddev(group.map(row => row.risk10)), 3),
        centroidGapStdHz: round(stddev(group.map(row => row.centroidGapHz)), 1),
        rmsGapStd: round(stddev(group.map(row => row.rmsGap)), 4),
        durationGapStdSeconds: round(stddev(group.map(row => row.durationGapSeconds)), 3)
      },
      samples: group.map(row => ({
        id: row.id,
        repetition: row.repetition,
        risk10: row.risk10,
        durationGapSeconds: row.durationGapSeconds,
        centroidGapHz: row.centroidGapHz,
        rmsGap: row.rmsGap
      }))
    });
  }
  return rows.sort((a, b) => a.risk10 - b.risk10 || a.durationGapSeconds - b.durationGapSeconds);
}

function markdown(report){
  const lines = [
    '# Aurora Challenge Perfect Audio Candidate Loop',
    '',
    `Generated: \`${report.generatedAt}\``,
    `Commit: \`${report.commit}\``,
    '',
    '## Problem',
    '',
    report.problem,
    '',
    '## Strategy',
    '',
    report.strategy,
    '',
    '## Success Measure',
    '',
    report.successMeasure,
    '',
    '## Decision',
    '',
    `- Status: \`${report.decision.status}\``,
    `- Keep candidate: ${report.decision.keep ? 'yes' : 'no'}`,
    `- Best candidate: \`${report.decision.best || 'n/a'}\``,
    `- Measured best: \`${report.decision.measuredBest || 'n/a'}\``,
    `- Reason: ${report.decision.reason}`,
    `- Repetitions per candidate: ${report.repetitions}`,
    '',
    '## Candidates',
    '',
    '| Candidate | Risk /10 | Duration Gap | Centroid Gap | ZCR Gap | RMS Gap | Stability |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |'
  ];
  for(const row of report.candidates){
    const stability = row.stability ? `${row.stability.repetitions}x, risk sd ${row.stability.riskStd}` : '1x';
    lines.push(`| ${row.label} | ${row.risk10} | ${row.durationGapSeconds}s | ${row.centroidGapHz} Hz | ${row.zeroCrossingGapPerSecond} | ${row.rmsGap} | ${stability} |`);
  }
  lines.push('', '## Next Step', '', report.nextStep, '');
  return `${lines.join('\n')}`;
}

async function captureCue(page, row, opts){
  await page.evaluate(() => {
    try{
      if(typeof sfx !== 'undefined' && typeof sfx.stopReferenceClips === 'function') sfx.stopReferenceClips();
      if(window.__platinumAudioDebug){
        window.__platinumAudioDebug.lastCue = null;
        window.__platinumAudioDebug.history = [];
      }
    }catch{}
  });
  if(row.baseline){
    return await page.evaluate(async payload => {
      return await window.__galagaHarness__.captureAudioCue(payload.cue, payload.opts);
    }, { cue: CUE, opts });
  }
  return await page.evaluate(async payload => {
    return await window.__galagaHarness__.captureAudioCueSpec(payload.spec, payload.opts);
  }, {
    spec: Object.assign({}, row.spec, { syntheticCandidateId: row.id }),
    opts: { ...opts, name: `__candidate_${row.id}` }
  });
}

async function main(){
  const generatedAt = new Date().toISOString();
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const dirty = git(['status', '--short'], '').trim().length > 0;
  const stamp = generatedAt.slice(0, 10);
  const outRoot = path.join(OUT_ROOT, `${stamp}-${commit}${dirty ? '-dirty' : ''}`, CUE);
  const samplesDir = path.join(outRoot, 'samples');
  ensureDir(samplesDir);

  const { set, entry } = comparisonSet();
  const captureOpts = { ...(entry.preview || {}), audioTheme: 'aurora-application' };
  delete captureOpts.cue;
  const repeats = repeatCount();
  const filter = candidateFilter();
  let candidates = candidateSpecs();
  if(filter.size){
    candidates = candidates.filter(row => row.baseline || filter.has(row.id));
  }
  const captureJobs = [];
  for(const row of candidates){
    for(let repetition = 1; repetition <= repeats; repetition += 1){
      const suffix = repeats > 1 ? `-r${String(repetition).padStart(2, '0')}` : '';
      captureJobs.push({
        row,
        repetition,
        sampleId: `${slug(row.id)}${suffix}`
      });
    }
  }

  const captures = await withHarnessPage({ stage: 8, ships: 3, challenge: false, seed: 24141, skipStart: true }, async ({ page }) => {
    await page.evaluate(() => installGamePack('aurora-galactica', { persist: false }));
    const results = [];
    for(const job of captureJobs){
      const result = await captureCue(page, job.row, captureOpts);
      results.push({ ...job, result });
    }
    return results;
  });

  const referenceSource = path.join(ROOT, 'src', set.referenceClip.replace(/^assets\//, 'assets/'));
  if(!fs.existsSync(referenceSource)) fail('Reference clip missing', { referenceSource, set });
  const referenceWav = path.join(samplesDir, 'challenge-perfect-reference.wav');
  toWav(referenceSource, referenceWav, set.referenceWindow || null);

  const baselineCapture = captures.find(item => item.row.baseline);
  if(!baselineCapture?.result?.ok) fail('Baseline Challenge Perfect capture failed', baselineCapture);
  const baselineWebm = path.join(samplesDir, `${baselineCapture.sampleId}.webm`);
  const baselineWav = path.join(samplesDir, `${baselineCapture.sampleId}.wav`);

  const manifestItems = [];
  for(const capture of captures){
    const row = capture.row;
    if(!capture.result?.ok) fail('Challenge Perfect candidate capture failed', { id: row.id, result: capture.result });
    const id = capture.sampleId;
    const webm = path.join(samplesDir, `${id}.webm`);
    const wav = path.join(samplesDir, `${id}.wav`);
    decodeToFile(capture.result.base64, webm);
    toWav(webm, wav);
    manifestItems.push({
      id,
      label: repeats > 1 ? `${row.label} r${capture.repetition}` : row.label,
      focus: 'Candidate comparison against the measured Challenge Perfect reference window.',
      cue: CUE,
      aurora: {
        label: row.label,
        wav: rel(row.baseline ? baselineWav : wav, outRoot),
        webm: rel(row.baseline ? baselineWebm : webm, outRoot),
        audioCue: capture.result.audioCue || null
      },
      galaga: {
        label: 'Current Aurora baseline',
        wav: rel(baselineWav, outRoot),
        webm: rel(baselineWebm, outRoot),
        audioCue: baselineCapture.result.audioCue || null
      },
      reference: {
        label: set.referenceLabel || 'Challenge Perfect Reference',
        source: rel(referenceSource),
        wav: rel(referenceWav, outRoot),
        window: set.referenceWindow || null
      }
    });
  }

  const manifestPath = path.join(outRoot, 'manifest.json');
  fs.writeFileSync(manifestPath, `${JSON.stringify({
    generatedAt,
    commit,
    version: require(path.join(ROOT, 'package.json')).version,
    items: manifestItems
  }, null, 2)}\n`);

  run(pythonForAudioReport(), [path.join(ROOT, 'tools', 'harness', 'render-audio-comparison-report.py'), manifestPath], { cwd: ROOT, stdio: 'inherit' });

  const metricsPath = path.join(outRoot, 'metrics.json');
  const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
  const sampleRows = metrics.items.map(item => {
    const comparison = item.comparisons.auroraVsReferenceActive;
    const id = baseCandidateId(item.id);
    const spec = candidates.find(candidate => slug(candidate.id) === id);
    return {
      id: item.id,
      label: item.label,
      baseLabel: spec?.label || item.label.replace(/ r\d+$/, ''),
      repetition: Number((String(item.id).match(/-r(\d+)$/) || [])[1] || 1),
      risk10: riskFromComparison(comparison),
      durationGapSeconds: round(comparison.duration_s, 3),
      centroidGapHz: round(comparison.spectral_centroid_hz, 1),
      zeroCrossingGapPerSecond: round(comparison.zero_crossings_per_s, 1),
      rmsGap: round(comparison.rms, 4),
      activeMetrics: item.variants.aurora.activeMetrics,
      comparison
    };
  }).sort((a, b) => a.risk10 - b.risk10 || a.durationGapSeconds - b.durationGapSeconds);
  const rows = aggregateRows(sampleRows);

  const decision = decisionFor(rows);
  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-audio-cue-candidate-loop',
    generatedAt,
    branch: git(['branch', '--show-current'], ''),
    commit,
    dirty,
    cue: CUE,
    repetitions: repeats,
    candidateFilter: filter.size ? [...filter].sort() : null,
    problem: 'Challenge Perfect is now the highest Aurora audio event-gap risk: duration is aligned, but timbre remains far from the measured reference window.',
    strategy: 'Generate a bounded set of synthetic cue specs, capture each through the live browser audio engine, compare against the same Galaga reference window, and recommend promotion only if measured risk drops without duration drift.',
    successMeasure: 'A keeper must reduce total risk by at least 0.25, reduce centroid gap, avoid materially increasing RMS gap, and keep active duration within 0.08s of the reference.',
    source: {
      comparisonSet: set.id,
      referenceClip: set.referenceClip,
      referenceWindow: set.referenceWindow || null,
      manifest: rel(manifestPath),
      metrics: rel(metricsPath)
    },
    sampleCandidates: sampleRows,
    candidates: rows,
    decision,
    nextStep: decision.keep
      ? 'Promote the recommended cue spec into the Aurora application audio theme, then run the full audio theme comparison and event-gap analysis.'
      : 'Expand the candidate generator around the best measured direction instead of manually changing the game pack.'
  };
  fs.writeFileSync(path.join(outRoot, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(outRoot, 'README.md'), markdown(report));
  fs.writeFileSync(path.join(OUT_ROOT, 'latest.json'), `${JSON.stringify(report, null, 2)}\n`);

  console.log(JSON.stringify({
    ok: true,
    report: rel(path.join(outRoot, 'report.json')),
    metrics: rel(metricsPath),
    decision: report.decision,
    topCandidates: rows.slice(0, 4).map(row => ({
      id: row.id,
      risk10: row.risk10,
      centroidGapHz: row.centroidGapHz,
      rmsGap: row.rmsGap,
      durationGapSeconds: row.durationGapSeconds
    }))
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
