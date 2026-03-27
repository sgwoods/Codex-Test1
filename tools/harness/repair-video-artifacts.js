#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { writePortableSummary } = require('./summary-path-util');
const { ensureUsableVideoArtifact, repairedPathFor } = require('./video-artifact-util');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACTS = path.join(ROOT, 'harness-artifacts');

function walk(dir, out=[]){
  for(const ent of fs.readdirSync(dir, { withFileTypes: true })){
    const file = path.join(dir, ent.name);
    if(ent.isDirectory()) walk(file, out);
    else if(ent.isFile() && ent.name.endsWith('.webm')) out.push(file);
  }
  return out;
}

function loadSummary(file){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch{
    return null;
  }
}

function saveSummary(file, summary){
  writePortableSummary(file, summary);
}

function main(){
  const files = walk(ARTIFACTS);
  const counts = {
    total: files.length,
    alreadyUsable: 0,
    repaired: 0,
    failed: 0,
    unrecoverable: 0
  };
  const examples = [];

  for(const file of files){
    const dir = path.dirname(file);
    const summaryFile = path.join(dir, 'summary.json');
    const summary = loadSummary(summaryFile);
    const expectedDuration = +(summary?.analysis?.duration || 0);
    try{
      const quality = ensureUsableVideoArtifact(file, expectedDuration);
      if(quality.repaired) counts.repaired++;
      else counts.alreadyUsable++;
      if(!quality.ok) counts.unrecoverable++;
      const repairedFile = repairedPathFor(file);
      if(summary){
        summary.artifactQuality = quality;
        summary.files = Array.isArray(summary.files) ? summary.files.slice() : [];
        if(fs.existsSync(repairedFile) && !summary.files.includes(repairedFile)) summary.files.unshift(repairedFile);
        saveSummary(summaryFile, summary);
      }
      if(examples.length < 10 && (quality.repaired || !quality.ok)){
        examples.push({
          file,
          repaired: !!quality.repaired,
          ok: !!quality.ok,
          issues: quality.issues,
          formatDuration: quality.formatDuration,
          expectedDuration
        });
      }
    }catch(err){
      counts.failed++;
      if(examples.length < 10){
        examples.push({
          file,
          error: err.message,
          payload: err.payload || null
        });
      }
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    counts,
    examples
  };
  const reportFile = path.join(ARTIFACTS, 'video-repair-report.json');
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ reportFile, ...report }, null, 2));
  if(counts.failed) process.exit(1);
}

main();
