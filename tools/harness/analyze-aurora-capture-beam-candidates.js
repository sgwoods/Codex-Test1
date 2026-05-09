#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');
const { withHarnessPage, ROOT } = require('./browser-check-util');

const GUIDE = require(path.join(ROOT, 'application-guide.json'));
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'aurora-audio-cue-candidates');
const CUE = 'captureBeam';
const ENTRY_ID = 'capture-beam';

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
  const set = (GUIDE.comparisonSets || []).find(item => item.entryId === ENTRY_ID || item.id === 'capture-beam-compare');
  if(!set) fail('Capture Beam comparison set is missing from application-guide.json');
  const entry = (GUIDE.audioContexts || []).find(ctx => ctx.id === set.entryId);
  if(!entry) fail('Capture Beam audio context is missing from application-guide.json', set);
  return { set, entry };
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function clamp(value, min, max){
  return Math.max(min, Math.min(max, value));
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

function bandEnergyDelta(active, reference){
  const keys = ['sub_500', 'low_mid_500_1500', 'mid_1500_3000', 'presence_3000_6000', 'air_6000_plus'];
  const delta = {};
  for(const key of keys){
    delta[key] = round((active?.[key] ?? 0) - (reference?.[key] ?? 0), 4);
  }
  return delta;
}

function meanBandEnergy(items){
  const keys = ['sub_500', 'low_mid_500_1500', 'mid_1500_3000', 'presence_3000_6000', 'air_6000_plus'];
  const band = {};
  for(const key of keys){
    band[key] = round(mean(items.map(item => item?.[key])), 4);
  }
  return band;
}

function argValue(name){
  const prefix = `--${name}=`;
  const inline = process.argv.find(arg => arg.startsWith(prefix));
  if(inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : '';
}

function repeatCount(){
  const requested = Number(argValue('repeats') || process.env.AURORA_CAPTURE_BEAM_CANDIDATE_REPEATS || 1);
  return Number.isFinite(requested) ? Math.max(1, Math.min(5, Math.floor(requested))) : 1;
}

function candidateFilter(){
  const raw = argValue('candidate-ids') || process.env.AURORA_CAPTURE_BEAM_CANDIDATE_IDS || '';
  return new Set(String(raw).split(',').map(item => item.trim()).filter(Boolean));
}

function gridLimit(){
  const requested = Number(argValue('grid-limit') || process.env.AURORA_CAPTURE_BEAM_GRID_LIMIT || 0);
  return Number.isFinite(requested) ? Math.max(0, Math.min(120, Math.floor(requested))) : 0;
}

function runTag(repeats, filter, generatedAt){
  const time = generatedAt.slice(11, 19).replace(/:/g, '');
  const parts = ['capture-beam', time];
  if(repeats > 1) parts.push(`${repeats}x`);
  if(filter.size) parts.push('filtered');
  if(gridLimit()) parts.push(`grid${gridLimit()}`);
  return parts.join('-');
}

function candidateSpecs(){
  return [
    {
      id: 'baseline-current',
      label: 'Current Aurora baseline',
      baseline: true
    },
    {
      id: 'urgent-mid-square',
      label: 'Urgent mid square beam',
      spec: {
        tones: [
          { freq: 620, duration: .06, wave: 'square', volume: .0105, slide: 460, detune: .004, lpHz: 3600, hpHz: 260 },
          { freq: 1080, duration: .18, wave: 'triangle', volume: .012, slide: 360, detune: .003, lpHz: 4200, hpHz: 420, delay: .035 },
          { freq: 1740, duration: .085, wave: 'square', volume: .0042, slide: -120, detune: .002, lpHz: 5200, hpHz: 720, delay: .16 }
        ],
        noise: [{ duration: .035, volume: .0014, hp: 2600, delay: .012 }]
      }
    },
    {
      id: 'thin-tractor-rise',
      label: 'Thin tractor rise',
      spec: {
        tones: [
          { freq: 740, duration: .052, wave: 'square', volume: .0094, slide: 560, lpHz: 3900, hpHz: 360 },
          { freq: 1280, duration: .17, wave: 'triangle', volume: .0114, slide: 260, lpHz: 4300, hpHz: 520, delay: .028 },
          { freq: 1980, duration: .07, wave: 'triangle', volume: .004, slide: -90, lpHz: 5400, hpHz: 900, delay: .15 }
        ],
        noise: [{ duration: .03, volume: .0012, hp: 3200, delay: .01 }]
      }
    },
    {
      id: 'low-mid-balanced',
      label: 'Low-mid balanced beam',
      spec: {
        tones: [
          { freq: 520, duration: .065, wave: 'square', volume: .0108, slide: 420, lpHz: 3300, hpHz: 220 },
          { freq: 960, duration: .19, wave: 'triangle', volume: .0124, slide: 320, lpHz: 3900, hpHz: 360, delay: .038 },
          { freq: 1560, duration: .075, wave: 'square', volume: .0038, slide: -80, lpHz: 5000, hpHz: 760, delay: .17 }
        ],
        noise: [{ duration: .035, volume: .001, hp: 2400, delay: .018 }]
      }
    },
    {
      id: 'low-mid-balanced-midlift',
      label: 'Low-mid balanced midlift',
      spec: {
        tones: [
          { freq: 540, duration: .06, wave: 'square', volume: .0106, slide: 430, lpHz: 3400, hpHz: 280 },
          { freq: 1080, duration: .17, wave: 'triangle', volume: .0118, slide: 300, lpHz: 4100, hpHz: 460, delay: .034 },
          { freq: 1780, duration: .09, wave: 'square', volume: .0062, slide: -110, lpHz: 5200, hpHz: 820, delay: .145 }
        ],
        noise: [{ duration: .03, volume: .00085, hp: 2800, delay: .016 }]
      }
    },
    {
      id: 'low-mid-balanced-midcore',
      label: 'Low-mid balanced midcore',
      spec: {
        tones: [
          { freq: 560, duration: .052, wave: 'square', volume: .0102, slide: 390, lpHz: 3400, hpHz: 300 },
          { freq: 1120, duration: .165, wave: 'square', volume: .0104, slide: 250, lpHz: 4200, hpHz: 520, delay: .03 },
          { freq: 1840, duration: .082, wave: 'triangle', volume: .0064, slide: -135, lpHz: 5400, hpHz: 920, delay: .132 },
          { freq: 2180, duration: .045, wave: 'triangle', volume: .0028, slide: -90, lpHz: 5800, hpHz: 1200, delay: .205 }
        ],
        noise: [{ duration: .024, volume: .00065, hp: 3000, delay: .014 }]
      }
    },
    {
      id: 'low-mid-balanced-hp-lift',
      label: 'Low-mid balanced high-pass lift',
      spec: {
        tones: [
          { freq: 560, duration: .06, wave: 'square', volume: .0104, slide: 440, lpHz: 3500, hpHz: 360 },
          { freq: 1040, duration: .18, wave: 'triangle', volume: .0114, slide: 310, lpHz: 4200, hpHz: 560, delay: .034 },
          { freq: 1720, duration: .095, wave: 'square', volume: .006, slide: -120, lpHz: 5400, hpHz: 960, delay: .142 }
        ],
        noise: [{ duration: .026, volume: .0007, hp: 3200, delay: .014 }]
      }
    },
    {
      id: 'low-mid-balanced-early-bright',
      label: 'Low-mid balanced early bright',
      spec: {
        tones: [
          { freq: 620, duration: .05, wave: 'square', volume: .0126, slide: 380, lpHz: 3600, hpHz: 320 },
          { freq: 1180, duration: .145, wave: 'triangle', volume: .0102, slide: 240, lpHz: 4300, hpHz: 540, delay: .024 },
          { freq: 1860, duration: .078, wave: 'square', volume: .0056, slide: -140, lpHz: 5400, hpHz: 940, delay: .12 },
          { freq: 2240, duration: .045, wave: 'triangle', volume: .0022, slide: -80, lpHz: 5800, hpHz: 1300, delay: .186 }
        ],
        noise: [{ duration: .022, volume: .0006, hp: 3200, delay: .01 }]
      }
    },
    {
      id: 'midlift-bright-hp',
      label: 'Midlift bright high-pass beam',
      spec: {
        tones: [
          { freq: 680, duration: .048, wave: 'square', volume: .0128, slide: 390, lpHz: 3900, hpHz: 420 },
          { freq: 1280, duration: .15, wave: 'triangle', volume: .011, slide: 220, lpHz: 4500, hpHz: 660, delay: .024 },
          { freq: 1960, duration: .086, wave: 'square', volume: .0064, slide: -130, lpHz: 5600, hpHz: 1040, delay: .112 },
          { freq: 2380, duration: .04, wave: 'triangle', volume: .0024, slide: -90, lpHz: 6200, hpHz: 1400, delay: .182 }
        ],
        noise: [{ duration: .02, volume: .00055, hp: 3400, delay: .01 }]
      }
    },
    {
      id: 'midlift-midband-early',
      label: 'Midlift midband early beam',
      spec: {
        tones: [
          { freq: 640, duration: .052, wave: 'square', volume: .0122, slide: 360, lpHz: 3800, hpHz: 380 },
          { freq: 1220, duration: .155, wave: 'square', volume: .0102, slide: 210, lpHz: 4400, hpHz: 620, delay: .022 },
          { freq: 1840, duration: .095, wave: 'triangle', volume: .007, slide: -120, lpHz: 5600, hpHz: 980, delay: .104 },
          { freq: 2180, duration: .044, wave: 'triangle', volume: .0026, slide: -80, lpHz: 6000, hpHz: 1300, delay: .18 }
        ],
        noise: [{ duration: .02, volume: .0005, hp: 3300, delay: .01 }]
      }
    },
    {
      id: 'midlift-subtrim-pulse',
      label: 'Midlift sub-trim pulse',
      spec: {
        tones: [
          { freq: 720, duration: .045, wave: 'square', volume: .012, slide: 330, lpHz: 3950, hpHz: 500 },
          { freq: 1360, duration: .14, wave: 'triangle', volume: .0106, slide: 180, lpHz: 4600, hpHz: 720, delay: .022 },
          { freq: 2040, duration: .08, wave: 'square', volume: .006, slide: -130, lpHz: 5700, hpHz: 1120, delay: .104 },
          { freq: 2480, duration: .038, wave: 'triangle', volume: .0022, slide: -80, lpHz: 6200, hpHz: 1500, delay: .174 }
        ],
        noise: [{ duration: .018, volume: .00045, hp: 3600, delay: .008 }]
      }
    },
    {
      id: 'midlift-reference-ratio',
      label: 'Midlift reference ratio beam',
      spec: {
        tones: [
          { freq: 590, duration: .05, wave: 'square', volume: .0118, slide: 420, lpHz: 3600, hpHz: 380 },
          { freq: 1120, duration: .16, wave: 'triangle', volume: .0114, slide: 260, lpHz: 4300, hpHz: 580, delay: .026 },
          { freq: 1880, duration: .09, wave: 'square', volume: .0068, slide: -120, lpHz: 5500, hpHz: 940, delay: .116 },
          { freq: 2260, duration: .05, wave: 'triangle', volume: .0025, slide: -80, lpHz: 6000, hpHz: 1320, delay: .19 }
        ],
        noise: [{ duration: .022, volume: .00055, hp: 3200, delay: .012 }]
      }
    },
    {
      id: 'early-peak-siren',
      label: 'Early peak siren beam',
      spec: {
        tones: [
          { freq: 880, duration: .045, wave: 'square', volume: .012, slide: 420, lpHz: 4300, hpHz: 420 },
          { freq: 1320, duration: .16, wave: 'square', volume: .0088, slide: 180, lpHz: 4400, hpHz: 560, delay: .022 },
          { freq: 1660, duration: .095, wave: 'triangle', volume: .0048, slide: -180, lpHz: 5200, hpHz: 760, delay: .115 }
        ],
        noise: [{ duration: .026, volume: .0011, hp: 3000, delay: .008 }]
      }
    },
    {
      id: 'reference-band-pulse',
      label: 'Reference band pulse',
      spec: {
        tones: [
          { freq: 690, duration: .055, wave: 'triangle', volume: .011, slide: 500, lpHz: 3600, hpHz: 300 },
          { freq: 1180, duration: .185, wave: 'square', volume: .0102, slide: 260, lpHz: 4100, hpHz: 480, delay: .032 },
          { freq: 1860, duration: .075, wave: 'triangle', volume: .0046, slide: -140, lpHz: 5300, hpHz: 820, delay: .155 }
        ],
        noise: [{ duration: .025, volume: .0008, hp: 2800, delay: .016 }]
      }
    },
    ...generatedCandidateSpecs()
  ];
}

function generatedCandidateSpecs(){
  const limit = gridLimit();
  if(!limit) return [];
  const specs = [];
  const bases = [520, 620, 720, 840, 960];
  const ratios = [1.55, 1.75, 1.95];
  const bodyDurations = [.14, .17, .2];
  const onsetDurations = [.04, .055, .07];
  const hpProfiles = [
    { onset: 220, body: 360, tail: 720 },
    { onset: 320, body: 480, tail: 860 },
    { onset: 420, body: 620, tail: 980 }
  ];
  const waves = ['triangle', 'square'];
  for(const base of bases){
    for(const ratio of ratios){
      for(const bodyDuration of bodyDurations){
        for(const onsetDuration of onsetDurations){
          for(const hp of hpProfiles){
            for(const bodyWave of waves){
              const body = Math.round(base * ratio);
              const tail = Math.round(body * 1.55);
              const heuristic = Math.abs((onsetDuration + bodyDuration + .08) - .31)
                + Math.abs(body - 1120) / 2400
                + Math.abs(tail - 1780) / 3200
                + (bodyWave === 'square' ? .02 : 0);
              specs.push({
                id: `grid-${base}-${body}-${tail}-${Math.round(bodyDuration * 1000)}-${hp.body}-${bodyWave}`,
                label: `Grid ${base}/${body}/${tail} ${bodyWave}`,
                generated: true,
                generator: { family: 'capture-beam-mid-band-grid', heuristic: round(heuristic, 4) },
                spec: {
                  tones: [
                    { freq: base, duration: onsetDuration, wave: 'square', volume: .0105, slide: 420, detune: .003, lpHz: 3600, hpHz: hp.onset },
                    { freq: body, duration: bodyDuration, wave: bodyWave, volume: .0112, slide: 260, detune: .002, lpHz: 4200, hpHz: hp.body, delay: .03 },
                    { freq: tail, duration: .075, wave: 'triangle', volume: .0042, slide: -140, detune: .001, lpHz: 5400, hpHz: hp.tail, delay: .135 + Math.max(0, bodyDuration - .14) * .55 }
                  ],
                  noise: [{ duration: .028, volume: .0009, hp: 2800, delay: .012 }]
                }
              });
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

function riskBreakdown(row){
  const comparison = row.comparison || {};
  const bandDelta = row.bandEnergyDelta || {};
  const active = row.activeMetrics || {};
  const reference = row.referenceMetrics || {};
  const attackGap = Math.abs((active.attack_peak_position ?? 0) - (reference.attack_peak_position ?? 0));
  const parts = {
    duration: clamp((+comparison.duration_s || 0) / .24, 0, 1.65),
    centroid: clamp((+comparison.spectral_centroid_hz || 0) / 900, 0, 1.45),
    zeroCrossing: clamp((+comparison.zero_crossings_per_s || 0) / 1500, 0, 1.05),
    rms: clamp((+comparison.rms || 0) / .14, 0, .9),
    bandShape: clamp((+comparison.band_shape_distance || 0) / .42, 0, 1.4),
    subBass: clamp(Math.max(0, bandDelta.sub_500 || 0) / .34, 0, 1.25),
    missingMid: clamp(Math.max(0, -(bandDelta.mid_1500_3000 || 0)) / .22, 0, 1.0),
    rolloff: clamp((+comparison.spectral_rolloff_85_hz || 0) / 1800, 0, .75),
    attack: clamp(attackGap / .32, 0, .9),
    segment: Number.isFinite(+row.worstSegmentRisk10) ? clamp((+row.worstSegmentRisk10 || 0) / 10, 0, .95) : .35,
    floor: .35
  };
  const scaled = Object.fromEntries(Object.entries(parts).map(([key, value]) => [key, round(value, 3)]));
  const risk10 = round(clamp(Object.values(parts).reduce((sum, value) => sum + value, 0), 0, 10), 2);
  const dominant = Object.entries(scaled)
    .filter(([key]) => key !== 'floor')
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';
  return { risk10, components: scaled, dominant };
}

function segmentSummary(comparisons){
  const rows = Array.isArray(comparisons) ? comparisons : [];
  if(!rows.length){
    return {
      segmentRoleComparisonCount: 0,
      averageSegmentRisk10: null,
      worstSegmentRisk10: null,
      worstSegmentRole: '',
      exactSegmentRoleMatchCount: 0,
      worstSegmentInterpretation: ''
    };
  }
  const risks = rows.map(row => +row.auroraSegmentRisk10).filter(Number.isFinite);
  const worst = rows
    .slice()
    .sort((a, b) => (+b.auroraSegmentRisk10 || 0) - (+a.auroraSegmentRisk10 || 0))[0] || {};
  return {
    segmentRoleComparisonCount: rows.length,
    averageSegmentRisk10: round(mean(risks), 2),
    worstSegmentRisk10: round(+worst.auroraSegmentRisk10 || 0, 2),
    worstSegmentRole: worst.role || '',
    exactSegmentRoleMatchCount: rows.filter(row => row.auroraExactRoleMatch).length,
    worstSegmentInterpretation: worst.interpretation || ''
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
      rms: round(mean(group.map(row => row.comparison.rms)), 4),
      spectral_rolloff_85_hz: round(mean(group.map(row => row.comparison.spectral_rolloff_85_hz)), 1),
      band_shape_distance: round(mean(group.map(row => row.comparison.band_shape_distance)), 4),
      attack_peak_position: round(mean(group.map(row => row.comparison.attack_peak_position)), 3),
      decay_ratio: round(mean(group.map(row => row.comparison.decay_ratio)), 3),
      burst_share: round(mean(group.map(row => row.comparison.burst_share)), 3)
    };
    const activeBandEnergy = meanBandEnergy(group.map(row => row.activeMetrics.band_energy));
    const referenceBandEnergy = meanBandEnergy(group.map(row => row.referenceMetrics.band_energy));
    const activeMetrics = {
      duration_s: round(mean(group.map(row => row.activeMetrics.duration_s)), 3),
      rms: round(mean(group.map(row => row.activeMetrics.rms)), 4),
      spectral_centroid_hz: round(mean(group.map(row => row.activeMetrics.spectral_centroid_hz)), 1),
      zero_crossings_per_s: round(mean(group.map(row => row.activeMetrics.zero_crossings_per_s)), 1),
      spectral_rolloff_85_hz: round(mean(group.map(row => row.activeMetrics.spectral_rolloff_85_hz)), 1),
      band_energy: activeBandEnergy,
      attack_peak_position: round(mean(group.map(row => row.activeMetrics.attack_peak_position)), 3),
      decay_ratio: round(mean(group.map(row => row.activeMetrics.decay_ratio)), 3),
      burst_share: round(mean(group.map(row => row.activeMetrics.burst_share)), 3)
    };
    const referenceMetrics = {
      duration_s: round(mean(group.map(row => row.referenceMetrics.duration_s)), 3),
      rms: round(mean(group.map(row => row.referenceMetrics.rms)), 4),
      spectral_centroid_hz: round(mean(group.map(row => row.referenceMetrics.spectral_centroid_hz)), 1),
      zero_crossings_per_s: round(mean(group.map(row => row.referenceMetrics.zero_crossings_per_s)), 1),
      spectral_rolloff_85_hz: round(mean(group.map(row => row.referenceMetrics.spectral_rolloff_85_hz)), 1),
      band_energy: referenceBandEnergy,
      attack_peak_position: round(mean(group.map(row => row.referenceMetrics.attack_peak_position)), 3),
      decay_ratio: round(mean(group.map(row => row.referenceMetrics.decay_ratio)), 3),
      burst_share: round(mean(group.map(row => row.referenceMetrics.burst_share)), 3)
    };
    const row = {
      id,
      label: first.baseLabel || first.label,
      generated: !!first.generated,
      generator: first.generator || null,
      durationGapSeconds: avgComparison.duration_s,
      centroidGapHz: avgComparison.spectral_centroid_hz,
      zeroCrossingGapPerSecond: avgComparison.zero_crossings_per_s,
      rmsGap: avgComparison.rms,
      bandShapeGap: avgComparison.band_shape_distance,
      rolloffGapHz: avgComparison.spectral_rolloff_85_hz,
      activeMetrics,
      referenceMetrics,
      bandEnergyDelta: bandEnergyDelta(activeBandEnergy, referenceBandEnergy),
      comparison: avgComparison,
      segmentRoleComparisonCount: Math.round(mean(group.map(row => row.segmentRoleComparisonCount || 0)) || 0),
      averageSegmentRisk10: round(mean(group.map(row => row.averageSegmentRisk10)), 2),
      worstSegmentRisk10: round(mean(group.map(row => row.worstSegmentRisk10)), 2),
      worstSegmentRole: group.slice().sort((a, b) => (+b.worstSegmentRisk10 || 0) - (+a.worstSegmentRisk10 || 0))[0]?.worstSegmentRole || '',
      exactSegmentRoleMatchCount: Math.round(mean(group.map(row => row.exactSegmentRoleMatchCount || 0)) || 0),
      worstSegmentInterpretation: group.slice().sort((a, b) => (+b.worstSegmentRisk10 || 0) - (+a.worstSegmentRisk10 || 0))[0]?.worstSegmentInterpretation || '',
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
        rmsGap: row.rmsGap,
        bandShapeGap: row.bandShapeGap,
        bandEnergyDelta: row.bandEnergyDelta,
        worstSegmentRisk10: row.worstSegmentRisk10,
        worstSegmentRole: row.worstSegmentRole
      }))
    };
    const breakdown = riskBreakdown(row);
    row.risk10 = breakdown.risk10;
    row.riskBreakdown = breakdown.components;
    row.dominantPenalty = breakdown.dominant;
    rows.push(row);
  }
  return rows.sort((a, b) => a.risk10 - b.risk10 || (a.worstSegmentRisk10 ?? 99) - (b.worstSegmentRisk10 ?? 99) || a.durationGapSeconds - b.durationGapSeconds);
}

function rejectionFor(row, baseline){
  if(!baseline) return 'missing-baseline';
  const riskDelta = round(baseline.risk10 - row.risk10, 3);
  const segmentRiskDelta = Number.isFinite(+baseline.worstSegmentRisk10) && Number.isFinite(+row.worstSegmentRisk10)
    ? round(+baseline.worstSegmentRisk10 - +row.worstSegmentRisk10, 3)
    : null;
  const centroidDelta = round(baseline.centroidGapHz - row.centroidGapHz, 1);
  const bandDelta = round((baseline.bandShapeGap ?? 0) - (row.bandShapeGap ?? 0), 4);
  const subDelta = round((baseline.activeMetrics?.band_energy?.sub_500 ?? 0) - (row.activeMetrics?.band_energy?.sub_500 ?? 0), 4);
  const midDelta = round((row.activeMetrics?.band_energy?.mid_1500_3000 ?? 0) - (baseline.activeMetrics?.band_energy?.mid_1500_3000 ?? 0), 4);
  const attackDelta = round(Math.abs((baseline.activeMetrics?.attack_peak_position ?? 0) - (baseline.referenceMetrics?.attack_peak_position ?? 0)) - Math.abs((row.activeMetrics?.attack_peak_position ?? 0) - (row.referenceMetrics?.attack_peak_position ?? 0)), 3);
  const rmsDelta = round(baseline.rmsGap - row.rmsGap, 4);
  const reasons = [];
  if(row.durationGapSeconds > .09) reasons.push(`duration gap ${row.durationGapSeconds}s > 0.09s`);
  if(riskDelta < .3) reasons.push(`risk improvement ${riskDelta} < 0.3`);
  if(segmentRiskDelta !== null && segmentRiskDelta < .3) reasons.push(`segment risk improvement ${segmentRiskDelta} < 0.3`);
  if(centroidDelta < 80) reasons.push(`centroid improvement ${centroidDelta} Hz < 80 Hz`);
  if(subDelta < .05) reasons.push(`sub-bass reduction ${subDelta} < 0.05`);
  if(midDelta < .04) reasons.push(`mid-band gain ${midDelta} < 0.04`);
  if(attackDelta < .04) reasons.push(`attack timing improvement ${attackDelta} < 0.04`);
  if(bandDelta < -.02) reasons.push(`band shape worsened by ${Math.abs(bandDelta)}`);
  if(rmsDelta < -.025) reasons.push(`RMS worsened by ${Math.abs(rmsDelta)}`);
  if((row.stability?.repetitions || 1) > 1){
    if((row.stability.riskStd || 0) > .25) reasons.push(`risk stability sd ${row.stability.riskStd} > 0.25`);
    if((row.stability.durationGapStdSeconds || 0) > .04) reasons.push(`duration stability sd ${row.stability.durationGapStdSeconds}s > 0.04s`);
    if((row.stability.centroidGapStdHz || 0) > 60) reasons.push(`centroid stability sd ${row.stability.centroidGapStdHz} Hz > 60 Hz`);
    if((row.stability.rmsGapStd || 0) > .02) reasons.push(`RMS stability sd ${row.stability.rmsGapStd} > 0.02`);
  }
  return reasons.length ? reasons.join('; ') : 'clears keeper gates';
}

function annotateRejections(rows){
  const baseline = rows.find(row => row.id === 'baseline-current');
  return rows.map(row => Object.assign(row, {
    keeperRead: row.id === 'baseline-current' ? 'baseline' : rejectionFor(row, baseline)
  }));
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
      reason: 'Baseline Capture Beam row was not captured.'
    };
  }
  const measuredBest = candidates[0] || null;
  const gated = candidates
    .map(row => {
      const riskDelta = round(baseline.risk10 - row.risk10, 3);
      const segmentRiskDelta = Number.isFinite(+baseline.worstSegmentRisk10) && Number.isFinite(+row.worstSegmentRisk10)
        ? round(+baseline.worstSegmentRisk10 - +row.worstSegmentRisk10, 3)
        : null;
      const centroidDelta = round(baseline.centroidGapHz - row.centroidGapHz, 1);
      const bandDelta = round((baseline.bandShapeGap ?? 0) - (row.bandShapeGap ?? 0), 4);
      const subDelta = round((baseline.activeMetrics?.band_energy?.sub_500 ?? 0) - (row.activeMetrics?.band_energy?.sub_500 ?? 0), 4);
      const midDelta = round((row.activeMetrics?.band_energy?.mid_1500_3000 ?? 0) - (baseline.activeMetrics?.band_energy?.mid_1500_3000 ?? 0), 4);
      const attackDelta = round(Math.abs((baseline.activeMetrics?.attack_peak_position ?? 0) - (baseline.referenceMetrics?.attack_peak_position ?? 0)) - Math.abs((row.activeMetrics?.attack_peak_position ?? 0) - (row.referenceMetrics?.attack_peak_position ?? 0)), 3);
      const rmsDelta = round(baseline.rmsGap - row.rmsGap, 4);
      const stabilityPass = (row.stability?.repetitions || 1) <= 1
        || ((row.stability.riskStd || 0) <= .25
          && (row.stability.durationGapStdSeconds || 0) <= .04
          && (row.stability.centroidGapStdHz || 0) <= 60
          && (row.stability.rmsGapStd || 0) <= .02);
      return { row, riskDelta, segmentRiskDelta, centroidDelta, bandDelta, subDelta, midDelta, attackDelta, rmsDelta, stabilityPass };
    })
    .filter(item => item.row.durationGapSeconds <= .09
      && item.riskDelta >= .3
      && (item.segmentRiskDelta === null || item.segmentRiskDelta >= .3)
      && item.centroidDelta >= 80
      && item.subDelta >= .05
      && item.midDelta >= .04
      && item.attackDelta >= .04
      && item.bandDelta >= -.02
      && item.rmsDelta >= -.025
      && item.stabilityPass)
    .sort((a, b) => b.riskDelta - a.riskDelta || b.segmentRiskDelta - a.segmentRiskDelta || b.subDelta - a.subDelta || b.midDelta - a.midDelta);
  const selected = gated[0] || null;
  if(!selected){
    return {
      status: 'no-keeper',
      keep: false,
      baseline: baseline.id,
      best: null,
      measuredBest: measuredBest?.id || null,
      reason: measuredBest
        ? 'The lowest-risk candidate did not clear all capture-beam keeper gates, and no other candidate did either.'
        : 'No candidate was captured beyond the baseline.'
    };
  }
  return {
    status: 'candidate-recommended',
    keep: true,
    baseline: baseline.id,
    best: selected.row.id,
    measuredBest: measuredBest?.id || null,
    riskDelta: selected.riskDelta,
    segmentRiskDelta: selected.segmentRiskDelta,
    centroidDelta: selected.centroidDelta,
    bandDelta: selected.bandDelta,
    subDelta: selected.subDelta,
    midDelta: selected.midDelta,
    attackDelta: selected.attackDelta,
    rmsDelta: selected.rmsDelta,
    reason: 'Selected candidate clears duration, risk, segment, centroid, sub-bass, mid-band, attack timing, band-shape, RMS, and repeatability gates.'
  };
}

function markdown(report){
  const lines = [
    '# Aurora Capture Beam Audio Candidate Loop',
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
    '| Candidate | Risk /10 | Worst segment | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Sub delta | Mid delta | Attack pos | RMS Gap | Stability | Keeper read |',
    '| --- | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |'
  ];
  for(const row of report.candidates){
    const stability = row.stability ? `${row.stability.repetitions}x, risk sd ${row.stability.riskStd}` : '1x';
    lines.push(`| ${row.label} | ${row.risk10} | ${row.worstSegmentRole || 'n/a'} ${row.worstSegmentRisk10 ?? 'n/a'} | ${row.dominantPenalty || 'n/a'} | ${row.durationGapSeconds}s | ${row.centroidGapHz} Hz | ${row.bandShapeGap ?? 'n/a'} | ${row.bandEnergyDelta?.sub_500 ?? 'n/a'} | ${row.bandEnergyDelta?.mid_1500_3000 ?? 'n/a'} | ${row.activeMetrics?.attack_peak_position ?? 'n/a'} | ${row.rmsGap} | ${stability} | ${row.keeperRead || ''} |`);
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
  const { set, entry } = comparisonSet();
  const captureOpts = { ...(entry.preview || {}), audioTheme: 'aurora-application' };
  delete captureOpts.cue;
  const repeats = repeatCount();
  const filter = candidateFilter();
  const outRoot = path.join(OUT_ROOT, `${stamp}-${commit}${dirty ? '-dirty' : ''}-${runTag(repeats, filter, generatedAt)}`, CUE);
  const samplesDir = path.join(outRoot, 'samples');
  ensureDir(samplesDir);
  let candidates = candidateSpecs();
  if(filter.size){
    candidates = candidates.filter(row => row.baseline || filter.has(row.id));
  }
  const captureJobs = [];
  for(const row of candidates){
    for(let repetition = 1; repetition <= repeats; repetition += 1){
      const suffix = repeats > 1 ? `-r${String(repetition).padStart(2, '0')}` : '';
      captureJobs.push({ row, repetition, sampleId: `${slug(row.id)}${suffix}` });
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
  const referenceWav = path.join(samplesDir, 'capture-beam-reference.wav');
  toWav(referenceSource, referenceWav, set.referenceWindow || null);

  const baselineCapture = captures.find(item => item.row.baseline);
  if(!baselineCapture?.result?.ok) fail('Baseline Capture Beam capture failed', baselineCapture);
  const baselineWebm = path.join(samplesDir, `${baselineCapture.sampleId}.webm`);
  const baselineWav = path.join(samplesDir, `${baselineCapture.sampleId}.wav`);

  const manifestItems = [];
  for(const capture of captures){
    const row = capture.row;
    if(!capture.result?.ok) fail('Capture Beam candidate capture failed', { id: row.id, result: capture.result });
    const id = capture.sampleId;
    const webm = path.join(samplesDir, `${id}.webm`);
    const wav = path.join(samplesDir, `${id}.wav`);
    decodeToFile(capture.result.base64, webm);
    toWav(webm, wav);
    manifestItems.push({
      id,
      label: repeats > 1 ? `${row.label} r${capture.repetition}` : row.label,
      focus: 'Candidate comparison against the measured Capture Beam reference window.',
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
        label: set.referenceLabel || 'Capture Beam Reference',
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
    const segments = segmentSummary(item.segmentRoleComparisons);
    const activeMetrics = item.variants.aurora.activeMetrics;
    const referenceMetrics = item.variants.reference.activeMetrics;
    const row = {
      id: item.id,
      label: item.label,
      baseLabel: spec?.label || item.label.replace(/ r\d+$/, ''),
      repetition: Number((String(item.id).match(/-r(\d+)$/) || [])[1] || 1),
      generated: !!spec?.generated,
      generator: spec?.generator || null,
      durationGapSeconds: round(comparison.duration_s, 3),
      centroidGapHz: round(comparison.spectral_centroid_hz, 1),
      zeroCrossingGapPerSecond: round(comparison.zero_crossings_per_s, 1),
      rmsGap: round(comparison.rms, 4),
      bandShapeGap: round(comparison.band_shape_distance, 4),
      rolloffGapHz: round(comparison.spectral_rolloff_85_hz, 1),
      activeMetrics,
      referenceMetrics,
      bandEnergyDelta: bandEnergyDelta(activeMetrics.band_energy, referenceMetrics.band_energy),
      comparison,
      ...segments
    };
    const breakdown = riskBreakdown(row);
    row.risk10 = breakdown.risk10;
    row.riskBreakdown = breakdown.components;
    row.dominantPenalty = breakdown.dominant;
    return row;
  });
  const rows = annotateRejections(aggregateRows(sampleRows));
  const referenceSegmentation = metrics.items[0]?.referenceSegmentation || null;
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
    problem: 'Capture Beam is the highest whole-cue Aurora audio event-gap risk. The current runtime cue is too long, too low-heavy, and peaks too late, so the tractor-beam danger/rescue moment reads less urgently than Galaga.',
    strategy: 'Generate bounded synthetic beam candidates, capture each through the live browser audio engine, compare them against the measured Galaga tractor-beam window, and recommend promotion only when measured urgency improves without trading away stability. This favors shorter active duration, brighter centroid, lower sub-bass, stronger mid-band energy, earlier attack, and lower segment risk.',
    successMeasure: 'A keeper must reduce overall capture-beam risk by at least 0.3, keep duration gap within 0.09s, improve segment risk when available, improve centroid by at least 80 Hz, materially reduce sub-bass, materially increase mid-band energy, move the attack earlier, avoid band-shape/RMS regression, and stay stable across repeated captures.',
    source: {
      comparisonSet: set.id,
      referenceClip: set.referenceClip,
      referenceWindow: set.referenceWindow || null,
      referenceSegmentation,
      outputRoot: rel(outRoot)
    },
    decision,
    candidates: rows,
    nextStep: decision.keep
      ? 'Promote the selected Capture Beam spec into the Aurora runtime themes, rerun the audio theme comparison/event-gap suite, and refresh conformance economics/dashboard artifacts.'
      : 'Use the lowest-risk candidate and rejection reasons to seed a narrower second sweep before changing runtime audio.'
  };
  const reportPath = path.join(outRoot, 'candidate-report.json');
  const canonicalReportPath = path.join(outRoot, 'report.json');
  const mdPath = path.join(outRoot, 'README.md');
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(canonicalReportPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, markdown(report));
  fs.writeFileSync(path.join(OUT_ROOT, 'latest-capture-beam.json'), `${JSON.stringify(report, null, 2)}\n`);

  console.log(JSON.stringify({
    ok: true,
    outRoot,
    decision: report.decision,
    topCandidates: rows.slice(0, 8).map(row => ({
      id: row.id,
      risk10: row.risk10,
      worstSegmentRisk10: row.worstSegmentRisk10,
      durationGapSeconds: row.durationGapSeconds,
      centroidGapHz: row.centroidGapHz,
      subDelta: row.bandEnergyDelta?.sub_500,
      midDelta: row.bandEnergyDelta?.mid_1500_3000,
      keeperRead: row.keeperRead
    }))
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
