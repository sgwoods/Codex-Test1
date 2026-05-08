#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');
const { withHarnessPage, ROOT } = require('./browser-check-util');

const GUIDE = require(path.join(ROOT, 'application-guide.json'));
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-audio-cue-candidates');

const CUE_CONFIGS = {
  'enemy-hit': {
    cue: 'enemyHit',
    entryId: 'enemy-hit-aurora',
    comparisonId: 'enemy-hit-compare',
    latest: 'latest-enemy-hit.json',
    title: 'Enemy Hit',
    problem: 'Enemy Hit is the highest whole-cue audio risk: Aurora gives hit confirmation, but the measured cue is too long, too bright, and spectrally far from the Zako impact reference window.',
    target: 'Make a normal enemy impact read as immediate Galaga-like hit confirmation without collapsing into the heavier enemy destruction cue.',
    referenceStarts: [0.5, 0.58, 0.66, 0.72, 0.75, 0.79, 0.84],
    referenceDurations: [0.14, 0.18, 0.2, 0.24, 0.28, 0.32],
    referenceVolumes: [0.58, 0.7, 0.82, 0.94, 1],
    handSpecs: [
      {
        id: 'short-low-mid-snap',
        label: 'Short low-mid snap',
        spec: {
          tones: [
            { freq: 170, duration: .08, wave: 'sawtooth', volume: .019, slide: -110, lpHz: 1600 },
            { freq: 620, duration: .045, wave: 'triangle', volume: .009, slide: -180, lpHz: 2200, delay: .012 }
          ],
          noise: [{ duration: .032, volume: .0022, hp: 760, delay: .008 }]
        }
      },
      {
        id: 'zako-window-current',
        label: 'Zako current guide window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-zako.m4a',
          cooldownMs: 220,
          referenceVolume: .82,
          clipStart: .75,
          clipDuration: .24
        }
      }
    ],
    keeper: { risk: .3, segment: .3, duration: .08, acceptableDuration: .08, centroidWorsenHz: 100, bandWorsen: .05 }
  },
  'formation-pulse': {
    cue: 'stagePulse',
    entryId: 'formation-pulse-classic',
    comparisonId: 'formation-pulse-compare',
    latest: 'latest-formation-pulse.json',
    title: 'Formation Pulse',
    problem: 'Formation Pulse has the highest segment-level onset risk: the current classic pulse is a bright synthetic stab while the Galaga cadence reference has more low-frequency body and softer attack.',
    target: 'Make the basic formation cadence feel closer to an arcade marching/pressure bed while preserving short repeatable pulse behavior.',
    referenceStarts: [0.48, 0.54, 0.6, 0.66, 0.72, 4.58, 4.64],
    referenceDurations: [0.16, 0.2, 0.24, 0.3, 0.36, 0.44],
    referenceVolumes: [0.62, 0.74, 0.86, .95, 1.05],
    handSpecs: [
      {
        id: 'low-soft-march',
        label: 'Low soft march',
        spec: {
          tones: [
            { freq: 196, duration: .13, wave: 'triangle', volume: .010, slide: -12, lpHz: 1500 },
            { freq: 392, duration: .09, wave: 'triangle', volume: .006, slide: -22, lpHz: 2300, delay: .028 }
          ]
        }
      },
      {
        id: 'convoy-current-window',
        label: 'Convoy current guide window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-ambience-convoy.m4a',
          cooldownMs: 1250,
          referenceVolume: .86,
          clipStart: .6,
          clipDuration: .24
        }
      }
    ],
    keeper: { risk: .25, segment: .35, duration: .08, acceptableDuration: .16, centroidWorsenHz: 120, bandWorsen: .06 }
  },
  'ship-loss': {
    cue: 'playerHit',
    entryId: 'player-hit',
    comparisonId: 'ship-loss-compare',
    latest: 'latest-player-hit-focus.json',
    title: 'Ship Loss Body',
    problem: 'Ship Loss onset is now much better, but its body segment remains too bright and too extended versus the measured Galaga death body window.',
    target: 'Search for a better death clip envelope/body while preserving the strong onset improvement from the previous pass.',
    referenceStarts: [0, .02, .05, .08, .1, .12, .16],
    referenceDurations: [.72, .84, .92, .968, 1.04, 1.16, 1.28],
    referenceVolumes: [.74, .82, .9, 1],
    handSpecs: [
      {
        id: 'promoted-active-window',
        label: 'Promoted active window',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-death.m4a',
          cooldownMs: 1800,
          referenceVolume: 1,
          clipStart: .02,
          clipDuration: .968
        }
      },
      {
        id: 'lower-gain-body-candidate',
        label: 'Lower gain body candidate',
        spec: {
          referenceClip: 'assets/reference-audio/galaga3-death.m4a',
          cooldownMs: 1800,
          referenceVolume: .82,
          clipStart: .02,
          clipDuration: 1.04
        }
      }
    ],
    keeper: { risk: .25, segment: .35, duration: .12, acceptableDuration: .1, centroidWorsenHz: 90, bandWorsen: .045 }
  }
};

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function rel(file, base = ROOT){
  return path.relative(base, file).split(path.sep).join('/');
}

function slug(text){
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function round(value, places = 3){
  const n = Number(value);
  if(!Number.isFinite(n)) return null;
  const scale = 10 ** places;
  return Math.round(n * scale) / scale;
}

function clamp(value, min, max){
  return Math.min(max, Math.max(min, value));
}

function mean(values){
  const numeric = values.map(Number).filter(Number.isFinite);
  return numeric.length ? numeric.reduce((sum, value) => sum + value, 0) / numeric.length : null;
}

function run(cmd, args, options = {}){
  const res = spawnSync(cmd, args, { encoding: 'utf8', ...options });
  if(res.status !== 0) fail(`${cmd} failed`, { args, status: res.status, stdout: res.stdout, stderr: res.stderr });
  return res;
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function argValue(name){
  const prefix = `--${name}=`;
  const inline = process.argv.find(arg => arg.startsWith(prefix));
  if(inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : '';
}

function requestedKeys(){
  const raw = argValue('cues') || argValue('cue') || 'enemy-hit,formation-pulse,ship-loss';
  return raw.split(',').map(item => item.trim()).filter(Boolean);
}

function gridLimit(){
  const raw = Number(argValue('reference-grid-limit') || process.env.AURORA_AUDIO_FOCUS_REFERENCE_GRID_LIMIT || 48);
  return Number.isFinite(raw) ? Math.max(0, Math.min(180, Math.floor(raw))) : 48;
}

function candidateFilter(){
  return new Set(String(argValue('candidate-ids') || '').split(',').map(item => item.trim()).filter(Boolean));
}

function pythonForAudioReport(){
  const bundled = path.join(process.env.HOME || '', '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'python', 'bin', 'python3');
  return fs.existsSync(bundled) ? bundled : 'python3';
}

function decodedBytes(result){
  if(!result?.base64) return 0;
  try{
    return Buffer.from(result.base64, 'base64').length;
  }catch{
    return 0;
  }
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

function comparisonContext(config){
  const set = (GUIDE.comparisonSets || []).find(item => item.id === config.comparisonId || item.entryId === config.entryId);
  if(!set) fail(`Comparison set missing for ${config.title}`, config);
  const entry = (GUIDE.audioContexts || []).find(item => item.id === set.entryId);
  if(!entry) fail(`Audio context missing for ${config.title}`, set);
  return { set, entry };
}

function referenceGridSpecs(config, set){
  const limit = gridLimit();
  if(!limit) return [];
  const refClip = set.referenceClip;
  const guideWindow = set.referenceWindow || {};
  const targetStart = Number(guideWindow.startSeconds || 0);
  const targetDuration = Number((guideWindow.endSeconds || 0) - (guideWindow.startSeconds || 0)) || .24;
  const specs = [];
  for(const clipStart of config.referenceStarts){
    for(const clipDuration of config.referenceDurations){
      for(const referenceVolume of config.referenceVolumes){
        const startGap = Math.abs(clipStart - targetStart);
        const durationGap = Math.abs(clipDuration - targetDuration);
        const volumeGap = Math.abs(referenceVolume - .86);
        const heuristic = (startGap * 3) + (durationGap * 4) + (volumeGap * .35);
        const id = [
          'refclip',
          `s${Math.round(clipStart * 1000)}`,
          `d${Math.round(clipDuration * 1000)}`,
          `v${Math.round(referenceVolume * 100)}`
        ].join('-');
        specs.push({
          id,
          label: `${config.title} reference ${clipStart}s/${clipDuration}s v${referenceVolume}`,
          generated: true,
          generator: {
            family: `${slug(config.title)}-reference-subclip-grid`,
            heuristic: round(heuristic, 5),
            target: config.target,
            params: { clipStart, clipDuration, referenceVolume }
          },
          spec: {
            referenceClip: refClip,
            cooldownMs: config.cue === 'stagePulse' ? 1250 : (config.cue === 'playerHit' ? 1800 : 220),
            referenceVolume,
            clipStart,
            clipDuration
          }
        });
      }
    }
  }
  return specs.sort((a, b) => a.generator.heuristic - b.generator.heuristic || a.id.localeCompare(b.id)).slice(0, limit);
}

function candidateSpecs(config, set){
  const candidates = [
    { id: 'baseline-current', label: 'Current Aurora baseline', baseline: true },
    ...(config.handSpecs || []),
    ...referenceGridSpecs(config, set)
  ];
  const filter = candidateFilter();
  return filter.size ? candidates.filter(row => row.baseline || filter.has(row.id)) : candidates;
}

function riskBreakdown(comparison){
  const components = {
    duration: clamp((+comparison.duration_s || 0) / .85, 0, 1),
    centroid: clamp((+comparison.spectral_centroid_hz || 0) / 1300, 0, 1),
    zeroCrossing: clamp((+comparison.zero_crossings_per_s || 0) / 1800, 0, 1),
    rms: clamp((+comparison.rms || 0) / .16, 0, 1),
    bandShape: clamp((+comparison.band_shape_distance || 0) / .5, 0, 1),
    rolloff: clamp((+comparison.spectral_rolloff_85_hz || 0) / 2600, 0, 1),
    attack: clamp((+comparison.attack_peak_position || 0) / .9, 0, 1),
    decay: clamp((+comparison.decay_ratio || 0) / 3.2, 0, 1),
    burst: clamp((+comparison.burst_share || 0) / .35, 0, 1)
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
      exactSegmentRoleMatchCount: 0,
      worstSegmentInterpretation: ''
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

function rejectionFor(row, baseline, config){
  if(!baseline) return 'no baseline';
  const gate = config.keeper || {};
  const reasons = [];
  if(row.risk10 > baseline.risk10 - (gate.risk ?? .3)) reasons.push(`whole-cue risk improved only ${round(baseline.risk10 - row.risk10, 2)}`);
  if(Number.isFinite(+baseline.worstSegmentRisk10) && Number.isFinite(+row.worstSegmentRisk10) && row.worstSegmentRisk10 > baseline.worstSegmentRisk10 - (gate.segment ?? .3)){
    reasons.push(`segment risk improved only ${round(baseline.worstSegmentRisk10 - row.worstSegmentRisk10, 2)}`);
  }
  const durationImprovedEnough = row.durationGapSeconds <= baseline.durationGapSeconds - (gate.duration ?? .08);
  const durationCloseEnough = row.durationGapSeconds <= (gate.acceptableDuration ?? 0);
  if(!durationImprovedEnough && !durationCloseEnough) reasons.push(`duration gap improved only ${round(baseline.durationGapSeconds - row.durationGapSeconds, 3)}s`);
  if(row.bandShapeGap > baseline.bandShapeGap + (gate.bandWorsen ?? .05)) reasons.push(`band shape worsened by ${round(row.bandShapeGap - baseline.bandShapeGap, 4)}`);
  if(row.centroidGapHz > baseline.centroidGapHz + (gate.centroidWorsenHz ?? 100)) reasons.push(`centroid worsened by ${round(row.centroidGapHz - baseline.centroidGapHz, 1)} Hz`);
  if(row.exactSegmentRoleMatchCount < baseline.exactSegmentRoleMatchCount) reasons.push('fewer exact segment-role matches than baseline');
  return reasons.length ? reasons.join('; ') : 'clears keeper gates';
}

function decisionFor(rows, config){
  const baseline = rows.find(row => row.id === 'baseline-current');
  const candidates = rows.filter(row => row.id !== 'baseline-current');
  const keepers = candidates.filter(row => rejectionFor(row, baseline, config) === 'clears keeper gates');
  const measuredBest = candidates.slice().sort((a, b) => a.risk10 - b.risk10 || (a.worstSegmentRisk10 || 99) - (b.worstSegmentRisk10 || 99))[0] || null;
  const best = keepers.slice().sort((a, b) => a.risk10 - b.risk10 || (a.worstSegmentRisk10 || 99) - (b.worstSegmentRisk10 || 99))[0] || null;
  if(!best){
    return {
      status: 'no-keeper',
      keep: false,
      baseline: baseline?.id || null,
      best: null,
      measuredBest: measuredBest?.id || null,
      reason: `No ${config.title} candidate cleared whole-cue, segment, duration, band, centroid, and role-match gates.`
    };
  }
  return {
    status: 'candidate-recommended',
    keep: true,
    baseline: baseline.id,
    best: best.id,
    measuredBest: measuredBest?.id || best.id,
    riskDelta: round(baseline.risk10 - best.risk10, 2),
    segmentRiskDelta: round((baseline.worstSegmentRisk10 || 0) - (best.worstSegmentRisk10 || 0), 2),
    durationDeltaSeconds: round(baseline.durationGapSeconds - best.durationGapSeconds, 3),
    bandDelta: round(baseline.bandShapeGap - best.bandShapeGap, 4),
    reason: `${config.title} candidate clears measured keeper gates.`
  };
}

async function captureCandidate(config, row, opts, index){
  const expectedCue = row.baseline ? config.cue : `__candidate_${row.id}`;
  const attempts = Math.max(1, Number(process.env.AURORA_AUDIO_CAPTURE_RETRIES || 3));
  let last = null;
  for(let attempt = 1; attempt <= attempts; attempt += 1){
    const result = await withHarnessPage({ stage: 8, ships: 3, challenge: false, seed: 41211 + (index * 10) + attempt, skipStart: true }, async ({ page }) => {
      await page.evaluate(() => installGamePack('aurora-galactica', { persist: false }));
      if(row.baseline){
        return await page.evaluate(async payload => {
          return await window.__galagaHarness__.captureAudioCue(payload.cue, payload.opts);
        }, { cue: config.cue, opts });
      }
      return await page.evaluate(async payload => {
        return await window.__galagaHarness__.captureAudioCueSpec(payload.spec, payload.opts);
      }, { spec: Object.assign({}, row.spec, { syntheticCandidateId: row.id }), opts: { ...opts, name: expectedCue } });
    });
    const byteLength = decodedBytes(result);
    const capturedCue = String(result?.audioCue?.cue || '').trim();
    last = Object.assign({}, result || {}, { attempt, byteLength });
    if(result?.ok && byteLength >= 512 && capturedCue === expectedCue) return last;
    last.captureMismatch = { expectedCue, capturedCue: capturedCue || '(none)' };
  }
  return last || { ok: false, error: 'capture did not run' };
}

function markdown(report){
  const lines = [
    `# Aurora ${report.title} Audio Candidate Analysis`,
    '',
    `Generated: ${report.generatedAt}`,
    `Commit: ${report.commit}${report.dirty ? ' (dirty)' : ''}`,
    '',
    '## Problem',
    '',
    report.problem,
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
  for(const row of report.candidates.slice(0, 24)){
    lines.push(`| ${row.label} | ${row.risk10} | ${row.worstSegmentRole || 'n/a'} ${row.worstSegmentRisk10 ?? 'n/a'} | ${row.durationGapSeconds}s | ${row.centroidGapHz}Hz | ${row.bandShapeGap} | ${row.keeperRead} |`);
  }
  lines.push('', '## Next Step', '', report.nextStep, '');
  return `${lines.join('\n')}\n`;
}

async function analyzeCue(key, generatedAt, rootDir){
  const config = CUE_CONFIGS[key];
  if(!config) fail(`Unknown focus cue: ${key}`, { valid: Object.keys(CUE_CONFIGS) });
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const dirty = git(['status', '--short'], '').trim().length > 0;
  const { set, entry } = comparisonContext(config);
  const opts = { ...(entry.preview || {}), audioTheme: 'aurora-application', allowIdle: true, minCaptureBytes: 512 };
  delete opts.cue;
  const candidates = candidateSpecs(config, set);
  const cueDir = path.join(rootDir, key);
  const samplesDir = path.join(cueDir, 'samples');
  ensureDir(samplesDir);

  const referenceSource = path.join(ROOT, 'src', set.referenceClip.replace(/^assets\//, 'assets/'));
  if(!fs.existsSync(referenceSource)) fail(`${config.title} reference clip missing`, { referenceSource, set });
  const referenceWav = path.join(samplesDir, `${slug(config.title)}-reference.wav`);
  toWav(referenceSource, referenceWav, set.referenceWindow || null);

  const captures = [];
  for(let index = 0; index < candidates.length; index += 1){
    const row = candidates[index];
    const result = await captureCandidate(config, row, opts, index);
    if(!result?.ok) fail(`${config.title} candidate capture failed`, { id: row.id, result });
    captures.push({ row, result, sampleId: slug(row.id) });
  }

  const baselineCapture = captures.find(item => item.row.baseline);
  if(!baselineCapture) fail(`${config.title} baseline capture missing`);
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
      focus: `Candidate comparison for ${config.title}.`,
      cue: config.cue,
      aurora: {
        label: capture.row.label,
        wav: rel(files.wav, cueDir),
        webm: rel(files.webm, cueDir),
        audioCue: capture.result.audioCue || null
      },
      galaga: {
        label: 'Current Aurora baseline',
        wav: rel(baselineFiles.wav, cueDir),
        webm: rel(baselineFiles.webm, cueDir),
        audioCue: baselineCapture.result.audioCue || null
      },
      reference: {
        label: set.referenceLabel || `${config.title} Reference`,
        source: rel(referenceSource),
        wav: rel(referenceWav, cueDir),
        window: set.referenceWindow || null
      }
    };
  });

  const manifestPath = path.join(cueDir, 'manifest.json');
  fs.writeFileSync(manifestPath, `${JSON.stringify({
    generatedAt,
    commit,
    version: require(path.join(ROOT, 'package.json')).version,
    cue: config.cue,
    items: manifestItems
  }, null, 2)}\n`);

  run(pythonForAudioReport(), [path.join(ROOT, 'tools', 'harness', 'render-audio-comparison-report.py'), manifestPath], { cwd: ROOT, stdio: 'inherit' });

  const metricsPath = path.join(cueDir, 'metrics.json');
  const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
  const rows = metrics.items.map(item => {
    const spec = candidates.find(candidate => slug(candidate.id) === item.id);
    const comparison = item.comparisons.auroraVsReferenceActive;
    const breakdown = riskBreakdown(comparison);
    const segments = segmentSummary(item.segmentRoleComparisons);
    return {
      id: spec?.id || item.id,
      label: spec?.label || item.label,
      generated: !!spec?.generated,
      generator: spec?.generator || null,
      spec: spec?.spec || null,
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
  rows.forEach(row => { row.keeperRead = row.id === 'baseline-current' ? 'baseline' : rejectionFor(row, baseline, config); });
  rows.sort((a, b) => a.risk10 - b.risk10 || (a.worstSegmentRisk10 || 99) - (b.worstSegmentRisk10 || 99));
  const decision = decisionFor(rows, config);

  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-audio-focus-candidate-loop',
    generatedAt,
    branch: git(['branch', '--show-current'], ''),
    commit,
    dirty,
    key,
    title: config.title,
    cue: config.cue,
    problem: config.problem,
    strategy: 'Capture baseline, hand-designed candidates, and reference subclip windows through the live browser audio engine, compare against the canonical application-guide reference window, and promote only candidates that clear explicit keeper gates.',
    successMeasure: 'A keeper must improve whole-cue risk, segment risk, and duration gap while avoiding material centroid, band-shape, or segment-role regressions.',
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
      ? `Promote ${decision.best} for ${config.title}, then rerun the full audio comparison and event-gap rollup.`
      : `Do not promote ${config.title} yet; use the measured best candidate to refine the generator or scoring gates.`
  };
  fs.writeFileSync(path.join(cueDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(cueDir, 'README.md'), markdown(report));
  fs.writeFileSync(path.join(OUT_ROOT, config.latest), `${JSON.stringify(report, null, 2)}\n`);

  return {
    key,
    report: rel(path.join(cueDir, 'report.json')),
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
  };
}

async function main(){
  const generatedAt = new Date().toISOString();
  const stamp = generatedAt.slice(0, 10);
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const dirty = git(['status', '--short'], '').trim().length > 0;
  const runTag = `${stamp}-${commit}${dirty ? '-dirty' : ''}-audio-focus-${generatedAt.slice(11, 19).replace(/:/g, '')}`;
  const rootDir = path.join(OUT_ROOT, runTag);
  ensureDir(rootDir);
  const results = [];
  for(const key of requestedKeys()){
    results.push(await analyzeCue(key, generatedAt, rootDir));
  }
  const summary = {
    schemaVersion: 1,
    artifactType: 'aurora-audio-focus-candidate-loop-summary',
    generatedAt,
    branch: git(['branch', '--show-current'], ''),
    commit,
    dirty,
    gridLimit: gridLimit(),
    results
  };
  fs.writeFileSync(path.join(rootDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  fs.writeFileSync(path.join(OUT_ROOT, 'latest-focus.json'), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify({ ok: true, summary: rel(path.join(rootDir, 'summary.json')), results }, null, 2));
}

main().catch(err => {
  console.error(err && err.stack || err);
  process.exit(1);
});
