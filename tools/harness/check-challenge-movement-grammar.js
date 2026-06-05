#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSIS = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-movement-grammar', 'latest.json');
const INGESTION = path.join(ROOT, 'reference-artifacts', 'ingestion', 'challenge-stage-movement-grammar', 'aurora-first-five-0.1.json');
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
  if(!fs.existsSync(file)) fail('Missing challenge movement grammar artifact.', { file: rel(file) });
  const report = readJson(file);
  if(report.artifactType !== 'aurora-challenge-movement-grammar'){
    fail('Unexpected challenge movement grammar artifact type.', { file: rel(file), artifactType: report.artifactType });
  }
  const rows = Array.isArray(report.grammar) ? report.grammar : [];
  for(const stage of REQUIRED_STAGES){
    const row = rows.find(item => +item.stage === stage);
    if(!row) fail(`Missing movement grammar row for stage ${stage}.`, { file: rel(file), stages: rows.map(item => item.stage) });
    if(!String(row.label || '').includes(`${stage}-${stage + 1}`)){
      fail(`Stage ${stage} label should use the explicit challenge bracket wording.`, row);
    }
    if(!Array.isArray(row.groupContracts) || row.groupContracts.length !== 5){
      fail(`Stage ${stage} must have five group contracts.`, row);
    }
    const seed = row.runtimeSeed || {};
    for(const field of ['groupSpawnOffsets', 'groupSoftSpeedScales', 'groupArcAmps', 'groupDropAmps', 'groupLowerFieldBiases', 'groupYOffsets', 'groupPathFamilies', 'groupReferencePaths']){
      if(!Array.isArray(seed[field]) || seed[field].length !== 5){
        fail(`Stage ${stage} runtime seed field ${field} must have five entries.`, row);
      }
    }
    if(seed.groupReferencePaths.filter(Boolean).length !== 5){
      fail(`Stage ${stage} must be backed by five representative reference paths.`, row);
    }
    for(const group of row.groupContracts){
      if(!group.runtimePathFamilyHint || !group.controlIntent){
        fail(`Stage ${stage} group ${group.groupIndex} is missing intent/path-family target.`, group);
      }
      if(!group.referencePath || !group.referencePath.sourceTrackId || +group.referencePath.pointCount < 3){
        fail(`Stage ${stage} group ${group.groupIndex} is missing reference-path evidence.`, group);
      }
    }
    if(!Array.isArray(row.humanVisibleGuardrails) || row.humanVisibleGuardrails.length < 4){
      fail(`Stage ${stage} needs human-visible guardrails.`, row);
    }
  }
  return report;
}

const analysis = checkArtifact(ANALYSIS);
checkArtifact(INGESTION);

if(+analysis.summary?.challengeCount !== REQUIRED_STAGES.length){
  fail('Challenge movement grammar summary count is invalid.', analysis.summary);
}

console.log(JSON.stringify({
  ok: true,
  analysis: rel(ANALYSIS),
  ingestion: rel(INGESTION),
  challengeCount: analysis.summary.challengeCount,
  groupContractCount: analysis.summary.groupContractCount,
  referenceBackedGroupCount: analysis.summary.referenceBackedGroupCount,
  averageControlReadiness10: analysis.summary.averageControlReadiness10
}, null, 2));
