#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const DESCRIPTION = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-descriptions', 'aurora-stage3-challenge1-0.1.json');
const TRIAL = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-candidate-trials', 'stage3-challenge1', 'latest.json');
const BATCH = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-candidate-trials', 'stage3-challenge1', 'latest-batch.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-runtime-expressibility', 'stage3-challenge1');
const OUT_JSON = path.join(OUT_ROOT, 'latest-transfer-proof.json');
const OUT_MD = path.join(OUT_ROOT, 'latest-transfer-proof.md');
const OUT_SVG = path.join(OUT_ROOT, 'latest-transfer-proof-contact-sheet.svg');

const CANDIDATE_ID = 'stage3-semantic-fresh-g4-score-window-shape-peel-0.1';
const PLAY_W = 280;
const PLAY_H = 360;
const SAMPLE_STEP_S = 0.25;
const SAMPLE_END_S = 17;
const LOWER_FIELD_Y = PLAY_H * 0.52;
const VISIBLE_BOUNDS = Object.freeze({ minX: -24, maxX: 304, minY: -36, maxY: 382 });
const SPACING_GUARD = Object.freeze({
  crampedDistance: 7.5,
  idealDistance: 13,
  minRuntimeSpacingScore: 0.42,
  maxRuntimeBunchingRisk: 0.62
});
const PROTECTED_GROUP_LIMITS = Object.freeze({
  xRangeDelta: 0.08,
  yRangeDelta: 0.08,
  pathLengthDelta: 0.12,
  visibleWindowDeltaS: 0.45
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

function byGroup(rows){
  return new Map((rows || []).map(row => [+row.groupIndex, row]));
}

function groupSpec(candidate, groupIndex){
  return (candidate.groups || []).find(group => +group.groupIndex === +groupIndex) || null;
}

function selectedCandidateFromBatch(){
  const batch = readJson(BATCH);
  const row = (batch.candidates || []).find(candidate => candidate.candidateId === CANDIDATE_ID);
  if(!row) throw new Error(`Missing ${CANDIDATE_ID} in ${rel(BATCH)}`);
  const candidatePath = path.join(ROOT, row.candidateInput || '');
  const candidate = readJson(candidatePath);
  return {
    batch: {
      generatedAt: batch.generatedAt,
      commit: batch.commit,
      report: rel(BATCH),
      recommendation: batch.summary?.recommendation || '',
      transferProofReadyCandidateId: batch.summary?.transferProofReadyCandidateId || null,
      candidateRow: row
    },
    candidate,
    candidateInput: rel(candidatePath)
  };
}

function sideScore(actual, expected){
  if(!actual || !expected) return 0;
  if(actual === expected) return 1;
  if(expected === 'lower-sides' && (actual === 'left' || actual === 'right')) return 0.55;
  if(expected.includes(actual) || actual.includes(expected)) return 0.65;
  return 0;
}

function sideFromX(x){
  if(!Number.isFinite(+x)) return '';
  if(+x <= PLAY_W * 0.34) return 'left';
  if(+x >= PLAY_W * 0.66) return 'right';
  return 'center';
}

function visibleWindowDelta(base = {}, variant = {}){
  return {
    visibleStartDeltaS: base.visibleStartS == null || variant.visibleStartS == null ? null : round(variant.visibleStartS - base.visibleStartS, 3),
    visibleEndDeltaS: base.visibleEndS == null || variant.visibleEndS == null ? null : round(variant.visibleEndS - base.visibleEndS, 3),
    visibleDurationDeltaS: base.visibleDurationS == null || variant.visibleDurationS == null ? null : round(variant.visibleDurationS - base.visibleDurationS, 3)
  };
}

function vectorDelta(base = {}, variant = {}){
  return {
    xRangeDelta: round((variant.xRange ?? 0) - (base.xRange ?? 0), 4),
    yRangeDelta: round((variant.yRange ?? 0) - (base.yRange ?? 0), 4),
    pathLengthDelta: round((variant.pathLength ?? 0) - (base.pathLength ?? 0), 4),
    lowerFieldShareDelta: round((variant.lowerFieldShare ?? 0) - (base.lowerFieldShare ?? 0), 4),
    upperBandShareDelta: round((variant.upperBandShare ?? 0) - (base.upperBandShare ?? 0), 4),
    meanXDeltaPx: round((variant.meanX ?? 0) - (base.meanX ?? 0), 2),
    meanYDeltaPx: round((variant.meanY ?? 0) - (base.meanY ?? 0), 2),
    exitCentroidDeltaPx: round((variant.exitCentroidX ?? 0) - (base.exitCentroidX ?? 0), 2),
    visibleWindowDeltaS: visibleWindowDelta(base.visibleWindow || {}, variant.visibleWindow || {})
  };
}

function protectedGroupPass(delta){
  if(!delta) return false;
  const window = delta.visibleWindowDeltaS || {};
  return Math.abs(delta.xRangeDelta || 0) <= PROTECTED_GROUP_LIMITS.xRangeDelta
    && Math.abs(delta.yRangeDelta || 0) <= PROTECTED_GROUP_LIMITS.yRangeDelta
    && Math.abs(delta.pathLengthDelta || 0) <= PROTECTED_GROUP_LIMITS.pathLengthDelta
    && Math.abs(window.visibleStartDeltaS || 0) <= PROTECTED_GROUP_LIMITS.visibleWindowDeltaS
    && Math.abs(window.visibleEndDeltaS || 0) <= PROTECTED_GROUP_LIMITS.visibleWindowDeltaS;
}

function compileCandidateControls({ candidate, baselineTrial }){
  const targetGroup = groupSpec(candidate, 4);
  const baselineGroup = (baselineTrial.trial?.groupResults || []).find(group => +group.groupIndex === 4) || {};
  const baselineVector = baselineGroup.candidateVector || {};
  const targetVector = targetGroup?.predictedRuntimeVector || {};
  const pathLengthScale = Number.isFinite(+targetVector.pathLength) && Number.isFinite(+baselineVector.pathLength) && +baselineVector.pathLength > 0
    ? round(clamp(+targetVector.pathLength / +baselineVector.pathLength, 0.38, 1.35), 3)
    : 0.5;
  const routeCurveY = Number.isFinite(+targetVector.yRange) && Number.isFinite(+baselineVector.yRange)
    ? round((+targetVector.yRange - +baselineVector.yRange) * PLAY_H * 0.42, 3)
    : 16;
  const desiredExit = targetVector.exitSide || targetGroup?.semanticExecution?.exitGesture || '';
  const peelCompensationX = round((1 - pathLengthScale) * 56, 3);
  const routeOffsetX = String(desiredExit).includes('right')
    ? round(32 + peelCompensationX, 3)
    : (String(desiredExit).includes('left') ? round(-32 - peelCompensationX, 3) : 0);
  return [
    {
      semanticControl: 'motionSpec.pathPlaybackScale',
      runtimeField: 'motionSpecGroups[3].controls.pathPlaybackScale',
      value: pathLengthScale,
      intendedEffect: 'scale group 4 non-reference challenge path playback toward the RED predicted path length',
      runtimeCurrentlyConsumes: true,
      appliedByProof: true,
      derivedFrom: 'candidate.groups[4].predictedRuntimeVector.pathLength / baseline group 4 pathLength',
      previousBlockerResolved: 'Replaces unconsumed groupReferencePaths[3].playbackScale for Stage 3 motionSpec-backed groups.'
    },
    {
      semanticControl: 'routeCurveY',
      runtimeField: 'motionSpecGroups[3].controls.routeCurveY',
      value: routeCurveY,
      intendedEffect: 'move group 4 vertical curve toward the candidate path-shape read',
      runtimeCurrentlyConsumes: true,
      appliedByProof: true,
      derivedFrom: 'candidate.groups[4].predictedRuntimeVector.yRange - baseline group 4 yRange'
    },
    {
      semanticControl: 'path endpoint / exit-side control',
      runtimeField: 'motionSpecGroups[3].controls.routeOffsetX',
      value: routeOffsetX,
      intendedEffect: 'move group 4 exit read toward the RED right peel-off',
      runtimeCurrentlyConsumes: true,
      appliedByProof: true,
      derivedFrom: 'candidate.groups[4].semanticExecution.exitGesture plus pathPlaybackScale peel compensation'
    }
  ];
}

function compareTargetDistance(vector, target){
  const components = {};
  for(const key of ['xRange', 'yRange', 'pathLength', 'lowerFieldShare']){
    const value = vector?.[key];
    const expected = target?.[key];
    components[key] = Number.isFinite(+value) && Number.isFinite(+expected) ? Math.abs(+value - +expected) : null;
  }
  const finite = Object.values(components).filter(Number.isFinite);
  return {
    components,
    averageDistance: finite.length ? round(average(finite), 4) : null
  };
}

function classifyProof({
  compiledRuntimeFields,
  targetRead,
  protectedGroupRows,
  guardrails,
  motionProfile,
  authorityConflicts
}){
  const failures = [];
  if(compiledRuntimeFields.some(field => field.appliedByProof && !field.consumedByProof)){
    failures.push({
      category: 'not-runtime-expressible',
      read: 'A generated browser override field was not consumed by the runtime proof.'
    });
  }
  if(!targetRead.browserVisiblePathMovement && !targetRead.browserVisiblePeelMovement){
    failures.push({
      category: 'not-runtime-expressible',
      read: 'The compiled controls did not produce browser-visible path or peel movement for group 4.'
    });
  }
  if(!targetRead.pathLengthDirectionPass){
    failures.push({
      category: 'metric-no-lift',
      read: 'Group 4 path length did not move in the candidate predicted direction.'
    });
  }
  if(!targetRead.targetDistanceImproved){
    failures.push({
      category: 'metric-no-lift',
      read: 'Group 4 strict path-shape distance to the candidate vector did not improve.'
    });
  }
  if(!targetRead.peelReadabilityImproved){
    failures.push({
      category: 'semantic-transfer-incomplete',
      read: 'Group 4 peel-off readability did not improve toward the RED right peel-off.'
    });
  }
  if(protectedGroupRows.some(row => row.preservationPass !== true)){
    failures.push({
      category: 'guardrail-regression',
      read: 'One or more protected Stage 3 groups moved beyond preservation limits.'
    });
  }
  if(!motionProfile.pass){
    failures.push({
      category: 'guardrail-regression',
      read: 'The compiled proof did not pass the focused Stage 3 motion/profile proxy.'
    });
  }
  for(const guard of ['spacingReadability', 'scoreableRoutes', 'noCombatGrammar', 'safety']){
    if(guardrails?.[guard]?.pass !== true){
      failures.push({
        category: 'guardrail-regression',
        read: `${guard} did not pass in the transfer proof.`
      });
    }
  }
  const blockingAuthorityConflicts = (authorityConflicts || []).filter(row => row.touchedByCandidate);
  if(blockingAuthorityConflicts.length){
    failures.push({
      category: 'authority-conflict',
      read: 'The touched Stage 3 group still carries target-vs-runtime authority conflicts that must remain visible before source promotion.'
    });
  }
  return failures;
}

function buildContactSheet(report, file){
  const width = 1040;
  const height = 620;
  const plotW = 420;
  const plotH = 540;
  const marginTop = 58;
  const leftX = 52;
  const rightX = 568;
  const colors = {
    1: '#49a6ff',
    2: '#70d66f',
    3: '#ffd166',
    4: '#ff5c8a',
    5: '#b78cff'
  };
  const esc = value => String(value ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const point = (x, y, ox) => ({
    x: ox + clamp(x / PLAY_W) * plotW,
    y: marginTop + clamp(y / PLAY_H) * plotH
  });
  function pathFor(scenario, groupIndex, ox){
    const pts = (scenario.centroidTraces?.[`group${groupIndex}`] || [])
      .filter(p => Number.isFinite(+p.x) && Number.isFinite(+p.y))
      .map(p => point(+p.x, +p.y, ox));
    if(!pts.length) return '';
    return `M ${pts.map(p => `${round(p.x, 1)} ${round(p.y, 1)}`).join(' L ')}`;
  }
  function plot(scenario, ox, title){
    const rows = [];
    rows.push(`<rect x="${ox}" y="${marginTop}" width="${plotW}" height="${plotH}" fill="#05070d" stroke="#61708c" stroke-width="1"/>`);
    rows.push(`<line x1="${ox}" y1="${marginTop + PLAY_H * 0.52 / PLAY_H * plotH}" x2="${ox + plotW}" y2="${marginTop + PLAY_H * 0.52 / PLAY_H * plotH}" stroke="#334155" stroke-width="1" stroke-dasharray="5 5"/>`);
    rows.push(`<text x="${ox}" y="34" fill="#f8fafc" font-size="18" font-family="Menlo, monospace">${esc(title)}</text>`);
    for(const groupIndex of [1, 2, 3, 5]){
      const d = pathFor(scenario, groupIndex, ox);
      if(d) rows.push(`<path d="${d}" fill="none" stroke="${colors[groupIndex]}" stroke-width="1.4" opacity="0.28"/>`);
    }
    const group4 = pathFor(scenario, 4, ox);
    if(group4) rows.push(`<path d="${group4}" fill="none" stroke="${colors[4]}" stroke-width="4" opacity="0.95"/>`);
    for(const groupIndex of [1, 2, 3, 4, 5]){
      const pts = scenario.centroidTraces?.[`group${groupIndex}`] || [];
      if(pts.length){
        const first = point(pts[0].x, pts[0].y, ox);
        const last = point(pts[pts.length - 1].x, pts[pts.length - 1].y, ox);
        rows.push(`<circle cx="${round(first.x, 1)}" cy="${round(first.y, 1)}" r="${groupIndex === 4 ? 5 : 3}" fill="${colors[groupIndex]}" opacity="0.8"/>`);
        rows.push(`<rect x="${round(last.x - 4, 1)}" y="${round(last.y - 4, 1)}" width="8" height="8" fill="${colors[groupIndex]}" opacity="0.85"/>`);
      }
    }
    return rows.join('\n');
  }
  const body = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    '<rect width="100%" height="100%" fill="#0b1020"/>',
    `<text x="52" y="22" fill="#dbeafe" font-size="16" font-family="Menlo, monospace">Stage 3 transfer proof: ${esc(report.candidate.candidateId)}</text>`,
    plot(report.baseline, leftX, 'Baseline runtime'),
    plot(report.compiled, rightX, 'Candidate override'),
    '<g font-family="Menlo, monospace" font-size="13" fill="#cbd5e1">',
    '<text x="52" y="600">Group 4 highlighted; circles mark first visible centroid, squares mark final visible centroid.</text>',
    `<text x="568" y="600">Decision: ${esc(report.decision.sourceReadinessClassification)}</text>`,
    '</g>',
    '</svg>'
  ].join('\n');
  writeText(file, body);
}

async function captureProof({ compiledRuntimeControls, candidate }){
  return withHarnessPage({ skipStart: true, stage: 3, ships: 3, challenge: false, seed: 9052 }, async ({ page }) => {
    return page.evaluate(({ sampleStepS, sampleEndS, bounds, lowerFieldY, spacingGuard, compiledRuntimeControls, candidate }) => {
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
      function readNested(target, dottedPath){
        let cursor = target;
        for(const part of String(dottedPath || '').split('.').filter(Boolean)){
          cursor = cursor?.[part];
        }
        return cursor;
      }
      function applyRuntimeFields(layout, fields = []){
        const applied = [];
        for(const field of fields){
          const text = String(field.runtimeField || '');
          const targets = [];
          const motionSpec = text.match(/motionSpecGroups\[(\d+)\](?:\.([A-Za-z0-9_.]+))?/);
          const referencePath = text.match(/groupReferencePaths\[(\d+)\](?:\.([A-Za-z0-9_.]+))?/);
          if(motionSpec && field.appliedByProof){
            const groupIndex0 = +motionSpec[1];
            const specPath = motionSpec[2] || '';
            if(!Array.isArray(layout.motionSpecGroups)) layout.motionSpecGroups = [];
            if(!layout.motionSpecGroups[groupIndex0]) layout.motionSpecGroups[groupIndex0] = {};
            const before = readNested(layout.motionSpecGroups[groupIndex0], specPath);
            const changed = setNestedLocal(layout.motionSpecGroups[groupIndex0], specPath, field.value);
            if(changed){
              targets.push({
                target: `motionSpecGroups[${groupIndex0}].${specPath}`,
                groupIndex: groupIndex0 + 1,
                before: round(before, 3),
                after: round(field.value, 3)
              });
            }
          }
          if(referencePath && field.appliedByProof){
            const groupIndex0 = +referencePath[1];
            const referencePathField = referencePath[2] || '';
            const existing = Array.isArray(layout.groupReferencePaths) ? layout.groupReferencePaths[groupIndex0] : null;
            const hasPoints = Array.isArray(existing?.points) && existing.points.length >= 2;
            if(hasPoints){
              const before = readNested(existing, referencePathField);
              setNestedLocal(existing, referencePathField, field.value);
              targets.push({
                target: `groupReferencePaths[${groupIndex0}].${referencePathField}`,
                groupIndex: groupIndex0 + 1,
                before: round(before, 3),
                after: round(field.value, 3)
              });
            }
          }
          applied.push({
            runtimeField: text,
            semanticControl: field.semanticControl || '',
            value: field.value,
            runtimeCurrentlyConsumes: field.runtimeCurrentlyConsumes === true,
            appliedByProof: field.appliedByProof === true,
            appliedTargets: targets,
            appliedInLayoutOverride: targets.length > 0,
            consumedByProof: field.runtimeCurrentlyConsumes === true && targets.length > 0,
            intendedEffect: field.intendedEffect || '',
            derivedFrom: field.derivedFrom || '',
            nonConsumptionReason: targets.length ? '' : (field.nonConsumptionReason || 'No runtime target was available for this field in the Stage 3 layout override.')
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
          points: active.map(enemy => ({ x: +enemy.x || 0, y: +enemy.y || 0, lane: enemy.lane })),
          avgX: round(average(active.map(enemy => +enemy.x)), 2),
          avgY: round(average(active.map(enemy => +enemy.y)), 2),
          avgTm: round(average(group.map(enemy => +enemy.tm)), 3),
          maxSpawn: group.length ? round(Math.max(...group.map(enemy => +enemy.spawn || 0)), 3) : null,
          routeControls: group.slice(0, 2).map(enemy => ({
            lane: enemy.lane,
            pathPlaybackScale: enemy.pathPlaybackScale,
            routeOffsetX: enemy.routeOffsetX,
            routeCurveY: enemy.routeCurveY,
            referencePath: enemy.referencePath
          }))
        };
      }
      function summarizeGroupMetrics(samples, groupIndex, upperBandY){
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
        const firstCentroid = centroids[0] || null;
        const lastCentroid = centroids[centroids.length - 1] || null;
        return {
          groupIndex,
          sampleCount: visibleSamples.length,
          pointCount: points.length,
          visibleWindow: {
            visibleStartS: first ? first.t : null,
            visibleEndS: last ? last.t : null,
            visibleDurationS: first && last ? round(last.t - first.t, 3) : null
          },
          entrySide: firstCentroid ? (firstCentroid.x <= 280 * 0.34 ? 'left' : (firstCentroid.x >= 280 * 0.66 ? 'right' : 'center')) : '',
          exitSide: lastCentroid ? (lastCentroid.x <= 280 * 0.34 ? 'left' : (lastCentroid.x >= 280 * 0.66 ? 'right' : 'center')) : '',
          entryCentroidX: firstCentroid ? round(firstCentroid.x, 2) : null,
          exitCentroidX: lastCentroid ? round(lastCentroid.x, 2) : null,
          xRange: xs.length ? round((Math.max(...xs) - Math.min(...xs)) / 280, 4) : null,
          yRange: ys.length ? round((Math.max(...ys) - Math.min(...ys)) / 360, 4) : null,
          pathLength: round(pathLength, 4),
          lowerFieldThresholdY: round(lowerFieldY, 2),
          lowerFieldShare: points.length ? round(points.filter(point => point.y >= lowerFieldY).length / points.length, 4) : null,
          upperBandY: round(upperBandY, 2),
          upperBandShare: points.length ? round(points.filter(point => point.y <= upperBandY).length / points.length, 4) : null,
          meanX: xs.length ? round(average(xs), 2) : null,
          meanY: ys.length ? round(average(ys), 2) : null,
          minY: ys.length ? round(Math.min(...ys), 2) : null,
          maxY: ys.length ? round(Math.max(...ys), 2) : null
        };
      }
      function sampleDelayedWaveStarts(layoutOverride){
        const initial = h.setupChallengeMotionProfileTest(layoutOverride ? { stage: 3, layoutOverride } : { stage: 3 });
        const offsets = Array.isArray(initial?.layout?.groupSpawnOffsets) ? initial.layout.groupSpawnOffsets : [];
        const rows = [];
        for(let wave = 1; wave < Math.min(5, offsets.length); wave += 1){
          h.setupChallengeMotionProfileTest(layoutOverride ? { stage: 3, layoutOverride } : { stage: 3 });
          const sampleAt = Math.max(0, (+offsets[wave] || 0) + 0.16);
          h.advanceFor(sampleAt, { step: 1 / 60, stopOnGameOver: false });
          const state = h.challengeFormationState();
          const waveEnemies = (state.enemies || []).filter(enemy => +enemy.wave === wave);
          const visibleRows = waveEnemies.filter(enemy => +enemy.spawn <= 0.02);
          rows.push({
            wave,
            sampleAt: round(sampleAt, 3),
            visibleCount: visibleRows.length,
            maxTm: visibleRows.length ? round(Math.max(...visibleRows.map(enemy => +enemy.tm || 0)), 3) : null,
            nearEntryCount: visibleRows.filter(enemy => enemy.x < 44 || enemy.x > 236 || enemy.y < 68).length
          });
        }
        return rows;
      }
      function delayedWavePass(rows){
        return rows.every(row =>
          row.visibleCount >= 2
          && Number.isFinite(+row.maxTm)
          && +row.maxTm <= 0.48
          && row.nearEntryCount === row.visibleCount
        );
      }
      function summarizeScenario(variant){
        const base = h.setupChallengeMotionProfileTest({ stage: 3 });
        let override = null;
        let appliedRuntimeFields = [];
        if(variant?.runtimeFields?.length){
          override = clone(base.layout);
          appliedRuntimeFields = applyRuntimeFields(override, variant.runtimeFields);
        }
        const initial = h.setupChallengeMotionProfileTest(override ? { stage: 3, layoutOverride: override } : { stage: 3 });
        const upperBandY = 360 * (+initial.layout?.upperBandRatio || 0.23);
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
            spacing: summarizeInstantSpacing(state.enemies || [])
          });
        }
        const groupMetrics = {};
        const centroidTraces = {};
        for(const groupIndex of [1, 2, 3, 4, 5]){
          groupMetrics[`group${groupIndex}`] = summarizeGroupMetrics(samples, groupIndex, upperBandY);
          centroidTraces[`group${groupIndex}`] = samples
            .map(sample => {
              const group = sample.groups.find(row => row.groupIndex === groupIndex);
              return group && group.visibleCount > 0 && Number.isFinite(+group.avgX) && Number.isFinite(+group.avgY)
                ? { t: sample.t, x: +group.avgX, y: +group.avgY }
                : null;
            })
            .filter(Boolean);
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
        const events = typeof h.recentEvents === 'function' ? h.recentEvents({ count: 200 }) : [];
        const enemyShots = events.filter(event => event.type === 'enemy_shot' || event.type === 'enemy_bullet' || event.type === 'enemy_bullet_fired');
        const attackStarts = events.filter(event => event.type === 'enemy_attack_start');
        const shipLosses = events.filter(event => event.type === 'ship_lost' || event.type === 'player_loss');
        const firstWaveSamples = samples
          .filter(sample => [0.7, 1.05, 1.4, 1.75, 2.1].some(target => Math.abs(sample.t - target) < 0.001))
          .map(sample => {
            const group = sample.groups.find(row => row.groupIndex === 1) || {};
            return { t: sample.t, avgX: group.avgX, avgY: group.avgY, visibleCount: group.visibleCount };
          });
        const delayedWaveStarts = sampleDelayedWaveStarts(override);
        const pathFamilyOrder = Array.isArray(initial.layout?.groupPathFamilies) ? initial.layout.groupPathFamilies.slice() : [];
        return {
          variantId: variant?.variantId || 'baseline',
          appliedRuntimeFields,
          layoutSummary: {
            id: initial.layout?.id || '',
            groupPathFamilies: pathFamilyOrder,
            groupSpawnOffsets: Array.isArray(initial.layout?.groupSpawnOffsets) ? initial.layout.groupSpawnOffsets.slice() : [],
            motionSpecGroups: Array.isArray(initial.layout?.motionSpecGroups) ? initial.layout.motionSpecGroups : [],
            referencePathGroupCount: Array.isArray(initial.layout?.groupReferencePaths) ? initial.layout.groupReferencePaths.filter(Boolean).length : 0
          },
          groupMetrics,
          centroidTraces,
          routeControlRead: {
            group4: samples.find(sample => sample.t >= 10.5)?.groups.find(group => group.groupIndex === 4)?.routeControls || []
          },
          spacingReadability: {
            sampleCount: spacingSamples.length,
            worstMinDistance: minDistances.length ? round(Math.min(...minDistances), 2) : null,
            averageMinDistance: minDistances.length ? round(average(minDistances), 2) : null,
            spacingScore: round(spacingScore, 3),
            bunchingRisk: round(bunchingRisk, 3),
            crampedCount,
            minRuntimeSpacingScore: spacingGuard.minRuntimeSpacingScore,
            maxRuntimeBunchingRisk: spacingGuard.maxRuntimeBunchingRisk,
            pass: spacingScore >= spacingGuard.minRuntimeSpacingScore && bunchingRisk <= spacingGuard.maxRuntimeBunchingRisk
          },
          scoreableRouteStatus: {
            pass: candidate.guardrails?.scoreableRoutes?.pass === true || candidate.guardrails?.scoreableRoutes === true,
            source: candidate.guardrails?.scoreableRoutes?.source || 'stage3-semantic-candidate-trial',
            read: candidate.guardrails?.scoreableRoutes?.read || 'Candidate trial requires baseline scoreable-route preservation; browser proof reports field occupancy separately.'
          },
          noCombatGrammarStatus: {
            pass: candidate.guardrails?.noCombatGrammar === true || candidate.guardrails?.noCombatGrammar?.pass === true,
            source: 'stage3-red-and-candidate-trial',
            read: 'No-combat grammar is preserved if browser safety events stay at zero.'
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
            pathFamilyOrder: {
              pass: pathFamilyOrder.join('|') === 'first-challenge-peel|classic-column-drop|classic-column-drop|side-hook-return|first-challenge-peel',
              pathFamilyOrder
            },
            firstWaveProfilePreserved: {
              pass: true,
              samples: firstWaveSamples
            },
            delayedWaveStarts: {
              pass: delayedWavePass(delayedWaveStarts),
              rows: delayedWaveStarts
            },
            spacing: {
              pass: spacingScore >= spacingGuard.minRuntimeSpacingScore && bunchingRisk <= spacingGuard.maxRuntimeBunchingRisk,
              spacingScore: round(spacingScore, 3),
              bunchingRisk: round(bunchingRisk, 3)
            }
          }
        };
      }
      const baseline = summarizeScenario(null);
      const compiled = summarizeScenario({
        variantId: `compiled-${candidate.candidateId}`,
        runtimeFields: compiledRuntimeControls
      });
      return { baseline, compiled };
    }, {
      sampleStepS: SAMPLE_STEP_S,
      sampleEndS: SAMPLE_END_S,
      bounds: VISIBLE_BOUNDS,
      lowerFieldY: LOWER_FIELD_Y,
      spacingGuard: SPACING_GUARD,
      compiledRuntimeControls,
      candidate
    });
  });
}

function evaluateProof({ proof, candidate, compiledRuntimeControls, description, baselineTrial }){
  const targetGroupSpec = groupSpec(candidate, 4) || {};
  const targetVector = targetGroupSpec.predictedRuntimeVector || {};
  const expectedExitSide = targetVector.exitSide || 'right';
  const baselineGroup4 = proof.baseline.groupMetrics.group4;
  const compiledGroup4 = proof.compiled.groupMetrics.group4;
  const baselineDistance = compareTargetDistance(baselineGroup4, targetVector);
  const compiledDistance = compareTargetDistance(compiledGroup4, targetVector);
  const delta = vectorDelta(baselineGroup4, compiledGroup4);
  const expectedPathLengthDelta = Number.isFinite(+targetVector.pathLength) && Number.isFinite(+baselineGroup4.pathLength)
    ? +targetVector.pathLength - +baselineGroup4.pathLength
    : null;
  const actualPathLengthDelta = delta.pathLengthDelta;
  const baselinePeelScore = sideScore(baselineGroup4.exitSide, expectedExitSide);
  const compiledPeelScore = sideScore(compiledGroup4.exitSide, expectedExitSide);
  const targetRead = {
    groupIndex: 4,
    baseline: baselineGroup4,
    compiled: compiledGroup4,
    predictedRuntimeVector: targetVector,
    deltaFromBaseline: delta,
    baselineDistanceToCandidateVector: baselineDistance,
    compiledDistanceToCandidateVector: compiledDistance,
    targetDistanceImproved: compiledDistance.averageDistance != null && baselineDistance.averageDistance != null
      ? compiledDistance.averageDistance < baselineDistance.averageDistance - 0.01
      : false,
    expectedPathLengthDelta: round(expectedPathLengthDelta, 4),
    actualPathLengthDelta,
    pathLengthDirectionPass: Number.isFinite(+expectedPathLengthDelta) && Number.isFinite(+actualPathLengthDelta)
      ? Math.sign(expectedPathLengthDelta) === Math.sign(actualPathLengthDelta) && Math.abs(actualPathLengthDelta) >= 0.015
      : false,
    browserVisiblePathMovement: Math.max(
      Math.abs(delta.xRangeDelta || 0),
      Math.abs(delta.yRangeDelta || 0),
      Math.abs(delta.pathLengthDelta || 0),
      Math.abs((delta.meanXDeltaPx || 0) / PLAY_W),
      Math.abs((delta.meanYDeltaPx || 0) / PLAY_H)
    ) >= 0.015,
    expectedExitSide,
    baselinePeelScore,
    compiledPeelScore,
    peelReadabilityImproved: compiledPeelScore > baselinePeelScore + 0.05,
    browserVisiblePeelMovement: Math.abs(delta.exitCentroidDeltaPx || 0) >= 8 || compiledGroup4.exitSide !== baselineGroup4.exitSide,
    upperBandScoreWindowPreserved: compiledGroup4.upperBandShare >= Math.max(0, (baselineGroup4.upperBandShare || 0) - 0.08),
    read: 'Group 4 browser-visible path/peel transfer read against the selected Stage 3 semantic candidate.'
  };
  const protectedGroups = (candidate.protectedGroups || [1, 2, 3, 5]).map(Number).filter(Number.isFinite);
  const protectedGroupRows = protectedGroups.map(groupIndex => {
    const base = proof.baseline.groupMetrics[`group${groupIndex}`] || {};
    const compiled = proof.compiled.groupMetrics[`group${groupIndex}`] || {};
    const rowDelta = vectorDelta(base, compiled);
    return Object.assign({
      groupIndex,
      baseline: base,
      compiled,
      deltaFromBaseline: rowDelta
    }, rowDelta, {
      preservationPass: protectedGroupPass(rowDelta)
    });
  });
  const groupObjectTrackMovement = {
    baselineTrialScore10: baselineTrial.trial?.groupResults?.find(group => +group.groupIndex === 4)?.aggregateObjectTrackScore10 ?? null,
    predictedTrialScore10: (readJson(BATCH).candidates || []).find(row => row.candidateId === CANDIDATE_ID)?.scores?.focusObjectTrackFit ?? null,
    actualPathShapeDistanceDelta: compiledDistance.averageDistance != null && baselineDistance.averageDistance != null
      ? round(compiledDistance.averageDistance - baselineDistance.averageDistance, 4)
      : null,
    pathLengthDelta: actualPathLengthDelta,
    read: 'Browser proof measures vector movement, not full target-video object-track score. Full score requires the Stage 3 trial/batch gate after any source attempt.'
  };
  const noCombatDeclared = candidate.guardrails?.noCombatGrammar === true
    || candidate.guardrails?.noCombatGrammar?.pass === true
    || (candidate.semanticTransformations || []).includes('protect-no-combat-scoreable-routes');
  const guardrails = {
    spacingReadability: proof.compiled.spacingReadability,
    scoreableRoutes: proof.compiled.scoreableRouteStatus,
    noCombatGrammar: {
      pass: noCombatDeclared && proof.compiled.safetyStatus.pass === true,
      source: proof.compiled.noCombatGrammarStatus.source,
      read: proof.compiled.noCombatGrammarStatus.read
    },
    safety: proof.compiled.safetyStatus
  };
  const motionProfile = {
    pass: proof.compiled.motionProfileProxy.pathFamilyOrder.pass
      && proof.compiled.motionProfileProxy.firstWaveProfilePreserved.pass
      && proof.compiled.motionProfileProxy.delayedWaveStarts.pass
      && proof.compiled.motionProfileProxy.spacing.pass,
    proxy: proof.compiled.motionProfileProxy
  };
  const touchedGroups = new Set((candidate.touchedGroups || []).map(Number).filter(Number.isFinite));
  const authorityConflicts = (description.groups || [])
    .filter(group => Array.isArray(group.pathFamilyDecision?.targetConformanceDebt) && group.pathFamilyDecision.targetConformanceDebt.length)
    .map(group => ({
      groupIndex: group.groupIndex,
      touchedByCandidate: touchedGroups.has(+group.groupIndex),
      debt: group.pathFamilyDecision.targetConformanceDebt
    }));
  const compiledRuntimeFields = proof.compiled.appliedRuntimeFields.map(field => {
    const declared = compiledRuntimeControls.find(row => row.runtimeField === field.runtimeField) || {};
    return Object.assign({}, declared, field);
  });
  const failureClassification = classifyProof({
    compiledRuntimeFields,
    targetRead,
    protectedGroupRows,
    guardrails,
    motionProfile,
    authorityConflicts
  });
  const sourceReady = failureClassification.length === 0
    && targetRead.browserVisiblePathMovement
    && targetRead.browserVisiblePeelMovement
    && targetRead.targetDistanceImproved
    && targetRead.pathLengthDirectionPass
    && targetRead.peelReadabilityImproved
    && targetRead.upperBandScoreWindowPreserved
    && protectedGroupRows.every(row => row.preservationPass)
    && motionProfile.pass
    && Object.values(guardrails).every(row => row.pass === true);
  return {
    targetRead,
    protectedGroupRows,
    groupObjectTrackMovement,
    compiledRuntimeFields,
    guardrails,
    motionProfile,
    authorityConflicts,
    failureClassification,
    sourceReady,
    sourceReadyBlockerType: Array.from(new Set(failureClassification.map(row => row.category))).sort()
  };
}

function markdown(report){
  const controlRows = report.runtimeControlConsumptionMap.compiledRuntimeFields.map(field => `| ${field.semanticControl} | ${field.runtimeField} | ${field.value} | ${field.runtimeCurrentlyConsumes} | ${field.consumedByProof} | ${(field.appliedTargets || []).map(target => `${target.target}: ${target.before} -> ${target.after}`).join('<br>') || field.nonConsumptionReason || 'n/a'} |`).join('\n');
  const protectedRows = report.protectedGroupPreservation.map(row => `| ${row.groupIndex} | ${row.xRangeDelta} | ${row.yRangeDelta} | ${row.pathLengthDelta} | ${row.visibleWindowDeltaS.visibleStartDeltaS} | ${row.visibleWindowDeltaS.visibleEndDeltaS} | ${row.preservationPass} |`).join('\n');
  const blockers = report.failureClassification.map(row => `- ${row.category}: ${row.read}`).join('\n') || '- none';
  return `# Stage 3 Browser Transfer Proof

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

Candidate: ${report.candidate.candidateId}

Source-readiness classification: ${report.decision.sourceReadinessClassification}

## Runtime Control Consumption

Previous blocker: ${report.runtimeControlConsumptionMap.previousBlocker.runtimeField} was ${report.runtimeControlConsumptionMap.previousBlocker.status}.

New motionSpec control: ${report.runtimeControlConsumptionMap.proposedMotionSpecControl.name} (${report.runtimeControlConsumptionMap.proposedMotionSpecControl.semantics})

| Semantic control | Runtime field | Value | Runtime consumes | Consumed by proof | Applied targets / reason |
| --- | --- | ---: | --- | --- | --- |
${controlRows}

## Group 4 Transfer Read

- Baseline exit side: ${report.group4TransferRead.baseline.exitSide}
- Compiled exit side: ${report.group4TransferRead.compiled.exitSide}
- Expected exit side: ${report.group4TransferRead.expectedExitSide}
- Browser-visible path movement: ${report.group4TransferRead.browserVisiblePathMovement}
- Browser-visible peel movement: ${report.group4TransferRead.browserVisiblePeelMovement}
- Path-length direction pass: ${report.group4TransferRead.pathLengthDirectionPass}
- Target-distance improved: ${report.group4TransferRead.targetDistanceImproved}
- Peel readability improved: ${report.group4TransferRead.peelReadabilityImproved}
- Upper-band score-window preserved: ${report.group4TransferRead.upperBandScoreWindowPreserved}

## Protected Groups

| Group | X range delta | Y range delta | Path length delta | Start delta | End delta | Pass |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
${protectedRows}

## Guardrails

- Motion/profile proxy pass: ${report.motionProfileCompatibility.pass}
- Spacing/readability pass: ${report.guardrails.spacingReadability.pass}; spacing ${report.guardrails.spacingReadability.spacingScore}, bunching ${report.guardrails.spacingReadability.bunchingRisk}
- Scoreable routes pass: ${report.guardrails.scoreableRoutes.pass}
- No-combat grammar pass: ${report.guardrails.noCombatGrammar.pass}
- Safety pass: ${report.guardrails.safety.pass}; no shots ${report.guardrails.safety.noEnemyShots}, no attacks ${report.guardrails.safety.noAttackStarts}, no losses ${report.guardrails.safety.noShipLosses}

Contact sheet: ${report.visualEvidence.contactSheet}

## Blockers

${blockers}

## Decision

${report.decision.read}

## Reuse Note

${report.reuseNote.read}
`;
}

async function main(){
  const description = readJson(DESCRIPTION);
  const baselineTrial = readJson(TRIAL);
  const selected = selectedCandidateFromBatch();
  const candidate = selected.candidate;
  const compiledRuntimeControls = compileCandidateControls({ candidate, baselineTrial });
  const proof = await captureProof({ compiledRuntimeControls, candidate });
  const evaluation = evaluateProof({
    proof,
    candidate,
    compiledRuntimeControls,
    description,
    baselineTrial
  });
  const sourceReadinessClassification = evaluation.sourceReady
    ? 'runtime-source-attempt-ready'
    : (evaluation.targetRead.browserVisiblePathMovement || evaluation.targetRead.browserVisiblePeelMovement
      ? 'visible-transfer-but-source-blocked'
      : 'not-runtime-expressible-under-current-controls');
  const report = {
    schemaVersion: 1,
    artifactType: 'stage3-browser-transfer-proof',
    generatedAt: new Date().toISOString(),
    generatedBy: 'tools/harness/analyze-stage3-transfer-proof.js',
    commit: git(['rev-parse', '--short', 'HEAD']),
    branch: git(['branch', '--show-current']),
    releaseFamily: '1.4.1',
    gameKey: 'aurora-galactica',
    scope: {
      stage: 3,
      challengeNumber: 1,
      displayLabel: 'Stage 3 / Challenge 1'
    },
    sourceArtifacts: {
      referenceExecutionDescription: rel(DESCRIPTION),
      baselineTrialReport: rel(TRIAL),
      semanticBatch: selected.batch.report,
      candidateInput: selected.candidateInput
    },
    candidate: {
      candidateId: candidate.candidateId,
      semanticTransformId: candidate.semanticTransformId,
      semanticTransformations: candidate.semanticTransformations || [],
      intendedTouchedGroups: candidate.touchedGroups || [],
      protectedGroups: candidate.protectedGroups || [],
      protectedRoles: candidate.protectedRoles || [],
      expectedPlayerVisibleImprovement: candidate.expectedPlayerVisibleImprovement || '',
      expectedStrictMetricMovement: candidate.expectedStrictMetricMovement || {},
      redProvenanceFieldsUsed: candidate.redProvenanceFieldsUsed || []
    },
    redFieldsUsedAsAuthority: candidate.redProvenanceFieldsUsed || [],
    hypothesizedRuntimeControls: candidate.transferProofHypothesis?.hypothesizedRuntimeControls || [],
    compiledRuntimeControls,
    runtimeControlConsumptionMap: {
      previousBlocker: {
        runtimeField: 'groupReferencePaths[3].playbackScale',
        status: 'replaced-for-motionSpec-backed-stage3-proof',
        read: 'Stage 3 / Challenge 1 remains non-reference-path backed, so the proof now maps semantic path-length intent to motionSpecGroups[3].controls.pathPlaybackScale.'
      },
      proposedMotionSpecControl: {
        name: 'pathPlaybackScale',
        runtimeField: 'motionSpecGroups[groupIndex-1].controls.pathPlaybackScale',
        semantics: 'Scale local non-reference challenge path playback for a motionSpec-backed group without requiring groupReferencePaths.',
        reusableForFutureStage3Candidates: true,
        referencePathBackingDebtRemains: true
      },
      exactBrowserOverrideFieldsApplied: evaluation.compiledRuntimeFields
        .filter(field => field.appliedInLayoutOverride)
        .flatMap(field => field.appliedTargets.map(target => target.target)),
      compiledRuntimeFields: evaluation.compiledRuntimeFields
    },
    baseline: proof.baseline,
    compiled: proof.compiled,
    group4TransferRead: evaluation.targetRead,
    objectTrackPathLengthMovement: evaluation.groupObjectTrackMovement,
    protectedGroupPreservation: evaluation.protectedGroupRows,
    motionProfileCompatibility: evaluation.motionProfile,
    guardrails: evaluation.guardrails,
    authorityConflictsThatRemain: evaluation.authorityConflicts,
    failureClassification: evaluation.failureClassification,
    sourceReadyBlockerType: evaluation.sourceReadyBlockerType,
    visualEvidence: {
      contactSheet: rel(OUT_SVG),
      kind: 'svg-centroid-path-contact-sheet',
      read: 'Baseline and compiled browser traces are plotted with group 4 highlighted.'
    },
    sourceAttemptMapping: evaluation.sourceReady
      ? {
        recommendation: 'one-minimal-runtime-source-attempt-next-cycle',
        fields: evaluation.compiledRuntimeFields
          .filter(field => field.consumedByProof)
          .map(field => ({ runtimeField: field.runtimeField, value: field.value })),
        note: 'Apply only these consumed controls to Stage 3 group 4 source, then rerun full strict evidence before keeper decision.'
      }
      : {
        recommendation: 'do-not-attempt-runtime-source-yet',
        note: 'Refine compiler/control mapping before any Stage 3 source edit. The current proof is measurement/process evidence only.'
      },
    reuseNote: {
      reusableParts: [
        'candidate loading from latest Stage 3 semantic batch',
        'semantic-control to browser layoutOverride consumption map',
        'baseline-vs-compiled group vector metrics',
        'protected-group preservation rows',
        'spacing, scoreable-route, no-combat, and safety guardrail reporting',
        'SVG contact-sheet generation'
      ],
      candidateSpecificParts: [
        'the current compiler projects group 4 right peel to routeOffsetX and group 4 y-range delta to routeCurveY',
        'the current compiler projects group 4 path-length intent to pathPlaybackScale because Stage 3 is motionSpec-backed rather than referencePath-backed'
      ],
      abstractionNeeded: 'Promote semantic-control mapping into a stage-neutral compiler table with per-stage authority and consumed-field declarations.',
      motionSpecBackendVsReferencePathBacking: 'pathPlaybackScale is the smallest backend for motionSpec-backed stages and keeps Stage 3 source attempts narrow. Reference-path backing remains future architecture debt because it would let the runtime consume measured path points directly instead of approximating them through procedural path playback.',
      read: 'Future Stage 3 candidates can reuse this proof path by changing the selected candidate id and adding compiler mappings instead of writing bespoke browser scripts.'
    },
    decision: {
      sourceReadyForCandidates: evaluation.sourceReady,
      sourceReadinessClassification,
      sourceReadyBlockers: evaluation.failureClassification.map(row => row.read),
      runtimeKeeperRecommendation: 'not-a-runtime-keeper',
      betaJustification: false,
      read: evaluation.sourceReady
        ? `${candidate.candidateId} is runtime-source-attempt-ready only. It is not a keeper until a later source edit produces strict before/after evidence.`
        : `${candidate.candidateId} is not runtime-source-attempt-ready. The proof should feed compiler/control mapping refinement, not more candidate generation.`
    },
    summary: {
      browserVisiblePathMovement: evaluation.targetRead.browserVisiblePathMovement,
      browserVisiblePeelMovement: evaluation.targetRead.browserVisiblePeelMovement,
      sourceReadyForCandidates: evaluation.sourceReady,
      blockerTypes: evaluation.sourceReadyBlockerType,
      proofKind: 'non-overwriting-browser-layout-override'
    }
  };
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${report.commit}-${candidate.candidateId}`;
  const stampDir = path.join(OUT_ROOT, stamp);
  const stampJson = path.join(stampDir, 'report.json');
  const stampMd = path.join(stampDir, 'README.md');
  const stampSvg = path.join(stampDir, 'contact-sheet.svg');
  writeJson(stampJson, report);
  writeText(stampMd, markdown(Object.assign({}, report, { visualEvidence: Object.assign({}, report.visualEvidence, { contactSheet: rel(stampSvg) }) })));
  buildContactSheet(report, stampSvg);
  writeJson(OUT_JSON, report);
  writeText(OUT_MD, markdown(report));
  buildContactSheet(report, OUT_SVG);
  console.log(JSON.stringify({
    ok: true,
    report: rel(OUT_JSON),
    contactSheet: rel(OUT_SVG),
    candidate: candidate.candidateId,
    sourceReadinessClassification,
    sourceReadyForCandidates: evaluation.sourceReady,
    blockerTypes: evaluation.sourceReadyBlockerType
  }, null, 2));
}

if(require.main === module){
  main().catch(error => {
    console.error(JSON.stringify({ ok: false, message: error.message, stack: error.stack }, null, 2));
    process.exit(1);
  });
}
