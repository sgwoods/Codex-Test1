#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const CHALLENGE_STAGE_CONFORMANCE = path.join(ANALYSES, 'challenge-stage-conformance', 'latest.json');
const AURORA_CHALLENGE_MOVEMENT_GRAMMAR_MAP = path.join(ANALYSES, 'aurora-challenge-movement-grammar-map', 'latest.json');
const CHALLENGE_TRAJECTORY_CONTROLS = path.join(ANALYSES, 'challenge-trajectory-controls', 'latest.json');
const OUT_DIR = path.join(ANALYSES, 'motion-atlas');
const OUT = path.join(OUT_DIR, 'latest.json');
const LATEST_DIAGRAM_DIR = path.join(OUT_DIR, 'latest-diagrams');

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback = null){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch(err){
    if(fallback !== null) return fallback;
    fail('required JSON artifact could not be read', { file: rel(file), error: err.message });
  }
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, value);
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

function round(value, places = 2){
  if(!Number.isFinite(+value)) return null;
  const scale = 10 ** places;
  return Math.round(+value * scale) / scale;
}

function clamp(value, min = 0, max = 1){
  if(!Number.isFinite(+value)) return min;
  return Math.max(min, Math.min(max, +value));
}

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null;
}

function unique(values){
  return [...new Set((values || []).filter(value => value !== undefined && value !== null && value !== ''))];
}

function svgEsc(value){
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function byStage(items = []){
  const map = new Map();
  for(const item of items){
    const stage = +item?.gameScope?.stage || +item?.stage;
    if(Number.isFinite(stage)) map.set(stage, item);
  }
  return map;
}

function challengeLabel(row){
  if(row?.challengeNumber && row?.stage){
    return `Challenging Stage ${row.challengeNumber} (Levels ${row.stage}-${row.stage + 1})`;
  }
  return row?.label || row?.id || 'Challenge stage';
}

function normalizeTargetPoints(points = []){
  return points
    .filter(point => Number.isFinite(+point.x) && Number.isFinite(+point.y))
    .map(point => ({
      t: round(point.t ?? 0, 2),
      x: round(clamp(point.x), 4),
      y: round(clamp(point.y), 4),
      sourceTrackId: point.sourceTrackId || null
    }));
}

function normalizeRuntimePoints(points = []){
  return points
    .filter(point => Number.isFinite(+point.x) && Number.isFinite(+point.y))
    .map(point => ({
      t: round(point.t ?? 0, 2),
      x: round(clamp((+point.x) / 280), 4),
      y: round(clamp((+point.y) / 360), 4),
      source: 'runtime-object-track'
    }));
}

function sideToX(side, fallback = 0.5){
  const text = String(side || '').toLowerCase();
  if(text.includes('left')) return 0.08;
  if(text.includes('right')) return 0.92;
  if(text.includes('side')) return fallback < 0.5 ? 0.08 : 0.92;
  if(text.includes('lower')) return fallback;
  if(text.includes('top')) return fallback;
  return fallback;
}

function synthesizePoints(summary = {}, options = {}){
  const entryX = sideToX(summary.entrySide, options.entryFallback ?? 0.5);
  const exitX = sideToX(summary.exitSide, options.exitFallback ?? (entryX < 0.5 ? 0.85 : 0.15));
  const xRange = clamp(summary.xRange ?? Math.abs(exitX - entryX), 0.08, 0.9);
  const yRange = clamp(summary.yRange ?? 0.42, 0.08, 0.9);
  const lower = clamp(summary.lowerFieldShare ?? 0.45);
  const startY = lower > 0.65 ? 0.22 : 0.12;
  const endY = clamp(startY + yRange * (lower > 0.5 ? 0.78 : 0.48), 0.12, 0.92);
  const midX = clamp((entryX + exitX) / 2 + (entryX <= exitX ? -0.18 : 0.18) * xRange);
  const midY = clamp(startY + yRange * 0.55);
  return [
    { t: round(summary.visibleStartS ?? 0, 2), x: round(entryX, 4), y: round(startY, 4), source: 'summary-estimate' },
    { t: round(((summary.visibleStartS ?? 0) + (summary.visibleEndS ?? 1)) / 2, 2), x: round(midX, 4), y: round(midY, 4), source: 'summary-estimate' },
    { t: round(summary.visibleEndS ?? 1, 2), x: round(exitX, 4), y: round(endY, 4), source: 'summary-estimate' }
  ];
}

function targetPointsForGroup(pattern, trajectory, groupIndex, groupTarget){
  const referencePath = trajectory?.runtimeLayoutSeed?.groupReferencePaths?.[groupIndex - 1];
  if(Array.isArray(referencePath?.points) && referencePath.points.length){
    return normalizeTargetPoints(referencePath.points);
  }
  const patternPoints = (pattern?.controlPoints || []).filter(point => +point.groupIndex === +groupIndex);
  if(patternPoints.length) return normalizeTargetPoints(patternPoints);
  return synthesizePoints(groupTarget, { entryFallback: groupIndex % 2 ? 0.35 : 0.65, exitFallback: groupIndex % 2 ? 0.65 : 0.35 });
}

function runtimeTrackForGroup(row, groupRuntime){
  const topTracks = Array.isArray(row?.objectTrackProbe?.topTracks) ? row.objectTrackProbe.topTracks : [];
  const exact = topTracks.find(track => String(track.id) === String(groupRuntime?.id));
  if(exact) return exact;
  const wave = Number.isFinite(+groupRuntime?.wave) ? +groupRuntime.wave : null;
  return topTracks.find(track => Number.isFinite(+track.wave) && +track.wave === wave) || null;
}

function currentPointsForGroup(row, groupRuntime, groupIndex){
  const track = runtimeTrackForGroup(row, groupRuntime);
  if(Array.isArray(track?.points) && track.points.length){
    return normalizeRuntimePoints(track.points);
  }
  return synthesizePoints(groupRuntime, { entryFallback: groupIndex % 2 ? 0.12 : 0.88, exitFallback: groupIndex % 2 ? 0.88 : 0.12 });
}

function timingDeltaLabel(current, target){
  const startDelta = Number.isFinite(+current?.visibleStartS) && Number.isFinite(+target?.visibleStartS)
    ? round((+current.visibleStartS) - (+target.visibleStartS), 2)
    : null;
  const endDelta = Number.isFinite(+current?.visibleEndS) && Number.isFinite(+target?.visibleEndS)
    ? round((+current.visibleEndS) - (+target.visibleEndS), 2)
    : null;
  const notes = [];
  if(Number.isFinite(startDelta)){
    if(Math.abs(startDelta) <= 0.4) notes.push('start aligned');
    else notes.push(startDelta > 0 ? `${startDelta}s late start` : `${Math.abs(startDelta)}s early start`);
  }
  if(Number.isFinite(endDelta)){
    if(Math.abs(endDelta) <= 0.6) notes.push('end aligned');
    else notes.push(endDelta > 0 ? `${endDelta}s late end` : `${Math.abs(endDelta)}s early end`);
  }
  return notes.join('; ') || 'timing delta pending';
}

function groupDeltaRead(group){
  const notes = [];
  if(group.targetPathFamily && group.currentPathFamily && group.targetPathFamily !== group.currentPathFamily){
    notes.push(`path family ${group.currentPathFamily} vs target ${group.targetPathFamily}`);
  }
  if(group.targetEntrySide && group.currentEntrySide && group.targetEntrySide !== group.currentEntrySide){
    notes.push(`entry ${group.currentEntrySide} vs target ${group.targetEntrySide}`);
  }
  if(group.targetExitSide && group.currentExitSide && group.targetExitSide !== group.currentExitSide){
    notes.push(`exit ${group.currentExitSide} vs target ${group.targetExitSide}`);
  }
  const score = Number.isFinite(+group.score10) ? +group.score10 : null;
  if(score !== null && score < 4) notes.push('low group trajectory fit');
  if(!notes.length && score !== null && score >= 6) notes.push('usable group match; improve precision and sprite cadence');
  return notes.join('; ') || 'group delta is measured but not yet diagnosed';
}

function buildGroupRows(row, pattern, trajectory){
  const roleBindings = Array.isArray(pattern?.roleBindings) ? pattern.roleBindings : [];
  const phaseTimeline = Array.isArray(pattern?.phaseTimeline) ? pattern.phaseTimeline : [];
  const perGroup = Array.isArray(row?.perGroupMovementRows) ? row.perGroupMovementRows : [];
  const signatures = Array.isArray(row?.runtimeGroupSignatures) ? row.runtimeGroupSignatures : [];
  const groupCount = Math.max(5, roleBindings.length, phaseTimeline.length, perGroup.length, signatures.length);
  const rows = [];
  for(let index = 0; index < groupCount; index += 1){
    const groupIndex = index + 1;
    const role = roleBindings[index] || {};
    const phase = phaseTimeline[index] || {};
    const groupFit = perGroup.find(item => +item.groupIndex === groupIndex) || perGroup[index] || {};
    const signature = signatures[index] || {};
    const runtime = groupFit.runtime || {};
    const target = groupFit.target || {};
    const group = {
      groupIndex,
      role: role.role || signature.role || `group ${groupIndex}`,
      laneTypes: unique(role.laneTypes || signature.types || []),
      targetPathFamily: role.targetPathFamily || role.pathIntent || null,
      currentPathFamily: runtime.pathFamily || signature.pathFamilies?.[0] || null,
      targetVisualFamily: role.targetVisualFamily || role.visualFamily || null,
      currentVisualFamily: runtime.family || signature.families?.[0] || null,
      targetEntrySide: role.targetEntrySide || target.entrySide || null,
      currentEntrySide: runtime.entrySide || null,
      targetExitSide: role.targetExitSide || target.exitSide || null,
      currentExitSide: runtime.exitSide || null,
      targetTiming: {
        visibleStartS: round(target.visibleStartS ?? phase.targetVisibleStartS, 2),
        visibleEndS: round(target.visibleEndS ?? phase.targetVisibleEndS, 2),
        durationS: round(target.visibleEndS !== undefined && target.visibleStartS !== undefined ? target.visibleEndS - target.visibleStartS : phase.targetDurationS, 2)
      },
      currentTiming: {
        visibleStartS: round(runtime.visibleStartS, 2),
        visibleEndS: round(runtime.visibleEndS, 2),
        durationS: round(runtime.visibleEndS !== undefined && runtime.visibleStartS !== undefined ? runtime.visibleEndS - runtime.visibleStartS : null, 2)
      },
      targetMetrics: {
        xRange: round(target.xRange, 3),
        yRange: round(target.yRange, 3),
        pathLength: round(target.pathLength, 3),
        turnCount: round(target.turnCount, 2),
        lowerFieldShare: round(target.lowerFieldShare, 3)
      },
      currentMetrics: {
        xRange: round(runtime.xRange, 3),
        yRange: round(runtime.yRange, 3),
        pathLength: round(runtime.pathLength, 3),
        turnCount: round(runtime.turnCount, 2),
        lowerFieldShare: round(runtime.lowerFieldShare, 3)
      },
      targetPoints: targetPointsForGroup(pattern, trajectory, groupIndex, target),
      currentPoints: currentPointsForGroup(row, runtime, groupIndex),
      score10: round(groupFit.score10, 1),
      coverage: round(groupFit.coverage, 3),
      timingDelta: timingDeltaLabel(runtime, target)
    };
    group.deltaRead = groupDeltaRead(group);
    rows.push(group);
  }
  return rows;
}

function pointString(points, box){
  return points
    .filter(point => Number.isFinite(+point.x) && Number.isFinite(+point.y))
    .map(point => `${round(box.x + clamp(point.x) * box.w, 1)},${round(box.y + clamp(point.y) * box.h, 1)}`)
    .join(' ');
}

function firstPoint(points){
  return points.find(point => Number.isFinite(+point.x) && Number.isFinite(+point.y)) || null;
}

function lastPoint(points){
  return [...points].reverse().find(point => Number.isFinite(+point.x) && Number.isFinite(+point.y)) || null;
}

function drawPath(points, box, className, label, color, dash = false){
  const path = pointString(points, box);
  if(!path) return '';
  const start = firstPoint(points);
  const sx = round(box.x + clamp(start.x) * box.w, 1);
  const sy = round(box.y + clamp(start.y) * box.h, 1);
  const dashAttr = dash ? ' stroke-dasharray="7 7"' : '';
  return `<polyline class="${className}" points="${path}" stroke="${color}"${dashAttr}/><circle cx="${sx}" cy="${sy}" r="4" fill="${color}"/><text class="tiny" x="${sx + 6}" y="${sy - 5}" fill="${color}">G${svgEsc(label)}</text>`;
}

function drawField(box, title, subtitle){
  const verticals = [0.25, 0.5, 0.75].map(v => `<line class="grid" x1="${round(box.x + box.w * v, 1)}" y1="${box.y}" x2="${round(box.x + box.w * v, 1)}" y2="${box.y + box.h}"/>`).join('\n');
  const horizontals = [0.25, 0.5, 0.75].map(v => `<line class="grid" x1="${box.x}" y1="${round(box.y + box.h * v, 1)}" x2="${box.x + box.w}" y2="${round(box.y + box.h * v, 1)}"/>`).join('\n');
  return `<rect class="field" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="10"/>
  ${verticals}
  ${horizontals}
  <text class="small" x="${box.x}" y="${box.y - 12}">${svgEsc(title)}</text>
  <text class="tiny" x="${box.x}" y="${box.y + box.h + 18}">${svgEsc(subtitle)}</text>`;
}

function timingBar(x, y, width, start, end, maxTime, color, label){
  if(!Number.isFinite(+start) || !Number.isFinite(+end) || maxTime <= 0){
    return `<text class="tiny muted" x="${x}" y="${y + 8}">${svgEsc(label)} pending</text>`;
  }
  const sx = x + clamp(start / maxTime) * width;
  const ex = x + clamp(end / maxTime) * width;
  const w = Math.max(3, ex - sx);
  return `<rect x="${round(sx, 1)}" y="${y}" width="${round(w, 1)}" height="8" rx="4" fill="${color}"/><text class="tiny" x="${round(sx, 1)}" y="${y - 3}" fill="${color}">${svgEsc(label)}</text>`;
}

function makeMotionAtlasSvg(row){
  const groups = row.groupRows || [];
  const targetBox = { x: 44, y: 94, w: 240, h: 300 };
  const currentBox = { x: 332, y: 94, w: 240, h: 300 };
  const overlayBox = { x: 620, y: 94, w: 240, h: 300 };
  const colors = ['#78f7ff', '#8cffb4', '#b08cff', '#ff7bd5', '#ffd36a'];
  const targetPaths = groups.map((group, index) => drawPath(group.targetPoints, targetBox, 'targetPath', group.groupIndex, colors[index % colors.length], false)).join('\n  ');
  const currentPaths = groups.map((group, index) => drawPath(group.currentPoints, currentBox, 'currentPath', group.groupIndex, colors[index % colors.length], false)).join('\n  ');
  const overlayTarget = groups.map((group, index) => drawPath(group.targetPoints, overlayBox, 'targetPath', group.groupIndex, colors[index % colors.length], true)).join('\n  ');
  const overlayCurrent = groups.map((group, index) => drawPath(group.currentPoints, overlayBox, 'currentPath', group.groupIndex, '#ffd36a', false)).join('\n  ');
  const arrows = groups.map(group => {
    const t = lastPoint(group.targetPoints);
    const c = lastPoint(group.currentPoints);
    if(!t || !c) return '';
    const x1 = round(overlayBox.x + clamp(t.x) * overlayBox.w, 1);
    const y1 = round(overlayBox.y + clamp(t.y) * overlayBox.h, 1);
    const x2 = round(overlayBox.x + clamp(c.x) * overlayBox.w, 1);
    const y2 = round(overlayBox.y + clamp(c.y) * overlayBox.h, 1);
    return `<line class="deltaLine" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#arrow)"/>`;
  }).join('\n  ');
  const maxTime = Math.max(12, ...groups.flatMap(group => [
    group.targetTiming?.visibleEndS,
    group.currentTiming?.visibleEndS
  ].filter(value => Number.isFinite(+value)).map(Number)));
  const timingRows = groups.map((group, index) => {
    const y = 462 + index * 34;
    return `<text class="tiny" x="44" y="${y + 8}">G${group.groupIndex} ${svgEsc(group.role || '')}</text>
      ${timingBar(230, y, 520, group.targetTiming?.visibleStartS, group.targetTiming?.visibleEndS, maxTime, '#78f7ff', 'target')}
      ${timingBar(230, y + 12, 520, group.currentTiming?.visibleStartS, group.currentTiming?.visibleEndS, maxTime, '#ffd36a', 'current')}
      <text class="tiny" x="770" y="${y + 13}">${svgEsc(group.score10 ?? 'n/a')}/10 ${svgEsc(group.timingDelta || '')}</text>`;
  }).join('\n  ');
  const gapReads = groups.slice(0, 5).map((group, index) => `<text class="tiny" x="914" y="${462 + index * 34}">G${group.groupIndex}: ${svgEsc(group.deltaRead || '')}</text>`).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1180" height="660" viewBox="0 0 1180 660" role="img" aria-labelledby="title desc">
  <title id="title">${svgEsc(row.label)} motion atlas</title>
  <desc id="desc">Human-readable target versus current alien motion atlas with target paths, Aurora runtime paths, overlay deltas, and timing bars.</desc>
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L10,4 L0,8 z" fill="#f6fbff"/>
    </marker>
  </defs>
  <style>
    .bg{fill:#06111d}.panel{fill:#0d1b2a;stroke:#2e5d78;stroke-width:2}.field{fill:#02070c;stroke:#2e5d78;stroke-width:2}.grid{stroke:#183247;stroke-width:1}.title{fill:#f2fbff;font:800 24px ui-monospace,Menlo,monospace}.small{fill:#d9f5ff;font:800 14px ui-monospace,Menlo,monospace}.tiny{fill:#a8d2ec;font:11px ui-monospace,Menlo,monospace}.muted{fill:#6f8da3}.targetPath,.currentPath{fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.deltaLine{stroke:#f6fbff;stroke-width:2;stroke-dasharray:4 4}.pill{fill:#102a3b;stroke:#2e5d78;stroke-width:1}
  </style>
  <rect class="bg" x="0" y="0" width="1180" height="660"/>
  <text class="title" x="32" y="42">${svgEsc(row.label)}</text>
  <rect class="pill" x="650" y="18" width="138" height="32" rx="16"/><text class="small" x="666" y="39">${svgEsc(row.scores?.movementConformanceScore10 ?? 'n/a')}/10 movement</text>
  <rect class="pill" x="800" y="18" width="142" height="32" rx="16"/><text class="small" x="816" y="39">${svgEsc(row.scores?.targetVideoObjectTrackFitScore10 ?? 'n/a')}/10 track fit</text>
  <rect class="pill" x="954" y="18" width="172" height="32" rx="16"/><text class="small" x="970" y="39">${svgEsc(row.summary?.averageGroupScore10 ?? 'n/a')}/10 group avg</text>
  <rect class="panel" x="28" y="72" width="1140" height="570" rx="14"/>
  ${drawField(targetBox, 'Ingested target motion', 'cyan/green/pink lines: target group paths')}
  ${drawField(currentBox, 'Aurora current motion', 'lines: current runtime/synthesized group paths')}
  ${drawField(overlayBox, 'Overlay and deltas', 'dashed target, amber current, white end-point delta')}
  ${targetPaths}
  ${currentPaths}
  ${overlayTarget}
  ${overlayCurrent}
  ${arrows}
  <text class="small" x="44" y="436">Stage-start timing strip</text>
  <text class="tiny" x="230" y="436">0s</text><text class="tiny" x="740" y="436">${round(maxTime, 1)}s</text>
  <line class="grid" x1="230" y1="444" x2="750" y2="444"/>
  ${timingRows}
  <text class="small" x="914" y="436">Human delta read</text>
  ${gapReads}
</svg>
`;
}

function makeRow(stageRow, pattern, trajectory){
  const groupRows = buildGroupRows(stageRow, pattern, trajectory);
  const groupScores = groupRows.map(group => group.score10).filter(value => Number.isFinite(+value));
  const row = {
    id: `aurora-challenge-${String(stageRow.challengeNumber || stageRow.stage).padStart(2, '0')}-motion-atlas`,
    gameKey: 'aurora-galactica',
    surface: 'challenge-stage-set-piece',
    stage: stageRow.stage,
    challengeNumber: stageRow.challengeNumber,
    label: challengeLabel(stageRow),
    target: {
      expectedReferenceLabels: stageRow.expectedReferenceLabels || [],
      bestReferenceMatch: stageRow.bestReferenceMatch?.labelId || null,
      meaning: stageRow.galagaReferenceMeaning || stageRow.galagaTarget || null,
      sourceAnchor: stageRow.galagaReferenceAnchor || null
    },
    current: {
      layoutId: stageRow.auroraLayoutId || pattern?.runtimeLayout?.id || null,
      pathFamily: stageRow.pathFamily || pattern?.runtimeLayout?.pathFamily || null,
      read: stageRow.currentRead || null
    },
    scores: {
      conformanceScore10: round(stageRow.conformanceScore10, 1),
      interestingFactor10: round(stageRow.interestingFactor10, 1),
      movementConformanceScore10: round(stageRow.movementConformanceScore10, 1),
      graphicalConformanceScore10: round(stageRow.graphicalConformanceScore10, 1),
      alienNoveltyScore10: round(stageRow.alienNoveltyScore10, 1),
      targetContractFitScore10: round(stageRow.targetContractFitScore10, 1),
      targetVideoObjectTrackFitScore10: round(stageRow.targetVideoObjectTrackFitScore10, 1),
      playerShotOpportunityScore10: round(stageRow.playerShotOpportunityScore10, 1)
    },
    summary: {
      groupCount: groupRows.length,
      averageGroupScore10: round(average(groupScores), 1),
      targetPointCount: groupRows.reduce((sum, group) => sum + group.targetPoints.length, 0),
      currentPointCount: groupRows.reduce((sum, group) => sum + group.currentPoints.length, 0),
      synthesizedCurrentPathCount: groupRows.filter(group => group.currentPoints.some(point => point.source === 'summary-estimate')).length,
      read: stageRow.movementRead || stageRow.currentRead || 'Motion read pending.'
    },
    groupRows,
    criticalGaps: stageRow.criticalGaps || [],
    nextActions: stageRow.nextActions || []
  };
  return row;
}

function attachDiagrams(report, outDir){
  ensureDir(LATEST_DIAGRAM_DIR);
  for(const row of report.rows){
    const fileName = `aurora-challenge-${String(row.challengeNumber || row.stage).padStart(2, '0')}-motion-atlas.svg`;
    const latest = path.join(LATEST_DIAGRAM_DIR, fileName);
    const dated = path.join(outDir, fileName);
    const svg = makeMotionAtlasSvg(row);
    writeText(latest, svg);
    writeText(dated, svg);
    row.diagrams = {
      motionAtlasSvg: rel(latest)
    };
    row.evidence = unique([
      row.diagrams.motionAtlasSvg,
      row.target.sourceAnchor,
      `reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-${String(row.challengeNumber || row.stage).padStart(2, '0')}-trajectory.svg`,
      `reference-artifacts/analyses/challenge-stage-conformance/latest-diagrams/challenge-stage-${String(row.challengeNumber || row.stage).padStart(2, '0')}-object-track.svg`
    ]);
  }
}

function main(){
  const challenge = readJson(CHALLENGE_STAGE_CONFORMANCE);
  const movementMap = readJson(AURORA_CHALLENGE_MOVEMENT_GRAMMAR_MAP, { patterns: [], summary: {} });
  const trajectoryControls = readJson(CHALLENGE_TRAJECTORY_CONTROLS, { challenges: [], summary: {} });
  const patternsByStage = byStage(movementMap.patterns || []);
  const trajectoriesByStage = byStage(trajectoryControls.challenges || []);
  const stageRows = Array.isArray(challenge.stageRows) ? challenge.stageRows : [];
  if(!stageRows.length) fail('challenge-stage conformance artifact has no stageRows', { artifact: rel(CHALLENGE_STAGE_CONFORMANCE) });

  const rows = stageRows.map(stageRow => makeRow(
    stageRow,
    patternsByStage.get(+stageRow.stage),
    trajectoriesByStage.get(+stageRow.stage)
  ));
  const report = {
    schemaVersion: 1,
    artifactType: 'motion-atlas',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    games: ['aurora-galactica'],
    summary: {
      gameCount: 1,
      rowCount: rows.length,
      challengeStageCount: rows.filter(row => row.surface === 'challenge-stage-set-piece').length,
      averageMovementScore10: round(average(rows.map(row => row.scores.movementConformanceScore10)), 1),
      averageTargetVideoObjectTrackFitScore10: round(average(rows.map(row => row.scores.targetVideoObjectTrackFitScore10)), 1),
      averageGroupScore10: round(average(rows.map(row => row.summary.averageGroupScore10)), 1),
      synthesizedCurrentPathCount: rows.reduce((sum, row) => sum + (row.summary.synthesizedCurrentPathCount || 0), 0),
      targetPointCount: rows.reduce((sum, row) => sum + (row.summary.targetPointCount || 0), 0),
      currentPointCount: rows.reduce((sum, row) => sum + (row.summary.currentPointCount || 0), 0),
      readinessScore10: round(average([
        trajectoryControls.summary?.controlReadinessScore10,
        movementMap.summary?.compilerBridgeReady ? 8.5 : 5,
        challenge.summary?.targetTrackReadinessScore10
      ]), 1),
      read: 'Motion Atlas joins ingested target paths, Aurora runtime/synthesized paths, stage-start timing strips, group identity, and strict conformance scores so humans can see motion deltas before the next gameplay tuning pass.'
    },
    sourceArtifacts: {
      challengeStageConformance: rel(CHALLENGE_STAGE_CONFORMANCE),
      auroraChallengeMovementGrammarMap: rel(AURORA_CHALLENGE_MOVEMENT_GRAMMAR_MAP),
      challengeTrajectoryControls: rel(CHALLENGE_TRAJECTORY_CONTROLS)
    },
    measurementLimits: [
      'Target paths come from CPU-extracted Galaga challenge object tracks and trajectory-control representative paths.',
      'Current paths use runtime object-track points where available; otherwise the atlas draws a labeled summary estimate from measured entry/exit side, range, lower-field share, and timing.',
      'This is a human review surface, not a replacement for strict conformance scoring or frame-perfect sprite matching.',
      'The same artifact shape is intended to cover normal formation entry, dives, capture/rescue, and future games after their movement grammar maps exist.'
    ],
    rows,
    nextBestStep: 'Use the atlas to select the next stage/group with visible user impact: wrong side, wrong path length, poor timing, or missing alien novelty.'
  };
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${report.commit}`;
  const datedDir = path.join(OUT_DIR, stamp);
  attachDiagrams(report, datedDir);
  writeJson(path.join(datedDir, 'report.json'), report);
  writeJson(OUT, report);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    rows: report.summary.rowCount,
    averageMovementScore10: report.summary.averageMovementScore10,
    averageGroupScore10: report.summary.averageGroupScore10,
    diagrams: rel(LATEST_DIAGRAM_DIR),
    nextBestStep: report.nextBestStep
  }, null, 2));
}

main();
