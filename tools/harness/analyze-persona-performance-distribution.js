#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HARNESS_ARTIFACTS = path.join(ROOT, 'harness-artifacts');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'persona-performance-distribution');
const PERSONA_ORDER = ['novice', 'advanced', 'expert', 'professional'];
const PERSONA_LABELS = {
  novice: 'Beginner',
  advanced: 'Intermediate',
  expert: 'Expert',
  professional: 'Professional'
};
const PERSONA_COLORS = {
  novice: '#7ac3ff',
  advanced: '#69e2a7',
  expert: '#ffe174',
  professional: '#ff7f9f'
};

function parseArgs(argv){
  const args = {};
  for(let i = 0; i < argv.length; i++){
    const token = argv[i];
    if(!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if(!next || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function rel(file){
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function esc(value){
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function gitShortCommit(){
  const run = spawnSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' });
  return run.status === 0 ? run.stdout.trim() : 'unknown';
}

function findLatestBatchDir(){
  if(!fs.existsSync(HARNESS_ARTIFACTS)) return null;
  return fs.readdirSync(HARNESS_ARTIFACTS, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && /^batch-distribution-/.test(entry.name))
    .map(entry => path.join(HARNESS_ARTIFACTS, entry.name))
    .filter(dir => fs.existsSync(path.join(dir, 'batch-report.json')))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0] || null;
}

function listSummaryFiles(dir){
  const out = [];
  for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
    const full = path.join(dir, entry.name);
    if(entry.isDirectory()){
      const summary = path.join(full, 'summary.json');
      if(fs.existsSync(summary)) out.push(summary);
    }
  }
  return out;
}

function avg(values){
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function percentile(values, p){
  if(!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const raw = (sorted.length - 1) * p;
  const lo = Math.floor(raw);
  const hi = Math.ceil(raw);
  if(lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (raw - lo);
}

function fixed(value, digits = 2){
  return +Number(value || 0).toFixed(digits);
}

function stats(values, digits = 2){
  return {
    count: values.length,
    avg: fixed(avg(values), digits),
    median: fixed(percentile(values, 0.5), digits),
    min: fixed(values.length ? Math.min(...values) : 0, digits),
    max: fixed(values.length ? Math.max(...values) : 0, digits),
    p10: fixed(percentile(values, 0.1), digits),
    p90: fixed(percentile(values, 0.9), digits)
  };
}

function challengeHitRate(summary){
  const clears = summary.analysis?.challengeClears || [];
  const totals = clears.reduce((acc, clear) => {
    acc.hits += +clear.hits || 0;
    acc.total += +clear.total || 0;
    return acc;
  }, { hits: 0, total: 0 });
  return totals.total ? totals.hits / totals.total : 0;
}

function recordingStatus(summary, metadata = {}){
  const video = summary.analysis?.video || {};
  if(video.status === 'not_requested' || video.expected === false || summary.recording?.requested === false){
    return {
      status: 'not_requested',
      audio: null,
      file: null,
      expected: false,
      reason: 'video recording disabled for this run'
    };
  }
  if(video.file || video.status === 'recorded'){
    return {
      status: 'recorded',
      audio: video.audio === true ? true : video.audio === false ? false : null,
      file: video.file || null,
      expected: true,
      reason: video.audio === false ? 'recorded video has no audio stream' : 'recorded video artifact'
    };
  }
  if(video.error === 'no video file found' && metadata.batchProfile === 'distribution'){
    return {
      status: 'not_requested',
      audio: null,
      file: null,
      expected: false,
      reason: 'distribution batches run session-only by default for throughput'
    };
  }
  return {
    status: video.status || 'missing',
    audio: video.audio === true ? true : video.audio === false ? false : null,
    file: video.file || null,
    expected: true,
    reason: video.error || 'video status unavailable'
  };
}

function runRow(summaryFile, metadata = {}){
  const summary = readJson(summaryFile);
  const losses = summary.analysis?.shipLost || [];
  const duration = +(summary.analysis?.duration || summary.state?.simT || 0);
  const score = +(summary.state?.score || 0);
  const recording = recordingStatus(summary, metadata);
  return {
    persona: summary.persona || 'default',
    label: PERSONA_LABELS[summary.persona] || summary.persona || 'Default',
    seed: +(summary.seed || 0),
    score,
    stageReached: +(summary.state?.stage || 0),
    durationSec: fixed(duration, 3),
    durationMin: fixed(duration / 60, 3),
    scorePerMinute: duration ? fixed(score / (duration / 60), 2) : 0,
    livesLeft: +(summary.state?.lives || 0),
    shipLosses: losses.length,
    stageClears: (summary.analysis?.stageClears || []).length,
    challengeClears: (summary.analysis?.challengeClears || []).length,
    challengeHitRate: fixed(challengeHitRate(summary), 4),
    gameOver: !summary.state?.started && +(summary.state?.lives || 0) === 0,
    recordingStatus: recording.status,
    recordingAudio: recording.audio,
    recordingExpected: recording.expected,
    recordingReason: recording.reason,
    sourceSummary: rel(summaryFile)
  };
}

function bucketRows(rows, persona){
  return rows
    .filter(row => row.persona === persona)
    .sort((a, b) => a.seed - b.seed);
}

function summarizePersona(rows, persona){
  const items = bucketRows(rows, persona);
  return {
    persona,
    label: PERSONA_LABELS[persona] || persona,
    runCount: items.length,
    seedRange: items.length ? `${items[0].seed}-${items[items.length - 1].seed}` : '',
    score: stats(items.map(row => row.score), 0),
    stageReached: stats(items.map(row => row.stageReached), 2),
    durationSec: stats(items.map(row => row.durationSec), 2),
    durationMin: stats(items.map(row => row.durationMin), 2),
    scorePerMinute: stats(items.map(row => row.scorePerMinute), 0),
    shipLosses: stats(items.map(row => row.shipLosses), 2),
    livesLeft: stats(items.map(row => row.livesLeft), 2),
    stageClears: stats(items.map(row => row.stageClears), 2),
    challengeClears: stats(items.map(row => row.challengeClears), 2),
    challengeHitRate: stats(items.map(row => row.challengeHitRate), 4),
    gameOverRate: fixed(items.filter(row => row.gameOver).length / Math.max(1, items.length), 3)
  };
}

function buildFindings(summaryRows){
  const findings = [];
  const byPersona = new Map(summaryRows.map(row => [row.persona, row]));
  for(let i = 1; i < PERSONA_ORDER.length; i++){
    const prev = byPersona.get(PERSONA_ORDER[i - 1]);
    const next = byPersona.get(PERSONA_ORDER[i]);
    if(!prev || !next) continue;
    if(next.stageReached.avg < prev.stageReached.avg){
      findings.push({
        priority: 1,
        title: 'Persona stage progression is out of order',
        detail: `${next.label} averaged stage ${next.stageReached.avg}, below ${prev.label} at ${prev.stageReached.avg}.`
      });
    }
    if(next.score.avg < prev.score.avg){
      findings.push({
        priority: 1,
        title: 'Persona score progression is out of order',
        detail: `${next.label} averaged ${next.score.avg} points, below ${prev.label} at ${prev.score.avg}.`
      });
    }
  }
  return findings;
}

function buildRecordingEvidence(rows){
  const evidence = {
    totalRuns: rows.length,
    recordedVideos: rows.filter(row => row.recordingStatus === 'recorded').length,
    audioCheckedVideos: rows.filter(row => row.recordingStatus === 'recorded' && row.recordingAudio !== null).length,
    audioFailures: rows.filter(row => row.recordingStatus === 'recorded' && row.recordingAudio === false).length,
    videoNotRequested: rows.filter(row => row.recordingStatus === 'not_requested').length,
    missingExpectedVideos: rows.filter(row => row.recordingExpected !== false && row.recordingStatus !== 'recorded').length
  };
  evidence.mode = evidence.videoNotRequested === evidence.totalRuns
    ? 'session-only distribution batch'
    : evidence.recordedVideos
      ? 'mixed video/session evidence'
      : 'video evidence unavailable';
  evidence.read = evidence.videoNotRequested === evidence.totalRuns
    ? 'This persona distribution prioritized local CPU throughput and deterministic JSON/session logs; it should not be read as recorder audio proof.'
    : 'Recorded video rows can be used for recorder audio confidence; missing expected videos should be investigated before using clips as release evidence.';
  return evidence;
}

function xScale(index, count, left, width){
  return count <= 1 ? left : left + (index / (count - 1)) * width;
}

function yScale(value, max, top, height){
  const safeMax = Math.max(1, max);
  return top + height - (value / safeMax) * height;
}

function pointsFor(rows, field, max, left, top, width, height){
  return rows.map((row, i) => {
    const x = xScale(i, rows.length, left, width);
    const y = yScale(row[field], max, top, height);
    return `${fixed(x, 1)},${fixed(y, 1)}`;
  }).join(' ');
}

function axisTicks(max, count = 4){
  const ticks = [];
  for(let i = 0; i <= count; i++) ticks.push((max / count) * i);
  return ticks;
}

function renderChart(rows, summaryRows){
  const width = 1100;
  const height = 690;
  const chartLeft = 78;
  const chartWidth = 900;
  const panelHeight = 220;
  const scoreTop = 108;
  const stageTop = 392;
  const scoreMax = Math.ceil(Math.max(1, ...rows.map(row => row.score)) / 10000) * 10000;
  const stageMax = Math.ceil(Math.max(1, ...rows.map(row => row.stageReached)) / 2) * 2;
  const runMax = Math.max(1, ...summaryRows.map(row => row.runCount));
  const legend = PERSONA_ORDER.map((persona, i) => {
    const x = 820;
    const y = 32 + i * 24;
    return `<g><rect x="${x}" y="${y - 10}" width="12" height="12" rx="2" fill="${PERSONA_COLORS[persona]}"/><text x="${x + 20}" y="${y}" class="legend">${esc(PERSONA_LABELS[persona])}</text></g>`;
  }).join('');
  const scoreLines = PERSONA_ORDER.map(persona => {
    const items = bucketRows(rows, persona);
    if(!items.length) return '';
    const points = pointsFor(items, 'score', scoreMax, chartLeft, scoreTop, chartWidth, panelHeight);
    return `<polyline points="${points}" fill="none" stroke="${PERSONA_COLORS[persona]}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
  }).join('\n');
  const stageLines = PERSONA_ORDER.map(persona => {
    const items = bucketRows(rows, persona);
    if(!items.length) return '';
    const points = pointsFor(items, 'stageReached', stageMax, chartLeft, stageTop, chartWidth, panelHeight);
    return `<polyline points="${points}" fill="none" stroke="${PERSONA_COLORS[persona]}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
  }).join('\n');
  const scoreTicks = axisTicks(scoreMax).map(value => {
    const y = yScale(value, scoreMax, scoreTop, panelHeight);
    return `<line x1="${chartLeft}" x2="${chartLeft + chartWidth}" y1="${y}" y2="${y}" class="grid"/><text x="${chartLeft - 14}" y="${y + 4}" class="tick" text-anchor="end">${Math.round(value / 1000)}k</text>`;
  }).join('');
  const stageTicks = axisTicks(stageMax).map(value => {
    const y = yScale(value, stageMax, stageTop, panelHeight);
    return `<line x1="${chartLeft}" x2="${chartLeft + chartWidth}" y1="${y}" y2="${y}" class="grid"/><text x="${chartLeft - 14}" y="${y + 4}" class="tick" text-anchor="end">${fixed(value, 0)}</text>`;
  }).join('');
  const xTicks = [1, 10, 20, runMax].filter((value, index, arr) => value <= runMax && arr.indexOf(value) === index).map(value => {
    const x = xScale(value - 1, runMax, chartLeft, chartWidth);
    return `<line x1="${x}" x2="${x}" y1="${scoreTop}" y2="${stageTop + panelHeight}" class="xgrid"/><text x="${x}" y="${stageTop + panelHeight + 34}" class="tick" text-anchor="middle">${value}</text>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">Persona performance distribution over seeded games</title>
  <desc id="desc">Line chart showing score and stage reached over repeated seeded full-run games for Beginner, Intermediate, Expert, and Professional personas.</desc>
  <style>
    .bg{fill:#06111b}
    .panel{fill:#0b2032;stroke:#24445f;stroke-width:1}
    .title{fill:#f0fbff;font:700 28px Avenir Next,Segoe UI,sans-serif}
    .subtitle{fill:#a8cce2;font:14px Avenir Next,Segoe UI,sans-serif}
    .label{fill:#dff7ff;font:700 16px Avenir Next,Segoe UI,sans-serif}
    .tick,.legend{fill:#b8d5e8;font:12px Avenir Next,Segoe UI,sans-serif}
    .grid{stroke:#24445f;stroke-width:1;opacity:.78}
    .xgrid{stroke:#24445f;stroke-width:1;opacity:.35}
  </style>
  <rect class="bg" width="${width}" height="${height}"/>
  <text x="44" y="44" class="title">Persona Performance Distribution</text>
  <text x="44" y="70" class="subtitle">Seeded full-run persona gameplay; each line is one generic test persona across ${runMax} current Aurora runs.</text>
  ${legend}
  <rect x="${chartLeft}" y="${scoreTop}" width="${chartWidth}" height="${panelHeight}" class="panel"/>
  <text x="${chartLeft}" y="${scoreTop - 20}" class="label">Score by run</text>
  ${scoreTicks}
  ${xTicks}
  ${scoreLines}
  <rect x="${chartLeft}" y="${stageTop}" width="${chartWidth}" height="${panelHeight}" class="panel"/>
  <text x="${chartLeft}" y="${stageTop - 20}" class="label">Stage reached by run</text>
  ${stageTicks}
  ${stageLines}
  <text x="${chartLeft + chartWidth / 2}" y="${stageTop + panelHeight + 62}" class="tick" text-anchor="middle">Run index within each persona seed band</text>
</svg>
`;
}

function readBatchMetadata(batchDir){
  const reportFile = path.join(batchDir, 'batch-report.json');
  if(!fs.existsSync(reportFile)) return {};
  const report = readJson(reportFile);
  return {
    batchProfile: report.profile || 'distribution',
    batchCreatedAt: report.createdAt || null,
    batchRunCount: report.aggregate?.totalRuns || null,
    batchReport: rel(reportFile)
  };
}

function buildReadme(artifact){
  const lines = [
    '# Persona Performance Distribution',
    '',
    'This artifact summarizes repeated seeded full-run gameplay for the generic Platinum persona vocabulary. The personas are platform-level test players; each game maps those personas onto game-owned scenarios and success criteria.',
    '',
    `Generated: \`${artifact.generatedAt}\``,
    `Source batch: \`${artifact.sourceBatchDir}\``,
    '',
    '## Summary',
    '',
    '| Persona | Runs | Score avg/median | Stage avg/median | Time avg | Score/min avg | Losses avg | Challenge hit avg |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...artifact.summaryRows.map(row => `| ${row.label} (${row.persona}) | ${row.runCount} | ${row.score.avg} / ${row.score.median} | ${row.stageReached.avg} / ${row.stageReached.median} | ${row.durationMin.avg} min | ${row.scorePerMinute.avg} | ${row.shipLosses.avg} | ${(row.challengeHitRate.avg * 100).toFixed(1)}% |`),
    '',
    '## Read',
    '',
    '- Use this as distributional evidence, not as a single perfect-play claim.',
    '- The strongest persona should generally reach later stages and score more over the same seed count.',
    '- If the ladder is out of order, recalibrate the persona policy or widen the seed distribution before tuning core gameplay.',
    `- Recording evidence: ${artifact.recordingEvidence.mode}; ${artifact.recordingEvidence.read}`,
    '',
    '## Chart',
    '',
    '![Persona performance distribution](performance-lines.svg)',
    ''
  ];
  if(artifact.findings.length){
    lines.push('## Findings', '');
    for(const finding of artifact.findings){
      lines.push(`- P${finding.priority}: ${finding.title}: ${finding.detail}`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function main(){
  const args = parseArgs(process.argv.slice(2));
  const batchDir = args['from-batch'] ? path.resolve(ROOT, String(args['from-batch'])) : findLatestBatchDir();
  if(!batchDir || !fs.existsSync(batchDir)){
    throw new Error('No completed batch-distribution artifact found. Run `npm run harness:batch -- --profile distribution --repeats 30` first, or pass --from-batch.');
  }
  const summaryFiles = listSummaryFiles(batchDir);
  if(!summaryFiles.length){
    throw new Error(`No summary.json files found under ${batchDir}.`);
  }
  const metadata = readBatchMetadata(batchDir);
  const rows = summaryFiles.map(file => runRow(file, metadata)).filter(row => PERSONA_ORDER.includes(row.persona));
  const summaryRows = PERSONA_ORDER.map(persona => summarizePersona(rows, persona)).filter(row => row.runCount);
  const generatedAt = new Date().toISOString();
  const commit = gitShortCommit();
  const recordingEvidence = buildRecordingEvidence(rows);
  const artifact = {
    schemaVersion: 1,
    artifactType: 'persona-performance-distribution',
    gameKey: 'aurora-galactica',
    scenario: 'full-run-persona',
    generatedAt,
    commit,
    sourceBatchDir: rel(batchDir),
    sourceBatchReport: metadata.batchReport || null,
    runCount: rows.length,
    runsPerPersona: Object.fromEntries(summaryRows.map(row => [row.persona, row.runCount])),
    measurementLimits: [
      'Rows are seeded current-build gameplay runs, not human playtest proof.',
      'Cosmetic randomness is intentionally outside the gameplay seed and should not be read as gameplay variance.',
      'The personas are generic Platinum skill profiles; each game must define game-owned scenarios and release meaning.',
      'A 30-run distribution is much stronger than one run, but still small enough that release decisions should also inspect failure clips and event logs.'
    ],
    genericPersonaContract: {
      owner: 'Platinum',
      stablePersonas: PERSONA_ORDER.map(persona => ({
        persona,
        label: PERSONA_LABELS[persona]
      })),
      gameResponsibility: 'Each game maps the generic persona to scenarios, expected outcomes, release blockers, and any game-specific behavior allowances.'
    },
    summaryRows,
    recordingEvidence,
    runs: rows.sort((a, b) => PERSONA_ORDER.indexOf(a.persona) - PERSONA_ORDER.indexOf(b.persona) || a.seed - b.seed),
    findings: buildFindings(summaryRows),
    chart: 'performance-lines.svg',
    ...metadata
  };
  const stampedDir = path.join(OUT_ROOT, `${generatedAt.slice(0, 10)}-${commit}`);
  const latestJson = path.join(OUT_ROOT, 'latest.json');
  const latestSvg = path.join(OUT_ROOT, 'performance-lines.svg');
  const latestReadme = path.join(OUT_ROOT, 'README.md');
  const chart = renderChart(artifact.runs, artifact.summaryRows);
  writeJson(path.join(stampedDir, 'report.json'), artifact);
  fs.writeFileSync(path.join(stampedDir, 'performance-lines.svg'), chart);
  fs.writeFileSync(path.join(stampedDir, 'README.md'), buildReadme(artifact));
  writeJson(latestJson, artifact);
  fs.writeFileSync(latestSvg, chart);
  fs.writeFileSync(latestReadme, buildReadme(artifact));
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(latestJson),
    chart: rel(latestSvg),
    readme: rel(latestReadme),
    runCount: artifact.runCount,
    runsPerPersona: artifact.runsPerPersona,
    findings: artifact.findings
  }, null, 2));
}

try{
  main();
}catch(err){
  console.error(err && err.stack || String(err));
  process.exit(1);
}
