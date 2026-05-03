#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = 'reference-artifacts/analyses/galaxy-guardians-identity/audio-cue-targets-0.1.json';
const PACK_SOURCE = 'src/js/13-galaxy-guardians-game-pack.js';

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(relPath){
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function exists(relPath){
  return fs.existsSync(path.join(ROOT, relPath));
}

function loadPack(){
  const sandbox = {};
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(`${fs.readFileSync(path.join(ROOT, PACK_SOURCE), 'utf8')}\nthis.GALAXY_GUARDIANS_PACK=GALAXY_GUARDIANS_PACK;`, sandbox, { filename: PACK_SOURCE });
  return sandbox.GALAXY_GUARDIANS_PACK;
}

function flattenTones(cue){
  const tones = [];
  if(Array.isArray(cue?.tones)) tones.push(...cue.tones);
  if(Array.isArray(cue?.seq)){
    cue.seq.forEach((freq, index) => tones.push({
      freq,
      duration: cue.step || 0,
      delay: index * (cue.step || 0),
      wave: cue.wave,
      slide: cue.slide || 0
    }));
  }
  if(cue?.variants?.[0]) tones.push(...flattenTones(cue.variants[0]));
  return tones;
}

function cueDuration(cue, tones){
  const toneEnds = tones.map(tone => (+tone.delay || 0) + (+tone.duration || 0));
  const noiseEnds = Array.isArray(cue?.noise) ? cue.noise.map(noise => (+noise.delay || 0) + (+noise.duration || 0)) : [];
  return Math.max(0, ...toneEnds, ...noiseEnds);
}

function cueMetrics(cue){
  const tones = flattenTones(cue);
  const freqs = tones.map(tone => +tone.freq || 0).filter(Boolean);
  const first = freqs[0] || 0;
  const last = freqs.at(-1) || 0;
  const waves = Array.from(new Set(tones.map(tone => tone.wave || '').filter(Boolean))).sort();
  return {
    toneCount: tones.length,
    noiseCount: Array.isArray(cue?.noise) ? cue.noise.length : 0,
    totalDurationSeconds: +cueDuration(cue, tones).toFixed(3),
    firstFrequencyHz: first,
    lastFrequencyHz: last,
    peakFrequencyHz: freqs.length ? Math.max(...freqs) : 0,
    minFrequencyHz: freqs.length ? Math.min(...freqs) : 0,
    frequencyDropHz: +(first - last).toFixed(1),
    waveFamilies: waves,
    squareToneShare: tones.length ? +(tones.filter(tone => tone.wave === 'square').length / tones.length).toFixed(3) : 0,
    hasDetune: tones.some(tone => Math.abs(+tone.detune || 0) > 0),
    hasSlide: tones.some(tone => Math.abs(+tone.slide || 0) > 0)
  };
}

function inBand(value, band){
  return Number.isFinite(+value) && Array.isArray(band) && +value >= band[0] && +value <= band[1];
}

function main(){
  const artifact = readJson(ARTIFACT);
  const pack = loadPack();
  const cues = pack.audioThemes?.['guardians-signal']?.cues || {};
  const metrics = Object.fromEntries(Object.keys(cues).map(name => [name, cueMetrics(cues[name])]));
  const payload = {
    artifact: ARTIFACT,
    status: artifact.status,
    themeId: pack.audioThemes?.['guardians-signal']?.id || '',
    metrics
  };

  if(pack.metadata?.gameKey !== artifact.gameKey){
    fail('Guardians audio cue targets are not linked to the preview pack', payload);
  }
  if(artifact.status !== 'playtest-weighted-hardware-cue-targets-not-final-isolated-match'){
    fail('Guardians audio cue target artifact has the wrong status', payload);
  }
  for(const relPath of Object.values(artifact.sourceEvidence || {}).filter(value => String(value).includes('/'))){
    if(!exists(relPath)) fail(`Guardians audio cue target references missing evidence: ${relPath}`, payload);
  }

  const cueTargets = artifact.cueTargets || {};
  for(const [cueName, target] of Object.entries(cueTargets)){
    const cue = cues[cueName];
    const metric = metrics[cueName];
    if(!cue || !metric) fail(`Guardians audio cue target missing cue ${cueName}`, payload);
    if(!inBand(metric.totalDurationSeconds, target.durationBandSeconds)){
      fail(`Guardians audio cue ${cueName} duration is outside target band`, { cueName, target, metric, payload });
    }
    if(target.peakFrequencyBandHz && !inBand(metric.peakFrequencyHz, target.peakFrequencyBandHz)){
      fail(`Guardians audio cue ${cueName} peak frequency is outside target band`, { cueName, target, metric, payload });
    }
    if(target.minimumFrequencyDropHz && metric.frequencyDropHz < target.minimumFrequencyDropHz){
      fail(`Guardians audio cue ${cueName} does not descend far enough`, { cueName, target, metric, payload });
    }
    if(target.mustDescend && metric.lastFrequencyHz >= metric.firstFrequencyHz){
      fail(`Guardians audio cue ${cueName} must descend`, { cueName, target, metric, payload });
    }
    if(target.requiresNoise && metric.noiseCount < 1){
      fail(`Guardians audio cue ${cueName} is missing hardware-noise layer`, { cueName, target, metric, payload });
    }
    if(target.minimumToneCount && metric.toneCount < target.minimumToneCount){
      fail(`Guardians audio cue ${cueName} has too few tones`, { cueName, target, metric, payload });
    }
    if(target.mustIncludeWave && !metric.waveFamilies.includes(target.mustIncludeWave)){
      fail(`Guardians audio cue ${cueName} is missing required wave ${target.mustIncludeWave}`, { cueName, target, metric, payload });
    }
  }

  const requiredNoisy = artifact.globalTargets?.requiredNoisyCueNames || [];
  const noisyCueCount = requiredNoisy.filter(name => metrics[name]?.noiseCount > 0).length;
  if(noisyCueCount < artifact.globalTargets.minimumNoisyCueCount){
    fail('Guardians audio target did not preserve enough noisy hardware cues', payload);
  }
  const targetMetrics = Object.keys(cueTargets).map(name => metrics[name]).filter(Boolean);
  const squareShare = targetMetrics.length
    ? targetMetrics.reduce((sum, metric) => sum + metric.squareToneShare, 0) / targetMetrics.length
    : 0;
  if(squareShare < artifact.globalTargets.minimumSquareCueShare){
    fail('Guardians audio target square-wave share is too low', Object.assign({ squareShare }, payload));
  }
  for(const wave of artifact.globalTargets.forbiddenDominantWaves || []){
    if(targetMetrics.some(metric => metric.waveFamilies[0] === wave)){
      fail(`Guardians audio target has forbidden dominant wave ${wave}`, payload);
    }
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: ARTIFACT,
    targetCueCount: Object.keys(cueTargets).length,
    noisyCueCount,
    squareShare: +squareShare.toFixed(3),
    weakestCue: Object.entries(cueTargets).map(([name]) => [name, metrics[name]]).find(([, metric]) => !metric.noiseCount)?.[0] || ''
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}
