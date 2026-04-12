#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-audio-overlap');
const RUN_OUT = path.join(ROOT, 'harness-artifacts', 'audio-overlap');
const SCENARIOS = path.join(ROOT, 'tools', 'harness', 'scenarios');

function git(...args){
  return execFileSync('git', ['-C', ROOT, ...args.flat()], { encoding: 'utf8' }).trim();
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function ffprobeDuration(file){
  return +execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file
  ], { encoding: 'utf8' }).trim();
}

function firstEvent(events, predicate){
  return events.find(predicate) || null;
}

function delta(from, to){
  if(!from || !to) return null;
  return +((to.t || 0) - (from.t || 0)).toFixed(3);
}

function overrun(endAt, nextAt){
  if(!Number.isFinite(endAt) || !Number.isFinite(nextAt)) return null;
  return +(endAt - nextAt).toFixed(3);
}

function cueEnd(event, durationMap){
  if(!event) return null;
  const clip = String(event.referenceClip || '').trim();
  if(!clip) return null;
  const duration = durationMap[clip];
  if(!Number.isFinite(duration)) return null;
  return +((event.t || 0) + duration).toFixed(3);
}

function writeTempScenario(name, spec){
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `aurora-audio-overlap-${name}-`));
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
  const outDir = run.outDir;
  if(!outDir) throw new Error(`Missing outDir for scenario ${run.summary?.name || 'unknown'}`);
  const files = fs.readdirSync(outDir);
  const sessionName = files.find(file => file.endsWith('.json') && file.startsWith('neo-galaga-session-') && !file.endsWith('-system-status.json'));
  if(!sessionName) throw new Error(`Missing session file in ${outDir}`);
  return readJson(path.join(outDir, sessionName)).session;
}

function stage1Scenario(){
  const base = readJson(path.join(SCENARIOS, 'stage1-descent.json'));
  base.name = 'audio-overlap-stage1-descent';
  base.config.audioTheme = 'galaga-reference-assets';
  return base;
}

function transitionProbeScenario(stage, mode = 'normal'){
  return {
    name: `audio-overlap-stage${stage}-${mode}`,
    seed: 9310 + stage,
    duration: 6,
    config: {
      stage,
      ships: 3,
      challenge: false,
      audioTheme: 'galaga-reference-assets'
    },
    actions: [
      { t: 0.05, action: 'harness', method: 'triggerAudioCue', args: { name: 'stagePulse', opts: { phase: 'stage', challenge: false } } },
      { t: 0.08, action: 'harness', method: 'setupStageTransitionProbe', args: { stage, mode } }
    ]
  };
}

function challengePerfectScenario(){
  const base = readJson(path.join(SCENARIOS, 'stage3-perfect-transition.json'));
  base.name = 'audio-overlap-stage3-perfect-transition';
  base.config.audioTheme = 'galaga-reference-assets';
  return base;
}

function buildDurationMap(events){
  const clips = [...new Set(events.map(event => String(event.referenceClip || '').trim()).filter(Boolean))];
  return Object.fromEntries(clips.map(clip => [clip, ffprobeDuration(path.join(ROOT, 'dist', 'dev', clip))]));
}

function stage1Metrics(session){
  const events = session.events || [];
  const durations = buildDurationMap(events);
  const spawn = firstEvent(events, e => e.type === 'stage_spawn' && e.stage === 1 && !e.challenge);
  const gameStart = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'gameStart' && e.stage === 1);
  const firstPulse = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'stagePulse' && e.stage === 1);
  const firstDive = firstEvent(events, e => e.type === 'enemy_attack_start' && e.stage === 1 && e.mode === 'dive');
  const firstCharge = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'attackCharge' && e.stage === 1);
  const gameStartEnd = cueEnd(gameStart, durations);
  return {
    gameStartAfterSpawn: delta(spawn, gameStart),
    firstPulseAfterSpawn: delta(spawn, firstPulse),
    firstDiveAfterSpawn: delta(spawn, firstDive),
    firstChargeAfterDive: delta(firstDive, firstCharge),
    gameStartTailPastFirstPulse: overrun(gameStartEnd, firstPulse?.t),
    gameStartTailPastFirstDive: overrun(gameStartEnd, firstDive?.t),
    referenceDurations: durations
  };
}

function transitionProbeMetrics(session, expectedCue, expectedStage, expectedChallenge){
  const events = session.events || [];
  const durations = buildDurationMap(events);
  const probe = firstEvent(events, e => e.type === 'harness_stage_transition_probe_setup');
  const pulse = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'stagePulse');
  const transitionCue = firstEvent(events, e => e.type === 'audio_cue' && e.cue === expectedCue);
  const spawn = firstEvent(events, e => e.type === 'stage_spawn' && e.stage === expectedStage && (!!e.challenge) === !!expectedChallenge);
  const pulseEnd = cueEnd(pulse, durations);
  const transitionEnd = cueEnd(transitionCue, durations);
  return {
    transitionWindow: delta(probe, spawn),
    pulseLeadBeforeProbe: delta(pulse, probe),
    transitionCueAfterProbe: delta(probe, transitionCue),
    spawnAfterTransitionCue: delta(transitionCue, spawn),
    pulseTailPastTransitionCue: overrun(pulseEnd, transitionCue?.t),
    pulseTailPastSpawn: overrun(pulseEnd, spawn?.t),
    transitionCueTailPastSpawn: overrun(transitionEnd, spawn?.t),
    referenceDurations: durations
  };
}

function challengePerfectMetrics(session){
  const events = session.events || [];
  const durations = buildDurationMap(events);
  const clear = firstEvent(events, e => e.type === 'challenge_clear' && e.stage === 3);
  const resultCue = firstEvent(events, e => e.type === 'audio_cue' && (e.cue === 'challengePerfect' || e.cue === 'challengeResults') && e.stage === 3);
  const nextCue = firstEvent(events, e => e.type === 'audio_cue' && e.cue === 'stageTransition' && e.stage === 3);
  const spawn = firstEvent(events, e => e.type === 'stage_spawn' && e.stage === 4);
  const resultEnd = cueEnd(resultCue, durations);
  const nextEnd = cueEnd(nextCue, durations);
  return {
    resultCueAfterClear: delta(clear, resultCue),
    nextCueAfterClear: delta(clear, nextCue),
    spawnAfterClear: delta(clear, spawn),
    resultTailPastNextCue: overrun(resultEnd, nextCue?.t),
    resultTailPastSpawn: overrun(resultEnd, spawn?.t),
    nextCueTailPastSpawn: overrun(nextEnd, spawn?.t),
    referenceDurations: durations
  };
}

function offenderLines(report){
  const offenders = [];
  const add = (label, value) => {
    if(Number.isFinite(value) && value > 0) offenders.push(`- ${label}: overruns by ${value.toFixed(3)}s`);
  };
  add('Stage 1 game-start tail vs first pulse', report.stage1.gameStartTailPastFirstPulse);
  add('Stage 1 game-start tail vs first dive', report.stage1.gameStartTailPastFirstDive);
  add('Stage 1->2 pulse tail vs transition cue', report.stage12.pulseTailPastTransitionCue);
  add('Stage 1->2 transition cue tail vs spawn', report.stage12.transitionCueTailPastSpawn);
  add('Stage 2->3 pulse tail vs challenge cue', report.stage23.pulseTailPastTransitionCue);
  add('Stage 2->3 challenge cue tail vs spawn', report.stage23.transitionCueTailPastSpawn);
  add('Challenge result tail vs next-stage cue', report.challengePerfect.resultTailPastNextCue);
  add('Challenge result tail vs spawn', report.challengePerfect.resultTailPastSpawn);
  add('Next-stage cue tail vs spawn after challenge', report.challengePerfect.nextCueTailPastSpawn);
  return offenders.length ? offenders : ['- No positive cue overruns detected in the current scenarios.'];
}

function buildReadme(report){
  return [
    '# Galaga Audio Overlap Budget',
    '',
    'This report measures whether reference-audio clip tails fit inside Aurora timing windows.',
    'Positive overruns mean a clip is still active when the next cue or the next state begins.',
    '',
    '## Current worst offenders',
    '',
    ...offenderLines(report),
    '',
    '## Stage 1 opening',
    `- Game start after spawn: ${String(report.stage1.gameStartAfterSpawn)}`,
    `- First pulse after spawn: ${String(report.stage1.firstPulseAfterSpawn)}`,
    `- First dive after spawn: ${String(report.stage1.firstDiveAfterSpawn)}`,
    `- Attack-charge cue after dive: ${String(report.stage1.firstChargeAfterDive)}`,
    `- Game-start tail past first pulse: ${String(report.stage1.gameStartTailPastFirstPulse)}`,
    `- Game-start tail past first dive: ${String(report.stage1.gameStartTailPastFirstDive)}`,
    '',
    '## Stage 1 -> 2 transition probe',
    `- Transition window: ${String(report.stage12.transitionWindow)}`,
    `- Pulse lead before probe: ${String(report.stage12.pulseLeadBeforeProbe)}`,
    `- Transition cue after probe: ${String(report.stage12.transitionCueAfterProbe)}`,
    `- Spawn after transition cue: ${String(report.stage12.spawnAfterTransitionCue)}`,
    `- Pulse tail past transition cue: ${String(report.stage12.pulseTailPastTransitionCue)}`,
    `- Pulse tail past spawn: ${String(report.stage12.pulseTailPastSpawn)}`,
    `- Transition cue tail past spawn: ${String(report.stage12.transitionCueTailPastSpawn)}`,
    '',
    '## Stage 2 -> 3 challenge probe',
    `- Transition window: ${String(report.stage23.transitionWindow)}`,
    `- Pulse lead before probe: ${String(report.stage23.pulseLeadBeforeProbe)}`,
    `- Challenge cue after probe: ${String(report.stage23.transitionCueAfterProbe)}`,
    `- Spawn after challenge cue: ${String(report.stage23.spawnAfterTransitionCue)}`,
    `- Pulse tail past challenge cue: ${String(report.stage23.pulseTailPastTransitionCue)}`,
    `- Pulse tail past challenge spawn: ${String(report.stage23.pulseTailPastSpawn)}`,
    `- Challenge cue tail past spawn: ${String(report.stage23.transitionCueTailPastSpawn)}`,
    '',
    '## Challenge perfect -> next stage',
    `- Result cue after clear: ${String(report.challengePerfect.resultCueAfterClear)}`,
    `- Next-stage cue after clear: ${String(report.challengePerfect.nextCueAfterClear)}`,
    `- Spawn after clear: ${String(report.challengePerfect.spawnAfterClear)}`,
    `- Result tail past next-stage cue: ${String(report.challengePerfect.resultTailPastNextCue)}`,
    `- Result tail past spawn: ${String(report.challengePerfect.resultTailPastSpawn)}`,
    `- Next-stage cue tail past spawn: ${String(report.challengePerfect.nextCueTailPastSpawn)}`,
    '',
    '## Outputs',
    `- Metrics JSON: \`${report.files.metrics}\``,
    `- This README: \`${report.files.readme}\``,
    `- Run root: \`${report.files.runRoot}\``,
    ''
  ].join('\n');
}

function main(){
  ensureDir(OUT_ROOT);
  ensureDir(RUN_OUT);
  const stamp = new Date().toISOString().slice(0, 10);
  const shortCommit = git('rev-parse', '--short', 'HEAD');
  const outDir = path.join(OUT_ROOT, `${stamp}-main-${shortCommit}`);
  ensureDir(outDir);

  const stage1Run = runScenario('stage1-opening', stage1Scenario());
  const stage12Run = runScenario('stage1-stage2-probe', transitionProbeScenario(1, 'normal'));
  const stage23Run = runScenario('stage2-stage3-probe', transitionProbeScenario(2, 'normal'));
  const challengePerfectRun = runScenario('challenge-perfect', challengePerfectScenario());

  const report = {
    generatedAt: new Date().toISOString(),
    commit: git('rev-parse', 'HEAD'),
    shortCommit,
    stage1: stage1Metrics(loadSession(stage1Run)),
    stage12: transitionProbeMetrics(loadSession(stage12Run), 'stageTransition', 2, false),
    stage23: transitionProbeMetrics(loadSession(stage23Run), 'challengeTransition', 3, true),
    challengePerfect: challengePerfectMetrics(loadSession(challengePerfectRun)),
    files: {
      metrics: path.join(outDir, 'metrics.json'),
      readme: path.join(outDir, 'README.md'),
      runRoot: RUN_OUT
    },
    runs: {
      stage1: { outDir: stage1Run.outDir },
      stage12: { outDir: stage12Run.outDir },
      stage23: { outDir: stage23Run.outDir },
      challengePerfect: { outDir: challengePerfectRun.outDir }
    }
  };

  writeJson(report.files.metrics, report);
  fs.writeFileSync(report.files.readme, `${buildReadme(report)}\n`);
  console.log(JSON.stringify({
    ok: true,
    outDir,
    metrics: report.files.metrics,
    readme: report.files.readme
  }, null, 2));
}

main();
