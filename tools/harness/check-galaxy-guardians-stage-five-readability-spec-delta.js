#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'stage-five-lower-field-readability-spec-delta-0.1.json');
const MARKDOWN = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'stage-five-lower-field-readability-spec-delta-0.1.md');
const STAGE_FIVE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'stage-five-galaxian-closeness-0.1.json');
const GAME_SPEC = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'game-spec-language-0.1.json');
const PACKAGE_JSON = path.join(ROOT, 'package.json');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function read(file){
  return fs.readFileSync(file, 'utf8');
}

function readJson(file){
  return JSON.parse(read(file));
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function finite(value){
  return Number.isFinite(+value);
}

function mustExist(relPath, payload){
  if(!relPath || !fs.existsSync(path.join(ROOT, relPath))){
    fail(`Stage-five readability spec delta cites missing evidence: ${relPath || '(empty)'}`, payload);
  }
}

function requireIncludes(label, rows, required){
  const missing = required.filter(item => !rows.includes(item));
  if(missing.length) fail(`Stage-five readability spec delta is missing ${label}.`, { missing, rows });
}

function main(){
  if(!fs.existsSync(ARTIFACT)) fail('Missing stage-five lower-field readability spec delta.', { artifact: rel(ARTIFACT) });
  if(!fs.existsSync(MARKDOWN)) fail('Missing stage-five lower-field readability markdown companion.', { markdown: rel(MARKDOWN) });
  const artifact = readJson(ARTIFACT);
  const stageFive = readJson(STAGE_FIVE);
  const gameSpec = readJson(GAME_SPEC);
  const scripts = readJson(PACKAGE_JSON).scripts || {};
  const payload = {
    artifact: rel(ARTIFACT),
    markdown: rel(MARKDOWN),
    gameKey: artifact.gameKey,
    status: artifact.status,
    candidateId: artifact.candidateId,
    baseline: artifact.baseline
  };

  if(artifact.gameKey !== 'galaxy-guardians-preview'){
    fail('Stage-five readability spec delta is linked to the wrong game.', payload);
  }
  if(artifact.artifactType !== 'galaxy-guardians-spec-delta'){
    fail('Stage-five readability spec delta has the wrong artifact type.', payload);
  }
  if(artifact.status !== 'spec-delta-proposed-no-runtime-change'){
    fail('Stage-five readability spec delta must remain non-runtime until a candidate is measured.', payload);
  }
  if(artifact.candidateId !== 'guardians-stage-five-lower-field-readability-v0'){
    fail('Stage-five readability spec delta has the wrong candidate id.', payload);
  }
  for(const source of Object.values(artifact.sourceEvidence || {})){
    mustExist(source, payload);
  }

  const templateFields = new Set(gameSpec.futureAdjustmentTemplate?.requiredFields || []);
  for(const field of templateFields){
    if(!(field in artifact)){
      fail('Stage-five readability spec delta does not satisfy the game-spec future adjustment template.', { missingField: field });
    }
  }

  requireIncludes('affected spec layers', artifact.affectedSpecLayers || [], [
    'stage-band-arc',
    'role-family-model',
    'movement-language',
    'audio-visual-hooks',
    'promotion-gates'
  ]);
  if(artifact.stageBand?.id !== 'early-escalation' || +artifact.stageBand?.focusStage !== 5){
    fail('Stage-five readability spec delta must target the early-escalation stage-five band.', payload);
  }
  requireIncludes('role families', artifact.roleFamilies || [], [
    'signal-scout',
    'signal-escort',
    'signal-flagship',
    'player-interceptor'
  ]);
  requireIncludes('movement primitives', artifact.movementPrimitives || [], [
    'dive-attack',
    'bottom-wrap-return',
    'scoring-routeability-window'
  ]);
  requireIncludes('axes touched', artifact.axesTouched || [], [
    'player-routeability',
    'collision-safety',
    'shot-window',
    'visual-readability',
    'audio-cue-hooks'
  ]);

  const summary = stageFive.summary || {};
  for(const [key, expected] of Object.entries({
    stageFiveClosenessScore10: summary.stageFiveClosenessScore10,
    stageFiveRouteabilityScore10: summary.stageFiveRouteabilityScore10,
    alienShipPaceConformanceScore10: summary.alienShipPaceConformanceScore10,
    missilePaceConformanceScore10: summary.missilePaceConformanceScore10,
    lowerFieldReadabilityScore10: summary.lowerFieldReadabilityScore10
  })){
    if(!finite(artifact.baseline?.[key]) || Math.abs((+artifact.baseline[key]) - (+expected)) > 0.001){
      fail('Stage-five readability spec delta baseline drifted from the current stage-five closeness artifact.', {
        key,
        expected,
        actual: artifact.baseline?.[key]
      });
    }
  }
  if(artifact.baseline?.weakestFocus !== 'lower-field-readability' || summary.weakestFocus !== 'lower-field-readability'){
    fail('Stage-five readability spec delta should remain focused on lower-field readability.', { baseline: artifact.baseline, summary });
  }

  if(artifact.proposedSpecDelta?.runtimeChangeAllowed !== false || artifact.proposedSpecDelta?.candidateHarnessFirst !== true){
    fail('Stage-five readability spec delta must require candidate harnessing before runtime changes.', artifact.proposedSpecDelta);
  }
  if(artifact.scoringOrResultImpact?.status !== 'unchanged'){
    fail('Stage-five readability spec delta must not alter score/result behavior.', artifact.scoringOrResultImpact);
  }
  if((artifact.routeabilityExpectation?.preserveStageFiveRouteabilityScore10AtLeast || 0) < summary.stageFiveRouteabilityScore10){
    fail('Stage-five readability spec delta routeability floor is below current stage-five routeability.', artifact.routeabilityExpectation);
  }
  if((artifact.collisionSafetyExpectation?.preserveCollisionLossShareAtOrBelow || 1) > artifact.baseline.collisionLossShare){
    fail('Stage-five readability spec delta collision floor permits regression.', artifact.collisionSafetyExpectation);
  }
  if((artifact.paceExpectations?.preserveMissilePaceConformanceScore10AtLeast || 0) < 9.7){
    fail('Stage-five readability spec delta must preserve the strong missile pace signal.', artifact.paceExpectations);
  }

  requireIncludes('promotion gates', artifact.promotionGates || [], [
    'harness:check:galaxy-guardians-stage-five-readability-spec-delta',
    'harness:check:galaxy-guardians-stage-five-closeness',
    'harness:check:galaxy-guardians-game-spec-language',
    'harness:check:galaxy-guardians-first-class-conformance'
  ]);
  if(!scripts['harness:check:galaxy-guardians-stage-five-readability-spec-delta']){
    fail('Missing npm script for the stage-five readability spec delta gate.');
  }
  if(!String(artifact.rollbackSignal || '').includes('routeability drops below 6.6/10')){
    fail('Stage-five readability spec delta rollback signal must name routeability regression.', { rollbackSignal: artifact.rollbackSignal });
  }

  const markdown = read(MARKDOWN);
  for(const phrase of ['Proposed Delta', 'Promotion Expectations', 'Rollback Signal', 'no-runtime-change']){
    if(!markdown.includes(phrase)){
      fail('Stage-five readability spec delta markdown is missing required text.', { phrase });
    }
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: rel(ARTIFACT),
    markdown: rel(MARKDOWN),
    candidateId: artifact.candidateId,
    stageBand: artifact.stageBand.id,
    lowerFieldReadabilityBaseline10: artifact.baseline.lowerFieldReadabilityScore10,
    targetLowerFieldReadabilityScore10AtLeast: artifact.routeabilityExpectation.targetLowerFieldReadabilityScore10AtLeast,
    runtimeChangeAllowed: artifact.proposedSpecDelta.runtimeChangeAllowed
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}
