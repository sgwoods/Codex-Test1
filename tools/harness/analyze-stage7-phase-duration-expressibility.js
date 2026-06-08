#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const AUTHORITY = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-authority', 'stage7-challenge2', 'latest-path-family-authority.json');
const BATCH = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-candidate-trials', 'stage7-challenge2', 'latest-batch.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-runtime-expressibility', 'stage7-challenge2');
const OUT_JSON = path.join(OUT_ROOT, 'latest-phase-duration-proof.json');
const OUT_MD = path.join(OUT_ROOT, 'latest-phase-duration-proof.md');

const SAMPLE_STEP_S = 0.25;
const SAMPLE_END_S = 18;
const VISIBLE_BOUNDS = Object.freeze({ minX: -24, maxX: 304, minY: -36, maxY: 382 });
const STAGE7_SPACING_GUARD = Object.freeze({ crampedDistance: 7.5, idealDistance: 13, minSpacingScore: 0.72, maxBunchingRisk: 0.38 });
const PLAYBACK_CLOCK_DRIFT_LIMIT_S = 0.08;

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

function parseRuntimeField(field){
  const text = String(field || '');
  const groupSpawn = text.match(/groupSpawnOffsets\[(\d+)\]/);
  const motionSpec = text.match(/motionSpecGroups\[(\d+)\](?:\.([A-Za-z0-9_.]+))?/);
  const referencePath = text.match(/groupReferencePaths\[(\d+)\](?:\.([A-Za-z0-9_.]+))?/);
  return {
    text,
    groupIndex0: groupSpawn ? +groupSpawn[1] : motionSpec ? +motionSpec[1] : referencePath ? +referencePath[1] : null,
    touchesGroupSpawnOffset: !!groupSpawn,
    motionSpecPath: motionSpec?.[2] || '',
    referencePathPath: referencePath?.[2] || ''
  };
}

function setNested(target, dottedPath, value){
  if(!target || !dottedPath) return false;
  const parts = String(dottedPath).split('.').filter(Boolean);
  let cursor = target;
  for(let index = 0; index < parts.length - 1; index += 1){
    const part = parts[index];
    if(!cursor[part] || typeof cursor[part] !== 'object') cursor[part] = {};
    cursor = cursor[part];
  }
  cursor[parts[parts.length - 1]] = value;
  return true;
}

function phaseDurationCandidatesFromBatch(){
  const batch = readJson(BATCH);
  const candidates = Array.isArray(batch.candidates) ? batch.candidates : [];
  const selectedRow = candidates.find(row => row.candidateId === batch.bestCandidate?.candidateId)
    || candidates.find(row => (row.semanticTransformations || []).includes('phase-duration-rebalance'));
  if(!selectedRow) throw new Error(`Missing phase-duration candidate in ${rel(BATCH)}`);
  const candidatePath = path.join(ROOT, selectedRow.candidateInput || '');
  const candidate = readJson(candidatePath);
  const compiledRows = candidate.compiledRuntimeControls?.phaseDurationRebalance || candidate.compiledRuntimeControls?.['phase-duration-rebalance'] || [];
  if(!compiledRows.length) throw new Error(`Selected candidate ${candidate.candidateId} has no phase-duration compiledRuntimeControls`);
  const runtimeFields = [];
  for(const row of compiledRows){
    for(const field of row.generatedRuntimeFields || []){
      runtimeFields.push(Object.assign({}, field, {
        transformationClass: row.transformationClass || 'phase-duration-rebalance',
        compilerStatus: row.compilerStatus || '',
        sourceReadyStatus: row.sourceReadyStatus || '',
        parsed: parseRuntimeField(field.runtimeField)
      }));
    }
  }
  return {
    batch: {
      generatedAt: batch.generatedAt,
      commit: batch.commit,
      report: rel(BATCH),
      recommendation: batch.summary?.recommendation || '',
      bestCandidateId: batch.bestCandidate?.candidateId || null
    },
    candidate: {
      candidateId: candidate.candidateId,
      candidateInput: rel(candidatePath),
      semanticTransformationClass: candidate.semanticTransformationClass || '',
      semanticTransformations: candidate.semanticTransformations || [],
      intendedPlayerFacingMeaning: candidate.intendedPlayerFacingMeaning || '',
      targetGroups: candidate.targetGroups || [],
      invariantsPreserved: candidate.invariantsPreserved || [],
      expectedMetricMovement: candidate.expectedMetricMovement || '',
      guardrails: candidate.guardrails || {}
    },
    compiledRuntimeControls: compiledRows,
    runtimeFields
  };
}

function windowDelta(baseWindow = {}, candidateWindow = {}){
  return {
    visibleStartDeltaS: round((candidateWindow.visibleStartS ?? 0) - (baseWindow.visibleStartS ?? 0), 3),
    visibleEndDeltaS: round((candidateWindow.visibleEndS ?? 0) - (baseWindow.visibleEndS ?? 0), 3),
    visibleDurationDeltaS: round((candidateWindow.visibleDurationS ?? 0) - (baseWindow.visibleDurationS ?? 0), 3)
  };
}

function summarizeGroupDeltas(baseline, variant, groups = [1, 2, 3, 4, 5]){
  return groups.map(groupIndex => {
    const baseWindow = baseline.groupWindows[`group${groupIndex}`] || {};
    const candidateWindow = variant.groupWindows[`group${groupIndex}`] || {};
    const delta = windowDelta(baseWindow, candidateWindow);
    const tmDelta = round((variant.groupTmAt2S?.[`group${groupIndex}`] ?? 0) - (baseline.groupTmAt2S?.[`group${groupIndex}`] ?? 0), 3);
    return Object.assign({ groupIndex, tmAt2SDelta: tmDelta }, delta);
  });
}

function evaluateVariant(variant, baseline, liveGateOrder){
  const touchedGroups = Array.isArray(variant.touchedGroups) && variant.touchedGroups.length
    ? variant.touchedGroups
    : [+variant.groupIndex || 0].filter(Boolean);
  const groupDeltas = summarizeGroupDeltas(baseline, variant);
  const targetDeltas = summarizeGroupDeltas(baseline, variant, touchedGroups);
  const targetMoved = Math.max(
    0,
    ...targetDeltas.flatMap(delta => [
      Math.abs(delta.visibleStartDeltaS || 0),
      Math.abs(delta.visibleEndDeltaS || 0),
      Math.abs(delta.visibleDurationDeltaS || 0),
      Math.abs(delta.tmAt2SDelta || 0)
    ])
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
  const contractPathOrderPass = sameOrder(variant.contractPathFamilyOrder || [], liveGateOrder || []);
  const runtimePathOrderPass = variant.runtimePathFamilyMismatches?.length === 0;
  const referenceSetupPass = !!variant.motionProfileProxy?.referenceSetup?.pass;
  const playbackClockPass = !!variant.motionProfileProxy?.playbackClock?.pass;
  const spacingProxyPass = !!variant.spacingSummary?.pass;
  const motionProfileGateProxyPass = pathOrderPass
    && contractPathOrderPass
    && runtimePathOrderPass
    && referenceSetupPass
    && playbackClockPass
    && spacingProxyPass;
  return {
    variantId: variant.variantId,
    groupIndex: +variant.groupIndex || null,
    touchedGroups,
    control: variant.control,
    groupDeltas,
    targetGroupDeltas: targetDeltas,
    targetVisibleEffectScoreS: round(targetMoved, 3),
    browserVisibleEffectConfirmed: targetMoved >= 0.2,
    group45Deltas,
    group45RegressionPass: group45Regression.length === 0,
    group45Regression,
    pathOrderPass,
    contractPathOrderPass,
    runtimePathOrderPass,
    referenceSetupPass,
    playbackClockPass,
    spacingProxyPass,
    motionProfileGateProxyPass,
    read: targetMoved >= 0.2
      ? 'Non-overwriting browser proof confirmed this control changes visible Stage 7 timing/path behavior.'
      : 'Control did not produce enough visible movement in the proof window.'
  };
}

function markdown(report){
  const controlRows = report.compilerContract.controls.map(control => `| ${control.semanticField} | ${control.generatedRuntimeField} | ${control.runtimeCurrentlyConsumes} | ${control.expectedVisibleEffect} | ${control.proofStatus} |`).join('\n');
  const variantRows = report.variants.map(variant => `| ${variant.variantId} | ${variant.control} | ${variant.groupIndex} | ${variant.evaluation.browserVisibleEffectConfirmed} | ${variant.evaluation.motionProfileGateProxyPass} | ${variant.evaluation.group45RegressionPass} | ${variant.evaluation.targetVisibleEffectScoreS} |`).join('\n');
  const compiledRows = (report.compiledRuntimeFields || []).map(field => `| ${field.runtimeField} | ${field.value} | ${field.runtimeCurrentlyConsumes} | ${(field.appliedTargets || []).map(target => target.target).join(', ')} |`).join('\n');
  const blockerRows = (report.failureClassification || []).map(row => `- ${row.category}: ${row.read}`).join('\n') || '- none';
  return `# Stage 7 Phase-Duration Runtime Expressibility Proof

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

Source-ready for candidates: ${report.decision.sourceReadyForCandidates}

Browser-visible effect confirmed: ${report.summary.browserVisibleEffectConfirmed}

Motion/profile-compatible compiled proof: ${report.summary.compiledCandidateMotionProfileGateProxyPass}

Candidate: ${report.candidate.candidateId}

## Compiler Contract

| Semantic field | Generated runtime field | Runtime consumes | Expected visible effect | Proof status |
| --- | --- | --- | --- | --- |
${controlRows}

## Compiled Semantic Candidate

| Runtime field | Value | Runtime consumes | Applied layout targets |
| --- | ---: | --- | --- |
${compiledRows}

## Browser Proof Variants

| Variant | Control | Group | Visible effect | Motion/profile proxy | Group 4/5 preserved | Effect score (s) |
| --- | --- | ---: | --- | --- | --- | ---: |
${variantRows}

## Failure Classification

${blockerRows}

## Decision

${report.decision.read}
`;
}

function classifyCompiledProof(compiledVariant){
  const evaluation = compiledVariant?.evaluation || {};
  const failures = [];
  if(!evaluation.browserVisibleEffectConfirmed){
    failures.push({
      category: 'compiler emitted the wrong controls or runtime did not consume them visibly',
      read: 'The compiled phase-duration controls did not produce a measurable browser-visible timing/path delta.'
    });
  }
  if(evaluation.pathOrderPass === false || evaluation.contractPathOrderPass === false || evaluation.runtimePathOrderPass === false){
    failures.push({
      category: 'source-promotion authority blocks the transform',
      read: 'The compiled layout no longer satisfies the live path-family/order authority expected by the motion/profile guard.'
    });
  }
  if(evaluation.referenceSetupPass === false){
    failures.push({
      category: 'runtime consumes controls differently than expected',
      read: 'The compiled layout lost reference-backed enemies or motion-spec setup while applying runtime fields.'
    });
  }
  if(evaluation.playbackClockPass === false){
    failures.push({
      category: 'motion/profile target conflicts with semantic intent',
      read: 'The compiled playback-scale controls change reference-path tm advance enough to fail the real-elapsed playback-clock proxy.'
    });
  }
  if(evaluation.spacingProxyPass === false){
    failures.push({
      category: 'motion/profile spacing proxy blocks the transform',
      read: 'The compiled timing controls reduce spacing/readability below the Stage 7 challenge-motion-profile floor.'
    });
  }
  if(evaluation.group45RegressionPass === false){
    failures.push({
      category: 'semantic guardrail caught a real regression',
      read: 'The compiled controls changed group 4 or group 5 timing beyond the protected late-group tolerance.'
    });
  }
  return failures;
}

async function captureProof(liveGateOrder, compiledPlan){
  return withHarnessPage({ skipStart: true, stage: 7, ships: 3, challenge: false, seed: 9052 }, async ({ page }) => {
    return page.evaluate(({ sampleStepS, sampleEndS, bounds, spacingGuard, clockDriftLimitS, compiledPlan }) => {
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
      function setNestedLocal(target, dottedPath, value){
        if(!target || !dottedPath) return false;
        const parts = String(dottedPath).split('.').filter(Boolean);
        let cursor = target;
        for(let index = 0; index < parts.length - 1; index += 1){
          const part = parts[index];
          if(!cursor[part] || typeof cursor[part] !== 'object') cursor[part] = {};
          cursor = cursor[part];
        }
        cursor[parts[parts.length - 1]] = value;
        return true;
      }
      function applyRuntimeFields(layout, runtimeFields = []){
        const applied = [];
        for(const field of runtimeFields){
          const text = String(field.runtimeField || field.parsed?.text || '');
          const value = field.value;
          const targets = [];
          const groupSpawn = text.match(/groupSpawnOffsets\[(\d+)\]/);
          if(groupSpawn){
            const groupIndex0 = +groupSpawn[1];
            if(!Array.isArray(layout.groupSpawnOffsets)) layout.groupSpawnOffsets = [];
            const before = layout.groupSpawnOffsets[groupIndex0];
            layout.groupSpawnOffsets[groupIndex0] = value;
            targets.push({
              target: `groupSpawnOffsets[${groupIndex0}]`,
              groupIndex: groupIndex0 + 1,
              before: round(before, 3),
              after: round(value, 3)
            });
          }
          const motionSpec = text.match(/motionSpecGroups\[(\d+)\](?:\.([A-Za-z0-9_.]+))?/);
          if(motionSpec){
            const groupIndex0 = +motionSpec[1];
            const specPath = motionSpec[2] || '';
            if(!Array.isArray(layout.motionSpecGroups)) layout.motionSpecGroups = [];
            if(!layout.motionSpecGroups[groupIndex0]) layout.motionSpecGroups[groupIndex0] = {};
            let beforeCursor = layout.motionSpecGroups[groupIndex0];
            for(const part of specPath.split('.').filter(Boolean)){
              beforeCursor = beforeCursor?.[part];
            }
            const changed = setNestedLocal(layout.motionSpecGroups[groupIndex0], specPath, value);
            if(changed){
              targets.push({
                target: `motionSpecGroups[${groupIndex0}].${specPath}`,
                groupIndex: groupIndex0 + 1,
                before: round(beforeCursor, 3),
                after: round(value, 3)
              });
            }
          }
          const referencePath = text.match(/groupReferencePaths\[(\d+)\](?:\.([A-Za-z0-9_.]+))?/);
          if(referencePath){
            const groupIndex0 = +referencePath[1];
            const referencePathField = referencePath[2] || '';
            if(!Array.isArray(layout.groupReferencePaths)) layout.groupReferencePaths = [];
            if(!layout.groupReferencePaths[groupIndex0]) layout.groupReferencePaths[groupIndex0] = {};
            let beforeCursor = layout.groupReferencePaths[groupIndex0];
            for(const part of referencePathField.split('.').filter(Boolean)){
              beforeCursor = beforeCursor?.[part];
            }
            const changed = setNestedLocal(layout.groupReferencePaths[groupIndex0], referencePathField, value);
            if(changed){
              targets.push({
                target: `groupReferencePaths[${groupIndex0}].${referencePathField}`,
                groupIndex: groupIndex0 + 1,
                before: round(beforeCursor, 3),
                after: round(value, 3)
              });
            }
          }
          applied.push({
            runtimeField: text,
            value,
            runtimeCurrentlyConsumes: field.runtimeCurrentlyConsumes === true,
            derivedFrom: field.derivedFrom || '',
            compilerStatus: field.compilerStatus || '',
            sourceReadyStatus: field.sourceReadyStatus || '',
            appliedTargets: targets,
            appliedInLayoutOverride: targets.length > 0
          });
        }
        return applied;
      }
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
      if(compiledPlan?.runtimeFields?.length){
        variants.unshift({
          variantId: `compiled-${compiledPlan.candidate.candidateId}`,
          semanticTransformId: 'phase-duration-rebalance',
          groupIndex: null,
          touchedGroups: [...new Set(compiledPlan.runtimeFields
            .map(field => {
              const groupIndex0 = Number(field.parsed?.groupIndex0);
              return Number.isFinite(groupIndex0) ? groupIndex0 + 1 : null;
            })
            .filter(Number.isFinite))].sort((a, b) => a - b),
          control: 'compiledRuntimeControls.phaseDurationRebalance',
          runtimeFields: compiledPlan.runtimeFields
        });
      }
      function visible(enemy){
        return +enemy.spawn <= 0.03
          && +enemy.x >= bounds.minX
          && +enemy.x <= bounds.maxX
          && +enemy.y >= bounds.minY
          && +enemy.y <= bounds.maxY;
      }
      function summarizeInstantSpacing(enemies){
        const active = enemies.filter(visible);
        const mins = [];
        let minPair = null;
        for(let i = 0; i < active.length; i += 1){
          for(let j = i + 1; j < active.length; j += 1){
            const d = distance(active[i], active[j]);
            mins.push(d);
            if(!minPair || d < minPair.distance){
              minPair = {
                a: { wave: active[i].wave, lane: active[i].lane, x: round(active[i].x, 2), y: round(active[i].y, 2) },
                b: { wave: active[j].wave, lane: active[j].lane, x: round(active[j].x, 2), y: round(active[j].y, 2) },
                distance: round(d, 2)
              };
            }
          }
        }
        const minDistance = mins.length ? Math.min(...mins) : null;
        return {
          activeCount: active.length,
          groupCount: new Set(active.map(enemy => +enemy.wave).filter(Number.isFinite)).size,
          minDistance: minDistance == null ? null : round(minDistance, 2),
          minPair
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
        let appliedRuntimeFields = [];
        if(variant){
          override = clone(base.layout);
          if(typeof variant.mutate === 'function'){
            override = variant.mutate(override);
          }else if(Array.isArray(variant.runtimeFields)){
            appliedRuntimeFields = applyRuntimeFields(override, variant.runtimeFields);
          }
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
            spacing: summarizeInstantSpacing(state.enemies || []),
            clockDrifts: summarizePlaybackClock(state, sampleAt)
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
        const offsets = Array.isArray(initial.layout?.groupSpawnOffsets) ? initial.layout.groupSpawnOffsets : [];
        const lastOffset = offsets.length ? Math.max(...offsets.map(value => +value || 0)) : 10;
        const spacingEndS = Math.min(18, lastOffset + 2.2);
        const spacingSamples = samples.filter(sample =>
          sample.t >= 0.5
          && sample.t <= spacingEndS + 0.0001
          && Math.abs((sample.t / 0.5) - Math.round(sample.t / 0.5)) < 0.0001
        );
        const minDistances = spacingSamples.map(sample => sample.spacing.minDistance).filter(value => Number.isFinite(+value));
        const crampedCount = minDistances.filter(value => value < spacingGuard.crampedDistance).length;
        const bunchingRisk = minDistances.length ? clamp(crampedCount / minDistances.length) : 0;
        const spacingScore = minDistances.length
          ? clamp((average(minDistances.map(value => clamp(value / spacingGuard.idealDistance))) * 0.72) + ((1 - bunchingRisk) * 0.28))
          : 0.6;
        const clockSample = samples.find(sample => Math.abs(sample.t - 1) < 0.0001);
        const playbackBad = (clockSample?.clockDrifts || []).filter(entry => Math.abs(entry.drift) > clockDriftLimitS);
        const pathFamilyOrder = Array.isArray(initial.layout?.groupPathFamilies) ? initial.layout.groupPathFamilies.slice() : [];
        const contractPathFamilyOrder = (initial.layout?.contractGroups || []).map(group => group.pathFamily || '');
        const enemies = initial.enemies || [];
        const referenceTrackIds = [...new Set(enemies.map(enemy => enemy.referencePath?.sourceTrackId).filter(Boolean))];
        const runtimePathFamilyMismatches = enemies.filter(enemy => {
          const expectedGroup = (initial.layout?.contractGroups || [])[enemy.wave || 0];
          return expectedGroup && enemy.pathFamily !== expectedGroup.pathFamily;
        }).map(enemy => ({
          id: enemy.id,
          wave: enemy.wave,
          lane: enemy.lane,
          pathFamily: enemy.pathFamily || '',
          expectedPathFamily: (initial.layout?.contractGroups || [])[enemy.wave || 0]?.pathFamily || ''
        }));
        const referenceTrackedEnemyCount = enemies.filter(enemy => enemy.referencePath && +enemy.referencePath.pointCount >= 3).length;
        return {
          variantId: variant?.variantId || 'baseline',
          groupIndex: variant?.groupIndex || null,
          touchedGroups: variant?.touchedGroups || (variant?.groupIndex ? [variant.groupIndex] : []),
          semanticTransformId: variant?.semanticTransformId || null,
          control: variant?.control || 'baseline',
          appliedRuntimeFields,
          pathFamilyOrder,
          contractPathFamilyOrder,
          runtimePathFamilyMismatches,
          enemyCount: enemies.length,
          referenceTrackedEnemyCount,
          referenceTrackIds,
          groupWindows,
          groupTmAt2S,
          spacingSummary: {
            sampleCount: spacingSamples.length,
            worstMinDistance: minDistances.length ? round(Math.min(...minDistances), 2) : null,
            averageMinDistance: minDistances.length ? round(average(minDistances), 2) : null,
            spacingScore: round(spacingScore, 3),
            bunchingRisk: round(bunchingRisk, 3),
            crampedCount,
            minRuntimeSpacingScore: spacingGuard.minSpacingScore,
            maxRuntimeBunchingRisk: spacingGuard.maxBunchingRisk,
            worstSamples: spacingSamples
              .filter(sample => Number.isFinite(+sample.spacing.minDistance))
              .sort((a, b) => (+a.spacing.minDistance || 0) - (+b.spacing.minDistance || 0))
              .slice(0, 6)
              .map(sample => ({ t: sample.t, activeCount: sample.spacing.activeCount, minDistance: sample.spacing.minDistance, minPair: sample.spacing.minPair })),
            pass: spacingScore >= spacingGuard.minSpacingScore && bunchingRisk <= spacingGuard.maxBunchingRisk
          },
          motionProfileProxy: {
            referenceSetup: {
              pass: referenceTrackedEnemyCount === enemies.length && referenceTrackIds.length >= 5,
              enemyCount: enemies.length,
              referenceTrackedEnemyCount,
              referenceTrackIds
            },
            pathOrder: {
              layoutPathFamilyOrder: pathFamilyOrder,
              contractPathFamilyOrder,
              runtimePathFamilyMismatches,
              pass: runtimePathFamilyMismatches.length === 0
            },
            playbackClock: {
              elapsedSeconds: 1,
              driftLimitS: clockDriftLimitS,
              pass: playbackBad.length === 0,
              bad: playbackBad,
              drifts: clockSample?.clockDrifts || []
            },
            spacing: {
              pass: spacingScore >= spacingGuard.minSpacingScore && bunchingRisk <= spacingGuard.maxBunchingRisk,
              sampleCount: spacingSamples.length,
              spacingScore: round(spacingScore, 3),
              bunchingRisk: round(bunchingRisk, 3)
            }
          }
        };
      }
      function summarizePlaybackClock(state, elapsedSeconds){
        const enemies = Array.isArray(state?.enemies) ? state.enemies : [];
        const spawnBase = enemies.reduce((min, enemy) => Math.min(min, +enemy.spawnPlan || 0), Infinity);
        return enemies
          .filter(enemy => enemy?.referencePath && enemy.spawn <= 0)
          .map(enemy => {
            const expectedTm = Math.max(0, elapsedSeconds - ((+enemy.spawnPlan || 0) - spawnBase));
            const drift = round((+enemy.tm || 0) - expectedTm, 3);
            return {
              id: enemy.id,
              wave: enemy.wave,
              lane: enemy.lane,
              pathFamily: enemy.pathFamily,
              sourceTrackId: enemy.referencePath.sourceTrackId,
              spawnPlan: round(enemy.spawnPlan, 3),
              tm: round(enemy.tm, 3),
              expectedTm: round(expectedTm, 3),
              drift
            };
          });
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
      spacingGuard: STAGE7_SPACING_GUARD,
      clockDriftLimitS: PLAYBACK_CLOCK_DRIFT_LIMIT_S,
      compiledPlan
    });
  });
}

async function main(){
  const authority = readJson(AUTHORITY);
  const liveGateOrder = authority.liveGateOrder || [];
  const compiledPlan = phaseDurationCandidatesFromBatch();
  const proof = await captureProof(liveGateOrder, compiledPlan);
  const variants = proof.variants.map(variant => Object.assign({}, variant, {
    evaluation: evaluateVariant(variant, proof.baseline, liveGateOrder)
  }));
  const compiledVariant = variants.find(variant => variant.variantId === `compiled-${compiledPlan.candidate.candidateId}`);
  const compiledCandidateBrowserVisibleEffectConfirmed = compiledVariant?.evaluation?.browserVisibleEffectConfirmed === true;
  const compiledCandidateMotionProfileGateProxyPass = compiledVariant?.evaluation?.motionProfileGateProxyPass === true;
  const compiledCandidateGroup45Preserved = compiledVariant?.evaluation?.group45RegressionPass === true;
  const failureClassification = classifyCompiledProof(compiledVariant);
  const browserVisibleEffectConfirmed = variants.every(variant => variant.evaluation.browserVisibleEffectConfirmed);
  const motionProfileProxyPass = compiledCandidateMotionProfileGateProxyPass;
  const group45Preserved = variants.every(variant => variant.evaluation.group45RegressionPass);
  const compiledRuntimeFields = (compiledVariant?.appliedRuntimeFields || []).map(field => Object.assign({}, field, {
    consumedByProof: field.runtimeCurrentlyConsumes === true && field.appliedInLayoutOverride === true
  }));
  const sourceReadyForCandidates = compiledCandidateBrowserVisibleEffectConfirmed
    && compiledCandidateMotionProfileGateProxyPass
    && compiledCandidateGroup45Preserved
    && compiledRuntimeFields.length > 0
    && compiledRuntimeFields.every(field => field.consumedByProof)
    && compiledPlan.candidate.guardrails?.spacingReadability?.pass === true
    && !!compiledPlan.candidate.guardrails?.scoreableRoutes
    && compiledPlan.candidate.guardrails?.safety?.noEnemyShots === true
    && compiledPlan.candidate.guardrails?.safety?.noAttackStarts === true
    && compiledPlan.candidate.guardrails?.safety?.noShipLosses === true;
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
      pathFamilyAuthority: rel(AUTHORITY),
      semanticBatch: compiledPlan.batch.report,
      candidateInput: compiledPlan.candidate.candidateInput
    },
    semanticTransformId: 'phase-duration-rebalance',
    batch: compiledPlan.batch,
    candidate: compiledPlan.candidate,
    compiledRuntimeControlsEmitted: compiledPlan.compiledRuntimeControls,
    compiledRuntimeFields,
    compiledControlRead: compiledVariant ? {
      variantId: compiledVariant.variantId,
      baselineVisibleTiming: proof.baseline.groupWindows,
      compiledVisibleTiming: compiledVariant.groupWindows,
      deltaFromBaseline: compiledVariant.evaluation.groupDeltas,
      group1Effect: compiledVariant.evaluation.groupDeltas.find(row => row.groupIndex === 1) || null,
      group4Preservation: compiledVariant.evaluation.group45Deltas.find(row => row.groupIndex === 4) || null,
      group5Preservation: compiledVariant.evaluation.group45Deltas.find(row => row.groupIndex === 5) || null,
      motionProfileProxy: compiledVariant.motionProfileProxy,
      spacingReadability: compiledVariant.spacingSummary,
      scoreableRoutePreservation: compiledPlan.candidate.guardrails?.scoreableRoutes || null,
      safetyPreservation: compiledPlan.candidate.guardrails?.safety || null,
      sourceReadyForCandidates
    } : null,
    failureClassification,
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
      compiledCandidateBrowserVisibleEffectConfirmed,
      compiledCandidateMotionProfileGateProxyPass,
      motionProfileGateProxyPass: motionProfileProxyPass,
      group45Preserved,
      compiledCandidateGroup45Preserved,
      proofKind: 'non-overwriting-browser-layout-override',
      read: motionProfileProxyPass
        ? 'The compiled phase-duration semantic candidate moves Stage 7 browser-visible timing/path behavior while satisfying the focused motion/profile proxy.'
        : 'The compiled phase-duration semantic candidate moves Stage 7 browser-visible timing/path behavior, but it does not satisfy the focused motion/profile proxy.'
    },
    decision: {
      sourceReadyForCandidates,
      sourceReadyBlockers: [
        ...(compiledRuntimeFields.every(field => field.consumedByProof) ? [] : ['The compiled candidate includes at least one runtime field that was not applied in the browser proof.']),
        ...(compiledCandidateBrowserVisibleEffectConfirmed ? [] : ['The compiled candidate did not produce enough browser-visible timing/path movement.']),
        ...(compiledCandidateMotionProfileGateProxyPass ? [] : ['The compiled candidate does not pass the motion/profile proxy guard.']),
        ...(compiledCandidateGroup45Preserved ? [] : ['The compiled candidate regresses protected group 4/group 5 timing windows.']),
        'A real source candidate still needs full motion/profile, strict conformance, before/after visual evidence, scoreable-route, and safety checks.'
      ],
      read: sourceReadyForCandidates
        ? 'phase-duration-rebalance has a candidate-specific compiler-transfer proof. This authorizes source-ready analysis for exactly one future runtime source candidate, not a runtime keeper.'
        : 'phase-duration-rebalance has a candidate-specific compiler-transfer proof, but the compiled candidate is not source-ready until the listed blockers are resolved.'
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
