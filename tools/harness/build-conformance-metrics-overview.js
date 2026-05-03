#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'CONFORMANCE_METRICS_OVERVIEW.md');
const AURORA_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'quality-conformance');
const GUARDIANS_CONFORMANCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'reference-conformance-0.1.json');

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function walkReports(dir){
  const found = [];
  function walk(current){
    if(!fs.existsSync(current)) return;
    for(const entry of fs.readdirSync(current, { withFileTypes: true })){
      const full = path.join(current, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === 'report.json') found.push(full);
    }
  }
  walk(dir);
  return found.sort();
}

function latestAuroraReport(){
  const reports = walkReports(AURORA_ROOT);
  if(!reports.length) throw new Error(`No Aurora quality-conformance reports found in ${rel(AURORA_ROOT)}`);
  const committed = reports.filter(file => !file.includes('-dirty/'));
  return (committed.length ? committed : reports)[(committed.length ? committed : reports).length - 1];
}

function mdEscape(value){
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n+/g, '<br>');
}

function score(value){
  return value == null ? '--' : `${value}/10`;
}

function buildTable(headers, rows){
  const head = `| ${headers.map(mdEscape).join(' | ')} |`;
  const rule = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map(row => `| ${row.map(mdEscape).join(' | ')} |`);
  return [head, rule, ...body].join('\n');
}

function main(){
  const auroraReportPath = latestAuroraReport();
  const aurora = readJson(auroraReportPath);
  const guardians = readJson(GUARDIANS_CONFORMANCE);
  const generatedAt = new Date().toISOString();

  const overallTable = buildTable(
    ['Game / scope', 'Primary score', 'Secondary scores', 'Status', 'Weakest current area', 'Evidence'],
    [
      [
        'Aurora Galactica current dev line',
        score(aurora.summary.overallScore10),
        `strongest ${aurora.summary.strongestCategory.label} ${score(aurora.summary.strongestCategory.score10)}; weakest ${aurora.summary.weakestCategory.label} ${score(aurora.summary.weakestCategory.score10)}`,
        'release-quality conformance score',
        `${aurora.summary.weakestCategory.label} (${score(aurora.summary.weakestCategory.score10)})`,
        rel(auroraReportPath)
      ],
      [
        'Galaxy Guardians 0.1 dev preview',
        score(guardians.summary.referenceConformanceScore10),
        `maturity ${score(guardians.summary.referenceMaturityScore10)}; gate coverage ${score(guardians.summary.implementationGateCoverageScore10)}; public readiness ${score(guardians.summary.publicReleaseReadinessScore10)}`,
        guardians.status,
        (guardians.categories || []).slice().sort((a, b) => a.score10 - b.score10)[0]?.label || '--',
        rel(GUARDIANS_CONFORMANCE)
      ]
    ]
  );

  const guardiansTable = buildTable(
    ['Metric', 'Weight', 'Score', 'Evidence level', 'Current read', 'Remaining gap'],
    (guardians.categories || []).map(category => [
      category.label,
      category.weight,
      score(category.score10),
      category.evidenceLevel,
      category.currentRead,
      category.remainingGap
    ])
  );

  const auroraTable = buildTable(
    ['Metric', 'Score', 'Evidence', 'Current read'],
    (aurora.categories || []).map(category => [
      category.label,
      score(category.score10),
      (category.evidence || []).join(', '),
      category.read
    ])
  );

  const lines = [
    '# Conformance Metrics Overview',
    '',
    `Generated: \`${generatedAt}\``,
    '',
    'This document summarizes the current conformance scoring model for both the shipped Aurora application and the Galaxy Guardians 0.1 development preview. Aurora uses the release-quality scorecard; Guardians uses a reference-conformance preview metric set that is intentionally more conservative because its Galaxian evidence is still being promoted from source footage into frame-level measurements.',
    '',
    '## Overall Comparison',
    '',
    overallTable,
    '',
    '## Galaxy Guardians 0.1 Preview Metrics',
    '',
    guardiansTable,
    '',
    '## Aurora Galactica Current Metrics',
    '',
    auroraTable,
    '',
    '## Guardians Scoring Decision',
    '',
    'Guardians preview scoring should exist locally now, and it does: the dev runtime awards points by alien role, formation/dive state, and flagship escort count, with a harnessed contract in `npm run harness:check:galaxy-guardians-threat-scoring`. Persisted leaderboard submission should wait until the Galaxian score-advance table, wave progression, and public-release scoring policy are closer to reference conformance.',
    '',
    '## Current Guardians Promotion Priorities',
    '',
    ...(guardians.nextMetricPromotions || []).map(item => `- ${item}`),
    ''
  ];

  fs.writeFileSync(OUT, `${lines.join('\n')}\n`);
  console.log(JSON.stringify({
    ok: true,
    output: rel(OUT),
    auroraReport: rel(auroraReportPath),
    guardiansConformance: rel(GUARDIANS_CONFORMANCE),
    auroraOverallScore10: aurora.summary.overallScore10,
    guardiansReferenceScore10: guardians.summary.referenceConformanceScore10
  }, null, 2));
}

main();
