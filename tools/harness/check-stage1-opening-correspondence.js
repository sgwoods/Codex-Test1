#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const PROFILE = path.join(__dirname, 'reference-profiles', 'stage1-opening-first-dive.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'correspondence', 'stage1-opening-first-dive');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
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

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function firstEvent(events, predicate){
  return events.find(predicate) || null;
}

function delta(from, to){
  if(!from || !to) return null;
  return +((to.t || 0) - (from.t || 0)).toFixed(3);
}

function stage1Metrics(session){
  const events = session.events || [];
  const spawn = firstEvent(events, e => e.type === 'stage_spawn' && e.stage === 1 && !e.challenge);
  const gameStartCue = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'gameStart' && e.stage === 1);
  const stagePulseCue = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'stagePulse' && e.stage === 1);
  const firstAttack = firstEvent(events, e => e.type === 'enemy_attack_start' && e.stage === 1);
  const firstLowerField = firstEvent(events, e => e.type === 'enemy_lower_field' && e.stage === 1);
  return {
    stageSpawnAt: spawn ? +(spawn.t || 0).toFixed(3) : null,
    gameStartCueAfterSpawn: delta(spawn, gameStartCue),
    firstStagePulseAfterSpawn: delta(spawn, stagePulseCue),
    firstAttackAfterSpawn: delta(spawn, firstAttack),
    firstLowerFieldAfterSpawn: delta(spawn, firstLowerField)
  };
}

function runScenarioForRoot(rootDir, scenarioName){
  const run = spawnSync(process.execPath, [
    HARNESS,
    '--scenario', scenarioName,
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
    fail(`correspondence run failed for ${rootDir}`, {
      status: run.status,
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
  let summary;
  try{
    summary = JSON.parse(run.stdout.trim());
  }catch(err){
    fail(`could not parse correspondence run output for ${rootDir}`, {
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
  const sessionPath = (summary.files || []).find(file => file.endsWith('.json') && !file.endsWith('-system-status.json'));
  if(!sessionPath) fail(`missing session log for ${rootDir}`, summary);
  const session = readJson(sessionPath).session;
  return {
    summary,
    sessionPath,
    metrics: stage1Metrics(session)
  };
}

function compareMetric(metric, baseline, current){
  const target = metric.target;
  const baselineValue = baseline[metric.id];
  const currentValue = current[metric.id];
  const baselineDelta = baselineValue == null ? null : +(baselineValue - target).toFixed(3);
  const currentDelta = currentValue == null ? null : +(currentValue - target).toFixed(3);
  const driftFromBaseline = baselineValue == null || currentValue == null ? null : +(currentValue - baselineValue).toFixed(3);
  const withinTolerance = currentDelta == null ? false : Math.abs(currentDelta) <= metric.tolerance;
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
    withinTolerance
  };
}

function buildReadme(report){
  const lines = [
    '# Stage 1 Opening Correspondence',
    '',
    'This artifact compares the current local candidate against the shipped local production baseline and the current Galaga-aligned reference targets for the first stage-1 timing family.',
    '',
    '## Sources',
    '',
    `- Profile: \`${path.relative(ROOT, PROFILE)}\``,
    `- Reference timing metrics: \`${report.profile.referenceSource.timingMetrics}\``,
    `- Reference timing library: \`${report.profile.referenceSource.timingLibrary}\``,
    `- Baseline root: \`${report.baselineRoot}\``,
    `- Current root: \`${report.currentRoot}\``,
    '',
    '## Summary',
    '',
    `- Passed metrics: ${report.summary.passed}/${report.summary.total}`,
    `- Worst current delta: ${String(report.summary.worstCurrentDelta)}`,
    `- Worst drift from baseline: ${String(report.summary.worstDriftFromBaseline)}`,
    '',
    '## Metrics',
    ''
  ];
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
  lines.push('- Use this as a first correspondence example, not a complete fidelity verdict.');
  lines.push('- A current delta outside tolerance may represent intended tuning, acceptable drift, or regression; the purpose here is to make that drift explicit.');
  lines.push('- Expand this pattern next to stage-opening spacing, capture/rescue, challenge timing, and persona progression evidence.');
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
  const stamp = new Date().toISOString().slice(0, 10);
  const outDir = path.join(OUT_ROOT, `${stamp}-${gitShortCommit()}`);
  ensureDir(outDir);

  const baseline = runScenarioForRoot(baselineRoot, profile.scenario);
  const current = runScenarioForRoot(currentRoot, profile.scenario);
  const metrics = profile.metrics.map(metric => compareMetric(metric, baseline.metrics, current.metrics));
  const passed = metrics.filter(metric => metric.withinTolerance).length;
  const summary = {
    passed,
    total: metrics.length,
    worstCurrentDelta: metrics.reduce((max, metric) => Math.max(max, Math.abs(metric.currentDelta || 0)), 0),
    worstDriftFromBaseline: metrics.reduce((max, metric) => Math.max(max, Math.abs(metric.driftFromBaseline || 0)), 0)
  };
  const report = {
    generatedAt: new Date().toISOString(),
    profile,
    baselineRoot: path.relative(ROOT, baselineRoot),
    currentRoot: path.relative(ROOT, currentRoot),
    baselineRun: {
      sessionPath: path.relative(ROOT, baseline.sessionPath),
      metrics: baseline.metrics
    },
    currentRun: {
      sessionPath: path.relative(ROOT, current.sessionPath),
      metrics: current.metrics
    },
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
