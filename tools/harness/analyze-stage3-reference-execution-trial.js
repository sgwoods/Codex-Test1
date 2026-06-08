#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const DESCRIPTION = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-descriptions', 'aurora-stage3-challenge1-0.1.json');
const REFERENCE_REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-description', 'stage3-challenge1', 'latest.json');
const CHALLENGE_CONFORMANCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-conformance', 'latest.json');
const DEFAULT_CANDIDATE = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-candidate-trials', 'stage3-baseline-control-0.1.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-candidate-trials', 'stage3-challenge1');
const STAGE3_ROLE_EXPECTATIONS = [
  { groupIndex: 1, requiredRole: 'bee-line', requiredEntryCue: 'top-right', requiredExitGesture: 'left peel-off', read: 'top-right bee line' },
  { groupIndex: 4, requiredRole: 'butterfly-line', requiredEntryCue: 'top-left', requiredExitGesture: 'right peel-off', read: 'late top-left butterfly line' },
  { groupIndex: 5, requiredRole: 'mixed-closing-peel', requiredEntryCue: 'top-left', requiredExitGesture: 'lower-sides peel-off', read: 'closing peel-off exit' }
];

function argValue(name, fallback = ''){
  const prefix = `--${name}=`;
  const direct = process.argv.find(arg => arg.startsWith(prefix));
  if(direct) return direct.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if(index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

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

function firstFinite(...values){
  for(const value of values){
    if(Number.isFinite(+value)) return +value;
  }
  return null;
}

function firstObject(...values){
  return values.find(value => value && typeof value === 'object' && !Array.isArray(value)) || {};
}

function firstString(...values){
  for(const value of values){
    if(typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
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
  if(target === 'lower-sides' && (actual === 'left' || actual === 'right')) return 0.55;
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

function findStage3Conformance(report){
  const row = (report.stageRows || report.challengeStages || []).find(item => +item.stage === 3 || +item.challengeNumber === 1);
  if(!row) throw new Error('Missing Stage 3 / Challenge 1 row in challenge-stage conformance report.');
  return row;
}

function conformanceFitByGroup(conformanceRow){
  const fit = conformanceRow.strictAxisReads?.targetContractFit || conformanceRow.targetContractFit || {};
  const objectTrackFits = fit.objectTrackFits || [];
  return new Map(objectTrackFits.map(row => [+row.groupIndex, row]));
}

function groupSpec(candidate, groupIndex){
  const groups = Array.isArray(candidate.groups) ? candidate.groups : [];
  return groups.find(group => +group.groupIndex === +groupIndex) || null;
}

function vectorFromRuntime(runtime){
  const out = Object.assign({}, runtime || {});
  for(const key of ['visibleStartS', 'visibleEndS', 'xRange', 'yRange', 'pathLength', 'turnCount', 'reversalCount', 'lowerFieldShare']){
    if(Number.isFinite(+out[key])) out[key] = round(out[key], key.includes('S') ? 2 : 4);
  }
  return out;
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
  if(source.pathFamily) vector.pathFamily = source.pathFamily;
}

function applyGroupControls(baseVector, candidateGroup){
  const vector = Object.assign({}, baseVector || {});
  const explicitVector = firstObject(
    candidateGroup?.predictedRuntimeVector,
    candidateGroup?.runtimeVector,
    candidateGroup?.objectTrackVector,
    candidateGroup?.vector
  );
  const timing = firstObject(candidateGroup?.timing, candidateGroup?.phaseTiming);
  const controls = firstObject(candidateGroup?.controls, candidateGroup?.vectorOverrides, candidateGroup?.movement);
  const lower = firstObject(candidateGroup?.fieldOccupancy, candidateGroup?.lowerField, candidateGroup?.lowerFieldControls);

  applyNumericOverrides(vector, explicitVector);
  applyNumericOverrides(vector, controls);
  applyNumericOverrides(vector, candidateGroup || {});

  const phaseOffsetS = firstFinite(timing.phaseOffsetS, timing.phaseOffset, candidateGroup?.phaseOffsetS);
  if(phaseOffsetS !== null){
    if(Number.isFinite(+vector.visibleStartS)) vector.visibleStartS = +vector.visibleStartS + phaseOffsetS;
    if(Number.isFinite(+vector.visibleEndS)) vector.visibleEndS = +vector.visibleEndS + phaseOffsetS;
  }
  if(Number.isFinite(+timing.visibleStartS)) vector.visibleStartS = +timing.visibleStartS;
  if(Number.isFinite(+timing.visibleEndS)) vector.visibleEndS = +timing.visibleEndS;
  const lowerShare = firstFinite(lower.lowerFieldShare, lower.share, controls.lowerFieldShare, candidateGroup?.lowerFieldShare);
  const lowerDelta = firstFinite(lower.lowerFieldDelta, lower.delta, controls.lowerFieldDelta, candidateGroup?.lowerFieldDelta);
  if(lowerShare !== null) vector.lowerFieldShare = lowerShare;
  if(lowerDelta !== null && Number.isFinite(+vector.lowerFieldShare)) vector.lowerFieldShare = +vector.lowerFieldShare + lowerDelta;
  if(Number.isFinite(+vector.lowerFieldShare)) vector.lowerFieldShare = clamp(+vector.lowerFieldShare);

  for(const key of ['visibleStartS', 'visibleEndS', 'xRange', 'yRange', 'pathLength', 'turnCount', 'reversalCount', 'lowerFieldShare']){
    if(Number.isFinite(+vector[key])) vector[key] = round(vector[key], key.includes('S') ? 2 : 4);
  }
  return vector;
}

function guardrailSource(candidate, key){
  const guardrails = firstObject(candidate.guardrails);
  return firstObject(guardrails[key], candidate[key]);
}

function spacingRead(candidate){
  const source = guardrailSource(candidate, 'spacingReadability');
  const missing = !Object.keys(source).length;
  const blockers = [];
  if(missing) blockers.push('spacing/readability evidence is missing');
  if(!missing && source.pass === false) blockers.push('spacing/readability constraint did not pass');
  if(Number.isFinite(+source.bunchingRisk) && +source.bunchingRisk > 0.35) blockers.push(`bunching risk ${source.bunchingRisk} exceeds 0.35 trial floor`);
  if(Number.isFinite(+source.spacingScore) && +source.spacingScore < 0.65) blockers.push(`spacing score ${source.spacingScore} is below 0.65 trial floor`);
  return {
    source: source.source || null,
    pass: !missing && blockers.length === 0,
    preserveBaseline: source.preserveBaseline === true,
    spacingScore: Number.isFinite(+source.spacingScore) ? +source.spacingScore : null,
    bunchingRisk: Number.isFinite(+source.bunchingRisk) ? +source.bunchingRisk : null,
    worstMinDistance: Number.isFinite(+source.worstMinDistance) ? +source.worstMinDistance : null,
    averageMinDistance: Number.isFinite(+source.averageMinDistance) ? +source.averageMinDistance : null,
    blockers,
    read: source.read || null
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
  if(source.pass === false) blockers.push('scoreable-route evidence did not pass');
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
    blockers,
    read: source.read || baselineShot?.read || null
  };
}

function safetyRead(candidate, baselineSafety){
  const source = guardrailSource(candidate, 'safety');
  const preserve = source.preserveBaseline === true;
  const eventCounts = source.eventCounts || baselineSafety?.eventCounts || {};
  const noEnemyShots = source.noEnemyShots === true || (preserve && baselineSafety?.noEnemyShots === true);
  const noAttackStarts = source.noAttackStarts === true || (preserve && baselineSafety?.noAttackStarts === true);
  const noShipLosses = source.noShipLosses === true || (preserve && baselineSafety?.noShipLosses === true);
  const noChallengeContacts = source.noChallengeContacts === true || (preserve && +(eventCounts.challengeContacts || 0) === 0);
  const missing = !Object.keys(source).length;
  const blockers = [];
  if(missing) blockers.push('challenge safety evidence is missing');
  if(!noEnemyShots) blockers.push('enemy shots are not proven absent');
  if(!noAttackStarts) blockers.push('attack starts are not proven absent');
  if(!noShipLosses) blockers.push('ship losses are not proven absent');
  if(!noChallengeContacts) blockers.push('challenge contacts are not proven absent');
  return {
    source: source.source || null,
    pass: !missing && blockers.length === 0,
    preserveBaseline: preserve,
    noEnemyShots,
    noAttackStarts,
    noShipLosses,
    noChallengeContacts,
    eventCounts,
    blockers
  };
}

function expectedSideFromGesture(gesture){
  const text = String(gesture || '').toLowerCase();
  if(text.includes('lower-sides')) return 'lower-sides';
  if(text.includes('top-right') || text.includes('right')) return 'right';
  if(text.includes('top-left') || text.includes('left')) return 'left';
  if(text.includes('center')) return 'center';
  return '';
}

function semanticOverride(candidateGroup, key){
  const semantic = firstObject(candidateGroup?.semanticExecution, candidateGroup?.semantic);
  return firstString(semantic[key], candidateGroup?.[key]);
}

function scoreSemanticGroup({ descriptionGroup, candidateGroup, vector, safety, scoreable }){
  const semantic = descriptionGroup.semanticExecution || {};
  const provenance = descriptionGroup.uncertaintyAndProvenance || {};
  const field = descriptionGroup.fieldOccupancyExpectation || {};
  const expectedRole = semantic.lineRole || '';
  const expectedEntry = semantic.entryCue || '';
  const expectedExitGesture = semantic.exitGesture || '';
  const expectedScoreBand = semantic.scoreableBand || '';
  const candidateRole = semanticOverride(candidateGroup, 'lineRole') || expectedRole;
  const candidateEntry = semanticOverride(candidateGroup, 'entryCue') || expectedEntry;
  const candidateExitGesture = semanticOverride(candidateGroup, 'exitGesture') || expectedExitGesture;
  const candidateScoreBand = semanticOverride(candidateGroup, 'scoreableBand') || expectedScoreBand;
  const directConfidence = provenance.directPathLabel === true ? 1 : 0.78;
  const inferredWarning = provenance.directPathLabel === true ? null : 'semantic role is inferred rather than directly accepted from a path label';
  const lineRolePass = !!expectedRole && candidateRole === expectedRole;
  const entryCuePass = !!expectedEntry && candidateEntry === expectedEntry;
  const scoreBandPass = candidateScoreBand === 'upper-band';
  const noCombatDeclared = semantic.noCombatGrammar
    && semantic.noCombatGrammar.enemyShots === 'forbidden'
    && semantic.noCombatGrammar.attackStarts === 'forbidden'
    && semantic.noCombatGrammar.shipLosses === 'forbidden';
  const expectedExitSide = expectedSideFromGesture(expectedExitGesture);
  const runtimeExitSide = vector?.exitSide || '';
  const exitSideScore = expectedExitSide ? sideCompatibility(runtimeExitSide, expectedExitSide) : 0.5;
  const exitGesturePass = candidateExitGesture === expectedExitGesture;
  const scoreableFrameWindow = semantic.scoreableFrameWindow || null;
  const hasScoreableFrameWindow = !!scoreableFrameWindow || provenance.directPathLabel === false;
  const fieldConflict = field.conflictBetweenHumanLabelAndCpuTrack === true;
  const lineRoleScore = lineRolePass ? directConfidence : 0;
  const upperBandScore = clamp(
    (scoreBandPass ? 0.34 : 0)
    + (scoreable.pass ? 0.34 : 0)
    + (hasScoreableFrameWindow ? 0.18 : 0)
    + (fieldConflict ? 0.1 : 0.14)
  );
  const peelOffScore = clamp((exitGesturePass ? 0.64 : 0) + (exitSideScore * 0.36));
  const routeLearnabilityScore = clamp(
    (lineRolePass ? 0.2 : 0)
    + (entryCuePass ? 0.15 : 0)
    + (exitGesturePass ? 0.15 : 0)
    + (scoreable.pass ? 0.25 : 0)
    + (safety.pass ? 0.25 : 0)
  );
  const noCombatScore = noCombatDeclared && safety.pass ? 1 : 0;
  const semanticScore = round(average([
    lineRoleScore,
    upperBandScore,
    peelOffScore,
    routeLearnabilityScore,
    noCombatScore
  ]), 3);
  const warnings = [];
  if(inferredWarning) warnings.push(inferredWarning);
  if(!lineRolePass) warnings.push(`candidate role ${candidateRole || 'missing'} does not preserve RED role ${expectedRole || 'missing'}`);
  if(!entryCuePass) warnings.push(`candidate entry cue ${candidateEntry || 'missing'} does not preserve RED cue ${expectedEntry || 'missing'}`);
  if(exitSideScore < 0.6) warnings.push(`runtime exit side ${runtimeExitSide || 'missing'} does not clearly read as ${expectedExitGesture || 'the RED exit gesture'}`);
  if(fieldConflict) warnings.push('human upper-band scoreability conflicts with CPU lower-field occupancy; keep both metrics visible');
  return {
    lineRolePreservation: {
      expectedRole,
      candidateRole,
      directReferenceLabel: provenance.directPathLabel === true,
      pass: lineRolePass,
      score: round(lineRoleScore, 3)
    },
    upperBandScoreability: {
      expectedScoreBand,
      candidateScoreBand,
      scoreableRoutesPass: scoreable.pass,
      hasScoreableFrameWindow,
      fieldOccupancyConflict: fieldConflict,
      pass: scoreBandPass && scoreable.pass,
      score: round(upperBandScore, 3)
    },
    peelOffReadability: {
      expectedExitGesture,
      candidateExitGesture,
      runtimeExitSide,
      expectedExitSide,
      exitSideScore: round(exitSideScore, 3),
      pass: exitGesturePass && exitSideScore >= 0.55,
      score: round(peelOffScore, 3)
    },
    routeLearnability: {
      entryCue: expectedEntry,
      candidateEntryCue: candidateEntry,
      scoreableRoutesPass: scoreable.pass,
      noCombatPass: safety.pass,
      pass: routeLearnabilityScore >= 0.7,
      score: round(routeLearnabilityScore, 3)
    },
    noCombatGrammar: {
      declared: !!noCombatDeclared,
      safetyPass: safety.pass,
      pass: noCombatDeclared && safety.pass,
      score: noCombatScore
    },
    semanticScore,
    warnings
  };
}

function scoreGroup({ descriptionGroup, referenceRead, baselineFit, candidateGroup, safety, scoreable }){
  const baselineRuntime = vectorFromRuntime(baselineFit?.runtime || {});
  const vector = applyGroupControls(baselineRuntime, candidateGroup || {});
  const candidatePathFamily = firstString(
    candidateGroup?.pathFamily,
    candidateGroup?.groupPathFamily,
    candidateGroup?.canonicalPathFamily,
    candidateGroup?.referencePath?.pathFamily,
    vector.pathFamily,
    baselineFit?.runtime?.pathFamily,
    descriptionGroup.pathFamilyDecision?.runtimeCurrentFamily,
    descriptionGroup.canonicalComparisonPathFamily
  );
  vector.pathFamily = candidatePathFamily || null;
  const aggregateTarget = descriptionGroup.aggregateObjectTrackTarget || baselineFit?.target || {};
  const primaryTarget = descriptionGroup.primaryObjectTrackTarget || {};
  const aggregateFit = compareTrackVector(vector, aggregateTarget);
  const primaryFit = compareTrackVector(vector, primaryTarget);
  const gate = descriptionGroup.candidateComparisonGate || {};
  const semantic = scoreSemanticGroup({ descriptionGroup, candidateGroup, vector, safety, scoreable });
  const canonical = descriptionGroup.canonicalComparisonPathFamily || gate.canonicalPathFamily || '';
  const pathFamilyAuthorityConflicts = descriptionGroup.pathFamilyDecision?.targetConformanceDebt || [];
  const aggregateLowerFieldDelta = Number.isFinite(+vector.lowerFieldShare) && Number.isFinite(+aggregateTarget.lowerFieldShare)
    ? round(+vector.lowerFieldShare - +aggregateTarget.lowerFieldShare, 3)
    : null;
  const humanLowerFieldDelta = Number.isFinite(+vector.lowerFieldShare) && Number.isFinite(+descriptionGroup.fieldOccupancyExpectation?.humanLabelLowerFieldShare)
    ? round(+vector.lowerFieldShare - +descriptionGroup.fieldOccupancyExpectation.humanLabelLowerFieldShare, 3)
    : null;
  const aggregatePathLengthRatio = Number.isFinite(+vector.pathLength) && Number.isFinite(+aggregateTarget.pathLength) && +aggregateTarget.pathLength > 0
    ? round(+vector.pathLength / +aggregateTarget.pathLength, 2)
    : null;
  const primaryPathLengthRatio = Number.isFinite(+vector.pathLength) && Number.isFinite(+primaryTarget.pathLength) && +primaryTarget.pathLength > 0
    ? round(+vector.pathLength / +primaryTarget.pathLength, 2)
    : null;
  const blockers = [];
  const warnings = [];
  if(canonical && candidatePathFamily !== canonical) blockers.push(`path family ${candidatePathFamily || 'missing'} does not match RED canonical ${canonical}`);
  if(!semantic.lineRolePreservation.pass) blockers.push('semantic line role is not preserved');
  if(!semantic.upperBandScoreability.pass) blockers.push('upper-band scoreability is not preserved');
  if(!semantic.noCombatGrammar.pass) blockers.push('no-combat grammar is not preserved');
  if(aggregateFit && aggregateFit.score10 < (gate.aggregateObjectTrackFitFloorScore10 || 5)) warnings.push(`aggregate object-track score ${aggregateFit.score10}/10 is below the first RED trial floor`);
  if(primaryFit && primaryFit.score10 < (gate.primaryObjectTrackFitFloorScore10 || 5)) warnings.push(`primary object-track score ${primaryFit.score10}/10 is below the first RED trial floor`);
  if(aggregatePathLengthRatio !== null && aggregatePathLengthRatio > (gate.maxAggregatePathLengthRatio || 3)) warnings.push(`aggregate path-length ratio ${aggregatePathLengthRatio} exceeds the first RED trial floor`);
  if(primaryPathLengthRatio !== null && primaryPathLengthRatio > (gate.maxPrimaryPathLengthRatio || 3)) warnings.push(`primary path-length ratio ${primaryPathLengthRatio} exceeds the first RED trial floor`);
  if(pathFamilyAuthorityConflicts.length) warnings.push(`authority conflict: ${pathFamilyAuthorityConflicts.join('; ')}`);
  for(const warning of semantic.warnings) warnings.push(warning);

  return {
    groupIndex: descriptionGroup.groupIndex,
    phaseId: descriptionGroup.phaseId,
    touchedByCandidate: !!candidateGroup,
    lineRole: descriptionGroup.semanticExecution?.lineRole || null,
    directReferenceLabel: descriptionGroup.uncertaintyAndProvenance?.directPathLabel === true,
    canonicalComparisonPathFamily: canonical || null,
    candidatePathFamily: candidatePathFamily || null,
    canonicalPathFamilyMatch: canonical && candidatePathFamily ? candidatePathFamily === canonical : false,
    pathFamilyAuthorityConflicts,
    aggregateObjectTrackScore10: aggregateFit?.score10 ?? null,
    aggregateObjectTrackCoverage: aggregateFit?.coverage ?? null,
    primaryObjectTrackScore10: primaryFit?.score10 ?? null,
    primaryObjectTrackCoverage: primaryFit?.coverage ?? null,
    baselineAggregateObjectTrackScore10: baselineFit?.score10 ?? referenceRead?.objectScore ?? null,
    baselineAggregateObjectTrackCoverage: baselineFit?.coverage ?? null,
    semantic,
    fieldOccupancyTension: {
      humanVisibleRead: {
        scoreableBand: descriptionGroup.semanticExecution?.scoreableBand || null,
        humanLabelLowerFieldShare: round(descriptionGroup.fieldOccupancyExpectation?.humanLabelLowerFieldShare, 4),
        upperBandEmphasis: round(descriptionGroup.fieldOccupancyExpectation?.upperBandEmphasis, 3),
        expectedPrimaryBand: descriptionGroup.fieldOccupancyExpectation?.expectedPrimaryBand || null
      },
      cpuGeometryRead: {
        runtimeLowerFieldShare: round(vector.lowerFieldShare, 4),
        aggregateObjectTrackLowerFieldShare: round(descriptionGroup.fieldOccupancyExpectation?.aggregateObjectTrackLowerFieldShare, 4),
        primaryObjectTrackLowerFieldShare: round(descriptionGroup.fieldOccupancyExpectation?.primaryObjectTrackLowerFieldShare, 4),
        runtimeMinusHumanLowerFieldShare: humanLowerFieldDelta,
        runtimeMinusAggregateLowerFieldShare: aggregateLowerFieldDelta
      },
      conflictBetweenHumanLabelAndCpuTrack: descriptionGroup.fieldOccupancyExpectation?.conflictBetweenHumanLabelAndCpuTrack === true,
      conflictRead: descriptionGroup.fieldOccupancyExpectation?.conflictRead || null
    },
    deviations: {
      aggregatePathLengthRatio,
      primaryPathLengthRatio,
      aggregateLowerFieldDelta,
      humanLowerFieldDelta,
      visibleStartDeltaS: Number.isFinite(+vector.visibleStartS) && Number.isFinite(+aggregateTarget.visibleStartS) ? round(+vector.visibleStartS - +aggregateTarget.visibleStartS, 2) : null,
      visibleEndDeltaS: Number.isFinite(+vector.visibleEndS) && Number.isFinite(+aggregateTarget.visibleEndS) ? round(+vector.visibleEndS - +aggregateTarget.visibleEndS, 2) : null
    },
    candidateVector: vector,
    appliedControls: candidateGroup || null,
    uncertaintyAndProvenance: descriptionGroup.uncertaintyAndProvenance || null,
    candidateFocus: referenceRead?.candidateFocus || [],
    blockers,
    warnings
  };
}

function semanticScores(groupResults){
  const rows = groupResults.map(group => group.semantic);
  return {
    overallSemanticScore: round(average(rows.map(row => row.semanticScore)), 3),
    lineRolePreservation: round(average(rows.map(row => row.lineRolePreservation.score)), 3),
    upperBandScoreability: round(average(rows.map(row => row.upperBandScoreability.score)), 3),
    peelOffReadability: round(average(rows.map(row => row.peelOffReadability.score)), 3),
    routeLearnability: round(average(rows.map(row => row.routeLearnability.score)), 3),
    noCombatGrammarPreservation: round(average(rows.map(row => row.noCombatGrammar.score)), 3),
    primitiveRows: rows
  };
}

function pathFamilyOrderRead(description, groupResults){
  const redOrder = (description.groups || []).map(group => group.canonicalComparisonPathFamily || null);
  const candidateOrder = groupResults.map(group => group.candidatePathFamily || null);
  const runtimeOrder = (description.groups || []).map(group => group.pathFamilyDecision?.runtimeCurrentFamily || null);
  const authorityConflicts = groupResults.flatMap(group => group.pathFamilyAuthorityConflicts.map(conflict => ({
    groupIndex: group.groupIndex,
    conflict
  })));
  return {
    redCanonicalOrder: redOrder,
    runtimeCurrentOrder: runtimeOrder,
    candidateOrder,
    candidateMatchesRedOrder: redOrder.every((family, index) => !family || family === candidateOrder[index]),
    runtimeMatchesRedOrder: redOrder.every((family, index) => !family || family === runtimeOrder[index]),
    authorityConflicts,
    conflictCount: authorityConflicts.length
  };
}

function fieldOccupancyReport(groupResults){
  const rows = groupResults.map(group => ({
    groupIndex: group.groupIndex,
    lineRole: group.lineRole,
    humanVisibleRead: group.fieldOccupancyTension.humanVisibleRead,
    cpuGeometryRead: group.fieldOccupancyTension.cpuGeometryRead,
    conflictBetweenHumanLabelAndCpuTrack: group.fieldOccupancyTension.conflictBetweenHumanLabelAndCpuTrack,
    conflictRead: group.fieldOccupancyTension.conflictRead
  }));
  return {
    rows,
    conflictCount: rows.filter(row => row.conflictBetweenHumanLabelAndCpuTrack).length,
    policy: 'Report lower-field geometry beside human-visible upper-band scoreability; do not make lowerFieldShare the dominant scoring primitive when the RED says the player-visible phrase is upper-band scoreable.'
  };
}

function strictWeakRows(groupResults){
  return groupResults
    .map(group => {
      const reasons = [];
      if((group.aggregateObjectTrackScore10 || 0) < 5) reasons.push(`aggregate object-track ${group.aggregateObjectTrackScore10}/10 below floor`);
      if((group.primaryObjectTrackScore10 || 0) < 5) reasons.push(`primary object-track ${group.primaryObjectTrackScore10}/10 below floor`);
      if(group.pathFamilyAuthorityConflicts.length) reasons.push('target-vs-runtime authority conflict exists');
      if(group.fieldOccupancyTension.conflictBetweenHumanLabelAndCpuTrack) reasons.push('human-vs-CPU field occupancy conflict exists');
      if((group.semantic?.semanticScore || 0) < 0.7) reasons.push(`semantic score ${group.semantic?.semanticScore} below 0.70`);
      return reasons.length ? {
        groupIndex: group.groupIndex,
        lineRole: group.lineRole,
        reasons,
        candidateFocus: group.candidateFocus
      } : null;
    })
    .filter(Boolean);
}

function reuseReport(){
  return {
    reusableRedTrialMechanics: [
      'external candidate input with non-overwriting predicted runtime vectors',
      'RED artifact loading and group-by-group comparison',
      'object-track fit against aggregate and primary target vectors',
      'guardrail normalization for spacing/readability, scoreable routes, and challenge safety',
      'path-family order and authority-conflict reporting',
      'field-occupancy tension rows that keep human-visible and CPU/geometry reads separate',
      'process-keeper vs runtime-keeper separation'
    ],
    stage3SpecificSemanticExpectations: STAGE3_ROLE_EXPECTATIONS,
    explicitAuthorityLayerInputs: [
      'Stage 3 RED target-conformance authority',
      'current challenge-stage conformance live runtime read',
      'candidate-provided guardrail provenance',
      'private-artifact provenance caveat'
    ],
    temporaryStage3Code: [
      'the top-right bee-line and late top-left butterfly-line expectations are currently declared in this analyzer until the RED schema owns reusable role contracts',
      'upper-band scoreability scoring is Stage 3-specific because Stage 7 used lower-field timing pressure as the dominant semantic issue',
      'peel-off readability uses simple entry/exit-side compatibility until a reusable gesture vocabulary exists'
    ],
    abstractionNeededToRemoveBespokeLogic: [
      'stage-parameterized RED trial core that takes scope and RED path as inputs',
      'schema-owned semantic role contracts with role-specific scoring plugins',
      'common authority-layer report builder for RED target authority vs live promotion authority',
      'shared human-visible vs CPU-geometry metric policy'
    ]
  };
}

function candidateInputFormat(){
  return {
    artifactType: 'stage3-reference-execution-candidate-trial-input',
    requiredTopLevelFields: ['candidateId', 'scope', 'intent', 'authorityLayerInputs', 'guardrails', 'groups'],
    optionalGroupControls: [
      'semanticExecution.lineRole',
      'semanticExecution.entryCue',
      'semanticExecution.exitGesture',
      'semanticExecution.scoreableBand',
      'pathFamily',
      'predictedRuntimeVector',
      'timing.phaseOffsetS',
      'fieldOccupancy.lowerFieldShare',
      'fieldOccupancy.lowerFieldDelta'
    ],
    invariantFields: [
      'semanticMetrics.preserveLineRoles',
      'semanticMetrics.preserveUpperBandScoreability',
      'semanticMetrics.preservePeelOffReadability',
      'semanticMetrics.preserveRouteLearnability',
      'semanticMetrics.preserveNoCombatGrammar'
    ],
    note: 'Candidate inputs are predictions for the trial gate only; they do not overwrite runtime source or canonical RED artifacts.'
  };
}

function buildReport(candidatePath){
  const candidate = readJson(candidatePath);
  const description = readJson(DESCRIPTION);
  const referenceReport = readJson(REFERENCE_REPORT);
  const conformance = readJson(CHALLENGE_CONFORMANCE);
  const stage3 = findStage3Conformance(conformance);
  const fits = conformanceFitByGroup(stage3);
  const referenceReads = new Map((referenceReport.groupReads || []).map(read => [+read.groupIndex, read]));
  const spacing = spacingRead(candidate);
  const scoreable = scoreableRead(candidate, stage3.shotOpportunityProbe || stage3.strictAxisReads?.shotOpportunity || {});
  const safety = safetyRead(candidate, stage3.safetyProbe || {});
  const groupResults = (description.groups || []).map(descriptionGroup => scoreGroup({
    descriptionGroup,
    referenceRead: referenceReads.get(+descriptionGroup.groupIndex) || {},
    baselineFit: fits.get(+descriptionGroup.groupIndex) || {},
    candidateGroup: groupSpec(candidate, +descriptionGroup.groupIndex),
    safety,
    scoreable
  }));
  const coverage = round(average(groupResults.map(group => group.aggregateObjectTrackCoverage)), 3);
  const score10 = round(1 + coverage * 7.4, 1);
  const baselineScore10 = +stage3.targetVideoObjectTrackFitScore10 || +(stage3.strictAxisReads?.targetContractFit?.objectTrackFitScore10 || 0);
  const baselineCoverage = +stage3.targetVideoObjectTrackCoverage || +(stage3.strictAxisReads?.targetContractFit?.objectTrackCoverage || 0);
  const semantic = semanticScores(groupResults);
  const pathFamily = pathFamilyOrderRead(description, groupResults);
  const fieldOccupancy = fieldOccupancyReport(groupResults);
  const weakRows = strictWeakRows(groupResults);
  const trialBlockers = [];
  const trialWarnings = [];
  if(!spacing.pass) trialBlockers.push(...spacing.blockers.map(item => `spacing/readability: ${item}`));
  if(!scoreable.pass) trialBlockers.push(...scoreable.blockers.map(item => `scoreable routes: ${item}`));
  if(!safety.pass) trialBlockers.push(...safety.blockers.map(item => `safety: ${item}`));
  if(semantic.overallSemanticScore < +(candidate.gates?.minSemanticScore || 0.7)){
    trialBlockers.push(`semantic score ${semantic.overallSemanticScore} below candidate gate ${candidate.gates?.minSemanticScore || 0.7}`);
  }
  if(semantic.routeLearnability < +(candidate.gates?.minRouteLearnabilityScore || 0.7)){
    trialBlockers.push(`route learnability score ${semantic.routeLearnability} below candidate gate ${candidate.gates?.minRouteLearnabilityScore || 0.7}`);
  }
  for(const group of groupResults){
    for(const blocker of group.blockers) trialBlockers.push(`group ${group.groupIndex}: ${blocker}`);
    for(const warning of group.warnings) trialWarnings.push(`group ${group.groupIndex}: ${warning}`);
  }
  const processKeeper = groupResults.length === 5
    && spacing.pass
    && scoreable.pass
    && safety.pass
    && semantic.overallSemanticScore >= 0.7
    && candidate.gates?.requireNoRuntimeSourceEdits === true;
  const generatedAt = new Date().toISOString();
  return {
    schemaVersion: 1,
    artifactType: 'stage3-reference-execution-candidate-trial',
    generatedAt,
    generatedBy: 'tools/harness/analyze-stage3-reference-execution-trial.js',
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
      candidate: rel(candidatePath),
      referenceExecutionDescription: rel(DESCRIPTION),
      referenceExecutionAnalysis: rel(REFERENCE_REPORT),
      challengeStageConformance: rel(CHALLENGE_CONFORMANCE)
    },
    candidate: {
      candidateId: candidate.candidateId || path.basename(candidatePath, '.json'),
      artifactType: candidate.artifactType || null,
      intent: candidate.intent || null,
      externalInputAccepted: true,
      nonOverwriting: true,
      touchedGroups: groupResults.filter(group => group.touchedByCandidate).map(group => group.groupIndex),
      inputFormat: candidateInputFormat()
    },
    baseline: {
      totalObjectTrackScore10: baselineScore10,
      totalObjectTrackCoverage: baselineCoverage,
      groupScores: groupResults.map(group => ({
        groupIndex: group.groupIndex,
        aggregateObjectTrackScore10: group.baselineAggregateObjectTrackScore10,
        aggregateObjectTrackCoverage: group.baselineAggregateObjectTrackCoverage
      })),
      scoreableRoutes: stage3.shotOpportunityProbe || null,
      safety: stage3.safetyProbe || null
    },
    trial: {
      totalObjectTrackScore10: score10,
      totalObjectTrackCoverage: coverage,
      deltas: {
        totalObjectTrackScore10: round(score10 - baselineScore10, 2),
        totalObjectTrackCoverage: round(coverage - baselineCoverage, 3)
      },
      groupResults,
      semanticScores: semantic,
      pathFamilyOrder: pathFamily,
      fieldOccupancyTension: fieldOccupancy,
      spacingReadability: spacing,
      scoreableRoutes: scoreable,
      safety,
      noCombatGrammar: {
        pass: safety.pass && semantic.noCombatGrammarPreservation === 1,
        score: semantic.noCombatGrammarPreservation
      },
      strictWeakRows: weakRows
    },
    reuseReport: reuseReport(),
    metricsAuthorityReport: {
      humanVsCpuConflictCount: fieldOccupancy.conflictCount,
      targetVsRuntimeAuthorityConflictCount: pathFamily.conflictCount,
      aggregateScorePolicy: 'Aggregate object-track score is reported for continuity, but source readiness is blocked by strict weak rows and semantic guardrails.',
      humanVisibleSemantics: [
        'line-role preservation',
        'upper-band scoreability',
        'peel-off readability',
        'route learnability',
        'no-combat grammar preservation'
      ],
      cpuGeometryMetrics: [
        'aggregate and primary object-track fit',
        'path-family order',
        'lower-field share and field occupancy',
        'spacing/readability guardrail'
      ],
      knownPrivateArtifactCaveat: candidate.authorityLayerInputs?.knownPrivateArtifactCaveat || null,
      authoritySeparation: candidate.authorityLayerInputs?.authoritySeparation || 'RED target-conformance and live runtime promotion remain separate.'
    },
    summary: {
      measurementKeeperRecommendation: processKeeper ? 'accept-process-keeper' : 'reject-process-keeper',
      runtimeKeeperRecommendation: 'not-a-runtime-keeper',
      readyForRuntimeSourceCandidate: false,
      sourceCandidateGenerationAllowed: false,
      baselineControlEvaluated: candidate.intent?.kind === 'baseline-control',
      blockerCount: trialBlockers.length,
      warningCount: trialWarnings.length,
      blockers: trialBlockers,
      warnings: trialWarnings,
      strictWeakRowCount: weakRows.length,
      read: processKeeper
        ? 'The Stage 3 non-overwriting trial gate cleanly evaluates the baseline-control candidate and exposes semantic, authority, and metric debt without runtime source edits.'
        : 'The Stage 3 trial gate did not satisfy the process-keeper requirements; refine the RED schema or gate before candidate generation.'
    },
    nextBestStep: processKeeper
      ? 'Build the next Stage 3 semantic candidate-batch layer against this trial gate, keeping candidate generation non-overwriting and preserving no-combat, scoreability, spacing/readability, and authority separation.'
      : 'Refine the Stage 3 RED language and reusable trial mechanics before generating candidate variants.'
  };
}

function markdownTable(rows){
  return rows.map(row => `| ${row.groupIndex} | ${row.lineRole || 'n/a'} | ${row.candidatePathFamily || 'n/a'} | ${row.canonicalComparisonPathFamily || 'n/a'} | ${row.aggregateObjectTrackScore10 ?? 'n/a'} | ${row.semantic.semanticScore ?? 'n/a'} | ${row.fieldOccupancyTension.conflictBetweenHumanLabelAndCpuTrack} | ${row.blockers.concat(row.warnings).join('<br>') || 'none'} |`).join('\n');
}

function buildMarkdown(report){
  return `# Stage 3 Reference Execution Candidate Trial

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

Candidate: \`${report.candidate.candidateId}\`

## Decision

Measurement/process keeper: ${report.summary.measurementKeeperRecommendation}

Runtime keeper: ${report.summary.runtimeKeeperRecommendation}

Ready for runtime source candidate: ${report.summary.readyForRuntimeSourceCandidate}

${report.summary.read}

## Scores

Baseline object-track: ${report.baseline.totalObjectTrackScore10}/10, coverage ${report.baseline.totalObjectTrackCoverage}

Trial object-track: ${report.trial.totalObjectTrackScore10}/10, coverage ${report.trial.totalObjectTrackCoverage}

Semantic overall: ${report.trial.semanticScores.overallSemanticScore}

- Line-role preservation: ${report.trial.semanticScores.lineRolePreservation}
- Upper-band scoreability: ${report.trial.semanticScores.upperBandScoreability}
- Peel-off readability: ${report.trial.semanticScores.peelOffReadability}
- Route learnability: ${report.trial.semanticScores.routeLearnability}
- No-combat grammar: ${report.trial.semanticScores.noCombatGrammarPreservation}

| Group | Role | Candidate family | RED family | Object score | Semantic score | Human/CPU occupancy conflict | Notes |
| ---: | --- | --- | --- | ---: | ---: | --- | --- |
${markdownTable(report.trial.groupResults)}

## Guardrails

- Spacing/readability pass: ${report.trial.spacingReadability.pass}; spacing ${report.trial.spacingReadability.spacingScore ?? 'n/a'}, bunching ${report.trial.spacingReadability.bunchingRisk ?? 'n/a'}
- Scoreable routes pass: ${report.trial.scoreableRoutes.pass}; score ${report.trial.scoreableRoutes.score10 ?? 'n/a'}, active windows ${report.trial.scoreableRoutes.activeWindows ?? 'n/a'}
- Safety pass: ${report.trial.safety.pass}; no shots ${report.trial.safety.noEnemyShots}, no attacks ${report.trial.safety.noAttackStarts}, no losses ${report.trial.safety.noShipLosses}, no contacts ${report.trial.safety.noChallengeContacts}

## Authority And Metric Debt

- Human-vs-CPU field conflict rows: ${report.metricsAuthorityReport.humanVsCpuConflictCount}
- Target-vs-runtime authority conflict rows: ${report.metricsAuthorityReport.targetVsRuntimeAuthorityConflictCount}
- Strict weak rows: ${report.summary.strictWeakRowCount}

${report.trial.strictWeakRows.map(row => `- Group ${row.groupIndex}: ${row.reasons.join('; ')}`).join('\n') || '- none'}

## Reuse Read

Reusable mechanics:
${report.reuseReport.reusableRedTrialMechanics.map(item => `- ${item}`).join('\n')}

Temporary Stage 3 code:
${report.reuseReport.temporaryStage3Code.map(item => `- ${item}`).join('\n')}

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
    report: rel(path.join(OUT_ROOT, 'latest.json')),
    candidate: report.candidate.candidateId,
    processKeeper: report.summary.measurementKeeperRecommendation,
    runtimeKeeper: report.summary.runtimeKeeperRecommendation,
    semanticScore: report.trial.semanticScores.overallSemanticScore,
    totalObjectTrackScore10: report.trial.totalObjectTrackScore10,
    strictWeakRows: report.summary.strictWeakRowCount,
    blockerCount: report.summary.blockerCount
  }, null, 2));
}

try{
  main();
}catch(error){
  console.error(JSON.stringify({ ok: false, message: error.message, stack: error.stack }, null, 2));
  process.exit(1);
}
