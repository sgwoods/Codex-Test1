#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { withHarnessPage, ROOT } = require('./browser-check-util');

const GUIDE = require(path.join(ROOT, 'application-guide.json'));
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-audio-cue-candidates');
const CUE = 'playerHit';
const ENTRY_ID = 'player-hit';

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

function git(args, fallback = ''){
  const res = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  return res.status === 0 ? res.stdout.trim() : fallback;
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

function rel(target, base = ROOT){
  return path.relative(base, target).replace(/\\/g, '/');
}

function round(value, places = 3){
  const n = Number(value);
  if(!Number.isFinite(n)) return 0;
  const scale = Math.pow(10, places);
  return Math.round(n * scale) / scale;
}

function clamp(value, min, max){
  return Math.min(max, Math.max(min, value));
}

function mean(values){
  const numeric = values.filter(value => Number.isFinite(+value)).map(Number);
  return numeric.length ? numeric.reduce((sum, value) => sum + value, 0) / numeric.length : null;
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

function gridLimit(){
  const arg = process.argv.find(item => item.startsWith('--grid-limit='));
  const value = arg ? Number(arg.split('=')[1]) : Number(process.env.AURORA_PLAYER_HIT_GRID_LIMIT || 48);
  return Math.max(0, Number.isFinite(value) ? Math.floor(value) : 48);
}

function referenceGridLimit(){
  const arg = process.argv.find(item => item.startsWith('--reference-grid-limit='));
  const value = arg ? Number(arg.split('=')[1]) : Number(process.env.AURORA_PLAYER_HIT_REFERENCE_GRID_LIMIT || 0);
  return Math.max(0, Number.isFinite(value) ? Math.floor(value) : 0);
}

function candidateFilter(){
  const arg = process.argv.find(item => item.startsWith('--candidate-ids='));
  if(!arg) return new Set();
  return new Set(arg.split('=')[1].split(',').map(item => item.trim()).filter(Boolean));
}

function comparisonSet(){
  const set = (GUIDE.comparisonSets || []).find(item => item.entryId === ENTRY_ID || item.id === 'ship-loss-compare');
  if(!set) fail('Ship Loss comparison set is missing from application-guide.json');
  const entry = (GUIDE.audioContexts || []).find(ctx => ctx.id === set.entryId);
  if(!entry) fail('Ship Loss audio context is missing from application-guide.json', set);
  return { set, entry };
}

function handCandidates(){
  return [
    { id: 'baseline-current', label: 'Current Aurora baseline', baseline: true },
    {
      id: 'low-rumble-long-decay',
      label: 'Low rumble long decay',
      spec: {
        tones: [
          { freq: 196, duration: .82, wave: 'sawtooth', volume: .018, slide: -120, lpHz: 1500 },
          { freq: 98, duration: .9, wave: 'triangle', volume: .013, slide: -36, lpHz: 1150, delay: .04 },
          { freq: 146, duration: .16, wave: 'square', volume: .006, slide: -80, lpHz: 1400, delay: .46 }
        ],
        noise: [{ duration: .24, volume: .004, hp: 280, delay: .02 }]
      }
    },
    {
      id: 'two-pulse-low-bloom',
      label: 'Two pulse low bloom',
      spec: {
        tones: [
          { freq: 220, duration: .72, wave: 'triangle', volume: .017, slide: -135, lpHz: 1450 },
          { freq: 110, duration: .86, wave: 'sawtooth', volume: .012, slide: -42, lpHz: 1200, delay: .03 },
          { freq: 176, duration: .12, wave: 'triangle', volume: .008, slide: -90, lpHz: 1350, delay: .5 }
        ],
        noise: [{ duration: .18, volume: .003, hp: 240, delay: .015 }]
      }
    },
    {
      id: 'sub-heavy-collapse',
      label: 'Sub-heavy collapse',
      spec: {
        tones: [
          { freq: 176, duration: .96, wave: 'sawtooth', volume: .016, slide: -104, lpHz: 1280 },
          { freq: 88, duration: .9, wave: 'triangle', volume: .014, slide: -24, lpHz: 1020, delay: .055 },
          { freq: 132, duration: .08, wave: 'square', volume: .005, slide: -48, lpHz: 1250, delay: .52 }
        ]
      }
    },
    {
      id: 'reference-death-full',
      label: 'Reference death full cue',
      spec: {
        referenceClip: 'assets/reference-audio/galaga3-death.m4a',
        cooldownMs: 1800,
        referenceVolume: 1
      }
    },
    {
      id: 'reference-death-active-window',
      label: 'Reference death active window',
      spec: {
        referenceClip: 'assets/reference-audio/galaga3-death.m4a',
        cooldownMs: 1800,
        referenceVolume: 1,
        clipStart: .02,
        clipDuration: .968
      }
    }
  ];
}

function generatedCandidates(){
  const limit = gridLimit();
  if(!limit) return [];
  const baseFreqs = [156, 176, 196, 220];
  const tailFreqs = [82, 98, 110, 124];
  const durations = [.72, .84, .96, 1.08];
  const lowPasses = [1100, 1350, 1600, 1900];
  const volumes = [.012, .016, .02];
  const noiseVolumes = [0, .0025, .005];
  const bodyDelays = [.42, .5, .58];
  const specs = [];
  for(const baseFreq of baseFreqs){
    for(const tailFreq of tailFreqs){
      for(const duration of durations){
        for(const lpHz of lowPasses){
          for(const volume of volumes){
            for(const noiseVolume of noiseVolumes){
              for(const bodyDelay of bodyDelays){
                const expectedEnd = Math.max(duration, bodyDelay + .1, noiseVolume ? .32 : 0);
                const durationGap = Math.abs(expectedEnd - .968);
                const bandProxy = (baseFreq * .8) + (tailFreq * 1.2) + (lpHz * .38) + (noiseVolume ? 70 : 0);
                const bandGap = Math.abs(bandProxy - 720) / 720;
                const energy = (volume * duration) + (volume * .72 * (duration - .04)) + (volume * .36 * .1) + (noiseVolume * .24);
                const energyGap = Math.abs(energy - .031);
                const heuristic = (durationGap * 6) + (bandGap * 1.8) + (energyGap * 30) + (noiseVolume ? -.04 : .06);
                const id = [
                  'deathgrid',
                  `b${baseFreq}`,
                  `t${tailFreq}`,
                  `d${Math.round(duration * 1000)}`,
                  `lp${lpHz}`,
                  `v${Math.round(volume * 10000)}`,
                  `n${Math.round(noiseVolume * 10000)}`,
                  `bd${Math.round(bodyDelay * 1000)}`
                ].join('-');
                specs.push({
                  id,
                  label: `Death grid ${baseFreq}/${tailFreq} ${duration}s lp${lpHz}`,
                  generated: true,
                  generator: {
                    family: 'low-band-long-decay-grid',
                    heuristic: round(heuristic, 5),
                    expectedEnd: round(expectedEnd, 3),
                    target: 'Move ship-loss from a short bright hit toward a longer low-band Galaga death event with visible onset/body structure.',
                    params: { baseFreq, tailFreq, duration, lpHz, volume, noiseVolume, bodyDelay }
                  },
                  spec: {
                    tones: [
                      { freq: baseFreq, duration, wave: 'sawtooth', volume, slide: -(baseFreq - tailFreq), lpHz },
                      { freq: tailFreq, duration: Math.max(.24, duration - .04), wave: 'triangle', volume: volume * .72, slide: -Math.max(18, tailFreq * .25), lpHz: Math.max(820, lpHz * .78), delay: .04 },
                      { freq: Math.round((baseFreq + tailFreq) / 2), duration: .1, wave: 'triangle', volume: volume * .36, slide: -70, lpHz: Math.max(900, lpHz * .85), delay: bodyDelay }
                    ],
                    noise: noiseVolume ? [{ duration: .24, volume: noiseVolume, hp: 240, delay: .018 }] : undefined
                  }
                });
              }
            }
          }
        }
      }
    }
  }
  return specs
    .sort((a, b) => a.generator.heuristic - b.generator.heuristic || a.id.localeCompare(b.id))
    .slice(0, limit);
}

function referenceSubclipCandidates(){
  const limit = referenceGridLimit();
  if(!limit) return [];
  const starts = [0, .02, .05, .08, .1, .12, .16];
  const durations = [.72, .84, .92, .968, 1.04, 1.16, 1.28];
  const volumes = [.82, .92, 1];
  const specs = [];
  for(const clipStart of starts){
    for(const clipDuration of durations){
      for(const referenceVolume of volumes){
        const durationGap = Math.abs(clipDuration - .968);
        const onsetGap = Math.abs(clipStart - .02);
        const bodyEnd = clipStart + clipDuration;
        const bodyCoverage = bodyEnd >= .54 ? 0 : .54 - bodyEnd;
        const volumeGap = Math.abs(referenceVolume - .9);
        const heuristic = (durationGap * 5) + (onsetGap * 2.5) + (bodyCoverage * 8) + (volumeGap * .45);
        const id = [
          'refclip',
          `s${Math.round(clipStart * 1000)}`,
          `d${Math.round(clipDuration * 1000)}`,
          `v${Math.round(referenceVolume * 100)}`
        ].join('-');
        specs.push({
          id,
          label: `Reference death subclip ${clipStart}s/${clipDuration}s v${referenceVolume}`,
          generated: true,
          generator: {
            family: 'reference-death-subclip-grid',
            heuristic: round(heuristic, 5),
            target: 'Search reference death clip windows for better Ship Loss onset/body timing while preserving canonical Galaga timbre.',
            params: { clipStart, clipDuration, referenceVolume }
          },
          spec: {
            referenceClip: 'assets/reference-audio/galaga3-death.m4a',
            cooldownMs: 1800,
            referenceVolume,
            clipStart,
            clipDuration
          }
        });
      }
    }
  }
  return specs
    .sort((a, b) => a.generator.heuristic - b.generator.heuristic || a.id.localeCompare(b.id))
    .slice(0, limit);
}

function candidateSpecs(){
  return [...handCandidates(), ...referenceSubclipCandidates(), ...generatedCandidates()];
}

function riskBreakdown(comparison){
  const durationGap = +comparison.duration_s || 0;
  const centroidGap = +comparison.spectral_centroid_hz || 0;
  const zcrGap = +comparison.zero_crossings_per_s || 0;
  const rmsGap = +comparison.rms || 0;
  const bandGap = +comparison.band_shape_distance || 0;
  const rolloffGap = +comparison.spectral_rolloff_85_hz || 0;
  const attackGap = +comparison.attack_peak_position || 0;
  const decayGap = +comparison.decay_ratio || 0;
  const burstGap = +comparison.burst_share || 0;
  const components = {
    duration: clamp(durationGap / .85, 0, 1),
    centroid: clamp(centroidGap / 1300, 0, 1),
    zeroCrossing: clamp(zcrGap / 1800, 0, 1),
    rms: clamp(rmsGap / .14, 0, 1),
    bandShape: clamp(bandGap / .5, 0, 1),
    rolloff: clamp(rolloffGap / 2600, 0, 1),
    attack: clamp(attackGap / .9, 0, 1),
    decay: clamp(decayGap / 3.2, 0, 1),
    burst: clamp(burstGap / .35, 0, 1)
  };
  const weights = {
    duration: .18,
    centroid: .15,
    zeroCrossing: .08,
    rms: .08,
    bandShape: .17,
    rolloff: .14,
    attack: .11,
    decay: .06,
    burst: .03
  };
  const weighted = Object.entries(weights).reduce((sum, [key, weight]) => sum + components[key] * weight, 0);
  const dominant = Object.entries(components).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';
  return { risk10: round(weighted * 10, 2), components, dominant };
}

function segmentSummary(comparisons = []){
  if(!comparisons.length){
    return {
      segmentRoleComparisonCount: 0,
      averageSegmentRisk10: null,
      worstSegmentRisk10: null,
      worstSegmentRole: '',
      exactSegmentRoleMatchCount: 0
    };
  }
  const risks = comparisons.map(item => +item.auroraSegmentRisk10 || 0);
  const worst = comparisons.reduce((best, item) => (+item.auroraSegmentRisk10 || 0) > (+best.auroraSegmentRisk10 || 0) ? item : best, comparisons[0]);
  return {
    segmentRoleComparisonCount: comparisons.length,
    averageSegmentRisk10: round(mean(risks), 2),
    worstSegmentRisk10: round(Math.max(...risks), 2),
    worstSegmentRole: worst.role || '',
    exactSegmentRoleMatchCount: comparisons.filter(item => item.auroraExactRoleMatch).length,
    worstSegmentInterpretation: worst.interpretation || ''
  };
}

function bandEnergyDelta(active, reference){
  const keys = ['sub_500', 'low_mid_500_1500', 'mid_1500_3000', 'presence_3000_6000', 'air_6000_plus'];
  const delta = {};
  for(const key of keys) delta[key] = round((active?.[key] || 0) - (reference?.[key] || 0), 4);
  return delta;
}

function rejectionFor(row, baseline){
  if(!baseline) return 'no baseline';
  const reasons = [];
  if(row.risk10 > baseline.risk10 - .35) reasons.push(`whole-cue risk improved only ${round(baseline.risk10 - row.risk10, 2)} (<0.35)`);
  if(row.worstSegmentRisk10 > baseline.worstSegmentRisk10 - .35) reasons.push(`segment risk improved only ${round(baseline.worstSegmentRisk10 - row.worstSegmentRisk10, 2)} (<0.35)`);
  if(row.durationGapSeconds > baseline.durationGapSeconds - .18) reasons.push(`duration gap improved only ${round(baseline.durationGapSeconds - row.durationGapSeconds, 3)}s (<0.18s)`);
  if(row.bandShapeGap > baseline.bandShapeGap + .04) reasons.push(`band shape worsened by ${round(row.bandShapeGap - baseline.bandShapeGap, 4)}`);
  if(row.centroidGapHz > baseline.centroidGapHz + 80) reasons.push(`centroid worsened by ${round(row.centroidGapHz - baseline.centroidGapHz, 1)} Hz`);
  if(row.exactSegmentRoleMatchCount < baseline.exactSegmentRoleMatchCount) reasons.push('fewer exact segment-role matches than baseline');
  return reasons.length ? reasons.join('; ') : 'clears keeper gates';
}

function decisionFor(rows){
  const baseline = rows.find(row => row.id === 'baseline-current');
  const candidates = rows.filter(row => row.id !== 'baseline-current');
  const keepers = candidates.filter(row => rejectionFor(row, baseline) === 'clears keeper gates');
  const measuredBest = candidates.slice().sort((a, b) => a.risk10 - b.risk10 || a.worstSegmentRisk10 - b.worstSegmentRisk10)[0] || null;
  const best = keepers.slice().sort((a, b) => a.risk10 - b.risk10 || a.worstSegmentRisk10 - b.worstSegmentRisk10)[0] || null;
  if(!best){
    return {
      status: 'no-keeper',
      keep: false,
      baseline: baseline?.id || null,
      best: null,
      measuredBest: measuredBest?.id || null,
      reason: 'No candidate cleared the whole-cue, segment-risk, duration, band-shape, centroid, and role-match gates.'
    };
  }
  return {
    status: 'candidate-recommended',
    keep: true,
    baseline: baseline.id,
    best: best.id,
    measuredBest: measuredBest?.id || best.id,
    riskDelta: round(baseline.risk10 - best.risk10, 2),
    segmentRiskDelta: round(baseline.worstSegmentRisk10 - best.worstSegmentRisk10, 2),
    durationDeltaSeconds: round(baseline.durationGapSeconds - best.durationGapSeconds, 3),
    bandDelta: round(baseline.bandShapeGap - best.bandShapeGap, 4),
    reason: 'Selected candidate clears measured ship-loss keeper gates.'
  };
}

async function captureRow(row, opts, attemptSeed){
  return await withHarnessPage({ stage: 8, ships: 3, challenge: false, seed: attemptSeed, skipStart: true }, async ({ page }) => {
    await page.evaluate(() => installGamePack('aurora-galactica', { persist: false }));
    if(row.baseline){
      return await page.evaluate(async payload => {
        return await window.__galagaHarness__.captureAudioCue(payload.cue, payload.opts);
      }, { cue: CUE, opts });
    }
    return await page.evaluate(async payload => {
      return await window.__galagaHarness__.captureAudioCueSpec(payload.spec, payload.opts);
    }, { spec: Object.assign({}, row.spec, { syntheticCandidateId: row.id }), opts: { ...opts, name: `__candidate_${row.id}` } });
  });
}

async function captureWithRetry(row, opts, index){
  const attempts = Math.max(1, Number(process.env.AURORA_AUDIO_CAPTURE_RETRIES || 3));
  let last = null;
  for(let attempt = 1; attempt <= attempts; attempt += 1){
    last = await captureRow(row, opts, 27181 + (index * 10) + attempt);
    const bytes = last?.base64 ? Buffer.from(last.base64, 'base64').length : 0;
    const capturedCue = String(last?.audioCue?.cue || '').trim();
    if(last?.ok && bytes >= 512 && (row.baseline ? capturedCue === CUE : capturedCue === `__candidate_${row.id}`)){
      return Object.assign({}, last, { byteLength: bytes, attempt });
    }
    last = Object.assign({}, last || {}, {
      byteLength: bytes,
      attempt,
      captureMismatch: { expectedCue: row.baseline ? CUE : `__candidate_${row.id}`, capturedCue: capturedCue || '(none)' }
    });
  }
  return last || { ok: false, error: 'capture did not run' };
}

function markdown(report){
  const lines = [
    '# Aurora Player Hit Audio Candidate Analysis',
    '',
    `Generated: ${report.generatedAt}`,
    `Commit: ${report.commit}${report.dirty ? ' (dirty)' : ''}`,
    '',
    '## Problem',
    '',
    report.problem,
    '',
    '## Strategy',
    '',
    report.strategy,
    '',
    '## Decision',
    '',
    `- Status: \`${report.decision.status}\``,
    `- Best: \`${report.decision.best || 'none'}\``,
    `- Measured best: \`${report.decision.measuredBest || 'none'}\``,
    `- Reason: ${report.decision.reason}`,
    '',
    '| Candidate | Risk | Worst Segment | Duration Gap | Centroid Gap | Band Gap | Keeper Read |',
    '| --- | ---: | ---: | ---: | ---: | ---: | --- |'
  ];
  for(const row of report.candidates.slice(0, 18)){
    lines.push(`| ${row.label} | ${row.risk10} | ${row.worstSegmentRole || 'n/a'} ${row.worstSegmentRisk10 ?? 'n/a'} | ${row.durationGapSeconds}s | ${row.centroidGapHz}Hz | ${row.bandShapeGap} | ${row.keeperRead} |`);
  }
  lines.push('', '## Next Step', '', report.nextStep, '');
  return `${lines.join('\n')}\n`;
}

async function main(){
  const generatedAt = new Date().toISOString();
  const stamp = generatedAt.slice(0, 10);
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const dirty = git(['status', '--short'], '').trim().length > 0;
  const { set, entry } = comparisonSet();
  const captureOpts = { ...(entry.preview || {}), audioTheme: 'aurora-application' };
  delete captureOpts.cue;
  const filter = candidateFilter();
  let candidates = candidateSpecs();
  if(filter.size) candidates = candidates.filter(row => row.baseline || filter.has(row.id));

  const outRoot = path.join(OUT_ROOT, `${stamp}-${commit}${dirty ? '-dirty' : ''}-playerhit-grid${gridLimit()}-${generatedAt.slice(11, 19).replace(/:/g, '')}`, CUE);
  const samplesDir = path.join(outRoot, 'samples');
  ensureDir(samplesDir);

  const referenceSource = path.join(ROOT, 'src', set.referenceClip.replace(/^assets\//, 'assets/'));
  if(!fs.existsSync(referenceSource)) fail('Ship Loss reference clip missing', { referenceSource, set });
  const referenceWav = path.join(samplesDir, 'ship-loss-reference.wav');
  toWav(referenceSource, referenceWav, set.referenceWindow || null);

  const captures = [];
  for(let index = 0; index < candidates.length; index += 1){
    const row = candidates[index];
    const result = await captureWithRetry(row, captureOpts, index);
    if(!result?.ok) fail('Player Hit candidate capture failed', { id: row.id, result });
    captures.push({ row, result, sampleId: slug(row.id) });
  }

  const baselineCapture = captures.find(item => item.row.baseline);
  if(!baselineCapture) fail('Player Hit baseline capture missing');

  const sampleFiles = new Map();
  for(const capture of captures){
    const webm = path.join(samplesDir, `${capture.sampleId}.webm`);
    const wav = path.join(samplesDir, `${capture.sampleId}.wav`);
    decodeToFile(capture.result.base64, webm);
    toWav(webm, wav);
    sampleFiles.set(capture.row.id, { webm, wav });
  }

  const baselineFiles = sampleFiles.get(baselineCapture.row.id);
  const manifestItems = captures.map(capture => {
    const files = sampleFiles.get(capture.row.id);
    return {
      id: capture.sampleId,
      label: capture.row.label,
      focus: 'Candidate comparison against the measured Galaga ship-loss reference.',
      cue: CUE,
      aurora: {
        label: capture.row.label,
        wav: rel(capture.row.baseline ? baselineFiles.wav : files.wav, outRoot),
        webm: rel(capture.row.baseline ? baselineFiles.webm : files.webm, outRoot),
        audioCue: capture.result.audioCue || null
      },
      galaga: {
        label: 'Current Aurora baseline',
        wav: rel(baselineFiles.wav, outRoot),
        webm: rel(baselineFiles.webm, outRoot),
        audioCue: baselineCapture.result.audioCue || null
      },
      reference: {
        label: set.referenceLabel || 'Ship Loss Reference',
        source: rel(referenceSource),
        wav: rel(referenceWav, outRoot),
        window: set.referenceWindow || null
      }
    };
  });

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
  const rows = metrics.items.map(item => {
    const id = item.id;
    const spec = candidates.find(candidate => slug(candidate.id) === id);
    const comparison = item.comparisons.auroraVsReferenceActive;
    const breakdown = riskBreakdown(comparison);
    const segments = segmentSummary(item.segmentRoleComparisons);
    return {
      id: spec?.id || id,
      label: spec?.label || item.label,
      generated: !!spec?.generated,
      generator: spec?.generator || null,
      risk10: breakdown.risk10,
      riskBreakdown: breakdown.components,
      dominantPenalty: breakdown.dominant,
      durationGapSeconds: round(comparison.duration_s, 3),
      centroidGapHz: round(comparison.spectral_centroid_hz, 1),
      zeroCrossingGapPerSecond: round(comparison.zero_crossings_per_s, 1),
      rmsGap: round(comparison.rms, 4),
      bandShapeGap: round(comparison.band_shape_distance, 4),
      rolloffGapHz: round(comparison.spectral_rolloff_85_hz, 1),
      envelopeShapeGap: round(mean([
        clamp((+comparison.attack_peak_position || 0) / .9, 0, 1),
        clamp((+comparison.decay_ratio || 0) / 3.2, 0, 1),
        clamp((+comparison.burst_share || 0) / .35, 0, 1)
      ]), 3),
      ...segments,
      activeMetrics: item.variants.aurora.activeMetrics,
      referenceMetrics: item.variants.reference.activeMetrics,
      bandEnergyDelta: bandEnergyDelta(item.variants.aurora.activeMetrics?.band_energy, item.variants.reference.activeMetrics?.band_energy),
      comparison
    };
  });
  const baseline = rows.find(row => row.id === 'baseline-current');
  rows.forEach(row => { row.keeperRead = row.id === 'baseline-current' ? 'baseline' : rejectionFor(row, baseline); });
  rows.sort((a, b) => a.risk10 - b.risk10 || (a.worstSegmentRisk10 || 99) - (b.worstSegmentRisk10 || 99));
  const decision = decisionFor(rows);

  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-player-hit-audio-cue-candidate-loop',
    generatedAt,
    branch: git(['branch', '--show-current'], ''),
    commit,
    dirty,
    cue: CUE,
    problem: 'Ship Loss/playerHit is the highest current audio event-gap risk: Aurora reads as a short bright hit, while the Galaga reference is a longer low-band death event with a sustained onset and trailing body.',
    strategy: 'Capture bounded low-band, long-decay candidate specs through the live browser audio engine, compare against galaga3-death.m4a with active-window segmentation, and recommend promotion only if the candidate improves whole-cue risk, segment risk, duration, band shape, centroid, and role matching.',
    successMeasure: 'A keeper must reduce whole-cue risk by at least 0.35, worst segment risk by at least 0.35, improve duration by at least 0.18s, avoid material band/centroid regressions, and keep exact segment-role coverage at least as good as baseline.',
    source: {
      comparisonSet: set.id,
      referenceClip: set.referenceClip,
      referenceWindow: set.referenceWindow || null,
      manifest: rel(manifestPath),
      metrics: rel(metricsPath),
      referenceSegmentation: metrics.items[0]?.referenceSegmentation || null
    },
    candidates: rows,
    decision,
    nextStep: decision.keep
      ? 'Promote the recommended playerHit cue into the measured Aurora audio theme, then rerun the full audio comparison and event-gap rollup.'
      : 'Use the best measured candidates to expand the low-band envelope generator, or consider a reference-subclip strategy for ship loss if synthesized cues keep failing duration and band-shape gates.'
  };

  fs.writeFileSync(path.join(outRoot, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(outRoot, 'README.md'), markdown(report));
  fs.writeFileSync(path.join(OUT_ROOT, 'latest-player-hit.json'), `${JSON.stringify(report, null, 2)}\n`);

  console.log(JSON.stringify({
    ok: true,
    report: rel(path.join(outRoot, 'report.json')),
    metrics: rel(metricsPath),
    decision,
    topCandidates: rows.filter(row => row.id !== 'baseline-current').slice(0, 5).map(row => ({
      id: row.id,
      risk10: row.risk10,
      worstSegmentRisk10: row.worstSegmentRisk10,
      worstSegmentRole: row.worstSegmentRole,
      durationGapSeconds: row.durationGapSeconds,
      centroidGapHz: row.centroidGapHz,
      bandShapeGap: row.bandShapeGap,
      keeperRead: row.keeperRead
    }))
  }, null, 2));
}

main().catch(err => {
  console.error(err && err.stack || err);
  process.exit(1);
});
