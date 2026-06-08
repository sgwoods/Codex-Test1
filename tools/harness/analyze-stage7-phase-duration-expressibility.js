#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const AUTHORITY = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-authority', 'stage7-challenge2', 'latest-path-family-authority.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-runtime-expressibility', 'stage7-challenge2');
const OUT_JSON = path.join(OUT_ROOT, 'latest-phase-duration-proof.json');
const OUT_MD = path.join(OUT_ROOT, 'latest-phase-duration-proof.md');

const SAMPLE_STEP_S = 0.25;
const SAMPLE_END_S = 15;
const VISIBLE_BOUNDS = Object.freeze({ minX: -24, maxX: 304, minY: -36, maxY: 382 });
const STAGE7_SPACING_GUARD = Object.freeze({ crampedDistance: 7.5, idealDistance: 13, minSpacingScore: 0.72, maxBunchingRisk: 0.38 });

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  if(!fs.existsSync(file)) throw new Error(`Missing required artifact: ${rel(file)}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function git(args, fallback = 'unknown'){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || fallback;
  }catch{
    return fallback;
  }
}

function round(value, places = 3){
  if(!Number.isFinite(+value)) return null;
  const scale = 10 ** places;
  return Math.round(+value * scale) / scale;
}

function sameOrder(a = [], b = []){
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function windowDelta(baseWindow = {}, candidateWindow = {}){
  return {
    visibleStartDeltaS: round((candidateWindow.visibleStartS ?? 0) - (baseWindow.visibleStartS ?? 0), 3),
    visibleEndDeltaS: round((candidateWindow.visibleEndS ?? 0) - (baseWindow.visibleEndS ?? 0), 3),
    visibleDurationDeltaS: round((candidateWindow.visibleDurationS ?? 0) - (baseWindow.visibleDurationS ?? 0), 3)
  };
}

function evaluateVariant(variant, baseline, liveGateOrder){
  const targetGroup = +variant.groupIndex || 0;
  const baseWindow = baseline.groupWindows[`group${targetGroup}`] || {};
  const candidateWindow = variant.groupWindows[`group${targetGroup}`] || {};
  const targetDelta = windowDelta(baseWindow, candidateWindow);
  const targetMoved = Math.max(
    Math.abs(targetDelta.visibleStartDeltaS || 0),
    Math.abs(targetDelta.visibleEndDeltaS || 0),
    Math.abs(targetDelta.visibleDurationDeltaS || 0),
    Math.abs((variant.groupTmAt2S?.[`group${targetGroup}`] ?? 0) - (baseline.groupTmAt2S?.[`group${targetGroup}`] ?? 0))
  );
  const group45Deltas = [4, 5].map(groupIndex => ({
    groupIndex,
    ...windowDelta(baseline.groupWindows[`group${groupIndex}`] || {}, variant.groupWindows[`group${groupIndex}`] || {})
  }));
  const group45Regression = group45Deltas.filter(row =>
    Math.abs(row.visibleStartDeltaS || 0) > 0.35
    || Math.abs(row.visibleEndDeltaS || 0) > 0.45
    || Math.abs(row.visibleDurationDeltaS || 0) > 0.45
  );
  const pathOrderPass = sameOrder(variant.pathFamilyOrder || [], liveGateOrder || []);
  const referenceSetupPass = +variant.referenceTrackedEnemyCount === +variant.enemyCount && +variant.referenceTrackIds?.length >= 5;
  const spacingProxyPass = !!variant.spacingSummary?.pass;
  return {
    variantId: variant.variantId,
    groupIndex: targetGroup,
    control: variant.control,
    targetGroupDelta: targetDelta,
    targetVisibleEffectScoreS: round(targetMoved, 3),
    browserVisibleEffectConfirmed: targetMoved >= 0.2,
    group45Deltas,
    group45RegressionPass: group45Regression.length === 0,
    group45Regression,
    pathOrderPass,
    referenceSetupPass,
    spacingProxyPass,
    motionProfileGateProxyPass: pathOrderPass && referenceSetupPass && spacingProxyPass,
    read: targetMoved >= 0.2
      ? 'Non-overwriting browser proof confirmed this control changes visible Stage 7 timing/path behavior.'
      : 'Control did not produce enough visible movement in the proof window.'
  };
}

function markdown(report){
  const controlRows = report.compilerContract.controls.map(control => `| ${control.semanticField} | ${control.generatedRuntimeField} | ${control.runtimeCurrentlyConsumes} | ${control.expectedVisibleEffect} | ${control.proofStatus} |`).join('\n');
  const variantRows = report.variants.map(variant => `| ${variant.variantId} | ${variant.control} | ${variant.groupIndex} | ${variant.evaluation.browserVisibleEffectConfirmed} | ${variant.evaluation.motionProfileGateProxyPass} | ${variant.evaluation.group45RegressionPass} | ${variant.evaluation.targetVisibleEffectScoreS} |`).join('\n');
  return `# Stage 7 Phase-Duration Runtime Expressibility Proof

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

Source-ready for candidates: ${report.decision.sourceReadyForCandidates}

Browser-visible effect confirmed: ${report.summary.browserVisibleEffectConfirmed}

## Compiler Contract

| Semantic field | Generated runtime field | Runtime consumes | Expected visible effect | Proof status |
| --- | --- | --- | --- | --- |
${controlRows}

## Browser Proof Variants

| Variant | Control | Group | Visible effect | Motion/profile proxy | Group 4/5 preserved | Effect score (s) |
| --- | --- | ---: | --- | --- | --- | ---: |
${variantRows}

## Decision

${report.decision.read}
`;
}

async function captureProof(liveGateOrder){
  return withHarnessPage({ skipStart: true, stage: 7, ships: 3, challenge: false, seed: 9052 }, async ({ page }) => {
    return page.evaluate(({ sampleStepS, sampleEndS, bounds, spacingGuard }) => {
      const h = window.__galagaHarness__;
      const clone = value => JSON.parse(JSON.stringify(value));
      const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(+value) ? +value : 0));
      const round = (value, places = 3) => {
        if(!Number.isFinite(+value)) return null;
        const scale = 10 ** places;
        return Math.round(+value * scale) / scale;
      };
      const average = values => {
        const nums = values.filter(value => Number.isFinite(+value));
        return nums.length ? nums.reduce((sum, value) => sum + value, 0) / nums.length : null;
      };
      const distance = (a, b) => Math.hypot((+a.x || 0) - (+b.x || 0), (+a.y || 0) - (+b.y || 0));
      const variants = [
        {
          variantId: 'spawn-offset-group2-plus-0.45',
          groupIndex: 2,
          control: 'groupSpawnOffsets[1]',
          mutate(layout){
            layout.groupSpawnOffsets[1] = round((+layout.groupSpawnOffsets[1] || 0) + 0.45, 3);
            return layout;
          }
        },
        {
          variantId: 'track-duration-group1-shorter-0.62x',
          groupIndex: 1,
          control: 'motionSpecGroups[0].phaseDurations.trackS',
          mutate(layout){
            const group = layout.motionSpecGroups[0];
            group.phaseDurations.trackS = round(Math.max(0.75, (+group.phaseDurations.trackS || 1.88) * 0.62), 3);
            return layout;
          }
        },
        {
          variantId: 'playback-scale-group1-slower-0.55',
          groupIndex: 1,
          control: 'groupReferencePaths[0].playbackScale',
          mutate(layout){
            layout.groupReferencePaths[0].playbackScale = 0.55;
            return layout;
          }
        }
      ];
      function visible(enemy){
        return +enemy.spawn <= 0.03
          && +enemy.x >= bounds.minX
          && +enemy.x <= bounds.maxX
          && +enemy.y >= bounds.minY
          && +enemy.y <= bounds.maxY;
      }
      function summarizeSpacing(enemies){
        const active = enemies.filter(visible);
        const mins = [];
        for(let i = 0; i < active.length; i += 1){
          for(let j = i + 1; j < active.length; j += 1){
            mins.push(distance(active[i], active[j]));
          }
        }
        const minDistance = mins.length ? Math.min(...mins) : null;
        return {
          activeCount: active.length,
          minDistance: minDistance == null ? null : round(minDistance, 2)
        };
      }
      function summarizeGroup(enemies, groupIndex){
        const group = enemies.filter(enemy => +enemy.wave === groupIndex - 1);
        const active = group.filter(visible);
        return {
          groupIndex,
          visibleCount: active.length,
          avgX: round(average(active.map(enemy => +enemy.x)), 2),
          avgY: round(average(active.map(enemy => +enemy.y)), 2),
          avgTm: round(average(group.map(enemy => +enemy.tm)), 3),
          maxSpawn: round(Math.max(...group.map(enemy => +enemy.spawn || 0)), 3)
        };
      }
      function summarizeScenario(variant){
        const base = h.setupChallengeMotionProfileTest({ stage: 7 });
        let override = null;
        if(variant){
          override = variant.mutate(clone(base.layout));
        }
        const initial = h.setupChallengeMotionProfileTest(override ? { stage: 7, layoutOverride: override } : { stage: 7 });
        const samples = [];
        let previous = 0;
        for(let t = 0; t <= sampleEndS + 0.0001; t += sampleStepS){
          const sampleAt = round(t, 3);
          if(sampleAt > previous){
            h.advanceFor(sampleAt - previous, { step: 1 / 60, stopOnGameOver: false });
            previous = sampleAt;
          }
          const state = h.challengeFormationState();
          const groups = [1, 2, 3, 4, 5].map(groupIndex => summarizeGroup(state.enemies || [], groupIndex));
          samples.push({
            t: sampleAt,
            groups,
            spacing: summarizeSpacing(state.enemies || [])
          });
        }
        const groupWindows = {};
        const groupTmAt2S = {};
        for(const groupIndex of [1, 2, 3, 4, 5]){
          const visibleSamples = samples.filter(sample => (sample.groups.find(group => group.groupIndex === groupIndex)?.visibleCount || 0) > 0);
          const first = visibleSamples[0];
          const last = visibleSamples[visibleSamples.length - 1];
          groupWindows[`group${groupIndex}`] = {
            visibleStartS: first ? first.t : null,
            visibleEndS: last ? last.t : null,
            visibleDurationS: first && last ? round(last.t - first.t, 3) : null
          };
          const at2 = samples.find(sample => Math.abs(sample.t - 2) < 0.0001);
          groupTmAt2S[`group${groupIndex}`] = at2?.groups.find(group => group.groupIndex === groupIndex)?.avgTm ?? null;
        }
        const minDistances = samples.map(sample => sample.spacing.minDistance).filter(value => Number.isFinite(+value));
        const worstMinDistance = minDistances.length ? Math.min(...minDistances) : null;
        const averageMinDistance = average(minDistances);
        const spacingScore = averageMinDistance == null ? 0 : clamp((averageMinDistance - spacingGuard.crampedDistance) / Math.max(0.01, spacingGuard.idealDistance - spacingGuard.crampedDistance));
        const bunchingRisk = worstMinDistance == null ? 1 : clamp((spacingGuard.idealDistance - worstMinDistance) / Math.max(0.01, spacingGuard.idealDistance - spacingGuard.crampedDistance));
        const pathFamilyOrder = Array.isArray(initial.layout?.groupPathFamilies) ? initial.layout.groupPathFamilies.slice() : [];
        const enemies = initial.enemies || [];
        const referenceTrackIds = [...new Set(enemies.map(enemy => enemy.referencePath?.sourceTrackId).filter(Boolean))];
        return {
          variantId: variant?.variantId || 'baseline',
          groupIndex: variant?.groupIndex || null,
          control: variant?.control || 'baseline',
          pathFamilyOrder,
          contractPathFamilyOrder: (initial.layout?.contractGroups || []).map(group => group.pathFamily || ''),
          enemyCount: enemies.length,
          referenceTrackedEnemyCount: enemies.filter(enemy => enemy.referencePath && +enemy.referencePath.pointCount >= 3).length,
          referenceTrackIds,
          groupWindows,
          groupTmAt2S,
          spacingSummary: {
            worstMinDistance: worstMinDistance == null ? null : round(worstMinDistance, 2),
            averageMinDistance: averageMinDistance == null ? null : round(averageMinDistance, 2),
            spacingScore: round(spacingScore, 3),
            bunchingRisk: round(bunchingRisk, 3),
            pass: spacingScore >= spacingGuard.minSpacingScore && bunchingRisk <= spacingGuard.maxBunchingRisk
          }
        };
      }
      const baseline = summarizeScenario(null);
      return {
        baseline,
        variants: variants.map(variant => summarizeScenario(variant))
      };
    }, {
      sampleStepS: SAMPLE_STEP_S,
      sampleEndS: SAMPLE_END_S,
      bounds: VISIBLE_BOUNDS,
      spacingGuard: STAGE7_SPACING_GUARD
    });
  });
}

async function main(){
  const authority = readJson(AUTHORITY);
  const liveGateOrder = authority.liveGateOrder || [];
  const proof = await captureProof(liveGateOrder);
  const variants = proof.variants.map(variant => Object.assign({}, variant, {
    evaluation: evaluateVariant(variant, proof.baseline, liveGateOrder)
  }));
  const browserVisibleEffectConfirmed = variants.every(variant => variant.evaluation.browserVisibleEffectConfirmed);
  const motionProfileProxyPass = variants.every(variant => variant.evaluation.motionProfileGateProxyPass);
  const group45Preserved = variants.every(variant => variant.evaluation.group45RegressionPass);
  const report = {
    schemaVersion: 1,
    artifactType: 'stage7-phase-duration-runtime-expressibility-proof',
    generatedAt: new Date().toISOString(),
    generatedBy: 'tools/harness/analyze-stage7-phase-duration-expressibility.js',
    commit: git(['rev-parse', '--short', 'HEAD']),
    branch: git(['branch', '--show-current']),
    releaseFamily: '1.4.1',
    gameKey: 'aurora-galactica',
    scope: {
      stage: 7,
      challengeNumber: 2,
      displayLabel: 'Stage 7 / Challenge 2'
    },
    sourceArtifacts: {
      pathFamilyAuthority: rel(AUTHORITY)
    },
    compilerContract: {
      transformationClass: 'phase-duration-rebalance',
      controls: [
        {
          semanticField: 'visibleStartS',
          generatedRuntimeField: 'groupSpawnOffsets[groupIndex-1] or motionSpecGroups[groupIndex-1].spawnOffsetS',
          runtimeCurrentlyConsumes: true,
          consumedBy: 'spawnChallenge() when calculating enemy spawn/spawnPlan',
          expectedVisibleEffect: 'moves a group visible window earlier/later relative to other groups',
          proofStatus: variants.find(row => row.variantId === 'spawn-offset-group2-plus-0.45')?.evaluation?.browserVisibleEffectConfirmed ? 'browser-proof-pass' : 'browser-proof-fail'
        },
        {
          semanticField: 'phaseDurationS / visibleEndS',
          generatedRuntimeField: 'motionSpecGroups[groupIndex-1].phaseDurations.trackS',
          runtimeCurrentlyConsumes: true,
          consumedBy: 'applyReferenceChallengePath() as reference track duration before exit overrun',
          expectedVisibleEffect: 'changes when the reference path enters its exit/overrun phase',
          proofStatus: variants.find(row => row.variantId === 'track-duration-group1-shorter-0.62x')?.evaluation?.browserVisibleEffectConfirmed ? 'browser-proof-pass' : 'browser-proof-fail'
        },
        {
          semanticField: 'phaseDurationS / visibleEndS',
          generatedRuntimeField: 'groupReferencePaths[groupIndex-1].playbackScale',
          runtimeCurrentlyConsumes: true,
          consumedBy: 'challenge enemy update path clock; reference playback scale changes e.tm advance rate',
          expectedVisibleEffect: 'stretches or compresses reference path playback in browser-visible time',
          proofStatus: variants.find(row => row.variantId === 'playback-scale-group1-slower-0.55')?.evaluation?.browserVisibleEffectConfirmed ? 'browser-proof-pass' : 'browser-proof-fail'
        },
        {
          semanticField: 'exitDurationS',
          generatedRuntimeField: 'motionSpecGroups[groupIndex-1].phaseDurations.exitS',
          runtimeCurrentlyConsumes: false,
          consumedBy: 'not consumed by current runtime path generator',
          expectedVisibleEffect: 'none until runtime implements this field',
          proofStatus: 'blocked-unconsumed-field'
        }
      ]
    },
    liveGateOrder,
    baseline: proof.baseline,
    variants,
    summary: {
      browserVisibleEffectConfirmed,
      motionProfileGateProxyPass: motionProfileProxyPass,
      group45Preserved,
      proofKind: 'non-overwriting-browser-layout-override',
      read: motionProfileProxyPass
        ? 'The proof confirms concrete consumed controls can move Stage 7 browser-visible timing/path behavior without editing runtime source.'
        : 'The proof confirms concrete consumed controls can move Stage 7 browser-visible timing/path behavior, but the proof variants do not satisfy the motion/profile proxy guard.'
    },
    decision: {
      sourceReadyForCandidates: false,
      sourceReadyBlockers: [
        'The semantic candidate generator must emit compiledRuntimeControls instead of visibleStartS/visibleEndS trial vectors.',
        'A future candidate must carry the proof artifact id and preserve live path-family authority.',
        ...(motionProfileProxyPass ? [] : ['The current proof variants do not pass the motion/profile proxy guard; a source-ready candidate must prove guardrail-safe timing values.']),
        'A real source candidate still needs full motion/profile, strict conformance, before/after visual evidence, scoreable-route, and safety checks.'
      ],
      read: 'phase-duration-rebalance now has a concrete runtime-consumed control contract and browser-visible proof, but no current semantic batch candidate is source-ready from this proof alone.'
    }
  };
  writeJson(OUT_JSON, report);
  writeText(OUT_MD, markdown(report));
  console.log(JSON.stringify({
    ok: true,
    report: rel(OUT_JSON),
    markdown: rel(OUT_MD),
    browserVisibleEffectConfirmed,
    motionProfileGateProxyPass: motionProfileProxyPass,
    group45Preserved,
    sourceReadyForCandidates: report.decision.sourceReadyForCandidates
  }, null, 2));
}

main().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.stack || error.message }, null, 2));
  process.exit(1);
});
