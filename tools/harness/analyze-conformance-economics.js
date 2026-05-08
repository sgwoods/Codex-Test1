#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'conformance-economics');
const LEDGER = path.join(OUT_ROOT, 'run-ledger.jsonl');

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data){
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function gitBranch(){
  try{
    return execFileSync('git', ['-C', ROOT, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function walkReports(root){
  const out = [];
  function walk(dir){
    if(!fs.existsSync(dir)) return;
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === 'report.json') out.push(full);
    }
  }
  walk(root);
  return out.sort();
}

function dirBytes(dir){
  let total = 0;
  if(!fs.existsSync(dir)) return 0;
  function walk(current){
    for(const entry of fs.readdirSync(current, { withFileTypes: true })){
      const full = path.join(current, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile()) total += fs.statSync(full).size;
    }
  }
  walk(dir);
  return total;
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function reportStamp(file, data){
  const stat = fs.statSync(file);
  const dir = path.basename(path.dirname(file));
  const fromDir = /^(\d{4}-\d{2}-\d{2})-([0-9a-fA-F]+)/.exec(dir);
  return {
    date: fromDir?.[1] || String(data.generatedAt || '').slice(0, 10) || new Date(stat.mtimeMs).toISOString().slice(0, 10),
    commit: data.commit || fromDir?.[2] || null,
    generatedAt: data.generatedAt || new Date(stat.mtimeMs).toISOString(),
    mtimeMs: stat.mtimeMs
  };
}

function point(file, axis, score, details = {}){
  const data = readJson(file);
  const stamp = reportStamp(file, data);
  return {
    axis,
    score10: round(score, 3),
    commit: stamp.commit,
    date: stamp.date,
    generatedAt: stamp.generatedAt,
    report: rel(file),
    artifactDir: rel(path.dirname(file)),
    artifactBytes: dirBytes(path.dirname(file)),
    details
  };
}

function collectMetricPoints(){
  const points = [];
  for(const file of walkReports(path.join(ANALYSES, 'quality-conformance'))){
    const data = readJson(file);
    points.push(point(file, 'overall-quality', data.summary?.overallScore10, {
      strongest: data.summary?.strongestCategory?.id || null,
      weakest: data.summary?.weakestCategory?.id || null
    }));
    for(const category of data.categories || []){
      points.push(point(file, `quality:${category.id}`, category.score10, {
        label: category.label,
        read: category.read
      }));
    }
  }
  for(const file of walkReports(path.join(ANALYSES, 'level-arc-conformance'))){
    const data = readJson(file);
    points.push(point(file, 'level-arc', data.summary?.score10 || data.score10, {
      weakestSubmetric: data.summary?.weakestSubmetric?.id || null,
      pressureReplayCoverage: data.summary?.pressureReplayCoverage ?? null,
      pressureCollisionReplayCoverage: data.summary?.pressureCollisionReplayCoverage ?? null
    }));
    for(const submetric of data.submetrics || []){
      points.push(point(file, `level-arc:${submetric.id}`, submetric.score10, {
        label: submetric.label,
        read: submetric.read
      }));
    }
  }
  for(const file of walkReports(path.join(ANALYSES, 'stage-signature-distance'))){
    const data = readJson(file);
    points.push(point(file, 'stage-signature-distance', data.summary?.signatureScore10, {
      minDistance: data.summary?.minDistance ?? null,
      distinctPairRatio: data.summary?.distinctPairRatio ?? null,
      repetitionRisk: data.summary?.repetitionRisk ?? null,
      closestPair: data.summary?.closestPair || null
    }));
  }
  for(const file of walkReports(path.join(ANALYSES, 'aurora-visual-look-conformance'))){
    const data = readJson(file);
    points.push(point(file, 'visual-look', data.summary?.score10, {
      confidence: data.summary?.confidence || null,
      resolution: data.summary?.resolution || null,
      weakestSurface: data.summary?.weakestSurface?.id || null,
      surfaceCount: data.summary?.surfaceCount || 0
    }));
    for(const surface of data.surfaces || []){
      points.push(point(file, `visual-look:${surface.id}`, surface.score10, {
        label: surface.label,
        overflowCount: surface.layout?.overflowCount ?? null,
        quantizedColorCount: surface.canvas?.quantizedColorCount ?? null,
        activeContrastSpread: surface.canvas?.activeContrastSpread ?? null
      }));
    }
  }
  for(const file of walkReports(path.join(ANALYSES, 'aurora-stage4-loss-windows'))){
    const data = readJson(file);
    const total = data.summary?.totalWindows || 0;
    const exact = total ? (data.summary?.replayReproducedWindows || 0) / total : 0;
    const pressure = total ? (data.summary?.pressureCollisionReproducedWindows || 0) / total : exact;
    points.push(point(file, 'stage4-pressure-exact-replay-coverage', exact * 10, {
      unit: 'coverage_score10',
      totalWindows: total,
      replayReproducedWindows: data.summary?.replayReproducedWindows || 0
    }));
    points.push(point(file, 'stage4-pressure-collision-diagnostic-coverage', pressure * 10, {
      unit: 'coverage_score10',
      totalWindows: total,
      pressureCollisionReproducedWindows: data.summary?.pressureCollisionReproducedWindows || 0
    }));
  }
  return points
    .filter(point => Number.isFinite(point.score10))
    .sort((a, b) => Date.parse(a.generatedAt) - Date.parse(b.generatedAt) || a.report.localeCompare(b.report));
}

function loadLedger(){
  if(!fs.existsSync(LEDGER)) return [];
  return fs.readFileSync(LEDGER, 'utf8')
    .split(/\n+/)
    .filter(Boolean)
    .map(line => {
      try{ return JSON.parse(line); }
      catch{ return null; }
    })
    .filter(Boolean);
}

function metricDeltas(points){
  const byAxis = new Map();
  for(const p of points){
    if(!byAxis.has(p.axis)) byAxis.set(p.axis, []);
    byAxis.get(p.axis).push(p);
  }
  const deltas = [];
  for(const [axis, axisPoints] of byAxis){
    const sorted = axisPoints.slice().sort((a, b) => Date.parse(a.generatedAt) - Date.parse(b.generatedAt));
    for(let i = 1; i < sorted.length; i++){
      const before = sorted[i - 1];
      const after = sorted[i];
      const delta = round(after.score10 - before.score10, 3);
      if(delta === 0) continue;
      deltas.push({
        axis,
        before: before.score10,
        after: after.score10,
        deltaScore10: delta,
        fromCommit: before.commit,
        toCommit: after.commit,
        fromReport: before.report,
        toReport: after.report,
        artifactBytesDelta: after.artifactBytes - before.artifactBytes
      });
    }
  }
  return deltas.sort((a, b) => Math.abs(b.deltaScore10) - Math.abs(a.deltaScore10));
}

function summarizeLedger(entries){
  const totals = entries.reduce((acc, entry) => {
    acc.runs += 1;
    acc.wallSeconds += entry.measurement?.wallSeconds || 0;
    acc.cpuSeconds += entry.measurement?.cpuSeconds || 0;
    acc.artifactBytes += entry.outputs?.artifactBytesDelta || 0;
    for(const resource of entry.resources || ['unspecified']){
      acc.byResource[resource] = acc.byResource[resource] || { runs: 0, wallSeconds: 0, cpuSeconds: 0 };
      acc.byResource[resource].runs += 1;
      acc.byResource[resource].wallSeconds += entry.measurement?.wallSeconds || 0;
      acc.byResource[resource].cpuSeconds += entry.measurement?.cpuSeconds || 0;
    }
    for(const axis of entry.axes || ['unspecified']){
      acc.byAxis[axis] = acc.byAxis[axis] || { runs: 0, wallSeconds: 0, cpuSeconds: 0 };
      acc.byAxis[axis].runs += 1;
      acc.byAxis[axis].wallSeconds += entry.measurement?.wallSeconds || 0;
      acc.byAxis[axis].cpuSeconds += entry.measurement?.cpuSeconds || 0;
    }
    return acc;
  }, { runs: 0, wallSeconds: 0, cpuSeconds: 0, artifactBytes: 0, byResource: {}, byAxis: {} });
  totals.wallSeconds = round(totals.wallSeconds, 3);
  totals.cpuSeconds = round(totals.cpuSeconds, 3);
  for(const group of [totals.byResource, totals.byAxis]){
    for(const value of Object.values(group)){
      value.wallSeconds = round(value.wallSeconds, 3);
      value.cpuSeconds = round(value.cpuSeconds, 3);
    }
  }
  return totals;
}

function svgLineChart(file, title, series, opts = {}){
  const width = 980;
  const height = 360;
  const pad = { left: 64, right: 28, top: 48, bottom: 58 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const colors = ['#1f77b4', '#2ca02c', '#d62728', '#9467bd', '#ff7f0e', '#17becf', '#7f7f7f'];
  const all = series.flatMap(s => s.points);
  const maxLen = Math.max(...series.map(s => s.points.length), 1);
  const yMin = opts.yMin ?? 0;
  const yMax = opts.yMax ?? 10;
  const xFor = i => pad.left + (maxLen <= 1 ? plotW / 2 : (i / (maxLen - 1)) * plotW);
  const yFor = y => pad.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH;
  const lines = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    '<rect width="100%" height="100%" fill="#fff"/>',
    `<text x="${pad.left}" y="28" font-family="Arial, sans-serif" font-size="20" font-weight="700">${escapeXml(title)}</text>`,
    `<line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top + plotH}" stroke="#333"/>`,
    `<line x1="${pad.left}" y1="${pad.top + plotH}" x2="${pad.left + plotW}" y2="${pad.top + plotH}" stroke="#333"/>`
  ];
  for(let y = yMin; y <= yMax; y += 2){
    const yy = yFor(y);
    lines.push(`<line x1="${pad.left}" y1="${yy}" x2="${pad.left + plotW}" y2="${yy}" stroke="#e6e6e6"/>`);
    lines.push(`<text x="${pad.left - 10}" y="${yy + 4}" text-anchor="end" font-family="Arial, sans-serif" font-size="12">${y}</text>`);
  }
  series.forEach((s, idx) => {
    const pts = s.points.map((p, i) => `${xFor(i)},${yFor(p.y)}`).join(' ');
    if(pts) lines.push(`<polyline points="${pts}" fill="none" stroke="${colors[idx % colors.length]}" stroke-width="2.5"/>`);
    s.points.forEach((p, i) => {
      lines.push(`<circle cx="${xFor(i)}" cy="${yFor(p.y)}" r="3.5" fill="${colors[idx % colors.length]}"><title>${escapeXml(`${s.name}: ${p.y} ${p.label || ''}`)}</title></circle>`);
    });
    const legendX = pad.left + idx * 210;
    const legendY = height - 18;
    lines.push(`<rect x="${legendX}" y="${legendY - 10}" width="12" height="12" fill="${colors[idx % colors.length]}"/>`);
    lines.push(`<text x="${legendX + 18}" y="${legendY}" font-family="Arial, sans-serif" font-size="12">${escapeXml(s.name)}</text>`);
  });
  if(all.length){
    const labels = series[0].points;
    const every = Math.max(1, Math.ceil(labels.length / 6));
    labels.forEach((p, i) => {
      if(i % every && i !== labels.length - 1) return;
      lines.push(`<text x="${xFor(i)}" y="${height - 38}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11">${escapeXml(p.label || String(i + 1))}</text>`);
    });
  }
  lines.push('</svg>');
  fs.writeFileSync(file, `${lines.join('\n')}\n`);
}

function svgBarChart(file, title, bars){
  const width = 980;
  const height = 380;
  const pad = { left: 220, right: 36, top: 48, bottom: 38 };
  const barH = 26;
  const gap = 10;
  const max = Math.max(...bars.map(b => Math.abs(b.value)), 1);
  const zeroX = pad.left + (width - pad.left - pad.right) * 0.42;
  const scale = (width - pad.left - pad.right) * 0.52 / max;
  const lines = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    '<rect width="100%" height="100%" fill="#fff"/>',
    `<text x="${pad.left}" y="28" font-family="Arial, sans-serif" font-size="20" font-weight="700">${escapeXml(title)}</text>`,
    `<line x1="${zeroX}" y1="${pad.top - 10}" x2="${zeroX}" y2="${height - pad.bottom}" stroke="#555"/>`
  ];
  bars.slice(0, 9).forEach((bar, i) => {
    const y = pad.top + i * (barH + gap);
    const w = Math.abs(bar.value) * scale;
    const x = bar.value >= 0 ? zeroX : zeroX - w;
    const color = bar.value >= 0 ? '#2ca02c' : '#d62728';
    lines.push(`<text x="${pad.left - 12}" y="${y + 18}" text-anchor="end" font-family="Arial, sans-serif" font-size="12">${escapeXml(bar.label)}</text>`);
    lines.push(`<rect x="${x}" y="${y}" width="${w}" height="${barH}" fill="${color}"/>`);
    lines.push(`<text x="${bar.value >= 0 ? x + w + 6 : x - 6}" y="${y + 18}" text-anchor="${bar.value >= 0 ? 'start' : 'end'}" font-family="Arial, sans-serif" font-size="12">${bar.value > 0 ? '+' : ''}${bar.value}</text>`);
  });
  lines.push('</svg>');
  fs.writeFileSync(file, `${lines.join('\n')}\n`);
}

function escapeXml(value){
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildCharts(outDir, points, deltas, ledgerSummary){
  const byAxis = axis => points.filter(p => p.axis === axis)
    .sort((a, b) => Date.parse(a.generatedAt) - Date.parse(b.generatedAt))
    .map(p => ({ y: p.score10, label: `${p.date}-${p.commit || 'na'}` }));
  svgLineChart(path.join(outDir, 'score-trends.svg'), 'Conformance Score Trends', [
    { name: 'Overall', points: byAxis('overall-quality') },
    { name: 'Level arc', points: byAxis('level-arc') },
    { name: 'Stage signature', points: byAxis('stage-signature-distance') },
    { name: 'Stage 4 exact replay', points: byAxis('stage4-pressure-exact-replay-coverage') }
  ]);
  svgBarChart(path.join(outDir, 'largest-score-deltas.svg'), 'Largest Recorded Score Deltas', deltas.slice(0, 9).map(d => ({
    label: d.axis.replace(/^quality:/, '').replace(/^level-arc:/, ''),
    value: d.deltaScore10
  })));
  const resourceBars = Object.entries(ledgerSummary.byResource || {}).map(([resource, value]) => ({
    label: resource,
    value: round((value.wallSeconds || 0) / 60, 2) || 0
  })).sort((a, b) => b.value - a.value);
  svgBarChart(path.join(outDir, 'compute-minutes-by-resource.svg'), 'Tracked Compute Minutes By Resource Class', resourceBars.length ? resourceBars : [{ label: 'no measured runs yet', value: 0 }]);
}

function buildReadme(report){
  const lines = [
    '# Conformance Economics',
    '',
    `Generated: \`${report.generatedAt}\``,
    '',
    '## Problem',
    '',
    'Conformance work should not only ask whether a score improved. It should also ask how much local compute, model/API help, GPU/video work, artifact volume, and retry cost were spent to create that improvement.',
    '',
    '## Strategy',
    '',
    'This artifact joins historical conformance reports with an optional measured-run ledger. Existing reports provide score trends and artifact-volume proxies; future measured runs add wall time, CPU time, memory, resource classes, and declared model/API/GPU usage.',
    '',
    '## Current Read',
    '',
    `- Metric points scanned: ${report.summary.metricPointCount}`,
    `- Score deltas found: ${report.summary.deltaCount}`,
    `- Measured runs in ledger: ${report.summary.ledger.runs}`,
    `- Tracked wall time: ${report.summary.ledger.wallSeconds}s`,
    `- Tracked CPU time: ${report.summary.ledger.cpuSeconds}s`,
    '',
    '## Charts',
    '',
    '- `score-trends.svg`: conformance trends by score axis.',
    '- `largest-score-deltas.svg`: largest positive and negative score changes in the artifact history.',
    '- `compute-minutes-by-resource.svg`: measured future run time by resource class.',
    '',
    '## Interpretation Rules',
    '',
    '- Treat artifact volume and run count as compute proxies until a command has a measured ledger entry.',
    '- Separate gameplay-quality gains from measurement-precision gains. A harness that explains a failure better has value even when player-facing conformance has not moved yet.',
    '- Track model/API/GPU work explicitly when Codex or OpenAI APIs design or execute a long-cycle assessment. Do not log secrets or raw prompts in the ledger.',
    '- Prefer high-ROI next steps: large gap, clear measurable target, modest local compute, and reusable harness/platform logic.',
    '',
    '## Highest-Value Recent Deltas',
    ''
  ];
  for(const delta of report.deltas.slice(0, 8)){
    lines.push(`- ${delta.axis}: ${delta.before} -> ${delta.after} (${delta.deltaScore10 > 0 ? '+' : ''}${delta.deltaScore10})`);
  }
  lines.push('');
  lines.push('## Next Instrumentation Step');
  lines.push('');
  lines.push('- Run expensive harnesses through `npm run harness:measure -- --axis <axis> --resource cpu --resource browser -- <command>` so future economics charts can compute cost per score delta instead of relying on artifact-size proxies.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main(){
  ensureDir(OUT_ROOT);
  const stamp = new Date().toISOString().slice(0, 10);
  const commit = gitShortCommit();
  const outDir = path.join(OUT_ROOT, `${stamp}-${commit}`);
  ensureDir(outDir);
  const metricPoints = collectMetricPoints();
  const deltas = metricDeltas(metricPoints);
  const ledger = loadLedger();
  const ledgerSummary = summarizeLedger(ledger);
  const report = {
    schema_version: 1,
    artifact_type: 'conformance-economics',
    generatedAt: new Date().toISOString(),
    branch: gitBranch(),
    commit,
    problem: 'Plan conformance work by comparing score gains, evidence uncertainty reduction, and compute/resource expenditure.',
    strategy: 'Combine conformance score history, artifact-volume proxies, and measured command ledger entries into ROI-oriented charts.',
    successMeasure: 'Each major work cycle can report metric movement, compute cost, resource class, and whether the gain was gameplay-facing or measurement-facing.',
    ledgerPath: rel(LEDGER),
    summary: {
      metricPointCount: metricPoints.length,
      axisCount: new Set(metricPoints.map(p => p.axis)).size,
      deltaCount: deltas.length,
      latestOverallScore10: metricPoints.filter(p => p.axis === 'overall-quality').slice(-1)[0]?.score10 ?? null,
      latestLevelArcScore10: metricPoints.filter(p => p.axis === 'level-arc').slice(-1)[0]?.score10 ?? null,
      ledger: ledgerSummary
    },
    metricPoints,
    deltas,
    ledgerSummary
  };
  writeJson(path.join(outDir, 'report.json'), report);
  fs.writeFileSync(path.join(outDir, 'README.md'), buildReadme(report));
  buildCharts(outDir, metricPoints, deltas, ledgerSummary);
  console.log(JSON.stringify({
    ok: true,
    outDir,
    report: path.join(outDir, 'report.json'),
    charts: [
      path.join(outDir, 'score-trends.svg'),
      path.join(outDir, 'largest-score-deltas.svg'),
      path.join(outDir, 'compute-minutes-by-resource.svg')
    ],
    summary: report.summary
  }, null, 2));
}

main();
