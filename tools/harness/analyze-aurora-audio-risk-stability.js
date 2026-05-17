#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const EVENT_GAP_ROOT = path.join(ANALYSES, 'aurora-audio-event-gap');
const OUT_ROOT = path.join(ANALYSES, 'aurora-audio-risk-stability');

function argValue(name, fallback = ''){
  const prefix = `--${name}=`;
  const inline = process.argv.find(arg => arg.startsWith(prefix));
  if(inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if(index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
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

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function walkReports(root){
  const reports = [];
  function walk(dir){
    if(!fs.existsSync(dir)) return;
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === 'report.json') reports.push(full);
    }
  }
  walk(root);
  return reports;
}

function mean(values){
  const nums = values.filter(Number.isFinite);
  return nums.length ? nums.reduce((sum, value) => sum + value, 0) / nums.length : null;
}

function median(values){
  const nums = values.filter(Number.isFinite).sort((a, b) => a - b);
  if(!nums.length) return null;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

function stddev(values){
  const nums = values.filter(Number.isFinite);
  if(nums.length < 2) return 0;
  const avg = mean(nums);
  return Math.sqrt(nums.reduce((sum, value) => sum + ((value - avg) ** 2), 0) / nums.length);
}

function minMax(values){
  const nums = values.filter(Number.isFinite);
  if(!nums.length) return { min: null, max: null, range: null };
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return { min, max, range: max - min };
}

function stabilityScore(range, sd){
  if(!Number.isFinite(range) && !Number.isFinite(sd)) return null;
  const penalty = (Number.isFinite(range) ? range * 1.7 : 0) + (Number.isFinite(sd) ? sd * 1.2 : 0);
  return round(Math.max(0, 10 - penalty), 2);
}

function sourceLabel(report, file){
  const metrics = report.source?.metrics || '';
  return {
    report: rel(file),
    generatedAt: report.generatedAt || '',
    commit: report.commit || '',
    dirty: report.dirty === true,
    metrics
  };
}

function latestReports(){
  const limit = Math.max(2, Number(argValue('limit', 8)) || 8);
  const commitFilter = argValue('commit', '');
  const reports = walkReports(EVENT_GAP_ROOT)
    .map(file => {
      try{
        const report = readJson(file);
        return report?.artifactType === 'aurora-audio-event-gap'
          ? { file, report, time: Date.parse(report.generatedAt || '') || fs.statSync(file).mtimeMs }
          : null;
      }catch{
        return null;
      }
    })
    .filter(Boolean)
    .filter(item => !commitFilter || item.report.commit === commitFilter)
    .sort((a, b) => b.time - a.time || b.file.localeCompare(a.file))
    .slice(0, limit)
    .reverse();
  return reports;
}

function groupCueRows(reports){
  const byCue = new Map();
  for(const item of reports){
    for(const row of item.report.comparedCueRisks || []){
      const cue = row.cue || '';
      if(!cue) continue;
      if(!byCue.has(cue)) byCue.set(cue, []);
      byCue.get(cue).push({
        source: sourceLabel(item.report, item.file),
        gapRisk10: Number(row.gapRisk10),
        worstSegmentRisk10: Number(row.worstSegmentRisk10),
        worstSegmentRole: row.worstSegmentRole || '',
        semanticScore10: Number(row.semanticScore10)
      });
    }
  }
  return byCue;
}

function summarizeCue(cue, rows){
  const gap = minMax(rows.map(row => row.gapRisk10));
  const segment = minMax(rows.map(row => row.worstSegmentRisk10));
  const semantics = minMax(rows.map(row => row.semanticScore10));
  const gapSd = stddev(rows.map(row => row.gapRisk10));
  const segmentSd = stddev(rows.map(row => row.worstSegmentRisk10));
  const segmentRoles = rows.reduce((acc, row) => {
    if(row.worstSegmentRole) acc[row.worstSegmentRole] = (acc[row.worstSegmentRole] || 0) + 1;
    return acc;
  }, {});
  const volatile = (gap.range || 0) >= 1 || (segment.range || 0) >= 1 || gapSd >= .35 || segmentSd >= .35;
  return {
    cue,
    sampleCount: rows.length,
    medianGapRisk10: round(median(rows.map(row => row.gapRisk10)), 2),
    gapRiskMin10: round(gap.min, 2),
    gapRiskMax10: round(gap.max, 2),
    gapRiskRange10: round(gap.range, 2),
    gapRiskStddev10: round(gapSd, 2),
    medianWorstSegmentRisk10: round(median(rows.map(row => row.worstSegmentRisk10)), 2),
    worstSegmentMin10: round(segment.min, 2),
    worstSegmentMax10: round(segment.max, 2),
    worstSegmentRange10: round(segment.range, 2),
    worstSegmentStddev10: round(segmentSd, 2),
    medianSemanticScore10: round(median(rows.map(row => row.semanticScore10)), 2),
    semanticRange10: round(semantics.range, 2),
    dominantWorstSegmentRole: Object.entries(segmentRoles).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || '',
    stabilityScore10: stabilityScore(Math.max(gap.range || 0, segment.range || 0), Math.max(gapSd, segmentSd)),
    volatile,
    read: volatile
      ? 'Volatile across repeated event-gap reads; require median/repeated confirmation before promoting runtime cue changes.'
      : 'Stable enough for the current event-gap scorer; single-run movement is more likely to represent a real cue change.',
    rows
  };
}

function markdown(report){
  const lines = [
    '# Aurora Audio Risk Stability',
    '',
    `Generated: \`${report.generatedAt}\``,
    `Reports analyzed: ${report.summary.reportCount}`,
    '',
    '## Why This Exists',
    '',
    'Repeated full-theme audio captures can move cue risk even when runtime cue definitions are unchanged. This report turns that movement into a first-class promotion guardrail so candidate loops do not mistake capture/scoring volatility for conformance gain.',
    '',
    '## Summary',
    '',
    `- Volatile cues: ${report.summary.volatileCueCount}`,
    `- Most volatile cue: \`${report.summary.mostVolatileCue || 'none'}\` (${report.summary.mostVolatileRange10 ?? 'n/a'}/10 range)`,
    `- Highest median gap cue: \`${report.summary.highestMedianGapCue || 'none'}\` (${report.summary.highestMedianGapRisk10 ?? 'n/a'}/10 median risk)`,
    `- Recommendation: ${report.recommendation}`,
    '',
    '## Cue Stability',
    '',
    '| Cue | Median Gap | Gap Range | Median Worst Segment | Segment Range | Stability | Read |',
    '| --- | ---: | ---: | ---: | ---: | ---: | --- |'
  ];
  report.cues.slice(0, 16).forEach(row => {
    lines.push(`| \`${row.cue}\` | ${row.medianGapRisk10 ?? 'n/a'} | ${row.gapRiskRange10 ?? 'n/a'} | ${row.medianWorstSegmentRisk10 ?? 'n/a'} | ${row.worstSegmentRange10 ?? 'n/a'} | ${row.stabilityScore10 ?? 'n/a'} | ${row.read} |`);
  });
  lines.push('', '## Source Reports', '');
  report.sources.forEach(source => lines.push(`- \`${source.report}\` (${source.generatedAt}, ${source.commit}${source.dirty ? ', dirty' : ''})`));
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main(){
  const reports = latestReports();
  if(reports.length < 2){
    throw new Error(`Need at least two audio event-gap reports to analyze stability; found ${reports.length}.`);
  }
  const byCue = groupCueRows(reports);
  const cues = [...byCue.entries()]
    .map(([cue, rows]) => summarizeCue(cue, rows))
    .filter(row => row.sampleCount >= 2)
    .sort((a, b) => {
      const ar = Math.max(a.gapRiskRange10 || 0, a.worstSegmentRange10 || 0);
      const br = Math.max(b.gapRiskRange10 || 0, b.worstSegmentRange10 || 0);
      return br - ar || (b.medianGapRisk10 || 0) - (a.medianGapRisk10 || 0) || a.cue.localeCompare(b.cue);
    });
  const volatile = cues.filter(row => row.volatile);
  const mostVolatile = cues[0] || null;
  const highestMedianGap = cues.slice().sort((a, b) => (b.medianGapRisk10 || 0) - (a.medianGapRisk10 || 0))[0] || null;
  const generatedAt = new Date().toISOString();
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const dirty = git(['status', '--short'], '').trim().length > 0;
  const runClock = generatedAt.slice(11, 19).replace(/:/g, '');
  const outDir = path.join(OUT_ROOT, `${generatedAt.slice(0, 10)}-${commit}${dirty ? '-dirty' : ''}-${runClock}`);
  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-audio-risk-stability',
    generatedAt,
    branch: git(['branch', '--show-current'], ''),
    commit,
    dirty,
    source: {
      eventGapRoot: rel(EVENT_GAP_ROOT),
      limit: reports.length
    },
    summary: {
      reportCount: reports.length,
      cueCount: cues.length,
      volatileCueCount: volatile.length,
      mostVolatileCue: mostVolatile?.cue || '',
      mostVolatileRange10: round(Math.max(mostVolatile?.gapRiskRange10 || 0, mostVolatile?.worstSegmentRange10 || 0), 2),
      highestMedianGapCue: highestMedianGap?.cue || '',
      highestMedianGapRisk10: highestMedianGap?.medianGapRisk10 ?? null
    },
    recommendation: volatile.length
      ? `Use median/repeated confirmation before promoting audio changes. Start by stabilizing ${mostVolatile?.cue || 'the most volatile cue'} scoring, then retest ${highestMedianGap?.cue || 'the highest median-risk cue'}.`
      : `Single-run event-gap movement is currently stable enough; tune ${highestMedianGap?.cue || 'the highest median-risk cue'} next.`,
    sources: reports.map(item => sourceLabel(item.report, item.file)),
    cues
  };
  writeJson(path.join(outDir, 'report.json'), report);
  fs.writeFileSync(path.join(outDir, 'README.md'), markdown(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  console.log(JSON.stringify({
    ok: true,
    report: rel(path.join(outDir, 'report.json')),
    latest: rel(path.join(OUT_ROOT, 'latest.json')),
    summary: report.summary,
    recommendation: report.recommendation
  }, null, 2));
}

try{
  main();
}catch(err){
  console.error(err && err.stack || err);
  process.exit(1);
}
