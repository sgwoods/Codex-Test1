#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const PROFILE = path.join(__dirname, 'reference-profiles', 'audio-cue-alignment.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'correspondence', 'audio-cue-alignment');

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

function parseArgs(argv){
  const args = {};
  for(let i = 0; i < argv.length; i++){
    const arg = argv[i];
    if(!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if(!next || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

function gitShortCommit(){
  const run = spawnSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' });
  return run.status === 0 ? run.stdout.trim() : 'unknown';
}

function loadSession(summary){
  const sessionPath = (summary.files || []).find(file => file.endsWith('.json') && !file.endsWith('-system-status.json'));
  if(!sessionPath) fail('audio cue alignment run did not produce a session log', summary);
  return readJson(sessionPath).session;
}

function firstEvent(events, predicate){
  return events.find(predicate) || null;
}

function delta(from, to){
  if(!from || !to) return null;
  return +((to.t || 0) - (from.t || 0)).toFixed(3);
}

function runScenario(rootDir, scenarioFile, allowFailure = false){
  const scenario = readJson(scenarioFile);
  scenario.config = Object.assign({}, scenario.config || {}, { audioTheme: 'galaga-reference-assets' });
  const tempScenario = path.join(OUT_ROOT, `tmp-${path.basename(scenarioFile)}`);
  ensureDir(path.dirname(tempScenario));
  fs.writeFileSync(tempScenario, `${JSON.stringify(scenario, null, 2)}\n`);
  const run = spawnSync(process.execPath, [
    HARNESS,
    '--scenario', tempScenario,
    '--root', rootDir,
    '--out', OUT_ROOT,
    '--auto-video', '0',
    '--deterministic-replay', '1'
  ], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20
  });
  if(run.status !== 0){
    if(allowFailure){
      return {
        summary: null,
        session: null,
        error: {
          status: run.status,
          stdout: run.stdout,
          stderr: run.stderr
        }
      };
    }
    fail(`audio cue alignment scenario failed for ${rootDir}`, {
      status: run.status,
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
  const summary = JSON.parse(run.stdout.trim());
  return {
    summary,
    session: loadSession(summary),
    error: null
  };
}

function stage1Metrics(session){
  if(!session) return {
    gameStartCueAfterSpawn: null,
    firstStagePulseAfterFormationArrival: null,
    gameStartTailPastFirstPulse: null
  };
  const events = session.events || [];
  const spawn = firstEvent(events, e => e.type === 'stage_spawn' && e.stage === 1 && !e.challenge);
  const gameStartCue = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'gameStart' && e.stage === 1);
  const formationArrivalCue = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'formationArrival' && e.stage === 1);
  const stagePulseCue = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'stagePulse' && e.stage === 1);
  return {
    gameStartCueAfterSpawn: delta(spawn, gameStartCue),
    firstStagePulseAfterFormationArrival: delta(formationArrivalCue, stagePulseCue),
    gameStartTailPastFirstPulse: spawn && gameStartCue && stagePulseCue && Number.isFinite(+gameStartCue.referenceClipDuration)
      ? +(((gameStartCue.t || 0) + (+gameStartCue.referenceClipDuration || 0)) - (stagePulseCue.t || 0)).toFixed(3)
      : null
  };
}

function challengeEntryMetrics(session){
  if(!session) return {
    challengeCueAfterProbe: null,
    challengeSpawnAfterCue: null,
    transitionCueTailPastSpawn: null
  };
  const events = session.events || [];
  const probe = firstEvent(events, e => e.type === 'harness_stage_transition_probe_setup');
  const challengeCue = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'challengeTransition');
  const challengeSpawn = firstEvent(events, e => e.type === 'stage_spawn' && e.stage === 3 && !!e.challenge);
  return {
    challengeCueAfterProbe: delta(probe, challengeCue),
    challengeSpawnAfterCue: delta(challengeCue, challengeSpawn),
    transitionCueTailPastSpawn: probe && challengeCue && challengeSpawn && Number.isFinite(+challengeCue.referenceClipDuration)
      ? +(((challengeCue.t || 0) + (+challengeCue.referenceClipDuration || 0)) - (challengeSpawn.t || 0)).toFixed(3)
      : null
  };
}

function challengePerfectMetrics(session){
  if(!session) return {
    challengePerfectCueAfterClear: null,
    nextStageCueAfterClear: null,
    resultTailPastNextCue: null
  };
  const events = session.events || [];
  const clear = firstEvent(events, e => e.type === 'challenge_clear' && e.stage === 3);
  const resultCue = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'challengePerfect' && e.stage === 3);
  const nextCue = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'stageTransition' && e.stage === 3);
  return {
    challengePerfectCueAfterClear: delta(clear, resultCue),
    nextStageCueAfterClear: delta(clear, nextCue),
    resultTailPastNextCue: clear && resultCue && nextCue && Number.isFinite(+resultCue.referenceClipDuration)
      ? +(((resultCue.t || 0) + (+resultCue.referenceClipDuration || 0)) - (nextCue.t || 0)).toFixed(3)
      : null
  };
}

function getAtPath(obj, pathParts){
  return (pathParts || []).reduce((acc, key) => (acc == null ? null : acc[key]), obj);
}

function buildHistoricalBaselines(profile){
  const library = readJson(path.resolve(ROOT, profile.referenceSource.timingLibrary));
  const families = {};
  for(const [key, familyId] of Object.entries(profile.historicalAuroraBaselines || {})){
    families[key] = (library.eventFamilies || []).find(entry => entry.id === familyId) || null;
  }
  return families;
}

function compareMetric(metric, historicalFamilies, baselineMetrics, currentMetrics){
  const baselineValue = getAtPath(baselineMetrics, metric.runtimePath);
  const currentValue = getAtPath(currentMetrics, metric.runtimePath);
  let target = null;
  let currentDelta = null;
  let baselineDelta = null;
  let withinTolerance = false;
  if(metric.mode === 'target'){
    target = metric.target;
    baselineDelta = baselineValue == null ? null : +(baselineValue - target).toFixed(3);
    currentDelta = currentValue == null ? null : +(currentValue - target).toFixed(3);
    withinTolerance = currentDelta != null && Math.abs(currentDelta) <= metric.tolerance;
  }else if(metric.mode === 'familyTarget'){
    target = getAtPath(historicalFamilies[metric.family], metric.targetPath);
    baselineDelta = baselineValue == null || target == null ? null : +(baselineValue - target).toFixed(3);
    currentDelta = currentValue == null || target == null ? null : +(currentValue - target).toFixed(3);
    withinTolerance = currentDelta != null && Math.abs(currentDelta) <= metric.tolerance;
  }else if(metric.mode === 'max'){
    target = metric.maxAllowed;
    baselineDelta = baselineValue == null ? null : +(baselineValue - target).toFixed(3);
    currentDelta = currentValue == null ? null : +(currentValue - target).toFixed(3);
    withinTolerance = currentValue != null && currentValue <= (metric.maxAllowed + metric.tolerance);
  }else{
    fail(`unsupported metric mode: ${metric.mode}`);
  }
  const driftFromBaseline = baselineValue == null || currentValue == null ? null : +(currentValue - baselineValue).toFixed(3);
  return {
    id: metric.id,
    label: metric.label,
    source: metric.source,
    mode: metric.mode,
    severity: metric.severity,
    target,
    tolerance: metric.tolerance,
    baseline: baselineValue,
    current: currentValue,
    baselineDelta,
    currentDelta,
    driftFromBaseline,
    withinTolerance
  };
}

function summarize(metrics){
  const passed = metrics.filter(metric => metric.withinTolerance).length;
  const currentDeltas = metrics.map(metric => metric.currentDelta).filter(value => value != null);
  const driftDeltas = metrics.map(metric => metric.driftFromBaseline).filter(value => value != null);
  return {
    passed,
    total: metrics.length,
    worstCurrentDelta: currentDeltas.length ? Math.max(...currentDeltas.map(value => Math.abs(value))) : null,
    worstDriftFromBaseline: driftDeltas.length ? Math.max(...driftDeltas.map(value => Math.abs(value))) : null
  };
}

function buildReadme(report){
  const lines = [
    '# Audio Cue Alignment Correspondence',
    '',
    'This report compares Aurora gameplay-audio cue timing against the preserved',
    'Galaga-aligned Aurora timing baselines and the shipped local production lane.',
    '',
    '## Sources',
    '',
    `- Profile: \`${path.relative(ROOT, PROFILE)}\``,
    `- Baseline root: \`${report.baselineRoot}\``,
    `- Current root: \`${report.currentRoot}\``,
    `- Timing library: \`${report.profile.referenceSource.timingLibrary}\``,
    '',
    '## Summary',
    '',
    `- Passed metrics: ${report.summary.passed}/${report.summary.total}`,
    `- Worst current delta: ${String(report.summary.worstCurrentDelta)}`,
    `- Worst drift from baseline: ${String(report.summary.worstDriftFromBaseline)}`,
    '',
    '## Scenario Support',
    '',
    `- Baseline challenge entry: ${report.runs.baseline.challengeEntryError ? 'unsupported' : 'ok'}`,
    `- Current challenge entry: ${report.runs.current.challengeEntryError ? 'unsupported' : 'ok'}`,
    '',
    '## Metrics',
    ''
  ];
  if(report.runs.baseline.challengeEntryError){
    lines.push(`- Baseline challenge-entry probe error: \`${String(report.runs.baseline.challengeEntryError).trim()}\``);
    lines.push('');
  }
  for(const metric of report.metrics){
    lines.push(`### ${metric.label}`);
    lines.push(`- Target: ${String(metric.target)}`);
    lines.push(`- Tolerance: ${String(metric.tolerance)}`);
    lines.push(`- Baseline: ${String(metric.baseline)}`);
    lines.push(`- Current: ${String(metric.current)}`);
    lines.push(`- Baseline delta: ${String(metric.baselineDelta)}`);
    lines.push(`- Current delta: ${String(metric.currentDelta)}`);
    lines.push(`- Drift from baseline: ${String(metric.driftFromBaseline)}`);
    lines.push(`- Within tolerance: ${metric.withinTolerance ? 'yes' : 'no'}`);
    lines.push('');
  }
  lines.push('## Read');
  lines.push('');
  lines.push('- Use this report for audio cue timing and overlap windows, not for timbre identity by itself.');
  lines.push('- Pair it with the audio theme comparison when making broader sound-design decisions.');
  lines.push('- The next audio polish cycle should aim to improve the weak timing families without shortening canonical phrases just for convenience.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main(){
  const args = parseArgs(process.argv.slice(2));
  const profile = readJson(PROFILE);
  const baselineRoot = path.resolve(ROOT, args['baseline-root'] || profile.candidateRoots.baseline);
  const currentRoot = path.resolve(ROOT, args['current-root'] || profile.candidateRoots.current);
  if(!fs.existsSync(path.join(baselineRoot, 'index.html'))) fail(`baseline root is missing a built app: ${baselineRoot}`);
  if(!fs.existsSync(path.join(currentRoot, 'index.html'))) fail(`current root is missing a built app: ${currentRoot}`);

  ensureDir(OUT_ROOT);
  const stamp = new Date().toISOString().slice(0, 10);
  const outDir = path.join(OUT_ROOT, `${stamp}-${gitShortCommit()}`);
  ensureDir(outDir);

  const stage1Scenario = path.resolve(ROOT, profile.scenarios.stage1);
  const challengeEntryScenario = path.resolve(ROOT, profile.scenarios.challengeEntry);
  const challengePerfectScenario = path.resolve(ROOT, profile.scenarios.challengePerfect);

  const baselineStage1 = runScenario(baselineRoot, stage1Scenario);
  const baselineChallengeEntry = runScenario(baselineRoot, challengeEntryScenario, true);
  const baselineChallengePerfect = runScenario(baselineRoot, challengePerfectScenario);
  const currentStage1 = runScenario(currentRoot, stage1Scenario);
  const currentChallengeEntry = runScenario(currentRoot, challengeEntryScenario);
  const currentChallengePerfect = runScenario(currentRoot, challengePerfectScenario);

  const baselineMetrics = {
    stage1: stage1Metrics(baselineStage1.session),
    challengeEntry: challengeEntryMetrics(baselineChallengeEntry.session),
    challengePerfect: challengePerfectMetrics(baselineChallengePerfect.session)
  };
  const currentMetrics = {
    stage1: stage1Metrics(currentStage1.session),
    challengeEntry: challengeEntryMetrics(currentChallengeEntry.session),
    challengePerfect: challengePerfectMetrics(currentChallengePerfect.session)
  };

  const historicalFamilies = buildHistoricalBaselines(profile);
  const metrics = profile.metrics.map(metric => compareMetric(metric, historicalFamilies, baselineMetrics, currentMetrics));
  const summary = summarize(metrics);

  const report = {
    generatedAt: new Date().toISOString(),
    commit: gitShortCommit(),
    profile,
    baselineRoot: path.relative(ROOT, baselineRoot),
    currentRoot: path.relative(ROOT, currentRoot),
    historicalFamilies: Object.fromEntries(Object.entries(historicalFamilies).map(([key, value]) => [key, value?.id || null])),
    runs: {
      baseline: {
        stage1: baselineStage1.summary?.outDir || null,
        challengeEntry: baselineChallengeEntry.summary?.outDir || null,
        challengePerfect: baselineChallengePerfect.summary?.outDir || null,
        challengeEntryError: baselineChallengeEntry.error?.stderr || null
      },
      current: {
        stage1: currentStage1.summary?.outDir || null,
        challengeEntry: currentChallengeEntry.summary?.outDir || null,
        challengePerfect: currentChallengePerfect.summary?.outDir || null,
        challengeEntryError: currentChallengeEntry.error?.stderr || null
      }
    },
    baselineMetrics,
    currentMetrics,
    metrics,
    summary
  };

  writeJson(path.join(outDir, 'report.json'), report);
  fs.writeFileSync(path.join(outDir, 'README.md'), buildReadme(report));
  console.log(JSON.stringify(report, null, 2));
}

main();
