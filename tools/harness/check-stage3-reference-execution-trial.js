#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'reference-execution-candidate-trials', 'stage3-challenge1', 'latest.json');
const CANDIDATE = path.join(ROOT, 'reference-artifacts', 'ingestion', 'reference-execution-candidate-trials', 'stage3-baseline-control-0.1.json');

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function readJson(file){
  if(!fs.existsSync(file)) fail('Missing Stage 3 reference execution trial artifact.', { file: rel(file) });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function requireTruthy(value, message, payload){
  if(!value) fail(message, payload);
}

function main(){
  const candidate = readJson(CANDIDATE);
  const report = readJson(REPORT);
  requireTruthy(candidate.artifactType === 'stage3-reference-execution-candidate-trial-input', 'Unexpected Stage 3 candidate input type.', { artifactType: candidate.artifactType });
  requireTruthy(report.artifactType === 'stage3-reference-execution-candidate-trial', 'Unexpected Stage 3 trial artifact type.', { artifactType: report.artifactType });
  requireTruthy(+report.scope?.stage === 3 && +report.scope?.challengeNumber === 1, 'Stage 3 trial report must stay scoped to Stage 3 / Challenge 1.', { scope: report.scope });
  requireTruthy(report.candidate?.nonOverwriting === true, 'Stage 3 trial must remain non-overwriting.', { candidate: report.candidate });
  requireTruthy(report.summary?.runtimeKeeperRecommendation === 'not-a-runtime-keeper', 'Stage 3 trial must not claim a runtime keeper.', { summary: report.summary });
  requireTruthy(report.summary?.readyForRuntimeSourceCandidate === false, 'Stage 3 baseline trial must not authorize a runtime source candidate.', { summary: report.summary });
  requireTruthy(report.summary?.sourceCandidateGenerationAllowed === false, 'Stage 3 baseline trial must not generate source candidates.', { summary: report.summary });
  requireTruthy(report.summary?.baselineControlEvaluated === true, 'Stage 3 baseline-control candidate must be evaluated.', { summary: report.summary });
  requireTruthy(report.summary?.measurementKeeperRecommendation === 'accept-process-keeper', 'Stage 3 trial gate should be accepted as a process keeper.', { summary: report.summary });

  const groups = report.trial?.groupResults || [];
  requireTruthy(Array.isArray(groups) && groups.length === 5, 'Stage 3 trial report must contain all five group results.', { groupCount: groups.length });
  const missing = [];
  for(const group of groups){
    const prefix = `group ${group.groupIndex}`;
    if(!group.lineRole) missing.push(`${prefix}: line role`);
    if(!group.canonicalComparisonPathFamily) missing.push(`${prefix}: canonical family`);
    if(!group.candidatePathFamily) missing.push(`${prefix}: candidate family`);
    if(!Number.isFinite(+group.aggregateObjectTrackScore10)) missing.push(`${prefix}: aggregate object-track score`);
    if(!Number.isFinite(+group.aggregateObjectTrackCoverage)) missing.push(`${prefix}: aggregate object-track coverage`);
    if(!Number.isFinite(+group.primaryObjectTrackScore10)) missing.push(`${prefix}: primary object-track score`);
    if(!group.semantic || !Number.isFinite(+group.semantic.semanticScore)) missing.push(`${prefix}: semantic score`);
    if(!group.semantic?.lineRolePreservation) missing.push(`${prefix}: line-role preservation read`);
    if(!group.semantic?.upperBandScoreability) missing.push(`${prefix}: upper-band scoreability read`);
    if(!group.semantic?.peelOffReadability) missing.push(`${prefix}: peel-off readability read`);
    if(!group.semantic?.routeLearnability) missing.push(`${prefix}: route learnability read`);
    if(!group.semantic?.noCombatGrammar) missing.push(`${prefix}: no-combat grammar read`);
    if(!group.fieldOccupancyTension?.humanVisibleRead || !group.fieldOccupancyTension?.cpuGeometryRead) missing.push(`${prefix}: split field occupancy read`);
    if(!Array.isArray(group.blockers) || !Array.isArray(group.warnings)) missing.push(`${prefix}: blockers/warnings`);
    if(!group.uncertaintyAndProvenance) missing.push(`${prefix}: uncertainty/provenance`);
  }
  if(missing.length) fail('Stage 3 trial group rows are incomplete.', { missing });

  const semantic = report.trial?.semanticScores || {};
  for(const key of ['overallSemanticScore', 'lineRolePreservation', 'upperBandScoreability', 'peelOffReadability', 'routeLearnability', 'noCombatGrammarPreservation']){
    if(!Number.isFinite(+semantic[key])) fail(`Stage 3 semantic metric is missing: ${key}`, { semantic });
  }
  requireTruthy(semantic.overallSemanticScore >= 0.7, 'Stage 3 baseline semantic score must clear the process gate.', { semantic });
  requireTruthy(report.trial?.fieldOccupancyTension?.conflictCount >= 1, 'Stage 3 trial must expose human-vs-CPU field occupancy tension.', { fieldOccupancyTension: report.trial?.fieldOccupancyTension });
  requireTruthy(report.trial?.pathFamilyOrder?.conflictCount >= 1, 'Stage 3 trial must expose path-family authority conflicts.', { pathFamilyOrder: report.trial?.pathFamilyOrder });
  requireTruthy(Array.isArray(report.trial?.strictWeakRows) && report.trial.strictWeakRows.length >= 1, 'Stage 3 trial must expose strict weak rows instead of hiding them behind an aggregate score.', { strictWeakRows: report.trial?.strictWeakRows });

  const guardrails = report.trial || {};
  for(const key of ['spacingReadability', 'scoreableRoutes', 'safety']){
    if(!guardrails[key] || typeof guardrails[key].pass !== 'boolean'){
      fail(`Stage 3 trial report must include ${key} pass/fail guardrail.`, { guardrail: guardrails[key] });
    }
  }
  requireTruthy(guardrails.safety?.noEnemyShots === true && guardrails.safety?.noAttackStarts === true && guardrails.safety?.noShipLosses === true, 'Stage 3 safety guardrail must preserve no-shot/no-attack/no-loss behavior.', { safety: guardrails.safety });
  requireTruthy(guardrails.noCombatGrammar?.pass === true, 'Stage 3 no-combat grammar must be preserved.', { noCombatGrammar: guardrails.noCombatGrammar });

  const reuse = report.reuseReport || {};
  requireTruthy(Array.isArray(reuse.reusableRedTrialMechanics) && reuse.reusableRedTrialMechanics.length >= 5, 'Stage 3 trial must identify reusable RED/trial mechanics.', { reuseReport: reuse });
  requireTruthy(Array.isArray(reuse.stage3SpecificSemanticExpectations) && reuse.stage3SpecificSemanticExpectations.length >= 3, 'Stage 3 trial must identify Stage 3-specific semantics.', { reuseReport: reuse });
  requireTruthy(Array.isArray(reuse.temporaryStage3Code) && reuse.temporaryStage3Code.length >= 1, 'Stage 3 trial must identify temporary Stage 3 code.', { reuseReport: reuse });
  requireTruthy(Array.isArray(reuse.abstractionNeededToRemoveBespokeLogic) && reuse.abstractionNeededToRemoveBespokeLogic.length >= 2, 'Stage 3 trial must name generalization follow-ups.', { reuseReport: reuse });

  const authority = report.metricsAuthorityReport || {};
  requireTruthy(authority.humanVsCpuConflictCount >= 1, 'Stage 3 authority report must carry human-vs-CPU conflict count.', { metricsAuthorityReport: authority });
  requireTruthy(authority.targetVsRuntimeAuthorityConflictCount >= 1, 'Stage 3 authority report must carry target-vs-runtime conflict count.', { metricsAuthorityReport: authority });
  requireTruthy(String(authority.aggregateScorePolicy || '').includes('strict weak rows'), 'Stage 3 authority report must prevent broad score masking.', { metricsAuthorityReport: authority });

  console.log(JSON.stringify({
    ok: true,
    report: rel(REPORT),
    candidate: report.candidate?.candidateId || null,
    processKeeper: report.summary.measurementKeeperRecommendation,
    runtimeKeeper: report.summary.runtimeKeeperRecommendation,
    totalObjectTrackScore10: report.trial.totalObjectTrackScore10,
    semanticScore: semantic.overallSemanticScore,
    strictWeakRows: report.trial.strictWeakRows.length,
    fieldOccupancyConflicts: report.trial.fieldOccupancyTension.conflictCount,
    authorityConflicts: report.trial.pathFamilyOrder.conflictCount
  }, null, 2));
}

try{
  main();
}catch(error){
  fail(error.message);
}
