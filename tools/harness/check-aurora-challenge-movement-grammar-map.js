#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-challenge-movement-grammar-map', 'latest.json');

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function readJson(file){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch(err){
    fail('Aurora challenge movement grammar map could not be read', { file, error: err.message });
  }
}

function assertArray(value, label, min = 1){
  if(!Array.isArray(value) || value.length < min){
    fail(`${label} must contain at least ${min} item(s)`, { count: Array.isArray(value) ? value.length : null });
  }
}

function main(){
  if(!fs.existsSync(ARTIFACT)) fail('Aurora challenge movement grammar map is missing', {
    expected: path.relative(ROOT, ARTIFACT)
  });
  const artifact = readJson(ARTIFACT);
  if(artifact.artifactType !== 'aurora-challenge-movement-grammar-map'){
    fail('unexpected artifactType', { artifactType: artifact.artifactType });
  }
  assertArray(artifact.patterns, 'patterns', 8);
  if(artifact.patterns.length !== 8) fail('Aurora should map exactly eight challenge layouts', { count: artifact.patterns.length });

  const requiredStages = [3, 7, 11, 15, 19, 23, 27, 31];
  const stages = artifact.patterns.map(pattern => +pattern.gameScope?.stage);
  for(const stage of requiredStages){
    if(!stages.includes(stage)) fail('required challenge stage is missing from movement map', { stage, stages });
  }

  const requiredPatternFields = [
    'id',
    'appliesTo',
    'gameScope',
    'roleBindings',
    'phaseTimeline',
    'controlPoints',
    'scoreWindows',
    'eventAnchors',
    'variationControls',
    'measurement'
  ];
  for(const pattern of artifact.patterns){
    for(const field of requiredPatternFields){
      if(pattern[field] === undefined || pattern[field] === null){
        fail('mapped pattern is missing required grammar field', { id: pattern.id, field });
      }
    }
    if(pattern.appliesTo !== 'challenge-stage-set-piece'){
      fail('mapped pattern applies to the wrong movement surface', { id: pattern.id, appliesTo: pattern.appliesTo });
    }
    assertArray(pattern.roleBindings, `roleBindings for ${pattern.id}`, 5);
    assertArray(pattern.phaseTimeline, `phaseTimeline for ${pattern.id}`, 5);
    assertArray(pattern.scoreWindows, `scoreWindows for ${pattern.id}`, 5);
    assertArray(pattern.eventAnchors, `eventAnchors for ${pattern.id}`, 5);
    assertArray(pattern.variationControls, `variationControls for ${pattern.id}`, 5);
    if(pattern.runtimeLayout?.groups !== 5 || pattern.runtimeLayout?.enemiesPerGroup !== 8){
      fail('challenge layout should remain five groups of eight targets', {
        id: pattern.id,
        groups: pattern.runtimeLayout?.groups,
        enemiesPerGroup: pattern.runtimeLayout?.enemiesPerGroup
      });
    }
    if(!pattern.measurement?.trajectoryControlsPresent){
      fail('mapped pattern must attach trajectory controls', {
        id: pattern.id,
        trajectoryControlsPresent: pattern.measurement?.trajectoryControlsPresent
      });
    }
    if(!pattern.measurement?.targetContractPresent && !(pattern.measurement?.gaps || []).some(gap => /target contract/i.test(gap))){
      fail('missing target-contract coverage must be explicit in measurement gaps', { id: pattern.id });
    }
  }

  const stage7 = artifact.patterns.find(pattern => +pattern.gameScope.stage === 7);
  const stage7PathOrder = (stage7?.runtimeLayout?.groupPathFamilies || []).join(',');
  const expectedStage7 = 'cross-sweep,cross-sweep,hook-arc,hook-arc,boss-led-loop';
  if(stage7PathOrder !== expectedStage7){
    fail('Stage 7 authored path order no longer matches the current promoted sequence', {
      stage7PathOrder,
      expectedStage7
    });
  }

  const referenceBacked = artifact.summary?.referenceBackedGroupCount || 0;
  if(referenceBacked < 10){
    fail('movement grammar map has too few reference-backed groups to guide next work', { referenceBacked });
  }
  if((artifact.summary?.targetContractRows || 0) < 2){
    fail('movement grammar map should preserve at least the currently authored target-contract coverage', {
      targetContractRows: artifact.summary?.targetContractRows
    });
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    patterns: artifact.patterns.length,
    referenceBackedGroups: referenceBacked,
    averagePathContractMatchScore10: artifact.summary?.averagePathContractMatchScore10,
    nextStep: artifact.summary?.nextStep
  }, null, 2));
}

main();
