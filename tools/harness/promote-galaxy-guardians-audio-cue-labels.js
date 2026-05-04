#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const CANDIDATES = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'audio-isolated-cue-candidates-0.1.json');
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'audio-labeled-cue-targets-0.1');
const OUT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'audio-labeled-cue-targets-0.1.json');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function run(cmd, args, opts = {}){
  const result = spawnSync(cmd, args, Object.assign({
    cwd: ROOT,
    encoding: opts.encoding || 'utf8',
    maxBuffer: opts.maxBuffer || 1024 * 1024 * 256,
    timeout: 1000 * 60 * 5
  }, opts));
  if(result.status !== 0){
    throw new Error(`${cmd} failed\nargs: ${args.join(' ')}\n${result.stderr || result.stdout || ''}`);
  }
  return result.stdout;
}

function rounded(value, places = 3){
  const scale = 10 ** places;
  return Math.round((+value || 0) * scale) / scale;
}

function scoreCandidate(candidate, label){
  const windowId = String(candidate.windowId || '');
  const family = String(candidate.family || '');
  let score = 0;
  if(label.windowHints.some(hint => windowId.includes(hint))) score += 5;
  if(label.families.includes(family)) score += 5;
  score -= Math.abs((candidate.durationSeconds || 0) - label.durationTarget) * 8;
  score -= Math.abs((candidate.zeroCrossingsPerSecond || 0) - label.zeroCrossingTarget) / 1200;
  score += Math.min(2, (candidate.peak || 0) * 4);
  score += Math.min(1.5, (candidate.envelopeContrast || 0) / 2);
  return score;
}

function exportCuePreview(sourcePath, cue){
  const safeStart = Math.max(0, cue.absoluteStartSeconds - .035);
  const duration = Math.max(.18, cue.durationSeconds + .085);
  const base = path.join(OUT_DIR, cue.cueName);
  const waveform = `${base}-waveform.png`;
  const spectrogram = `${base}-spectrogram.png`;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  run('ffmpeg', [
    '-v', 'error',
    '-ss', String(safeStart),
    '-t', String(duration),
    '-i', sourcePath,
    '-filter_complex', 'showwavespic=s=640x140:colors=cyan',
    '-frames:v', '1',
    '-y',
    waveform
  ]);
  run('ffmpeg', [
    '-v', 'error',
    '-ss', String(safeStart),
    '-t', String(duration),
    '-i', sourcePath,
    '-lavfi', 'showspectrumpic=s=640x260:legend=0:color=intensity',
    '-frames:v', '1',
    '-y',
    spectrogram
  ]);
  return { waveform: rel(waveform), spectrogram: rel(spectrogram) };
}

function measuredTargets(candidate, label){
  const zcFrequencyProxy = Math.max(60, Math.round((candidate.zeroCrossingsPerSecond || 0) / 2));
  const duration = candidate.durationSeconds || label.durationTarget;
  const bandSlack = label.durationSlack || .025;
  const peakSlack = label.peakSlack || Math.max(45, zcFrequencyProxy * .28);
  return {
    measuredDurationSeconds: rounded(duration),
    measuredZeroCrossingFrequencyProxyHz: zcFrequencyProxy,
    measuredEnvelopeContrast: candidate.envelopeContrast,
    measuredDecayRatio: candidate.decayRatio,
    measuredPeak: candidate.peak,
    suggestedDurationBandSeconds: [
      rounded(Math.max(.018, duration - bandSlack)),
      rounded(duration + bandSlack)
    ],
    suggestedFrequencyProxyBandHz: [
      Math.max(50, Math.round(zcFrequencyProxy - peakSlack)),
      Math.round(zcFrequencyProxy + peakSlack)
    ],
    runtimeUse: label.runtimeUse
  };
}

function main(){
  if(!fs.existsSync(CANDIDATES)) fail('Missing Guardians cue candidate artifact.');
  const artifact = readJson(CANDIDATES);
  const sourceById = Object.fromEntries((artifact.sourceEvidence?.sourceReads || []).map(source => [source.sourceId, source.localPath]));
  const labels = [
    { cueName:'playerShot', semanticLabel:'player single shot / fire tick', families:['shot-or-hit-click','short-hit-or-enemy-shot'], windowHints:['player-single-shot'], durationTarget:.035, durationSlack:.018, zeroCrossingTarget:4100, runtimeUse:'short high dry square/noise zap' },
    { cueName:'enemyShot', semanticLabel:'alien shot / low tick', families:['short-hit-or-enemy-shot'], windowHints:['flagship','lower-field','player-single-shot'], durationTarget:.08, durationSlack:.025, zeroCrossingTarget:1900, runtimeUse:'shorter low dry square/noise tick' },
    { cueName:'scoutDive', semanticLabel:'solo scout dive pressure', families:['dive-pressure-mix'], windowHints:['lower-field-dive','flagship-escort'], durationTarget:.09, durationSlack:.035, zeroCrossingTarget:2600, runtimeUse:'stacked descending square siren onset' },
    { cueName:'flagshipDive', semanticLabel:'flagship / escort dive pressure', families:['dive-pressure-mix'], windowHints:['flagship-escort','lower-field-dive'], durationTarget:.1, durationSlack:.04, zeroCrossingTarget:3200, runtimeUse:'longer descending command siren' },
    { cueName:'scoutHit', semanticLabel:'small alien hit click', families:['shot-or-hit-click'], windowHints:['wrap-return','level-clear'], durationTarget:.025, durationSlack:.015, zeroCrossingTarget:1900, runtimeUse:'tiny dry hit snap' },
    { cueName:'escortHit', semanticLabel:'escort hit snap', families:['short-hit-or-enemy-shot'], windowHints:['player-single-shot','complete-rack'], durationTarget:.08, durationSlack:.024, zeroCrossingTarget:3200, runtimeUse:'short role-separated hit snap' },
    { cueName:'flagshipHit', semanticLabel:'flagship hit / score snap', families:['short-hit-or-enemy-shot','dive-pressure-mix'], windowHints:['level-clear','lower-field-dive'], durationTarget:.1, durationSlack:.032, zeroCrossingTarget:3800, runtimeUse:'longer command hit break' },
    { cueName:'playerLoss', semanticLabel:'loss / descending failure sweep', families:['dive-or-loss-sweep'], windowHints:['wrap-return','level-clear'], durationTarget:.2, durationSlack:.055, zeroCrossingTarget:3600, runtimeUse:'falling square/noise loss cue' }
  ];
  const candidates = artifact.candidates || [];
  const used = new Set();
  const promoted = labels.map(label => {
    const selected = candidates
      .filter(candidate => !used.has(candidate.candidateId))
      .map(candidate => ({ candidate, score: scoreCandidate(candidate, label) }))
      .sort((a, b) => b.score - a.score)[0]?.candidate;
    if(!selected) fail(`No candidate could be promoted for ${label.cueName}`, { label });
    used.add(selected.candidateId);
    const sourcePath = sourceById[selected.sourceId];
    if(!sourcePath || !fs.existsSync(sourcePath)) fail(`Missing source video for ${selected.cueName}`, { selected, sourcePath });
    const previews = exportCuePreview(sourcePath, Object.assign({ cueName: label.cueName }, selected));
    return Object.assign({
      cueName: label.cueName,
      semanticLabel: label.semanticLabel,
      candidateId: selected.candidateId,
      sourceId: selected.sourceId,
      windowId: selected.windowId,
      absoluteStartSeconds: selected.absoluteStartSeconds,
      durationSeconds: selected.durationSeconds,
      family: selected.family,
      manualLabelConfidence: label.cueName === 'playerLoss' ? 'medium' : 'candidate',
      reviewStatus: 'promoted-window-needs-human-audio-review',
      previews
    }, measuredTargets(selected, label));
  });
  const output = {
    gameKey: 'galaxy-guardians-preview',
    artifactType: 'labeled-audio-cue-targets',
    version: '0.1-dev-preview',
    createdOn: '2026-05-03',
    status: 'labeled-cue-windows-not-raw-audio-export',
    generatedBy: 'tools/harness/promote-galaxy-guardians-audio-cue-labels.js',
    sourceEvidence: {
      cueCandidates: rel(CANDIDATES),
      note: 'This artifact stores reproducible source-video windows and waveform/spectrogram previews, not raw copyrighted audio snippets.'
    },
    promotedCueWindows: promoted,
    summary: {
      promotedCueCount: promoted.length,
      sourceCount: new Set(promoted.map(cue => cue.sourceId)).size,
      familyCount: new Set(promoted.map(cue => cue.family)).size,
      weakestPromotion: promoted.find(cue => cue.manualLabelConfidence !== 'candidate')?.cueName || ''
    },
    nextPromotion: 'Human-listen the promoted windows, mark clean/dirty cue labels, then replace synthetic runtime cue bands with measured cue-specific targets.'
  };
  writeJson(OUT, output);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    promotedCueCount: output.summary.promotedCueCount,
    sourceCount: output.summary.sourceCount,
    familyCount: output.summary.familyCount,
    outputDir: rel(OUT_DIR)
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}
