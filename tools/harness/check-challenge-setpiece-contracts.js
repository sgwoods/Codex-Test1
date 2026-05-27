#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-setpiece-contracts', 'latest.json');
const REQUIRED_STAGES = [3, 7, 11, 15, 19, 23, 27, 31];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function main(){
  if(!fs.existsSync(ARTIFACT)) fail('Missing challenge set-piece contracts artifact.', { artifact: rel(ARTIFACT) });
  if(!fs.existsSync(path.join(ROOT, 'CHALLENGE_SETPIECE_CONTRACTS.md'))) fail('Missing challenge set-piece contracts markdown report.');
  const report = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
  const contracts = Array.isArray(report.contracts) ? report.contracts : [];
  if(report.artifactType !== 'challenge-setpiece-contracts'){
    fail('Unexpected challenge set-piece contract artifact type.', { artifactType: report.artifactType });
  }
  for(const stage of REQUIRED_STAGES){
    const row = contracts.find(item => +item.stage === stage);
    if(!row) fail(`Missing challenge set-piece contract for stage ${stage}.`, { stages: contracts.map(item => item.stage) });
    if(+row.targetContract?.expectedGroupCount !== 5 || +row.targetContract?.expectedEnemyCount !== 40){
      fail(`Stage ${stage} contract must preserve the 5-group / 40-target bonus-stage shape.`, row);
    }
    if(!Array.isArray(row.targetContract.groupSchedule) || row.targetContract.groupSchedule.length !== 5){
      fail(`Stage ${stage} contract is missing five group schedules.`, row);
    }
    if(+row.targetContract.referencePathCount < 5){
      fail(`Stage ${stage} contract should be backed by five target reference paths.`, row);
    }
    if(!Array.isArray(row.targetContract.pathFamilies) || !row.targetContract.pathFamilies.length){
      fail(`Stage ${stage} contract is missing path-family targets.`, row);
    }
    if(!row.runtimeRead?.safetyPass){
      fail(`Stage ${stage} violates the challenge-stage safety guardrail.`, row.runtimeRead);
    }
    for(const field of ['currentScore10', 'movementScore10', 'graphicsScore10', 'alienNoveltyScore10', 'targetContractFitScore10']){
      if(!Number.isFinite(+row.runtimeRead?.[field]) || +row.runtimeRead[field] < 1 || +row.runtimeRead[field] > 10){
        fail(`Stage ${stage} runtime read field ${field} is invalid.`, row.runtimeRead);
      }
    }
    if(!row.targetAuthority || !Number.isFinite(+row.targetAuthority.averageAuthorityScore10)){
      fail(`Stage ${stage} contract is missing target-authority context.`, row);
    }
    if(!row.nextImplementationStep){
      fail(`Stage ${stage} contract is missing the next implementation step.`, row);
    }
  }
  if(+report.summary?.contractCount !== REQUIRED_STAGES.length){
    fail('Contract summary count is invalid.', report.summary);
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(ARTIFACT),
    contractCount: report.summary.contractCount,
    averageCurrentScore10: report.summary.averageCurrentScore10,
    averageTargetContractFitScore10: report.summary.averageTargetContractFitScore10,
    challengeSpecialtyAuthorityScore10: report.summary.challengeSpecialtyAuthorityScore10
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}
