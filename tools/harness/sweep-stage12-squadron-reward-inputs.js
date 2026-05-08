#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(ROOT, 'tools', 'harness', 'run-gameplay.js');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'stage12-squadron-reward-input-sweep');

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function rel(file){
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function round(value, digits = 3){
  return Number.isFinite(value) ? +value.toFixed(digits) : 0;
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function baseActions(){
  return [
    { t: 0.5, action: 'down', code: 'Space' },
    { t: 0.7, action: 'down', code: 'ArrowLeft' },
    { t: 2.6, action: 'up', code: 'ArrowLeft' },
    { t: 2.61, action: 'down', code: 'ArrowRight' },
    { t: 5.2, action: 'up', code: 'ArrowRight' },
    { t: 5.21, action: 'down', code: 'ArrowLeft' }
  ];
}

function scenarioFor(candidate){
  const actions = baseActions();
  if(candidate.releaseLeftAt != null){
    actions.push({ t: candidate.releaseLeftAt, action: 'up', code: 'ArrowLeft' });
  }
  if(candidate.rightAt != null){
    actions.push({ t: candidate.rightAt, action: 'down', code: 'ArrowRight' });
    actions.push({ t: candidate.rightAt + candidate.rightHold, action: 'up', code: 'ArrowRight' });
  }
  actions.push({ t: 23.5, action: 'up', code: 'Space' });
  return {
    name: candidate.id,
    seed: 12003,
    duration: 24,
    config: { stage: 12, ships: 5, challenge: false },
    actions: actions.sort((a, b) => a.t - b.t || String(a.code).localeCompare(String(b.code)))
  };
}

function candidates(){
  const out = [
    { id: 'baseline-left-edge', releaseLeftAt: 8.4 },
    { id: 'hold-left-through-squadron', releaseLeftAt: 11.4 },
    { id: 'release-left-before-squadron', releaseLeftAt: 7.6 },
    { id: 'center-before-squadron', releaseLeftAt: 5.22 },
    { id: 'right-early-short', releaseLeftAt: 7.2, rightAt: 7.21, rightHold: 0.65 },
    { id: 'right-early-medium', releaseLeftAt: 7.2, rightAt: 7.21, rightHold: 1.15 },
    { id: 'right-early-long', releaseLeftAt: 7.2, rightAt: 7.21, rightHold: 1.75 }
  ];
  for(const start of [7.6, 8.0, 8.35, 8.7, 9.0]){
    for(const hold of [0.45, 0.8, 1.15, 1.5, 1.9]){
      out.push({
        id: `right-s${String(start).replace('.', '-')}-h${String(hold).replace('.', '-')}`,
        releaseLeftAt: start,
        rightAt: +(start + 0.01).toFixed(2),
        rightHold: hold
      });
    }
  }
  return out;
}

function loadSession(summary){
  const file = (summary.files || []).find(f => f.endsWith('.json') && !f.endsWith('-system-status.json'));
  if(!file) return null;
  return readJson(file).session || null;
}

function count(events, type, pred = () => true){
  return events.filter(event => event.type === type && pred(event)).length;
}

function first(events, pred){
  return events.find(pred) || null;
}

function summarizeRun(candidate, summary){
  const session = loadSession(summary);
  const events = session?.events || [];
  const analysis = summary.analysis || {};
  const losses = analysis.shipLost || [];
  const special = analysis.specialAttackMetrics || {};
  const bossDamage = events.filter(event => event.type === 'enemy_damaged' && event.enemyType === 'boss');
  const bossKills = events.filter(event => event.type === 'enemy_killed' && event.enemyType === 'boss');
  const rewardWindows = events.filter(event => event.type === 'late_reward_squadron_window');
  const firstRewardWindow = rewardWindows[0] || null;
  const firstSpecial = first(events, event => event.type === 'special_attack_bonus');
  const collisionLosses = losses.filter(loss => loss.cause === 'enemy_collision');
  const stageMetrics = analysis.stageMetrics?.['12'] || {};
  const score = summary.state?.score || 0;
  const lives = summary.state?.lives || 0;
  const score10 = round(10 * Math.min(1,
    (0.36 * Math.min(1, (special.count || 0) / 1))
    + (0.2 * Math.min(1, bossDamage.length / 2))
    + (0.18 * Math.min(1, score / 1800))
    + (0.14 * Math.min(1, rewardWindows.length / 1))
    + (0.12 * (collisionLosses.length ? 0 : 1))
  ), 1);
  return {
    id: candidate.id,
    route: candidate,
    score10,
    score,
    lives,
    attacks: stageMetrics.attacks || 0,
    bullets: stageMetrics.bullets || 0,
    kills: stageMetrics.kills || 0,
    losses: losses.length,
    collisionLosses: collisionLosses.length,
    specialAttackCount: special.count || 0,
    specialAttackBonus: special.totalBonus || 0,
    bossDamageCount: bossDamage.length,
    bossKillCount: bossKills.length,
    rewardWindowCount: rewardWindows.length,
    firstRewardWindow: firstRewardWindow ? {
      t: firstRewardWindow.t,
      lane: firstRewardWindow.lane,
      playerLane: firstRewardWindow.playerLane,
      escorts: firstRewardWindow.escorts,
      bossVx: firstRewardWindow.bossVx,
      bossVy: firstRewardWindow.bossVy
    } : null,
    firstSpecial: firstSpecial ? {
      t: firstSpecial.t,
      bonus: firstSpecial.bonus,
      escorts: firstSpecial.escorts
    } : null,
    firstLoss: losses[0] ? {
      t: round(losses[0].t),
      cause: losses[0].cause,
      sourceType: losses[0].sourceType,
      sourceDive: losses[0].sourceDive,
      sourceAttackMode: losses[0].sourceAttackMode,
      playerLane: losses[0].playerLane,
      sourceLane: losses[0].sourceLane
    } : null,
    files: (summary.files || []).map(rel)
  };
}

function runCandidate(candidate, scenarioDir, runRoot){
  const scenarioFile = path.join(scenarioDir, `${candidate.id}.json`);
  writeJson(scenarioFile, scenarioFor(candidate));
  const run = spawnSync(process.execPath, [
    HARNESS,
    '--scenario', scenarioFile,
    '--auto-video', '0',
    '--deterministic-replay', '1',
    '--out', runRoot
  ], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 30
  });
  if(run.status !== 0){
    return {
      id: candidate.id,
      route: candidate,
      ok: false,
      error: {
        status: run.status,
        stdoutTail: String(run.stdout || '').split('\n').slice(-18),
        stderrTail: String(run.stderr || '').split('\n').slice(-18)
      }
    };
  }
  try{
    return Object.assign({ ok: true }, summarizeRun(candidate, JSON.parse(run.stdout.trim())));
  }catch(err){
    return {
      id: candidate.id,
      route: candidate,
      ok: false,
      error: {
        message: err.message,
        stdoutTail: String(run.stdout || '').split('\n').slice(-18),
        stderrTail: String(run.stderr || '').split('\n').slice(-18)
      }
    };
  }
}

function buildReadme(report){
  const best = report.summary.bestCandidate;
  const lines = [
    '# Stage 12 Squadron Reward Input Sweep',
    '',
    'This artifact searches deterministic player routes around the natural Stage 12 boss/escort attack window before changing gameplay tuning.',
    '',
    `- Score: ${report.summary.score10}/10`,
    `- Candidates tested: ${report.summary.tested}`,
    `- Candidates with natural special bonus: ${report.summary.specialBonusCandidates}`,
    `- Candidates with boss damage: ${report.summary.bossDamageCandidates}`,
    `- Best candidate: ${best ? `\`${best.id}\` (${best.score10}/10)` : 'none'}`,
    '',
    '## Interpretation',
    '',
    report.interpretation,
    '',
    '## Top Candidates',
    ''
  ];
  for(const item of report.results.slice(0, 8)){
    lines.push(`- \`${item.id}\`: score ${item.score10}/10, game score ${item.score}, special ${item.specialAttackCount}, boss damage ${item.bossDamageCount}, losses ${item.losses}, collision losses ${item.collisionLosses}`);
  }
  return `${lines.join('\n')}\n`;
}

function main(){
  ensureDir(OUT_ROOT);
  const commit = gitShortCommit();
  const stamp = new Date().toISOString().slice(0, 10);
  const outDir = path.join(OUT_ROOT, `${stamp}-${commit}`);
  const scenarioDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aurora-stage12-squadron-scenarios-'));
  const runRoot = path.join(outDir, 'runs');
  ensureDir(runRoot);

  const rawResults = candidates().map(candidate => runCandidate(candidate, scenarioDir, runRoot));
  const results = rawResults
    .filter(item => item.ok)
    .sort((a, b) => (b.score10 - a.score10) || (b.specialAttackCount - a.specialAttackCount) || (b.bossDamageCount - a.bossDamageCount) || (a.collisionLosses - b.collisionLosses) || (b.score - a.score));
  const failed = rawResults.filter(item => !item.ok);
  const best = results[0] || null;
  const specialBonusCandidates = results.filter(item => item.specialAttackCount > 0).length;
  const bossDamageCandidates = results.filter(item => item.bossDamageCount > 0).length;
  const interpretation = specialBonusCandidates
    ? 'At least one deterministic route can harvest the natural Stage 12 squadron reward. Next work should promote the best route into outcome probes and compare player-skill opportunity against reference reward timing before gameplay tuning.'
    : bossDamageCandidates
      ? 'The natural Stage 12 squadron can be damaged but not converted to a special reward in this input search. Next work should widen the assessed route space or tune readability/spacing with a guarded candidate loop.'
      : 'The searched input routes do not expose a natural Stage 12 boss/escort reward. This supports treating late-stage reward as a gameplay gap rather than only a scenario gap.';
  const report = {
    generatedAt: new Date().toISOString(),
    commit,
    problem: 'Stage 12 has natural boss/escort pressure, but current evidence does not show a player-visible special reward payoff in the late-run cleanup window.',
    strategy: 'Search deterministic player input routes around the natural squadron timing before asking for gameplay tuning, preserving run logs for every candidate.',
    successMeasure: 'Find at least one natural route with special_attack_bonus or boss damage and no added collision-loss spike; otherwise promote the failure as evidence for a guarded gameplay candidate.',
    summary: {
      score10: best ? best.score10 : 0,
      tested: rawResults.length,
      passed: results.length,
      failed: failed.length,
      specialBonusCandidates,
      bossDamageCandidates,
      bestCandidate: best ? {
        id: best.id,
        score10: best.score10,
        score: best.score,
        losses: best.losses,
        collisionLosses: best.collisionLosses,
        specialAttackCount: best.specialAttackCount,
        specialAttackBonus: best.specialAttackBonus,
        bossDamageCount: best.bossDamageCount
      } : null
    },
    interpretation,
    results,
    failed
  };
  writeJson(path.join(outDir, 'report.json'), report);
  fs.writeFileSync(path.join(outDir, 'README.md'), buildReadme(report));
  console.log(JSON.stringify({
    ok: failed.length === 0,
    outDir,
    score10: report.summary.score10,
    tested: report.summary.tested,
    specialBonusCandidates,
    bossDamageCandidates,
    bestCandidate: report.summary.bestCandidate
  }, null, 2));
}

main();
