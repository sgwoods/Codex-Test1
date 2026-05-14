#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const LATEST = path.join(ROOT, 'reference-artifacts', 'analyses', 'code-review', 'latest.json');
const EXCLUDED_PREFIXES = [
  'reference-artifacts/analyses/code-review/',
  'reference-artifacts/analyses/review-learning/'
];

function git(args, fallback = ''){
  try{
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function currentChangedFiles(report){
  const baseCommit = report.baseCommit || git(['merge-base', 'HEAD', report.baseRef || 'origin/main']);
  const committed = git(['diff', '--name-only', `${baseCommit}..HEAD`]).split('\n').filter(Boolean);
  const dirty = git(['status', '--short']).split('\n').filter(Boolean).map(line => line.slice(2).trim()).filter(Boolean);
  return [...new Set([...committed, ...dirty])]
    .filter(file => !EXCLUDED_PREFIXES.some(prefix => file.startsWith(prefix)))
    .sort();
}

function packetChangedFiles(report){
  return [...new Set((report.changedFiles || []).map(row => row.file))]
    .filter(file => !EXCLUDED_PREFIXES.some(prefix => file.startsWith(prefix)))
    .sort();
}

function main(){
  if(!fs.existsSync(LATEST)){
    fail('Code review packet missing. Run npm run review:code before hosted dev publish.', { expected: path.relative(ROOT, LATEST) });
  }
  const report = JSON.parse(fs.readFileSync(LATEST, 'utf8'));
  const blockers = (report.automaticFindings || []).filter(item => item.severity === 'P0' || item.severity === 'P1');
  const packetFiles = packetChangedFiles(report);
  const currentFiles = currentChangedFiles(report);
  const missingFromPacket = currentFiles.filter(file => !packetFiles.includes(file));
  const noLongerCurrent = packetFiles.filter(file => !currentFiles.includes(file));
  if(missingFromPacket.length || noLongerCurrent.length){
    fail('Code review packet is stale for the current changed source set. Run npm run review:code.', {
      missingFromPacket,
      noLongerCurrent
    });
  }
  if(blockers.length){
    fail('Code review gate blocked automatic P0/P1 findings.', { blockers });
  }
  console.log(JSON.stringify({
    ok: true,
    packet: path.relative(ROOT, LATEST),
    generatedAt: report.generatedAt,
    changedFileCount: packetFiles.length,
    p0: report.summary?.p0 || 0,
    p1: report.summary?.p1 || 0,
    p2: report.summary?.p2 || 0,
    p3: report.summary?.p3 || 0,
    recommendedChecks: report.recommendedChecks || []
  }, null, 2));
}

main();
