#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'conformance-economics');
const LEDGER = path.join(OUT_ROOT, 'run-ledger.jsonl');
const TOP_LEVEL_DOC = path.join(ROOT, 'CONFORMANCE_ECONOMICS.md');
const GPU_EQUIVALENT_RESOURCES = new Set(['gpu', 'model-api', 'openai-api', 'codex', 'codex-app', 'llm', 'model']);

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

function minutes(seconds, digits = 1){
  return Number.isFinite(+seconds) ? `${round(+seconds / 60, digits)} min` : 'n/a';
}

function mb(bytes, digits = 1){
  return Number.isFinite(+bytes) ? `${round(+bytes / 1000000, digits)} MB` : 'n/a';
}

function percent(part, total, digits = 1){
  return Number.isFinite(+part) && Number.isFinite(+total) && +total > 0
    ? `${round((+part / +total) * 100, digits)}%`
    : 'n/a';
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

function normalizeInvestmentAxis(axis){
  const raw = String(axis || '').replace(/^quality:/, '').replace(/^level-arc:/, '');
  if(raw === 'audio') return 'audio';
  if(raw === 'visual-look' || raw.startsWith('visual-look:')) return 'visual-look';
  if(raw === 'level-arc' || raw.startsWith('level-arc')) return 'level-arc';
  if(raw.startsWith('stage4-pressure')) return 'stage4-pressure';
  if(raw === 'overall-quality') return 'overall-quality';
  return raw;
}

function costEfficiency(deltas, ledgerSummary){
  const byAxis = {};
  for(const delta of deltas){
    const axis = normalizeInvestmentAxis(delta.axis);
    byAxis[axis] = byAxis[axis] || {
      axis,
      positiveScore10: 0,
      negativeScore10: 0,
      deltaCount: 0,
      largestPositiveDelta10: 0,
      largestNegativeDelta10: 0
    };
    byAxis[axis].deltaCount += 1;
    if(delta.deltaScore10 > 0){
      byAxis[axis].positiveScore10 += delta.deltaScore10;
      byAxis[axis].largestPositiveDelta10 = Math.max(byAxis[axis].largestPositiveDelta10, delta.deltaScore10);
    }else{
      byAxis[axis].negativeScore10 += Math.abs(delta.deltaScore10);
      byAxis[axis].largestNegativeDelta10 = Math.min(byAxis[axis].largestNegativeDelta10, delta.deltaScore10);
    }
  }
  for(const [axis, spend] of Object.entries(ledgerSummary.byAxis || {})){
    const normalized = normalizeInvestmentAxis(axis);
    byAxis[normalized] = byAxis[normalized] || {
      axis: normalized,
      positiveScore10: 0,
      negativeScore10: 0,
      deltaCount: 0,
      largestPositiveDelta10: 0,
      largestNegativeDelta10: 0
    };
    byAxis[normalized].runs = (byAxis[normalized].runs || 0) + (spend.runs || 0);
    byAxis[normalized].wallSeconds = (byAxis[normalized].wallSeconds || 0) + (spend.wallSeconds || 0);
    byAxis[normalized].cpuSeconds = (byAxis[normalized].cpuSeconds || 0) + (spend.cpuSeconds || 0);
  }
  return Object.values(byAxis).map(item => {
    const wallMinutes = round((item.wallSeconds || 0) / 60, 3) || 0;
    const cpuMinutes = round((item.cpuSeconds || 0) / 60, 3) || 0;
    const positiveScore10 = round(item.positiveScore10, 3) || 0;
    return {
      axis: item.axis,
      runs: item.runs || 0,
      wallMinutes,
      cpuMinutes,
      positiveScore10,
      negativeScore10: round(item.negativeScore10, 3) || 0,
      deltaCount: item.deltaCount || 0,
      largestPositiveDelta10: round(item.largestPositiveDelta10, 3) || 0,
      largestNegativeDelta10: round(item.largestNegativeDelta10, 3) || 0,
      wallMinutesPerPositiveScore10: positiveScore10 > 0 && wallMinutes > 0 ? round(wallMinutes / positiveScore10, 2) : null,
      cpuMinutesPerPositiveScore10: positiveScore10 > 0 && cpuMinutes > 0 ? round(cpuMinutes / positiveScore10, 2) : null,
      attribution: (item.runs || 0) && positiveScore10 > 0
        ? 'tracked-spend-and-score-movement'
        : (item.runs || 0)
          ? 'tracked-spend-no-positive-score-delta-yet'
          : 'historical-score-movement-without-tracked-spend'
    };
  }).sort((a, b) => {
    const ar = a.wallMinutesPerPositiveScore10 ?? Number.POSITIVE_INFINITY;
    const br = b.wallMinutesPerPositiveScore10 ?? Number.POSITIVE_INFINITY;
    return ar - br || b.positiveScore10 - a.positiveScore10 || a.axis.localeCompare(b.axis);
  });
}

function isGpuEquivalentEntry(entry){
  const declared = entry.resourcesDeclared || {};
  const resources = entry.resources || [];
  return resources.some(resource => GPU_EQUIVALENT_RESOURCES.has(resource))
    || !!declared.modelProvider
    || !!declared.modelName
    || !!declared.modelCalls
    || !!declared.inputTokens
    || !!declared.outputTokens
    || !!declared.gpuSeconds
    || !!declared.modelMinutes;
}

function entryText(entry){
  return [
    ...(entry.axes || []),
    ...(entry.resources || []),
    entry.command || '',
    entry.notes || '',
    entry.kind || ''
  ].join(' ').toLowerCase();
}

function purposeForEntry(entry){
  const text = entryText(entry);
  if(/\baudio\b|cue|pulse|hit|boom|explosion|waveform|spectral|centroid|onset/.test(text)){
    return 'Audio conformance and cue feedback';
  }
  if(/level|stage|formation|boss|alien|challenge|pressure|movement|combat|capture|trajectory|lane/.test(text)){
    return 'Gameplay behavior and level complexity';
  }
  if(/visual|video|sprite|frame|screenshot|contact|look|palette|surface|typography/.test(text)){
    return 'Visual and video reference analysis';
  }
  if(/dashboard|release|documentation|economics|portfolio|public|planning|roadmap/.test(text)){
    return 'Dashboard, docs, and release planning';
  }
  if(/ingestion|reference|artifact|evidence|harness|score|scorer|metric|contract|candidate|sweep/.test(text)){
    return 'Harness, ingestion, and assessment logic';
  }
  if(isGpuEquivalentEntry(entry)){
    return 'Model-assisted implementation and review';
  }
  return 'Measurement support and maintenance';
}

function addPurposeBucket(acc, purpose, entry, seconds){
  if(!Number.isFinite(seconds) || seconds <= 0) return;
  const bucket = acc[purpose] || {
    purpose,
    runs: 0,
    wallSeconds: 0,
    cpuSeconds: 0,
    examples: []
  };
  bucket.runs += 1;
  bucket.wallSeconds += seconds;
  bucket.cpuSeconds += entry.measurement?.cpuSeconds || 0;
  const example = entry.notes || entry.command || (entry.axes || []).join(', ');
  if(example && bucket.examples.length < 3) bucket.examples.push(example);
  acc[purpose] = bucket;
}

function purposeRowsFromBuckets(buckets, totalSeconds){
  return Object.values(buckets)
    .map(bucket => ({
      purpose: bucket.purpose,
      runs: bucket.runs,
      wallSeconds: round(bucket.wallSeconds, 3) || 0,
      wallMinutes: round(bucket.wallSeconds / 60, 2) || 0,
      cpuSeconds: round(bucket.cpuSeconds, 3) || 0,
      share: round(totalSeconds > 0 ? bucket.wallSeconds / totalSeconds : 0, 4) || 0,
      sharePercent: round(totalSeconds > 0 ? (bucket.wallSeconds / totalSeconds) * 100 : 0, 1) || 0,
      examples: bucket.examples,
      interpretation: purposeInterpretation(bucket.purpose)
    }))
    .sort((a, b) => b.wallSeconds - a.wallSeconds || a.purpose.localeCompare(b.purpose));
}

function purposeInterpretation(purpose){
  const reads = {
    'Audio conformance and cue feedback': 'Moves the moment-to-moment arcade feel: impact clarity, ambience identity, reward/loss feedback, and player understanding.',
    'Gameplay behavior and level complexity': 'Moves player-facing pressure, stage shape, alien entry novelty, challenge-stage learning value, and long-play texture.',
    'Visual and video reference analysis': 'Moves graphical identity, reference inspection, contact-sheet review, sprite/surface comparison, and readability.',
    'Dashboard, docs, and release planning': 'Moves decision quality: what to invest in next, how to explain releases, and how to keep dev/beta/prod evidence aligned.',
    'Harness, ingestion, and assessment logic': 'Moves reusable automation: scorers, artifact extraction, candidate loops, measurement confidence, and future game ingestion.',
    'Model-assisted implementation and review': 'Moves code/design synthesis, evidence interpretation, planning, and implementation review that should later become local harness logic.',
    'Measurement support and maintenance': 'Keeps the measured workflow healthy: setup, status, reproducibility, and plumbing.'
  };
  return reads[purpose] || 'Tracked project work whose gameplay effect should be reviewed with its linked score axis.';
}

function gameplayPartForAxis(axis){
  const text = String(axis || '').toLowerCase();
  if(/audio|cue|sound|pulse|hit|boom|semantic/.test(text)) return 'Audio feedback and event clarity';
  if(/level-arc|stage|formation|boss|alien|challenge|trajectory|pressure/.test(text)) return 'Gameplay complexity and stage arc';
  if(/movement|combat|capture|collision|input|shot|safety/.test(text)) return 'Core mechanics and control feel';
  if(/visual|ui|popup|frame|surface|look|typography/.test(text)) return 'Visual/UI arcade presentation';
  if(/overall|quality|conformance/.test(text)) return 'Overall release-quality rollup';
  return 'Measurement confidence and harness coverage';
}

function computeApplicationSummary(entries, deltas){
  const gpuBuckets = {};
  const cpuBuckets = {};
  let gpuSeconds = 0;
  let cpuSeconds = 0;
  for(const entry of entries){
    const declared = entry.resourcesDeclared || {};
    const resources = entry.resources || [];
    const purpose = purposeForEntry(entry);
    if(isGpuEquivalentEntry(entry)){
      const seconds = (declared.modelMinutes || 0) * 60
        || declared.gpuSeconds
        || entry.measurement?.wallSeconds
        || 0;
      gpuSeconds += seconds;
      addPurposeBucket(gpuBuckets, purpose, entry, seconds);
    }
    if(resources.includes('cpu') || resources.includes('browser') || (!resources.length && entry.measurement?.cpuSeconds)){
      const seconds = entry.measurement?.wallSeconds || 0;
      cpuSeconds += seconds;
      addPurposeBucket(cpuBuckets, purpose, entry, seconds);
    }
  }

  const impactBuckets = {};
  let impactTotal = 0;
  for(const delta of deltas){
    if(!(delta.deltaScore10 > 0)) continue;
    const part = gameplayPartForAxis(delta.axis);
    impactBuckets[part] = impactBuckets[part] || {
      part,
      positiveScore10: 0,
      axes: new Set()
    };
    impactBuckets[part].positiveScore10 += delta.deltaScore10;
    impactBuckets[part].axes.add(delta.axis);
    impactTotal += delta.deltaScore10;
  }
  const gameplayImprovementByPart = Object.values(impactBuckets)
    .map(bucket => ({
      part: bucket.part,
      positiveScore10: round(bucket.positiveScore10, 3) || 0,
      share: round(impactTotal > 0 ? bucket.positiveScore10 / impactTotal : 0, 4) || 0,
      sharePercent: round(impactTotal > 0 ? (bucket.positiveScore10 / impactTotal) * 100 : 0, 1) || 0,
      axes: Array.from(bucket.axes).slice(0, 8),
      interpretation: gameplayImpactInterpretation(bucket.part)
    }))
    .sort((a, b) => b.positiveScore10 - a.positiveScore10 || a.part.localeCompare(b.part));

  return {
    gpuUseByPurpose: purposeRowsFromBuckets(gpuBuckets, gpuSeconds),
    cpuUseByPurpose: purposeRowsFromBuckets(cpuBuckets, cpuSeconds),
    gameplayImprovementByPart,
    totals: {
      gpuEquivalentWallSeconds: round(gpuSeconds, 3) || 0,
      cpuLocalWallSeconds: round(cpuSeconds, 3) || 0,
      positiveScore10Attributed: round(impactTotal, 3) || 0
    },
    limitations: [
      'GPU-equivalent accounting includes declared Codex/OpenAI/model/API/GPU usage and manual ledger entries. The repo cannot automatically read every Codex chat token or quota draw.',
      'Impact attribution is best-effort. It groups positive score movement by conformance axis, not a controlled causal experiment.',
      'A harness or documentation gain may improve future decision quality without immediately moving a gameplay score.'
    ]
  };
}

function gameplayImpactInterpretation(part){
  const reads = {
    'Audio feedback and event clarity': 'Player-perceived clarity from sounds that explain danger, reward, loss, and arcade identity.',
    'Gameplay complexity and stage arc': 'Player-perceived variety, pressure, alien choreography, challenge-stage novelty, and long-play learning curve.',
    'Core mechanics and control feel': 'Player-perceived fairness, responsiveness, collision quality, and trust in combat outcomes.',
    'Visual/UI arcade presentation': 'Player-perceived polish, readability, arcade cabinet feel, modal quality, and first-glance confidence.',
    'Overall release-quality rollup': 'Composite release score movement that reflects several subsystems at once.',
    'Measurement confidence and harness coverage': 'Better ability to know whether future changes are genuinely conformant.'
  };
  return reads[part] || 'Positive score movement grouped by the nearest project area.';
}

function summarizeLedger(entries){
  function addResource(acc, resource, entry){
    acc.byResource[resource] = acc.byResource[resource] || { runs: 0, wallSeconds: 0, cpuSeconds: 0 };
    acc.byResource[resource].runs += 1;
    acc.byResource[resource].wallSeconds += entry.measurement?.wallSeconds || 0;
    acc.byResource[resource].cpuSeconds += entry.measurement?.cpuSeconds || 0;
  }
  const totals = entries.reduce((acc, entry) => {
    acc.runs += 1;
    acc.wallSeconds += entry.measurement?.wallSeconds || 0;
    acc.cpuSeconds += entry.measurement?.cpuSeconds || 0;
    acc.artifactBytes += entry.outputs?.artifactBytesDelta || 0;
    const declared = entry.resourcesDeclared || {};
    acc.modelUsage.modelCalls += declared.modelCalls || 0;
    acc.modelUsage.inputTokens += declared.inputTokens || 0;
    acc.modelUsage.outputTokens += declared.outputTokens || 0;
    acc.modelUsage.gpuSeconds += declared.gpuSeconds || 0;
    acc.modelUsage.modelMinutes += declared.modelMinutes || 0;
    if(Number.isFinite(declared.codexUsage5hLeftPercent) || Number.isFinite(declared.codexUsageWeekLeftPercent) || Number.isFinite(declared.codexModel5hLeftPercent) || Number.isFinite(declared.codexModelWeekLeftPercent)){
      acc.modelUsage.codexUsageSnapshots += 1;
      acc.modelUsage.latestCodexUsageSnapshot = {
        startedAt: entry.startedAt || null,
        codexUsage5hLeftPercent: declared.codexUsage5hLeftPercent ?? null,
        codexUsageWeekLeftPercent: declared.codexUsageWeekLeftPercent ?? null,
        codexModel5hLeftPercent: declared.codexModel5hLeftPercent ?? null,
        codexModelWeekLeftPercent: declared.codexModelWeekLeftPercent ?? null,
        usageReset: declared.usageReset || null,
        weeklyReset: declared.weeklyReset || null
      };
    }
    for(const resource of entry.resources || ['unspecified']){
      addResource(acc, resource, entry);
    }
    if(isGpuEquivalentEntry(entry)) addResource(acc, 'gpu-equivalent', entry);
    for(const axis of entry.axes || ['unspecified']){
      acc.byAxis[axis] = acc.byAxis[axis] || { runs: 0, wallSeconds: 0, cpuSeconds: 0 };
      acc.byAxis[axis].runs += 1;
      acc.byAxis[axis].wallSeconds += entry.measurement?.wallSeconds || 0;
      acc.byAxis[axis].cpuSeconds += entry.measurement?.cpuSeconds || 0;
    }
    return acc;
  }, {
    runs: 0,
    wallSeconds: 0,
    cpuSeconds: 0,
    artifactBytes: 0,
    byResource: {},
    byAxis: {},
    modelUsage: {
      modelCalls: 0,
      inputTokens: 0,
      outputTokens: 0,
      gpuSeconds: 0,
      modelMinutes: 0,
      codexUsageSnapshots: 0,
      latestCodexUsageSnapshot: null
    }
  });
  totals.wallSeconds = round(totals.wallSeconds, 3);
  totals.cpuSeconds = round(totals.cpuSeconds, 3);
  totals.modelUsage.gpuSeconds = round(totals.modelUsage.gpuSeconds, 3) || 0;
  totals.modelUsage.modelMinutes = round(totals.modelUsage.modelMinutes, 3) || 0;
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

function polar(cx, cy, radius, angle){
  const rad = (angle - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad)
  };
}

function piePath(cx, cy, radius, startAngle, endAngle){
  const start = polar(cx, cy, radius, endAngle);
  const end = polar(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    'Z'
  ].join(' ');
}

function svgPieChart(file, title, slices, opts = {}){
  const width = 980;
  const height = 430;
  const cx = 245;
  const cy = 225;
  const radius = 142;
  const colors = ['#2b6cb0', '#38a169', '#d69e2e', '#c53030', '#805ad5', '#319795', '#dd6b20', '#718096'];
  const values = slices
    .filter(slice => Number.isFinite(slice.value) && slice.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  const total = values.reduce((sum, slice) => sum + slice.value, 0);
  const lines = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    '<rect width="100%" height="100%" fill="#fff"/>',
    `<text x="48" y="36" font-family="Arial, sans-serif" font-size="20" font-weight="700">${escapeXml(title)}</text>`,
    `<text x="48" y="62" font-family="Arial, sans-serif" font-size="12" fill="#555">${escapeXml(opts.subtitle || '')}</text>`
  ];
  if(!values.length || total <= 0){
    lines.push(`<circle cx="${cx}" cy="${cy}" r="${radius}" fill="#f4f1eb" stroke="#ccc"/>`);
    lines.push(`<text x="${cx}" y="${cy}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#555">No tracked data yet</text>`);
  } else {
    let cursor = 0;
    values.forEach((slice, index) => {
      const next = cursor + (slice.value / total) * 360;
      lines.push(`<path d="${piePath(cx, cy, radius, cursor, next)}" fill="${colors[index % colors.length]}" stroke="#fff" stroke-width="2"><title>${escapeXml(`${slice.label}: ${slice.displayValue || slice.value} (${round((slice.value / total) * 100, 1)}%)`)}</title></path>`);
      cursor = next;
    });
    lines.push(`<circle cx="${cx}" cy="${cy}" r="58" fill="#fff" stroke="#ddd"/>`);
    lines.push(`<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700">${escapeXml(opts.center || '')}</text>`);
    lines.push(`<text x="${cx}" y="${cy + 16}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#555">${escapeXml(opts.centerSub || '')}</text>`);
  }
  const legendX = 455;
  let legendY = 106;
  values.forEach((slice, index) => {
    const pct = total > 0 ? round((slice.value / total) * 100, 1) : 0;
    lines.push(`<rect x="${legendX}" y="${legendY - 13}" width="16" height="16" rx="2" fill="${colors[index % colors.length]}"/>`);
    lines.push(`<text x="${legendX + 24}" y="${legendY}" font-family="Arial, sans-serif" font-size="14" font-weight="700">${escapeXml(slice.label)}</text>`);
    lines.push(`<text x="${legendX + 24}" y="${legendY + 20}" font-family="Arial, sans-serif" font-size="12" fill="#555">${escapeXml(`${slice.displayValue || slice.value} - ${pct}%`)}</text>`);
    if(slice.note){
      lines.push(`<text x="${legendX + 24}" y="${legendY + 38}" font-family="Arial, sans-serif" font-size="11" fill="#666">${escapeXml(slice.note).slice(0, 88)}</text>`);
      legendY += 68;
    } else {
      legendY += 50;
    }
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

function buildCharts(outDir, points, deltas, ledgerSummary, efficiency, computeApplication){
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
  const efficiencyBars = efficiency
    .filter(item => Number.isFinite(item.wallMinutesPerPositiveScore10))
    .slice(0, 9)
    .map(item => ({
      label: item.axis,
      value: item.wallMinutesPerPositiveScore10
    }));
  svgBarChart(path.join(outDir, 'cost-per-positive-score-point.svg'), 'Tracked Wall Minutes Per +1 Score Point', efficiencyBars.length ? efficiencyBars : [{ label: 'no attributed score gains yet', value: 0 }]);
  svgPieChart(
    path.join(outDir, 'gpu-equivalent-use-by-purpose.svg'),
    'GPU-Equivalent Use By Project Purpose',
    (computeApplication.gpuUseByPurpose || []).map(row => ({
      label: row.purpose,
      value: row.wallSeconds,
      displayValue: `${row.wallMinutes} min`,
      note: row.interpretation
    })),
    {
      subtitle: 'Declared Codex/OpenAI/model/API/GPU use. Manual ledger entries fill gaps where app usage is not automatic.',
      center: minutes(computeApplication.totals?.gpuEquivalentWallSeconds || 0),
      centerSub: 'tracked GPU-equivalent'
    }
  );
  svgPieChart(
    path.join(outDir, 'cpu-use-by-purpose.svg'),
    'Local CPU/Browser Use By Project Purpose',
    (computeApplication.cpuUseByPurpose || []).map(row => ({
      label: row.purpose,
      value: row.wallSeconds,
      displayValue: `${row.wallMinutes} min`,
      note: row.interpretation
    })),
    {
      subtitle: 'Measured local harness/browser work grouped by the kind of conformance value it creates.',
      center: minutes(computeApplication.totals?.cpuLocalWallSeconds || 0),
      centerSub: 'tracked local wall'
    }
  );
  svgPieChart(
    path.join(outDir, 'gameplay-improvement-by-project-part.svg'),
    'Positive Score Movement By Project Part',
    (computeApplication.gameplayImprovementByPart || []).map(row => ({
      label: row.part,
      value: row.positiveScore10,
      displayValue: `+${row.positiveScore10} score`,
      note: row.interpretation
    })),
    {
      subtitle: 'Best-effort attribution from recorded positive score deltas, grouped by conformance area.',
      center: `+${computeApplication.totals?.positiveScore10Attributed || 0}`,
      centerSub: 'tracked score movement'
    }
  );
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
    `- GPU-equivalent model/Codex runs: ${report.summary.ledger.byResource['gpu-equivalent']?.runs || 0}`,
    `- Declared model calls: ${report.summary.ledger.modelUsage.modelCalls}`,
    `- Declared model tokens: ${report.summary.ledger.modelUsage.inputTokens} input / ${report.summary.ledger.modelUsage.outputTokens} output`,
    '',
    '## Charts',
    '',
    '- `score-trends.svg`: conformance trends by score axis.',
    '- `largest-score-deltas.svg`: largest positive and negative score changes in the artifact history.',
    '- `compute-minutes-by-resource.svg`: measured future run time by resource class.',
    '- `cost-per-positive-score-point.svg`: approximate tracked wall minutes spent per +1 positive score point by investment axis.',
    '- `gpu-equivalent-use-by-purpose.svg`: declared Codex/OpenAI/model/API/GPU work grouped by what it accomplished.',
    '- `cpu-use-by-purpose.svg`: measured local CPU/browser work grouped by what it accomplished.',
    '- `gameplay-improvement-by-project-part.svg`: best-effort grouping of positive score movement by player-facing project area.',
    '',
    '## Interpretation Rules',
    '',
    '- Treat artifact volume and run count as compute proxies until a command has a measured ledger entry.',
    '- Separate gameplay-quality gains from measurement-precision gains. A harness that explains a failure better has value even when player-facing conformance has not moved yet.',
    '- Track model/API/GPU work explicitly when Codex or OpenAI APIs design or execute a long-cycle assessment. Use the `gpu-equivalent` resource rollup for Codex/model/API work and do not log secrets or raw prompts in the ledger.',
    '- Prefer high-ROI next steps: large gap, clear measurable target, modest local compute, and reusable harness/platform logic.',
    '',
    '## Highest-Value Recent Deltas',
    ''
  ];
  for(const delta of report.deltas.slice(0, 8)){
    lines.push(`- ${delta.axis}: ${delta.before} -> ${delta.after} (${delta.deltaScore10 > 0 ? '+' : ''}${delta.deltaScore10})`);
  }
  lines.push('');
  lines.push('## Relative Cost To Move Metrics');
  lines.push('');
  lines.push('| Axis | Runs | Wall min | Positive score gain | Wall min / +1 score | Attribution |');
  lines.push('| --- | ---: | ---: | ---: | ---: | --- |');
  for(const item of report.costEfficiency.slice(0, 10)){
    lines.push(`| ${item.axis} | ${item.runs} | ${item.wallMinutes} | ${item.positiveScore10} | ${item.wallMinutesPerPositiveScore10 ?? 'n/a'} | ${item.attribution} |`);
  }
  lines.push('');
  lines.push('## Next Instrumentation Step');
  lines.push('');
  lines.push('- Run expensive harnesses through `npm run harness:measure -- --axis <axis> --resource cpu --resource browser -- <command>` so future economics charts can compute cost per score delta instead of relying on artifact-size proxies.');
  lines.push('- Log Codex/model/API-only planning or review work with `npm run harness:measure -- --manual --axis <axis> --resource codex --model-provider openai --model <model> --model-minutes <minutes> --notes "<short note>"`. Optional quota snapshots from the app usage screen can be stored with `--codex-usage-5h-left-percent`, `--codex-usage-week-left-percent`, `--codex-model-5h-left-percent`, and `--codex-model-week-left-percent`.');
  return `${lines.join('\n')}\n`;
}

function resourceRows(report){
  return Object.entries(report.summary.ledger.byResource || {})
    .map(([resource, value]) => ({
      resource,
      runs: value.runs || 0,
      wallSeconds: value.wallSeconds || 0,
      cpuSeconds: value.cpuSeconds || 0
    }))
    .sort((a, b) => b.wallSeconds - a.wallSeconds);
}

function axisRows(report){
  return Object.entries(report.summary.ledger.byAxis || {})
    .map(([axis, value]) => ({
      axis,
      runs: value.runs || 0,
      wallSeconds: value.wallSeconds || 0,
      cpuSeconds: value.cpuSeconds || 0
    }))
    .sort((a, b) => b.wallSeconds - a.wallSeconds);
}

function table(headers, rows){
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(row => `| ${row.map(value => String(value ?? '').replace(/\n/g, ' ')).join(' | ')} |`)
  ].join('\n');
}

function buildTopLevelDoc(report, outDir){
  const ledger = report.summary.ledger;
  const gpuEquivalent = ledger.byResource['gpu-equivalent'] || { runs: 0, wallSeconds: 0, cpuSeconds: 0 };
  const codex = ledger.byResource.codex || { runs: 0, wallSeconds: 0, cpuSeconds: 0 };
  const modelApi = ledger.byResource['model-api'] || { runs: 0, wallSeconds: 0, cpuSeconds: 0 };
  const cpu = ledger.byResource.cpu || { runs: 0, wallSeconds: 0, cpuSeconds: 0 };
  const browser = ledger.byResource.browser || { runs: 0, wallSeconds: 0, cpuSeconds: 0 };
  const latestSnapshot = ledger.modelUsage.latestCodexUsageSnapshot;
  const chart = name => `${rel(path.join(outDir, name))}`;
  const resourceTable = table(
    ['Resource class', 'Measured runs', 'Wall time', 'CPU time', 'Share of tracked wall'],
    resourceRows(report).map(row => [
      row.resource,
      row.runs,
      minutes(row.wallSeconds),
      minutes(row.cpuSeconds),
      percent(row.wallSeconds, ledger.wallSeconds)
    ])
  );
  const axisTable = table(
    ['Axis', 'Measured runs', 'Wall time', 'CPU time'],
    axisRows(report).slice(0, 12).map(row => [
      row.axis,
      row.runs,
      minutes(row.wallSeconds),
      minutes(row.cpuSeconds)
    ])
  );
  const efficiencyTable = table(
    ['Axis', 'Runs', 'Wall min', 'Positive score gain', 'Wall min / +1 score', 'Attribution'],
    report.costEfficiency.slice(0, 12).map(item => [
      item.axis,
      item.runs,
      item.wallMinutes,
      item.positiveScore10,
      item.wallMinutesPerPositiveScore10 ?? 'n/a',
      item.attribution
    ])
  );
  const computeApplication = report.computeApplication || {};
  const gpuPurposeRows = computeApplication.gpuUseByPurpose || [];
  const cpuPurposeRows = computeApplication.cpuUseByPurpose || [];
  const improvementRows = computeApplication.gameplayImprovementByPart || [];
  const gpuPurposeTable = gpuPurposeRows.length ? table(
    ['GPU-equivalent purpose', 'Runs', 'Wall time', 'Share', 'Meaning'],
    gpuPurposeRows.map(row => [
      row.purpose,
      row.runs,
      minutes(row.wallSeconds),
      `${row.sharePercent}%`,
      row.interpretation
    ])
  ) : '_No declared GPU-equivalent purpose rows yet._';
  const cpuPurposeTable = cpuPurposeRows.length ? table(
    ['Local CPU/browser purpose', 'Runs', 'Wall time', 'Share', 'Meaning'],
    cpuPurposeRows.map(row => [
      row.purpose,
      row.runs,
      minutes(row.wallSeconds),
      `${row.sharePercent}%`,
      row.interpretation
    ])
  ) : '_No tracked local CPU/browser purpose rows yet._';
  const improvementTable = improvementRows.length ? table(
    ['Project part', 'Positive score movement', 'Share', 'Player/designer meaning'],
    improvementRows.map(row => [
      row.part,
      `+${row.positiveScore10}`,
      `${row.sharePercent}%`,
      row.interpretation
    ])
  ) : '_No positive score movement rows are attributable yet._';
  const snapshotLines = latestSnapshot ? [
    `- Latest Codex quota snapshot: ${latestSnapshot.startedAt || 'unknown time'}`,
    `- General 5h left: ${latestSnapshot.codexUsage5hLeftPercent ?? 'n/a'}%`,
    `- General weekly left: ${latestSnapshot.codexUsageWeekLeftPercent ?? 'n/a'}%`,
    `- Model 5h left: ${latestSnapshot.codexModel5hLeftPercent ?? 'n/a'}%`,
    `- Model weekly left: ${latestSnapshot.codexModelWeekLeftPercent ?? 'n/a'}%`
  ] : ['- No Codex quota snapshot has been logged yet.'];
  const lines = [
    '# Conformance Economics And Resource Usage',
    '',
    'This is the project section for tracking how Aurora / Platinum conformance improves relative to the resources spent to get there. It is intentionally local-first: we want the MacBook CPU/browser harnesses to carry as much measurement and iteration as possible, while Codex/OpenAI model work is used for strategy, harness design, code generation, interpretation, and selected higher-value analysis.',
    '',
    `Generated: \`${report.generatedAt}\``,
    `Latest artifact: \`${rel(path.join(outDir, 'report.json'))}\``,
    '',
    '## Current Local-Vs-Cloud Read',
    '',
    table(
      ['Read', 'Current value', 'Interpretation'],
      [
        ['Overall quality', `${report.summary.latestOverallScore10}/10`, 'Current release-quality conformance roll-up.'],
        ['Level arc', `${report.summary.latestLevelArcScore10}/10`, 'Current long-play/gameplay-shape roll-up.'],
        ['Measured runs', ledger.runs, 'Commands or manual entries logged in the economics ledger.'],
        ['Local CPU tracked wall', minutes(cpu.wallSeconds), 'Main measured engine for harness execution, report generation, waveform/spectral work, and scoring.'],
        ['Browser-backed local wall', minutes(browser.wallSeconds), 'Subset of local work that exercised Chromium/gameplay runtime.'],
        ['GPU-equivalent tracked wall', minutes(gpuEquivalent.wallSeconds), 'Declared Codex/model/API/GPU usage. This is currently small and under-instrumented.'],
        ['GPU-equivalent share', percent(gpuEquivalent.wallSeconds, ledger.wallSeconds), 'Approximate declared cloud/model share of tracked wall time.'],
        ['Artifact growth', mb(ledger.artifactBytes), 'Evidence volume and review/storage-cost proxy.']
      ]
    ),
    '',
    'The important read today: measured conformance advancement is overwhelmingly local CPU/browser driven. Codex and OpenAI model work are essential for reasoning, implementation, and synthesis, but the repository ledger currently records only a small fraction of that cloud-side work. We should keep pushing computation into reusable local harnesses whenever possible and explicitly log Codex/model/API assistance as `gpu-equivalent` when it materially drives a work cycle.',
    '',
    '## Resource Spend',
    '',
    resourceTable,
    '',
    '## Compute Application And Impact',
    '',
    'These tables answer the practical question behind the economics work: when we spend local CPU/browser time or GPU-equivalent model time, what kind of conformance value are we buying?',
    '',
    '### GPU-Equivalent Use By Purpose',
    '',
    gpuPurposeTable,
    '',
    '### Local CPU/Browser Use By Purpose',
    '',
    cpuPurposeTable,
    '',
    '### Positive Score Movement By Project Area',
    '',
    improvementTable,
    '',
    '## Spend By Conformance Axis',
    '',
    axisTable,
    '',
    '## Cost Per Score Movement',
    '',
    efficiencyTable,
    '',
    '## Charts',
    '',
    `![Conformance score trends](${chart('score-trends.svg')})`,
    '',
    `![Largest score deltas](${chart('largest-score-deltas.svg')})`,
    '',
    `![Compute minutes by resource](${chart('compute-minutes-by-resource.svg')})`,
    '',
    `![Cost per positive score point](${chart('cost-per-positive-score-point.svg')})`,
    '',
    `![GPU-equivalent use by purpose](${chart('gpu-equivalent-use-by-purpose.svg')})`,
    '',
    `![Local CPU use by purpose](${chart('cpu-use-by-purpose.svg')})`,
    '',
    `![Gameplay improvement by project part](${chart('gameplay-improvement-by-project-part.svg')})`,
    '',
    '## Codex / OpenAI Accounting',
    '',
    ...snapshotLines,
    '',
    table(
      ['Cloud/model measure', 'Current logged value'],
      [
        ['Codex resource runs', codex.runs],
        ['Model/API resource runs', modelApi.runs],
        ['GPU-equivalent resource runs', gpuEquivalent.runs],
        ['Declared model calls', ledger.modelUsage.modelCalls],
        ['Declared input tokens', ledger.modelUsage.inputTokens],
        ['Declared output tokens', ledger.modelUsage.outputTokens],
        ['Declared model minutes', ledger.modelUsage.modelMinutes]
      ]
    ),
    '',
    'Current limitation: Codex conversation usage is not automatically visible to the repo. The project can track manual snapshots and declared model/API usage, but it cannot infer all cloud GPU use from a chat session unless we log it. Treat missing Codex/model entries as accounting debt, not proof that no model compute was used.',
    '',
    '## Local-First Doctrine',
    '',
    '- Prefer repeatable local CPU/browser harnesses for long-cycle assessment, sweeps, scoring, and regression checks.',
    '- Use Codex/OpenAI model work to design better measurements, write harness logic, interpret failures, summarize tradeoffs, and choose high-value next investments.',
    '- Convert model insight into persisted local logic whenever possible: new scorers, event extractors, dashboards, candidate loops, and artifact reports.',
    '- Track model/API/Codex help as `gpu-equivalent` when it materially changes the plan, creates a harness, reviews evidence, or performs nontrivial analysis.',
    '- Separate gameplay-facing gains from measurement-facing gains. A better scorer may not move the game score immediately, but it can reduce the cost of every future decision.',
    '',
    '## How To Measure Future Work',
    '',
    'Wrap meaningful local commands with the economics ledger:',
    '',
    '```sh',
    'npm run harness:measure -- \\',
    '  --axis audio \\',
    '  --resource cpu \\',
    '  --resource browser \\',
    '  --notes "audio cue segmentation sweep" \\',
    '  -- npm run harness:analyze:aurora-audio-event-gap',
    '```',
    '',
    'Log Codex/model/API-only work without storing prompts, secrets, or private transcript content:',
    '',
    '```sh',
    'npm run harness:measure -- \\',
    '  --manual \\',
    '  --axis audio \\',
    '  --resource codex \\',
    '  --resource model-api \\',
    '  --model-provider openai \\',
    '  --model gpt-5.3-codex \\',
    '  --model-minutes 30 \\',
    '  --notes "model-assisted cue-window review and harness design"',
    '```',
    '',
    'If the Codex app usage screen is consulted, record only quota percentages and reset dates:',
    '',
    '```sh',
    'npm run harness:measure -- \\',
    '  --manual \\',
    '  --axis conformance-planning \\',
    '  --resource codex \\',
    '  --codex-usage-5h-left-percent 92 \\',
    '  --codex-usage-week-left-percent 86 \\',
    '  --codex-model-5h-left-percent 100 \\',
    '  --codex-model-week-left-percent 100 \\',
    '  --usage-reset "2026-05-08 15:52" \\',
    '  --weekly-reset "2026-05-11" \\',
    '  --notes "quota snapshot before long conformance planning cycle"',
    '```',
    '',
    '## Release Documentation Rule',
    '',
    'Before a serious `/dev`, `/beta`, or `/production` candidate, refresh:',
    '',
    '```sh',
    'npm run harness:analyze:conformance-economics',
    'npm run harness:build:release-conformance-dashboard',
    'npm run harness:build:dev-conformance-dashboard',
    '```',
    '',
    'The release record should include conformance score movement, local CPU/browser spend, GPU/model/API spend where declared, artifact volume, confidence/resolution, and the highest-value next resource investment.'
  ];
  return `${lines.join('\n')}`;
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
  const efficiency = costEfficiency(deltas, ledgerSummary);
  const computeApplication = computeApplicationSummary(ledger, deltas);
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
      costEfficiencyAxisCount: efficiency.length,
      ledger: ledgerSummary
    },
    metricPoints,
    deltas,
    costEfficiency: efficiency,
    computeApplication,
    ledgerSummary
  };
  writeJson(path.join(outDir, 'report.json'), report);
  fs.writeFileSync(path.join(outDir, 'README.md'), buildReadme(report));
  buildCharts(outDir, metricPoints, deltas, ledgerSummary, efficiency, computeApplication);
  fs.writeFileSync(TOP_LEVEL_DOC, buildTopLevelDoc(report, outDir));
  console.log(JSON.stringify({
    ok: true,
    outDir,
    report: path.join(outDir, 'report.json'),
    topLevelDoc: TOP_LEVEL_DOC,
    charts: [
      path.join(outDir, 'score-trends.svg'),
      path.join(outDir, 'largest-score-deltas.svg'),
      path.join(outDir, 'compute-minutes-by-resource.svg'),
      path.join(outDir, 'cost-per-positive-score-point.svg'),
      path.join(outDir, 'gpu-equivalent-use-by-purpose.svg'),
      path.join(outDir, 'cpu-use-by-purpose.svg'),
      path.join(outDir, 'gameplay-improvement-by-project-part.svg')
    ],
    summary: report.summary
  }, null, 2));
}

main();
