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
  const handCandidates = [
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
      id: 'thin-bright-square-balanced-held',
      label: 'Thin bright square balanced held',
      spec: { seq: [784, 1175, 1568, 2093, 2794], step: .052, wave: 'triangle', volume: .0051, slide: 20, lpHz: 6500, tones: [{ freq: 3136, duration: .17, wave: 'square', volume: .00115, slide: 0, lpHz: 7600, delay: .186 }] }
    },
    {
      id: 'thin-bright-square-long-low-held',
      label: 'Thin bright square long low held',
      spec: { seq: [784, 1175, 1568, 2093, 2794], step: .054, wave: 'triangle', volume: .0047, slide: 18, lpHz: 6500, tones: [{ freq: 3136, duration: .195, wave: 'square', volume: .00105, slide: 0, lpHz: 7600, delay: .182 }] }
    },
    {
      id: 'thin-bright-square-soft-attack-held',
      label: 'Thin bright square soft attack held',
      spec: { seq: [784, 1175, 1568, 2093, 2794], step: .052, wave: 'sine', volume: .0057, slide: 18, lpHz: 6800, tones: [{ freq: 3136, duration: .165, wave: 'square', volume: .00115, slide: 0, lpHz: 7600, delay: .188 }] }
    },
    {
      id: 'thin-bright-square-split-low-held',
      label: 'Thin bright square split low held',
      spec: { seq: [784, 1175, 1568, 2093, 2794], step: .052, wave: 'triangle', volume: .0048, slide: 18, lpHz: 6500, tones: [{ freq: 3136, duration: .09, wave: 'square', volume: .00095, slide: 0, lpHz: 7600, delay: .182 }, { freq: 3136, duration: .09, wave: 'square', volume: .00072, slide: 0, lpHz: 7600, delay: .286 }] }
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
  return [
    ...handCandidates,
    ...generatedCandidateSpecs(),
    ...segmentedCandidateSpecs(),
    ...triangleNeighborhoodCandidateSpecs(),
    ...bandTargetedCandidateSpecs(),
    ...segmentAirCandidateSpecs()
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

function gridLimit(){
  const requested = Number(argValue('grid-limit') || process.env.AURORA_AUDIO_CANDIDATE_GRID_LIMIT || 0);
  return Number.isFinite(requested) ? Math.max(0, Math.min(160, Math.floor(requested))) : 0;
}

function segmentedGridLimit(){
  const requested = Number(argValue('segmented-grid-limit') || process.env.AURORA_AUDIO_SEGMENTED_GRID_LIMIT || 0);
  return Number.isFinite(requested) ? Math.max(0, Math.min(160, Math.floor(requested))) : 0;
}

function triangleGridLimit(){
  const requested = Number(argValue('triangle-grid-limit') || process.env.AURORA_AUDIO_TRIANGLE_GRID_LIMIT || 0);
  return Number.isFinite(requested) ? Math.max(0, Math.min(160, Math.floor(requested))) : 0;
}

function bandGridLimit(){
  const requested = Number(argValue('band-grid-limit') || process.env.AURORA_AUDIO_BAND_GRID_LIMIT || 0);
  return Number.isFinite(requested) ? Math.max(0, Math.min(160, Math.floor(requested))) : 0;
}

function segmentAirGridLimit(){
  const requested = Number(argValue('segment-air-grid-limit') || process.env.AURORA_AUDIO_SEGMENT_AIR_GRID_LIMIT || 0);
  return Number.isFinite(requested) ? Math.max(0, Math.min(160, Math.floor(requested))) : 0;
}

function runTag(repeats, filter, generatedAt){
  const time = generatedAt.slice(11, 19).replace(/:/g, '');
  const parts = [];
  const limit = gridLimit();
  if(limit) parts.push(`grid${limit}`);
  const segmentedLimit = segmentedGridLimit();
  if(segmentedLimit) parts.push(`seg${segmentedLimit}`);
  const triangleLimit = triangleGridLimit();
  if(triangleLimit) parts.push(`tri${triangleLimit}`);
  const bandLimit = bandGridLimit();
  if(bandLimit) parts.push(`band${bandLimit}`);
  const segmentAirLimit = segmentAirGridLimit();
  if(segmentAirLimit) parts.push(`segair${segmentAirLimit}`);
  if(repeats > 1) parts.push(`r${repeats}`);
  if(filter.size) parts.push('focused');
  return `${parts.join('-') || 'manual'}-${time}`;
}

function generatorSummary(rows){
  const generators = rows
    .filter(row => row.generated && row.generator)
    .reduce((map, row) => {
      const family = row.generator.family || 'generated';
      if(!map.has(family)) map.set(family, { family, selectedCandidates: 0, bestRisk10: null, bestCandidate: null });
      const entry = map.get(family);
      entry.selectedCandidates += 1;
      if(entry.bestRisk10 === null || row.risk10 < entry.bestRisk10){
        entry.bestRisk10 = row.risk10;
        entry.bestCandidate = row.id;
      }
      return map;
    }, new Map());
  if(!generators.size) return null;
  return {
    families: Array.from(generators.values()),
    controls: 'Use --grid-limit=N for quiet-held parametric generation, --segmented-grid-limit=N for onset/body/tail generation, --triangle-grid-limit=N for RMS-aware bright-triangle search, --band-grid-limit=N for band-energy targeted generation, --segment-air-grid-limit=N for compact high-pass segment-role generation, and --candidate-ids for focused stability reruns.'
  };
}

function generatedCandidateSpecs(){
  const limit = gridLimit();
  if(!limit) return [];
  const seq = [784, 1175, 1568, 2093, 2794];
  const waves = ['triangle', 'sine'];
  const steps = [.047, .049, .051, .053, .055];
  const volumes = [.0046, .005, .0054, .0058, .0062];
  const toneVolumes = [.00085, .00105, .00125, .00145];
  const toneDurations = [.13, .15, .17, .19, .21];
  const delays = [.178, .188, .198];
  const specs = [];
  for(const wave of waves){
    for(const step of steps){
      for(const volume of volumes){
        for(const toneVolume of toneVolumes){
          for(const toneDuration of toneDurations){
            for(const delay of delays){
              const expectedEnd = Math.max((seq.length * step), delay + toneDuration);
              const expectedGap = Math.abs(expectedEnd - .48);
              const energy = (volume * seq.length * step) + (toneVolume * toneDuration);
              const energyGap = Math.abs(energy - .00155);
              const heuristic = (expectedGap * 8) + (energyGap * 900) + (wave === 'sine' ? .04 : 0);
              const id = [
                'grid',
                wave[0],
                `s${Math.round(step * 1000)}`,
                `v${Math.round(volume * 10000)}`,
                `tv${Math.round(toneVolume * 100000)}`,
                `td${Math.round(toneDuration * 1000)}`,
                `d${Math.round(delay * 1000)}`
              ].join('-');
              specs.push({
                id,
                label: `Grid ${wave} step ${step} volume ${volume} tone ${toneVolume}/${toneDuration}`,
                generated: true,
                generator: {
                  family: 'quiet-held-grid',
                  heuristic: round(heuristic, 5),
                  expectedEnd: round(expectedEnd, 3),
                  expectedEnergy: round(energy, 6),
                  params: { wave, step, volume, toneVolume, toneDuration, delay }
                },
                spec: {
                  seq,
                  step,
                  wave,
                  volume,
                  slide: 20,
                  lpHz: 6500,
                  tones: [{ freq: 3136, duration: toneDuration, wave: 'square', volume: toneVolume, slide: 0, lpHz: 7600, delay }]
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

function segmentedCandidateSpecs(){
  const limit = segmentedGridLimit();
  if(!limit) return [];
  const onsetFreqs = [520, 660, 784];
  const midFreqs = [1047, 1320, 1568];
  const presenceFreqs = [2349, 2637, 3136];
  const onsetDurations = [.14, .16, .18];
  const gaps = [.22, .24, .26];
  const tails = [.09, .11, .13];
  const volumes = [.0048, .0058, .0068, .0078];
  const noiseVolumes = [.00025, .00045, .0007];
  const specs = [];
  for(const onsetFreq of onsetFreqs){
    for(const midFreq of midFreqs){
      for(const presenceFreq of presenceFreqs){
        for(const onsetDuration of onsetDurations){
          for(const gap of gaps){
            for(const tailDuration of tails){
              for(const volume of volumes){
                for(const noiseVolume of noiseVolumes){
                  const bodyDelay = gap;
                  const tailDelay = gap + .085;
                  const end = tailDelay + tailDuration;
                  const lowMidShareProxy = (onsetFreq + midFreq) / Math.max(1, presenceFreq);
                  const durationGap = Math.abs(end - .43);
                  const bandProxyGap = Math.abs(lowMidShareProxy - .62);
                  const energy = (volume * (onsetDuration + .045 + tailDuration)) + (noiseVolume * (.03 + .055));
                  const energyGap = Math.abs(energy - .0022);
                  const heuristic = (durationGap * 7.5) + (bandProxyGap * .32) + (energyGap * 800) + (presenceFreq > 3000 ? .025 : 0);
                  const id = [
                    'seg',
                    `o${onsetFreq}`,
                    `m${midFreq}`,
                    `p${presenceFreq}`,
                    `od${Math.round(onsetDuration * 1000)}`,
                    `g${Math.round(gap * 1000)}`,
                    `td${Math.round(tailDuration * 1000)}`,
                    `v${Math.round(volume * 10000)}`,
                    `n${Math.round(noiseVolume * 100000)}`
                  ].join('-');
                  specs.push({
                    id,
                    label: `Segmented ${onsetFreq}/${midFreq}/${presenceFreq} ${onsetDuration}/${gap}/${tailDuration}`,
                    generated: true,
                    generator: {
                      family: 'segmented-onset-body-tail-grid',
                      heuristic: round(heuristic, 5),
                      expectedEnd: round(end, 3),
                      expectedEnergy: round(energy, 6),
                      target: '3-part reference segmentation: onset 0.000-0.180s, body 0.239-0.279s, tail 0.319-0.429s',
                      params: { onsetFreq, midFreq, presenceFreq, onsetDuration, gap, tailDuration, volume, noiseVolume }
                    },
                    spec: {
                      tones: [
                        { freq: onsetFreq, duration: onsetDuration, wave: 'square', volume: volume * 1.25, slide: 180, detune: .004, lpHz: 4300, delay: 0 },
                        { freq: midFreq, duration: Math.max(.055, onsetDuration * .62), wave: 'triangle', volume: volume * .72, slide: -90, detune: -.003, lpHz: 4700, delay: .018 },
                        { freq: presenceFreq, duration: .045, wave: 'square', volume: volume * .44, slide: -220, detune: .002, lpHz: 6200, delay: bodyDelay },
                        { freq: midFreq * .82, duration: tailDuration, wave: 'triangle', volume: volume * .58, slide: -120, detune: .002, lpHz: 4600, delay: tailDelay },
                        { freq: presenceFreq * .84, duration: Math.max(.04, tailDuration * .58), wave: 'square', volume: volume * .25, slide: -260, lpHz: 6400, delay: tailDelay + .018 }
                      ],
                      noise: [
                        { duration: .03, volume: noiseVolume, hp: 3200, delay: .012 },
                        { duration: .055, volume: noiseVolume * .72, hp: 3600, delay: tailDelay + .01 }
                      ]
                    }
                  });
                }
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

function triangleNeighborhoodCandidateSpecs(){
  const limit = triangleGridLimit();
  if(!limit) return [];
  const seq = [784, 1175, 1568, 2093, 2794];
  const steps = [.046, .048, .05, .052];
  const volumes = [.0076, .0082, .0088, .0094, .0098];
  const toneVolumes = [.0026, .003, .0034, .0038];
  const toneDurations = [.1, .12, .14, .16];
  const delays = [.184, .192, .2];
  const toneFreqs = [2794, 3136, 3520];
  const noiseVolumes = [0, .00025, .00045, .0007];
  const noiseHps = [3200, 4200, 5600];
  const specs = [];
  for(const step of steps){
    for(const volume of volumes){
      for(const toneVolume of toneVolumes){
        for(const toneDuration of toneDurations){
          for(const delay of delays){
            for(const toneFreq of toneFreqs){
              for(const noiseVolume of noiseVolumes){
                for(const noiseHp of noiseHps){
                  if(noiseVolume === 0 && noiseHp !== noiseHps[0]) continue;
                  const expectedEnd = Math.max(seq.length * step, delay + toneDuration, noiseVolume ? delay + .07 : 0);
                  const durationGap = Math.abs(expectedEnd - .43);
                  const energy = (volume * seq.length * step) + (toneVolume * toneDuration) + (noiseVolume * .055);
                  const energyGap = Math.abs(energy - .0026);
                  const brightnessProxy = toneFreq / 3136;
                  const brightnessGap = Math.abs(brightnessProxy - 1);
                  const airProxyGap = noiseVolume ? Math.abs(noiseVolume - .00045) * 130 : .08;
                  const heuristic = (durationGap * 9) + (energyGap * 900) + (brightnessGap * .14) + airProxyGap + (toneVolume > .0034 ? .025 : 0);
                  const id = [
                    'tri',
                    `s${Math.round(step * 1000)}`,
                    `v${Math.round(volume * 10000)}`,
                    `tv${Math.round(toneVolume * 100000)}`,
                    `td${Math.round(toneDuration * 1000)}`,
                    `d${Math.round(delay * 1000)}`,
                    `f${toneFreq}`,
                    `n${Math.round(noiseVolume * 100000)}`,
                    `hp${noiseHp}`
                  ].join('-');
                  specs.push({
                    id,
                    label: `Triangle air neighborhood ${step}/${volume}/${toneVolume}/${toneDuration}/${toneFreq}/${noiseVolume}`,
                    generated: true,
                    generator: {
                      family: 'rms-aware-triangle-air-neighborhood-grid',
                      heuristic: round(heuristic, 5),
                      expectedEnd: round(expectedEnd, 3),
                      expectedEnergy: round(energy, 6),
                      target: 'Preserve the bright-triangle centroid/band improvement while adding a tiny high-pass air layer for Galaga-like presence energy without RMS drift.',
                      params: { step, volume, toneVolume, toneDuration, delay, toneFreq, noiseVolume, noiseHp }
                    },
                    spec: {
                      seq,
                      step,
                      wave: 'triangle',
                      volume,
                      slide: 34,
                      lpHz: 6600,
                      tones: [{ freq: toneFreq, duration: toneDuration, wave: 'triangle', volume: toneVolume, slide: 12, lpHz: 7400, delay }],
                      noise: noiseVolume ? [{ duration: .055, volume: noiseVolume, hp: noiseHp, delay: delay + .018 }] : undefined
                    }
                  });
                }
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

function bandTargetedCandidateSpecs(){
  const limit = bandGridLimit();
  if(!limit) return [];
  const specs = [];
  const baseShapes = [
    {
      name: 'square-top-tail',
      seq: [784, 1175, 1568, 2093, 2794],
      step: .048,
      wave: 'triangle',
      volume: .0076,
      slide: 24,
      lpHz: 7200,
      leadFreq: 3136,
      leadWave: 'square',
      leadDelay: .192
    },
    {
      name: 'triangle-ladder-tail',
      seq: [880, 1175, 1568, 2093, 2794],
      step: .05,
      wave: 'triangle',
      volume: .0082,
      slide: 32,
      lpHz: 7600,
      leadFreq: 3520,
      leadWave: 'triangle',
      leadDelay: .19
    },
    {
      name: 'high-square-stair-tail',
      seq: [932, 1245, 1661, 2217, 2960],
      step: .047,
      wave: 'square',
      volume: .0058,
      slide: 12,
      lpHz: 6800,
      leadFreq: 3520,
      leadWave: 'square',
      leadDelay: .188
    }
  ];
  const leadVolumes = [.0018, .0023, .0028, .0033];
  const tailFrequencies = [3520, 4186, 4699, 5274];
  const tailWaves = ['triangle', 'square'];
  const tailDelays = [.272, .296, .32];
  const tailDurations = [.1, .13, .16, .19];
  const noiseVolumes = [.0007, .0011, .0016, .0021];
  const noiseHps = [3600, 4600, 5600, 6800];
  for(const base of baseShapes){
    for(const leadVolume of leadVolumes){
      for(const tailFreq of tailFrequencies){
        for(const tailWave of tailWaves){
          for(const tailDelay of tailDelays){
            for(const tailDuration of tailDurations){
              for(const noiseVolume of noiseVolumes){
                for(const noiseHp of noiseHps){
                  const sequenceEnd = base.seq.length * base.step;
                  const leadEnd = base.leadDelay + .09;
                  const tailEnd = tailDelay + tailDuration;
                  const noiseEnd = tailDelay + Math.max(.07, tailDuration * .72);
                  const expectedEnd = Math.max(sequenceEnd, leadEnd, tailEnd, noiseEnd);
                  const durationGap = Math.abs(expectedEnd - .48);
                  const energy = (base.volume * base.seq.length * base.step)
                    + (leadVolume * .09)
                    + (leadVolume * .58 * tailDuration)
                    + (noiseVolume * Math.max(.07, tailDuration * .72));
                  const energyGap = Math.abs(energy - .0029);
                  const presencePush = (leadVolume * 150) + (tailWave === 'square' ? .08 : .03) + (noiseVolume * 70);
                  const airPush = (tailFreq / 5200) + (noiseHp / 9000) + (noiseVolume * 80);
                  const lowPenalty = base.wave === 'square' ? .035 : 0;
                  const leadHpHz = Math.round(Math.max(700, Math.min(1800, base.leadFreq * .32)));
                  const tailHpHz = Math.round(Math.max(1100, Math.min(2600, tailFreq * .38)));
                  const heuristic = (durationGap * 8.5) + (energyGap * 760) - (presencePush * .22) - (airPush * .12) + lowPenalty;
                  const id = [
                    'band',
                    base.name,
                    `lv${Math.round(leadVolume * 100000)}`,
                    `tf${tailFreq}`,
                    tailWave[0],
                    `td${Math.round(tailDelay * 1000)}`,
                    `tl${Math.round(tailDuration * 1000)}`,
                    `n${Math.round(noiseVolume * 100000)}`,
                    `hp${noiseHp}`
                  ].join('-');
                  specs.push({
                    id,
                    label: `Band targeted ${base.name} ${tailFreq}/${tailWave}/${noiseVolume}`,
                    generated: true,
                    generator: {
                      family: 'presence-air-band-targeted-grid',
                      heuristic: round(heuristic, 5),
                      expectedEnd: round(expectedEnd, 3),
                      expectedEnergy: round(energy, 6),
                      target: 'Counter the measured Challenge Perfect band gap: reduce low-mid dominance while adding presence_3000_6000 and air_6000_plus energy with a quiet high-frequency tail and tone high-pass filtering.',
                      params: { base: base.name, leadVolume, tailFreq, tailWave, tailDelay, tailDuration, noiseVolume, noiseHp, leadHpHz, tailHpHz }
                    },
                    spec: {
                      seq: base.seq,
                      step: base.step,
                      wave: base.wave,
                      volume: base.volume,
                      slide: base.slide,
                      lpHz: base.lpHz,
                      tones: [
                        { freq: base.leadFreq, duration: .09, wave: base.leadWave, volume: leadVolume, slide: -80, lpHz: 7800, hpHz: leadHpHz, delay: base.leadDelay },
                        { freq: tailFreq, duration: tailDuration, wave: tailWave, volume: leadVolume * .58, slide: -180, lpHz: 8800, hpHz: tailHpHz, delay: tailDelay }
                      ],
                      noise: [
                        { duration: Math.max(.07, tailDuration * .72), volume: noiseVolume, hp: noiseHp, delay: tailDelay + .006 }
                      ]
                    }
                  });
                }
              }
            }
          }
        }
      }
    }
  }
  const harmonicProfiles = [
    { name: 'sine-balanced-air', low: 880, lowMid: 1320, mid: 2093, presence: 3520, air: 5274 },
    { name: 'sine-presence-air', low: 988, lowMid: 1480, mid: 2349, presence: 4186, air: 6272 },
    { name: 'soft-square-presence', low: 784, lowMid: 1175, mid: 2093, presence: 3136, air: 4699 }
  ];
  const profileVolumes = [.0048, .0058, .0068, .0078];
  const airVolumes = [.0014, .002, .0026, .0032];
  const harmonicNoiseVolumes = [.0009, .0013, .0018, .0024];
  for(const profile of harmonicProfiles){
    for(const volume of profileVolumes){
      for(const airVolume of airVolumes){
        for(const noiseVolume of harmonicNoiseVolumes){
          for(const noiseHp of [3800, 5200, 6800]){
            const squarePresence = profile.name.includes('square');
            const expectedEnd = .445;
            const energy = (volume * .255) + (airVolume * .235) + (noiseVolume * .135);
            const energyGap = Math.abs(energy - .0028);
            const presencePush = airVolume * 190 + noiseVolume * 65 + (squarePresence ? .06 : 0);
            const subProxy = volume * (profile.low < 900 ? 24 : 12);
            const heuristic = (energyGap * 760) - (presencePush * .2) + (subProxy * .18) + (noiseHp === 6800 ? -.035 : 0) - .85;
            const id = [
              'band',
              profile.name,
              `v${Math.round(volume * 10000)}`,
              `av${Math.round(airVolume * 10000)}`,
              `n${Math.round(noiseVolume * 100000)}`,
              `hp${noiseHp}`
            ].join('-');
            specs.push({
              id,
              label: `Band targeted ${profile.name} ${volume}/${airVolume}/${noiseVolume}`,
              generated: true,
              generator: {
                family: 'presence-air-harmonic-band-grid',
                heuristic: round(heuristic, 5),
                expectedEnd: round(expectedEnd, 3),
                expectedEnergy: round(energy, 6),
                target: 'Search harmonic, mostly-sine cue shapes that raise presence and air without the sub-band bloom seen in triangle and square ladder candidates, using per-tone high-pass shaping as a measured platform capability.',
                params: { profile: profile.name, volume, airVolume, noiseVolume, noiseHp, toneHpHz: { low: 180, lowMid: 360, mid: 720, presence: 1200, air: 1800 } }
              },
              spec: {
                tones: [
                  { freq: profile.low, duration: .09, wave: 'sine', volume: volume * .58, slide: 30, lpHz: 3600, hpHz: 180, delay: 0 },
                  { freq: profile.lowMid, duration: .12, wave: 'sine', volume: volume, slide: 24, lpHz: 5200, hpHz: 360, delay: .045 },
                  { freq: profile.mid, duration: .115, wave: 'triangle', volume: volume * .82, slide: -40, lpHz: 6800, hpHz: 720, delay: .125 },
                  { freq: profile.presence, duration: .135, wave: squarePresence ? 'square' : 'sine', volume: airVolume, slide: -80, lpHz: 8600, hpHz: 1200, delay: .22 },
                  { freq: profile.air, duration: .125, wave: 'sine', volume: airVolume * .72, slide: -120, lpHz: 9600, hpHz: 1800, delay: .32 }
                ],
                noise: [{ duration: .135, volume: noiseVolume, hp: noiseHp, delay: .304 }]
              }
            });
          }
        }
      }
    }
  }
  return specs
    .sort((a, b) => a.generator.heuristic - b.generator.heuristic || a.id.localeCompare(b.id))
    .slice(0, limit);
}

function segmentAirCandidateSpecs(){
  const limit = segmentAirGridLimit();
  if(!limit) return [];
  const onsetFreqs = [784, 988, 1175];
  const bodyFreqs = [2093, 2637, 3136];
  const tailFreqs = [2349, 3136, 4186];
  const onsetDurations = [.1, .12, .14];
  const bodyDelays = [.226, .238, .25];
  const bodyDurations = [.034, .044, .054];
  const tailDelays = [.306, .318, .33];
  const tailDurations = [.068, .086, .104];
  const baseVolumes = [.0044, .0054, .0064];
  const airVolumes = [.0016, .0022, .0028];
  const noiseVolumes = [0, .00035, .00065];
  const hpProfiles = [
    { name: 'soft', onset: 260, body: 900, tail: 1200 },
    { name: 'clear', onset: 420, body: 1300, tail: 1700 },
    { name: 'air', onset: 620, body: 1700, tail: 2300 }
  ];
  const specs = [];
  for(const onsetFreq of onsetFreqs){
    for(const bodyFreq of bodyFreqs){
      for(const tailFreq of tailFreqs){
        for(const onsetDuration of onsetDurations){
          for(const bodyDelay of bodyDelays){
            for(const bodyDuration of bodyDurations){
              for(const tailDelay of tailDelays){
                for(const tailDuration of tailDurations){
                  if(tailDelay <= bodyDelay + bodyDuration + .018) continue;
                  for(const volume of baseVolumes){
                    for(const airVolume of airVolumes){
                      for(const noiseVolume of noiseVolumes){
                        for(const hp of hpProfiles){
                          const expectedEnd = Math.max(onsetDuration, bodyDelay + bodyDuration, tailDelay + tailDuration, noiseVolume ? tailDelay + .052 : 0);
                          const durationGap = Math.abs(expectedEnd - .42);
                          const roleGap = Math.abs(bodyDelay - .239) + Math.abs(tailDelay - .319) + Math.abs(bodyDuration - .04) + Math.abs(tailDuration - .11);
                          const energy = (volume * onsetDuration) + (airVolume * bodyDuration) + (airVolume * .74 * tailDuration) + (noiseVolume * .052);
                          const energyGap = Math.abs(energy - .00225);
                          const bandProxy = (bodyFreq + tailFreq + hp.body + hp.tail) / Math.max(1, onsetFreq * 4);
                          const bandProxyGap = Math.abs(bandProxy - 1.65);
                          const heuristic = (durationGap * 9)
                            + (roleGap * 6)
                            + (energyGap * 680)
                            + (bandProxyGap * .18)
                            + (noiseVolume ? -.025 : .035)
                            + (hp.name === 'air' ? -.035 : 0);
                          const id = [
                            'segair',
                            `o${onsetFreq}`,
                            `b${bodyFreq}`,
                            `t${tailFreq}`,
                            `od${Math.round(onsetDuration * 1000)}`,
                            `bd${Math.round(bodyDelay * 1000)}`,
                            `bl${Math.round(bodyDuration * 1000)}`,
                            `td${Math.round(tailDelay * 1000)}`,
                            `tl${Math.round(tailDuration * 1000)}`,
                            `v${Math.round(volume * 10000)}`,
                            `av${Math.round(airVolume * 10000)}`,
                            `n${Math.round(noiseVolume * 100000)}`,
                            hp.name
                          ].join('-');
                          specs.push({
                            id,
                            label: `Segment-air ${onsetFreq}/${bodyFreq}/${tailFreq} ${bodyDelay}/${tailDelay}`,
                            generated: true,
                            generator: {
                              family: 'compact-highpass-segment-air-grid',
                              heuristic: round(heuristic, 5),
                              expectedEnd: round(expectedEnd, 3),
                              expectedEnergy: round(energy, 6),
                              target: 'Preserve exact onset/body/tail reference roles while reducing sub/low-mid dominance and adding presence/air energy through high-pass tone shaping.',
                              params: { onsetFreq, bodyFreq, tailFreq, onsetDuration, bodyDelay, bodyDuration, tailDelay, tailDuration, volume, airVolume, noiseVolume, hp }
                            },
                            spec: {
                              tones: [
                                { freq: onsetFreq, duration: onsetDuration, wave: 'triangle', volume, slide: 48, lpHz: 5200, hpHz: hp.onset, delay: 0 },
                                { freq: bodyFreq, duration: bodyDuration, wave: 'square', volume: airVolume, slide: -120, lpHz: 8200, hpHz: hp.body, delay: bodyDelay },
                                { freq: tailFreq, duration: tailDuration, wave: 'triangle', volume: airVolume * .74, slide: -160, lpHz: 9000, hpHz: hp.tail, delay: tailDelay }
                              ],
                              noise: noiseVolume ? [{ duration: .052, volume: noiseVolume, hp: 5200, delay: tailDelay + .006 }] : undefined
                            }
                          });
                        }
                      }
                    }
                  }
                }
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

function mean(values){
  const numeric = values.filter(value => Number.isFinite(+value)).map(Number);
  return numeric.length ? numeric.reduce((sum, value) => sum + value, 0) / numeric.length : null;
}

function meanBandEnergy(items){
  const keys = ['sub_500', 'low_mid_500_1500', 'mid_1500_3000', 'presence_3000_6000', 'air_6000_plus'];
  const band = {};
  for(const key of keys){
    band[key] = round(mean(items.map(item => item?.[key])), 4);
  }
  return band;
}

function bandEnergyDelta(active, reference){
  const keys = ['sub_500', 'low_mid_500_1500', 'mid_1500_3000', 'presence_3000_6000', 'air_6000_plus'];
  const delta = {};
  for(const key of keys){
    delta[key] = round((active?.[key] ?? 0) - (reference?.[key] ?? 0), 4);
  }
  return delta;
}

function stddev(values){
  const numeric = values.filter(value => Number.isFinite(+value)).map(Number);
  if(numeric.length < 2) return 0;
  const avg = mean(numeric);
  return Math.sqrt(numeric.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / numeric.length);
}

function riskBreakdown(comparison){
  const durationGap = +comparison.duration_s || 0;
  const centroidGap = +comparison.spectral_centroid_hz || 0;
  const zcrGap = +comparison.zero_crossings_per_s || 0;
  const rmsGap = +comparison.rms || 0;
  const bandShapeGap = +comparison.band_shape_distance || 0;
  const rolloffGap = +comparison.spectral_rolloff_85_hz || 0;
  const envelopeGap = (
    clamp((+comparison.attack_peak_position || 0) / .5, 0, 1) +
    clamp((+comparison.decay_ratio || 0) / 1.4, 0, 1) +
    clamp((+comparison.burst_share || 0) / .5, 0, 1)
  ) / 3;
  const parts = {
    duration: clamp(durationGap / 3, 0, 2.7),
    centroid: clamp(centroidGap / 550, 0, 2.25),
    zeroCrossing: clamp(zcrGap / 1300, 0, 1.65),
    rms: clamp(rmsGap / .15, 0, 1.15),
    bandShape: clamp(bandShapeGap / .55, 0, 1.45),
    rolloff: clamp(rolloffGap / 2600, 0, 1.05),
    envelope: clamp(envelopeGap, 0, 1.15),
    floor: .35
  };
  const scaled = Object.fromEntries(Object.entries(parts).map(([key, value]) => [key, round(value * 1.05, 3)]));
  const risk10 = round(clamp(Object.values(parts).reduce((sum, value) => sum + value, 0) * 1.05, 0, 10), 2);
  const dominant = Object.entries(scaled)
    .filter(([key]) => key !== 'floor')
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';
  return { risk10, components: scaled, dominant };
}

function riskFromComparison(comparison){
  return riskBreakdown(comparison).risk10;
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
      worstSegmentExactRoleMatch: false,
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
    worstSegmentExactRoleMatch: !!worst.auroraExactRoleMatch,
    worstSegmentInterpretation: worst.interpretation || ''
  };
}

function rejectionFor(row, baseline){
  if(!baseline) return 'missing-baseline';
  const riskDelta = round(baseline.risk10 - row.risk10, 3);
  const segmentRiskDelta = Number.isFinite(+baseline.worstSegmentRisk10) && Number.isFinite(+row.worstSegmentRisk10)
    ? round(+baseline.worstSegmentRisk10 - +row.worstSegmentRisk10, 3)
    : null;
  const centroidDelta = round(baseline.centroidGapHz - row.centroidGapHz, 1);
  const rmsDelta = round(baseline.rmsGap - row.rmsGap, 4);
  const bandDelta = round((baseline.bandShapeGap ?? 0) - (row.bandShapeGap ?? 0), 4);
  const reasons = [];
  if(row.durationGapSeconds > .08) reasons.push(`duration gap ${row.durationGapSeconds}s > 0.08s`);
  if(segmentRiskDelta !== null && segmentRiskDelta < .35) reasons.push(`segment risk improvement ${segmentRiskDelta} < 0.35`);
  if(segmentRiskDelta === null && riskDelta < .25) reasons.push(`risk improvement ${riskDelta} < 0.25`);
  if(centroidDelta <= 0) reasons.push(`centroid did not improve (${centroidDelta} Hz)`);
  if(rmsDelta < -.01) reasons.push(`RMS worsened by ${Math.abs(rmsDelta)}`);
  if(bandDelta < -.04) reasons.push(`spectral band shape worsened by ${Math.abs(bandDelta)}`);
  if((row.exactSegmentRoleMatchCount || 0) < (baseline.exactSegmentRoleMatchCount || 0)) reasons.push('fewer exact segment-role matches than baseline');
  return reasons.length ? reasons.join('; ') : 'clears keeper gates';
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
    .sort((a, b) => (a.worstSegmentRisk10 ?? a.risk10) - (b.worstSegmentRisk10 ?? b.risk10) || a.risk10 - b.risk10 || a.rmsGap - b.rmsGap || a.centroidGapHz - b.centroidGapHz)[0] || null;
  const gated = candidates
    .filter(row => row.durationGapSeconds <= .08)
    .map(row => {
      const riskDelta = round(baseline.risk10 - row.risk10, 3);
      const segmentRiskDelta = Number.isFinite(+baseline.worstSegmentRisk10) && Number.isFinite(+row.worstSegmentRisk10)
        ? round(+baseline.worstSegmentRisk10 - +row.worstSegmentRisk10, 3)
        : null;
      const centroidDelta = round(baseline.centroidGapHz - row.centroidGapHz, 1);
      const rmsDelta = round(baseline.rmsGap - row.rmsGap, 4);
      const bandDelta = round((baseline.bandShapeGap ?? 0) - (row.bandShapeGap ?? 0), 4);
      const exactSegmentRoleMatchDelta = (row.exactSegmentRoleMatchCount || 0) - (baseline.exactSegmentRoleMatchCount || 0);
      return { row, riskDelta, segmentRiskDelta, centroidDelta, rmsDelta, bandDelta, exactSegmentRoleMatchDelta };
    })
    .filter(item => (item.segmentRiskDelta === null ? item.riskDelta >= .25 : item.segmentRiskDelta >= .35)
      && item.riskDelta >= -.25
      && item.centroidDelta > 0
      && item.rmsDelta >= -.01
      && item.bandDelta >= -.04
      && item.exactSegmentRoleMatchDelta >= 0)
    .sort((a, b) => (b.segmentRiskDelta ?? b.riskDelta) - (a.segmentRiskDelta ?? a.riskDelta) || b.riskDelta - a.riskDelta || b.centroidDelta - a.centroidDelta || b.bandDelta - a.bandDelta || b.rmsDelta - a.rmsDelta);
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
  const segmentRiskDelta = Number.isFinite(+baseline.worstSegmentRisk10) && Number.isFinite(+best.worstSegmentRisk10)
    ? round(+baseline.worstSegmentRisk10 - +best.worstSegmentRisk10, 3)
    : null;
  const centroidDelta = round(baseline.centroidGapHz - best.centroidGapHz, 1);
  const rmsDelta = round(baseline.rmsGap - best.rmsGap, 4);
  const bandDelta = round((baseline.bandShapeGap ?? 0) - (best.bandShapeGap ?? 0), 4);
  return {
    status: 'candidate-recommended',
    keep: true,
    baseline: baseline.id,
    best: best.id,
    measuredBest: measuredBest?.id || null,
    riskDelta,
    segmentRiskDelta,
    centroidDelta,
    rmsDelta,
    bandDelta,
    reason: 'Selected candidate clears segment-risk, whole-cue-risk, centroid, RMS, band-shape, segment-role, and duration gates. The measured-lowest-risk candidate is tracked separately so the next sweep can still learn from it.'
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
      spectral_spread_hz: round(mean(group.map(row => row.comparison.spectral_spread_hz)), 1),
      spectral_rolloff_85_hz: round(mean(group.map(row => row.comparison.spectral_rolloff_85_hz)), 1),
      spectral_flatness: round(mean(group.map(row => row.comparison.spectral_flatness)), 4),
      band_shape_distance: round(mean(group.map(row => row.comparison.band_shape_distance)), 4),
      attack_peak_position: round(mean(group.map(row => row.comparison.attack_peak_position)), 3),
      decay_ratio: round(mean(group.map(row => row.comparison.decay_ratio)), 3),
      envelope_contrast: round(mean(group.map(row => row.comparison.envelope_contrast)), 3),
      burst_share: round(mean(group.map(row => row.comparison.burst_share)), 3)
    };
    const breakdown = riskBreakdown(avgComparison);
    const activeBandEnergy = meanBandEnergy(group.map(row => row.activeMetrics.band_energy));
    const referenceBandEnergy = meanBandEnergy(group.map(row => row.referenceMetrics.band_energy));
    rows.push({
      id,
      label: first.baseLabel || first.label,
      generated: !!first.generated,
      generator: first.generator || null,
      risk10: breakdown.risk10,
      riskBreakdown: breakdown.components,
      dominantPenalty: breakdown.dominant,
      durationGapSeconds: avgComparison.duration_s,
      centroidGapHz: avgComparison.spectral_centroid_hz,
      zeroCrossingGapPerSecond: avgComparison.zero_crossings_per_s,
      rmsGap: avgComparison.rms,
      bandShapeGap: avgComparison.band_shape_distance,
      rolloffGapHz: avgComparison.spectral_rolloff_85_hz,
      envelopeShapeGap: round(mean([
        clamp((+avgComparison.attack_peak_position || 0) / .5, 0, 1),
        clamp((+avgComparison.decay_ratio || 0) / 1.4, 0, 1),
        clamp((+avgComparison.burst_share || 0) / .5, 0, 1)
      ]), 3),
      segmentRoleComparisonCount: Math.round(mean(group.map(row => row.segmentRoleComparisonCount || 0)) || 0),
      averageSegmentRisk10: round(mean(group.map(row => row.averageSegmentRisk10)), 2),
      worstSegmentRisk10: round(mean(group.map(row => row.worstSegmentRisk10)), 2),
      worstSegmentRole: group.slice().sort((a, b) => (+b.worstSegmentRisk10 || 0) - (+a.worstSegmentRisk10 || 0))[0]?.worstSegmentRole || '',
      exactSegmentRoleMatchCount: Math.round(mean(group.map(row => row.exactSegmentRoleMatchCount || 0)) || 0),
      worstSegmentExactRoleMatch: group.some(row => row.worstSegmentExactRoleMatch),
      worstSegmentInterpretation: group.slice().sort((a, b) => (+b.worstSegmentRisk10 || 0) - (+a.worstSegmentRisk10 || 0))[0]?.worstSegmentInterpretation || '',
      activeMetrics: {
        duration_s: round(mean(group.map(row => row.activeMetrics.duration_s)), 3),
        peak: round(mean(group.map(row => row.activeMetrics.peak)), 4),
        rms: round(mean(group.map(row => row.activeMetrics.rms)), 4),
        spectral_centroid_hz: round(mean(group.map(row => row.activeMetrics.spectral_centroid_hz)), 1),
        zero_crossings_per_s: round(mean(group.map(row => row.activeMetrics.zero_crossings_per_s)), 1),
        spectral_rolloff_85_hz: round(mean(group.map(row => row.activeMetrics.spectral_rolloff_85_hz)), 1),
        spectral_flatness: round(mean(group.map(row => row.activeMetrics.spectral_flatness)), 4),
        band_energy: activeBandEnergy,
        attack_peak_position: round(mean(group.map(row => row.activeMetrics.attack_peak_position)), 3),
        decay_ratio: round(mean(group.map(row => row.activeMetrics.decay_ratio)), 3),
        burst_share: round(mean(group.map(row => row.activeMetrics.burst_share)), 3)
      },
      referenceMetrics: {
        band_energy: referenceBandEnergy
      },
      bandEnergyDelta: bandEnergyDelta(activeBandEnergy, referenceBandEnergy),
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
        rmsGap: row.rmsGap,
        bandShapeGap: row.bandShapeGap,
        bandEnergyDelta: row.bandEnergyDelta,
        envelopeShapeGap: row.envelopeShapeGap,
        worstSegmentRisk10: row.worstSegmentRisk10,
        worstSegmentRole: row.worstSegmentRole,
        exactSegmentRoleMatchCount: row.exactSegmentRoleMatchCount
      }))
    });
  }
  return rows.sort((a, b) => (a.worstSegmentRisk10 ?? a.risk10) - (b.worstSegmentRisk10 ?? b.risk10) || a.risk10 - b.risk10 || a.durationGapSeconds - b.durationGapSeconds);
}

function annotateRejections(rows){
  const baseline = rows.find(row => row.id === 'baseline-current');
  return rows.map(row => Object.assign(row, {
    keeperRead: row.id === 'baseline-current' ? 'baseline' : rejectionFor(row, baseline)
  }));
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
    '| Candidate | Risk /10 | Worst segment | Exact roles | Dominant penalty | Duration Gap | Centroid Gap | Band Shape | Envelope | RMS Gap | Stability | Keeper read |',
    '| --- | ---: | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |'
  ];
  for(const row of report.candidates){
    const stability = row.stability ? `${row.stability.repetitions}x, risk sd ${row.stability.riskStd}` : '1x';
    lines.push(`| ${row.label} | ${row.risk10} | ${row.worstSegmentRole || 'n/a'} ${row.worstSegmentRisk10 ?? 'n/a'} | ${row.exactSegmentRoleMatchCount ?? 'n/a'}/${row.segmentRoleComparisonCount ?? 'n/a'} | ${row.dominantPenalty || 'n/a'} | ${row.durationGapSeconds}s | ${row.centroidGapHz} Hz | ${row.bandShapeGap ?? 'n/a'} | ${row.envelopeShapeGap ?? 'n/a'} | ${row.rmsGap} | ${stability} | ${row.keeperRead || ''} |`);
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
    const breakdown = riskBreakdown(comparison);
    const segments = segmentSummary(item.segmentRoleComparisons);
    return {
      id: item.id,
      label: item.label,
      baseLabel: spec?.label || item.label.replace(/ r\d+$/, ''),
      repetition: Number((String(item.id).match(/-r(\d+)$/) || [])[1] || 1),
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
        clamp((+comparison.attack_peak_position || 0) / .5, 0, 1),
        clamp((+comparison.decay_ratio || 0) / 1.4, 0, 1),
        clamp((+comparison.burst_share || 0) / .5, 0, 1)
      ]), 3),
      ...segments,
      activeMetrics: item.variants.aurora.activeMetrics,
      referenceMetrics: item.variants.reference.activeMetrics,
      comparison
    };
  }).sort((a, b) => a.risk10 - b.risk10 || a.durationGapSeconds - b.durationGapSeconds);
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
    generator: generatorSummary(rows),
    problem: 'Challenge Perfect is now the highest Aurora audio segment-level event-gap risk: duration is broadly aligned, but the reference onset/body/tail sub-events are collapsing into a single runtime segment.',
    strategy: 'Generate a bounded set of synthetic cue specs, capture each through the live browser audio engine, compare against the same Galaga reference window, and recommend promotion only if measured segment risk drops without whole-cue or duration regressions. The comparison now includes role-by-role onset/body/tail segmentation, spectral band-shape, rolloff, envelope segmentation, and optional tone high-pass shaping so future searches can target measured sub-event structure instead of only duration and centroid.',
    successMeasure: 'A keeper must reduce worst segment risk by at least 0.35, avoid materially worsening whole-cue risk, reduce centroid gap, avoid materially increasing RMS or band-shape gap, preserve exact segment-role matches, and keep active duration within 0.08s of the reference.',
    source: {
      comparisonSet: set.id,
      referenceClip: set.referenceClip,
      referenceWindow: set.referenceWindow || null,
      referenceSegmentation,
      manifest: rel(manifestPath),
      metrics: rel(metricsPath)
    },
    sampleCandidates: sampleRows,
    candidates: rows,
    decision,
    nextStep: decision.keep
      ? 'Promote the recommended cue spec into the Aurora application audio theme, then run the full audio theme comparison and event-gap analysis.'
      : segmentedGridLimit()
        ? 'Use the segmented-family result to retune onset/body/tail synthesis parameters, then run another bounded segmented sweep before changing runtime audio.'
        : segmentAirGridLimit()
          ? 'Use the compact high-pass segment-air result to decide whether synthesized cue roles can satisfy both segmentation and band-shape gates, or whether this event needs a reference-clip/subclip playback strategy.'
        : bandGridLimit()
          ? 'Use the band-family result to decide whether tone filtering is enough or whether the next audio platform investment should be envelope shaping or reference-clip playback for this event.'
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
      worstSegmentRisk10: row.worstSegmentRisk10,
      worstSegmentRole: row.worstSegmentRole,
      exactSegmentRoleMatchCount: row.exactSegmentRoleMatchCount,
      dominantPenalty: row.dominantPenalty,
      centroidGapHz: row.centroidGapHz,
      bandShapeGap: row.bandShapeGap,
      envelopeShapeGap: row.envelopeShapeGap,
      rmsGap: row.rmsGap,
      durationGapSeconds: row.durationGapSeconds,
      keeperRead: row.keeperRead
    }))
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
