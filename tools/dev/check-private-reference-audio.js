#!/usr/bin/env node
const { privateReferenceAudioStatus } = require('./private-reference-audio');

function main(){
  const repair = process.argv.includes('--repair');
  const status = privateReferenceAudioStatus({ repair });
  console.log(JSON.stringify(status, null, 2));
  if(!status.ok) process.exit(1);
}

try{
  main();
}catch(err){
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
}
