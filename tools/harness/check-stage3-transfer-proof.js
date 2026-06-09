#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-runtime-expressibility', 'stage3-challenge1', 'latest-transfer-proof.json');
const CANDIDATE_ID = 'stage3-semantic-fresh-g4-score-window-shape-peel-0.1';

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function readJson(file){
  if(!fs.existsSync(file)) fail('Missing Stage 3 transfer proof report.', { file: rel(file) });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function expectBoolean(value, label){
  if(typeof value !== 'boolean') fail(`${label} must be a boolean.`, { value });
}

function main(){
  const report = readJson(REPORT);
  if(report.artifactType !== 'stage3-browser-transfer-proof'){
    fail('Unexpected Stage 3 transfer proof artifact type.', { artifactType: report.artifactType });
  }
  if(+report.scope?.stage !== 3 || +report.scope?.challengeNumber !== 1){
    fail('Stage 3 transfer proof must stay scoped to Stage 3 / Challenge 1.', { scope: report.scope });
  }
  if(report.candidate?.candidateId !== CANDIDATE_ID){
    fail('Stage 3 transfer proof must evaluate the selected candidate only.', { candidate: report.candidate });
  }
  const transforms = report.candidate?.semanticTransformations || [];
  for(const required of ['group4-object-track-path-fit', 'group4-peel-off-readability', 'preserve-upper-band-scoreability']){
    if(!transforms.includes(required)){
      fail('Stage 3 transfer proof lost a required semantic transform.', { required, transforms });
    }
  }
  const controls = report.runtimeControlConsumptionMap?.compiledRuntimeFields || [];
  if(!Array.isArray(controls) || controls.length < 3){
    fail('Stage 3 transfer proof must report all hypothesized/compiled runtime controls.', { controls });
  }
  for(const field of ['groupReferencePaths[3].playbackScale', 'motionSpecGroups[3].controls.routeCurveY', 'motionSpecGroups[3].controls.routeOffsetX']){
    const row = controls.find(control => control.runtimeField === field);
    if(!row){
      fail('Missing required runtime-control consumption row.', { field, controls });
    }
    expectBoolean(row.runtimeCurrentlyConsumes, `${field} runtimeCurrentlyConsumes`);
    expectBoolean(row.consumedByProof, `${field} consumedByProof`);
  }
  const applied = report.runtimeControlConsumptionMap?.exactBrowserOverrideFieldsApplied || [];
  for(const field of ['motionSpecGroups[3].controls.routeCurveY', 'motionSpecGroups[3].controls.routeOffsetX']){
    if(!applied.includes(field)){
      fail('Stage 3 transfer proof must apply the consumed browser override fields.', { field, applied });
    }
  }
  const group4 = report.group4TransferRead || {};
  for(const key of ['browserVisiblePathMovement', 'browserVisiblePeelMovement', 'pathLengthDirectionPass', 'targetDistanceImproved', 'peelReadabilityImproved', 'upperBandScoreWindowPreserved']){
    expectBoolean(group4[key], `group4TransferRead.${key}`);
  }
  if(!group4.baseline || !group4.compiled || !group4.predictedRuntimeVector){
    fail('Stage 3 transfer proof must include baseline, compiled, and predicted group 4 vectors.', { group4 });
  }
  for(const metric of ['xRange', 'yRange', 'pathLength', 'lowerFieldShare', 'upperBandShare']){
    if(!Number.isFinite(+group4.baseline[metric]) || !Number.isFinite(+group4.compiled[metric])){
      fail(`Stage 3 transfer proof must report group 4 ${metric} before and after.`, { group4 });
    }
  }
  const protectedRows = report.protectedGroupPreservation || [];
  if(!Array.isArray(protectedRows) || protectedRows.length !== 4){
    fail('Stage 3 transfer proof must report protected groups 1, 2, 3, and 5.', { protectedRows });
  }
  for(const groupIndex of [1, 2, 3, 5]){
    const row = protectedRows.find(item => +item.groupIndex === groupIndex);
    if(!row || typeof row.preservationPass !== 'boolean'){
      fail('Protected-group preservation row missing or malformed.', { groupIndex, row });
    }
  }
  const guardrails = report.guardrails || {};
  for(const key of ['spacingReadability', 'scoreableRoutes', 'noCombatGrammar', 'safety']){
    if(!guardrails[key] || typeof guardrails[key].pass !== 'boolean'){
      fail(`Stage 3 transfer proof must report ${key} guardrail status.`, { guardrail: guardrails[key] });
    }
  }
  if(!report.motionProfileCompatibility || typeof report.motionProfileCompatibility.pass !== 'boolean'){
    fail('Stage 3 transfer proof must include motion/profile compatibility status.', { motionProfileCompatibility: report.motionProfileCompatibility });
  }
  if(!report.visualEvidence?.contactSheet || !fs.existsSync(path.join(ROOT, report.visualEvidence.contactSheet))){
    fail('Stage 3 transfer proof must include contact-sheet evidence.', { visualEvidence: report.visualEvidence });
  }
  if(!Array.isArray(report.failureClassification) || !Array.isArray(report.sourceReadyBlockerType)){
    fail('Stage 3 transfer proof must report blocker taxonomy.', {
      failureClassification: report.failureClassification,
      sourceReadyBlockerType: report.sourceReadyBlockerType
    });
  }
  expectBoolean(report.decision?.sourceReadyForCandidates, 'decision.sourceReadyForCandidates');
  if(report.decision.sourceReadyForCandidates === true){
    if(report.decision.sourceReadinessClassification !== 'runtime-source-attempt-ready'){
      fail('A source-ready proof must use the runtime-source-attempt-ready classification.', { decision: report.decision });
    }
    const required = [
      group4.browserVisiblePathMovement,
      group4.browserVisiblePeelMovement,
      group4.pathLengthDirectionPass,
      group4.targetDistanceImproved,
      group4.peelReadabilityImproved,
      group4.upperBandScoreWindowPreserved,
      report.motionProfileCompatibility.pass,
      guardrails.spacingReadability.pass,
      guardrails.scoreableRoutes.pass,
      guardrails.noCombatGrammar.pass,
      guardrails.safety.pass
    ];
    if(required.some(value => value !== true)){
      fail('A runtime-source-attempt-ready Stage 3 proof must pass all required evidence rows.', {
        group4,
        motionProfileCompatibility: report.motionProfileCompatibility,
        guardrails
      });
    }
  }else{
    if(!report.failureClassification.length || !report.sourceReadyBlockerType.length || !report.decision.sourceReadyBlockers?.length){
      fail('A blocked Stage 3 transfer proof must preserve blocker details.', {
        failureClassification: report.failureClassification,
        sourceReadyBlockerType: report.sourceReadyBlockerType,
        decision: report.decision
      });
    }
    if(report.decision.runtimeKeeperRecommendation !== 'not-a-runtime-keeper'){
      fail('A blocked transfer proof must not claim runtime keeper status.', { decision: report.decision });
    }
  }
  console.log(JSON.stringify({
    ok: true,
    report: rel(REPORT),
    candidate: report.candidate.candidateId,
    sourceReadinessClassification: report.decision.sourceReadinessClassification,
    sourceReadyForCandidates: report.decision.sourceReadyForCandidates,
    blockerTypes: report.sourceReadyBlockerType
  }, null, 2));
}

main();
