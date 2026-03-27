#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT, findAbsoluteSummaryPaths, sanitizeSummary } = require('./summary-path-util');

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

function assertSanitizerFixture(){
  const runDir = path.join(ROOT, 'harness-artifacts', 'checks', 'fixture-run');
  const sample = {
    source: path.join(ROOT, 'tools', 'harness', 'scenarios', 'full-run-persona.json'),
    outDir: runDir,
    files: [
      path.join(runDir, 'neo-galaga-session-ngt-1.json'),
      path.join(runDir, 'neo-galaga-video-ngt-1.review.webm')
    ],
    artifactQuality: {
      file: path.join(runDir, 'neo-galaga-video-ngt-1.review.webm'),
      sourceFile: path.join(runDir, 'neo-galaga-video-ngt-1.webm')
    },
    analysis: {
      video: {
        file: path.join(runDir, 'neo-galaga-video-ngt-1.review.webm')
      }
    },
    importedSource: {
      source: '/Users/otherperson/Downloads'
    }
  };
  const cleaned = sanitizeSummary(sample, runDir);
  const findings = findAbsoluteSummaryPaths(cleaned);
  if(findings.length){
    throw new Error(`sanitizer fixture still contains absolute paths: ${JSON.stringify(findings, null, 2)}`);
  }
}

function main(){
  assertSanitizerFixture();
  const failures = [];
  const files = walk(ARTIFACT_ROOT);
  for(const file of files){
    let summary = null;
    try{
      summary = JSON.parse(fs.readFileSync(file, 'utf8'));
    }catch(err){
      failures.push({ file, error: `invalid json: ${err.message}` });
      continue;
    }
    const findings = findAbsoluteSummaryPaths(summary);
    if(findings.length){
      failures.push({
        file: path.relative(ROOT, file),
        findings
      });
    }
  }
  if(failures.length){
    console.error(JSON.stringify({
      ok: false,
      checked: files.length,
      failureCount: failures.length,
      failures: failures.slice(0, 20)
    }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, checked: files.length }, null, 2));
}

main();
