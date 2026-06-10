#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT } = require('../build/paths');

const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-foreground-audio-balance', 'latest.json');
const REQUIRED_CUES = Object.freeze([
  'attackCharge',
  'enemyShot',
  'enemyHit',
  'enemyBoom',
  'bossHit',
  'bossBoom',
  'playerShot'
]);

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

if(!fs.existsSync(REPORT)){
  fail('Aurora foreground audio balance report is missing. Run npm run harness:analyze:aurora-foreground-audio-balance first.', { report: rel(REPORT) });
}

let report;
try{
  report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
}catch(err){
  fail('Aurora foreground audio balance report is not valid JSON.', { report: rel(REPORT), error: String(err?.message || err) });
}

const issues = [];
if(report.artifactType !== 'aurora-foreground-audio-balance') issues.push('unexpected artifact type');
if(report.summary?.devReferenceAudioAvailable !== true) issues.push('localhost dev lane must have reference audio available');
if(report.summary?.publicSafePrivateClipLeakPass !== true) issues.push('public-safe simulation must not resolve private reference clips');
const scenarios = Array.isArray(report.scenarios) ? report.scenarios : [];
const dev = scenarios.find(scenario => scenario.id === 'devReference');
const publicSafe = scenarios.find(scenario => scenario.id === 'publicSafe');
if(!dev) issues.push('missing devReference scenario');
if(!publicSafe) issues.push('missing publicSafe scenario');
if(dev && !dev.stagePulse?.usesReferenceMedia) issues.push('devReference stagePulse should use reference media for local review');
if(publicSafe && publicSafe.stagePulse?.usesReferenceMedia) issues.push('publicSafe stagePulse must not use reference media');

const devRows = report.balance?.devReference?.rows || [];
for(const cue of REQUIRED_CUES){
  const row = devRows.find(entry => entry.cue === cue);
  if(!row){
    issues.push(`missing dev balance row for ${cue}`);
    continue;
  }
  if(row.audibleSeparationPass !== true){
    issues.push(`${cue} does not pass foreground-vs-pulse audibility separation`);
  }
  if(row.cueRolePass !== true){
    issues.push(`${cue} does not pass cue-role duration/readability expectations`);
  }
}

const weakRows = report.summary?.weakForegroundRows || [];
if(weakRows.length){
  issues.push(`weak foreground rows remain: ${weakRows.join(', ')}`);
}
const weakCueRoleRows = report.summary?.weakCueRoleRows || [];
if(weakCueRoleRows.length){
  issues.push(`weak cue-role rows remain: ${weakCueRoleRows.join(', ')}`);
}

if(issues.length){
  fail('Aurora foreground audio balance gate failed.', {
    report: rel(REPORT),
    issues,
    summary: report.summary
  });
}

console.log(JSON.stringify({
  ok: true,
  report: rel(REPORT),
  minForegroundRmsOverPulseDb: report.summary?.minForegroundRmsOverPulseDb,
  publicSafePrivateClipLeakPass: report.summary?.publicSafePrivateClipLeakPass
}, null, 2));
