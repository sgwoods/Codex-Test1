#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const SOURCE_ROOT = path.join(ANALYSES, 'aurora-audio-theme-comparison');
const OUT_ROOT = path.join(ANALYSES, 'aurora-stage-pulse-cadence');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function latestMetrics(){
  const candidates = [];
  function walk(dir){
    if(!fs.existsSync(dir)) return;
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === 'metrics.json') candidates.push(full);
    }
  }
  walk(SOURCE_ROOT);
  candidates.sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs || a.localeCompare(b));
  if(!candidates.length) fail(`No audio theme comparison metrics found under ${rel(SOURCE_ROOT)}.`);
  return candidates[candidates.length - 1];
}

function latestFocus(){
  const file = path.join(ANALYSES, 'aurora-audio-cue-candidates', 'latest-formation-pulse.json');
  return fs.existsSync(file) ? readJson(file) : null;
}

function markdown(report){
  const cadence = report.cadencePressureAnalysis;
  const lines = [
    '# Aurora Stage Pulse Cadence Pressure Analysis',
    '',
    `Generated: ${report.generatedAt}`,
    `Commit: ${report.commit}${report.dirty ? ' (dirty)' : ''}`,
    '',
    '## Problem',
    '',
    report.problem,
    '',
    '## Current Read',
    '',
    `- Cadence pressure score: \`${cadence.score10}/10\``,
    `- Weakest axis: \`${cadence.weakestAxis}\``,
    `- Highest event-gap cue: \`${report.eventGapContext.highestRiskCue}\` risk \`${report.eventGapContext.highestRisk10}/10\``,
    `- Latest candidate decision: \`${report.candidateContext.decision.status}\``,
    '',
    '| Axis | Score | Aurora | Reference | Meaning |',
    '| --- | ---: | --- | --- | --- |'
  ];
  for(const axis of cadence.axes || []){
    lines.push(`| ${axis.label} | ${axis.score10} | \`${JSON.stringify(axis.aurora)}\` | \`${JSON.stringify(axis.reference)}\` | ${axis.meaning} |`);
  }
  lines.push(
    '',
    '## Strategy',
    '',
    report.strategy,
    '',
    '## Next Step',
    '',
    report.nextStep,
    ''
  );
  return `${lines.join('\n')}\n`;
}

function main(){
  const metricsPath = latestMetrics();
  const metrics = readJson(metricsPath);
  const stage = (metrics.items || []).find(item => item.cue === 'stagePulse' || item.id === 'formation-pulse');
  if(!stage) fail('No stagePulse item found in latest audio theme comparison metrics.', { metrics: rel(metricsPath) });
  if(!stage.cadencePressureAnalysis) fail('Latest metrics do not include cadencePressureAnalysis. Rerun npm run harness:analyze-audio-theme-comparison.', { metrics: rel(metricsPath) });

  const eventGapPath = path.join(ANALYSES, 'aurora-audio-event-gap', 'latest.json');
  const eventGap = fs.existsSync(eventGapPath) ? readJson(eventGapPath) : {};
  const focus = latestFocus();
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const dirty = git(['status', '--short'], '').trim().length > 0;
  const stamp = new Date().toISOString().slice(0, 10);
  const outDir = path.join(OUT_ROOT, `${stamp}-${commit}${dirty ? '-dirty' : ''}`);
  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-stage-pulse-cadence-pressure-analysis',
    generatedAt: new Date().toISOString(),
    branch: git(['branch', '--show-current'], 'unknown'),
    commit,
    dirty,
    problem: 'Aurora stagePulse is the leading audio segment gap. As gameplay pressure, it should read as a low, calm formation cadence bed rather than a bright foreground tick.',
    strategy: 'Use the full browser-rendered audio-theme comparison as the source of truth, then summarize the stagePulse cue with gameplay-facing cadence axes: low-band body, brightness control, zero-crossing calm, gain match, duration pocket, and envelope smoothness.',
    successMeasure: 'Future candidates should raise cadence pressure score while also clearing the repeated-capture focus gates and the full audio event-gap report before runtime promotion.',
    source: {
      audioThemeMetrics: rel(metricsPath),
      eventGap: fs.existsSync(eventGapPath) ? rel(eventGapPath) : null,
      candidateFocus: focus ? rel(path.join(ANALYSES, 'aurora-audio-cue-candidates', 'latest-formation-pulse.json')) : null
    },
    cadencePressureAnalysis: stage.cadencePressureAnalysis,
    eventGapContext: {
      highestRiskCue: eventGap.summary?.highestRiskCue || '',
      highestRiskLabel: eventGap.summary?.highestRiskLabel || '',
      highestRisk10: eventGap.summary?.highestRisk10 ?? null,
      highestSegmentRiskCue: eventGap.summary?.highestSegmentRiskCue || '',
      highestSegmentRiskRole: eventGap.summary?.highestSegmentRiskRole || '',
      averageWorstSegmentRisk10: eventGap.summary?.averageWorstSegmentRisk10 ?? null
    },
    candidateContext: {
      decision: focus?.decision || { status: 'missing' },
      topCandidates: (focus?.candidates || []).slice(0, 6).map(candidate => ({
        id: candidate.id,
        risk10: candidate.risk10,
        worstSegmentRisk10: candidate.worstSegmentRisk10,
        keeperRead: candidate.keeperRead,
        stability: candidate.stability || null
      }))
    },
    nextStep: 'Add a cadence-specific candidate generator that jointly optimizes low-band body, brightness control, zero-crossing calm, and gain. Promote only after both repeated focus gates and full audio-theme comparison improve.'
  };
  const reportPath = path.join(outDir, 'report.json');
  const readmePath = path.join(outDir, 'README.md');
  writeJson(reportPath, report);
  fs.writeFileSync(readmePath, markdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  console.log(JSON.stringify({ ok: true, report: rel(reportPath), readme: rel(readmePath), latest: rel(path.join(OUT_ROOT, 'latest.json')), cadencePressureScore10: report.cadencePressureAnalysis.score10 }, null, 2));
}

main();
