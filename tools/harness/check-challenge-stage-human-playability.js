#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-human-playability', 'latest.json');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function main(){
  if(!fs.existsSync(REPORT)) fail(`Missing challenge-stage human-playability report: ${REPORT}`);
  const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
  const focusRows = Array.isArray(report.focusRows) ? report.focusRows : [];
  if(focusRows.length !== 5) fail('Expected exactly five focus challenge-stage rows', report.summary);
  for(const row of focusRows){
    if(!row.label || !row.humanProblem || !row.recommendation){
      fail('Each focus row must have a label, human problem, and recommendation', row);
    }
    if(!Number.isFinite(+row.metrics?.humanPerfectPotential10)){
      fail('Each focus row must include a human-perfect-potential metric', row);
    }
  }
  if(!String(report.summary?.nextBestEffort || '').trim()){
    fail('Report summary must include the next best effort', report.summary);
  }
  console.log(JSON.stringify({ ok: true, summary: report.summary }, null, 2));
}

main();
