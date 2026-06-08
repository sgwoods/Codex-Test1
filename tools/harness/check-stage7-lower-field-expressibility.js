#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-runtime-expressibility', 'stage7-challenge2', 'latest-lower-field-proof.json');

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function readJson(file){
  if(!fs.existsSync(file)) fail('Missing Stage 7 lower-field expressibility proof report.', { file: rel(file) });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main(){
  const report = readJson(REPORT);
  if(report.artifactType !== 'stage7-lower-field-runtime-expressibility-proof'){
    fail('Unexpected lower-field proof artifact type.', { artifactType: report.artifactType });
  }
  if(+report.scope?.stage !== 7 || +report.scope?.challengeNumber !== 2){
    fail('Lower-field proof must stay scoped to Stage 7 / Challenge 2.', { scope: report.scope });
  }
  if(report.semanticTransformId !== 'lower-field-overstay-reduction'){
    fail('Lower-field proof must use the expected semantic transform id.', { semanticTransformId: report.semanticTransformId });
  }
  if(!Array.isArray(report.intendedTargetGroups) || !report.intendedTargetGroups.includes(2)){
    fail('Lower-field proof must report the generated Stage 7 target group.', { intendedTargetGroups: report.intendedTargetGroups });
  }
  const controls = report.compiledRuntimeControls?.lowerFieldOverstayReduction || [];
  for(const field of ['motionSpecGroups[1].controls.lowerFieldBias', 'motionSpecGroups[1].controls.yOffset']){
    const row = controls.find(control => control.runtimeField === field);
    if(!row || row.runtimeCurrentlyConsumes !== true){
      fail('A required lower-field runtime control was not declared consumed.', { field, row });
    }
  }
  const compiledFields = Array.isArray(report.compiledRuntimeFields) ? report.compiledRuntimeFields : [];
  if(compiledFields.length < 2 || compiledFields.some(field => field.runtimeCurrentlyConsumes !== true || field.consumedByProof !== true)){
    fail('Lower-field proof must show every compiled runtime field was applied through the browser layout override.', { compiledFields });
  }
  const read = report.compiledControlRead || {};
  if(!Array.isArray(read.targetGroupRows) || !read.targetGroupRows.length){
    fail('Lower-field proof must report target group movement rows.', { compiledControlRead: read });
  }
  const group2 = read.targetGroupRows.find(row => +row.groupIndex === 2);
  if(!group2 || !group2.baseline || !group2.compiled){
    fail('Lower-field proof must include baseline and compiled group 2 lower-field metrics.', { group2 });
  }
  for(const key of ['lowerFieldShare', 'yRange', 'pathLength']){
    if(!Number.isFinite(+group2.baseline[key]) || !Number.isFinite(+group2.compiled[key])){
      fail(`Lower-field proof must report group 2 ${key} before/after.`, { group2 });
    }
  }
  if(typeof read.browserVisibleLowerFieldMovement !== 'boolean' || typeof read.intendedDirectionPass !== 'boolean'){
    fail('Lower-field proof must report visible movement and intended-direction status.', {
      browserVisibleLowerFieldMovement: read.browserVisibleLowerFieldMovement,
      intendedDirectionPass: read.intendedDirectionPass
    });
  }
  if(!Array.isArray(read.group45Preservation) || read.group45Preservation.length !== 2){
    fail('Lower-field proof must report group 4/group 5 preservation.', { group45Preservation: read.group45Preservation });
  }
  if(typeof read.group45Preserved !== 'boolean'){
    fail('Lower-field proof must report aggregate group 4/group 5 preservation status.', { group45Preserved: read.group45Preserved });
  }
  if(!read.motionProfileProxy || typeof read.motionProfileGateProxyPass !== 'boolean'){
    fail('Lower-field proof must include motion/profile proxy evidence.', { compiledControlRead: read });
  }
  if(!read.spacingReadability || typeof read.spacingReadability.pass !== 'boolean'){
    fail('Lower-field proof must include spacing/readability status.', { spacingReadability: read.spacingReadability });
  }
  if(!read.scoreableRouteStatus || typeof read.scoreableRouteStatus.pass !== 'boolean'){
    fail('Lower-field proof must include scoreable-route status.', { scoreableRouteStatus: read.scoreableRouteStatus });
  }
  if(!read.safetyStatus || typeof read.safetyStatus.pass !== 'boolean'){
    fail('Lower-field proof must include no-shot/no-attack/no-loss safety status.', { safetyStatus: read.safetyStatus });
  }
  if(!read.group1Effect || +read.group1Effect.groupIndex !== 1){
    fail('Lower-field proof must report group 1 effect.', { group1Effect: read.group1Effect });
  }
  if(typeof report.lowerFieldProofBacked !== 'boolean' || typeof report.decision?.sourceReadyForCandidates !== 'boolean'){
    fail('Lower-field proof must report source-ready decision booleans.', {
      lowerFieldProofBacked: report.lowerFieldProofBacked,
      decision: report.decision
    });
  }
  if(!Array.isArray(report.sourceReadyBlockerType)){
    fail('Lower-field proof must report source-ready blocker taxonomy.', { sourceReadyBlockerType: report.sourceReadyBlockerType });
  }
  if(report.decision.sourceReadyForCandidates === false){
    const blockers = Array.isArray(report.decision.sourceReadyBlockers) ? report.decision.sourceReadyBlockers : [];
    const classifications = Array.isArray(report.failureClassification) ? report.failureClassification : [];
    if(!blockers.length || !classifications.length){
      fail('Blocked lower-field proofs must include blockers and failure classification.', {
        decision: report.decision,
        failureClassification: report.failureClassification
      });
    }
  }
  if(report.decision.sourceReadyForCandidates === true){
    const required = [
      read.browserVisibleLowerFieldMovement,
      read.intendedDirectionPass,
      read.motionProfileGateProxyPass,
      read.spacingReadability.pass,
      read.scoreableRouteStatus.pass,
      read.safetyStatus.pass,
      read.group45Preserved
    ];
    if(required.some(value => value !== true)){
      fail('A source-ready lower-field proof must pass all required guardrails.', { compiledControlRead: read });
    }
  }
  console.log(JSON.stringify({
    ok: true,
    report: rel(REPORT),
    browserVisibleEffectConfirmed: report.summary.browserVisibleEffectConfirmed,
    intendedDirectionPass: report.summary.intendedDirectionPass,
    motionProfileGateProxyPass: report.summary.motionProfileGateProxyPass,
    group45Preserved: report.summary.group45Preserved,
    sourceReadyForCandidates: report.decision.sourceReadyForCandidates,
    sourceReadyBlockerType: report.sourceReadyBlockerType
  }, null, 2));
}

try{
  main();
}catch(error){
  fail(error.message);
}
