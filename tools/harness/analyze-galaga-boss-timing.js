#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-boss-timing');
const RUN_OUT = path.join(ROOT, 'harness-artifacts', 'boss-timing');

function git(...args){
  return execFileSync('git', ['-C', ROOT, ...args.flat()], { encoding: 'utf8' }).trim();
}
function ensureDir(dir){ fs.mkdirSync(dir, { recursive: true }); }
function writeJson(file, data){ fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`); }
function readJson(file){ return JSON.parse(fs.readFileSync(file, 'utf8')); }
function firstEvent(events, predicate){ return events.find(predicate) || null; }
function delta(from, to){
  if(!from || !to) return null;
  return +((to.t || 0) - (from.t || 0)).toFixed(3);
}
function writeTempScenario(name, spec){
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `aurora-boss-timing-${name}-`));
  const file = path.join(dir, `${name}.json`);
  fs.writeFileSync(file, `${JSON.stringify(spec, null, 2)}\n`);
  return file;
}
function runScenario(name, spec){
  ensureDir(RUN_OUT);
  const before = new Set(fs.readdirSync(RUN_OUT));
  const scenarioFile = writeTempScenario(name, spec);
  const stdout = execFileSync('node', [
    path.join(ROOT, 'tools', 'harness', 'run-gameplay.js'),
    '--scenario', scenarioFile,
    '--out', RUN_OUT,
    '--auto-video', '0'
  ], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10
  });
  const summary = JSON.parse(stdout);
  const after = fs.readdirSync(RUN_OUT);
  const created = after.filter(entry => !before.has(entry)).sort();
  const outDir = created.length ? path.join(RUN_OUT, created[created.length - 1]) : null;
  return { summary, outDir };
}
function loadSession(run){
  const files = fs.readdirSync(run.outDir);
  const sessionName = files.find(file => file.endsWith('.json') && file.startsWith('neo-galaga-session-') && !file.endsWith('-system-status.json'));
  return readJson(path.join(run.outDir, sessionName)).session;
}

function bossFirstHitScenario(){
  return {
    name: 'boss-first-hit-timing',
    seed: 41001,
    duration: 1.6,
    config: { stage: 1, ships: 3, challenge: false, audioTheme: 'galaga-reference-assets' },
    actions: [
      { t: 0.1, action: 'harness', method: 'setupBossFirstHitTest', args: { stage: 1, bossX: 140, bossY: 112 } },
      { t: 0.24, action: 'harness', method: 'triggerBossFirstHit' }
    ]
  };
}

function bossDeathScenario(){
  return {
    name: 'boss-death-timing',
    seed: 41002,
    duration: 2.2,
    config: { stage: 1, ships: 3, challenge: false, audioTheme: 'galaga-reference-assets' },
    actions: [
      { t: 0.1, action: 'harness', method: 'setupBossDeathTest', args: { stage: 1, bossX: 140, bossY: 112 } },
      { t: 0.16, action: 'harness', method: 'triggerAudioCue', args: { name: 'stagePulse', opts: { phase: 'stage', challenge: false } } },
      { t: 0.32, action: 'harness', method: 'triggerBossDeath' }
    ]
  };
}

function bossFirstHitMetrics(session){
  const events = session.events || [];
  const damage = firstEvent(events, e => e.type === 'enemy_damaged' && e.enemyType === 'boss');
  const cue = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'bossHit');
  const trigger = firstEvent(events, e => e.type === 'harness_trigger_boss_first_hit');
  return {
    triggerToDamage: delta(trigger, damage),
    damageToCue: delta(damage, cue),
    triggerToCue: delta(trigger, cue)
  };
}

function bossDeathMetrics(session){
  const events = session.events || [];
  const pulse = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'stagePulse');
  const killed = firstEvent(events, e => e.type === 'enemy_killed' && e.enemyType === 'boss');
  const cue = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'bossBoom');
  const trigger = firstEvent(events, e => e.type === 'harness_trigger_boss_death');
  return {
    triggerToKill: delta(trigger, killed),
    killToCue: delta(killed, cue),
    triggerToCue: delta(trigger, cue),
    pulseBeforeBossBoom: delta(pulse, cue)
  };
}

function buildReadme(report){
  return [
    '# Galaga Boss Timing',
    '',
    'This report measures the Aurora boss-hit and boss-death cue windows so the',
    'boss event family can be tuned from repeatable evidence instead of visual guesswork.',
    '',
    '## Boss first hit',
    `- Trigger to damage event: ${String(report.firstHit.triggerToDamage)}`,
    `- Damage event to boss-hit cue: ${String(report.firstHit.damageToCue)}`,
    `- Trigger to boss-hit cue: ${String(report.firstHit.triggerToCue)}`,
    '',
    '## Boss death',
    `- Trigger to kill event: ${String(report.death.triggerToKill)}`,
    `- Kill event to boss-boom cue: ${String(report.death.killToCue)}`,
    `- Trigger to boss-boom cue: ${String(report.death.triggerToCue)}`,
    `- Stage pulse before boss-boom cue: ${String(report.death.pulseBeforeBossBoom)}`,
    '',
    '## Outputs',
    `- Metrics JSON: \`${report.files.metrics}\``,
    `- This README: \`${report.files.readme}\``,
    `- Run root: \`${report.files.runRoot}\``
  ].join('\n') + '\n';
}

function main(){
  const shortCommit = git('rev-parse', '--short', 'HEAD');
  const fullCommit = git('rev-parse', 'HEAD');
  const stamp = new Date().toISOString().slice(0, 10);
  const outDir = path.join(OUT_ROOT, `${stamp}-main-${shortCommit}`);
  ensureDir(outDir);

  const firstHitRun = runScenario('boss-first-hit', bossFirstHitScenario());
  const deathRun = runScenario('boss-death', bossDeathScenario());

  const report = {
    generatedAt: new Date().toISOString(),
    commit: fullCommit,
    shortCommit,
    firstHit: bossFirstHitMetrics(loadSession(firstHitRun)),
    death: bossDeathMetrics(loadSession(deathRun)),
    files: {
      metrics: path.join(outDir, 'metrics.json'),
      readme: path.join(outDir, 'README.md'),
      runRoot: RUN_OUT
    },
    runs: {
      firstHit: { outDir: firstHitRun.outDir },
      death: { outDir: deathRun.outDir }
    }
  };

  writeJson(report.files.metrics, report);
  fs.writeFileSync(report.files.readme, buildReadme(report));
  process.stdout.write(JSON.stringify({ ok: true, outDir, metrics: report.files.metrics, readme: report.files.readme }, null, 2));
  process.stdout.write('\n');
}

main();
