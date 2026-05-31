#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'movement-grammar-compiler-bridge', 'latest.json');

function fail(message, payload = {}){
  console.error(JSON.stringify({ ok: false, message, ...payload }, null, 2));
  process.exit(1);
}

function readJson(file){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch(err){
    fail('movement grammar compiler bridge artifact could not be read', { file, error: err.message });
  }
}

function main(){
  if(!fs.existsSync(ARTIFACT)){
    fail('movement grammar compiler bridge artifact is missing', {
      expected: path.relative(ROOT, ARTIFACT)
    });
  }
  const artifact = readJson(ARTIFACT);
  if(artifact.artifactType !== 'movement-grammar-compiler-bridge'){
    fail('unexpected artifactType', { artifactType: artifact.artifactType });
  }
  const rows = Array.isArray(artifact.rows) ? artifact.rows : [];
  if(rows.length !== 8) fail('compiler bridge should cover exactly eight Aurora challenge patterns', { count: rows.length });
  if(!artifact.summary?.compilerBridgeReady){
    fail('compiler bridge is not ready', { summary: artifact.summary });
  }
  if(+artifact.summary.requiredRoundTripScore10 !== 10){
    fail('required round-trip score must remain 10/10', { score: artifact.summary.requiredRoundTripScore10 });
  }
  const driftRows = rows.filter(row => (row.requiredDrift || []).length);
  if(driftRows.length){
    fail('required compiler fields drifted', {
      driftRows: driftRows.map(row => ({ id: row.id, fields: row.requiredDrift.map(item => item.field) }))
    });
  }
  const stage7 = rows.find(row => +row.stage === 7);
  const stage7PathOrder = (stage7?.compiledRuntimeLayout?.groupPathFamilies || []).join(',');
  if(stage7PathOrder !== 'cross-sweep,cross-sweep,hook-arc,hook-arc,boss-led-loop'){
    fail('Stage 7 compiler output no longer preserves the promoted sequence', { stage7PathOrder });
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    patternCount: rows.length,
    requiredRoundTripScore10: artifact.summary.requiredRoundTripScore10,
    nextStep: artifact.summary.nextStep
  }, null, 2));
}

main();
