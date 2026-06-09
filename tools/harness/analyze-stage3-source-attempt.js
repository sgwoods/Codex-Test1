#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const TRANSFER_PROOF = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-runtime-expressibility', 'stage3-challenge1', 'latest-transfer-proof.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-source-attempts', 'stage3-challenge1');
const OUT_JSON = path.join(OUT_ROOT, 'latest-source-attempt.json');
const OUT_MD = path.join(OUT_ROOT, 'latest-source-attempt.md');
const OUT_SVG = path.join(OUT_ROOT, 'latest-source-attempt-contact-sheet.svg');

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
const SOURCE_CONTROLS = Object.freeze([
  Object.freeze({
    runtimeField: 'motionSpecGroups[3].controls.pathPlaybackScale',
    value: 0.5
  }),
  Object.freeze({
    runtimeField: 'motionSpecGroups[3].controls.routeCurveY',
    value: 17.464
  }),
  Object.freeze({
    runtimeField: 'motionSpecGroups[3].controls.routeOffsetX',
    value: 60
  })
]);

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

function sideFromX(x){
  if(!Number.isFinite(+x)) return '';
  if(+x <= PLAY_W * 0.34) return 'left';
  if(+x >= PLAY_W * 0.66) return 'right';
  return 'center';
}

function sideScore(actual, expected){
  if(!actual || !expected) return 0;
  if(actual === expected) return 1;
  if(expected === 'lower-sides' && (actual === 'left' || actual === 'right')) return 0.55;
  if(String(expected).includes(actual) || String(actual).includes(expected)) return 0.65;
  return 0;
}

function visibleWindowDelta(base = {}, after = {}){
  return {
    visibleStartDeltaS: base.visibleStartS == null || after.visibleStartS == null ? null : round(after.visibleStartS - base.visibleStartS, 3),
    visibleEndDeltaS: base.visibleEndS == null || after.visibleEndS == null ? null : round(after.visibleEndS - base.visibleEndS, 3),
    visibleDurationDeltaS: base.visibleDurationS == null || after.visibleDurationS == null ? null : round(after.visibleDurationS - base.visibleDurationS, 3)
  };
}

function vectorDelta(base = {}, after = {}){
  return {
    xRangeDelta: round((after.xRange ?? 0) - (base.xRange ?? 0), 4),
    yRangeDelta: round((after.yRange ?? 0) - (base.yRange ?? 0), 4),
    pathLengthDelta: round((after.pathLength ?? 0) - (base.pathLength ?? 0), 4),
    lowerFieldShareDelta: round((after.lowerFieldShare ?? 0) - (base.lowerFieldShare ?? 0), 4),
    upperBandShareDelta: round((after.upperBandShare ?? 0) - (base.upperBandShare ?? 0), 4),
    meanXDeltaPx: round((after.meanX ?? 0) - (base.meanX ?? 0), 2),
    meanYDeltaPx: round((after.meanY ?? 0) - (base.meanY ?? 0), 2),
    exitCentroidDeltaPx: round((after.exitCentroidX ?? 0) - (base.exitCentroidX ?? 0), 2),
    visibleWindowDeltaS: visibleWindowDelta(base.visibleWindow || {}, after.visibleWindow || {})
  };
}

function protectedGroupPass(delta){
  const window = delta?.visibleWindowDeltaS || {};
  return Math.abs(delta.xRangeDelta || 0) <= PROTECTED_GROUP_LIMITS.xRangeDelta
    && Math.abs(delta.yRangeDelta || 0) <= PROTECTED_GROUP_LIMITS.yRangeDelta
    && Math.abs(delta.pathLengthDelta || 0) <= PROTECTED_GROUP_LIMITS.pathLengthDelta
    && Math.abs(window.visibleStartDeltaS || 0) <= PROTECTED_GROUP_LIMITS.visibleWindowDeltaS
    && Math.abs(window.visibleEndDeltaS || 0) <= PROTECTED_GROUP_LIMITS.visibleWindowDeltaS;
}

function expectedSourceControls(proof){
  const fields = proof.sourceAttemptMapping?.fields || SOURCE_CONTROLS;
  return SOURCE_CONTROLS.map(expected => {
    const proofField = fields.find(field => field.runtimeField === expected.runtimeField) || expected;
    return {
      runtimeField: expected.runtimeField,
      proofBackedValue: +proofField.value,
      sourceValue: null,
      consumedByRuntime: false,
      matchesProof: false
    };
  });
}

function buildContactSheet(report, file){
  const width = 1040;
  const height = 620;
  const plotW = 420;
  const plotH = 540;
  const marginTop = 58;
  const leftX = 52;
  const rightX = 568;
  const colors = { 1: '#49a6ff', 2: '#70d66f', 3: '#ffd166', 4: '#ff5c8a', 5: '#b78cff' };
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
    const rows = [
      `<rect x="${ox}" y="${marginTop}" width="${plotW}" height="${plotH}" fill="#05070d" stroke="#61708c" stroke-width="1"/>`,
      `<line x1="${ox}" y1="${marginTop + PLAY_H * 0.52 / PLAY_H * plotH}" x2="${ox + plotW}" y2="${marginTop + PLAY_H * 0.52 / PLAY_H * plotH}" stroke="#334155" stroke-width="1" stroke-dasharray="5 5"/>`,
      `<text x="${ox}" y="34" fill="#f8fafc" font-size="18" font-family="Menlo, monospace">${esc(title)}</text>`
    ];
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
    `<text x="52" y="22" fill="#dbeafe" font-size="16" font-family="Menlo, monospace">Stage 3 source attempt: ${esc(report.candidateId)}</text>`,
    plot(report.beforeSourceEdit, leftX, 'Before source edit'),
    plot(report.afterSourceEdit, rightX, 'After source edit'),
    '<g font-family="Menlo, monospace" font-size="13" fill="#cbd5e1">',
    '<text x="52" y="600">Group 4 highlighted; circles mark first visible centroid, squares mark final visible centroid.</text>',
    `<text x="568" y="600">Verdict: ${esc(report.verdict)}</text>`,
    '</g>',
    '</svg>'
  ].join('\n');
  writeText(file, body);
}

async function captureSourceAttempt(expectedControls){
  return withHarnessPage({ skipStart: true, stage: 3, ships: 3, challenge: false, seed: 9052 }, async ({ page }) => {
    return page.evaluate(({ expectedControls, sampleStepS, sampleEndS, bounds, lowerFieldY, spacingGuard }) => {
      const h = window.__galagaHarness__;
      const clone = value => JSON.parse(JSON.stringify(value));
      const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(+value) ? +value : 0));
      const round = (value, places = 3) => {
        if(!Number.isFinite(+value)) return null;
        const scale = 10 ** places;
        return Math.round(+value * scale) / scale;
      };
      const average = values => {
        const finite = values.filter(value => Number.isFinite(+value));
        return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null;
      };
      const distance = (a, b) => Math.hypot((+a.x || 0) - (+b.x || 0), (+a.y || 0) - (+b.y || 0));
      const visible = enemy => +enemy.spawn <= 0.03
        && +enemy.x >= bounds.minX
        && +enemy.x <= bounds.maxX
        && +enemy.y >= bounds.minY
        && +enemy.y <= bounds.maxY;
      function controlValue(layout, runtimeField){
        if(runtimeField === 'motionSpecGroups[3].controls.pathPlaybackScale') return layout?.motionSpecGroups?.[3]?.controls?.pathPlaybackScale;
        if(runtimeField === 'motionSpecGroups[3].controls.routeCurveY') return layout?.motionSpecGroups?.[3]?.controls?.routeCurveY;
        if(runtimeField === 'motionSpecGroups[3].controls.routeOffsetX') return layout?.motionSpecGroups?.[3]?.controls?.routeOffsetX;
        return undefined;
      }
      function makeBeforeLayout(layout){
        const before = clone(layout);
        if(!Array.isArray(before.motionSpecGroups)) before.motionSpecGroups = [];
        if(before.motionSpecGroups[3]?.controls){
          delete before.motionSpecGroups[3].controls.pathPlaybackScale;
          delete before.motionSpecGroups[3].controls.routeCurveY;
          delete before.motionSpecGroups[3].controls.routeOffsetX;
          if(!Object.keys(before.motionSpecGroups[3].controls).length) delete before.motionSpecGroups[3].controls;
          if(!Object.keys(before.motionSpecGroups[3]).length) before.motionSpecGroups[3] = null;
        }
        return before;
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
        return {
          activeCount: active.length,
          minDistance: mins.length ? round(Math.min(...mins), 2) : null,
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
        const firstCentroid = centroids[0] || null;
        const lastCentroid = centroids[centroids.length - 1] || null;
        return {
          groupIndex,
          sampleCount: visibleSamples.length,
          pointCount: points.length,
          visibleWindow: {
            visibleStartS: visibleSamples[0]?.t ?? null,
            visibleEndS: visibleSamples[visibleSamples.length - 1]?.t ?? null,
            visibleDurationS: visibleSamples.length ? round(visibleSamples[visibleSamples.length - 1].t - visibleSamples[0].t, 3) : null
          },
          entrySide: firstCentroid ? (firstCentroid.x <= 280 * 0.34 ? 'left' : (firstCentroid.x >= 280 * 0.66 ? 'right' : 'center')) : '',
          exitSide: lastCentroid ? (lastCentroid.x <= 280 * 0.34 ? 'left' : (lastCentroid.x >= 280 * 0.66 ? 'right' : 'center')) : '',
          entryCentroidX: firstCentroid ? round(firstCentroid.x, 2) : null,
          exitCentroidX: lastCentroid ? round(lastCentroid.x, 2) : null,
          xRange: xs.length ? round((Math.max(...xs) - Math.min(...xs)) / 280, 4) : null,
          yRange: ys.length ? round((Math.max(...ys) - Math.min(...ys)) / 360, 4) : null,
          pathLength: round(pathLength, 4),
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
        return rows.every(row => row.visibleCount >= 2 && Number.isFinite(+row.maxTm) && +row.maxTm <= 0.48 && row.nearEntryCount === row.visibleCount);
      }
      function summarizeScenario(variant){
        const sourceInitial = h.setupChallengeMotionProfileTest({ stage: 3 });
        const layoutOverride = variant === 'before-source-edit' ? makeBeforeLayout(sourceInitial.layout) : null;
        const initial = h.setupChallengeMotionProfileTest(layoutOverride ? { stage: 3, layoutOverride } : { stage: 3 });
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
          samples.push({
            t: sampleAt,
            groups: [1, 2, 3, 4, 5].map(groupIndex => summarizeGroup(state.enemies || [], groupIndex)),
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
        const events = typeof h.recentEvents === 'function' ? h.recentEvents({ count: 300 }) : [];
        const enemyShots = events.filter(event => event.type === 'enemy_shot' || event.type === 'enemy_bullet' || event.type === 'enemy_bullet_fired');
        const attackStarts = events.filter(event => event.type === 'enemy_attack_start');
        const shipLosses = events.filter(event => event.type === 'ship_lost' || event.type === 'player_loss');
        const challengeContacts = events.filter(event => event.type === 'challenge_enemy_contact');
        const delayedWaveStarts = sampleDelayedWaveStarts(layoutOverride);
        const sourceControlRead = expectedControls.map(control => {
          const sourceValue = controlValue(initial.layout, control.runtimeField);
          return {
            runtimeField: control.runtimeField,
            proofBackedValue: control.proofBackedValue,
            sourceValue: Number.isFinite(+sourceValue) ? round(sourceValue, 3) : null,
            consumedByRuntime: Number.isFinite(+sourceValue),
            matchesProof: Number.isFinite(+sourceValue) && Math.abs(+sourceValue - +control.proofBackedValue) < 0.001
          };
        });
        return {
          variant,
          layoutSummary: {
            id: initial.layout?.id || '',
            groupPathFamilies: Array.isArray(initial.layout?.groupPathFamilies) ? initial.layout.groupPathFamilies.slice() : [],
            groupSpawnOffsets: Array.isArray(initial.layout?.groupSpawnOffsets) ? initial.layout.groupSpawnOffsets.slice() : [],
            motionSpecGroups: Array.isArray(initial.layout?.motionSpecGroups) ? initial.layout.motionSpecGroups : [],
            sourceControlRead
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
          safetyStatus: {
            pass: enemyShots.length === 0 && attackStarts.length === 0 && shipLosses.length === 0 && challengeContacts.length === 0,
            noEnemyShots: enemyShots.length === 0,
            noAttackStarts: attackStarts.length === 0,
            noShipLosses: shipLosses.length === 0,
            noChallengeContacts: challengeContacts.length === 0,
            eventCounts: {
              enemyShots: enemyShots.length,
              enemyAttackStarts: attackStarts.length,
              shipLosses: shipLosses.length,
              challengeContacts: challengeContacts.length
            }
          },
          motionProfileProxy: {
            pathFamilyOrder: {
              pass: (Array.isArray(initial.layout?.groupPathFamilies) ? initial.layout.groupPathFamilies : []).join('|') === 'first-challenge-peel|classic-column-drop|classic-column-drop|side-hook-return|first-challenge-peel',
              pathFamilyOrder: Array.isArray(initial.layout?.groupPathFamilies) ? initial.layout.groupPathFamilies.slice() : []
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
      return {
        beforeSourceEdit: summarizeScenario('before-source-edit'),
        afterSourceEdit: summarizeScenario('after-source-edit')
      };
    }, {
      expectedControls,
      sampleStepS: SAMPLE_STEP_S,
      sampleEndS: SAMPLE_END_S,
      bounds: VISIBLE_BOUNDS,
      lowerFieldY: LOWER_FIELD_Y,
      spacingGuard: SPACING_GUARD
    });
  });
}

function evaluate({ proof, capture, sourceControls }){
  const before = capture.beforeSourceEdit.groupMetrics.group4;
  const after = capture.afterSourceEdit.groupMetrics.group4;
  const delta = vectorDelta(before, after);
  const expectedExitSide = proof.group4TransferRead?.expectedExitSide || 'right';
  const beforePeelScore = sideScore(before.exitSide, expectedExitSide);
  const afterPeelScore = sideScore(after.exitSide, expectedExitSide);
  const group4 = {
    groupIndex: 4,
    before,
    after,
    deltaFromBefore: delta,
    expectedExitSide,
    beforePeelScore,
    afterPeelScore,
    exitPeelReadImproved: afterPeelScore > beforePeelScore + 0.05,
    browserVisiblePathMovement: Math.max(
      Math.abs(delta.xRangeDelta || 0),
      Math.abs(delta.yRangeDelta || 0),
      Math.abs(delta.pathLengthDelta || 0),
      Math.abs((delta.meanXDeltaPx || 0) / PLAY_W),
      Math.abs((delta.meanYDeltaPx || 0) / PLAY_H)
    ) >= 0.015,
    browserVisiblePeelMovement: Math.abs(delta.exitCentroidDeltaPx || 0) >= 8 || after.exitSide !== before.exitSide,
    pathLengthDirectionPass: Number.isFinite(+delta.pathLengthDelta) && delta.pathLengthDelta <= -0.015,
    upperBandScoreWindowPreserved: after.upperBandShare >= Math.max(0, (before.upperBandShare || 0) - 0.08),
    upperBandScoreWindowImproved: after.upperBandShare > (before.upperBandShare || 0) + 0.01
  };
  const protectedGroups = [1, 2, 3, 5].map(groupIndex => {
    const beforeGroup = capture.beforeSourceEdit.groupMetrics[`group${groupIndex}`];
    const afterGroup = capture.afterSourceEdit.groupMetrics[`group${groupIndex}`];
    const rowDelta = vectorDelta(beforeGroup, afterGroup);
    return Object.assign({
      groupIndex,
      before: beforeGroup,
      after: afterGroup,
      deltaFromBefore: rowDelta
    }, rowDelta, {
      preservationPass: protectedGroupPass(rowDelta)
    });
  });
  const sourceConsumption = sourceControls.map(control => {
    const row = capture.afterSourceEdit.layoutSummary.sourceControlRead.find(item => item.runtimeField === control.runtimeField) || {};
    const routeReads = capture.afterSourceEdit.routeControlRead.group4 || [];
    const runtimeEnemyValues = routeReads.map(enemy => {
      if(control.runtimeField.endsWith('pathPlaybackScale')) return enemy.pathPlaybackScale;
      if(control.runtimeField.endsWith('routeCurveY')) return enemy.routeCurveY;
      if(control.runtimeField.endsWith('routeOffsetX')) return enemy.routeOffsetX;
      return null;
    }).filter(value => Number.isFinite(+value));
    const runtimeConsumed = runtimeEnemyValues.length > 0 && runtimeEnemyValues.every(value => Math.abs(+value - +control.proofBackedValue) < 0.001);
    return Object.assign({}, row, {
      runtimeEnemyValues: runtimeEnemyValues.map(value => round(value, 3)),
      consumedByRuntime: row.consumedByRuntime === true && runtimeConsumed,
      matchesProof: row.matchesProof === true && runtimeConsumed
    });
  });
  const guardrails = {
    spacingReadability: capture.afterSourceEdit.spacingReadability,
    scoreableRoutes: {
      pass: proof.guardrails?.scoreableRoutes?.pass === true,
      source: proof.guardrails?.scoreableRoutes?.source || 'stage3-transfer-proof',
      read: 'Scoreable-route preservation remains inherited from the selected proof and is rechecked by challenge-stage conformance in validation.'
    },
    noCombatGrammar: {
      pass: capture.afterSourceEdit.safetyStatus.pass === true,
      read: 'No-combat grammar requires no enemy shots, no attack starts, no ship losses, and no challenge contacts during the source attempt capture.'
    },
    safety: capture.afterSourceEdit.safetyStatus
  };
  const motionProfileCompatibility = {
    pass: capture.afterSourceEdit.motionProfileProxy.pathFamilyOrder.pass
      && capture.afterSourceEdit.motionProfileProxy.delayedWaveStarts.pass
      && capture.afterSourceEdit.motionProfileProxy.spacing.pass,
    proxy: capture.afterSourceEdit.motionProfileProxy
  };
  const failures = [];
  if(sourceConsumption.some(row => row.matchesProof !== true || row.consumedByRuntime !== true)){
    failures.push({ category: 'source-control-not-consumed', read: 'One or more proof-backed controls is missing from source or not visible on runtime enemies.' });
  }
  if(!group4.browserVisiblePathMovement || !group4.pathLengthDirectionPass){
    failures.push({ category: 'path-length-not-reproduced', read: 'The source edit did not reproduce the proof-backed group 4 path-length movement.' });
  }
  if(!group4.browserVisiblePeelMovement || !group4.exitPeelReadImproved){
    failures.push({ category: 'peel-read-not-reproduced', read: 'The source edit did not reproduce the proof-backed group 4 right peel read.' });
  }
  if(!group4.upperBandScoreWindowPreserved){
    failures.push({ category: 'score-window-regression', read: 'The group 4 upper-band score window regressed.' });
  }
  if(protectedGroups.some(row => row.preservationPass !== true)){
    failures.push({ category: 'protected-group-regression', read: 'A protected Stage 3 group moved beyond preservation limits.' });
  }
  if(!motionProfileCompatibility.pass){
    failures.push({ category: 'motion-profile-regression', read: 'The source attempt failed the focused motion/profile proxy.' });
  }
  for(const guard of ['spacingReadability', 'scoreableRoutes', 'noCombatGrammar', 'safety']){
    if(guardrails[guard]?.pass !== true){
      failures.push({ category: 'guardrail-regression', read: `${guard} did not pass for the source attempt.` });
    }
  }
  const keeper = failures.length === 0;
  return {
    sourceConsumption,
    group4,
    protectedGroups,
    guardrails,
    motionProfileCompatibility,
    failures,
    verdict: keeper ? 'dev-visible-gameplay-keeper' : 'rejected'
  };
}

function markdown(report){
  const controlRows = report.sourceControlsApplied.map(row => `| ${row.runtimeField} | ${row.proofBackedValue} | ${row.sourceValue} | ${row.consumedByRuntime} | ${row.matchesProof} |`).join('\n');
  const protectedRows = report.protectedGroupPreservation.map(row => `| ${row.groupIndex} | ${row.xRangeDelta} | ${row.yRangeDelta} | ${row.pathLengthDelta} | ${row.visibleWindowDeltaS.visibleStartDeltaS} | ${row.visibleWindowDeltaS.visibleEndDeltaS} | ${row.preservationPass} |`).join('\n');
  const blockers = report.failureClassification.map(row => `- ${row.category}: ${row.read}`).join('\n') || '- none';
  return `# Stage 3 Source Attempt Report

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

Candidate: ${report.candidateId}
Verdict: ${report.verdict}

## Source Controls

| Runtime field | Proof value | Source value | Runtime consumed | Matches proof |
| --- | ---: | ---: | --- | --- |
${controlRows}

## Group 4 Before/After

- Exit side: ${report.group4Read.before.exitSide} -> ${report.group4Read.after.exitSide}
- Path length: ${report.group4Read.before.pathLength} -> ${report.group4Read.after.pathLength}
- Upper-band share: ${report.group4Read.before.upperBandShare} -> ${report.group4Read.after.upperBandShare}
- Browser-visible path movement: ${report.group4Read.browserVisiblePathMovement}
- Browser-visible peel movement: ${report.group4Read.browserVisiblePeelMovement}
- Path-length direction pass: ${report.group4Read.pathLengthDirectionPass}
- Upper-band score-window preserved: ${report.group4Read.upperBandScoreWindowPreserved}

## Protected Groups

| Group | X range delta | Y range delta | Path length delta | Start delta | End delta | Pass |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
${protectedRows}

## Guardrails

- Motion/profile pass: ${report.motionProfileCompatibility.pass}
- Spacing/readability pass: ${report.guardrails.spacingReadability.pass}; spacing ${report.guardrails.spacingReadability.spacingScore}, bunching ${report.guardrails.spacingReadability.bunchingRisk}
- Scoreable routes pass: ${report.guardrails.scoreableRoutes.pass}
- No-combat grammar pass: ${report.guardrails.noCombatGrammar.pass}
- Safety pass: ${report.guardrails.safety.pass}; no shots ${report.guardrails.safety.noEnemyShots}, no attacks ${report.guardrails.safety.noAttackStarts}, no losses ${report.guardrails.safety.noShipLosses}, no challenge contacts ${report.guardrails.safety.noChallengeContacts}

Contact sheet: ${report.visualEvidence.contactSheet}

## Blockers

${blockers}

## Decision

${report.decision.read}
`;
}

async function main(){
  const transferProof = readJson(TRANSFER_PROOF);
  if(transferProof.candidate?.candidateId !== CANDIDATE_ID){
    throw new Error(`Latest Stage 3 transfer proof is not for ${CANDIDATE_ID}`);
  }
  const sourceControls = expectedSourceControls(transferProof);
  const capture = await captureSourceAttempt(sourceControls);
  const evaluation = evaluate({ proof: transferProof, capture, sourceControls });
  const report = {
    schemaVersion: 1,
    artifactType: 'stage3-source-attempt-report',
    generatedAt: new Date().toISOString(),
    generatedBy: 'tools/harness/analyze-stage3-source-attempt.js',
    commit: git(['rev-parse', '--short', 'HEAD']),
    branch: git(['branch', '--show-current']),
    releaseFamily: '1.4.1',
    gameKey: 'aurora-galactica',
    candidateId: CANDIDATE_ID,
    sourceArtifacts: {
      transferProof: rel(TRANSFER_PROOF),
      contactSheet: rel(OUT_SVG)
    },
    appliedScope: {
      stage: 3,
      challengeNumber: 1,
      touchedGroup: 4,
      protectedGroups: [1, 2, 3, 5],
      read: 'Compares current source runtime against a before-source-edit layout override with only the proof-backed group 4 controls removed.'
    },
    sourceControlsApplied: evaluation.sourceConsumption,
    beforeSourceEdit: capture.beforeSourceEdit,
    afterSourceEdit: capture.afterSourceEdit,
    group4Read: evaluation.group4,
    protectedGroupPreservation: evaluation.protectedGroups,
    motionProfileCompatibility: evaluation.motionProfileCompatibility,
    guardrails: evaluation.guardrails,
    failureClassification: evaluation.failures,
    verdict: evaluation.verdict,
    runtimeKeeperClassification: evaluation.verdict,
    betaJustification: false,
    visualEvidence: {
      contactSheet: rel(OUT_SVG),
      kind: 'svg-centroid-path-contact-sheet',
      read: 'Before-source-edit and after-source-edit browser traces are plotted with group 4 highlighted.'
    },
    decision: {
      acceptedAsDevVisibleGameplayKeeper: evaluation.verdict === 'dev-visible-gameplay-keeper',
      sourceEditKept: evaluation.verdict === 'dev-visible-gameplay-keeper',
      read: evaluation.verdict === 'dev-visible-gameplay-keeper'
        ? `${CANDIDATE_ID} reproduced the proof in source and is accepted as a dev-visible gameplay keeper only. It is not beta justification by itself.`
        : `${CANDIDATE_ID} did not reproduce the proof or failed a hard guardrail; restore the source edit and preserve this rejection evidence.`
    },
    summary: {
      exitRead: `${evaluation.group4.before.exitSide}->${evaluation.group4.after.exitSide}`,
      pathLength: `${evaluation.group4.before.pathLength}->${evaluation.group4.after.pathLength}`,
      upperBandShare: `${evaluation.group4.before.upperBandShare}->${evaluation.group4.after.upperBandShare}`,
      guardrailsPass: Object.values(evaluation.guardrails).every(row => row.pass === true),
      protectedGroupsPass: evaluation.protectedGroups.every(row => row.preservationPass === true),
      blockerTypes: evaluation.failures.map(row => row.category)
    }
  };
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${report.commit}-${CANDIDATE_ID}`;
  const stampDir = path.join(OUT_ROOT, stamp);
  writeJson(path.join(stampDir, 'report.json'), report);
  writeText(path.join(stampDir, 'README.md'), markdown(Object.assign({}, report, {
    visualEvidence: Object.assign({}, report.visualEvidence, { contactSheet: rel(path.join(stampDir, 'contact-sheet.svg')) })
  })));
  buildContactSheet(report, path.join(stampDir, 'contact-sheet.svg'));
  writeJson(OUT_JSON, report);
  writeText(OUT_MD, markdown(report));
  buildContactSheet(report, OUT_SVG);
  console.log(JSON.stringify({
    ok: true,
    report: rel(OUT_JSON),
    contactSheet: rel(OUT_SVG),
    candidateId: CANDIDATE_ID,
    verdict: report.verdict,
    blockerTypes: report.summary.blockerTypes
  }, null, 2));
}

if(require.main === module){
  main().catch(error => {
    console.error(JSON.stringify({ ok: false, message: error.message, stack: error.stack }, null, 2));
    process.exit(1);
  });
}
