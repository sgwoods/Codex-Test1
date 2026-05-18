#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const TRIAL_ROOT = path.join(ANALYSES, 'aurora-audio-runtime-trials');

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function walkReports(dir){
  const out = [];
  function walk(current){
    if(!fs.existsSync(current)) return;
    for(const entry of fs.readdirSync(current, { withFileTypes: true })){
      const full = path.join(current, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === 'report.json') out.push(full);
    }
  }
  walk(dir);
  return out.sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs || a.localeCompare(b));
}

function latestReport(){
  const pointer = path.join(TRIAL_ROOT, 'latest.json');
  if(fs.existsSync(pointer)){
    const data = readJson(pointer);
    if(data.latest){
      const full = path.join(ROOT, data.latest);
      if(fs.existsSync(full)) return full;
    }
  }
  const reports = walkReports(TRIAL_ROOT);
  return reports.length ? reports[reports.length - 1] : null;
}

function assert(condition, message, failures){
  if(!condition) failures.push(message);
}

function main(){
  const reportPath = latestReport();
  if(!reportPath){
    console.error('Missing aurora audio runtime-trial report.');
    process.exit(1);
  }
  const report = readJson(reportPath);
  const failures = [];
  assert(report.artifactType === 'aurora-audio-runtime-trial-decision', 'Unexpected artifactType.', failures);
  assert(!!report.generatedAt, 'Missing generatedAt.', failures);
  assert(!!report.cue, 'Missing cue.', failures);
  assert(!!report.candidate, 'Missing candidate.', failures);
  assert(['runtime-trial-accepted', 'runtime-trial-rejected', 'runtime-trial-inconclusive'].includes(report.decision?.status), 'Unexpected decision status.', failures);
  assert(typeof report.decision?.promoteRuntime === 'boolean', 'Decision must declare promoteRuntime boolean.', failures);
  assert(!!report.decision?.reason, 'Decision must include reason.', failures);
  assert(!!report.trialCandidateEvidence?.focusedCandidateReport, 'Missing focused candidate evidence.', failures);
  assert(!!report.trialCandidateEvidence?.promotionPrecheck, 'Missing promotion precheck evidence.', failures);
  assert(!!report.postTrialEvidence?.eventGap, 'Missing post-trial event-gap evidence.', failures);
  assert(!!report.postTrialEvidence?.quality, 'Missing post-trial quality evidence.', failures);
  assert(!!report.nextStep, 'Missing nextStep.', failures);
  if(report.decision?.status === 'runtime-trial-rejected'){
    assert(report.decision.promoteRuntime === false, 'Rejected runtime trial must not promote runtime.', failures);
    assert(/next|preserve|reject|runtime|promot/i.test(report.nextStep), 'Rejected runtime trial needs an actionable next step.', failures);
  }
  if(report.decision?.status === 'runtime-trial-accepted'){
    assert(report.decision.promoteRuntime === true, 'Accepted runtime trial must promote runtime.', failures);
  }
  if(failures.length){
    console.error(JSON.stringify({ ok: false, report: rel(reportPath), failures }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({
    ok: true,
    report: rel(reportPath),
    cue: report.cue,
    candidate: report.candidate,
    status: report.decision.status
  }, null, 2));
}

main();
