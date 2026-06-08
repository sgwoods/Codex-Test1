#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const DESCRIPTION = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-descriptions', 'aurora-stage7-challenge2-0.1.json');
const REFERENCE_REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-description', 'stage7-challenge2', 'latest.json');
const CHALLENGE_CONFORMANCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-conformance', 'latest.json');
const DEFAULT_CANDIDATE = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-candidate-trials', 'stage7-baseline-control-0.1.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-candidate-trials', 'stage7-challenge2');
const FOCUS_GROUPS = [1, 4, 5];

function argValue(name, fallback = ''){
  const prefix = `--${name}=`;
  const direct = process.argv.find(arg => arg.startsWith(prefix));
  if(direct) return direct.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if(index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
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

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
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

function firstFinite(...values){
  for(const value of values){
    if(Number.isFinite(+value)) return +value;
  }
  return null;
}

function firstString(...values){
  for(const value of values){
    if(typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function firstObject(...values){
  return values.find(value => value && typeof value === 'object' && !Array.isArray(value)) || {};
}

function closenessToTarget(value, target, tolerance){
  if(!Number.isFinite(+value) || !Number.isFinite(+target)) return 0;
  return clamp(1 - Math.abs(+value - +target) / Math.max(0.0001, +tolerance));
}

function sideCompatibility(value, expected){
  if(!value || !expected) return 0;
  const actual = String(value);
  const target = String(expected);
  if(actual === target) return 1;
  if(target.includes(actual) || actual.includes(target)) return 0.65;
  if(target === 'both-sides' && (actual === 'left' || actual === 'right' || actual === 'center')) return 0.65;
  return 0;
}

function compareTrackVector(vector, target){
  if(!vector || !target) return null;
  const xRange = closenessToTarget(vector.xRange, target.xRange, Math.max(0.12, (+target.xRange || 0.6) * 0.42));
  const yRange = closenessToTarget(vector.yRange, target.yRange, Math.max(0.1, (+target.yRange || 0.4) * 0.45));
  const pathLength = closenessToTarget(vector.pathLength, target.pathLength, Math.max(0.16, (+target.pathLength || 0.8) * 0.42));
  const turnCount = closenessToTarget(vector.turnCount, target.turnCount || 1, 2.1);
  const reversalCount = closenessToTarget(vector.reversalCount, target.reversalCount || 1, 2.2);
  const lowerFieldShare = closenessToTarget(vector.lowerFieldShare, target.lowerFieldShare || 0, 0.18);
  const visibleStart = closenessToTarget(vector.visibleStartS, target.visibleStartS, 0.95);
  const visibleEnd = closenessToTarget(vector.visibleEndS, target.visibleEndS, 1.35);
  const entrySide = sideCompatibility(vector.entrySide, target.entrySide);
  const exitSide = sideCompatibility(vector.exitSide, target.exitSide);
  const coverage = clamp(
    (0.14 * xRange)
    + (0.16 * yRange)
    + (0.18 * pathLength)
    + (0.12 * turnCount)
    + (0.08 * reversalCount)
    + (0.09 * lowerFieldShare)
    + (0.08 * visibleStart)
    + (0.07 * visibleEnd)
    + (0.04 * entrySide)
    + (0.04 * exitSide)
  );
  return {
    coverage: round(coverage, 3),
    score10: round(1 + coverage * 7.4, 1),
    components: {
      xRange: round(xRange, 3),
      yRange: round(yRange, 3),
      pathLength: round(pathLength, 3),
      turnCount: round(turnCount, 3),
      reversalCount: round(reversalCount, 3),
      lowerFieldShare: round(lowerFieldShare, 3),
      visibleStart: round(visibleStart, 3),
      visibleEnd: round(visibleEnd, 3),
      entrySide: round(entrySide, 3),
      exitSide: round(exitSide, 3)
    }
  };
}

function resolveCandidatePath(value){
  const raw = value || rel(DEFAULT_CANDIDATE);
  const direct = path.isAbsolute(raw) ? raw : path.join(ROOT, raw);
  if(fs.existsSync(direct)) return direct;
  const byName = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-candidate-trials', raw);
  if(fs.existsSync(byName)) return byName;
  throw new Error(`Candidate input not found: ${raw}`);
}

function findStage7Conformance(report){
  const rows = report.stageRows || [];
  const row = rows.find(item => +item.stage === 7 || +item.challengeNumber === 2);
  if(!row) throw new Error('Missing Stage 7 row in challenge-stage conformance report.');
  return row;
}

function conformanceFitByGroup(conformanceRow){
  const fits = conformanceRow.strictAxisReads?.targetContractFit?.objectTrackFits || [];
  return new Map(fits.map(fit => [+fit.groupIndex, fit]));
}

function groupSpec(candidate, groupIndex){
  const groups = Array.isArray(candidate.groups) ? candidate.groups : [];
  return groups.find(group => +group.groupIndex === +groupIndex) || null;
}

function numericField(target, source, keys){
  for(const key of keys){
    if(Number.isFinite(+source[key])){
      target[keys[0]] = +source[key];
      return true;
    }
  }
  return false;
}

function applyNumericOverrides(vector, source){
  if(!source || typeof source !== 'object') return;
  numericField(vector, source, ['visibleStartS', 'visibleStart', 'startS']);
  numericField(vector, source, ['visibleEndS', 'visibleEnd', 'endS']);
  numericField(vector, source, ['xRange']);
  numericField(vector, source, ['yRange']);
  numericField(vector, source, ['pathLength']);
  numericField(vector, source, ['turnCount']);
  numericField(vector, source, ['reversalCount']);
  numericField(vector, source, ['lowerFieldShare', 'lowerShare']);
  if(source.entrySide) vector.entrySide = source.entrySide;
  if(source.exitSide) vector.exitSide = source.exitSide;
}

function applyScale(value, scale){
  if(!Number.isFinite(+value) || !Number.isFinite(+scale)) return value;
  return +value * +scale;
}

function applyGroupControls(baseVector, candidateGroup, descriptionGroup){
  const vector = Object.assign({}, baseVector || {});
  const aggregateTarget = descriptionGroup.aggregateObjectTrackTarget || {};
  const primaryTarget = descriptionGroup.primaryObjectTrackTarget || {};
  const explicitVector = firstObject(
    candidateGroup?.predictedRuntimeVector,
    candidateGroup?.runtimeVector,
    candidateGroup?.objectTrackVector,
    candidateGroup?.vector
  );
  const timing = firstObject(candidateGroup?.timing, candidateGroup?.phaseTiming);
  const controls = firstObject(candidateGroup?.controls, candidateGroup?.vectorOverrides, candidateGroup?.movement);
  const lower = firstObject(candidateGroup?.lowerField, candidateGroup?.lowerFieldControls);
  const referencePath = firstObject(candidateGroup?.referencePath, candidateGroup?.groupReferencePath);

  applyNumericOverrides(vector, explicitVector);
  applyNumericOverrides(vector, candidateGroup || {});
  applyNumericOverrides(vector, controls);

  const phaseOffsetS = firstFinite(timing.phaseOffsetS, timing.phaseOffset, candidateGroup?.phaseOffsetS);
  if(phaseOffsetS !== null){
    if(Number.isFinite(+vector.visibleStartS)) vector.visibleStartS = +vector.visibleStartS + phaseOffsetS;
    if(Number.isFinite(+vector.visibleEndS)) vector.visibleEndS = +vector.visibleEndS + phaseOffsetS;
  }

  const spawnOffsetS = firstFinite(timing.spawnOffsetS, timing.spawnOffset, candidateGroup?.spawnOffsetS);
  if(spawnOffsetS !== null && !Number.isFinite(+explicitVector.visibleStartS)){
    const duration = Number.isFinite(+vector.visibleStartS) && Number.isFinite(+vector.visibleEndS)
      ? Math.max(0.05, +vector.visibleEndS - +vector.visibleStartS)
      : null;
    vector.visibleStartS = spawnOffsetS;
    if(duration !== null && !Number.isFinite(+timing.visibleEndS)) vector.visibleEndS = spawnOffsetS + duration;
  }

  if(Number.isFinite(+timing.visibleStartS)) vector.visibleStartS = +timing.visibleStartS;
  if(Number.isFinite(+timing.visibleEndS)) vector.visibleEndS = +timing.visibleEndS;

  const durationScale = firstFinite(timing.durationScale, candidateGroup?.durationScale);
  if(durationScale !== null && Number.isFinite(+vector.visibleStartS) && Number.isFinite(+baseVector?.visibleStartS) && Number.isFinite(+baseVector?.visibleEndS)){
    vector.visibleEndS = +vector.visibleStartS + Math.max(0.05, (+baseVector.visibleEndS - +baseVector.visibleStartS) * durationScale);
  }

  const playbackScale = firstFinite(timing.playbackScale, candidateGroup?.playbackScale, referencePath.playbackScale);
  const hasExplicitEnd = Number.isFinite(+timing.visibleEndS) || Number.isFinite(+explicitVector.visibleEndS) || Number.isFinite(+candidateGroup?.visibleEndS);
  const hasExplicitPathLength = Number.isFinite(+explicitVector.pathLength) || Number.isFinite(+candidateGroup?.pathLength) || Number.isFinite(+controls.pathLength);
  const hasPathLengthScale = Number.isFinite(+controls.pathLengthScale) || Number.isFinite(+candidateGroup?.pathLengthScale);
  if(playbackScale !== null && playbackScale > 0){
    if(!hasExplicitEnd && durationScale === null && Number.isFinite(+vector.visibleStartS) && Number.isFinite(+baseVector?.visibleStartS) && Number.isFinite(+baseVector?.visibleEndS)){
      const baseDuration = Math.max(0.05, +baseVector.visibleEndS - +baseVector.visibleStartS);
      vector.visibleEndS = +vector.visibleStartS + (baseDuration / playbackScale);
    }
    if(!hasExplicitPathLength && !hasPathLengthScale && Number.isFinite(+baseVector?.pathLength)){
      vector.pathLength = +baseVector.pathLength / playbackScale;
    }
  }

  const xRangeScale = firstFinite(controls.xRangeScale, candidateGroup?.xRangeScale);
  const yRangeScale = firstFinite(controls.yRangeScale, candidateGroup?.yRangeScale);
  const pathLengthScale = firstFinite(controls.pathLengthScale, candidateGroup?.pathLengthScale);
  const turnCountScale = firstFinite(controls.turnCountScale, candidateGroup?.turnCountScale);
  const reversalCountScale = firstFinite(controls.reversalCountScale, candidateGroup?.reversalCountScale);
  if(xRangeScale !== null) vector.xRange = applyScale(vector.xRange, xRangeScale);
  if(yRangeScale !== null) vector.yRange = applyScale(vector.yRange, yRangeScale);
  if(pathLengthScale !== null) vector.pathLength = applyScale(vector.pathLength, pathLengthScale);
  if(turnCountScale !== null) vector.turnCount = applyScale(vector.turnCount, turnCountScale);
  if(reversalCountScale !== null) vector.reversalCount = applyScale(vector.reversalCount, reversalCountScale);

  const lowerShare = firstFinite(lower.lowerFieldShare, lower.share, controls.lowerFieldShare, candidateGroup?.lowerFieldShare);
  const lowerDelta = firstFinite(lower.lowerFieldDelta, lower.delta, controls.lowerFieldDelta, candidateGroup?.lowerFieldDelta);
  const lowerDeltaFromAggregate = firstFinite(lower.lowerFieldDeltaFromAggregate, controls.lowerFieldDeltaFromAggregate);
  const lowerDeltaFromPrimary = firstFinite(lower.lowerFieldDeltaFromPrimary, controls.lowerFieldDeltaFromPrimary);
  const lowerTargetBlend = firstFinite(lower.targetBlend, lower.aggregateTargetBlend, controls.lowerFieldTargetBlend);
  if(lowerShare !== null) vector.lowerFieldShare = lowerShare;
  if(lowerDelta !== null && Number.isFinite(+vector.lowerFieldShare)) vector.lowerFieldShare = +vector.lowerFieldShare + lowerDelta;
  if(lowerDeltaFromAggregate !== null && Number.isFinite(+aggregateTarget.lowerFieldShare)) vector.lowerFieldShare = +aggregateTarget.lowerFieldShare + lowerDeltaFromAggregate;
  if(lowerDeltaFromPrimary !== null && Number.isFinite(+primaryTarget.lowerFieldShare)) vector.lowerFieldShare = +primaryTarget.lowerFieldShare + lowerDeltaFromPrimary;
  if(lowerTargetBlend !== null && Number.isFinite(+vector.lowerFieldShare) && Number.isFinite(+aggregateTarget.lowerFieldShare)){
    vector.lowerFieldShare = +vector.lowerFieldShare + ((+aggregateTarget.lowerFieldShare - +vector.lowerFieldShare) * clamp(lowerTargetBlend));
  }

  if(Number.isFinite(+vector.lowerFieldShare)) vector.lowerFieldShare = clamp(+vector.lowerFieldShare);
  for(const key of ['visibleStartS', 'visibleEndS', 'xRange', 'yRange', 'pathLength', 'turnCount', 'reversalCount', 'lowerFieldShare']){
    if(Number.isFinite(+vector[key])) vector[key] = round(vector[key], key.includes('S') ? 2 : 4);
  }
  return vector;
}

function scoreGroup({ descriptionGroup, referenceRead, baselineFit, candidateGroup }){
  const baseRuntime = Object.assign({}, baselineFit?.runtime || referenceRead.runtimeVector || {});
  const vector = applyGroupControls(baseRuntime, candidateGroup || {}, descriptionGroup);
  const candidatePathFamily = firstString(
    candidateGroup?.pathFamily,
    candidateGroup?.groupPathFamily,
    candidateGroup?.canonicalPathFamily,
    candidateGroup?.referencePath?.pathFamily,
    vector.pathFamily,
    baselineFit?.runtime?.pathFamily,
    referenceRead.runtimePathFamily
  );
  vector.pathFamily = candidatePathFamily || null;
  const aggregateTarget = descriptionGroup.aggregateObjectTrackTarget || {};
  const primaryTarget = descriptionGroup.primaryObjectTrackTarget || {};
  const aggregateFit = compareTrackVector(vector, aggregateTarget);
  const primaryFit = compareTrackVector(vector, primaryTarget);
  const aggregateLowerFieldDelta = Number.isFinite(+vector.lowerFieldShare) && Number.isFinite(+aggregateTarget.lowerFieldShare)
    ? round(+vector.lowerFieldShare - +aggregateTarget.lowerFieldShare, 3)
    : null;
  const primaryLowerFieldDelta = Number.isFinite(+vector.lowerFieldShare) && Number.isFinite(+primaryTarget.lowerFieldShare)
    ? round(+vector.lowerFieldShare - +primaryTarget.lowerFieldShare, 3)
    : null;
  const aggregatePathLengthRatio = Number.isFinite(+vector.pathLength) && Number.isFinite(+aggregateTarget.pathLength) && +aggregateTarget.pathLength > 0
    ? round(+vector.pathLength / +aggregateTarget.pathLength, 2)
    : null;
  const primaryPathLengthRatio = Number.isFinite(+vector.pathLength) && Number.isFinite(+primaryTarget.pathLength) && +primaryTarget.pathLength > 0
    ? round(+vector.pathLength / +primaryTarget.pathLength, 2)
    : null;
  const canonical = descriptionGroup.canonicalComparisonPathFamily || '';
  const gate = descriptionGroup.candidateComparisonGate || {};
  const blockers = [];
  const warnings = [];
  if(canonical && candidatePathFamily !== canonical) blockers.push(`path family ${candidatePathFamily || 'missing'} does not match canonical ${canonical}`);
  if(aggregateFit && aggregateFit.score10 < (gate.aggregateObjectTrackFitFloorScore10 || 5)) warnings.push(`aggregate object-track score ${aggregateFit.score10}/10 is below first promotion floor`);
  if(primaryFit && primaryFit.score10 < (gate.primaryObjectTrackFitFloorScore10 || 5)) warnings.push(`primary object-track score ${primaryFit.score10}/10 is below first promotion floor`);
  if(aggregatePathLengthRatio !== null && aggregatePathLengthRatio > (gate.maxAggregatePathLengthRatio || 3)) warnings.push(`aggregate path-length ratio ${aggregatePathLengthRatio} exceeds first promotion floor`);
  if(primaryPathLengthRatio !== null && primaryPathLengthRatio > (gate.maxPrimaryPathLengthRatio || 3)) warnings.push(`primary path-length ratio ${primaryPathLengthRatio} exceeds first promotion floor`);
  if(aggregateLowerFieldDelta !== null && aggregateLowerFieldDelta > 0.18) warnings.push(`lower-field overstay +${aggregateLowerFieldDelta} exceeds aggregate gate`);
  if(aggregateLowerFieldDelta !== null && aggregateLowerFieldDelta < -0.25) warnings.push(`lower-field undershoot ${aggregateLowerFieldDelta} exceeds aggregate gate`);
  return {
    groupIndex: descriptionGroup.groupIndex,
    touchedByCandidate: !!candidateGroup,
    canonicalComparisonPathFamily: canonical || null,
    candidatePathFamily: candidatePathFamily || null,
    canonicalPathFamilyMatch: canonical && candidatePathFamily ? candidatePathFamily === canonical : false,
    aggregateObjectTrackScore10: aggregateFit?.score10 ?? null,
    aggregateObjectTrackCoverage: aggregateFit?.coverage ?? null,
    primaryObjectTrackScore10: primaryFit?.score10 ?? null,
    primaryObjectTrackCoverage: primaryFit?.coverage ?? null,
    baselineAggregateObjectTrackScore10: baselineFit?.score10 ?? referenceRead.aggregateObjectTrackScore10 ?? null,
    baselineAggregateObjectTrackCoverage: baselineFit?.coverage ?? referenceRead.aggregateObjectTrackCoverage ?? null,
    baselinePrimaryObjectTrackScore10: referenceRead.primaryObjectTrackScore10 ?? null,
    deltas: {
      aggregateScore10: round((aggregateFit?.score10 ?? 0) - +(baselineFit?.score10 ?? referenceRead.aggregateObjectTrackScore10 ?? 0), 2),
      aggregateCoverage: round((aggregateFit?.coverage ?? 0) - +(baselineFit?.coverage ?? referenceRead.aggregateObjectTrackCoverage ?? 0), 3),
      primaryScore10: round((primaryFit?.score10 ?? 0) - +(referenceRead.primaryObjectTrackScore10 ?? 0), 2)
    },
    deviations: {
      aggregatePathLengthRatio,
      primaryPathLengthRatio,
      aggregateLowerFieldDelta,
      primaryLowerFieldDelta,
      visibleStartDeltaS: Number.isFinite(+vector.visibleStartS) && Number.isFinite(+aggregateTarget.visibleStartS) ? round(+vector.visibleStartS - +aggregateTarget.visibleStartS, 2) : null,
      visibleEndDeltaS: Number.isFinite(+vector.visibleEndS) && Number.isFinite(+aggregateTarget.visibleEndS) ? round(+vector.visibleEndS - +aggregateTarget.visibleEndS, 2) : null
    },
    candidateVector: vector,
    appliedControls: candidateGroup || null,
    blockers,
    warnings
  };
}

function guardrailSource(candidate, key){
  const guardrails = firstObject(candidate.guardrails);
  return firstObject(guardrails[key], candidate[key]);
}

function spacingRead(candidate){
  const source = guardrailSource(candidate, 'spacingReadability');
  const pass = source.pass === true || source.spacingPass === true || source.preserveBaseline === true;
  const missing = !Object.keys(source).length;
  const blockers = [];
  if(missing) blockers.push('spacing/readability evidence is missing');
  if(!missing && !pass) blockers.push('spacing/readability constraint did not pass');
  if(Number.isFinite(+source.bunchingRisk) && +source.bunchingRisk > 0.35) blockers.push(`bunching risk ${source.bunchingRisk} exceeds 0.35 trial floor`);
  if(Number.isFinite(+source.spacingScore) && +source.spacingScore < 0.7) blockers.push(`spacing score ${source.spacingScore} is below 0.70 trial floor`);
  return {
    source: source.source || null,
    pass: !missing && blockers.length === 0,
    preserveBaseline: source.preserveBaseline === true,
    spacingScore: Number.isFinite(+source.spacingScore) ? +source.spacingScore : null,
    bunchingRisk: Number.isFinite(+source.bunchingRisk) ? +source.bunchingRisk : null,
    worstMinDistance: Number.isFinite(+source.worstMinDistance) ? +source.worstMinDistance : null,
    averageMinDistance: Number.isFinite(+source.averageMinDistance) ? +source.averageMinDistance : null,
    readabilityScore10: Number.isFinite(+source.readabilityScore10) ? +source.readabilityScore10 : null,
    blockers
  };
}

function scoreableRead(candidate, baselineShot){
  const source = guardrailSource(candidate, 'scoreableRoutes');
  const preserve = source.preserveBaseline === true;
  const score10 = firstFinite(source.score10, preserve ? baselineShot?.score10 : null);
  const activeWindows = firstFinite(source.activeWindows, preserve ? baselineShot?.activeWindows : null);
  const multiTargetWindowShare = firstFinite(source.multiTargetWindowShare, preserve ? baselineShot?.multiTargetWindowShare : null);
  const laneDiversity = firstFinite(source.laneDiversity, preserve ? baselineShot?.laneDiversity : null);
  const centerBias = firstFinite(source.centerBias, preserve ? baselineShot?.centerBias : null);
  const missing = !Object.keys(source).length;
  const blockers = [];
  if(missing) blockers.push('scoreable-route evidence is missing');
  if(score10 !== null && baselineShot?.score10 !== undefined && score10 < +baselineShot.score10 - 0.05) blockers.push(`scoreable score ${score10}/10 regresses baseline ${baselineShot.score10}/10`);
  if(activeWindows !== null && baselineShot?.activeWindows !== undefined && activeWindows < +baselineShot.activeWindows - 2) blockers.push(`active score windows ${activeWindows} regress baseline ${baselineShot.activeWindows}`);
  if(multiTargetWindowShare !== null && baselineShot?.multiTargetWindowShare !== undefined && multiTargetWindowShare < +baselineShot.multiTargetWindowShare - 0.03) blockers.push(`multi-target window share ${multiTargetWindowShare} regresses baseline ${baselineShot.multiTargetWindowShare}`);
  if(laneDiversity !== null && baselineShot?.laneDiversity !== undefined && laneDiversity < +baselineShot.laneDiversity) blockers.push(`lane diversity ${laneDiversity} regresses baseline ${baselineShot.laneDiversity}`);
  if(centerBias !== null && centerBias > 0.5) blockers.push(`center-lane bias ${centerBias} exceeds 0.50 trial floor`);
  return {
    source: source.source || null,
    pass: !missing && blockers.length === 0,
    preserveBaseline: preserve,
    score10,
    activeWindows,
    multiTargetWindowShare,
    laneDiversity,
    centerBias,
    blockers
  };
}

function safetyRead(candidate, baselineSafety){
  const source = guardrailSource(candidate, 'safety');
  const preserve = source.preserveBaseline === true;
  const noEnemyShots = source.noEnemyShots === true || (preserve && baselineSafety?.noEnemyShots === true);
  const noAttackStarts = source.noAttackStarts === true || (preserve && baselineSafety?.noAttackStarts === true);
  const noShipLosses = source.noShipLosses === true || (preserve && baselineSafety?.noShipLosses === true);
  const missing = !Object.keys(source).length;
  const blockers = [];
  if(missing) blockers.push('challenge safety evidence is missing');
  if(!noEnemyShots) blockers.push('enemy shots are not proven absent');
  if(!noAttackStarts) blockers.push('attack starts are not proven absent');
  if(!noShipLosses) blockers.push('ship losses are not proven absent');
  return {
    source: source.source || null,
    pass: !missing && blockers.length === 0,
    preserveBaseline: preserve,
    noEnemyShots,
    noAttackStarts,
    noShipLosses,
    eventCounts: source.eventCounts || baselineSafety?.eventCounts || null,
    blockers
  };
}

function buildReport(candidatePath){
  const candidate = readJson(candidatePath);
  const description = readJson(DESCRIPTION);
  const referenceReport = readJson(REFERENCE_REPORT);
  const conformance = readJson(CHALLENGE_CONFORMANCE);
  const stage7 = findStage7Conformance(conformance);
  const fits = conformanceFitByGroup(stage7);
  const referenceReads = new Map((referenceReport.groupReads || []).map(read => [+read.groupIndex, read]));
  const groupResults = (description.groups || []).map(descriptionGroup => scoreGroup({
    descriptionGroup,
    referenceRead: referenceReads.get(+descriptionGroup.groupIndex) || {},
    baselineFit: fits.get(+descriptionGroup.groupIndex) || {},
    candidateGroup: groupSpec(candidate, +descriptionGroup.groupIndex)
  }));
  const coverage = round(average(groupResults.map(group => group.aggregateObjectTrackCoverage)), 3);
  const score10 = round(1 + coverage * 7.4, 1);
  const baselineScore10 = +referenceReport.currentRuntimeRead?.targetVideoObjectTrackFitScore10 || +stage7.targetVideoObjectTrackFitScore10 || 0;
  const baselineCoverage = +referenceReport.currentRuntimeRead?.targetVideoObjectTrackCoverage || +stage7.targetVideoObjectTrackCoverage || 0;
  const baselineByGroup = new Map(groupResults.map(group => [group.groupIndex, group.baselineAggregateObjectTrackScore10]));
  const spacing = spacingRead(candidate);
  const scoreable = scoreableRead(candidate, referenceReport.currentRuntimeRead?.shotOpportunity || stage7.shotOpportunityProbe || {});
  const safety = safetyRead(candidate, referenceReport.currentRuntimeRead?.safety || stage7.safetyProbe || {});
  const trialBlockers = [];
  const trialWarnings = [];
  const minTotalLift = firstFinite(candidate.gates?.minTotalObjectTrackLift10, 0.05);
  const totalLift = round(score10 - baselineScore10, 2);
  const coverageDelta = round(coverage - baselineCoverage, 3);
  if(totalLift <= minTotalLift) trialBlockers.push(`total object-track score lift ${totalLift}/10 does not exceed ${minTotalLift}/10`);
  if(coverageDelta < -0.005) trialBlockers.push(`object-track coverage regresses ${coverageDelta}`);
  const focusReads = groupResults.filter(group => FOCUS_GROUPS.includes(+group.groupIndex));
  const group1 = groupResults.find(group => +group.groupIndex === 1);
  const group4 = groupResults.find(group => +group.groupIndex === 4);
  const group5 = groupResults.find(group => +group.groupIndex === 5);
  if(group1 && group1.aggregateObjectTrackScore10 <= (+baselineByGroup.get(1) || 0) + 0.05){
    trialBlockers.push(`group 1 does not improve over baseline ${baselineByGroup.get(1)}/10`);
  }
  if(group4 && group4.aggregateObjectTrackScore10 < (+baselineByGroup.get(4) || 0) - 0.05){
    trialBlockers.push(`group 4 regresses below baseline ${baselineByGroup.get(4)}/10`);
  }
  if(group5 && group5.aggregateObjectTrackScore10 < (+baselineByGroup.get(5) || 0) - 0.05){
    trialBlockers.push(`group 5 regresses below baseline ${baselineByGroup.get(5)}/10`);
  }
  for(const group of groupResults){
    for(const blocker of group.blockers) trialBlockers.push(`group ${group.groupIndex}: ${blocker}`);
    for(const warning of group.warnings) trialWarnings.push(`group ${group.groupIndex}: ${warning}`);
  }
  for(const blocker of spacing.blockers) trialBlockers.push(`spacing/readability: ${blocker}`);
  for(const blocker of scoreable.blockers) trialBlockers.push(`scoreable routes: ${blocker}`);
  for(const blocker of safety.blockers) trialBlockers.push(`safety: ${blocker}`);
  const readyForRuntimeSourceCandidate = trialBlockers.length === 0;
  const generatedAt = new Date().toISOString();
  return {
    schemaVersion: 1,
    artifactType: 'stage7-reference-execution-candidate-trial',
    generatedAt,
    generatedBy: 'tools/harness/analyze-stage7-reference-execution-trial.js',
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
      candidate: rel(candidatePath),
      referenceExecutionDescription: rel(DESCRIPTION),
      referenceExecutionAnalysis: rel(REFERENCE_REPORT),
      challengeStageConformance: rel(CHALLENGE_CONFORMANCE)
    },
    candidate: {
      candidateId: candidate.candidateId || path.basename(candidatePath, '.json'),
      artifactType: candidate.artifactType || null,
      intent: candidate.intent || candidate.summary || null,
      externalInputAccepted: true,
      touchedGroups: groupResults.filter(group => group.touchedByCandidate).map(group => group.groupIndex)
    },
    baseline: {
      totalObjectTrackScore10: baselineScore10,
      totalObjectTrackCoverage: baselineCoverage,
      groupScores: groupResults.map(group => ({
        groupIndex: group.groupIndex,
        aggregateObjectTrackScore10: group.baselineAggregateObjectTrackScore10,
        primaryObjectTrackScore10: group.baselinePrimaryObjectTrackScore10
      })),
      safety: referenceReport.currentRuntimeRead?.safety || stage7.safetyProbe || null,
      scoreableRoutes: referenceReport.currentRuntimeRead?.shotOpportunity || stage7.shotOpportunityProbe || null
    },
    trial: {
      totalObjectTrackScore10: score10,
      totalObjectTrackCoverage: coverage,
      deltas: {
        totalObjectTrackScore10: totalLift,
        totalObjectTrackCoverage: coverageDelta
      },
      groupResults,
      focusGroupResults: focusReads,
      lowerFieldOverstay: groupResults.map(group => ({
        groupIndex: group.groupIndex,
        aggregateLowerFieldDelta: group.deviations.aggregateLowerFieldDelta,
        primaryLowerFieldDelta: group.deviations.primaryLowerFieldDelta
      })),
      spacingReadability: spacing,
      scoreableRoutes: scoreable,
      safety
    },
    summary: {
      measurementKeeperRecommendation: 'accept-trial-mechanism',
      runtimeKeeperRecommendation: 'not-a-runtime-keeper',
      readyForRuntimeSourceCandidate,
      blockerCount: trialBlockers.length,
      warningCount: trialWarnings.length,
      blockers: trialBlockers,
      warnings: trialWarnings,
      read: readyForRuntimeSourceCandidate
        ? 'This external trial predicts a focused Stage 7 improvement and preserves the required guardrails; it is ready for one runtime source candidate with before/after evidence.'
        : 'This external trial is useful measurement, but it is not ready for runtime source promotion.'
    },
    nextBestStep: readyForRuntimeSourceCandidate
      ? 'Promote exactly one runtime source candidate, rebuild, and run focused strict challenge conformance, motion profile, no-shot/no-loss safety, scoreable-route, spacing/readability, and before/after visual evidence.'
      : 'Revise the external candidate until it improves group 1 while preserving groups 4 and 5, coverage, spacing/readability, scoreable routes, and challenge safety.'
  };
}

function markdownTable(rows){
  return rows.map(row => `| ${row.groupIndex} | ${row.candidatePathFamily || 'n/a'} | ${row.canonicalComparisonPathFamily || 'n/a'} | ${row.aggregateObjectTrackScore10 ?? 'n/a'} | ${row.deltas.aggregateScore10 ?? 'n/a'} | ${row.primaryObjectTrackScore10 ?? 'n/a'} | ${row.deviations.aggregatePathLengthRatio ?? 'n/a'} | ${row.deviations.aggregateLowerFieldDelta ?? 'n/a'} | ${row.blockers.concat(row.warnings).join('<br>') || 'none'} |`).join('\n');
}

function buildMarkdown(report){
  return `# Stage 7 Reference Execution Candidate Trial

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

Candidate: \`${report.candidate.candidateId}\`

## Decision

Measurement keeper: ${report.summary.measurementKeeperRecommendation}

Runtime keeper: ${report.summary.runtimeKeeperRecommendation}

Ready for one runtime source candidate: ${report.summary.readyForRuntimeSourceCandidate}

${report.summary.read}

## Object-Track Read

Baseline total: ${report.baseline.totalObjectTrackScore10}/10, coverage ${report.baseline.totalObjectTrackCoverage}

Trial total: ${report.trial.totalObjectTrackScore10}/10, coverage ${report.trial.totalObjectTrackCoverage}

Delta: ${report.trial.deltas.totalObjectTrackScore10}/10, coverage ${report.trial.deltas.totalObjectTrackCoverage}

| Group | Trial family | Canonical family | Aggregate score | Aggregate delta | Primary score | Path ratio | Lower-field delta | Notes |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
${markdownTable(report.trial.groupResults)}

## Guardrails

- Spacing/readability pass: ${report.trial.spacingReadability.pass}; spacing ${report.trial.spacingReadability.spacingScore ?? 'n/a'}, bunching ${report.trial.spacingReadability.bunchingRisk ?? 'n/a'}
- Scoreable routes pass: ${report.trial.scoreableRoutes.pass}; score ${report.trial.scoreableRoutes.score10 ?? 'n/a'}, active windows ${report.trial.scoreableRoutes.activeWindows ?? 'n/a'}
- Safety pass: ${report.trial.safety.pass}; no shots ${report.trial.safety.noEnemyShots}, no attacks ${report.trial.safety.noAttackStarts}, no losses ${report.trial.safety.noShipLosses}

## Blockers

${report.summary.blockers.map(item => `- ${item}`).join('\n') || '- none'}
`;
}

function main(){
  const candidatePath = resolveCandidatePath(argValue('candidate', ''));
  const report = buildReport(candidatePath);
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${report.commit}-${report.candidate.candidateId}`;
  writeJson(path.join(OUT_ROOT, stamp, 'report.json'), report);
  writeText(path.join(OUT_ROOT, stamp, 'README.md'), buildMarkdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  writeText(path.join(OUT_ROOT, 'README.md'), buildMarkdown(report));
  console.log(JSON.stringify({
    ok: true,
    candidate: report.candidate.candidateId,
    report: rel(path.join(OUT_ROOT, 'latest.json')),
    readyForRuntimeSourceCandidate: report.summary.readyForRuntimeSourceCandidate,
    totalObjectTrackScore10: report.trial.totalObjectTrackScore10,
    totalObjectTrackCoverage: report.trial.totalObjectTrackCoverage,
    blockerCount: report.summary.blockerCount,
    blockers: report.summary.blockers.slice(0, 8)
  }, null, 2));
}

module.exports = {
  ROOT,
  OUT_ROOT,
  DEFAULT_CANDIDATE,
  buildMarkdown,
  buildReport,
  readJson,
  rel,
  writeJson,
  writeText
};

if(require.main === module){
  try{
    main();
  }catch(error){
    console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
    process.exit(1);
  }
}
