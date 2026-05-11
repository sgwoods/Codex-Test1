#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-audio-cue-contracts', 'latest.json');

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function fail(message, extra = {}){
  console.error(JSON.stringify({ ok: false, message, ...extra }, null, 2));
  process.exit(1);
}

if(!fs.existsSync(REPORT)){
  fail('Missing latest Aurora audio cue contract analysis.', {
    expected: path.relative(ROOT, REPORT)
  });
}

const report = readJson(REPORT);
const summary = report.summary || {};
const cues = report.cues || [];
const requiredCues = ['stagePulse', 'enemyHit', 'enemyBoom', 'bossHit', 'bossBoom', 'rescueJoin', 'playerHit', 'challengePerfect'];
const cueSet = new Set(cues.map(cue => cue.cue));
const missing = requiredCues.filter(cue => !cueSet.has(cue));
if(missing.length) fail('Audio cue contract analysis is missing required priority cues.', { missing });
if(+summary.contractCount < requiredCues.length) fail('Audio cue contract count is too low.', { summary });
if(+summary.averageReadinessScore10 < 8) fail('Audio cue contract readiness is below the process gate.', { summary });
if(!summary.highestRiskCue) fail('Audio cue contract analysis did not identify a highest-risk cue.', { summary });
if(!report.nextStep || !/contract-aware|candidate|stagePulse|audio/i.test(report.nextStep)){
  fail('Audio cue contract analysis lacks an actionable next step.', { nextStep: report.nextStep || '' });
}

const malformed = cues.filter(cue => {
  const scores = cue.scores || {};
  return !cue.playerMeaning
    || !cue.eventShape?.structure
    || !cue.themeLatitude?.defaultLane
    || !Number.isFinite(+scores.completenessScore10)
    || !Number.isFinite(+scores.referenceGroundingScore10)
    || !Number.isFinite(+scores.runtimeEvidenceScore10)
    || !Number.isFinite(+scores.themeLatitudeScore10)
    || !Number.isFinite(+scores.readinessScore10);
});
if(malformed.length){
  fail('One or more audio cue contracts is missing required scored fields.', {
    malformed: malformed.map(cue => cue.cue)
  });
}

console.log(JSON.stringify({
  ok: true,
  report: path.relative(ROOT, REPORT).split(path.sep).join('/'),
  summary,
  nextStep: report.nextStep
}, null, 2));
