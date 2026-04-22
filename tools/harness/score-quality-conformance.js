#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'quality-conformance');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function clamp(value, min, max){
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 2){
  if(value == null || Number.isNaN(value)) return null;
  return +value.toFixed(digits);
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function collectFiles(root, targetName){
  const found = [];
  function walk(dir){
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === targetName) found.push(full);
    }
  }
  walk(root);
  return found.sort();
}

function latestReport(dir){
  const full = path.join(ROOT, dir);
  const found = collectFiles(full, 'report.json');
  if(!found.length) fail(`missing report files in ${dir}`);
  return found[found.length - 1];
}

function latestMetrics(dir){
  const full = path.join(ROOT, dir);
  const found = collectFiles(full, 'metrics.json');
  if(!found.length) fail(`missing metrics files in ${dir}`);
  return found[found.length - 1];
}

function runScript(script, args = []){
  const run = spawnSync(process.execPath, [path.join(__dirname, script), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 1000 * 60 * 12,
    maxBuffer: 1024 * 1024 * 20
  });
  if(run.status !== 0){
    fail(`script failed: ${script}`, {
      status: run.status,
      signal: run.signal,
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
  return run.stdout.trim() ? JSON.parse(run.stdout) : { ok: true };
}

function closeness(value, target, tolerance){
  if(value == null || target == null) return 0;
  return clamp(1 - (Math.abs(value - target) / Math.max(tolerance, 0.001)), 0, 1);
}

function scoreTimingReport(report){
  const ratio = report.summary.total ? report.summary.passed / report.summary.total : 0;
  const worst = report.summary.worstCurrentDelta || 0;
  const baselineDrift = report.summary.worstDriftFromBaseline == null ? 1 : clamp(1 - ((report.summary.worstDriftFromBaseline || 0) / 1), 0, 1);
  const score = 10 * ((0.6 * ratio) + (0.25 * clamp(1 - worst / 10, 0, 1)) + (0.15 * baselineDrift));
  return round(clamp(score, 1, 10), 1);
}

function scoreSpacingReport(report){
  const ok = report.summary.ok ? 1 : 0.4;
  const drift = clamp(1 - ((report.summary.maxTargetDrift || 0) / 5), 0, 1);
  const changed = clamp(1 - ((report.summary.changedTargets || 0) / 10), 0, 1);
  return round(clamp(10 * ((0.55 * ok) + (0.25 * drift) + (0.2 * changed)), 1, 10), 1);
}

function scoreCaptureReport(report){
  const ratio = report.summary.total ? report.summary.passed / report.summary.total : 0;
  const drift = clamp(1 - ((report.summary.worstTrackedTimeDrift || 0) / 0.35), 0, 1);
  return round(clamp(10 * ((0.75 * ratio) + (0.25 * drift)), 1, 10), 1);
}

function scoreProgressionReport(report){
  const ratio = report.summary.totalPersonaChecks ? report.summary.passedPersonaChecks / report.summary.totalPersonaChecks : 0;
  const order = report.summary.currentProgressionOrderPreserved ? 1 : 0.6;
  return round(clamp(10 * ((0.7 * ratio) + (0.3 * order)), 1, 10), 1);
}

function scoreAudio(metricsTheme, metricsOverlap){
  const items = metricsTheme.items || [];
  const cueSimilarity = items.map(item => {
    const aurora = item.variants?.aurora?.metrics || {};
    const galaga = item.variants?.galaga?.metrics || {};
    const duration = closeness(aurora.duration_s, galaga.duration_s, 0.2);
    const centroid = closeness(aurora.spectral_centroid_hz, galaga.spectral_centroid_hz, 1000);
    const crossings = closeness(aurora.zero_crossings_per_s, galaga.zero_crossings_per_s, 120);
    return (duration + centroid + crossings) / 3;
  });
  const cueAverage = cueSimilarity.length ? cueSimilarity.reduce((sum, value) => sum + value, 0) / cueSimilarity.length : 0;
  const overlapStage1 = [
    closeness(metricsOverlap.stage1?.gameStartAfterSpawn, 0.622, 0.8),
    closeness(metricsOverlap.stage1?.firstPulseAfterSpawn, 3.148, 1.0),
    closeness(metricsOverlap.stage1?.firstDiveAfterSpawn, 8.202, 2.0)
  ];
  const overlapAverage = overlapStage1.reduce((sum, value) => sum + value, 0) / overlapStage1.length;
  return round(clamp(10 * ((0.65 * cueAverage) + (0.35 * overlapAverage)), 1, 10), 1);
}

function buildReadme(report){
  const lines = [
    '# Quality Conformance Score',
    '',
    'This artifact rolls Aurora quality into ten evidence-backed categories. It is intended to expose where the biggest gaps still are, not to hide them behind a single average.',
    '',
    '## Overall',
    '',
    `- Overall score: ${report.summary.overallScore10}/10`,
    `- Strongest category: ${report.summary.strongestCategory.id} (${report.summary.strongestCategory.score10}/10)`,
    `- Weakest category: ${report.summary.weakestCategory.id} (${report.summary.weakestCategory.score10}/10)`,
    '',
    '## Categories',
    ''
  ];
  for(const category of report.categories){
    lines.push(`### ${category.label}`);
    lines.push(`- Score: ${category.score10}/10`);
    lines.push(`- Evidence: ${category.evidence.join(', ')}`);
    lines.push(`- Read: ${category.read}`);
    lines.push('');
  }
  lines.push('## Next release reading');
  lines.push('');
  for(const gap of report.summary.priorityGaps){
    lines.push(`- ${gap.label}: ${gap.score10}/10`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main(){
  ensureDir(OUT_ROOT);

  const movementRun = runScript('check-player-movement-conformance.js');
  const closeShotRun = runScript('check-close-shot-hit.js');
  const stage2SafetyRun = runScript('check-persona-stage2-safety.js');
  const surfaceRun = runScript('check-dev-candidate-surface-suite.js');

  const movementReport = readJson(latestReport('reference-artifacts/analyses/correspondence/player-movement'));
  const stage1TimingReport = readJson(latestReport('reference-artifacts/analyses/correspondence/stage1-opening-first-dive'));
  const stage1SpacingReport = readJson(latestReport('reference-artifacts/analyses/correspondence/stage1-opening-spacing'));
  const captureReport = readJson(latestReport('reference-artifacts/analyses/correspondence/capture-rescue'));
  const challengeReport = readJson(latestReport('reference-artifacts/analyses/correspondence/challenge-stage-timing'));
  const progressionReport = readJson(latestReport('reference-artifacts/analyses/correspondence/persona-progression'));
  const audioThemeMetrics = readJson(latestMetrics('reference-artifacts/analyses/aurora-audio-theme-comparison'));
  const audioOverlapMetrics = readJson(latestMetrics('reference-artifacts/analyses/galaga-audio-overlap'));

  const categories = [
    {
      id: 'movement',
      label: 'Player movement conformance',
      score10: movementReport.summary.currentScore10,
      evidence: ['player-movement report'],
      read: `Current movement scored ${movementReport.summary.currentScore10}/10 against the control-principles profile, versus ${movementReport.summary.baselineScore10}/10 for the shipped local baseline.`
    },
    {
      id: 'combat-responsiveness',
      label: 'Shot and hit responsiveness',
      score10: round(clamp((closeShotRun.ok ? 8.8 : 2.5) + clamp((movementReport.current.moveFire.postShotTravel || 0) / 8, 0, 1.2), 1, 10), 1),
      evidence: ['close-shot-hit', 'movement fire window'],
      read: `Close-shot responsiveness passed, and movement-fire post-shot travel was ${movementReport.current.moveFire.postShotTravel}, with shot delay ${movementReport.current.moveFire.shotDelayMs}ms.`
    },
    {
      id: 'stage1-timing',
      label: 'Stage-1 opening timing fidelity',
      score10: scoreTimingReport(stage1TimingReport),
      evidence: ['stage1-opening-first-dive report'],
      read: `${stage1TimingReport.summary.passed}/${stage1TimingReport.summary.total} metrics were within tolerance; worst current delta was ${stage1TimingReport.summary.worstCurrentDelta}.`
    },
    {
      id: 'stage1-geometry',
      label: 'Stage-1 opening geometry fidelity',
      score10: scoreSpacingReport(stage1SpacingReport),
      evidence: ['stage1-opening-spacing report'],
      read: `Geometry ${stage1SpacingReport.summary.ok ? 'held steady' : 'drifted'} with ${stage1SpacingReport.summary.changedTargets} changed targets and max drift ${stage1SpacingReport.summary.maxTargetDrift}.`
    },
    {
      id: 'dive-safety',
      label: 'Dive fairness and safety',
      score10: stage2SafetyRun.ok ? 9.1 : 3,
      evidence: ['persona-stage2-safety'],
      read: stage2SafetyRun.ok
        ? 'Shared stage-2 safety seeds passed, which keeps the early dive/collision windows within the intended persona guardrail.'
        : 'Stage-2 safety failed, which is a direct regression signal for early dive fairness.'
    },
    {
      id: 'capture-rescue',
      label: 'Capture and rescue rule fidelity',
      score10: scoreCaptureReport(captureReport),
      evidence: ['capture-rescue correspondence'],
      read: `${captureReport.summary.passed}/${captureReport.summary.total} capture scenarios matched, with worst tracked-time drift ${captureReport.summary.worstTrackedTimeDrift}.`
    },
    {
      id: 'challenge-timing',
      label: 'Challenge-stage timing fidelity',
      score10: scoreTimingReport(challengeReport),
      evidence: ['challenge-stage correspondence'],
      read: `${challengeReport.summary.passed}/${challengeReport.summary.total} challenge timing metrics were within tolerance; worst current delta was ${challengeReport.summary.worstCurrentDelta}.`
    },
    {
      id: 'progression',
      label: 'Progression and persona depth',
      score10: scoreProgressionReport(progressionReport),
      evidence: ['persona-progression correspondence'],
      read: `${progressionReport.summary.passedPersonaChecks}/${progressionReport.summary.totalPersonaChecks} persona checks passed; progression ordering is ${progressionReport.summary.currentProgressionOrderPreserved ? 'fully preserved' : 'still missing one ordering edge case'}.`
    },
    {
      id: 'audio',
      label: 'Audio identity and cue alignment',
      score10: scoreAudio(audioThemeMetrics, audioOverlapMetrics),
      evidence: ['aurora-audio-theme-comparison', 'galaga-audio-overlap'],
      read: 'Audio score blends cue-identity similarity against the preserved Galaga-inspired reference mix with the overlap/timing windows captured in the audio-overlap analysis.'
    },
    {
      id: 'ui-shell',
      label: 'UI, shell, and graphics integrity',
      score10: surfaceRun.ok ? 9.2 : 3,
      evidence: ['dev candidate surface suite'],
      read: surfaceRun.ok
        ? 'The bundled front-door, panel, dock, graphics, attract, leaderboard, and audio shell surface suite passed.'
        : 'The candidate surface suite found a shell or graphics regression.'
    }
  ];

  const overallScore10 = round(categories.reduce((sum, category) => sum + category.score10, 0) / categories.length, 1);
  const sorted = [...categories].sort((a, b) => a.score10 - b.score10);
  const stamp = new Date().toISOString().slice(0, 10);
  const outDir = path.join(OUT_ROOT, `${stamp}-${gitShortCommit()}`);
  ensureDir(outDir);

  const report = {
    generatedAt: new Date().toISOString(),
    movementRun,
    closeShotRun,
    stage2SafetyRun,
    surfaceRun,
    categories,
    summary: {
      overallScore10,
      strongestCategory: categories.reduce((best, category) => category.score10 > best.score10 ? category : best, categories[0]),
      weakestCategory: categories.reduce((worst, category) => category.score10 < worst.score10 ? category : worst, categories[0]),
      priorityGaps: sorted.slice(0, 3)
    }
  };

  writeJson(path.join(outDir, 'report.json'), report);
  fs.writeFileSync(path.join(outDir, 'README.md'), buildReadme(report));
  console.log(JSON.stringify({
    ok: true,
    outDir,
    overallScore10,
    weakestCategory: report.summary.weakestCategory.id
  }, null, 2));
}

main();
