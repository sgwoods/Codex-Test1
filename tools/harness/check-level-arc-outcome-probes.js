#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS = path.join(ROOT, 'tools', 'harness', 'run-gameplay.js');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'level-arc-outcome-probes');

const PROBES = [
  { id: 'mid-run-pressure', scenario: 'stage6-regular', expectedStage: 6 },
  { id: 'mid-run-pressure-widened-endpoint', scenario: 'stage6-mid-run-wave-clear', expectedStage: 6 },
  { id: 'mid-run-entry-variant', scenario: 'stage8-entry-variant', expectedStage: 8 },
  { id: 'late-run-cleanup-or-failure', scenario: 'stage12-variety', expectedStage: 12 },
  { id: 'late-run-natural-squadron-reward', scenario: 'stage12-natural-squadron-reward', expectedStage: 12 },
  { id: 'late-run-squadron-reward', scenario: 'stage12-squadron-bonus', expectedStage: 12 },
  { id: 'late-run-escort-variant', scenario: 'stage14-escort-variant', expectedStage: 14 },
  { id: 'late-run-natural-escort-reward', scenario: 'stage14-natural-escort-reward', expectedStage: 14 }
];

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

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function round(value, digits = 3){
  return Number.isFinite(value) ? +value.toFixed(digits) : 0;
}

function loadSession(summary){
  const file = (summary.files || []).find(item => item.endsWith('.json') && !item.endsWith('-system-status.json'));
  if(!file) return null;
  try{
    return readJson(file).session || null;
  }catch{
    return null;
  }
}

function runProbe(probe, runRoot){
  const run = spawnSync(process.execPath, [
    HARNESS,
    '--scenario', probe.scenario,
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
      id: probe.id,
      scenario: probe.scenario,
      ok: false,
      error: {
        status: run.status,
        stdoutTail: String(run.stdout || '').split('\n').slice(-20),
        stderrTail: String(run.stderr || '').split('\n').slice(-20)
      }
    };
  }
  let summary;
  try{
    summary = JSON.parse(run.stdout.trim());
  }catch(err){
    return {
      id: probe.id,
      scenario: probe.scenario,
      ok: false,
      error: {
        message: `could not parse harness stdout: ${err.message}`,
        stdoutTail: String(run.stdout || '').split('\n').slice(-20),
        stderrTail: String(run.stderr || '').split('\n').slice(-20)
      }
    };
  }
  const analysis = summary.analysis || {};
  const session = loadSession(summary);
  const events = session?.events || [];
  const stageMetrics = analysis.stageMetrics?.[String(probe.expectedStage)] || {};
  const losses = analysis.shipLost || [];
  const collisionLosses = losses.filter(loss => loss.cause === 'enemy_collision');
  const stageClears = analysis.stageClears || [];
  const bossDamage = events.filter(event => event.type === 'enemy_damaged' && event.enemyType === 'boss');
  const bossKills = events.filter(event => event.type === 'enemy_killed' && event.enemyType === 'boss');
  const escortDiveKills = events.filter(event => event.type === 'enemy_killed' && event.enemyType === 'but' && event.dive);
  const attacks = stageMetrics.attacks || 0;
  const bullets = stageMetrics.bullets || 0;
  const duration = summary.duration || analysis.duration || 1;
  return {
    id: probe.id,
    scenario: probe.scenario,
    ok: true,
    expectedStage: probe.expectedStage,
    duration,
    state: summary.state,
    score: summary.state?.score || 0,
    lives: summary.state?.lives || 0,
    attacks,
    bullets,
    kills: stageMetrics.kills || 0,
    losses: losses.length,
    collisionLosses: collisionLosses.length,
    clears: stageClears.length,
    bulletsPerAttack: round(analysis.bulletPressure?.byStage?.[String(probe.expectedStage)]?.bulletsPerAttack || 0),
    avgAttackersOnScreenAtLoss: round(analysis.bulletPressure?.byStage?.[String(probe.expectedStage)]?.avgAttackersOnScreenAtLoss || 0),
    avgRecentEnemyBulletsAtLoss: round(analysis.bulletPressure?.byStage?.[String(probe.expectedStage)]?.avgRecentEnemyBulletsAtLoss || 0),
    specialAttackCount: analysis.specialAttackMetrics?.count || 0,
    specialAttackBonus: analysis.specialAttackMetrics?.totalBonus || 0,
    bossDamageCount: bossDamage.length,
    bossKillCount: bossKills.length,
    escortDiveKillCount: escortDiveKills.length,
    lossSignatures: losses.map(loss => ({
      t: round(loss.t),
      stageClock: round(loss.stageClock),
      cause: loss.cause,
      sourceType: loss.sourceType,
      sourceDive: loss.sourceDive,
      sourceAttackMode: loss.sourceAttackMode,
      playerLane: loss.playerLane,
      sourceLane: loss.sourceLane,
      sourceColumn: loss.sourceColumn,
      recentAttackStarts: loss.recentAttackStarts,
      recentEnemyBullets: loss.recentEnemyBullets
    })),
    files: (summary.files || []).map(rel)
  };
}

function scoreProbe(probe){
  if(!probe.ok) return 0;
  const endpoint = probe.losses || probe.clears ? 1 : 0;
  const pressure = Math.min(1, ((probe.attacks || 0) / Math.max(probe.duration, 1)) / 1.2);
  const reward = Math.min(1, (probe.score || 0) / 1200);
  const special = Math.min(1, (probe.specialAttackCount || 0) / 2);
  return round(10 * ((0.3 * endpoint) + (0.25 * pressure) + (0.25 * reward) + (0.2 * special)), 1);
}

function buildReadme(report){
  const lines = [
    '# Level Arc Outcome Probes',
    '',
    'This artifact records deterministic gameplay outcomes for mid and late windows so level-arc planning can separate visual/signature variety from actual loss, clear, score, and reward opportunity behavior.',
    '',
    `- Score: ${report.summary.score10}/10`,
    `- Probes: ${report.summary.passed}/${report.summary.total}`,
    `- Windows with endpoint evidence: ${report.summary.endpointWindows}/${report.summary.total}`,
    `- Windows with collision-loss pressure: ${report.summary.collisionLossWindows}/${report.summary.total}`,
    `- Windows with special reward evidence: ${report.summary.rewardWindows}/${report.summary.total}`,
    `- Total special reward bonus: ${report.summary.totalSpecialAttackBonus}`,
    '',
    '## Probe Results',
    ''
  ];
  for(const probe of report.probes){
    lines.push(`### ${probe.id}`);
    lines.push(`- Scenario: \`${probe.scenario}\``);
    lines.push(`- OK: ${probe.ok ? 'yes' : 'no'}`);
    if(probe.ok){
      lines.push(`- Score: ${probe.score}`);
      lines.push(`- Lives: ${probe.lives}`);
      lines.push(`- Attacks: ${probe.attacks}`);
      lines.push(`- Enemy bullets: ${probe.bullets}`);
      lines.push(`- Losses: ${probe.losses}`);
      lines.push(`- Clears: ${probe.clears}`);
      lines.push(`- Collision losses: ${probe.collisionLosses}`);
      lines.push(`- Special attack count: ${probe.specialAttackCount}`);
      lines.push(`- Boss damage count: ${probe.bossDamageCount}`);
      lines.push(`- Boss kill count: ${probe.bossKillCount}`);
      lines.push(`- Escort dive kill count: ${probe.escortDiveKillCount}`);
      if(probe.lossSignatures.length){
        lines.push(`- First loss: \`${JSON.stringify(probe.lossSignatures[0])}\``);
      }
    }else{
      lines.push(`- Error: \`${probe.error?.message || probe.error?.status || 'unknown'}\``);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function main(){
  ensureDir(OUT_ROOT);
  const stamp = new Date().toISOString().slice(0, 10);
  const commit = gitShortCommit();
  const outDir = path.join(OUT_ROOT, `${stamp}-${commit}`);
  const runRoot = path.join(outDir, 'runs');
  ensureDir(runRoot);
  const probes = PROBES.map(probe => Object.assign(runProbe(probe, runRoot), {
    outcomeScore10: null
  })).map(probe => Object.assign(probe, { outcomeScore10: scoreProbe(probe) }));
  const passed = probes.filter(probe => probe.ok).length;
  const endpointWindows = probes.filter(probe => probe.ok && (probe.losses || probe.clears)).length;
  const collisionLossWindows = probes.filter(probe => probe.ok && probe.collisionLosses).length;
  const rewardWindows = probes.filter(probe => probe.ok && probe.specialAttackCount).length;
  const totalSpecialAttackBonus = probes.reduce((sum, probe) => sum + (+probe.specialAttackBonus || 0), 0);
  const score10 = round(probes.reduce((sum, probe) => sum + probe.outcomeScore10, 0) / Math.max(probes.length, 1), 1);
  const report = {
    generatedAt: new Date().toISOString(),
    commit,
    problem: 'Level-arc evidence needs outcome semantics, not only visual pressure traces, because a Galaga-like arc depends on learnable losses, clears, and score/reward opportunities.',
    strategy: 'Replay representative mid and late scenarios deterministically, preserve session logs, and summarize endpoint evidence alongside attack and reward signals.',
    successMeasure: 'Each long-run window should have endpoint evidence or an explicit reason it is a pressure-only window; late windows should include measurable collision/clear/reward semantics before gameplay tuning.',
    summary: {
      score10,
      total: probes.length,
      passed,
      endpointWindows,
      collisionLossWindows,
      rewardWindows,
      totalSpecialAttackBonus
    },
    probes
  };
  writeJson(path.join(outDir, 'report.json'), report);
  fs.writeFileSync(path.join(outDir, 'README.md'), buildReadme(report));
  console.log(JSON.stringify({ ok: passed === probes.length, outDir, score10, endpointWindows, collisionLossWindows, rewardWindows, totalSpecialAttackBonus }, null, 2));
  if(passed !== probes.length) process.exit(1);
}

main();
