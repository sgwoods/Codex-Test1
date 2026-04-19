#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const PROFILE = path.join(__dirname, 'reference-profiles', 'capture-rescue-correspondence.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'correspondence', 'capture-rescue');

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

function gitShortCommit(){
  try{
    return spawnSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim() || 'unknown';
  }catch{
    return 'unknown';
  }
}

function argValue(flag, fallback = ''){
  const idx = process.argv.indexOf(flag);
  return idx >= 0 && idx + 1 < process.argv.length ? process.argv[idx + 1] : fallback;
}

function loadSession(summary){
  const sessionPath = (summary.files || []).find(file => file.endsWith('.json') && !file.endsWith('-system-status.json'));
  if(!sessionPath) fail('correspondence run did not produce a session log', summary);
  return {
    sessionPath,
    session: readJson(sessionPath).session
  };
}

function runScenario(rootDir, scenarioFile){
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
    fail(`capture/rescue correspondence run failed for ${scenarioFile}`, {
      status: run.status,
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
  let summary;
  try{
    summary = JSON.parse(run.stdout.trim());
  }catch(err){
    fail(`could not parse correspondence output for ${scenarioFile}`, {
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
  const loaded = loadSession(summary);
  return {
    summary,
    sessionPath: loaded.sessionPath,
    events: loaded.session.events || [],
    snapshots: loaded.session.snapshots || []
  };
}

function firstEvent(events, type){
  return events.find(event => event.type === type) || null;
}

function trackedTimingSpecs(scenario){
  return (scenario.expectations.trackedTimes || []).map(entry => (
    typeof entry === 'string' ? { type: entry, measure: 'absolute' } : entry
  ));
}

function trackedValue(events, scenario, spec){
  const event = firstEvent(events, spec.type);
  if(!event) return null;
  if(spec.measure === 'field'){
    return event[spec.field] ?? null;
  }
  if(spec.measure === 'sinceAnchor'){
    const anchorType = spec.anchor || scenario.expectations.timingAnchor;
    const anchor = anchorType ? firstEvent(events, anchorType) : null;
    return anchor ? +((event.t - anchor.t).toFixed(3)) : null;
  }
  return event.t ?? null;
}

function summarizeScenario(run, scenario){
  const counts = {};
  for(const event of run.events){
    counts[event.type] = (counts[event.type] || 0) + 1;
  }
  const tracked = {};
  for(const spec of trackedTimingSpecs(scenario)){
    tracked[spec.type] = trackedValue(run.events, scenario, spec);
  }
  return {
    sessionPath: path.relative(ROOT, run.sessionPath),
    counts,
    tracked
  };
}

function compareScenario(profileScenario, baseline, current, tolerance){
  const mustHave = profileScenario.expectations.mustHave || [];
  const mustNotHave = profileScenario.expectations.mustNotHave || [];
  const trackedTimes = trackedTimingSpecs(profileScenario);
  const checks = [];

  for(const type of mustHave){
    const baselineHas = !!firstEvent(baseline.events, type);
    const currentHas = !!firstEvent(current.events, type);
    checks.push({
      type: `mustHave:${type}`,
      baselineHas,
      currentHas,
      ok: baselineHas && currentHas
    });
  }
  for(const type of mustNotHave){
    const baselineHas = !!firstEvent(baseline.events, type);
    const currentHas = !!firstEvent(current.events, type);
    checks.push({
      type: `mustNotHave:${type}`,
      baselineHas,
      currentHas,
      ok: !baselineHas && !currentHas
    });
  }

  const timing = trackedTimes.map(spec => {
    const baselineAt = trackedValue(baseline.events, profileScenario, spec);
    const currentAt = trackedValue(current.events, profileScenario, spec);
    const drift = baselineAt == null || currentAt == null ? null : +((currentAt - baselineAt)).toFixed(3);
    return {
      type: spec.type,
      measure: spec.measure || 'absolute',
      field: spec.field || null,
      anchor: spec.anchor || profileScenario.expectations.timingAnchor || null,
      baselineAt,
      currentAt,
      drift,
      withinTolerance: drift == null ? false : Math.abs(drift) <= tolerance
    };
  });

  return {
    id: profileScenario.id,
    baseline: summarizeScenario(baseline, profileScenario),
    current: summarizeScenario(current, profileScenario),
    checks,
    timing,
    ok: checks.every(check => check.ok) && timing.every(entry => entry.withinTolerance)
  };
}

function buildReadme(report){
  const lines = [
    '# Capture / Rescue Correspondence',
    '',
    'This artifact compares the shipped local baseline and current local candidate across core capture-window and escape-recovery scenarios.',
    '',
    '## Sources',
    '',
    `- Profile: \`${path.relative(ROOT, PROFILE)}\``,
    `- Baseline root: \`${report.baselineRoot}\``,
    `- Current root: \`${report.currentRoot}\``,
    '',
    '## Summary',
    '',
    `- Passed scenarios: ${report.summary.passed}/${report.summary.total}`,
    `- Worst tracked-time drift: ${String(report.summary.worstTrackedTimeDrift)}`,
    '',
    '## Scenarios',
    ''
  ];
  for(const scenario of report.scenarios){
    lines.push(`### ${scenario.id}`);
    lines.push(`- Scenario ok: ${scenario.ok ? 'yes' : 'no'}`);
    lines.push(`- Baseline session: \`${scenario.baseline.sessionPath}\``);
    lines.push(`- Current session: \`${scenario.current.sessionPath}\``);
    lines.push(`- Baseline counts: ${JSON.stringify(scenario.baseline.counts)}`);
    lines.push(`- Current counts: ${JSON.stringify(scenario.current.counts)}`);
    for(const check of scenario.checks){
      lines.push(`- ${check.type}: baseline=${check.baselineHas ? 'yes' : 'no'}, current=${check.currentHas ? 'yes' : 'no'}, ok=${check.ok ? 'yes' : 'no'}`);
    }
    for(const timing of scenario.timing){
      const detail = timing.measure === 'field'
        ? `field=${timing.field}`
        : timing.measure === 'sinceAnchor'
          ? `anchor=${timing.anchor}`
          : 'absolute';
      lines.push(`- ${timing.type} (${detail}): baseline=${String(timing.baselineAt)}, current=${String(timing.currentAt)}, drift=${String(timing.drift)}, withinTolerance=${timing.withinTolerance ? 'yes' : 'no'}`);
    }
    lines.push('');
  }
  lines.push('## Read');
  lines.push('');
  lines.push('- This correspondence report is about rule and state-transition behavior, not visual feel.');
  lines.push('- A scenario can pass outcome checks while still needing later timing or presentation tuning.');
  lines.push('- Expand this pattern next into richer rescue-return, hostile-captured-fighter, and Stage 4 capture-pressure correspondence.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main(){
  const profile = readJson(PROFILE);
  const baselineRoot = path.resolve(ROOT, argValue('--baseline-root', profile.candidateRoots.baseline));
  const currentRoot = path.resolve(ROOT, argValue('--current-root', profile.candidateRoots.current));
  ensureDir(OUT_ROOT);
  const scenarios = profile.scenarios.map(scenario => {
    const scenarioPath = path.resolve(ROOT, scenario.path);
    return compareScenario(
      scenario,
      runScenario(baselineRoot, scenarioPath),
      runScenario(currentRoot, scenarioPath),
      profile.tolerances.maxTrackedTimeDrift
    );
  });

  const summary = {
    passed: scenarios.filter(s => s.ok).length,
    total: scenarios.length,
    worstTrackedTimeDrift: scenarios.reduce((max, scenario) => {
      const localWorst = scenario.timing.reduce((inner, entry) => Math.max(inner, Math.abs(entry.drift || 0)), 0);
      return Math.max(max, localWorst);
    }, 0)
  };
  const outDir = path.join(OUT_ROOT, `${new Date().toISOString().slice(0, 10)}-${gitShortCommit()}`);
  ensureDir(outDir);
  const report = {
    generatedAt: new Date().toISOString(),
    profile,
    baselineRoot: path.relative(ROOT, baselineRoot),
    currentRoot: path.relative(ROOT, currentRoot),
    scenarios,
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
