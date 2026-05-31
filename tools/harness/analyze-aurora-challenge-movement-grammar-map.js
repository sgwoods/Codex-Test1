#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const GAME_PACK = path.join(ROOT, 'src', 'js', '13-aurora-game-pack.js');
const MOVEMENT_GRAMMAR = path.join(ROOT, 'reference-artifacts', 'ingestion', 'movement-grammar', 'movement-grammar-0.1.json');
const TARGET_CONTRACTS = path.join(ROOT, 'reference-artifacts', 'ingestion', 'challenge-stage-target-contracts', 'aurora-challenge-contracts-0.1.json');
const TRAJECTORY_CONTROLS = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-trajectory-controls', 'latest.json');
const COMPILER_BRIDGE = path.join(ROOT, 'reference-artifacts', 'analyses', 'movement-grammar-compiler-bridge', 'latest.json');
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-challenge-movement-grammar-map');
const OUT = path.join(OUT_DIR, 'latest.json');

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function read(file){
  try{
    return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  }catch(err){
    fail('required source file could not be read', { file: rel(file), error: err.message });
  }
}

function readJson(file, fallback = null){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch{
    return fallback;
  }
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
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

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null;
}

function unique(values){
  return [...new Set(values.filter(value => value !== undefined && value !== null && value !== ''))];
}

function challengeStageDisplayLabel(stage){
  const marker = Number(stage);
  if(!Number.isFinite(marker)) return 'Challenging Stage interval pending';
  return `Challenging Stage ${Math.max(1, marker - 1)}-${marker}`;
}

function isWordChar(char){
  return /[A-Za-z0-9_$]/.test(char || '');
}

function findMatching(text, openIndex, openChar, closeChar){
  let depth = 0;
  let quote = '';
  let escaped = false;
  for(let i = openIndex; i < text.length; i += 1){
    const char = text[i];
    if(quote){
      if(escaped){
        escaped = false;
      }else if(char === '\\'){
        escaped = true;
      }else if(char === quote){
        quote = '';
      }
      continue;
    }
    if(char === '\'' || char === '"' || char === '`'){
      quote = char;
      continue;
    }
    if(char === openChar){
      depth += 1;
    }else if(char === closeChar){
      depth -= 1;
      if(depth === 0) return i;
    }
  }
  return -1;
}

function findPropertyIndex(block, key){
  const needle = `${key}:`;
  let index = block.indexOf(needle);
  while(index !== -1){
    if(!isWordChar(block[index - 1])) return index;
    index = block.indexOf(needle, index + needle.length);
  }
  return -1;
}

function extractPropertyExpression(block, key){
  const keyIndex = findPropertyIndex(block, key);
  if(keyIndex === -1) return null;
  let index = keyIndex + key.length + 1;
  while(/\s/.test(block[index] || '')) index += 1;

  let quote = '';
  let escaped = false;
  let parens = 0;
  let brackets = 0;
  let braces = 0;
  for(let i = index; i < block.length; i += 1){
    const char = block[i];
    if(quote){
      if(escaped){
        escaped = false;
      }else if(char === '\\'){
        escaped = true;
      }else if(char === quote){
        quote = '';
      }
      continue;
    }
    if(char === '\'' || char === '"' || char === '`'){
      quote = char;
      continue;
    }
    if(char === '(') parens += 1;
    if(char === ')') parens -= 1;
    if(char === '[') brackets += 1;
    if(char === ']') brackets -= 1;
    if(char === '{') braces += 1;
    if(char === '}') braces -= 1;
    if(char === ',' && parens === 0 && brackets === 0 && braces === 0){
      return block.slice(index, i).trim();
    }
  }
  return block.slice(index).replace(/\}\)?;?\s*$/, '').trim();
}

function evaluateExpression(expr, fallback = null){
  if(!expr) return fallback;
  try{
    return vm.runInNewContext(expr, { Object }, { timeout: 1000 });
  }catch{
    return fallback;
  }
}

function value(block, key, fallback = null){
  return evaluateExpression(extractPropertyExpression(block, key), fallback);
}

function splitLayoutBlocks(source){
  const marker = 'const AURORA_CHALLENGE_LAYOUTS=Object.freeze(';
  const markerIndex = source.indexOf(marker);
  if(markerIndex === -1) fail('AURORA_CHALLENGE_LAYOUTS could not be found in game pack');
  const arrayStart = source.indexOf('[', markerIndex);
  const arrayEnd = findMatching(source, arrayStart, '[', ']');
  if(arrayStart === -1 || arrayEnd === -1) fail('AURORA_CHALLENGE_LAYOUTS array could not be parsed');
  const arraySource = source.slice(arrayStart + 1, arrayEnd);
  const blocks = [];
  let searchIndex = 0;
  const objectMarker = 'Object.freeze({';
  while(searchIndex < arraySource.length){
    const start = arraySource.indexOf(objectMarker, searchIndex);
    if(start === -1) break;
    const braceStart = arraySource.indexOf('{', start);
    const braceEnd = findMatching(arraySource, braceStart, '{', '}');
    if(braceEnd === -1) fail('challenge layout block has unbalanced braces', { start });
    blocks.push(arraySource.slice(braceStart, braceEnd + 1));
    searchIndex = braceEnd + 1;
  }
  return blocks;
}

function extractLayouts(){
  return splitLayoutBlocks(read(GAME_PACK)).map((block, index) => {
    const fromStage = +value(block, 'fromStage');
    const groups = +value(block, 'groups', 0);
    const groupPathFamilies = value(block, 'groupPathFamilies', []);
    const groupVisualFamilies = value(block, 'groupVisualFamilies', []);
    const groupLaneTypes = value(block, 'groupLaneTypes', []);
    const groupReferencePathsExpr = extractPropertyExpression(block, 'groupReferencePaths');
    return {
      index,
      challengeNumber: index + 1,
      fromStage,
      id: value(block, 'id', ''),
      pathFamily: value(block, 'pathFamily', ''),
      groups,
      enemiesPerGroup: +value(block, 'enemiesPerGroup', 0),
      upperBandRatio: value(block, 'upperBandRatio', null),
      spawnOffsetX: value(block, 'spawnOffsetX', null),
      waveSpacingY: value(block, 'waveSpacingY', null),
      rowSpacingY: value(block, 'rowSpacingY', null),
      waveDelay: value(block, 'waveDelay', null),
      slotDelay: value(block, 'slotDelay', null),
      arcAmp: value(block, 'arcAmp', null),
      dropAmp: value(block, 'dropAmp', null),
      lowerFieldBias: value(block, 'lowerFieldBias', null),
      groupSpawnOffsets: value(block, 'groupSpawnOffsets', []),
      groupSpeedScales: value(block, 'groupSpeedScales', []),
      groupArcAmps: value(block, 'groupArcAmps', []),
      groupDropAmps: value(block, 'groupDropAmps', []),
      groupLowerFieldBiases: value(block, 'groupLowerFieldBiases', []),
      groupYOffsets: value(block, 'groupYOffsets', []),
      laneTypes: value(block, 'laneTypes', []),
      groupLaneTypes,
      groupVisualFamilies,
      groupPathFamilies: groupPathFamilies.length ? groupPathFamilies : Array.from({ length: groups }, () => value(block, 'pathFamily', '')),
      groupReferencePathsIdentifier: groupReferencePathsExpr && !groupReferencePathsExpr.startsWith('Object.freeze') ? groupReferencePathsExpr : null
    };
  });
}

function byStage(rows){
  return new Map((rows || []).map(row => [+row.stage || +row.fromStage, row]));
}

function contractByStage(artifact){
  return byStage(artifact?.contracts || []);
}

function trajectoryByStage(artifact){
  return byStage(artifact?.challenges || []);
}

function groupArrayValue(values, index, fallback = null){
  return Array.isArray(values) && values[index] !== undefined ? values[index] : fallback;
}

function pathMatchScore(current, target){
  if(!target.length) return null;
  let matches = 0;
  for(let i = 0; i < target.length; i += 1){
    if(current[i] === target[i]) matches += 1;
  }
  return round(10 * matches / target.length, 1);
}

function makePattern(layout, targetContract, trajectory){
  const targetGroups = Array.isArray(targetContract?.groups) ? targetContract.groups : [];
  const trajectoryGroups = Array.isArray(trajectory?.groups) ? trajectory.groups : [];
  const targetPathFamilies = targetGroups.map(group => group.pathFamily).filter(Boolean);
  const authoredPathFamilies = layout.groupPathFamilies || [];
  const seedPathFamilies = trajectory?.runtimeLayoutSeed?.groupPathFamilies || [];
  const targetVisualFamilies = targetGroups.map(group => (group.expectedFamilies || [])[0]).filter(Boolean);
  const referenceBackedGroupCount = trajectoryGroups.filter(group => group.referencePath).length;
  const groupCount = Math.max(layout.groups || 0, authoredPathFamilies.length, targetGroups.length, trajectoryGroups.length);
  const roleBindings = [];
  const phaseTimeline = [];
  const scoreWindows = [];
  const eventAnchors = [];
  const variationControls = [];

  for(let index = 0; index < groupCount; index += 1){
    const groupIndex = index + 1;
    const target = targetGroups[index] || {};
    const tracked = trajectoryGroups[index] || {};
    const lanes = groupArrayValue(layout.groupLaneTypes, index, layout.laneTypes || []);
    const spawnOffsetS = groupArrayValue(layout.groupSpawnOffsets, index, index * (layout.waveDelay || 0));
    const authoredPathFamily = groupArrayValue(authoredPathFamilies, index, layout.pathFamily || '');
    const visualFamily = groupArrayValue(layout.groupVisualFamilies, index, 'classic');
    roleBindings.push({
      groupIndex,
      pathIntent: authoredPathFamily,
      targetPathFamily: target.pathFamily || tracked.runtimePathFamilyHint || null,
      visualFamily,
      targetVisualFamily: (target.expectedFamilies || [])[0] || null,
      laneTypes: lanes,
      role: target.role || `runtime group ${groupIndex}`,
      targetEntrySide: target.entrySide || tracked.target?.entrySide || null,
      targetExitSide: target.exitSide || tracked.target?.exitSide || null
    });
    phaseTimeline.push({
      groupIndex,
      authoredSpawnOffsetS: spawnOffsetS,
      targetVisibleStartS: target.targetVisibleS?.[0] ?? tracked.target?.visibleStartS ?? null,
      targetVisibleEndS: target.targetVisibleS?.[1] ?? tracked.target?.visibleEndS ?? null,
      targetDurationS: tracked.runtimeControl?.durationS ?? null
    });
    scoreWindows.push({
      groupIndex,
      expected: target.scoreWindow || 'score-window pending',
      shotOpportunity: target.objectTrackTarget?.lowerFieldShare ?? tracked.target?.lowerFieldShare ?? null
    });
    eventAnchors.push({
      groupIndex,
      spawnOffsetS,
      referenceTrackId: tracked.referencePath?.sourceTrackId || null,
      targetTrackConfidence: tracked.confidence ?? null,
      targetPathLength: tracked.target?.pathLength ?? target.objectTrackTarget?.pathLength ?? null
    });
    variationControls.push({
      groupIndex,
      pathFamily: authoredPathFamily,
      speedScale: groupArrayValue(layout.groupSpeedScales, index, tracked.runtimeControl?.softSpeedScale ?? null),
      arcAmp: groupArrayValue(layout.groupArcAmps, index, layout.arcAmp),
      dropAmp: groupArrayValue(layout.groupDropAmps, index, layout.dropAmp),
      lowerFieldBias: groupArrayValue(layout.groupLowerFieldBiases, index, layout.lowerFieldBias),
      yOffset: groupArrayValue(layout.groupYOffsets, index, 0),
      visualFamily
    });
  }

  const pathScore = pathMatchScore(authoredPathFamilies, targetPathFamilies);
  const seedDrift = seedPathFamilies.length
    ? authoredPathFamilies.map((pathFamily, index) => ({
      groupIndex: index + 1,
      authoredPathFamily: pathFamily,
      trajectorySeedPathFamily: seedPathFamilies[index] || null,
      differs: pathFamily !== seedPathFamilies[index]
    })).filter(row => row.differs)
    : [];
  const gaps = [];
  if(!targetContract) gaps.push('No hand-authored target contract attached for this stage.');
  if(!trajectory) gaps.push('No trajectory-controls row attached for this stage.');
  if(pathScore !== null && pathScore < 10) gaps.push(`Authored group path order matches target contract at ${pathScore}/10.`);
  if(seedDrift.length) gaps.push(`Authored runtime layout differs from trajectory-control seed on ${seedDrift.length} group(s); analyzer seed should be refreshed after gameplay promotion.`);
  if(referenceBackedGroupCount < 5) gaps.push(`${referenceBackedGroupCount}/5 groups have reference-backed paths.`);

  return {
    id: `aurora-challenge-${String(layout.challengeNumber).padStart(2, '0')}-${layout.id}`,
    appliesTo: 'challenge-stage-set-piece',
    gameScope: {
      gameKey: 'aurora-galactica',
      stage: layout.fromStage,
      challengeNumber: layout.challengeNumber,
      stageLabel: challengeStageDisplayLabel(layout.stage)
    },
    runtimeLayout: layout,
    roleBindings,
    phaseTimeline,
    controlPoints: trajectoryGroups.flatMap((group, index) => {
      const points = group.referencePath?.points || [];
      if(!points.length) return [];
      const picks = [points[0], points[Math.floor(points.length / 2)], points[points.length - 1]].filter(Boolean);
      return picks.map(point => ({
        groupIndex: index + 1,
        t: point.t,
        x: point.x,
        y: point.y,
        sourceTrackId: group.referencePath.sourceTrackId
      }));
    }),
    scoreWindows,
    eventAnchors,
    variationControls,
    measurement: {
      sourceArtifacts: [
        rel(GAME_PACK),
        rel(MOVEMENT_GRAMMAR),
        fs.existsSync(TARGET_CONTRACTS) ? rel(TARGET_CONTRACTS) : null,
        fs.existsSync(TRAJECTORY_CONTROLS) ? rel(TRAJECTORY_CONTROLS) : null
      ].filter(Boolean),
      targetContractPresent: !!targetContract,
      trajectoryControlsPresent: !!trajectory,
      pathContractMatchScore10: pathScore,
      referenceBackedGroupCount,
      targetVideoObjectTrackFitScore10: trajectory?.currentSweepBestTargetVideoObjectFitScore10 ?? null,
      expectedScore10: trajectory?.currentSweepBestExpectedScore10 ?? null,
      controlReadiness10: trajectory?.controlReadiness10 ?? null,
      seedDrift,
      gaps
    },
    designerRead: targetContract?.targetRead || trajectory?.read || 'Current runtime layout mapped to movement grammar for review.',
    nextImplementationStep: gaps[0] || 'Ready for per-group movement scoring before the next gameplay tuning pass.'
  };
}

function updateMovementGrammarPlan(report){
  const artifact = readJson(MOVEMENT_GRAMMAR, null);
  if(!artifact || !Array.isArray(artifact.migrationPlan)) return;
  artifact.migrationPlan = artifact.migrationPlan.map(step => {
    if(step.step === 2){
      return Object.assign({}, step, {
        status: 'complete',
        target: `Generated ${report.summary.layoutCount} read-only Aurora challenge grammar map rows with ${report.summary.referenceBackedGroupCount}/${report.summary.expectedGroupCount} reference-backed groups.`
      });
    }
    return step;
  });
  artifact.nextBestStep = 'Use per-group target evidence to improve Stage 7 path-contract precision, then apply the same grammar loop to one regular formation-entry pilot.';
  writeJson(MOVEMENT_GRAMMAR, artifact);
}

function main(){
  const layouts = extractLayouts();
  const targetContracts = contractByStage(readJson(TARGET_CONTRACTS, { contracts: [] }));
  const trajectories = trajectoryByStage(readJson(TRAJECTORY_CONTROLS, { challenges: [] }));
  const patterns = layouts.map(layout => makePattern(layout, targetContracts.get(layout.fromStage), trajectories.get(layout.fromStage)));
  const referenceBackedGroupCount = patterns.reduce((sum, pattern) => sum + (pattern.measurement.referenceBackedGroupCount || 0), 0);
  const expectedGroupCount = patterns.reduce((sum, pattern) => sum + (pattern.runtimeLayout.groups || 0), 0);
  const scores = patterns.map(pattern => pattern.measurement.pathContractMatchScore10).filter(value => Number.isFinite(+value));
  const compilerBridge = readJson(COMPILER_BRIDGE, { summary: {} });
  const compilerBridgeReady = !!compilerBridge?.summary?.compilerBridgeReady;
  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-challenge-movement-grammar-map',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    gameKey: 'aurora-galactica',
    summary: {
      layoutCount: layouts.length,
      expectedGroupCount,
      referenceBackedGroupCount,
      targetContractRows: patterns.filter(pattern => pattern.measurement.targetContractPresent).length,
      trajectoryControlRows: patterns.filter(pattern => pattern.measurement.trajectoryControlsPresent).length,
      averagePathContractMatchScore10: round(average(scores), 1),
      compilerBridgeReady,
      nextStep: 'per-group-movement-scoring',
      read: 'Aurora challenge layouts are now normalized into a movement-grammar map. This exposes authored path order, visual family novelty, timing offsets, target-contract fit, and analyzer seed drift before more gameplay changes are promoted.'
    },
    measurementLimits: [
      'This artifact is a source/layout map, not a browser-backed runtime capture.',
      'Path-contract match checks group-family order only; exact path geometry still belongs to challenge-stage conformance and target object-track analyzers.',
      'Analyzer seed drift is informational because runtime code may intentionally be ahead of the latest trajectory-control seed.'
    ],
    sourceArtifacts: {
      gamePack: rel(GAME_PACK),
      movementGrammar: rel(MOVEMENT_GRAMMAR),
      targetContracts: fs.existsSync(TARGET_CONTRACTS) ? rel(TARGET_CONTRACTS) : null,
      trajectoryControls: fs.existsSync(TRAJECTORY_CONTROLS) ? rel(TRAJECTORY_CONTROLS) : null
    },
    patterns,
    nextBestStep: 'Use per-group target evidence to improve Stage 7 path-contract precision, then apply the same grammar loop to one regular formation-entry pilot.'
  };
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${report.commit}`;
  writeJson(path.join(OUT_DIR, stamp, 'report.json'), report);
  writeJson(OUT, report);
  updateMovementGrammarPlan(report);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    layouts: report.summary.layoutCount,
    referenceBackedGroups: `${referenceBackedGroupCount}/${expectedGroupCount}`,
    averagePathContractMatchScore10: report.summary.averagePathContractMatchScore10,
    nextStep: report.summary.nextStep
  }, null, 2));
}

main();
