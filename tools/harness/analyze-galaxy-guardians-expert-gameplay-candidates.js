#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {
  ROOT,
  loadGuardiansVm,
  simulatePersona
} = require('./guardians-long-surface-lib');

const OUT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'expert-gameplay-candidates-0.1.json');
const OUT_MD = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'expert-gameplay-candidates-0.1.md');

const SCENARIOS = [
  { id: 'advanced-preservation', persona: 'advanced', seed: 5138, stage: 1, ships: 3, durationSeconds: 180, maxPlayableStage: 6 },
  { id: 'expert-opening-weak-seed', persona: 'expert', seed: 5175, stage: 1, ships: 3, durationSeconds: 180, maxPlayableStage: 6 },
  { id: 'expert-review-hold', persona: 'expert', seed: 9011, stage: 1, ships: 5, durationSeconds: 240, maxPlayableStage: 6 },
  { id: 'professional-preservation', persona: 'professional', seed: 5212, stage: 1, ships: 3, durationSeconds: 180, maxPlayableStage: 6 }
];

const CANDIDATES = [
  {
    id: 'expert-shot-priority-168x32',
    label: 'Expert shot-priority 168x32',
    patch: {
      expertEarly: { urgentShotLook: 168, urgentShotDx: 32, shotThreatPriority: 1 }
    }
  },
  {
    id: 'expert-shot-priority-192x36',
    label: 'Expert shot-priority 192x36',
    patch: {
      expertEarly: { urgentShotLook: 192, urgentShotDx: 36, shotThreatPriority: 1 }
    }
  },
  {
    id: 'expert-shot-read-168x32',
    label: 'Expert shot-read 168x32',
    patch: {
      expertEarly: { urgentShotLook: 168, urgentShotDx: 32 }
    }
  },
  {
    id: 'expert-shot-priority-soft-dive',
    label: 'Expert shot-priority soft dive',
    patch: {
      expertEarly: { urgentShotLook: 168, urgentShotDx: 32, shotThreatPriority: 1, diveThreatY: 150, diveThreatDx: 40 }
    }
  },
  {
    id: 'expert-shot-priority-no-fire',
    label: 'Expert shot-priority no-fire',
    patch: {
      expertEarly: { urgentShotLook: 168, urgentShotDx: 32, shotThreatPriority: 1, holdFireDuringUrgentThreat: 1 }
    }
  },
  {
    id: 'expert-safe-lane-balanced-v0',
    label: 'Expert safe-lane balanced',
    patch: {
      expertEarly: { urgentShotLook: 168, urgentShotDx: 32, safeLane: 1, safeLaneStep: 30, safeLaneShotLook: 190, safeLaneShotDx: 24, safeLaneDiveY: 132, safeLaneDiveDx: 26 }
    }
  },
  {
    id: 'expert-safe-lane-wide-v1',
    label: 'Expert safe-lane wide',
    patch: {
      expertEarly: { urgentShotLook: 180, urgentShotDx: 34, safeLane: 1, safeLaneStep: 38, safeLaneShotLook: 220, safeLaneShotDx: 30, safeLaneDiveY: 122, safeLaneDiveDx: 30 }
    }
  },
  {
    id: 'expert-safe-lane-shot-biased-v2',
    label: 'Expert safe-lane shot biased',
    patch: {
      expertEarly: { urgentShotLook: 180, urgentShotDx: 36, safeLane: 1, safeLaneStep: 34, safeLaneShotLook: 230, safeLaneShotDx: 34, safeLaneDiveY: 140, safeLaneDiveDx: 22, safeLaneShotWeight: 1.35 }
    }
  },
  {
    id: 'expert-safe-lane-dive-biased-v3',
    label: 'Expert safe-lane dive biased',
    patch: {
      expertEarly: { urgentShotLook: 168, urgentShotDx: 32, safeLane: 1, safeLaneStep: 34, safeLaneShotLook: 190, safeLaneShotDx: 24, safeLaneDiveY: 118, safeLaneDiveDx: 34, safeLaneDiveWeight: 1.45 }
    }
  }
];

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : 0;
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function eventCount(run, key){
  return +(run.eventCounts?.[key] || 0);
}

function collisionLossShare(run){
  const reasons = Array.isArray(run.lossReasons) ? run.lossReasons : [];
  if(!reasons.length) return 0;
  return reasons.filter(reason => String(reason || '').includes('collision')).length / reasons.length;
}

function scoreRun(run = {}){
  const duration = Math.max(1, +run.durationSeconds || +run.simT || 1);
  const survivalShare = Math.max(0, Math.min(1, (+run.simT || 0) / duration));
  const stageSpan = Math.max(1, ((+run.maxPlayableStage || +run.stageStart || 1) - (+run.stageStart || 1)) + 1);
  const progressionShare = Math.max(0, Math.min(1, ((+run.stageAdvances || 0) + (+run.waveClears || 0)) / stageSpan));
  const lossBudgetShare = Math.max(0, Math.min(1, 1 - ((+run.playerLosses || 0) / Math.max(1, +run.ships || 3))));
  const shotResolutionShare = eventCount(run, 'player_shot_fired')
    ? Math.max(0, Math.min(1, eventCount(run, 'player_shot_resolved') / Math.max(1, eventCount(run, 'player_shot_fired'))))
    : 0;
  const collisionSafetyShare = Math.max(0, Math.min(1, 1 - collisionLossShare(run)));
  const divePressurePerMinute = eventCount(run, 'alien_dive_start') / Math.max(1, duration / 60);
  const shotPressurePerMinute = eventCount(run, 'enemy_shot') / Math.max(1, duration / 60);
  const pressureSurvivability = Math.max(0, Math.min(1, 1 - Math.max(0, ((divePressurePerMinute + (shotPressurePerMinute * 0.55)) - 42) / 52)));
  const routeability = Math.max(0, Math.min(1,
    (0.24 * survivalShare)
    + (0.18 * progressionShare)
    + (0.16 * lossBudgetShare)
    + (0.17 * collisionSafetyShare)
    + (0.12 * shotResolutionShare)
    + (0.13 * pressureSurvivability)
  ));
  return Object.assign({}, run, {
    score10: round(1 + routeability * 8.4, 1),
    collisionLossShare: round(collisionLossShare(run), 3),
    enemyShotLosses: (run.lossReasons || []).filter(reason => reason === 'enemy_shot').length,
    collisionLosses: (run.lossReasons || []).filter(reason => String(reason).includes('collision')).length
  });
}

function installCandidatePatch(ctx, patch = {}){
  ctx.__expertCandidatePatch = patch;
  vm.runInContext(`
    if(!this.__baseGuardiansPersonaEffectiveCfg){
      this.__baseGuardiansPersonaEffectiveCfg = guardiansPersonaEffectiveCfg;
    }
    if(!this.__baseGuardiansPersonaMoveAxis){
      this.__baseGuardiansPersonaMoveAxis = guardiansPersonaMoveAxis;
    }
    guardiansPersonaEffectiveCfg = function candidateGuardiansPersonaEffectiveCfg(state, cfg){
      const effective = this.__baseGuardiansPersonaEffectiveCfg(state, cfg);
      const patch = (this.__expertCandidatePatch || {}).expertEarly || null;
      if(!state || !effective || !patch || effective.name !== 'expert') return effective;
      const rank = typeof guardiansStageRank === 'function' ? guardiansStageRank(state) : 0;
      if(rank !== 0 || (state.stage | 0) > 2) return effective;
      const next = Object.assign({}, effective);
      for(const key of [
        'urgentShotLook','urgentShotDx','diveThreatY','diveThreatDx',
        'holdFireDuringUrgentThreat','shotThreatPriority','safeLane',
        'safeLaneStep','safeLaneShotLook','safeLaneShotDx','safeLaneDiveY',
        'safeLaneDiveDx','safeLaneShotWeight','safeLaneDiveWeight'
      ]){
        if(patch[key] !== undefined) next[key] = patch[key];
      }
      return next;
    };
    function candidateSafeLaneAxis(state, cfg, target){
      const player = state.player || {};
      const playfieldWidth = GALAXY_GUARDIANS_RUNTIME_PROFILE?.rules?.playfieldWidth || 280;
      const playerX = +player.x || 0;
      const playerY = +player.y || 0;
      const step = Math.max(18, +cfg.safeLaneStep || 30);
      const axes = [-1, 0, 1];
      const shotLook = Math.max(+cfg.urgentShotLook || 0, +cfg.safeLaneShotLook || 180);
      const shotDx = Math.max(+cfg.urgentShotDx || 0, +cfg.safeLaneShotDx || 24);
      const diveY = Number.isFinite(+cfg.safeLaneDiveY) ? +cfg.safeLaneDiveY : (+cfg.diveThreatY || 140);
      const diveDx = Math.max(+cfg.diveThreatDx || 0, +cfg.safeLaneDiveDx || 28);
      const shotWeight = Math.max(.2, +cfg.safeLaneShotWeight || 1);
      const diveWeight = Math.max(.2, +cfg.safeLaneDiveWeight || 1);
      const shots = (state.enemyShots || []).filter(shot =>
        shot && shot.active !== 0 && shot.y < playerY && playerY - shot.y < shotLook
      );
      const dives = (state.aliens || []).filter(alien =>
        alien && alien.hp > 0 && (alien.mode === 'diving' || alien.mode === 'wrapping') && alien.y < playerY && alien.y >= diveY
      );
      if(!shots.length && !dives.length) return null;
      const targetX = target ? +target.x || playerX : playfieldWidth / 2;
      const scored = axes.map(axis => {
        const x = Math.max(18, Math.min(playfieldWidth - 18, playerX + axis * step));
        let risk = 0;
        for(const shot of shots){
          const dx = Math.abs((+shot.x || 0) - x);
          const dy = Math.max(0, playerY - (+shot.y || 0));
          if(dx <= shotDx) risk += shotWeight * (4 + (shotDx - dx) / Math.max(1, shotDx) * 4 + Math.max(0, 1 - dy / Math.max(1, shotLook)) * 2);
        }
        for(const alien of dives){
          const dx = Math.abs((+alien.x || 0) - x);
          const dy = Math.max(0, playerY - (+alien.y || 0));
          if(dx <= diveDx) risk += diveWeight * (5 + (diveDx - dx) / Math.max(1, diveDx) * 5 + Math.max(0, 1 - dy / Math.max(1, playerY - diveY)) * 2);
        }
        if(x <= 22 || x >= playfieldWidth - 22) risk += 3;
        risk += Math.abs(targetX - x) * .006;
        if(axis === 0) risk += .15;
        return { axis, risk };
      }).sort((a, b) => a.risk - b.risk || Math.abs(a.axis) - Math.abs(b.axis));
      const best = scored[0];
      if(!best || !Number.isFinite(best.risk)) return null;
      const current = scored.find(row => row.axis === 0);
      if(current && current.risk <= best.risk + .45) return 0;
      return best.axis;
    }
    guardiansPersonaMoveAxis = function candidateGuardiansPersonaMoveAxis(state, cfg, target){
      const player = state.player || {};
      const playfieldWidth = GALAXY_GUARDIANS_RUNTIME_PROFILE?.rules?.playfieldWidth || 280;
      if(Number.isFinite(cfg.edgeEscapeInset)){
        const inset = Math.max(16, +cfg.edgeEscapeInset || 0);
        if(player.x < inset) return 1;
        if(player.x > playfieldWidth - inset) return -1;
      }
      if(cfg.safeLane){
        const axis = candidateSafeLaneAxis(state, cfg, target);
        if(axis !== null){
          if((axis < 0 && player.x > 18) || (axis > 0 && player.x < playfieldWidth - 18) || axis === 0) return axis;
        }
      }
      if(cfg.shotThreatPriority){
        const shotThreat = guardiansPersonaNearestShotThreat(state, cfg);
        if(shotThreat){
          const away = shotThreat.x >= player.x ? -1 : 1;
          if((away < 0 && player.x > 18) || (away > 0 && player.x < playfieldWidth - 18)) return away;
        }
      }
      return this.__baseGuardiansPersonaMoveAxis(state, cfg, target);
    };
    this.guardiansPersonaEffectiveCfg = guardiansPersonaEffectiveCfg;
    this.guardiansPersonaMoveAxis = guardiansPersonaMoveAxis;
  `, ctx);
}

function runScenarios(ctx){
  return SCENARIOS.map(scenario => {
    const run = simulatePersona(ctx, scenario.persona, scenario);
    return Object.assign({ scenarioId: scenario.id, seed: scenario.seed }, scoreRun(run));
  });
}

function summarizeRows(rows){
  return {
    score10: round(average(rows.map(row => row.score10)), 1),
    expertWeak: rows.find(row => row.scenarioId === 'expert-opening-weak-seed') || null,
    advanced: rows.find(row => row.scenarioId === 'advanced-preservation') || null,
    professional: rows.find(row => row.scenarioId === 'professional-preservation') || null,
    collisionLosses: rows.reduce((sum, row) => sum + (+row.collisionLosses || 0), 0),
    enemyShotLosses: rows.reduce((sum, row) => sum + (+row.enemyShotLosses || 0), 0)
  };
}

function evaluateCandidate(candidate, baseline){
  const ctx = loadGuardiansVm();
  installCandidatePatch(ctx, candidate.patch);
  const rows = runScenarios(ctx);
  const summary = summarizeRows(rows);
  const expertLift = round((summary.expertWeak?.score10 || 0) - (baseline.summary.expertWeak?.score10 || 0), 1);
  const advancedDelta = round((summary.advanced?.score10 || 0) - (baseline.summary.advanced?.score10 || 0), 1);
  const collisionDelta = summary.collisionLosses - baseline.summary.collisionLosses;
  const pass = expertLift >= 0.3
    && advancedDelta >= -0.1
    && collisionDelta <= 0
    && (summary.expertWeak?.collisionLosses || 0) <= (baseline.summary.expertWeak?.collisionLosses || 0);
  return {
    id: candidate.id,
    label: candidate.label,
    patch: candidate.patch,
    rows,
    summary,
    deltas: {
      expertLift,
      advancedDelta,
      collisionDelta,
      totalScoreDelta: round(summary.score10 - baseline.summary.score10, 1)
    },
    promotionGate: {
      pass,
      read: pass
        ? 'Candidate improves Expert opening while preserving Advanced and avoiding new collision loss.'
        : 'Candidate is measurement-only; it does not clear the gameplay promotion gate.'
    }
  };
}

function buildMarkdown(report){
  const rows = report.candidates.map(candidate => {
    const expert = candidate.summary.expertWeak || {};
    const advanced = candidate.summary.advanced || {};
    return `| ${candidate.label} | ${candidate.summary.score10}/10 | ${candidate.deltas.expertLift}/10 | ${advanced.score10}/10 | ${expert.score10}/10 | ${expert.simT}s | ${expert.enemyShotLosses}/${expert.collisionLosses} | ${candidate.deltas.collisionDelta} | ${candidate.promotionGate.pass ? 'pass' : 'blocked'} |`;
  }).join('\n');
  return `# Galaxy Guardians Expert Gameplay Candidates

Generated: ${report.createdOn}
Status: ${report.status}

## Summary

${report.summary.read}

| Candidate | Scenario Avg | Expert Lift | Advanced | Expert Weak | Expert Time | Expert Shot/Collision Losses | Collision Delta | Gate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${rows}

## Decision

${report.summary.decision}
`;
}

function main(){
  const baselineCtx = loadGuardiansVm();
  const baselineRows = runScenarios(baselineCtx);
  const baseline = {
    id: 'current-runtime',
    rows: baselineRows,
    summary: summarizeRows(baselineRows)
  };
  const candidates = CANDIDATES.map(candidate => evaluateCandidate(candidate, baseline));
  const best = candidates.slice().sort((a, b) =>
    (b.deltas.expertLift - a.deltas.expertLift)
    || (a.deltas.collisionDelta - b.deltas.collisionDelta)
    || (b.summary.score10 - a.summary.score10)
  )[0] || null;
  const passing = candidates.filter(candidate => candidate.promotionGate.pass).sort((a, b) =>
    (b.deltas.expertLift - a.deltas.expertLift)
    || (a.deltas.collisionDelta - b.deltas.collisionDelta)
    || (b.summary.score10 - a.summary.score10)
  );
  const artifact = {
    gameKey: 'galaxy-guardians-preview',
    artifactType: 'galaxy-guardians-expert-gameplay-candidates',
    version: '0.1',
    createdOn: new Date().toISOString(),
    status: 'expert-gameplay-candidate-sweep-not-runtime-promotion',
    sourceEvidence: [
      'reference-artifacts/analyses/galaxy-guardians-identity/expert-opening-failure-0.1.json',
      'reference-artifacts/analyses/galaxy-guardians-identity/routeability-review-0.1.json',
      'src/js/13-galaxy-guardians-gameplay-adapter.js'
    ],
    summary: {
      baselineScore10: baseline.summary.score10,
      candidateCount: candidates.length,
      passingCandidateCount: passing.length,
      bestCandidateId: best?.id || '',
      read: passing.length
        ? `${passing.length} Expert gameplay candidate(s) clear the promotion gate.`
        : 'No Expert gameplay candidate clears the promotion gate; keep the current runtime and use this sweep to shape the next candidate set.',
      decision: passing.length
        ? `Promote ${passing[0].label} only after routeability and full release gates pass.`
        : 'Do not promote an Expert-specific gameplay change from this sweep.'
    },
    baseline,
    candidates,
    promotionPolicy: 'A gameplay candidate must improve the Expert weak opening seed, preserve Advanced three-ship routeability, and avoid increasing collision losses. Survival time alone is not enough.'
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(artifact, null, 2)}\n`);
  fs.writeFileSync(OUT_MD, `${buildMarkdown(artifact).trimEnd()}\n`);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    markdown: rel(OUT_MD),
    baselineScore10: artifact.summary.baselineScore10,
    candidateCount: artifact.summary.candidateCount,
    passingCandidateCount: artifact.summary.passingCandidateCount,
    bestCandidateId: artifact.summary.bestCandidateId
  }, null, 2));
}

try{
  main();
}catch(err){
  console.error(err && err.stack || String(err));
  process.exit(1);
}
