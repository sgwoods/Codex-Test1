#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-timing-alignment');
const RUN_OUT = path.join(ROOT, 'harness-artifacts', 'timing-alignment');
const STAGE_REF_VIDEO = '/Users/stevenwoods/Downloads/90 stage 1 player galaga example.mp4';
const EXISTING_SCENARIOS = path.join(ROOT, 'tools', 'harness', 'scenarios');

const REFERENCE_CLIPS = {
  gameStart: path.join(ROOT, 'src', 'assets', 'reference-audio', 'galaga2-game-start.m4a'),
  stagePulse: path.join(ROOT, 'src', 'assets', 'reference-audio', 'galaga3-ambience-convoy.m4a'),
  challengeEntry: path.join(ROOT, 'src', 'assets', 'reference-audio', 'galaga2-challenging-stage.m4a'),
  challengeResults: path.join(ROOT, 'src', 'assets', 'reference-audio', 'galaga2-challenging-stage-results.m4a'),
  challengePerfect: path.join(ROOT, 'src', 'assets', 'reference-audio', 'galaga2-challenging-stage-perfect.m4a'),
  playerHit: path.join(ROOT, 'src', 'assets', 'reference-audio', 'galaga3-death.m4a')
};

function git(args){
  return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8' }).trim();
}

function ffprobeDuration(file){
  return +execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file
  ], { encoding: 'utf8' }).trim();
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function firstEvent(events, predicate){
  return events.find(predicate) || null;
}

function latestEvent(events, predicate){
  for(let i = events.length - 1; i >= 0; i--){
    if(predicate(events[i])) return events[i];
  }
  return null;
}

function delta(from, to){
  if(!from || !to) return null;
  return +((to.t || 0) - (from.t || 0)).toFixed(3);
}

function writeTempScenario(name, spec){
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `aurora-timing-${name}-`));
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

function stage1Scenario(){
  const base = readJson(path.join(EXISTING_SCENARIOS, 'stage1-descent.json'));
  base.name = 'timing-stage1-descent';
  base.config.audioTheme = 'galaga-reference-assets';
  return base;
}

function challengeEntryScenario(){
  return {
    name: 'timing-stage2-to-stage3-challenge',
    seed: 9203,
    duration: 4,
    config: {
      stage: 2,
      ships: 3,
      challenge: false,
      audioTheme: 'galaga-reference-assets'
    },
    actions: [
      { t: 0.1, action: 'harness', method: 'setupStageTransitionProbe', args: { stage: 2, mode: 'normal' } }
    ]
  };
}

function challengePerfectScenario(){
  const base = readJson(path.join(EXISTING_SCENARIOS, 'stage3-perfect-transition.json'));
  base.name = 'timing-stage3-perfect-transition';
  base.config.audioTheme = 'galaga-reference-assets';
  return base;
}

function shipLossScenario(){
  return {
    name: 'timing-close-shot-loss',
    seed: 9211,
    duration: 2.4,
    config: {
      stage: 2,
      ships: 3,
      challenge: false,
      audioTheme: 'galaga-reference-assets'
    },
    actions: [
      { t: 0.1, action: 'harness', method: 'setupCloseShotTest', args: { stage: 2, enemyY: 324, enemyVy: 28 } }
    ]
  };
}

function loadSession(run){
  const summary = run.summary;
  const outDir = run.outDir;
  if(!outDir) throw new Error(`Missing outDir for scenario ${summary.name}`);
  const files = fs.readdirSync(outDir);
  const sessionName = files.find(file => file.endsWith('.json') && file.startsWith('neo-galaga-session-') && !file.endsWith('-system-status.json'));
  const sessionPath = sessionName ? path.join(outDir, sessionName) : null;
  if(!sessionPath) throw new Error(`Missing session file for scenario ${summary.name}`);
  return readJson(sessionPath).session;
}

function stage1Metrics(session){
  const events = session.events || [];
  const spawn = firstEvent(events, e => e.type === 'stage_spawn' && e.stage === 1 && !e.challenge);
  const gameStartCue = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'gameStart' && e.stage === 1);
  const stagePulseCue = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'stagePulse' && e.stage === 1);
  const firstAttack = firstEvent(events, e => e.type === 'enemy_attack_start' && e.stage === 1);
  const firstLowerField = firstEvent(events, e => e.type === 'enemy_lower_field' && e.stage === 1);
  return {
    stageSpawnAt: spawn?.t || null,
    gameStartCueAfterSpawn: delta(spawn, gameStartCue),
    firstStagePulseAfterSpawn: delta(spawn, stagePulseCue),
    firstAttackAfterSpawn: delta(spawn, firstAttack),
    firstLowerFieldAfterSpawn: delta(spawn, firstLowerField)
  };
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

function shipLossMetrics(session){
  const events = session.events || [];
  const loss = firstEvent(events, e => e.type === 'ship_lost' && e.stage === 2);
  const cue = latestEvent(events, e => e.type === 'audio_cue' && e.cue === 'playerHit' && e.stage === 2 && loss && Math.abs((e.t || 0) - loss.t) <= 0.5);
  return {
    shipLostAt: loss?.t || null,
    playerHitCueRelativeToLoss: loss && cue ? +((cue.t || 0) - loss.t).toFixed(3) : null
  };
}

function makeContactSheet(outDir){
  const target = path.join(outDir, 'stage1-first-16s-contact.png');
  execFileSync('ffmpeg', [
    '-y',
    '-ss', '0',
    '-t', '16',
    '-i', STAGE_REF_VIDEO,
    '-vf', 'fps=1,scale=360:-1,tile=4x4',
    target
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  return target;
}

function buildReadme(report){
  const lines = [
    '# Galaga Timing Alignment',
    '',
    'This artifact records the first repeatable timing comparison pass between',
    'original Galaga references and Aurora runtime behavior.',
    '',
    '## Goal',
    '',
    '- compare timing, not just clip choice',
    '- keep timing alignment part of polish work',
    '- create a reusable baseline for stage cadence, challenge entry, and loss timing',
    '',
    '## Source references',
    '',
    `- Stage 1 gameplay video: \`${STAGE_REF_VIDEO}\``,
    `- Contact sheet: \`${report.files.contactSheet}\``,
    `- Game start clip: \`${REFERENCE_CLIPS.gameStart}\``,
    `- Convoy cadence clip: \`${REFERENCE_CLIPS.stagePulse}\``,
    `- Challenge entry clip: \`${REFERENCE_CLIPS.challengeEntry}\``,
    `- Challenge results clip: \`${REFERENCE_CLIPS.challengeResults}\``,
    `- Challenge perfect clip: \`${REFERENCE_CLIPS.challengePerfect}\``,
    `- Player hit clip: \`${REFERENCE_CLIPS.playerHit}\``,
    '',
    '## Reference clip durations',
    '',
    `- Game start: ${report.referenceDurations.gameStart.toFixed(3)}s`,
    `- Convoy cadence: ${report.referenceDurations.stagePulse.toFixed(3)}s`,
    `- Challenge entry: ${report.referenceDurations.challengeEntry.toFixed(3)}s`,
    `- Challenge results: ${report.referenceDurations.challengeResults.toFixed(3)}s`,
    `- Challenge perfect: ${report.referenceDurations.challengePerfect.toFixed(3)}s`,
    `- Player hit: ${report.referenceDurations.playerHit.toFixed(3)}s`,
    '',
    '## Aurora timing snapshot',
    '',
    '### Stage 1',
    `- Game start cue after spawn: ${String(report.aurora.stage1.gameStartCueAfterSpawn)}`,
    `- First stage pulse after spawn: ${String(report.aurora.stage1.firstStagePulseAfterSpawn)}`,
    `- First attack after spawn: ${String(report.aurora.stage1.firstAttackAfterSpawn)}`,
    `- First lower-field crossing after spawn: ${String(report.aurora.stage1.firstLowerFieldAfterSpawn)}`,
    '',
    '### Challenge entry probe',
    `- Challenge cue after probe: ${String(report.aurora.challengeEntry.challengeCueAfterProbe)}`,
    `- Challenge spawn after probe: ${String(report.aurora.challengeEntry.challengeSpawnAfterProbe)}`,
    `- Challenge spawn after cue: ${String(report.aurora.challengeEntry.challengeSpawnAfterCue)}`,
    `- First challenge pulse after spawn: ${String(report.aurora.challengeEntry.firstChallengePulseAfterSpawn)}`,
    '',
    '### Challenge perfect transition',
    `- Perfect cue after clear: ${String(report.aurora.challengePerfect.challengePerfectCueAfterClear)}`,
    `- Next-stage cue after clear: ${String(report.aurora.challengePerfect.nextStageCueAfterClear)}`,
    `- Next-stage spawn after clear: ${String(report.aurora.challengePerfect.nextStageSpawnAfterClear)}`,
    `- Next-stage spawn after cue: ${String(report.aurora.challengePerfect.nextStageSpawnAfterCue)}`,
    '',
    '### Ship loss',
    `- Player-hit cue relative to ship_lost event: ${String(report.aurora.shipLoss.playerHitCueRelativeToLoss)}`,
    '',
    '## Initial read',
    '',
    '- This is the first event-level timing pass, not the final truth table.',
    '- Challenge entry and active-play cadence now have measurable Aurora timings instead of subjective notes only.',
    '- The next tuning pass should focus on:',
    '  - challenge entry audibility and placement',
    '  - stage/convoy cadence vs first enemy descent',
    '  - ship-loss audio/visual sync',
    '  - boss cue timing after we add a focused boss-hit probe',
    '',
    '## Outputs',
    '',
    `- Metrics JSON: \`${report.files.metrics}\``,
    `- This README: \`${report.files.readme}\``,
    `- Raw run roots: \`${report.files.runRoot}\``
  ];
  return `${lines.join('\n')}\n`;
}

function main(){
  ensureDir(OUT_ROOT);
  ensureDir(RUN_OUT);
  const stamp = new Date().toISOString().slice(0, 10);
  const shortCommit = git(['rev-parse', '--short', 'HEAD']);
  const outDir = path.join(OUT_ROOT, `${stamp}-main-${shortCommit}`);
  ensureDir(outDir);

  const contactSheet = makeContactSheet(outDir);
  const stage1Run = runScenario('stage1', stage1Scenario());
  const challengeEntryRun = runScenario('challenge-entry', challengeEntryScenario());
  const challengePerfectRun = runScenario('challenge-perfect', challengePerfectScenario());
  const shipLossRun = runScenario('ship-loss', shipLossScenario());

  const report = {
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', 'HEAD']),
    shortCommit,
    referenceDurations: Object.fromEntries(Object.entries(REFERENCE_CLIPS).map(([key, file]) => [key, ffprobeDuration(file)])),
    aurora: {
      stage1: stage1Metrics(loadSession(stage1Run)),
      challengeEntry: challengeEntryMetrics(loadSession(challengeEntryRun)),
      challengePerfect: challengePerfectMetrics(loadSession(challengePerfectRun)),
      shipLoss: shipLossMetrics(loadSession(shipLossRun))
    },
    files: {
      contactSheet,
      metrics: path.join(outDir, 'metrics.json'),
      readme: path.join(outDir, 'README.md'),
      runRoot: RUN_OUT
    },
    runs: {
      stage1: { outDir: stage1Run.outDir },
      challengeEntry: { outDir: challengeEntryRun.outDir },
      challengePerfect: { outDir: challengePerfectRun.outDir },
      shipLoss: { outDir: shipLossRun.outDir }
    }
  };

  writeJson(report.files.metrics, report);
  fs.writeFileSync(report.files.readme, buildReadme(report));
  console.log(JSON.stringify({
    ok: true,
    outDir,
    metrics: report.files.metrics,
    readme: report.files.readme
  }, null, 2));
}

main();
