#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage, ensureLaneBuildFresh, APP_ROOT, ROOT } = require('./browser-check-util');

const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-cadence-perfect-route-risk');
const PLAY_W = 280;
const PLAY_H = 360;
const CHALLENGE_STAGES = [3, 7, 11, 15, 19, 23, 27, 31];
const PERSONAS = [
  { id: 'novice', label: 'Beginner' },
  { id: 'advanced', label: 'Intermediate' },
  { id: 'expert', label: 'Expert' },
  { id: 'professional', label: 'Professional' }
];
const SUCCESS_TRAJECTORY = Object.freeze({
  novice: [75, 60, 45, 30, 15, 0, 0, 0, 0, 0],
  advanced: [85, 75, 65, 55, 45, 35, 25, 15, 5, 0],
  expert: [95, 88, 81, 74, 67, 60, 53, 46, 39, 32],
  professional: [100, 95, 90, 85, 80, 75, 70, 65, 60, 55]
});
const TRANSITION_PROBES = [
  { id: 'regular-stage-1-to-2', label: 'Regular stage 1 to stage 2', stage: 1, mode: 'normal' },
  { id: 'regular-stage-4-to-5', label: 'Regular stage 4 to stage 5', stage: 4, mode: 'normal' },
  { id: 'challenge-entry-stage-2-to-3', label: 'Challenge entry stage 2 to stage 3', stage: 2, mode: 'normal' }
];

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function round(value, places = 3){
  if(!Number.isFinite(+value)) return null;
  const scale = 10 ** places;
  return Math.round(+value * scale) / scale;
}

function average(values){
  const nums = values.filter(value => Number.isFinite(+value));
  return nums.length ? nums.reduce((sum, value) => sum + value, 0) / nums.length : null;
}

function percentile(values, p){
  const nums = values.filter(value => Number.isFinite(+value)).sort((a, b) => a - b);
  if(!nums.length) return null;
  const idx = Math.min(nums.length - 1, Math.max(0, Math.ceil((p / 100) * nums.length) - 1));
  return nums[idx];
}

function enemyBaseDims(type){
  if(type === 'boss') return { w: 38, h: 30 };
  if(type === 'but') return { w: 34, h: 27 };
  if(type === 'rogue') return { w: 35, h: 28 };
  return { w: 32, h: 26 };
}

function proxyBoxes(enemy, stage){
  const dims = enemyBaseDims(enemy.type);
  const challengeScale = stage === 3 ? 0.74 : 0.7;
  return {
    sprite: {
      halfW: dims.w / 2,
      halfH: dims.h / 2
    },
    scoreWindow: {
      halfW: dims.w * challengeScale,
      halfH: dims.h * challengeScale
    }
  };
}

function insideBox(enemy, box){
  return enemy.x - box.halfW >= 0 &&
    enemy.x + box.halfW <= PLAY_W &&
    enemy.y - box.halfH >= 0 &&
    enemy.y + box.halfH <= PLAY_H;
}

function insideCenter(enemy){
  return enemy.x >= 0 && enemy.x <= PLAY_W && enemy.y >= 0 && enemy.y <= PLAY_H;
}

function eventCount(events, type, challengeOnly = false){
  return events.filter(event => event.type === type && (!challengeOnly || !!event.challenge)).length;
}

function lastEvent(events, type){
  return [...events].reverse().find(event => event.type === type) || null;
}

function challengeNumberForStage(stage){
  const index = CHALLENGE_STAGES.indexOf(stage);
  return index >= 0 ? index + 1 : null;
}

function targetFor(personaId, challengeNumber){
  const values = SUCCESS_TRAJECTORY[personaId] || [];
  const raw = values[Math.max(0, challengeNumber - 1)];
  return Number.isFinite(+raw) ? Math.max(0, +raw) / 100 : null;
}

async function measureTransitionProbes(page){
  const rows = [];
  for(const probe of TRANSITION_PROBES){
    const row = await page.evaluate(({ probe }) => {
      const api = window.__galagaHarness__;
      api.stop(`before-${probe.id}`);
      const setup = api.setupStageTransitionProbe({ stage: probe.stage, mode: probe.mode });
      api.advanceFor(setup.nextStageT + 0.25, { step: 1 / 60, stopOnGameOver: false });
      const state = api.state();
      const events = api.sessionEvents(200);
      const setupEvent = [...events].reverse().find(event => event.type === 'harness_stage_transition_probe_setup') || null;
      const runEvents = setupEvent
        ? events.slice(events.indexOf(setupEvent))
        : events;
      const started = [...runEvents].reverse().find(event => event.type === 'challenge_transition_started') || null;
      const commit = [...runEvents].reverse().find(event => event.type === 'challenge_transition_spawn_commit') || null;
      const spawn = [...runEvents].reverse().find(event => event.type === 'stage_spawn') || null;
      return {
        setup,
        state,
        events: runEvents,
        started,
        commit,
        spawn
      };
    }, { probe });
    rows.push({
      id: probe.id,
      label: probe.label,
      stage: probe.stage,
      mode: probe.mode,
      targetStage: row.started?.targetStage ?? row.setup.pendingStage,
      nextIsChallenge: row.spawn ? !!row.spawn.challenge : !!row.started?.nextIsChallenge,
      configuredWaitS: round(row.setup.nextStageT, 3),
      transitionCueDelayS: round(row.setup.transitionCueT, 3),
      commitAtStage: row.commit?.stage ?? null,
      spawnedStage: row.spawn?.stage ?? null,
      spawnedChallenge: row.spawn ? !!row.spawn.challenge : null,
      finalStage: row.state?.stage ?? null,
      finalChallenge: !!row.state?.challenge,
      read: row.spawn
        ? 'spawn committed through stage-flow transition path'
        : 'no stage_spawn was observed inside the transition probe window'
    });
  }
  return rows;
}

async function measureChallengeResultTransition(page, stage = 3){
  const row = await page.evaluate(stage => {
    const api = window.__galagaHarness__;
    api.stop(`before-challenge-result-${stage}`);
    api.setupChallengeMotionProfileTest({ stage });
    api.forcePerfectChallengeClear();
    api.advanceFor(0.05, { step: 1 / 60, stopOnGameOver: false });
    const afterClear = api.state();
    api.advanceFor(22, { step: 1 / 60, stopOnGameOver: false });
    const finalState = api.state();
    const events = api.sessionEvents(1000);
    const clearIndex = events.findIndex(event => event.type === 'challenge_clear' && event.stage === stage);
    const runEvents = clearIndex >= 0 ? events.slice(clearIndex) : events;
    return { afterClear, finalState, events: runEvents };
  }, stage);
  const clear = row.events.find(event => event.type === 'challenge_clear') || null;
  const queued = row.events.find(event => event.type === 'challenge_transition_queued') || null;
  const timerElapsed = row.events.find(event => event.type === 'challenge_transition_timer_elapsed') || null;
  const started = row.events.find(event => event.type === 'challenge_transition_started' && event.mode === 'challengeResult') || null;
  const commit = row.events.find(event => event.type === 'challenge_transition_spawn_commit') || null;
  const spawn = row.events.find(event => event.type === 'stage_spawn' && event.stage === stage + 1 && !event.challenge) || null;
  return {
    id: `challenge-result-stage-${stage}-to-${stage + 1}`,
    label: `Challenge result stage ${stage} to stage ${stage + 1}`,
    stage,
    targetStage: stage + 1,
    clearObserved: !!clear,
    clearHits: clear?.hits ?? null,
    clearTotal: clear?.total ?? null,
    resultHoldWindowS: queued?.postChallengeT ?? null,
    configuredWaitS: started?.nextStageT ?? null,
    transitionCueDelayS: started ? null : null,
    totalClearToSpawnS: clear && spawn ? round(spawn.t - clear.t, 3) : null,
    postChallengeTimerElapsedAt: timerElapsed?.t ?? null,
    transitionStartedAt: started?.t ?? null,
    spawnAt: spawn?.t ?? null,
    spawnedStage: spawn?.stage ?? null,
    finalStage: row.finalState?.stage ?? null,
    finalChallenge: !!row.finalState?.challenge,
    read: spawn
      ? 'result banner hold plus challengeResult transition committed to next regular stage'
      : 'next regular stage spawn was not observed in the challenge-result probe window'
  };
}

async function sampleChallengeVisibility(page, stage){
  const sampleStep = 0.1;
  const duration = 28;
  return page.evaluate(({ stage, sampleStep, duration, playW, playH }) => {
    const api = window.__galagaHarness__;
    const initial = api.setupChallengeMotionProfileTest({ stage });
    const ids = new Set((initial.enemies || []).map(enemy => enemy.id));
    const metrics = {};
    for(const enemy of initial.enemies || []){
      metrics[enemy.id] = {
        id: enemy.id,
        type: enemy.type,
        family: enemy.family,
        wave: enemy.wave,
        lane: enemy.lane,
        firstCenterInsideAt: null,
        firstSpriteFullInsideAt: null,
        firstScoreWindowFullInsideAt: null,
        activeSamples: 0,
        centerInsideSamples: 0,
        spriteFullInsideSamples: 0,
        scoreWindowFullInsideSamples: 0,
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity
      };
    }
    function dims(type){
      if(type === 'boss') return { w: 38, h: 30 };
      if(type === 'but') return { w: 34, h: 27 };
      if(type === 'rogue') return { w: 35, h: 28 };
      return { w: 32, h: 26 };
    }
    function boxes(enemy){
      const d = dims(enemy.type);
      const challengeScale = stage === 3 ? 0.74 : 0.7;
      return {
        sprite: { halfW: d.w / 2, halfH: d.h / 2 },
        scoreWindow: { halfW: d.w * challengeScale, halfH: d.h * challengeScale }
      };
    }
    function fullInside(enemy, box){
      return enemy.x - box.halfW >= 0 &&
        enemy.x + box.halfW <= playW &&
        enemy.y - box.halfH >= 0 &&
        enemy.y + box.halfH <= playH;
    }
    function centerInside(enemy){
      return enemy.x >= 0 && enemy.x <= playW && enemy.y >= 0 && enemy.y <= playH;
    }
    let elapsed = 0;
    const samples = [];
    while(elapsed <= duration){
      const state = api.challengeFormationState();
      for(const enemy of state.enemies || []){
        if(!ids.has(enemy.id)) continue;
        const row = metrics[enemy.id];
        const box = boxes(enemy);
        const center = centerInside(enemy);
        const sprite = fullInside(enemy, box.sprite);
        const scoreWindow = fullInside(enemy, box.scoreWindow);
        row.activeSamples++;
        row.minX = Math.min(row.minX, enemy.x);
        row.maxX = Math.max(row.maxX, enemy.x);
        row.minY = Math.min(row.minY, enemy.y);
        row.maxY = Math.max(row.maxY, enemy.y);
        if(center){
          row.centerInsideSamples++;
          if(row.firstCenterInsideAt === null) row.firstCenterInsideAt = +elapsed.toFixed(2);
        }
        if(sprite){
          row.spriteFullInsideSamples++;
          if(row.firstSpriteFullInsideAt === null) row.firstSpriteFullInsideAt = +elapsed.toFixed(2);
        }
        if(scoreWindow){
          row.scoreWindowFullInsideSamples++;
          if(row.firstScoreWindowFullInsideAt === null) row.firstScoreWindowFullInsideAt = +elapsed.toFixed(2);
        }
      }
      samples.push({ t: +elapsed.toFixed(2), active: (state.enemies || []).length });
      api.advanceFor(sampleStep, { step: 1 / 60, stopOnGameOver: false });
      elapsed = +(elapsed + sampleStep).toFixed(6);
    }
    const enemies = Object.values(metrics).map(row => ({
      id: row.id,
      type: row.type,
      family: row.family,
      wave: row.wave,
      lane: row.lane,
      firstCenterInsideAt: row.firstCenterInsideAt,
      firstSpriteFullInsideAt: row.firstSpriteFullInsideAt,
      firstScoreWindowFullInsideAt: row.firstScoreWindowFullInsideAt,
      activeSamples: row.activeSamples,
      centerInsideSamples: row.centerInsideSamples,
      spriteFullInsideSamples: row.spriteFullInsideSamples,
      scoreWindowFullInsideSamples: row.scoreWindowFullInsideSamples,
      minX: Number.isFinite(row.minX) ? +row.minX.toFixed(2) : null,
      maxX: Number.isFinite(row.maxX) ? +row.maxX.toFixed(2) : null,
      minY: Number.isFinite(row.minY) ? +row.minY.toFixed(2) : null,
      maxY: Number.isFinite(row.maxY) ? +row.maxY.toFixed(2) : null
    }));
    return {
      stage,
      layoutId: initial.layout?.id || '',
      enemyCount: enemies.length,
      sampleStep,
      duration,
      sampleCount: samples.length,
      enemies
    };
  }, { stage, sampleStep, duration, playW: PLAY_W, playH: PLAY_H });
}

function summarizeVisibility(raw){
  const enemies = raw.enemies || [];
  const missingCenter = enemies.filter(enemy => enemy.firstCenterInsideAt === null);
  const missingSprite = enemies.filter(enemy => enemy.firstSpriteFullInsideAt === null);
  const missingScoreWindow = enemies.filter(enemy => enemy.firstScoreWindowFullInsideAt === null);
  const firstSpriteTimes = enemies.map(enemy => enemy.firstSpriteFullInsideAt).filter(value => value !== null);
  const firstScoreWindowTimes = enemies.map(enemy => enemy.firstScoreWindowFullInsideAt).filter(value => value !== null);
  return {
    stage: raw.stage,
    challengeNumber: challengeNumberForStage(raw.stage),
    layoutId: raw.layoutId,
    enemyCount: raw.enemyCount,
    sampleStep: raw.sampleStep,
    duration: raw.duration,
    centerInsideCoverage: round((raw.enemyCount - missingCenter.length) / Math.max(1, raw.enemyCount), 3),
    spriteFullInsideCoverage: round((raw.enemyCount - missingSprite.length) / Math.max(1, raw.enemyCount), 3),
    scoreWindowFullInsideCoverage: round((raw.enemyCount - missingScoreWindow.length) / Math.max(1, raw.enemyCount), 3),
    firstSpriteFullInsideMedianS: round(percentile(firstSpriteTimes, 50), 2),
    firstSpriteFullInsideP90S: round(percentile(firstSpriteTimes, 90), 2),
    firstScoreWindowFullInsideMedianS: round(percentile(firstScoreWindowTimes, 50), 2),
    missingSpriteFullInside: missingSprite.map(enemy => ({
      id: enemy.id,
      type: enemy.type,
      family: enemy.family,
      wave: enemy.wave,
      lane: enemy.lane,
      xRange: [enemy.minX, enemy.maxX],
      yRange: [enemy.minY, enemy.maxY]
    })),
    missingScoreWindowFullInside: missingScoreWindow.map(enemy => ({
      id: enemy.id,
      type: enemy.type,
      family: enemy.family,
      wave: enemy.wave,
      lane: enemy.lane,
      xRange: [enemy.minX, enemy.maxX],
      yRange: [enemy.minY, enemy.maxY]
    })),
    risk: missingSprite.length ? 'target-full-visibility-risk' : 'target-full-visibility-proxy-pass'
  };
}

async function runPersonaAttempt(page, stage, persona, seed){
  return page.evaluate(({ stage, persona, seed }) => {
    const api = window.__galagaHarness__;
    api.stop(`before-persona-${persona}-${stage}`);
    api.start({
      stage,
      ships: 3,
      challenge: true,
      persona,
      seed,
      autoVideo: false,
      controlledClock: true
    });
    api.advanceFor(42, { step: 1 / 60, stopOnGameOver: true });
    const state = api.state();
    const events = api.sessionEvents(500);
    const startIndex = events.map(event => event.type).lastIndexOf('game_start');
    const runEvents = startIndex >= 0 ? events.slice(startIndex) : events;
    return { state, events: runEvents };
  }, { stage, persona: persona.id, seed });
}

async function measurePersonaTrajectory(page){
  const rows = [];
  for(const persona of PERSONAS){
    for(const stage of CHALLENGE_STAGES){
      const challengeNumber = challengeNumberForStage(stage);
      const seed = 61000 + challengeNumber * 100 + PERSONAS.findIndex(row => row.id === persona.id);
      const run = await runPersonaAttempt(page, stage, persona, seed);
      const clear = lastEvent(run.events, 'challenge_clear');
      const hitRate = clear && clear.total ? clear.hits / clear.total : null;
      const targetRate = targetFor(persona.id, challengeNumber);
      const noCombat = {
        enemyShots: eventCount(run.events, 'enemy_bullet_fired', true),
        attackStarts: eventCount(run.events, 'enemy_attack_start', true),
        shipLosses: eventCount(run.events, 'ship_lost', true),
        challengeContacts: eventCount(run.events, 'challenge_enemy_contact', true)
      };
      rows.push({
        persona: persona.id,
        personaLabel: persona.label,
        stage,
        challengeNumber,
        seed,
        cleared: !!clear,
        hits: clear?.hits ?? null,
        total: clear?.total ?? null,
        hitRate: round(hitRate, 3),
        targetRate: round(targetRate, 3),
        targetPercent: targetRate == null ? null : Math.round(targetRate * 100),
        targetDelta: hitRate == null || targetRate == null ? null : round(hitRate - targetRate, 3),
        perfect: clear && clear.total ? clear.hits === clear.total : false,
        stageAfterRun: run.state?.stage ?? null,
        livesAfterRun: run.state?.lives ?? null,
        simT: run.state?.simT ?? null,
        noCombat,
        noCombatGrammarPass: noCombat.enemyShots === 0 &&
          noCombat.attackStarts === 0 &&
          noCombat.shipLosses === 0 &&
          noCombat.challengeContacts === 0
      });
    }
  }
  return rows;
}

function summarizeTrajectory(rows){
  const byPersona = {};
  for(const persona of PERSONAS){
    const subset = rows.filter(row => row.persona === persona.id);
    byPersona[persona.id] = {
      label: persona.label,
      attempts: subset.length,
      cleared: subset.filter(row => row.cleared).length,
      perfects: subset.filter(row => row.perfect).length,
      averageHitRate: round(average(subset.map(row => row.hitRate)), 3),
      averageTargetRate: round(average(subset.map(row => row.targetRate)), 3),
      belowTrajectory: subset
        .filter(row => Number.isFinite(+row.hitRate) && Number.isFinite(+row.targetRate) && row.hitRate < row.targetRate - 0.05)
        .map(row => ({
          stage: row.stage,
          challengeNumber: row.challengeNumber,
          hitRate: row.hitRate,
          targetRate: row.targetRate,
          targetDelta: row.targetDelta
        })),
      noCombatGrammarPass: subset.every(row => row.noCombatGrammarPass)
    };
  }
  const professional = rows.filter(row => row.persona === 'professional');
  return {
    personas: byPersona,
    professionalPerfectChallengeNumbers: professional.filter(row => row.perfect).map(row => row.challengeNumber),
    professionalBelowTrajectory: byPersona.professional?.belowTrajectory || [],
    noCombatGrammarPass: rows.every(row => row.noCombatGrammarPass),
    read: 'This is a deterministic one-seed-per-persona/stage probe against the provided success trajectory, not a probabilistic proof.'
  };
}

function buildVerdict(report){
  const visibilityRiskStages = report.visibility.summary
    .filter(row => row.missingSpriteFullInside.length > 0)
    .map(row => row.stage);
  const professionalBelow = report.personaTrajectory.summary.professionalBelowTrajectory;
  const noCombatPass = report.personaTrajectory.summary.noCombatGrammarPass;
  const longRegularWait = report.transitionCadence.probes
    .filter(row => !row.nextIsChallenge && Number.isFinite(+row.configuredWaitS) && row.configuredWaitS > 3.35);
  const concerns = [];
  if(longRegularWait.length) concerns.push('regular-level-handoff-wait-exceeds-3.35s');
  if(visibilityRiskStages.length) concerns.push('some-targets-never-fully-enter-screen-proxy');
  if(professionalBelow.length) concerns.push('professional-deterministic-runs-below-success-trajectory');
  if(!noCombatPass) concerns.push('challenge-no-combat-grammar-regression');
  return {
    status: concerns.length ? 'cadence-perfect-route-risk-found' : 'cadence-perfect-route-initial-pass',
    concerns,
    visibilityRiskStages,
    professionalBelowTrajectory: professionalBelow,
    recommendation: concerns.length
      ? 'Treat this as measurement-backed cleanup input. Do not tune yet; next compare affected waits and challenge paths against archived reference clips before choosing the smallest runtime change.'
      : 'Keep this analyzer as an initial guard and follow with reference-video timing comparison before closing the user-raised risk.'
  };
}

function markdown(report){
  const transitionRows = report.transitionCadence.probes
    .map(row => `| ${row.id} | ${row.targetStage} | ${row.nextIsChallenge ? 'yes' : 'no'} | ${row.configuredWaitS}s | ${row.transitionCueDelayS}s | ${row.read} |`)
    .join('\n');
  const visibilityRows = report.visibility.summary
    .map(row => `| ${row.challengeNumber} | ${row.stage} | ${row.layoutId} | ${row.spriteFullInsideCoverage} | ${row.scoreWindowFullInsideCoverage} | ${row.missingSpriteFullInside.length} | ${row.risk} |`)
    .join('\n');
  const personaRows = PERSONAS.map(persona => {
    const row = report.personaTrajectory.summary.personas[persona.id];
    return `| ${persona.label} | ${row.averageHitRate} | ${row.averageTargetRate} | ${row.perfects}/${row.attempts} | ${row.belowTrajectory.length} | ${row.noCombatGrammarPass ? 'yes' : 'no'} |`;
  }).join('\n');
  return `# Aurora Cadence And Perfect-Route Risk Probe

Generated: ${report.generatedAt}
Commit: ${report.commit}${report.dirty ? ' (dirty)' : ''}
Branch: ${report.branch}

## Verdict

- Status: \`${report.verdict.status}\`
- Concerns: ${report.verdict.concerns.length ? report.verdict.concerns.map(item => `\`${item}\``).join(', ') : 'none'}
- Recommendation: ${report.verdict.recommendation}

## Transition Cadence

| Probe | Target Stage | Challenge | Configured Wait | Cue Delay | Read |
| --- | ---: | --- | ---: | ---: | --- |
${transitionRows}

Challenge result handoff:

- Result hold window: ${report.transitionCadence.challengeResult.resultHoldWindowS}s
- Total clear-to-spawn: ${report.transitionCadence.challengeResult.totalClearToSpawnS}s
- Read: ${report.transitionCadence.challengeResult.read}

## Target Visibility

| Challenge | Internal Stage | Layout | Sprite Full-Inside Coverage | Score Window Coverage | Missing Sprite Proxy | Risk |
| ---: | ---: | --- | ---: | ---: | ---: | --- |
${visibilityRows}

## Persona Trajectory

| Persona | Avg Hit Rate | Avg Target | Perfects | Below Target Rows | No-Combat Grammar |
| --- | ---: | ---: | ---: | ---: | --- |
${personaRows}

## Limits

- The attached success-rate sheet is treated as a design trajectory, not a hard release gate.
- Persona rows are one deterministic seed per persona/challenge stage; they expose risk but do not prove probabilities.
- Visibility uses center, sprite-size, and score-window proxy boxes from runtime enemy positions; follow-up should use contact sheets or frame-level reference clips for final tuning.
`;
}

async function main(){
  ensureLaneBuildFresh(APP_ROOT, { lane: 'dev', releaseChannel: 'development' });
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const branch = git(['branch', '--show-current'], 'unknown');
  const dirty = git(['status', '--short'], '').trim().length > 0;
  const result = await withHarnessPage({ skipStart: true, stage: 1, seed: 61211 }, async ({ page }) => {
    const transitionProbes = await measureTransitionProbes(page);
    const challengeResult = await measureChallengeResultTransition(page, 3);
    const visibilityRaw = [];
    for(const stage of CHALLENGE_STAGES){
      visibilityRaw.push(await sampleChallengeVisibility(page, stage));
    }
    const personaRows = await measurePersonaTrajectory(page);
    return {
      transitionProbes,
      challengeResult,
      visibilityRaw,
      personaRows
    };
  });
  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-cadence-perfect-route-risk',
    generatedAt: new Date().toISOString(),
    commit,
    branch,
    dirty,
    sourcePrompt: {
      releaseContext: 'cleanup/dev-visibility work after Stage 3 group 1 keeper',
      userRisks: [
        'new between-level waits may be intentional for audio conformance or may be a regression against original game flow',
        'challenging stages should retain probabilistic perfect-score opportunity, especially for professional persona',
        'all challenge targets should fully enter the screen at some time',
        'late-stage alien progression may be too fast or unlike the original'
      ],
      successTrajectorySource: 'Success Trajectory - Challenging - Google Sheets.pdf',
      successTrajectory: SUCCESS_TRAJECTORY
    },
    transitionCadence: {
      probes: result.transitionProbes,
      challengeResult: result.challengeResult,
      read: 'Transition timing is split by normal handoff, challenge entry, and challenge result. Challenge-result clear-to-spawn includes both the result banner hold and the next-stage transition window.'
    },
    visibility: {
      stages: CHALLENGE_STAGES,
      raw: result.visibilityRaw,
      summary: result.visibilityRaw.map(summarizeVisibility),
      proxyDefinition: {
        playfield: { w: PLAY_W, h: PLAY_H },
        center: 'enemy x/y inside playfield',
        sprite: 'enemy family/type base dimensions centered at x/y',
        scoreWindow: 'runtime challenge hitbox-scale dimensions centered at x/y'
      }
    },
    personaTrajectory: {
      rows: result.personaRows,
      summary: summarizeTrajectory(result.personaRows)
    }
  };
  report.verdict = buildVerdict(report);
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${commit}${dirty ? '-dirty' : ''}`;
  const outDir = path.join(OUT_ROOT, stamp);
  writeJson(path.join(outDir, 'report.json'), report);
  writeText(path.join(outDir, 'README.md'), markdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  console.log(JSON.stringify({
    ok: true,
    verdict: report.verdict.status,
    concerns: report.verdict.concerns,
    report: rel(path.join(outDir, 'report.json')),
    readme: rel(path.join(outDir, 'README.md')),
    latest: rel(path.join(OUT_ROOT, 'latest.json'))
  }, null, 2));
}

main().catch(err => {
  console.error(err && err.stack || String(err));
  process.exit(1);
});
