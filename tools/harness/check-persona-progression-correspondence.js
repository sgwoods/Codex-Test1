#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(__dirname, 'run-gameplay.js');
const PROFILE = path.join(__dirname, 'reference-profiles', 'persona-progression-correspondence.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'correspondence', 'persona-progression');

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

function runScenario(rootDir, scenario, persona, seed){
  const run = spawnSync(process.execPath, [
    HARNESS,
    '--scenario', scenario,
    '--root', rootDir,
    '--persona', persona,
    '--seed', String(seed),
    '--out', OUT_ROOT,
    '--auto-video', '0'
  ], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 240000,
    maxBuffer: 1024 * 1024 * 20
  });
  if(run.status !== 0){
    fail(`persona progression run failed for ${scenario}/${persona}/${seed}`, {
      rootDir,
      status: run.status,
      signal: run.signal,
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
  try{
    return JSON.parse(run.stdout.trim());
  }catch(err){
    fail(`could not parse persona progression output for ${scenario}/${persona}/${seed}`, {
      rootDir,
      stdout: run.stdout,
      stderr: run.stderr
    });
  }
}

function summarizeChallenge(run){
  const clear = run.analysis?.challengeClears?.[0] || null;
  return {
    endingStage: run.state?.stage ?? 0,
    lives: run.state?.lives ?? 0,
    shipLost: (run.analysis?.shipLost || []).length,
    challengeShipLosses: run.analysis?.challengeRules?.shipLossesDuringChallenge ?? 0,
    challengeHitRate: clear && clear.total ? +((clear.hits / clear.total).toFixed(3)) : 0,
    challengeDuration: clear ? +Number(clear.t || 0).toFixed(3) : null,
    challengeCleared: !!clear
  };
}

function summarizeFullRun(run){
  return {
    endingStage: run.state?.stage ?? 0,
    score: run.state?.score ?? 0,
    lives: run.state?.lives ?? 0,
    shipLost: (run.analysis?.shipLost || []).length,
    stageClears: (run.analysis?.stageClears || []).length,
    challengeClears: (run.analysis?.challengeClears || []).length,
    duration: +(run.analysis?.duration || 0).toFixed(3),
    started: !!run.state?.started
  };
}

function summarizePersona(rootDir, profilePersona, scenarios){
  const challengeRun = runScenario(rootDir, scenarios.challenge, profilePersona.id, profilePersona.challengeSeed);
  const fullRun = runScenario(rootDir, scenarios.fullRun, profilePersona.id, profilePersona.fullRunSeed);
  return {
    files: {
      challenge: challengeRun.files || [],
      fullRun: fullRun.files || []
    },
    challenge: summarizeChallenge(challengeRun),
    fullRun: summarizeFullRun(fullRun)
  };
}

function ratioDrop(baseline, current){
  if(!baseline) return current ? 1 : 0;
  return +((baseline - current) / baseline).toFixed(3);
}

function comparePersona(personaId, baseline, current, tolerances){
  return {
    persona: personaId,
    challengeCleared: {
      baseline: baseline.challenge.challengeCleared,
      current: current.challenge.challengeCleared,
      ok: baseline.challenge.challengeCleared ? current.challenge.challengeCleared : true
    },
    fullRunStage: {
      baseline: baseline.fullRun.endingStage,
      current: current.fullRun.endingStage,
      drift: current.fullRun.endingStage - baseline.fullRun.endingStage,
      ok: current.fullRun.endingStage >= (baseline.fullRun.endingStage - tolerances.fullRunStageDrop)
    },
    fullRunScore: {
      baseline: baseline.fullRun.score,
      current: current.fullRun.score,
      dropRatio: ratioDrop(baseline.fullRun.score, current.fullRun.score),
      ok: ratioDrop(baseline.fullRun.score, current.fullRun.score) <= tolerances.fullRunScoreDropRatio
    },
    challengeHitRate: {
      baseline: baseline.challenge.challengeHitRate,
      current: current.challenge.challengeHitRate,
      drift: +(current.challenge.challengeHitRate - baseline.challenge.challengeHitRate).toFixed(3),
      ok: current.challenge.challengeHitRate >= (baseline.challenge.challengeHitRate - tolerances.challengeHitRateDrop)
    },
    challengeLosses: {
      baseline: baseline.challenge.challengeShipLosses,
      current: current.challenge.challengeShipLosses,
      drift: current.challenge.challengeShipLosses - baseline.challenge.challengeShipLosses,
      ok: current.challenge.challengeShipLosses <= (baseline.challenge.challengeShipLosses + tolerances.challengeLossIncrease)
    }
  };
}

function progressionOrder(summary){
  const personas = ['novice', 'advanced', 'expert', 'professional'];
  const ordered = [];
  for(let i = 0; i < personas.length - 1; i++){
    const left = summary[personas[i]];
    const right = summary[personas[i + 1]];
    if(!left || !right) continue;
    ordered.push({
      pair: `${personas[i]} -> ${personas[i + 1]}`,
      fullRunStage: right.fullRun.endingStage >= left.fullRun.endingStage,
      fullRunScore: right.fullRun.score >= left.fullRun.score,
      challengeHitRate: right.challenge.challengeHitRate >= left.challenge.challengeHitRate
    });
  }
  return ordered;
}

function buildReadme(report){
  const lines = [
    '# Persona Progression Correspondence',
    '',
    'This artifact compares shipped local baseline and current candidate progression outcomes across persona-driven challenge and full-run evidence.',
    '',
    '## Sources',
    '',
    `- Profile: \`${path.relative(ROOT, PROFILE)}\``,
    `- Baseline root: \`${report.baselineRoot}\``,
    `- Current root: \`${report.currentRoot}\``,
    '',
    '## Summary',
    '',
    `- Passed persona checks: ${report.summary.passedPersonaChecks}/${report.summary.totalPersonaChecks}`,
    `- Current progression order preserved: ${report.summary.currentProgressionOrderPreserved ? 'yes' : 'no'}`,
    `- Baseline progression order preserved: ${report.summary.baselineProgressionOrderPreserved ? 'yes' : 'no'}`,
    '',
    '## Personas',
    ''
  ];
  for(const persona of report.profile.personas){
    const id = persona.id;
    const baseline = report.baseline[id];
    const current = report.current[id];
    const checks = report.checks[id];
    lines.push(`### ${id}`);
    lines.push(`- Baseline full run: stage=${baseline.fullRun.endingStage}, score=${baseline.fullRun.score}, lives=${baseline.fullRun.lives}, shipLost=${baseline.fullRun.shipLost}`);
    lines.push(`- Current full run: stage=${current.fullRun.endingStage}, score=${current.fullRun.score}, lives=${current.fullRun.lives}, shipLost=${current.fullRun.shipLost}`);
    lines.push(`- Baseline challenge: hitRate=${baseline.challenge.challengeHitRate}, losses=${baseline.challenge.challengeShipLosses}, cleared=${baseline.challenge.challengeCleared ? 'yes' : 'no'}`);
    lines.push(`- Current challenge: hitRate=${current.challenge.challengeHitRate}, losses=${current.challenge.challengeShipLosses}, cleared=${current.challenge.challengeCleared ? 'yes' : 'no'}`);
    lines.push(`- Check challenge cleared: ${checks.challengeCleared.ok ? 'yes' : 'no'}`);
    lines.push(`- Check full-run stage: ${checks.fullRunStage.ok ? 'yes' : 'no'}`);
    lines.push(`- Check full-run score: ${checks.fullRunScore.ok ? 'yes' : 'no'}`);
    lines.push(`- Check challenge hit rate: ${checks.challengeHitRate.ok ? 'yes' : 'no'}`);
    lines.push(`- Check challenge losses: ${checks.challengeLosses.ok ? 'yes' : 'no'}`);
    lines.push('');
  }
  lines.push('## Progression Order');
  lines.push('');
  for(const entry of report.progression.current){
    lines.push(`- ${entry.pair}: stage=${entry.fullRunStage ? 'ok' : 'no'}, score=${entry.fullRunScore ? 'ok' : 'no'}, challengeHitRate=${entry.challengeHitRate ? 'ok' : 'no'}`);
  }
  lines.push('');
  lines.push('## Read');
  lines.push('');
  lines.push('- This correspondence report is about progression evidence, not exact arcade timing.');
  lines.push('- The key question is whether stronger personas still travel farther, score better, and survive the first challenge more cleanly.');
  lines.push('- Use this alongside stage timing, spacing, capture/rescue, and challenge timing before shaping a controlled next candidate.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main(){
  const args = parseArgs(process.argv.slice(2));
  const profile = readJson(PROFILE);
  const baselineRoot = path.resolve(ROOT, args['baseline-root'] || profile.candidateRoots.baseline);
  const currentRoot = path.resolve(ROOT, args['current-root'] || profile.candidateRoots.current);

  ensureDir(OUT_ROOT);
  const baseline = {};
  const current = {};
  for(const persona of profile.personas){
    baseline[persona.id] = summarizePersona(baselineRoot, persona, profile.scenarios);
    current[persona.id] = summarizePersona(currentRoot, persona, profile.scenarios);
  }

  const checks = {};
  const allChecks = [];
  for(const persona of profile.personas){
    const result = comparePersona(persona.id, baseline[persona.id], current[persona.id], profile.tolerances);
    checks[persona.id] = result;
    allChecks.push(
      result.challengeCleared.ok,
      result.fullRunStage.ok,
      result.fullRunScore.ok,
      result.challengeHitRate.ok,
      result.challengeLosses.ok
    );
  }

  const baselineProgression = progressionOrder(baseline);
  const currentProgression = progressionOrder(current);
  const summary = {
    passedPersonaChecks: allChecks.filter(Boolean).length,
    totalPersonaChecks: allChecks.length,
    baselineProgressionOrderPreserved: baselineProgression.every(entry => entry.fullRunStage && entry.fullRunScore && entry.challengeHitRate),
    currentProgressionOrderPreserved: currentProgression.every(entry => entry.fullRunStage && entry.fullRunScore && entry.challengeHitRate)
  };

  const outDir = path.join(OUT_ROOT, `${new Date().toISOString().slice(0, 10)}-${gitShortCommit()}`);
  ensureDir(outDir);
  const report = {
    generatedAt: new Date().toISOString(),
    profile,
    baselineRoot: path.relative(ROOT, baselineRoot),
    currentRoot: path.relative(ROOT, currentRoot),
    baseline,
    current,
    checks,
    progression: {
      baseline: baselineProgression,
      current: currentProgression
    },
    summary
  };

  const reportFile = path.join(outDir, 'report.json');
  const readmeFile = path.join(outDir, 'README.md');
  writeJson(reportFile, report);
  fs.writeFileSync(readmeFile, buildReadme(report));
  console.log(JSON.stringify({
    ok: summary.passedPersonaChecks === summary.totalPersonaChecks && summary.currentProgressionOrderPreserved,
    outDir,
    report: reportFile,
    readme: readmeFile,
    summary
  }, null, 2));
}

main();
