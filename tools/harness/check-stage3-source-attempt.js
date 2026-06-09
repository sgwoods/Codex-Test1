#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-source-attempts', 'stage3-challenge1', 'latest-source-attempt.json');
const CANDIDATE_ID = 'stage3-semantic-fresh-g4-score-window-shape-peel-0.1';
const REQUIRED_CONTROLS = new Map([
  ['motionSpecGroups[3].controls.pathPlaybackScale', 0.5],
  ['motionSpecGroups[3].controls.routeCurveY', 17.464],
  ['motionSpecGroups[3].controls.routeOffsetX', 60]
]);

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function readJson(file){
  if(!fs.existsSync(file)) fail('Missing Stage 3 source-attempt report.', { file: rel(file) });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function expectBoolean(value, label){
  if(typeof value !== 'boolean') fail(`${label} must be a boolean.`, { value });
}

function main(){
  const report = readJson(REPORT);
  if(report.artifactType !== 'stage3-source-attempt-report'){
    fail('Unexpected Stage 3 source-attempt artifact type.', { artifactType: report.artifactType });
  }
  if(report.candidateId !== CANDIDATE_ID){
    fail('Stage 3 source attempt must stay on the selected candidate.', { candidateId: report.candidateId });
  }
  if(+report.appliedScope?.stage !== 3 || +report.appliedScope?.challengeNumber !== 1 || +report.appliedScope?.touchedGroup !== 4){
    fail('Stage 3 source attempt escaped its intended scope.', { appliedScope: report.appliedScope });
  }
  const controls = report.sourceControlsApplied || [];
  for(const [field, expectedValue] of REQUIRED_CONTROLS.entries()){
    const row = controls.find(control => control.runtimeField === field);
    if(!row){
      fail('Missing proof-backed source control.', { field, controls });
    }
    if(Math.abs(+row.proofBackedValue - expectedValue) > 0.001 || Math.abs(+row.sourceValue - expectedValue) > 0.001){
      fail('Source control does not match the proof-backed value.', { field, expectedValue, row });
    }
    expectBoolean(row.consumedByRuntime, `${field}.consumedByRuntime`);
    expectBoolean(row.matchesProof, `${field}.matchesProof`);
  }
  const group4 = report.group4Read || {};
  for(const key of [
    'browserVisiblePathMovement',
    'browserVisiblePeelMovement',
    'pathLengthDirectionPass',
    'exitPeelReadImproved',
    'upperBandScoreWindowPreserved'
  ]){
    expectBoolean(group4[key], `group4Read.${key}`);
  }
  if(!group4.before || !group4.after){
    fail('Stage 3 source attempt must include group 4 before/after vectors.', { group4 });
  }
  if(group4.after.exitSide !== 'right'){
    fail('Stage 3 source attempt did not produce the expected group 4 right peel read.', { group4 });
  }
  if(!(Number.isFinite(+group4.before.pathLength) && Number.isFinite(+group4.after.pathLength) && +group4.after.pathLength < +group4.before.pathLength)){
    fail('Stage 3 source attempt did not reduce group 4 path length.', { group4 });
  }
  const protectedRows = report.protectedGroupPreservation || [];
  for(const groupIndex of [1, 2, 3, 5]){
    const row = protectedRows.find(item => +item.groupIndex === groupIndex);
    if(!row || row.preservationPass !== true){
      fail('Protected group failed preservation.', { groupIndex, row });
    }
  }
  if(report.motionProfileCompatibility?.pass !== true){
    fail('Stage 3 source attempt failed motion/profile compatibility.', { motionProfileCompatibility: report.motionProfileCompatibility });
  }
  const guardrails = report.guardrails || {};
  for(const key of ['spacingReadability', 'scoreableRoutes', 'noCombatGrammar', 'safety']){
    if(guardrails[key]?.pass !== true){
      fail(`Stage 3 source attempt failed ${key}.`, { guardrail: guardrails[key] });
    }
  }
  const safety = guardrails.safety || {};
  for(const key of ['noEnemyShots', 'noAttackStarts', 'noShipLosses', 'noChallengeContacts']){
    if(safety[key] !== true){
      fail(`Stage 3 source attempt failed safety row ${key}.`, { safety });
    }
  }
  if(!report.visualEvidence?.contactSheet || !fs.existsSync(path.join(ROOT, report.visualEvidence.contactSheet))){
    fail('Stage 3 source attempt must include contact-sheet evidence.', { visualEvidence: report.visualEvidence });
  }
  if(report.verdict === 'dev-visible-gameplay-keeper'){
    if(report.decision?.acceptedAsDevVisibleGameplayKeeper !== true || report.betaJustification !== false){
      fail('Keeper verdict must remain dev-visible only and not beta justification.', {
        decision: report.decision,
        betaJustification: report.betaJustification
      });
    }
  }else if(report.verdict === 'rejected'){
    if(!Array.isArray(report.failureClassification) || !report.failureClassification.length){
      fail('Rejected source attempt must preserve failure classification.', { failureClassification: report.failureClassification });
    }
  }else{
    fail('Unexpected Stage 3 source-attempt verdict.', { verdict: report.verdict });
  }
  console.log(JSON.stringify({
    ok: true,
    report: rel(REPORT),
    candidateId: report.candidateId,
    verdict: report.verdict,
    group4: {
      exitSide: `${group4.before.exitSide}->${group4.after.exitSide}`,
      pathLength: `${group4.before.pathLength}->${group4.after.pathLength}`,
      upperBandShare: `${group4.before.upperBandShare}->${group4.after.upperBandShare}`
    }
  }, null, 2));
}

main();
