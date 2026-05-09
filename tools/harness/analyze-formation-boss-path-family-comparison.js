#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'formation-boss-path-slot-extraction');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'formation-boss-path-family-comparison');
const PROFILE_PATH = path.join(ROOT, 'tools', 'harness', 'reference-profiles', 'formation-boss-grammar-conformance.json');

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : 0;
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, value));
}

function average(values){
  const finite = values.filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function collectReports(root){
  const out = [];
  function walk(dir){
    if(!fs.existsSync(dir)) return;
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === 'report.json') out.push(full);
    }
  }
  walk(root);
  return out.sort((a, b) => {
    const delta = fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs;
    return delta || a.localeCompare(b);
  });
}

function latestReport(root){
  const reports = collectReports(root);
  return reports.length ? reports[reports.length - 1] : null;
}

function pointFeatures(track){
  const points = (track.points || []).filter(point => Number.isFinite(+point.x) && Number.isFinite(+point.y));
  if(points.length < 2){
    return {
      pointCount: points.length,
      durationS: 0,
      dx: 0,
      dy: 0,
      xRange: 0,
      yRange: 0,
      pathLength: track.pathLength || 0,
      turnCount: 0,
      reversalCount: 0,
      lowerFieldShare: 0,
      upperFieldShare: 0,
      slotError: null
    };
  }
  const xs = points.map(point => +point.x);
  const ys = points.map(point => +point.y);
  let pathLength = 0;
  let turnCount = 0;
  let reversalCount = 0;
  let lastHeading = null;
  let lastDxSign = 0;
  for(let i = 1; i < points.length; i += 1){
    const a = points[i - 1];
    const b = points[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    pathLength += Math.hypot(dx, dy);
    const heading = Math.atan2(dy, dx);
    if(lastHeading != null){
      const delta = Math.abs(Math.atan2(Math.sin(heading - lastHeading), Math.cos(heading - lastHeading)));
      if(delta > 0.65) turnCount += 1;
    }
    const dxSign = Math.sign(dx);
    if(dxSign && lastDxSign && dxSign !== lastDxSign) reversalCount += 1;
    if(dxSign) lastDxSign = dxSign;
    lastHeading = heading;
  }
  const last = points.at(-1);
  const targetX = Number.isFinite(+track.targetX) ? +track.targetX : null;
  const targetY = Number.isFinite(+track.targetY) ? +track.targetY : null;
  return {
    pointCount: points.length,
    durationS: round((points.at(-1).t || 0) - (points[0].t || 0)),
    dx: round(xs.at(-1) - xs[0]),
    dy: round(ys.at(-1) - ys[0]),
    xRange: round(Math.max(...xs) - Math.min(...xs)),
    yRange: round(Math.max(...ys) - Math.min(...ys)),
    pathLength: round(pathLength || track.pathLength || 0),
    turnCount,
    reversalCount,
    lowerFieldShare: round(ys.filter(y => y >= 150).length / ys.length),
    upperFieldShare: round(ys.filter(y => y <= 90).length / ys.length),
    slotError: targetX == null || targetY == null ? null : round(Math.hypot(last.x - targetX, last.y - targetY))
  };
}

function classifyTrack(track){
  const features = pointFeatures(track);
  const families = [];
	  const slotObserved = !!(track.slotObserved || track.challengeSlotObserved);
	  if(track.kind === 'regular' && slotObserved) families.push('rack-slot-settle');
	  if(track.kind === 'regular' && features.pathLength > 90 && features.yRange > 35) families.push('entry-arc-to-rack');
	  if(track.kind === 'regular' && track.pathFamily && track.pathFamily !== 'classic-center-arc-entry') families.push(`entry-${track.pathFamily}`);
	  if(track.type === 'boss' && features.pathLength > 60) families.push('boss-entry-or-dive');
  if(track.type === 'boss' && features.turnCount >= 2) families.push('boss-looping-arc');
  if(track.escort && features.pathLength > 55) families.push('escort-paired-dive');
	  if(track.kind === 'challenge' && slotObserved) families.push('challenge-lane-wave');
	  if(track.kind === 'challenge' && features.pathLength > 70 && features.xRange > 20) families.push('challenge-sweeping-path');
	  if(track.kind === 'challenge' && track.pathFamily && track.pathFamily !== 'classic-lane-wave') families.push(`challenge-${track.pathFamily}`);
	  if(features.lowerFieldShare > 0.15 && features.yRange > 70) families.push('player-pressure-dive');
  return {
    id: track.id,
    kind: track.kind,
    type: track.type,
    stageFamily: null,
    families,
    features,
    slotObserved
  };
}

function expectedFamilies(profile){
  const fromProfile = profile.referencePathFamilies || [];
  if(fromProfile.length) return fromProfile;
  return [
    { id: 'rack-slot-settle', label: 'Rack slot settle', target: 5 },
    { id: 'entry-arc-to-rack', label: 'Entry arc to rack', target: 5 },
    { id: 'boss-entry-or-dive', label: 'Boss entry or dive', target: 4 },
    { id: 'escort-paired-dive', label: 'Escort paired dive', target: 2 },
    { id: 'challenge-lane-wave', label: 'Challenge lane wave', target: 1 },
    { id: 'challenge-sweeping-path', label: 'Challenge sweeping path', target: 1 }
  ];
}

function familySummary(expected, classifications){
  return expected.map(family => {
    const matches = classifications.filter(item => item.families.includes(family.id));
    return {
      id: family.id,
      label: family.label,
      target: family.target,
      observed: matches.length,
      coverage: round(clamp(matches.length / Math.max(family.target || 1, 1))),
      examples: matches.slice(0, 6).map(match => match.id)
    };
  });
}

function windowSummary(window){
  const classifications = (window.tracks || []).map(classifyTrack);
  const families = new Set(classifications.flatMap(item => item.families));
  return {
    windowId: window.windowId,
    stage: window.stage,
    challenge: !!window.challenge,
    trackCount: window.trackCount,
    classifiedTrackCount: classifications.filter(item => item.families.length).length,
    familyCount: families.size,
    families: [...families].sort(),
    classifications
  };
}

function scoreSummary(profile, sourceReport, windows){
  const expected = expectedFamilies(profile);
  const classifications = windows.flatMap(window => window.classifications);
  const families = familySummary(expected, classifications);
  const expectedCoverage = average(families.map(family => family.coverage));
  const windowFamilyCoverage = windows.length ? windows.filter(window => window.familyCount >= (window.challenge ? 2 : 3)).length / windows.length : 0;
  const bossCoverage = classifications.some(item => item.families.includes('boss-entry-or-dive')) ? 1 : 0;
  const escortCoverage = classifications.some(item => item.families.includes('escort-paired-dive')) ? 1 : 0;
  const challengeCoverage = classifications.some(item => item.families.includes('challenge-sweeping-path')) ? 1 : 0;
  const slotCoverage = classifications.length ? classifications.filter(item => item.slotObserved).length / classifications.length : 0;
  const meanTurnScore = average(classifications.map(item => clamp(item.features.turnCount / 3)));
  const scoreBeforeCap10 = round(10 * (
    (0.34 * expectedCoverage)
    + (0.2 * windowFamilyCoverage)
    + (0.12 * bossCoverage)
    + (0.1 * escortCoverage)
    + (0.1 * challengeCoverage)
    + (0.09 * slotCoverage)
    + (0.05 * meanTurnScore)
  ), 1);
  const referenceComparisonCap10 = profile.thresholds?.heuristicPathFamilyCap10 || 6.8;
  return {
    sourceReport: rel(sourceReport),
    windowCount: windows.length,
    classifiedTrackCount: classifications.filter(item => item.families.length).length,
    totalTrackCount: classifications.length,
    expectedFamilyCoverage: round(expectedCoverage),
    windowFamilyCoverage: round(windowFamilyCoverage),
    bossCoverage,
    escortCoverage,
    challengeCoverage,
    slotCoverage: round(slotCoverage),
    meanTurnScore: round(meanTurnScore),
    scoreBeforeCap10,
    referenceComparisonCap10,
    score10: round(Math.min(scoreBeforeCap10, referenceComparisonCap10), 1),
    comparisonConfidence: 0.64,
    topProblem: scoreBeforeCap10 >= referenceComparisonCap10
      ? 'Heuristic path-family coverage is available; the remaining gap is frame-labeled Galaga reference path comparison.'
      : 'At least one expected boss, escort, rack, or challenge path family is missing from the current Aurora extraction.',
    strategy: 'Use classified runtime path families to rank gameplay gaps now, then add labeled Galaga path families to replace heuristic coverage with direct visual conformance.',
    successMeasure: 'Raise path-family score above the heuristic cap only after reference contact sheets or video-derived path labels can compare boss, escort, rack, and challenge trajectories directly.'
  };
}

function buildReport(){
  const profile = readJson(PROFILE_PATH);
  const sourceReport = latestReport(SOURCE_ROOT);
  if(!sourceReport) throw new Error('No formation-boss path-slot extraction report found. Run npm run harness:extract:formation-boss-path-slots first.');
  const source = readJson(sourceReport);
  const windows = (source.windows || []).map(windowSummary);
  const summary = scoreSummary(profile, sourceReport, windows);
  const stamp = new Date().toISOString().slice(0, 10);
  const commit = gitShortCommit();
  const outDir = path.join(OUT_ROOT, `${stamp}-${commit}`);
  const report = {
    generatedAt: new Date().toISOString(),
    commit,
    artifactType: 'formation-boss-path-family-comparison',
    profile: rel(PROFILE_PATH),
    summary,
    families: familySummary(expectedFamilies(profile), windows.flatMap(window => window.classifications)),
    windows,
    problem: 'Boss and formation conformance needs not just path capture, but a reusable grammar that distinguishes rack-settle, boss, escort, pressure-dive, and challenge-stage path families.',
    plan: 'Classify extracted runtime paths into Galaga-like reference families, score coverage with a confidence/cap penalty, and use the result to select future reference-labeling or gameplay-tuning investments.',
    successMeasure: summary.successMeasure
  };
  writeJson(path.join(outDir, 'report.json'), report);
  const lines = [
    '# Formation Boss Path Family Comparison',
    '',
    'This artifact classifies extracted Aurora boss, escort, rack-settle, and challenge-stage trajectories into reusable path families.',
    '',
    `- Score: ${summary.score10}/10`,
    `- Score before cap: ${summary.scoreBeforeCap10}/10`,
    `- Reference comparison cap: ${summary.referenceComparisonCap10}/10`,
    `- Confidence: ${summary.comparisonConfidence}`,
    `- Classified tracks: ${summary.classifiedTrackCount}/${summary.totalTrackCount}`,
    `- Expected family coverage: ${summary.expectedFamilyCoverage}`,
    '',
    `Problem: ${report.problem}`,
    '',
    `Plan: ${report.plan}`,
    '',
    `Success: ${report.successMeasure}`,
    '',
    '## Families',
    '',
    '| Family | Target | Observed | Coverage | Examples |',
    '| --- | ---: | ---: | ---: | --- |'
  ];
  for(const family of report.families){
    lines.push(`| ${family.label} | ${family.target} | ${family.observed} | ${family.coverage} | ${family.examples.join(', ')} |`);
  }
  lines.push('');
  lines.push('## Windows');
  lines.push('');
  lines.push('| Window | Stage | Families | Classified Tracks |');
  lines.push('| --- | ---: | --- | ---: |');
  for(const window of windows){
    lines.push(`| ${window.windowId} | ${window.stage} | ${window.families.join(', ')} | ${window.classifiedTrackCount}/${window.trackCount} |`);
  }
  fs.writeFileSync(path.join(outDir, 'README.md'), `${lines.join('\n')}\n`);
  return { ok: true, outDir, score10: summary.score10, topProblem: summary.topProblem };
}

if(require.main === module){
  console.log(JSON.stringify(buildReport(), null, 2));
}

module.exports = { buildReport };
