#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const AUTHORITY = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-authority', 'stage7-challenge2', 'latest-path-family-authority.json');
const BATCH = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-candidate-trials', 'stage7-challenge2', 'latest-batch.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-runtime-expressibility', 'stage7-challenge2');
const OUT_JSON = path.join(OUT_ROOT, 'latest-lower-field-proof.json');
const OUT_MD = path.join(OUT_ROOT, 'latest-lower-field-proof.md');

const CANDIDATE_ID = 'stage7-semantic-lower-field-overstay-reduction-0.1';
const TRANSFORM_ID = 'lower-field-overstay-reduction';
const PLAY_W = 280;
const PLAY_H = 360;
const LOWER_FIELD_Y = PLAY_H * 0.52;
const SAMPLE_STEP_S = 0.25;
const SAMPLE_END_S = 18;
const VISIBLE_BOUNDS = Object.freeze({ minX: -24, maxX: 304, minY: -36, maxY: 382 });
const STAGE7_SPACING_GUARD = Object.freeze({ crampedDistance: 7.5, idealDistance: 13, minSpacingScore: 0.72, maxBunchingRisk: 0.38 });
const PLAYBACK_CLOCK_DRIFT_LIMIT_S = 0.08;
const GROUP_PRESERVATION_LIMITS = Object.freeze({
  lowerFieldShareDelta: 0.04,
  yRangeDelta: 0.04,
  pathLengthDelta: 0.08,
  visibleWindowDeltaS: 0.35
});

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

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, Number.isFinite(+value) ? +value : 0));
}

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null;
}

function sameOrder(a = [], b = []){
  return a.length === b.length && a.every((value, index) => value === b[index]);
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

function parseRuntimeField(field){
  const text = String(field || '');
  const motionSpec = text.match(/motionSpecGroups\[(\d+)\](?:\.([A-Za-z0-9_.]+))?/);
  return {
    text,
    groupIndex0: motionSpec ? +motionSpec[1] : null,
    motionSpecPath: motionSpec?.[2] || ''
  };
}

function lowerFieldCandidateFromBatch(){
  const batch = readJson(BATCH);
  const row = (batch.candidates || []).find(candidate => candidate.candidateId === CANDIDATE_ID);
  if(!row) throw new Error(`Missing ${CANDIDATE_ID} in ${rel(BATCH)}`);
  const candidatePath = path.join(ROOT, row.candidateInput || '');
  const candidate = readJson(candidatePath);
  const mappingRows = candidate.analysisCompilerMappings?.lowerFieldOverstayReduction || [];
  const runtimeFields = [];
  for(const mapping of mappingRows){
    for(const field of mapping.generatedRuntimeFields || []){
      runtimeFields.push(Object.assign({}, field, {
        transformationClass: mapping.transformationClass || TRANSFORM_ID,
        compilerStatus: mapping.compilerStatus || '',
        sourceReadyStatus: mapping.sourceReadyStatus || '',
        parsed: parseRuntimeField(field.runtimeField)
      }));
    }
  }
  if(!runtimeFields.length) throw new Error(`${CANDIDATE_ID} has no lower-field runtime fields to prove`);
  const generatedControls = (candidate.generatedLowLevelControls?.groups || [])[0] || {};
  return {
    batch: {
      generatedAt: batch.generatedAt,
      commit: batch.commit,
      report: rel(BATCH),
      recommendation: batch.summary?.recommendation || '',
      candidateRow: {
        totalObjectTrackScore10: row.totalObjectTrackScore10 ?? null,
        totalObjectTrackCoverage: row.totalObjectTrackCoverage ?? null,
        totalObjectTrackDelta10: row.totalObjectTrackDelta10 ?? null,
        sourceReadyBlockerType: row.sourceReadyBlockerType || []
      }
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
      generatedLowLevelControls: candidate.generatedLowLevelControls || {},
      intendedLowerFieldRead: {
        baselineLowerFieldShare: generatedControls.baselineLowerFieldShare ?? null,
        aggregateTargetLowerFieldShare: generatedControls.aggregateTargetLowerFieldShare ?? null,
        generatedLowerFieldShare: generatedControls.generatedLowerFieldShare ?? null,
        generatedDelta: generatedControls.generatedDelta ?? null,
        baselineDelta: generatedControls.baselineDelta ?? null
      },
      guardrails: candidate.guardrails || {}
    },
    analysisCompilerMappings: mappingRows,
    runtimeFields
  };
}

function windowDelta(baseWindow = {}, candidateWindow = {}){
  return {
    visibleStartDeltaS: baseWindow.visibleStartS == null || candidateWindow.visibleStartS == null ? null : round(candidateWindow.visibleStartS - baseWindow.visibleStartS, 3),
    visibleEndDeltaS: baseWindow.visibleEndS == null || candidateWindow.visibleEndS == null ? null : round(candidateWindow.visibleEndS - baseWindow.visibleEndS, 3),
    visibleDurationDeltaS: baseWindow.visibleDurationS == null || candidateWindow.visibleDurationS == null ? null : round(candidateWindow.visibleDurationS - baseWindow.visibleDurationS, 3)
  };
}

function metricDelta(base = {}, compiled = {}){
  return {
    lowerFieldShareDelta: round((compiled.lowerFieldShare ?? 0) - (base.lowerFieldShare ?? 0), 4),
    yRangeDelta: round((compiled.yRange ?? 0) - (base.yRange ?? 0), 4),
    pathLengthDelta: round((compiled.pathLength ?? 0) - (base.pathLength ?? 0), 4),
    meanYDeltaPx: round((compiled.meanY ?? 0) - (base.meanY ?? 0), 2),
    maxYDeltaPx: round((compiled.maxY ?? 0) - (base.maxY ?? 0), 2),
    visibleWindowDeltaS: windowDelta(base.visibleWindow || {}, compiled.visibleWindow || {})
  };
}

function groupPreservationPass(delta){
  if(!delta) return false;
  const window = delta.visibleWindowDeltaS || {};
  return Math.abs(delta.lowerFieldShareDelta || 0) <= GROUP_PRESERVATION_LIMITS.lowerFieldShareDelta
    && Math.abs(delta.yRangeDelta || 0) <= GROUP_PRESERVATION_LIMITS.yRangeDelta
    && Math.abs(delta.pathLengthDelta || 0) <= GROUP_PRESERVATION_LIMITS.pathLengthDelta
    && Math.abs(window.visibleStartDeltaS || 0) <= GROUP_PRESERVATION_LIMITS.visibleWindowDeltaS
    && Math.abs(window.visibleEndDeltaS || 0) <= GROUP_PRESERVATION_LIMITS.visibleWindowDeltaS;
}

function summarizeGroupDeltas(baseline, compiled){
  return [1, 2, 3, 4, 5].map(groupIndex => {
    const base = baseline.groupMetrics[`group${groupIndex}`] || {};
    const next = compiled.groupMetrics[`group${groupIndex}`] || {};
    return Object.assign({
      groupIndex,
      baseline: base,
      compiled: next
    }, metricDelta(base, next));
  });
}

function classifyProof({ compiledVariant, targetGroupRows, group45Rows, liveGateOrder, compiledRuntimeFields, scoreableRoutes, safety }){
  const evaluation = compiledVariant?.evaluation || {};
  const failures = [];
  if(!compiledRuntimeFields.length || compiledRuntimeFields.some(field => field.consumedByProof !== true)){
    failures.push({
      category: 'not-runtime-expressible',
      read: 'The generated lowerFieldBias/yOffset controls were not fully applied through the browser layout override.'
    });
  }
  if(evaluation.pathOrderPass === false || evaluation.contractPathOrderPass === false || evaluation.runtimePathOrderPass === false){
    failures.push({
      category: 'promotion-authority-mismatch',
      read: `The compiled layout no longer satisfies live path-family authority ${liveGateOrder.join(', ')}.`
    });
  }
  if(evaluation.referenceSetupPass === false){
    failures.push({
      category: 'not-runtime-expressible',
      read: 'The compiled layout lost reference-backed enemies or motion-spec setup.'
    });
  }
  if(evaluation.motionProfileGateProxyPass === false){
    failures.push({
      category: 'guardrail-regression',
      read: 'The compiled lower-field controls do not pass the focused motion/profile proxy.'
    });
  }
  if(evaluation.spacingProxyPass === false){
    failures.push({
      category: 'guardrail-regression',
      read: 'The compiled lower-field controls reduce spacing/readability below the Stage 7 floor.'
    });
  }
  for(const row of targetGroupRows){
    if(row.browserVisibleLowerFieldMovement !== true){
      failures.push({
        category: 'not-runtime-expressible',
        read: `Group ${row.groupIndex} did not show enough browser-visible lower-field movement.`
      });
    }
    if(row.intendedDirectionPass !== true){
      failures.push({
        category: 'not-runtime-expressible',
        read: `Group ${row.groupIndex} movement did not reduce lower-field overstay in the intended direction.`
      });
    }
  }
  if(group45Rows.some(row => row.preservationPass !== true)){
    failures.push({
      category: 'protected-group-regression',
      read: 'The compiled lower-field proof changed protected group 4/group 5 movement beyond preservation limits.'
    });
  }
  if(scoreableRoutes?.pass !== true){
    failures.push({
      category: 'guardrail-regression',
      read: 'Scoreable-route preservation is not proven for the lower-field proof.'
    });
  }
  if(safety?.pass !== true){
    failures.push({
      category: 'guardrail-regression',
      read: 'No-shot/no-attack/no-loss safety is not proven for the lower-field proof.'
    });
  }
  return failures;
}

async function captureProof(liveGateOrder, compiledPlan){
  return withHarnessPage({ skipStart: true, stage: 7, ships: 3, challenge: false, seed: 9052 }, async ({ page }) => {
    return page.evaluate(({ sampleStepS, sampleEndS, bounds, lowerFieldY, spacingGuard, clockDriftLimitS, compiledPlan }) => {
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
          points: active.map(enemy => ({ x: +enemy.x || 0, y: +enemy.y || 0, lane: enemy.lane })),
          avgX: round(average(active.map(enemy => +enemy.x)), 2),
          avgY: round(average(active.map(enemy => +enemy.y)), 2),
          avgTm: round(average(group.map(enemy => +enemy.tm)), 3),
          maxSpawn: group.length ? round(Math.max(...group.map(enemy => +enemy.spawn || 0)), 3) : null
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
      function summarizeGroupMetrics(samples, groupIndex){
        const visibleSamples = samples
          .map(sample => {
            const group = sample.groups.find(row => row.groupIndex === groupIndex);
            return group && group.visibleCount > 0 ? { t: sample.t, group } : null;
          })
          .filter(Boolean);
        const points = visibleSamples.flatMap(sample => sample.group.points);
        const centroids = visibleSamples
          .filter(sample => Number.isFinite(+sample.group.avgX) && Number.isFinite(+sample.group.avgY))
          .map(sample => ({ t: sample.t, x: +sample.group.avgX, y: +sample.group.avgY }));
        let pathLength = 0;
        for(let index = 1; index < centroids.length; index += 1){
          const prev = centroids[index - 1];
          const cur = centroids[index];
          pathLength += Math.hypot((cur.x - prev.x) / 280, (cur.y - prev.y) / 360);
        }
        const xs = points.map(point => point.x).filter(Number.isFinite);
        const ys = points.map(point => point.y).filter(Number.isFinite);
        const first = visibleSamples[0];
        const last = visibleSamples[visibleSamples.length - 1];
        return {
          groupIndex,
          sampleCount: visibleSamples.length,
          pointCount: points.length,
          lowerFieldThresholdY: round(lowerFieldY, 2),
          lowerFieldShare: points.length ? round(points.filter(point => point.y >= lowerFieldY).length / points.length, 4) : null,
          xRange: xs.length ? round((Math.max(...xs) - Math.min(...xs)) / 280, 4) : null,
          yRange: ys.length ? round((Math.max(...ys) - Math.min(...ys)) / 360, 4) : null,
          pathLength: round(pathLength, 4),
          meanY: ys.length ? round(average(ys), 2) : null,
          minY: ys.length ? round(Math.min(...ys), 2) : null,
          maxY: ys.length ? round(Math.max(...ys), 2) : null,
          visibleWindow: {
            visibleStartS: first ? first.t : null,
            visibleEndS: last ? last.t : null,
            visibleDurationS: first && last ? round(last.t - first.t, 3) : null
          }
        };
      }
      function summarizeScenario(variant){
        const base = h.setupChallengeMotionProfileTest({ stage: 7 });
        let override = null;
        let appliedRuntimeFields = [];
        if(variant?.runtimeFields?.length){
          override = clone(base.layout);
          appliedRuntimeFields = applyRuntimeFields(override, variant.runtimeFields);
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
        const groupMetrics = {};
        for(const groupIndex of [1, 2, 3, 4, 5]){
          groupMetrics[`group${groupIndex}`] = summarizeGroupMetrics(samples, groupIndex);
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
        const events = typeof h.recentEvents === 'function' ? h.recentEvents({ count: 200 }) : [];
        const enemyShots = events.filter(event => event.type === 'enemy_shot' || event.type === 'enemy_bullet' || event.type === 'enemy_bullet_fired');
        const attackStarts = events.filter(event => event.type === 'enemy_attack_start');
        const shipLosses = events.filter(event => event.type === 'ship_lost' || event.type === 'player_loss');
        return {
          variantId: variant?.variantId || 'baseline',
          semanticTransformId: variant?.semanticTransformId || null,
          control: variant?.control || 'baseline',
          targetGroups: variant?.targetGroups || [],
          appliedRuntimeFields,
          pathFamilyOrder,
          contractPathFamilyOrder,
          runtimePathFamilyMismatches,
          enemyCount: enemies.length,
          referenceTrackedEnemyCount,
          referenceTrackIds,
          groupMetrics,
          spacingSummary: {
            sampleCount: spacingSamples.length,
            worstMinDistance: minDistances.length ? round(Math.min(...minDistances), 2) : null,
            averageMinDistance: minDistances.length ? round(average(minDistances), 2) : null,
            spacingScore: round(spacingScore, 3),
            bunchingRisk: round(bunchingRisk, 3),
            crampedCount,
            minRuntimeSpacingScore: spacingGuard.minSpacingScore,
            maxRuntimeBunchingRisk: spacingGuard.maxBunchingRisk,
            pass: spacingScore >= spacingGuard.minSpacingScore && bunchingRisk <= spacingGuard.maxBunchingRisk
          },
          scoreableRouteStatus: {
            pass: compiledPlan.candidate.guardrails?.scoreableRoutes?.preserveBaseline === true,
            source: compiledPlan.candidate.guardrails?.scoreableRoutes?.source || '',
            read: compiledPlan.candidate.guardrails?.scoreableRoutes?.read || ''
          },
          safetyStatus: {
            pass: enemyShots.length === 0 && attackStarts.length === 0 && shipLosses.length === 0,
            noEnemyShots: enemyShots.length === 0,
            noAttackStarts: attackStarts.length === 0,
            noShipLosses: shipLosses.length === 0,
            eventCounts: {
              enemyShots: enemyShots.length,
              enemyAttackStarts: attackStarts.length,
              shipLosses: shipLosses.length
            }
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
      return {
        baseline: summarizeScenario(null),
        compiled: summarizeScenario({
          variantId: `compiled-${compiledPlan.candidate.candidateId}`,
          semanticTransformId: 'lower-field-overstay-reduction',
          control: 'analysisCompilerMappings.lowerFieldOverstayReduction',
          targetGroups: compiledPlan.candidate.targetGroups,
          runtimeFields: compiledPlan.runtimeFields
        })
      };
    }, {
      sampleStepS: SAMPLE_STEP_S,
      sampleEndS: SAMPLE_END_S,
      bounds: VISIBLE_BOUNDS,
      lowerFieldY: LOWER_FIELD_Y,
      spacingGuard: STAGE7_SPACING_GUARD,
      clockDriftLimitS: PLAYBACK_CLOCK_DRIFT_LIMIT_S,
      compiledPlan
    });
  });
}

function evaluateCompiled(compiled, baseline, liveGateOrder, candidate){
  const groupDeltas = summarizeGroupDeltas(baseline, compiled);
  const targetGroups = (candidate.targetGroups || []).map(Number).filter(Number.isFinite);
  const targetGroupRows = groupDeltas.filter(row => targetGroups.includes(+row.groupIndex)).map(row => {
    const intended = candidate.intendedLowerFieldRead || {};
    const expectedShare = intended.generatedLowerFieldShare;
    const expectedDirection = Number.isFinite(+expectedShare) && Number.isFinite(+intended.baselineLowerFieldShare)
      ? Math.sign(+expectedShare - +intended.baselineLowerFieldShare)
      : -1;
    const actualDirection = Math.sign(row.lowerFieldShareDelta || 0);
    const movementMagnitude = Math.max(
      Math.abs(row.lowerFieldShareDelta || 0),
      Math.abs((row.meanYDeltaPx || 0) / PLAY_H),
      Math.abs(row.yRangeDelta || 0)
    );
    return Object.assign({}, row, {
      expectedLowerFieldShare: expectedShare ?? null,
      expectedLowerFieldShareDelta: Number.isFinite(+expectedShare) && Number.isFinite(+row.baseline.lowerFieldShare)
        ? round(+expectedShare - +row.baseline.lowerFieldShare, 4)
        : null,
      browserVisibleLowerFieldMovement: movementMagnitude >= 0.015,
      lowerFieldMovementMagnitude: round(movementMagnitude, 4),
      intendedDirection: expectedDirection < 0 ? 'reduce-lower-field-share' : expectedDirection > 0 ? 'increase-lower-field-share' : 'hold',
      actualDirection: actualDirection < 0 ? 'reduced-lower-field-share' : actualDirection > 0 ? 'increased-lower-field-share' : 'held',
      intendedDirectionPass: expectedDirection < 0
        ? (row.lowerFieldShareDelta || 0) < -0.015
        : expectedDirection > 0
          ? (row.lowerFieldShareDelta || 0) > 0.015
          : Math.abs(row.lowerFieldShareDelta || 0) <= 0.015
    });
  });
  const group1Effect = groupDeltas.find(row => row.groupIndex === 1) || null;
  const group45Rows = groupDeltas.filter(row => row.groupIndex === 4 || row.groupIndex === 5).map(row => Object.assign({}, row, {
    preservationPass: groupPreservationPass(row)
  }));
  const pathOrderPass = sameOrder(compiled.pathFamilyOrder || [], liveGateOrder || []);
  const contractPathOrderPass = sameOrder(compiled.contractPathFamilyOrder || [], liveGateOrder || []);
  const runtimePathOrderPass = compiled.runtimePathFamilyMismatches?.length === 0;
  const referenceSetupPass = !!compiled.motionProfileProxy?.referenceSetup?.pass;
  const playbackClockPass = !!compiled.motionProfileProxy?.playbackClock?.pass;
  const spacingProxyPass = !!compiled.spacingSummary?.pass;
  const motionProfileGateProxyPass = pathOrderPass
    && contractPathOrderPass
    && runtimePathOrderPass
    && referenceSetupPass
    && playbackClockPass
    && spacingProxyPass;
  return {
    variantId: compiled.variantId,
    targetGroups,
    groupDeltas,
    targetGroupRows,
    group1Effect,
    group45Rows,
    browserVisibleLowerFieldMovement: targetGroupRows.every(row => row.browserVisibleLowerFieldMovement),
    intendedDirectionPass: targetGroupRows.every(row => row.intendedDirectionPass),
    group45Preserved: group45Rows.every(row => row.preservationPass),
    pathOrderPass,
    contractPathOrderPass,
    runtimePathOrderPass,
    referenceSetupPass,
    playbackClockPass,
    spacingProxyPass,
    motionProfileGateProxyPass,
    read: targetGroupRows.every(row => row.browserVisibleLowerFieldMovement)
      ? 'The generated lowerFieldBias/yOffset controls produced browser-visible lower-field movement.'
      : 'The generated lowerFieldBias/yOffset controls did not produce enough lower-field movement.'
  };
}

function markdown(report){
  const controlRows = report.compiledRuntimeFields.map(field => `| ${field.runtimeField} | ${field.value} | ${field.runtimeCurrentlyConsumes} | ${field.consumedByProof} | ${(field.appliedTargets || []).map(target => `${target.target}: ${target.before} -> ${target.after}`).join('<br>')} |`).join('\n');
  const targetRows = report.compiledControlRead.targetGroupRows.map(row => `| ${row.groupIndex} | ${row.baseline.lowerFieldShare} | ${row.compiled.lowerFieldShare} | ${row.lowerFieldShareDelta} | ${row.meanYDeltaPx} | ${row.yRangeDelta} | ${row.pathLengthDelta} | ${row.intendedDirection} | ${row.actualDirection} | ${row.browserVisibleLowerFieldMovement} | ${row.intendedDirectionPass} |`).join('\n');
  const preserveRows = report.compiledControlRead.group45Preservation.map(row => `| ${row.groupIndex} | ${row.lowerFieldShareDelta} | ${row.yRangeDelta} | ${row.pathLengthDelta} | ${row.visibleWindowDeltaS.visibleStartDeltaS} | ${row.visibleWindowDeltaS.visibleEndDeltaS} | ${row.preservationPass} |`).join('\n');
  const blockers = (report.failureClassification || []).map(row => `- ${row.category}: ${row.read}`).join('\n') || '- none';
  return `# Stage 7 Lower-Field Runtime Expressibility Proof

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

Source-ready for candidates: ${report.decision.sourceReadyForCandidates}

Semantic transform: ${report.semanticTransformId}

Candidate: ${report.candidate.candidateId}

## Compiled Controls

| Runtime field | Value | Runtime consumes | Consumed by proof | Applied layout targets |
| --- | ---: | --- | --- | --- |
${controlRows}

## Target Group Movement

| Group | Baseline lower share | Compiled lower share | Lower share delta | Mean Y delta px | Y range delta | Path length delta | Intended direction | Actual direction | Visible movement | Direction pass |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
${targetRows}

## Protected Groups

Group 4/5 preserved: ${report.compiledControlRead.group45Preserved}

| Group | Lower share delta | Y range delta | Path length delta | Start delta | End delta | Pass |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
${preserveRows}

## Guardrails

- Motion/profile proxy pass: ${report.compiledControlRead.motionProfileGateProxyPass}
- Spacing/readability pass: ${report.compiledControlRead.spacingReadability.pass}; spacing ${report.compiledControlRead.spacingReadability.spacingScore}, bunching ${report.compiledControlRead.spacingReadability.bunchingRisk}
- Scoreable routes pass: ${report.compiledControlRead.scoreableRouteStatus.pass}
- Safety pass: ${report.compiledControlRead.safetyStatus.pass}; no shots ${report.compiledControlRead.safetyStatus.noEnemyShots}, no attacks ${report.compiledControlRead.safetyStatus.noAttackStarts}, no losses ${report.compiledControlRead.safetyStatus.noShipLosses}

## Blockers

${blockers}

## Decision

${report.decision.read}
`;
}

async function main(){
  const authority = readJson(AUTHORITY);
  const liveGateOrder = authority.liveGateOrder || [];
  const compiledPlan = lowerFieldCandidateFromBatch();
  const proof = await captureProof(liveGateOrder, compiledPlan);
  const evaluation = evaluateCompiled(proof.compiled, proof.baseline, liveGateOrder, compiledPlan.candidate);
  const compiledRuntimeFields = (proof.compiled.appliedRuntimeFields || []).map(field => Object.assign({}, field, {
    consumedByProof: field.runtimeCurrentlyConsumes === true && field.appliedInLayoutOverride === true
  }));
  const failureClassification = classifyProof({
    compiledVariant: { evaluation },
    targetGroupRows: evaluation.targetGroupRows,
    group45Rows: evaluation.group45Rows,
    liveGateOrder,
    compiledRuntimeFields,
    scoreableRoutes: proof.compiled.scoreableRouteStatus,
    safety: proof.compiled.safetyStatus
  });
  const sourceReadyBlockerType = Array.from(new Set(failureClassification.map(row => row.category))).sort();
  const lowerFieldProofBacked = compiledRuntimeFields.length > 0
    && compiledRuntimeFields.every(field => field.consumedByProof)
    && evaluation.browserVisibleLowerFieldMovement
    && evaluation.intendedDirectionPass
    && evaluation.motionProfileGateProxyPass
    && proof.compiled.spacingSummary?.pass === true
    && proof.compiled.scoreableRouteStatus?.pass === true
    && proof.compiled.safetyStatus?.pass === true
    && evaluation.group45Preserved
    && evaluation.pathOrderPass
    && evaluation.contractPathOrderPass
    && evaluation.runtimePathOrderPass;
  const report = {
    schemaVersion: 1,
    artifactType: 'stage7-lower-field-runtime-expressibility-proof',
    generatedAt: new Date().toISOString(),
    generatedBy: 'tools/harness/analyze-stage7-lower-field-expressibility.js',
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
    semanticTransformId: TRANSFORM_ID,
    batch: compiledPlan.batch,
    candidate: compiledPlan.candidate,
    intendedTargetGroups: compiledPlan.candidate.targetGroups,
    analysisCompilerMappings: compiledPlan.analysisCompilerMappings,
    compiledRuntimeControls: {
      lowerFieldOverstayReduction: compiledPlan.runtimeFields.map(field => ({
        runtimeField: field.runtimeField,
        value: field.value,
        runtimeCurrentlyConsumes: field.runtimeCurrentlyConsumes,
        derivedFrom: field.derivedFrom || ''
      }))
    },
    compiledRuntimeFields,
    lowerFieldProofBacked,
    sourceReadyBlockerType,
    baseline: proof.baseline,
    compiled: proof.compiled,
    compiledControlRead: {
      variantId: proof.compiled.variantId,
      baselineGroupMetrics: proof.baseline.groupMetrics,
      compiledGroupMetrics: proof.compiled.groupMetrics,
      deltaFromBaseline: evaluation.groupDeltas,
      targetGroupRows: evaluation.targetGroupRows,
      browserVisibleLowerFieldMovement: evaluation.browserVisibleLowerFieldMovement,
      intendedDirectionPass: evaluation.intendedDirectionPass,
      group1Effect: evaluation.group1Effect,
      group45Preservation: evaluation.group45Rows,
      group45Preserved: evaluation.group45Preserved,
      motionProfileProxy: proof.compiled.motionProfileProxy,
      motionProfileGateProxyPass: evaluation.motionProfileGateProxyPass,
      spacingReadability: proof.compiled.spacingSummary,
      scoreableRouteStatus: proof.compiled.scoreableRouteStatus,
      safetyStatus: proof.compiled.safetyStatus,
      liveGateOrder
    },
    failureClassification,
    summary: {
      browserVisibleEffectConfirmed: evaluation.browserVisibleLowerFieldMovement,
      intendedDirectionPass: evaluation.intendedDirectionPass,
      motionProfileGateProxyPass: evaluation.motionProfileGateProxyPass,
      spacingReadabilityPass: proof.compiled.spacingSummary?.pass === true,
      scoreableRoutesPass: proof.compiled.scoreableRouteStatus?.pass === true,
      safetyPass: proof.compiled.safetyStatus?.pass === true,
      group45Preserved: evaluation.group45Preserved,
      proofKind: 'non-overwriting-browser-layout-override',
      read: lowerFieldProofBacked
        ? 'The generated lowerFieldBias/yOffset controls express lower-field-overstay reduction in browser-visible Stage 7 behavior while preserving guardrails.'
        : 'The generated lowerFieldBias/yOffset controls are consumed and measured, but they do not produce a source-ready lower-field-overstay reduction proof.'
    },
    decision: {
      sourceReadyForCandidates: lowerFieldProofBacked,
      sourceReadyBlockers: [
        ...(compiledRuntimeFields.every(field => field.consumedByProof) ? [] : ['The compiled lower-field controls were not fully applied/consumed by the proof.']),
        ...(evaluation.browserVisibleLowerFieldMovement ? [] : ['The compiled lower-field controls did not produce enough browser-visible lower-field movement.']),
        ...(evaluation.intendedDirectionPass ? [] : ['The compiled lower-field controls did not reduce lower-field overstay in the intended direction.']),
        ...(evaluation.motionProfileGateProxyPass ? [] : ['The compiled lower-field controls do not pass the motion/profile proxy guard.']),
        ...(evaluation.group45Preserved ? [] : ['The compiled lower-field controls regress protected group 4/group 5.']),
        ...(proof.compiled.scoreableRouteStatus?.pass === true ? [] : ['Scoreable-route preservation is not proven.']),
        ...(proof.compiled.safetyStatus?.pass === true ? [] : ['No-shot/no-attack/no-loss safety is not proven.'])
      ],
      read: lowerFieldProofBacked
        ? 'lower-field-overstay-reduction has a focused runtime-expressibility proof. Regenerate the semantic batch once and stop with any single source-ready recommendation.'
        : 'lower-field-overstay-reduction remains analysis-only under the current lowerFieldBias/yOffset projection. Pause Stage 7 candidate work and apply the RED pipeline front-first to Stage 3.'
    }
  };
  writeJson(OUT_JSON, report);
  writeText(OUT_MD, markdown(report));
  console.log(JSON.stringify({
    ok: true,
    report: rel(OUT_JSON),
    markdown: rel(OUT_MD),
    browserVisibleEffectConfirmed: report.summary.browserVisibleEffectConfirmed,
    intendedDirectionPass: report.summary.intendedDirectionPass,
    motionProfileGateProxyPass: report.summary.motionProfileGateProxyPass,
    group45Preserved: report.summary.group45Preserved,
    sourceReadyForCandidates: report.decision.sourceReadyForCandidates,
    sourceReadyBlockerType
  }, null, 2));
}

main().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.stack || error.message }, null, 2));
  process.exit(1);
});
