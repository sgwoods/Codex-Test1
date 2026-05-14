#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, buildGuardiansLongSurfaceArtifact } = require('./guardians-long-surface-lib');

const OUT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'long-surface-conformance-0.1.json');

function main(){
 const artifact = buildGuardiansLongSurfaceArtifact();
 fs.writeFileSync(OUT, `${JSON.stringify(artifact, null, 2)}\n`);
 console.log(JSON.stringify({
  ok: true,
  artifact: path.relative(ROOT, OUT),
  overallLongSurfaceScore10: artifact.summary.overallLongSurfaceScore10,
  stageArcPressureScore10: artifact.summary.stageArcPressureScore10,
  stagePresentationScore10: artifact.summary.stagePresentationScore10,
  personaReviewUtilityScore10: artifact.summary.personaReviewUtilityScore10,
  midrunSurvivabilityScore10: artifact.summary.midrunSurvivabilityScore10
 }, null, 2));
}

try{
 main();
}catch(err){
 console.error(err && err.stack || String(err));
 process.exit(1);
}
