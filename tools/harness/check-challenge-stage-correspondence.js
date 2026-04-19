#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const PROFILE = path.join(__dirname, 'reference-profiles', 'challenge-stage-timing.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'correspondence', 'challenge-stage-timing');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
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
  if(!sessionPath) fail('correspondence run did not produce a session log', summary);
  return {
    sessionPath,
    session: readJson(sessionPath).session
  };
}

function firstEvent(events, predicate){
  return events.find(predicate) || null;
}

function delta(from, to){
  if(!from || !to) return null;
  return +((to.t || 0) - (from.t || 0)).toFixed(3);
}

function challengeEntryMetrics(session){
  const events = session.events || [];
  const probe = firstEvent(events, e => e.type === 'harness_stage_transition_probe_setup');
  const challengeCue = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'challengeTransition');
  const challengeSpawn = firstEvent(events, e => e.type === 'stage_spawn' && e.stage === 3 && !!e.challenge);
  const firstChallengePulse = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'stagePulse' && e.stage === 3);
  return {
    probeAt: probe?.t || null,
    challengeCueAfterProbe: delta(probe, challengeCue),
    challengeSpawnAfterProbe: delta(probe, challengeSpawn),
    challengeSpawnAfterCue: delta(challengeCue, challengeSpawn),
    firstChallengePulseAfterSpawn: delta(challengeSpawn, firstChallengePulse)
  };
}

function challengePerfectMetrics(session){
  const events = session.events || [];
  const clear = firstEvent(events, e => e.type === 'challenge_clear' && e.stage === 3);
  const resultCue = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'challengePerfect' && e.stage === 3);
  const nextStageCue = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'stageTransition' && e.stage === 3);
  const nextStageSpawn = firstEvent(events, e => e.type === 'stage_spawn' && e.stage === 4 && !e.challenge);
  return {
    challengeClearAt: clear?.t || null,
    challengePerfectCueAfterClear: delta(clear, resultCue),
    nextStageCueAfterClear: delta(clear, nextStageCue),
    nextStageSpawnAfterClear: delta(clear, nextStageSpawn),
    nextStageSpawnAfterCue: delta(nextStageCue, nextStageSpawn)
  };
}

function runScenarioForRoot(rootDir, scenarioFile){
  const run = spawnSync(process.execPath, [
    HARNESS,
    '--scenario', scenarioFile,
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
    return {
      error: {
        status: run.status,
        stdout: run.stdout,
        stderr: run.stderr
      },
      sessionPath: null,
      metrics: {
        challengeEntry: {
          probeAt: null,
          challengeCueAfterProbe: null,
          challengeSpawnAfterProbe: null,
          challengeSpawnAfterCue: null,
          firstChallengePulseAfterSpawn: null
        },
        challengePerfect: {
          challengeClearAt: null,
          challengePerfectCueAfterClear: null,
          nextStageCueAfterClear: null,
          nextStageSpawnAfterClear: null,
          nextStageSpawnAfterCue: null
        }
      }
    };
  }
  let summary;
  try{
    summary = JSON.parse(run.stdout.trim());
  }catch{
    fail(`could not parse correspondence run output for ${rootDir}`, {
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
  const loaded = loadSession(summary);
  return {
    summary,
    sessionPath: loaded.sessionPath,
    error: null,
    metrics: {
      challengeEntry: challengeEntryMetrics(loaded.session),
      challengePerfect: challengePerfectMetrics(loaded.session)
    }
  };
}

function getAtPath(obj, pathParts){
  return pathParts.reduce((acc, key) => (acc == null ? null : acc[key]), obj);
}

function loadHistoricalBaseline(profile){
  const libraryPath = path.resolve(ROOT, profile.referenceSource.timingLibrary);
  const familyId = profile.historicalAuroraBaseline?.eventFamilyId || '';
  if(!fs.existsSync(libraryPath) || !familyId) return null;
  const library = readJson(libraryPath);
  return (library.eventFamilies || []).find(entry => entry.id === familyId) || null;
}

function compareMetric(metric, historicalBaseline, baseline, current){
  const target = historicalBaseline ? getAtPath(historicalBaseline.auroraCurrent || {}, metric.path) : null;
  const runtimePath = metric.runtimePath || (metric.source ? [metric.source, metric.id] : [metric.id]);
  const baselineValue = getAtPath(baseline, runtimePath);
  const currentValue = getAtPath(current, runtimePath);
  const baselineDelta = baselineValue == null || target == null ? null : +(baselineValue - target).toFixed(3);
  const currentDelta = currentValue == null || target == null ? null : +(currentValue - target).toFixed(3);
  const driftFromBaseline = baselineValue == null || currentValue == null ? null : +(currentValue - baselineValue).toFixed(3);
  return {
    id: metric.id,
    label: metric.label,
    severity: metric.severity,
    target,
    tolerance: metric.tolerance,
    baseline: baselineValue,
    current: currentValue,
    baselineDelta,
    currentDelta,
    driftFromBaseline,
    withinTolerance: currentDelta == null ? false : Math.abs(currentDelta) <= metric.tolerance
  };
}

function buildReadme(report){
  const lines = [
    '# Challenge Stage Timing Correspondence',
    '',
    'This artifact compares the current local candidate against:',
    '',
    '- the shipped local production baseline',
    '- the preserved historical Aurora challenge timing baseline',
    '- the Galaga-aligned challenge timing targets captured in the reference library',
    '',
    '## Sources',
    '',
    `- Profile: \`${path.relative(ROOT, PROFILE)}\``,
    `- Reference timing library: \`${report.profile.referenceSource.timingLibrary}\``,
    `- Baseline root: \`${report.baselineRoot}\``,
    `- Current root: \`${report.currentRoot}\``,
    report.historicalBaseline ? `- Historical Aurora baseline family: \`${report.historicalBaseline.id}\`` : '- Historical Aurora baseline family: missing',
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
    `- Baseline challenge perfect: ${report.runs.baseline.challengePerfectError ? 'unsupported' : 'ok'}`,
    `- Current challenge entry: ${report.runs.current.challengeEntryError ? 'unsupported' : 'ok'}`,
    `- Current challenge perfect: ${report.runs.current.challengePerfectError ? 'unsupported' : 'ok'}`,
    '',
    '## Metrics',
    ''
  ];
  if(report.runs.baseline.challengeEntryError){
    lines.push(`- Baseline challenge-entry probe error: \`${report.runs.baseline.challengeEntryError}\``);
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
  lines.push('- Use this correspondence report for challenge announcement and post-clear handoff timing, not for challenge scoring or hit-rate fidelity.');
  lines.push('- The historical target here comes from preserved Aurora timing work already aligned against Galaga references, not from a freshly inferred heuristic.');
  lines.push('- Expand this pattern next into challenge scoring/results behavior and persona-based challenge hit-rate evidence.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main(){
  const args = parseArgs(process.argv.slice(2));
  const profile = readJson(PROFILE);
  const baselineRoot = path.resolve(ROOT, args['baseline-root'] || profile.candidateRoots.baseline);
  const currentRoot = path.resolve(ROOT, args['current-root'] || profile.candidateRoots.current);
  if(!fs.existsSync(path.join(baselineRoot, 'index.html'))){
    fail(`baseline root is missing a built app: ${baselineRoot}`);
  }
  if(!fs.existsSync(path.join(currentRoot, 'index.html'))){
    fail(`current root is missing a built app: ${currentRoot}`);
  }

  ensureDir(OUT_ROOT);
  const outDir = path.join(OUT_ROOT, `${new Date().toISOString().slice(0, 10)}-${gitShortCommit()}`);
  ensureDir(outDir);

  const scenarios = profile.scenarios;
  const baselineEntry = runScenarioForRoot(baselineRoot, path.resolve(ROOT, scenarios.challengeEntry));
  const currentEntry = runScenarioForRoot(currentRoot, path.resolve(ROOT, scenarios.challengeEntry));
  const baselinePerfect = runScenarioForRoot(baselineRoot, path.resolve(ROOT, scenarios.challengePerfect));
  const currentPerfect = runScenarioForRoot(currentRoot, path.resolve(ROOT, scenarios.challengePerfect));

  const baselineMetrics = {
    challengeEntry: baselineEntry.metrics.challengeEntry,
    challengePerfect: baselinePerfect.metrics.challengePerfect
  };
  const currentMetrics = {
    challengeEntry: currentEntry.metrics.challengeEntry,
    challengePerfect: currentPerfect.metrics.challengePerfect
  };
  const historicalBaseline = loadHistoricalBaseline(profile);
  const metrics = profile.metrics.map(metric => compareMetric(metric, historicalBaseline, baselineMetrics, currentMetrics));
  const summary = {
    passed: metrics.filter(metric => metric.withinTolerance).length,
    total: metrics.length,
    worstCurrentDelta: metrics.reduce((max, metric) => Math.max(max, Math.abs(metric.currentDelta || 0)), 0),
    worstDriftFromBaseline: metrics.reduce((max, metric) => Math.max(max, Math.abs(metric.driftFromBaseline || 0)), 0)
  };

  const report = {
    generatedAt: new Date().toISOString(),
    profile,
    baselineRoot: path.relative(ROOT, baselineRoot),
    currentRoot: path.relative(ROOT, currentRoot),
    historicalBaseline: historicalBaseline ? { id: historicalBaseline.id, label: historicalBaseline.label } : null,
    runs: {
      baseline: {
        challengeEntry: baselineEntry.sessionPath ? path.relative(ROOT, baselineEntry.sessionPath) : null,
        challengePerfect: baselinePerfect.sessionPath ? path.relative(ROOT, baselinePerfect.sessionPath) : null,
        challengeEntryError: baselineEntry.error ? String((baselineEntry.error.stderr || '').trim().split('\n').slice(-1)[0] || `status ${baselineEntry.error.status}`) : null,
        challengePerfectError: baselinePerfect.error ? String((baselinePerfect.error.stderr || '').trim().split('\n').slice(-1)[0] || `status ${baselinePerfect.error.status}`) : null
      },
      current: {
        challengeEntry: currentEntry.sessionPath ? path.relative(ROOT, currentEntry.sessionPath) : null,
        challengePerfect: currentPerfect.sessionPath ? path.relative(ROOT, currentPerfect.sessionPath) : null,
        challengeEntryError: currentEntry.error ? String((currentEntry.error.stderr || '').trim().split('\n').slice(-1)[0] || `status ${currentEntry.error.status}`) : null,
        challengePerfectError: currentPerfect.error ? String((currentPerfect.error.stderr || '').trim().split('\n').slice(-1)[0] || `status ${currentPerfect.error.status}`) : null
      }
    },
    baselineMetrics,
    currentMetrics,
    metrics,
    summary
  };

  const reportFile = path.join(outDir, 'report.json');
  const readmeFile = path.join(outDir, 'README.md');
  writeJson(reportFile, report);
  fs.writeFileSync(readmeFile, buildReadme(report));
  console.log(JSON.stringify({
    ok: summary.passed === summary.total,
    outDir,
    report: reportFile,
    readme: readmeFile,
    summary
  }, null, 2));
}

main();
