#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSIS = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-motion-primitives', 'latest.json');
const INGESTION = path.join(ROOT, 'reference-artifacts', 'ingestion', 'challenge-motion-primitives', 'aurora-0.1.json');
const REQUIRED_PRIMITIVES = [
  'lead-in-continuity',
  'group-spacing-field',
  'reference-spline-fit',
  'phase-order-scheduler',
  'lower-field-scoreable-pass',
  'hook-return-arc',
  'serpentine-cascade',
  'novelty-family-cascade',
  'exit-continuity',
  'persona-perfect-route-probe'
];
const REQUIRED_STAGES = [3, 7, 11, 15, 19];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function checkArtifact(file){
  if(!fs.existsSync(file)) fail('Missing challenge motion primitives artifact.', { file: rel(file) });
  const report = readJson(file);
  if(report.artifactType !== 'challenge-motion-primitives'){
    fail('Unexpected challenge motion primitives artifact type.', { file: rel(file), artifactType: report.artifactType });
  }
  const primitives = Array.isArray(report.primitives) ? report.primitives : [];
  for(const id of REQUIRED_PRIMITIVES){
    const primitive = primitives.find(item => item.id === id);
    if(!primitive) fail(`Missing primitive ${id}.`, { file: rel(file), ids: primitives.map(item => item.id) });
    if(!primitive.playerMeaning || !primitive.implementationPlan){
      fail(`Primitive ${id} must describe player meaning and implementation plan.`, primitive);
    }
    if(!Array.isArray(primitive.successCriteria) || primitive.successCriteria.length < 3){
      fail(`Primitive ${id} must have concrete success criteria.`, primitive);
    }
    if(!Array.isArray(primitive.candidateGeneratorKnobs) || primitive.candidateGeneratorKnobs.length < 3){
      fail(`Primitive ${id} must expose candidate-generator knobs.`, primitive);
    }
    if(!Array.isArray(primitive.runtimeTouchpoints) || primitive.runtimeTouchpoints.length < 1){
      fail(`Primitive ${id} must list runtime touchpoints.`, primitive);
    }
    if(!Number.isFinite(+primitive.priority10) || +primitive.priority10 <= 0){
      fail(`Primitive ${id} must have a positive priority10.`, primitive);
    }
  }
  const roadmap = Array.isArray(report.stageRoadmap) ? report.stageRoadmap : [];
  for(const stage of REQUIRED_STAGES){
    const row = roadmap.find(item => +item.stage === stage);
    if(!row) fail(`Missing stage roadmap row for stage ${stage}.`, { file: rel(file), stages: roadmap.map(item => item.stage) });
    if(!String(row.label || '').includes(`${stage}-${stage + 1}`)){
      fail(`Stage ${stage} label should use Challenging Stage ${stage}-${stage + 1} wording.`, row);
    }
    if(!Array.isArray(row.primaryPrimitives) || row.primaryPrimitives.length < 4){
      fail(`Stage ${stage} must name primary primitives.`, row);
    }
    if(!row.currentBlocker || !row.desiredOutcome || !row.nextAction){
      fail(`Stage ${stage} must preserve blocker, desired outcome, and next action.`, row);
    }
  }
  const leadInEvidence = report.leadInPrototypeEvidence || null;
  const leadInPrototypeAllowsSpacing = report.summary?.firstBuildTarget === 'group-spacing-field'
    && leadInEvidence
    && Number.isFinite(+leadInEvidence.magicAppearanceRisk)
    && +leadInEvidence.magicAppearanceRisk <= 0.12
    && Number.isFinite(+leadInEvidence.arrivalContinuity)
    && +leadInEvidence.arrivalContinuity >= 0.8
    && Number.isFinite(+leadInEvidence.bunchingRisk)
    && +leadInEvidence.bunchingRisk > 0.55
    && leadInEvidence.visualPresencePass === true
    && leadInEvidence.promotionReady === false;
  if(report.summary?.firstBuildTarget !== 'lead-in-continuity' && !leadInPrototypeAllowsSpacing){
    fail('The first build target should remain lead-in-continuity unless a measured lead-in prototype improves magic appearance and leaves group spacing as the blocker.', {
      summary: report.summary,
      leadInPrototypeEvidence: leadInEvidence
    });
  }
  if(+report.summary?.highPriorityPrimitiveCount < 3){
    fail('Expected at least three high-priority challenge motion primitives.', report.summary);
  }
  return report;
}

const analysis = checkArtifact(ANALYSIS);
checkArtifact(INGESTION);

console.log(JSON.stringify({
  ok: true,
  analysis: rel(ANALYSIS),
  ingestion: rel(INGESTION),
  primitiveCount: analysis.summary.primitiveCount,
  highPriorityPrimitiveCount: analysis.summary.highPriorityPrimitiveCount,
  firstBuildTarget: analysis.summary.firstBuildTarget
}, null, 2));
