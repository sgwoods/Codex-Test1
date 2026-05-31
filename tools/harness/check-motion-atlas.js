#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'motion-atlas', 'latest.json');

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function readJson(file){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch(err){
    fail('Motion Atlas artifact could not be read', { file: path.relative(ROOT, file), error: err.message });
  }
}

function assertArray(value, label, min = 1){
  if(!Array.isArray(value) || value.length < min){
    fail(`${label} must contain at least ${min} item(s)`, { count: Array.isArray(value) ? value.length : null });
  }
}

function main(){
  if(!fs.existsSync(ARTIFACT)) fail('Motion Atlas artifact is missing', { expected: path.relative(ROOT, ARTIFACT) });
  const artifact = readJson(ARTIFACT);
  if(artifact.artifactType !== 'motion-atlas') fail('unexpected artifactType', { artifactType: artifact.artifactType });
  assertArray(artifact.rows, 'rows', 8);
  if(artifact.rows.length !== 8) fail('Aurora challenge motion atlas should contain exactly eight challenge rows', { count: artifact.rows.length });

  const requiredStages = [3, 7, 11, 15, 19, 23, 27, 31];
  const stages = artifact.rows.map(row => +row.stage);
  for(const stage of requiredStages){
    if(!stages.includes(stage)) fail('required challenge stage is missing from Motion Atlas', { stage, stages });
  }

  for(const row of artifact.rows){
    if(row.gameKey !== 'aurora-galactica') fail('row gameKey should identify Aurora', { id: row.id, gameKey: row.gameKey });
    if(row.surface !== 'challenge-stage-set-piece') fail('row surface should be challenge-stage-set-piece', { id: row.id, surface: row.surface });
    assertArray(row.groupRows, `groupRows for ${row.id}`, 5);
    if(row.groupRows.length !== 5) fail('each current Aurora challenge atlas row should expose five target groups', { id: row.id, count: row.groupRows.length });
    const diagram = row.diagrams?.motionAtlasSvg;
    if(!diagram) fail('row is missing motion atlas SVG evidence', { id: row.id });
    if(!fs.existsSync(path.join(ROOT, diagram))) fail('motion atlas SVG evidence file does not exist', { id: row.id, diagram });
    for(const group of row.groupRows){
      assertArray(group.targetPoints, `targetPoints for ${row.id} group ${group.groupIndex}`, 2);
      assertArray(group.currentPoints, `currentPoints for ${row.id} group ${group.groupIndex}`, 2);
      if(!group.deltaRead) fail('group is missing human delta read', { id: row.id, groupIndex: group.groupIndex });
      if(!group.timingDelta) fail('group is missing timing delta read', { id: row.id, groupIndex: group.groupIndex });
    }
  }

  const summary = artifact.summary || {};
  if(!Number.isFinite(+summary.averageMovementScore10)) fail('summary averageMovementScore10 is missing');
  if(!Number.isFinite(+summary.averageGroupScore10)) fail('summary averageGroupScore10 is missing');
  if((summary.targetPointCount || 0) < 40) fail('Motion Atlas should contain enough target points to be human-reviewable', { targetPointCount: summary.targetPointCount });
  if((summary.currentPointCount || 0) < 40) fail('Motion Atlas should contain enough current points to be human-reviewable', { currentPointCount: summary.currentPointCount });

  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    rows: artifact.rows.length,
    averageMovementScore10: summary.averageMovementScore10,
    averageGroupScore10: summary.averageGroupScore10,
    synthesizedCurrentPathCount: summary.synthesizedCurrentPathCount,
    readinessScore10: summary.readinessScore10
  }, null, 2));
}

main();
