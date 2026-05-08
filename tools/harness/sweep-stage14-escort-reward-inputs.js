#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(ROOT, 'tools', 'harness', 'run-gameplay.js');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'stage14-escort-reward-input-sweep');

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
    { t: 0.45, action: 'down', code: 'Space' },
    { t: 0.65, action: 'down', code: 'ArrowLeft' }
  ];
}

function scenarioFor(candidate){
  const actions = baseActions();
  if(candidate.releaseLeftAt != null){
    actions.push({ t: candidate.releaseLeftAt, action: 'up', code: 'ArrowLeft' });
  }
  if(candidate.rightAt != null){
    actions.push({ t: candidate.rightAt, action: 'down', code: 'ArrowRight' });
    actions.push({ t: +(candidate.rightAt + candidate.rightHold).toFixed(2), action: 'up', code: 'ArrowRight' });
  }
  if(candidate.leftAgainAt != null){
    actions.push({ t: candidate.leftAgainAt, action: 'down', code: 'ArrowLeft' });
    actions.push({ t: +(candidate.leftAgainAt + candidate.leftAgainHold).toFixed(2), action: 'up', code: 'ArrowLeft' });
  }
  if(candidate.fireUpAt != null){
    actions.push({ t: candidate.fireUpAt, action: 'up', code: 'Space' });
  }else{
    actions.push({ t: 23.5, action: 'up', code: 'Space' });
  }
  return {
    name: candidate.id,
    seed: 14014,
    duration: 24,
    config: { stage: 14, ships: 5, challenge: false },
    actions: actions.sort((a, b) => a.t - b.t || String(a.code).localeCompare(String(b.code)))
  };
}

function candidates(){
  const out = [
    { id: 'baseline-stage14-route', releaseLeftAt: 2.4, rightAt: 2.45, rightHold: 2.75, leftAgainAt: 5.25, leftAgainHold: 3.45 },
    { id: 'hold-left-through-escort', releaseLeftAt: 3.55 },
    { id: 'center-before-escort', releaseLeftAt: 1.95 },
    { id: 'short-right-before-escort', releaseLeftAt: 2.05, rightAt: 2.06, rightHold: 0.5 },
    { id: 'right-through-boss-line', releaseLeftAt: 2.25, rightAt: 2.26, rightHold: 1.05 },
    { id: 'right-then-left-recover', releaseLeftAt: 2.25, rightAt: 2.26, rightHold: 1.05, leftAgainAt: 4.55, leftAgainHold: 1.35 }
  ];
  for(const release of [1.75, 2.0, 2.25, 2.5, 2.75, 3.0]){
    for(const hold of [0.35, 0.65, 0.95, 1.25, 1.55]){
      out.push({
        id: `right-r${String(release).replace('.', '-')}-h${String(hold).replace('.', '-')}`,
        releaseLeftAt: release,
        rightAt: +(release + 0.01).toFixed(2),
        rightHold: hold
      });
    }
  }
  for(const release of [2.0, 2.35, 2.7]){
    for(const hold of [0.65, 1.05, 1.45]){
      for(const leftAgain of [4.2, 4.55, 4.9]){
        out.push({
          id: `recover-r${String(release).replace('.', '-')}-h${String(hold).replace('.', '-')}-l${String(leftAgain).replace('.', '-')}`,
          releaseLeftAt: release,
          rightAt: +(release + 0.01).toFixed(2),
          rightHold: hold,
          leftAgainAt: leftAgain,
          leftAgainHold: 1.1
        });
      }
    }
  }
  return out;
}

function loadSession(summary){
  const file = (summary.files || []).find(f => f.endsWith('.json') && !f.endsWith('-system-status.json'));
  if(!file) return null;
  return readJson(file).session || null;
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
  const escortKills = events.filter(event => event.type === 'enemy_killed' && event.enemyType === 'but' && event.dive);
  const rewardWindows = events.filter(event => event.type === 'late_reward_squadron_window');
  const firstRewardWindow = rewardWindows[0] || null;
  const firstSpecial = first(events, event => event.type === 'special_attack_bonus');
  const collisionLosses = losses.filter(loss => loss.cause === 'enemy_collision');
  const bulletLosses = losses.filter(loss => loss.cause === 'enemy_bullet');
  const stageMetrics = analysis.stageMetrics?.['14'] || {};
  const score = summary.state?.score || 0;
  const lives = summary.state?.lives || 0;
  const score10 = round(10 * Math.min(1,
    (0.34 * Math.min(1, (special.count || 0) / 1))
    + (0.18 * Math.min(1, bossDamage.length / 2))
    + (0.14 * Math.min(1, bossKills.length / 1))
    + (0.12 * Math.min(1, escortKills.length / 2))
    + (0.1 * Math.min(1, rewardWindows.length / 1))
    + (0.07 * Math.min(1, score / 1800))
    + (0.05 * (collisionLosses.length ? 0 : 1))
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
    bulletLosses: bulletLosses.length,
    specialAttackCount: special.count || 0,
    specialAttackBonus: special.totalBonus || 0,
    bossDamageCount: bossDamage.length,
    bossKillCount: bossKills.length,
    escortDiveKillCount: escortKills.length,
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
    '# Stage 14 Escort Reward Input Sweep',
    '',
    'This artifact searches deterministic player routes around the natural Stage 14 wide-escort boss attack before changing late-stage gameplay tuning.',
    '',
    `- Score: ${report.summary.score10}/10`,
    `- Candidates tested: ${report.summary.tested}`,
    `- Candidates with natural special bonus: ${report.summary.specialBonusCandidates}`,
    `- Candidates with boss damage: ${report.summary.bossDamageCandidates}`,
    `- Candidates with diving boss kill: ${report.summary.bossKillCandidates}`,
    `- Best candidate: ${best ? `\`${best.id}\` (${best.score10}/10)` : 'none'}`,
    '',
    '## Interpretation',
    '',
    report.interpretation,
    '',
    '## Top Candidates',
    ''
  ];
  for(const item of report.results.slice(0, 10)){
    lines.push(`- \`${item.id}\`: score ${item.score10}/10, game score ${item.score}, special ${item.specialAttackCount}, boss damage ${item.bossDamageCount}, boss kills ${item.bossKillCount}, escort dive kills ${item.escortDiveKillCount}, losses ${item.losses}, bullet losses ${item.bulletLosses}`);
  }
  return `${lines.join('\n')}\n`;
}

function main(){
  ensureDir(OUT_ROOT);
  const commit = gitShortCommit();
  const stamp = new Date().toISOString().slice(0, 10);
  const outDir = path.join(OUT_ROOT, `${stamp}-${commit}`);
  const scenarioDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aurora-stage14-escort-scenarios-'));
  const runRoot = path.join(outDir, 'runs');
  ensureDir(runRoot);

  const rawResults = candidates().map(candidate => runCandidate(candidate, scenarioDir, runRoot));
  const results = rawResults
    .filter(item => item.ok)
    .sort((a, b) => (b.score10 - a.score10) || (b.specialAttackCount - a.specialAttackCount) || (b.bossKillCount - a.bossKillCount) || (b.bossDamageCount - a.bossDamageCount) || (a.losses - b.losses) || (b.score - a.score));
  const failed = rawResults.filter(item => !item.ok);
  const best = results[0] || null;
  const specialBonusCandidates = results.filter(item => item.specialAttackCount > 0).length;
  const bossDamageCandidates = results.filter(item => item.bossDamageCount > 0).length;
  const bossKillCandidates = results.filter(item => item.bossKillCount > 0).length;
  const interpretation = specialBonusCandidates
    ? 'At least one deterministic route can harvest the natural Stage 14 wide-escort reward. Promote the best route into outcome probes and compare player-skill opportunity before gameplay tuning.'
    : bossKillCandidates
      ? 'The natural Stage 14 boss can be killed but not converted to a special reward in this input search. Next work should inspect escort survival/readability before tuning score mechanics.'
      : bossDamageCandidates
        ? 'The natural Stage 14 boss can be damaged but not converted to a boss kill or special reward in this route space. This points to a reward-readability or shot-window gap.'
        : 'The searched input routes do not expose Stage 14 boss reward damage. This supports treating the late escort window as a gameplay or visibility gap, not just a route-selection gap.';
  const report = {
    generatedAt: new Date().toISOString(),
    commit,
    problem: 'Stage 14 has a visible wide-escort boss window, but current level-arc evidence does not yet show whether skilled play can convert it into a Galaga-like high-value reward.',
    strategy: 'Search deterministic player input routes around the natural Stage 14 escort timing, preserving run logs for every candidate before changing gameplay tuning.',
    successMeasure: 'Find at least one natural route with special_attack_bonus, or at minimum a boss kill/damage path with bounded loss cost; otherwise promote the failure as a measured late-stage reward gap.',
    summary: {
      score10: best ? best.score10 : 0,
      tested: rawResults.length,
      passed: results.length,
      failed: failed.length,
      specialBonusCandidates,
      bossDamageCandidates,
      bossKillCandidates,
      bestCandidate: best ? {
        id: best.id,
        score10: best.score10,
        score: best.score,
        losses: best.losses,
        collisionLosses: best.collisionLosses,
        bulletLosses: best.bulletLosses,
        specialAttackCount: best.specialAttackCount,
        specialAttackBonus: best.specialAttackBonus,
        bossDamageCount: best.bossDamageCount,
        bossKillCount: best.bossKillCount,
        escortDiveKillCount: best.escortDiveKillCount
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
    bossKillCandidates,
    bestCandidate: report.summary.bestCandidate
  }, null, 2));
}

main();
