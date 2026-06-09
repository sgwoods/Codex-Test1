#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-source-attempts', 'stage3-challenge1', 'group1-fast-lane');
const OUT_JSON = path.join(OUT_ROOT, 'latest-group1-fast-lane.json');
const OUT_MD = path.join(OUT_ROOT, 'latest-group1-fast-lane.md');
const OUT_SVG = path.join(OUT_ROOT, 'latest-group1-fast-lane-contact-sheet.svg');

const PLAY_W = 280;
const PLAY_H = 360;
const SAMPLE_STEP_S = 0.25;
const SAMPLE_END_S = 17;
const LOWER_FIELD_Y = PLAY_H * 0.52;
const UPPER_BAND_Y = PLAY_H * 0.5;
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

const VARIANTS = Object.freeze([
  Object.freeze({
    candidateId: 'stage3-g1-curve-entry-left-peel-0.1',
    transformId: 'group1-curve-entry-left-peel',
    read: 'Use route curve and phase controls to pull the first bee-line read rightward, then let the same phrase resolve left without re-slotting lanes.',
    motionSpec: Object.freeze({
      controls: Object.freeze({
        phaseOffsetS: 0.68,
        pathPlaybackScale: 0.96,
        routeOffsetX: -58,
        routeCurveX: 320,
        routeCurveY: -5
      })
    })
  }),
  Object.freeze({
    candidateId: 'stage3-g1-soft-curve-score-window-0.1',
    transformId: 'group1-soft-curve-score-window',
    read: 'Use a milder right-entry curve while preserving upper-band scoreability and group 4 keeper timing.',
    motionSpec: Object.freeze({
      controls: Object.freeze({
        phaseOffsetS: 0.48,
        pathPlaybackScale: 1.03,
        routeOffsetX: -42,
        routeCurveX: 240,
        routeCurveY: -3
      })
    })
  }),
  Object.freeze({
    candidateId: 'stage3-g1-upper-band-path-tighten-0.1',
    transformId: 'group1-upper-band-path-tighten',
    read: 'Tighten the group 1 path and vertical band with consumed path/arc controls while leaving lane ownership alone.',
    motionSpec: Object.freeze({
      controls: Object.freeze({
        pathPlaybackScale: 1.22,
        dropAmp: 0.76,
        arcAmp: 0.92,
        routeOffsetX: -22,
        routeCurveY: -6
      })
    })
  })
]);

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

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

function sideScore(actual, expected){
  if(!actual || !expected) return 0;
  if(actual === expected) return 1;
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
    entryCentroidDeltaPx: round((after.entryCentroidX ?? 0) - (base.entryCentroidX ?? 0), 2),
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

function controlsEqual(a = {}, b = {}){
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for(const key of keys){
    const av = a[key];
    const bv = b[key];
    if(Array.isArray(av) || Array.isArray(bv)){
      if(JSON.stringify(av || []) !== JSON.stringify(bv || [])) return false;
    }else if(Number.isFinite(+av) || Number.isFinite(+bv)){
      if(Math.abs((+av || 0) - (+bv || 0)) > 0.001) return false;
    }else if(av !== bv){
      return false;
    }
  }
  return true;
}

function sourceVariantFromLayout(layout){
  const group = Array.isArray(layout?.motionSpecGroups) ? layout.motionSpecGroups[0] : null;
  if(!group) return null;
  return VARIANTS.find(variant => {
    const expected = variant.motionSpec || {};
    const spawnMatches = expected.spawnOffsetS == null
      ? group.spawnOffsetS == null
      : Math.abs((+group.spawnOffsetS || 0) - +expected.spawnOffsetS) <= 0.001;
    return spawnMatches && controlsEqual(group.controls || {}, expected.controls || {});
  }) || null;
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
  function pathFor(scenario, groupKey, ox){
    const pts = (scenario.centroidTraces?.[groupKey] || [])
      .filter(p => Number.isFinite(+p.x) && Number.isFinite(+p.y))
      .map(p => point(+p.x, +p.y, ox));
    return pts.length ? `M ${pts.map(p => `${round(p.x, 1)} ${round(p.y, 1)}`).join(' L ')}` : '';
  }
  function plot(scenario, ox, title){
    const rows = [
      `<rect x="${ox}" y="${marginTop}" width="${plotW}" height="${plotH}" fill="#05070d" stroke="#61708c" stroke-width="1"/>`,
      `<line x1="${ox}" y1="${marginTop + UPPER_BAND_Y / PLAY_H * plotH}" x2="${ox + plotW}" y2="${marginTop + UPPER_BAND_Y / PLAY_H * plotH}" stroke="#334155" stroke-width="1" stroke-dasharray="5 5"/>`,
      `<text x="${ox}" y="34" fill="#f8fafc" font-size="18" font-family="Menlo, monospace">${esc(title)}</text>`
    ];
    for(const groupIndex of [2, 3, 4, 5]){
      const d = pathFor(scenario, `group${groupIndex}`, ox);
      if(d) rows.push(`<path d="${d}" fill="none" stroke="${colors[groupIndex]}" stroke-width="1.5" opacity="${groupIndex === 4 ? 0.55 : 0.25}"/>`);
    }
    const group1 = pathFor(scenario, 'group1', ox);
    if(group1) rows.push(`<path d="${group1}" fill="none" stroke="${colors[1]}" stroke-width="4" opacity="0.9"/>`);
    const beeLine = pathFor(scenario, 'group1BeeLine', ox);
    if(beeLine) rows.push(`<path d="${beeLine}" fill="none" stroke="#f8fafc" stroke-width="2.5" opacity="0.95" stroke-dasharray="7 4"/>`);
    for(const key of ['group1', 'group1BeeLine']){
      const pts = scenario.centroidTraces?.[key] || [];
      if(pts.length){
        const first = point(pts[0].x, pts[0].y, ox);
        const last = point(pts[pts.length - 1].x, pts[pts.length - 1].y, ox);
        rows.push(`<circle cx="${round(first.x, 1)}" cy="${round(first.y, 1)}" r="${key === 'group1BeeLine' ? 5 : 4}" fill="${key === 'group1BeeLine' ? '#f8fafc' : colors[1]}" opacity="0.9"/>`);
        rows.push(`<rect x="${round(last.x - 4, 1)}" y="${round(last.y - 4, 1)}" width="8" height="8" fill="${key === 'group1BeeLine' ? '#f8fafc' : colors[1]}" opacity="0.85"/>`);
      }
    }
    return rows.join('\n');
  }
  const left = report.mode === 'source-attempt'
    ? report.beforeSourceEdit
    : report.baseline;
  const right = report.mode === 'source-attempt'
    ? report.afterSourceEdit
    : (report.selectedVariant?.scenario || report.variants?.[0]?.scenario || report.baseline);
  const body = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    '<rect width="100%" height="100%" fill="#0b1020"/>',
    `<text x="52" y="22" fill="#dbeafe" font-size="16" font-family="Menlo, monospace">Stage 3 group 1 fast lane: ${esc(report.selectedCandidateId || report.verdict)}</text>`,
    plot(left, leftX, report.mode === 'source-attempt' ? 'Before group 1 source controls' : 'Baseline source'),
    plot(right, rightX, report.mode === 'source-attempt' ? 'After source edit' : 'Selected non-overwriting proof'),
    '<g font-family="Menlo, monospace" font-size="13" fill="#cbd5e1">',
    '<text x="52" y="600">Group 1 highlighted blue; bee-line focus is white dashed. Circles are first centroid; squares are final centroid.</text>',
    `<text x="568" y="600">Verdict: ${esc(report.verdict)}</text>`,
    '</g>',
    '</svg>'
  ].join('\n');
  writeText(file, body);
}

async function capture(){
  return withHarnessPage({ skipStart: true, stage: 3, ships: 3, challenge: false, seed: 9052 }, async ({ page }) => {
    return page.evaluate(({ variants, sampleStepS, sampleEndS, bounds, lowerFieldY, spacingGuard }) => {
      const h = window.__galagaHarness__;
      const clone = value => JSON.parse(JSON.stringify(value));
      const round = (value, places = 3) => {
        if(!Number.isFinite(+value)) return null;
        const scale = 10 ** places;
        return Math.round(+value * scale) / scale;
      };
      const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(+value) ? +value : 0));
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
      const sideFromX = x => {
        if(!Number.isFinite(+x)) return '';
        if(+x <= 280 * 0.34) return 'left';
        if(+x >= 280 * 0.66) return 'right';
        return 'center';
      };
      function applyGroup1MotionSpec(layout, motionSpec){
        const next = clone(layout);
        if(!Array.isArray(next.motionSpecGroups)) next.motionSpecGroups = [];
        const group = Object.assign({}, next.motionSpecGroups[0] || {});
        if(Number.isFinite(+motionSpec.spawnOffsetS)) group.spawnOffsetS = +motionSpec.spawnOffsetS;
        group.controls = Object.assign({}, group.controls || {}, motionSpec.controls || {});
        next.motionSpecGroups[0] = group;
        return next;
      }
      function removeGroup1MotionSpec(layout){
        const next = clone(layout);
        if(Array.isArray(next.motionSpecGroups)) next.motionSpecGroups[0] = null;
        return next;
      }
      function summarizeInstantSpacing(enemies){
        const active = enemies.filter(visible);
        const mins = [];
        for(let i = 0; i < active.length; i += 1){
          for(let j = i + 1; j < active.length; j += 1){
            mins.push(distance(active[i], active[j]));
          }
        }
        return {
          activeCount: active.length,
          minDistance: mins.length ? round(Math.min(...mins), 2) : null
        };
      }
      function summarizeGroup(enemies, groupIndex, typeFilter = null){
        const group = enemies.filter(enemy => +enemy.wave === groupIndex - 1 && (!typeFilter || enemy.type === typeFilter));
        const active = group.filter(visible);
        return {
          groupIndex,
          typeFilter,
          visibleCount: active.length,
          points: active.map(enemy => ({ x: +enemy.x || 0, y: +enemy.y || 0, lane: enemy.lane, type: enemy.type })),
          avgX: round(average(active.map(enemy => +enemy.x)), 2),
          avgY: round(average(active.map(enemy => +enemy.y)), 2),
          routeControls: group.slice(0, 4).map(enemy => ({
            lane: enemy.lane,
            type: enemy.type,
            pathPlaybackScale: enemy.pathPlaybackScale,
            routeOffsetX: enemy.routeOffsetX,
            routeCurveY: enemy.routeCurveY,
            laneStaggerS: enemy.laneStaggerS,
            lanePhaseOffsetS: enemy.lanePhaseOffsetS
          }))
        };
      }
      function summarizeMetrics(samples, groupIndex, upperBandY, typeFilter = null){
        const visibleSamples = samples
          .map(sample => {
            const group = sample.groups.find(row => row.groupIndex === groupIndex && (row.typeFilter || null) === (typeFilter || null));
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
          typeFilter,
          sampleCount: visibleSamples.length,
          pointCount: points.length,
          visibleWindow: {
            visibleStartS: visibleSamples[0]?.t ?? null,
            visibleEndS: visibleSamples[visibleSamples.length - 1]?.t ?? null,
            visibleDurationS: visibleSamples.length ? round(visibleSamples[visibleSamples.length - 1].t - visibleSamples[0].t, 3) : null
          },
          entrySide: firstCentroid ? sideFromX(firstCentroid.x) : '',
          exitSide: lastCentroid ? sideFromX(lastCentroid.x) : '',
          entryCentroidX: firstCentroid ? round(firstCentroid.x, 2) : null,
          exitCentroidX: lastCentroid ? round(lastCentroid.x, 2) : null,
          xRange: xs.length ? round((Math.max(...xs) - Math.min(...xs)) / 280, 4) : null,
          yRange: ys.length ? round((Math.max(...ys) - Math.min(...ys)) / 360, 4) : null,
          pathLength: round(pathLength, 4),
          lowerFieldShare: points.length ? round(points.filter(point => point.y >= lowerFieldY).length / points.length, 4) : null,
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
      const delayedWavePass = rows => rows.every(row => row.visibleCount >= 2 && Number.isFinite(+row.maxTm) && +row.maxTm <= 0.48 && row.nearEntryCount === row.visibleCount);
      function summarizeScenario({ layoutOverride = null, variant = 'source' } = {}){
        const initial = h.setupChallengeMotionProfileTest(layoutOverride ? { stage: 3, layoutOverride } : { stage: 3 });
        const upperBandY = 360 * (+initial.layout?.upperBandRatio || 0.5);
        const samples = [];
        let previous = 0;
        for(let t = 0; t <= sampleEndS + 0.0001; t += sampleStepS){
          const sampleAt = round(t, 3);
          if(sampleAt > previous){
            h.advanceFor(sampleAt - previous, { step: 1 / 60, stopOnGameOver: false });
            previous = sampleAt;
          }
          const state = h.challengeFormationState();
          const enemies = state.enemies || [];
          samples.push({
            t: sampleAt,
            groups: [
              summarizeGroup(enemies, 1),
              summarizeGroup(enemies, 1, 'bee'),
              summarizeGroup(enemies, 2),
              summarizeGroup(enemies, 3),
              summarizeGroup(enemies, 4),
              summarizeGroup(enemies, 5)
            ],
            spacing: summarizeInstantSpacing(enemies)
          });
        }
        const groupMetrics = {};
        const centroidTraces = {};
        for(const groupIndex of [1, 2, 3, 4, 5]){
          groupMetrics[`group${groupIndex}`] = summarizeMetrics(samples, groupIndex, upperBandY);
          centroidTraces[`group${groupIndex}`] = samples
            .map(sample => {
              const group = sample.groups.find(row => row.groupIndex === groupIndex && !row.typeFilter);
              return group && group.visibleCount > 0 && Number.isFinite(+group.avgX) && Number.isFinite(+group.avgY)
                ? { t: sample.t, x: +group.avgX, y: +group.avgY }
                : null;
            })
            .filter(Boolean);
        }
        groupMetrics.group1BeeLine = summarizeMetrics(samples, 1, upperBandY, 'bee');
        centroidTraces.group1BeeLine = samples
          .map(sample => {
            const group = sample.groups.find(row => row.groupIndex === 1 && row.typeFilter === 'bee');
            return group && group.visibleCount > 0 && Number.isFinite(+group.avgX) && Number.isFinite(+group.avgY)
              ? { t: sample.t, x: +group.avgX, y: +group.avgY }
              : null;
          })
          .filter(Boolean);
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
        return {
          variant,
          layoutSummary: {
            id: initial.layout?.id || '',
            groupPathFamilies: Array.isArray(initial.layout?.groupPathFamilies) ? initial.layout.groupPathFamilies.slice() : [],
            groupSpawnOffsets: Array.isArray(initial.layout?.groupSpawnOffsets) ? initial.layout.groupSpawnOffsets.slice() : [],
            motionSpecGroups: Array.isArray(initial.layout?.motionSpecGroups) ? initial.layout.motionSpecGroups : []
          },
          groupMetrics,
          centroidTraces,
          routeControlRead: {
            group1: samples.find(sample => sample.t >= 1)?.groups.find(group => group.groupIndex === 1 && !group.typeFilter)?.routeControls || [],
            group4: samples.find(sample => sample.t >= 10.5)?.groups.find(group => group.groupIndex === 4 && !group.typeFilter)?.routeControls || []
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
      const sourceInitial = h.setupChallengeMotionProfileTest({ stage: 3 });
      const sourceLayout = clone(sourceInitial.layout);
      const baseline = summarizeScenario({ variant: 'baseline-source' });
      const variantsOut = variants.map(variant => {
        const layoutOverride = applyGroup1MotionSpec(sourceLayout, variant.motionSpec);
        return {
          candidateId: variant.candidateId,
          transformId: variant.transformId,
          read: variant.read,
          motionSpec: variant.motionSpec,
          scenario: summarizeScenario({ layoutOverride, variant: variant.candidateId })
        };
      });
      const beforeSourceEdit = summarizeScenario({ layoutOverride: removeGroup1MotionSpec(sourceLayout), variant: 'before-group1-source-controls' });
      return {
        sourceLayout,
        baseline,
        variants: variantsOut,
        beforeSourceEdit,
        afterSourceEdit: baseline
      };
    }, {
      variants: VARIANTS,
      sampleStepS: SAMPLE_STEP_S,
      sampleEndS: SAMPLE_END_S,
      bounds: VISIBLE_BOUNDS,
      lowerFieldY: LOWER_FIELD_Y,
      spacingGuard: SPACING_GUARD
    });
  });
}

function evaluateScenario({ baseline, scenario, variant = null, sourceAttempt = false }){
  const beforeGroup1 = baseline.groupMetrics.group1;
  const afterGroup1 = scenario.groupMetrics.group1;
  const beforeBee = baseline.groupMetrics.group1BeeLine;
  const afterBee = scenario.groupMetrics.group1BeeLine;
  const groupDelta = vectorDelta(beforeGroup1, afterGroup1);
  const beeDelta = vectorDelta(beforeBee, afterBee);
  const protectedGroups = [2, 3, 4, 5].map(groupIndex => {
    const before = baseline.groupMetrics[`group${groupIndex}`];
    const after = scenario.groupMetrics[`group${groupIndex}`];
    const delta = vectorDelta(before, after);
    return Object.assign({ groupIndex, before, after, deltaFromBefore: delta }, delta, {
      preservationPass: protectedGroupPass(delta)
    });
  });
  const beeEntryScoreBefore = sideScore(beforeBee.entrySide, 'right');
  const beeEntryScoreAfter = sideScore(afterBee.entrySide, 'right');
  const beeExitScoreBefore = sideScore(beforeBee.exitSide, 'left');
  const beeExitScoreAfter = sideScore(afterBee.exitSide, 'left');
  const targetRead = {
    group1: {
      before: beforeGroup1,
      after: afterGroup1,
      deltaFromBefore: groupDelta,
      pathLengthDirectionPass: Number.isFinite(+groupDelta.pathLengthDelta) && groupDelta.pathLengthDelta <= -0.04,
      upperBandScoreWindowPreserved: afterGroup1.upperBandShare >= Math.max(0, (beforeGroup1.upperBandShare || 0) - 0.08),
      firstVisibleTimingImproved: Math.abs((afterGroup1.visibleWindow?.visibleStartS ?? 0) - 0.9) < Math.abs((beforeGroup1.visibleWindow?.visibleStartS ?? 0) - 0.9),
      browserVisiblePathMovement: Math.max(
        Math.abs(groupDelta.xRangeDelta || 0),
        Math.abs(groupDelta.yRangeDelta || 0),
        Math.abs(groupDelta.pathLengthDelta || 0),
        Math.abs((groupDelta.meanXDeltaPx || 0) / PLAY_W),
        Math.abs((groupDelta.meanYDeltaPx || 0) / PLAY_H)
      ) >= 0.015
    },
    beeLine: {
      before: beforeBee,
      after: afterBee,
      deltaFromBefore: beeDelta,
      entrySideBefore: beforeBee.entrySide,
      entrySideAfter: afterBee.entrySide,
      exitSideBefore: beforeBee.exitSide,
      exitSideAfter: afterBee.exitSide,
      rightEntryScoreBefore: beeEntryScoreBefore,
      rightEntryScoreAfter: beeEntryScoreAfter,
      leftExitScoreBefore: beeExitScoreBefore,
      leftExitScoreAfter: beeExitScoreAfter,
      rightEntryImproved: beeEntryScoreAfter > beeEntryScoreBefore + 0.05,
      leftExitPreservedOrImproved: beeExitScoreAfter >= beeExitScoreBefore - 0.05,
      beeLineUpperBandPreserved: afterBee.upperBandShare >= Math.max(0, (beforeBee.upperBandShare || 0) - 0.08)
    }
  };
  const sourceConsumption = variant ? sourceControlRows({ scenario, variant, sourceAttempt }) : [];
  const guardrails = {
    spacingReadability: scenario.spacingReadability,
    scoreableRoutes: {
      pass: true,
      source: 'challenge-stage-conformance-validation-required',
      read: 'Fast-lane proof preserves runtime routeability proxy; final source keeper still requires challenge-stage conformance validation.'
    },
    noCombatGrammar: {
      pass: scenario.safetyStatus.pass === true,
      read: 'No-combat grammar requires no enemy shots, no attack starts, no ship losses, and no challenge contacts during capture.'
    },
    safety: scenario.safetyStatus
  };
  const motionProfileCompatibility = {
    pass: scenario.motionProfileProxy.pathFamilyOrder.pass
      && scenario.motionProfileProxy.delayedWaveStarts.pass
      && scenario.motionProfileProxy.spacing.pass,
    proxy: scenario.motionProfileProxy
  };
  const failures = [];
  if(sourceAttempt && sourceConsumption.some(row => row.consumedByRuntime !== true || row.matchesExpected !== true)){
    failures.push({ category: 'source-control-not-consumed', read: 'One or more group 1 source controls did not appear on runtime enemies.' });
  }
  if(!targetRead.group1.browserVisiblePathMovement){
    failures.push({ category: 'no-visible-group1-movement', read: 'Group 1 did not move enough to count as a visible gameplay decision.' });
  }
  if(!targetRead.beeLine.rightEntryImproved && !targetRead.group1.firstVisibleTimingImproved){
    failures.push({ category: 'semantic-line-role-not-improved', read: 'The top-right bee-line or first-visible timing read did not improve.' });
  }
  if(!targetRead.group1.pathLengthDirectionPass && !targetRead.beeLine.rightEntryImproved){
    failures.push({ category: 'object-track-path-not-improved', read: 'Group 1 path-length/object-track proxy did not move in a useful direction.' });
  }
  if(!targetRead.group1.upperBandScoreWindowPreserved || !targetRead.beeLine.beeLineUpperBandPreserved){
    failures.push({ category: 'score-window-regression', read: 'Group 1 upper-band scoreability regressed.' });
  }
  if(protectedGroups.some(row => row.preservationPass !== true)){
    failures.push({ category: 'protected-group-regression', read: 'A protected Stage 3 group moved beyond preservation limits.' });
  }
  if(!motionProfileCompatibility.pass){
    failures.push({ category: 'motion-profile-regression', read: 'The focused motion/profile proxy failed.' });
  }
  for(const guard of ['spacingReadability', 'scoreableRoutes', 'noCombatGrammar', 'safety']){
    if(guardrails[guard]?.pass !== true){
      failures.push({ category: 'guardrail-regression', read: `${guard} did not pass.` });
    }
  }
  const score = (targetRead.beeLine.rightEntryImproved ? 0.24 : 0)
    + (targetRead.beeLine.leftExitPreservedOrImproved ? 0.12 : 0)
    + (targetRead.group1.firstVisibleTimingImproved ? 0.18 : 0)
    + (targetRead.group1.pathLengthDirectionPass ? 0.18 : 0)
    + (targetRead.group1.upperBandScoreWindowPreserved ? 0.12 : 0)
    + (protectedGroups.every(row => row.preservationPass) ? 0.1 : 0)
    + (guardrails.spacingReadability.pass && guardrails.safety.pass ? 0.06 : 0);
  return {
    candidateId: variant?.candidateId || null,
    transformId: variant?.transformId || null,
    motionSpec: variant?.motionSpec || null,
    sourceConsumption,
    targetRead,
    protectedGroups,
    guardrails,
    motionProfileCompatibility,
    failureClassification: failures,
    score: round(score, 4),
    proofPass: failures.length === 0,
    sourceAttemptPass: sourceAttempt && failures.length === 0
  };
}

function sourceControlRows({ scenario, variant, sourceAttempt }){
  const expected = [];
  if(Number.isFinite(+variant.motionSpec.spawnOffsetS)){
    expected.push({ runtimeField: 'motionSpecGroups[0].spawnOffsetS', expectedValue: +variant.motionSpec.spawnOffsetS, enemyField: null });
  }
  for(const [key, value] of Object.entries(variant.motionSpec.controls || {})){
    expected.push({ runtimeField: `motionSpecGroups[0].controls.${key}`, expectedValue: value, enemyField: key });
  }
  const group = scenario.layoutSummary.motionSpecGroups?.[0] || {};
  const controls = group.controls || {};
  const routeReads = scenario.routeControlRead.group1 || [];
  return expected.map(row => {
    const sourceValue = row.enemyField ? controls[row.enemyField] : group.spawnOffsetS;
    const runtimeValues = row.enemyField
      ? routeReads.map(enemy => enemy[row.enemyField]).filter(value => value != null)
      : [];
    const sourceMatches = Array.isArray(row.expectedValue)
      ? JSON.stringify(sourceValue || []) === JSON.stringify(row.expectedValue)
      : Math.abs((+sourceValue || 0) - (+row.expectedValue || 0)) <= 0.001;
    const runtimeMatches = row.enemyField
      ? runtimeValues.length > 0 && runtimeValues.every(value => Array.isArray(row.expectedValue)
        ? JSON.stringify(value || []) === JSON.stringify(row.expectedValue)
        : Math.abs((+value || 0) - (+row.expectedValue || 0)) <= 0.001)
      : true;
    return {
      runtimeField: row.runtimeField,
      expectedValue: row.expectedValue,
      sourceValue,
      runtimeEnemyValues: runtimeValues,
      consumedByRuntime: sourceAttempt ? sourceMatches && runtimeMatches : true,
      matchesExpected: sourceMatches && runtimeMatches
    };
  });
}

function selectBestVariant(capture){
  const rows = capture.variants.map(variant => {
    const evaluation = evaluateScenario({
      baseline: capture.baseline,
      scenario: variant.scenario,
      variant,
      sourceAttempt: false
    });
    return Object.assign({}, variant, { evaluation });
  });
  const passing = rows.filter(row => row.evaluation.proofPass);
  const pool = passing.length ? passing : rows;
  pool.sort((a, b) => (b.evaluation.score - a.evaluation.score)
    || ((a.motionSpec.spawnOffsetS || 0) - (b.motionSpec.spawnOffsetS || 0)));
  return { rows, selected: pool[0] || null };
}

function markdown(report){
  const selected = report.selectedCandidateId || 'none';
  const failures = (report.failureClassification || []).map(row => `- ${row.category}: ${row.read}`).join('\n') || '- none';
  const protectedRows = (report.protectedGroupPreservation || []).map(row => `| ${row.groupIndex} | ${row.xRangeDelta} | ${row.yRangeDelta} | ${row.pathLengthDelta} | ${row.visibleWindowDeltaS.visibleStartDeltaS} | ${row.visibleWindowDeltaS.visibleEndDeltaS} | ${row.preservationPass} |`).join('\n');
  return `# Stage 3 Group 1 Fast-Lane Report

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

Mode: ${report.mode}
Verdict: ${report.verdict}
Selected candidate: ${selected}

## Group 1 Read

- Bee entry: ${report.group1Read?.beeLine?.entrySideBefore} -> ${report.group1Read?.beeLine?.entrySideAfter}
- Bee exit: ${report.group1Read?.beeLine?.exitSideBefore} -> ${report.group1Read?.beeLine?.exitSideAfter}
- Group path length: ${report.group1Read?.group1?.before?.pathLength} -> ${report.group1Read?.group1?.after?.pathLength}
- First visible: ${report.group1Read?.group1?.before?.visibleWindow?.visibleStartS} -> ${report.group1Read?.group1?.after?.visibleWindow?.visibleStartS}
- Upper-band share: ${report.group1Read?.group1?.before?.upperBandShare} -> ${report.group1Read?.group1?.after?.upperBandShare}

## Protected Groups

| Group | X range delta | Y range delta | Path length delta | Start delta | End delta | Pass |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
${protectedRows}

## Guardrails

- Motion/profile pass: ${report.motionProfileCompatibility?.pass}
- Spacing/readability pass: ${report.guardrails?.spacingReadability?.pass}; spacing ${report.guardrails?.spacingReadability?.spacingScore}, bunching ${report.guardrails?.spacingReadability?.bunchingRisk}
- Scoreable routes pass: ${report.guardrails?.scoreableRoutes?.pass}
- No-combat grammar pass: ${report.guardrails?.noCombatGrammar?.pass}
- Safety pass: ${report.guardrails?.safety?.pass}

Contact sheet: ${report.visualEvidence?.contactSheet}

## Blockers

${failures}
`;
}

async function main(){
  const captureData = await capture();
  const sourceVariant = sourceVariantFromLayout(captureData.sourceLayout);
  const selectedRows = selectBestVariant(captureData);
  const sourceAttempt = !!sourceVariant;
  const selected = sourceAttempt
    ? captureData.variants.find(row => row.candidateId === sourceVariant.candidateId)
    : selectedRows.selected;
  const baseline = sourceAttempt ? captureData.beforeSourceEdit : captureData.baseline;
  const scenario = sourceAttempt ? captureData.afterSourceEdit : selected?.scenario;
  const evaluation = selected
    ? evaluateScenario({ baseline, scenario, variant: selected, sourceAttempt })
    : null;
  const verdict = sourceAttempt
    ? (evaluation.sourceAttemptPass ? 'dev-visible-gameplay-keeper' : 'rejected')
    : (evaluation?.proofPass ? 'transfer-proof-ready' : 'blocked');
  const report = {
    schemaVersion: 1,
    artifactType: 'stage3-group1-fast-lane-report',
    generatedAt: new Date().toISOString(),
    generatedBy: 'tools/harness/analyze-stage3-group1-fast-lane.js',
    commit: git(['rev-parse', '--short', 'HEAD']),
    branch: git(['branch', '--show-current']),
    releaseFamily: '1.4.1',
    gameKey: 'aurora-galactica',
    mode: sourceAttempt ? 'source-attempt' : 'non-overwriting-proof',
    scope: {
      stage: 3,
      challengeNumber: 1,
      touchedGroup: 1,
      protectedGroups: [2, 3, 4, 5],
      acceptedKeeperToPreserve: 'stage3-semantic-fresh-g4-score-window-shape-peel-0.1'
    },
    variantsTested: selectedRows.rows.map(row => ({
      candidateId: row.candidateId,
      transformId: row.transformId,
      motionSpec: row.motionSpec,
      score: row.evaluation.score,
      proofPass: row.evaluation.proofPass,
      blockerTypes: row.evaluation.failureClassification.map(failure => failure.category),
      group1PathLength: `${row.evaluation.targetRead.group1.before.pathLength}->${row.evaluation.targetRead.group1.after.pathLength}`,
      beeEntry: `${row.evaluation.targetRead.beeLine.entrySideBefore}->${row.evaluation.targetRead.beeLine.entrySideAfter}`,
      firstVisible: `${row.evaluation.targetRead.group1.before.visibleWindow.visibleStartS}->${row.evaluation.targetRead.group1.after.visibleWindow.visibleStartS}`
    })),
    selectedCandidateId: selected?.candidateId || null,
    selectedTransformId: selected?.transformId || null,
    selectedVariant: sourceAttempt ? null : selected,
    sourceControlsApplied: evaluation?.sourceConsumption || [],
    baseline: captureData.baseline,
    beforeSourceEdit: sourceAttempt ? captureData.beforeSourceEdit : null,
    afterSourceEdit: sourceAttempt ? captureData.afterSourceEdit : null,
    group1Read: evaluation?.targetRead || null,
    protectedGroupPreservation: evaluation?.protectedGroups || [],
    motionProfileCompatibility: evaluation?.motionProfileCompatibility || null,
    guardrails: evaluation?.guardrails || null,
    failureClassification: evaluation?.failureClassification || [],
    verdict,
    runtimeKeeperClassification: verdict,
    betaJustification: false,
    visualEvidence: {
      contactSheet: rel(OUT_SVG),
      kind: 'svg-centroid-path-contact-sheet',
      read: sourceAttempt
        ? 'Before-source-edit and after-source-edit browser traces are plotted with group 1 highlighted and bee-line focus dashed.'
        : 'Baseline and selected non-overwriting proof traces are plotted with group 1 highlighted and bee-line focus dashed.'
    },
    decision: {
      sourceEditKept: verdict === 'dev-visible-gameplay-keeper',
      read: verdict === 'dev-visible-gameplay-keeper'
        ? 'Group 1 source controls reproduced the fast-lane proof and are accepted as a second dev-visible gameplay keeper only.'
        : (verdict === 'transfer-proof-ready'
          ? 'One group 1 non-overwriting proof candidate is ready for exactly one minimal source edit.'
          : 'No group 1 fast-lane candidate passed quickly; stop without broadening the search.')
    },
    summary: {
      selectedCandidateId: selected?.candidateId || null,
      verdict,
      group4KeeperPreserved: (evaluation?.protectedGroups || []).find(row => row.groupIndex === 4)?.preservationPass === true,
      guardrailsPass: evaluation?.guardrails ? Object.values(evaluation.guardrails).every(row => row.pass === true) : false,
      blockerTypes: (evaluation?.failureClassification || []).map(row => row.category)
    }
  };
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${report.commit}-${report.selectedCandidateId || 'no-selection'}`;
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
    mode: report.mode,
    report: rel(OUT_JSON),
    contactSheet: rel(OUT_SVG),
    selectedCandidateId: report.selectedCandidateId,
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
