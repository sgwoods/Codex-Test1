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

function releaseTargetSections(){
  const releaseTargets = buildTable(
    ['Release cluster / focus', 'Aurora target', 'Aurora focus metrics', 'Guardians target', 'Guardians focus metrics', 'Release decision meaning'],
    [
      ['Current dev baseline', '8.8/10', 'audio 6.1; movement 8.1; stage opening 8.5; challenge timing 8.4; shell integrity 9.2', '7.4/10', 'maturity 6.7; gate coverage 9.2; public readiness 4.1; audio fit 4.8', 'Baseline for the next beta-candidate discussion.'],
      ['`1.3` Fidelity and Trust', '9.0/10', 'audio >= 7.2; movement >= 8.6; trust/fairness >= 9.3; shell integrity >= 9.4', '7.4/10', 'rack timing >= 6.4; movement pressure >= 6.1; visual identity >= 6.8; audio fit >= 5.2', 'Aurora can move beta if the weakest feel gaps improve and Guardians stays dev-only but credible.'],
      ['`1.4` Arcade Depth / Guardians 0.1 Preview', '9.2/10', 'level-depth >= 8.4; challenge-stage identity >= 8.6; later-level variation >= 8.2; audio >= 7.6', '7.8/10', 'frame-derived rack timing >= 7.2; dive paths >= 6.8; alien visuals >= 7.6; scoring model >= 7.5', 'Aurora gains real stage-by-stage depth; Guardians becomes a strong first preview, not a reskinned Aurora.'],
      ['`1.5` Flight Recorder and Shared Evidence', '9.3/10', 'replay/video evidence >= 8.8; published-run traceability >= 8.5; reference-event mapping >= 8.6', '8.2/10', 'source-video extraction >= 8.4; waveform/audio comparison >= 6.8; event-log durability >= 9.0', 'Shared video and evidence become release infrastructure for both applications.'],
      ['`1.6` Message to Pilot / Platform Shell', '9.4/10', 'popup containment >= 9.6; message channel >= 8.8; shell copy ownership >= 9.5', '8.5/10', 'platform integration >= 9.5; preview messaging >= 8.8; pack-boundary durability 10.0', 'Platinum feels like a coherent cabinet shell across multiple games.'],
      ['`2.0` Multi-Game Platinum Candidate', '9.5/10', 'arcade-depth stability >= 9.0; release evidence >= 9.2; pilot/replay operations >= 9.0', '9.0/10', 'playable conformance >= 8.6; scoring/progression >= 8.8; audio/visual identity >= 8.5; public readiness >= 8.5', 'Platinum can credibly claim more than one serious game experience.']
    ]
  );

  const metricTargets = buildTable(
    ['Metric family', 'Aurora current', 'Aurora next target', 'Guardians current', 'Guardians next target', 'Why it matters'],
    [
      ['Movement and pressure', '8.1/10', '8.6/10 in `1.3`; 8.8/10 in `1.4`', '6.1/10', 'runtime-vs-reference track comparison in `1.3`; 6.8/10 in `1.4`', 'This is the strongest direct feel signal during live play.'],
      ['Audio identity / acoustic fit', '6.1/10', '7.2/10 in `1.3`; 7.6/10 in `1.4`', '4.8/10', '5.2/10 in `1.3`; 6.8/10 in `1.5`', 'Audio is the weakest shared conformance area today.'],
      ['Visual identity', '9.2/10 shell integrity; game sprites not separately scored in the roll-up', 'add a visible arcade-depth visual score in `1.4`', '6.7/10', '6.8/10 in `1.3`; 7.6/10 in `1.4`', 'Guardians especially needs recognizably distinct alien silhouettes before beta-facing preview.'],
      ['Stage / rack / wave timing', 'stage opening 8.5; challenge timing 8.4', 'challenge and later-stage targets >= 8.6 in `1.4`', 'rack timing 6.4/10', 'runtime-vs-reference rack timing in `1.3`; 7.2/10 in `1.4`', 'Timing separates authentic arcade pressure from approximate motion.'],
      ['Scoring and progression', 'progression/persona 8.8; shot/hit 10.0', 'level-depth and scoring stability >= 9.0 by `2.0`', 'single-shot threat/scoring 7.5', '7.6 in `1.4`; 8.8 by `2.0`', 'Guardians should not publish persistent scoreboards until scoring is reference-aligned.'],
      ['Evidence and replay durability', 'scorecard artifacts exist; video publishing is not yet a full product surface', 'replay/video evidence >= 8.8 in `1.5`', 'evidence durability 9.1', 'runtime-vs-reference tracking durability >= 9.2 in `1.5`', 'Shared videos and source-controlled artifacts should become normal release evidence.'],
      ['Platform boundaries and shell containment', 'shell integrity 9.2', 'popup/message/shell containment >= 9.6 in `1.6`', 'platform boundaries 10.0', 'keep 10.0 through `2.0`', 'Game work must not leak mechanics across applications; shared behavior belongs in Platinum.']
    ]
  );

  return [
    '## Release Cluster Conformance Targets',
    '',
    'These are planning targets, not release promises. They give each upcoming cluster a measurable quality bar so Aurora and Guardians can improve for different reasons without blurring their application boundaries. Aurora targets use the release-quality scorecard. Guardians targets use the preview-reference scorecard until it becomes a public playable game.',
    '',
    releaseTargets,
    '',
    '```mermaid',
    'xychart-beta',
    '  title "Overall Conformance Targets By Release Cluster"',
    '  x-axis ["Current", "1.3", "1.4", "1.5", "1.6", "2.0"]',
    '  y-axis "Score / 10" 0 --> 10',
    '  line "Aurora Galactica" [8.8, 9.0, 9.2, 9.3, 9.4, 9.5]',
    '  line "Galaxy Guardians" [7.4, 7.4, 7.8, 8.2, 8.5, 9.0]',
    '```',
    '',
    '## Application Metric Target Matrix',
    '',
    metricTargets
  ];
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
    ...releaseTargetSections(),
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
