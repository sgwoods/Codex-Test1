#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DESCRIPTION = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-descriptions', 'aurora-stage3-challenge1-0.1.json');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-description', 'stage3-challenge1', 'latest.json');

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function readJson(file){
  if(!fs.existsSync(file)) fail('Missing Stage 3 RED artifact.', { file: rel(file) });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function requireTruthy(value, message, payload){
  if(!value) fail(message, payload);
}

function main(){
  const description = readJson(DESCRIPTION);
  const report = readJson(REPORT);
  requireTruthy(description.artifactType === 'reference-execution-description', 'Unexpected Stage 3 RED artifact type.', { artifactType: description.artifactType });
  requireTruthy(report.artifactType === 'stage3-reference-execution-description-analysis', 'Unexpected Stage 3 RED analysis artifact type.', { artifactType: report.artifactType });
  requireTruthy(+description.scope?.stage === 3 && +description.scope?.challengeNumber === 1, 'Stage 3 RED must stay scoped to Stage 3 / Challenge 1.', { scope: description.scope });
  const groups = Array.isArray(description.groups) ? description.groups : [];
  requireTruthy(groups.length === 5, 'Stage 3 RED must describe five challenge groups.', { groupCount: groups.length });
  const issues = [];
  for(const group of groups){
    const prefix = `group ${group.groupIndex}`;
    if(!group.phaseId) issues.push(`${prefix}: missing phase id`);
    if(!group.semanticPathFamily) issues.push(`${prefix}: missing semantic path family`);
    if(!group.canonicalComparisonPathFamily) issues.push(`${prefix}: missing canonical comparison path family`);
    if(!group.pathFamilyDecision?.canonicalSource) issues.push(`${prefix}: missing path-family decision`);
    if(!group.semanticExecution?.lineRole) issues.push(`${prefix}: missing semantic line role`);
    if(!group.semanticExecution?.entryCue) issues.push(`${prefix}: missing entry cue`);
    if(!group.semanticExecution?.exitGesture) issues.push(`${prefix}: missing exit gesture`);
    if(group.semanticExecution?.scoreableBand !== 'upper-band') issues.push(`${prefix}: scoreable band must be explicit upper-band`);
    if(!group.semanticExecution?.noCombatGrammar) issues.push(`${prefix}: missing no-combat grammar`);
    if(!group.fieldOccupancyExpectation) issues.push(`${prefix}: missing field occupancy expectation`);
    if(!group.uncertaintyAndProvenance) issues.push(`${prefix}: missing uncertainty/provenance`);
    if(!group.primaryTargetTrackId) issues.push(`${prefix}: missing primary target track`);
    if(!Array.isArray(group.primaryTrackRelativePoints) || group.primaryTrackRelativePoints.length < 3) issues.push(`${prefix}: missing primary track points`);
    if(!Array.isArray(group.comparisonAxes) || !group.comparisonAxes.includes('field-level-provenance')) issues.push(`${prefix}: missing field-level provenance comparison axis`);
    if(group.candidateComparisonGate?.authorityLayer !== 'target-conformance-red-not-live-promotion') issues.push(`${prefix}: candidate gate must keep RED target-conformance separate from live promotion authority`);
  }
  const group1 = groups.find(group => +group.groupIndex === 1);
  const group4 = groups.find(group => +group.groupIndex === 4);
  if(group1?.semanticExecution?.lineRole !== 'bee-line') issues.push('group 1 must preserve top-right bee-line semantic role');
  if(group1?.semanticExecution?.entryCue !== 'top-right') issues.push('group 1 must preserve top-right entry cue');
  if(group4?.semanticExecution?.lineRole !== 'butterfly-line') issues.push('group 4 must preserve late butterfly-line semantic role');
  if(group4?.semanticExecution?.entryCue !== 'top-left') issues.push('group 4 must preserve top-left entry cue');
  if(issues.length) fail('Stage 3 RED validation failed.', { issues });

  const adequacy = report.languageAdequacy || {};
  requireTruthy(Array.isArray(adequacy.representedCleanly) && adequacy.representedCleanly.length >= 4, 'Stage 3 language adequacy report must list clean representations.', { languageAdequacy: adequacy });
  requireTruthy(Array.isArray(adequacy.approximations) && adequacy.approximations.length >= 3, 'Stage 3 language adequacy report must list approximations.', { languageAdequacy: adequacy });
  requireTruthy(Array.isArray(adequacy.newPrimitivesNeeded) && adequacy.newPrimitivesNeeded.includes('semanticExecution.lineRole'), 'Stage 3 language adequacy report must name new semantic primitives.', { languageAdequacy: adequacy });
  requireTruthy(typeof report.summary?.readyForNonOverwritingCandidateTrialGate === 'boolean', 'Stage 3 report must decide candidate-trial readiness.', { summary: report.summary });
  requireTruthy(report.summary?.runtimeSourceCandidateAllowed === false, 'Stage 3 RED cycle must not allow runtime source candidates.', { summary: report.summary });
  requireTruthy(Array.isArray(report.groupReads) && report.groupReads.length === 5, 'Stage 3 report must include five runtime group reads.', { groupReadCount: report.groupReads?.length });

  console.log(JSON.stringify({
    ok: true,
    description: rel(DESCRIPTION),
    report: rel(REPORT),
    candidateTrialRecommendation: report.summary.candidateTrialRecommendation,
    readyForNonOverwritingCandidateTrialGate: report.summary.readyForNonOverwritingCandidateTrialGate,
    runtimeSourceCandidateAllowed: report.summary.runtimeSourceCandidateAllowed,
    languageAdequacyScore: report.languageAdequacy.adequacyScore,
    directSemanticLabelCount: description.summary.directSemanticLabelCount,
    fieldOccupancyConflictCount: description.summary.fieldOccupancyConflictCount
  }, null, 2));
}

try{
  main();
}catch(error){
  fail(error.message);
}
