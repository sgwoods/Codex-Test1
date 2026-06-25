#!/usr/bin/env node
const { privateVisualTargetArtifactStatus } = require('./private-visual-target-artifacts');

function main(){
  const repair = process.argv.includes('--repair');
  const persist = process.argv.includes('--persist');
  const status = privateVisualTargetArtifactStatus({ repair, persist });
  console.log(JSON.stringify(status, null, 2));
  if(!status.ok) process.exit(1);
}

try{
  main();
}catch(err){
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
}
