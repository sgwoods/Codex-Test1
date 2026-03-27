#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, writePortableSummary } = require('./summary-path-util');

const ARTIFACT_ROOT = path.join(ROOT, 'harness-artifacts');

function walk(dir, out=[]){
  if(!fs.existsSync(dir)) return out;
  for(const ent of fs.readdirSync(dir, { withFileTypes: true })){
    const file = path.join(dir, ent.name);
    if(ent.isDirectory()) walk(file, out);
    else if(ent.isFile() && ent.name === 'summary.json') out.push(file);
  }
  return out;
}

function main(){
  const files = walk(ARTIFACT_ROOT);
  let updated = 0;
  for(const file of files){
    const before = fs.readFileSync(file, 'utf8');
    const summary = JSON.parse(before);
    const cleaned = writePortableSummary(file, summary);
    const after = JSON.stringify(cleaned, null, 2);
    if(before !== after) updated++;
  }
  console.log(JSON.stringify({ ok: true, scanned: files.length, updated }, null, 2));
}

main();
