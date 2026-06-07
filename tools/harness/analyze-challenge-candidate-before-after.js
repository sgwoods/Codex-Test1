#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const SWEEP_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-candidate-sweep');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-candidate-before-after');
const SAMPLE_TIMES = [0.5, 2, 3.5, 5, 6.5, 8, 9.5, 11, 12.5, 14, 15.5];

function argValue(name, fallback = ''){
  const prefix = `--${name}=`;
  const direct = process.argv.find(arg => arg.startsWith(prefix));
  if(direct) return direct.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if(index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback = null){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch{
    return fallback;
  }
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, String(value).replace(/\r\n/g, '\n').trimEnd() + '\n');
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 2){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : 0;
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

function findLatestSweepForStage(stage){
  const latest = readJson(path.join(SWEEP_ROOT, 'latest.json'), null);
  if(latest && +latest.stage === +stage) return { file: path.join(SWEEP_ROOT, 'latest.json'), report: latest };
  if(!fs.existsSync(SWEEP_ROOT)) return null;
  const candidates = [];
  for(const entry of fs.readdirSync(SWEEP_ROOT, { withFileTypes: true })){
    if(!entry.isDirectory()) continue;
    const file = path.join(SWEEP_ROOT, entry.name, 'report.json');
    const report = readJson(file, null);
    if(report && +report.stage === +stage) candidates.push({ file, report });
  }
  candidates.sort((a, b) => String(b.report.generatedAt || '').localeCompare(String(a.report.generatedAt || '')));
  return candidates[0] || null;
}

function imageDimensions(file){
  const data = fs.readFileSync(file);
  if(data.length < 24 || data.readUInt32BE(0) !== 0x89504e47) return { width: 900, height: 1200 };
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20)
  };
}

function esc(text){
  return String(text ?? '').replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
}

function svgText(text, x, y, size = 16, fill = '#eaf8ff', weight = 700){
  return `<text x="${x}" y="${y}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(text)}</text>`;
}

function imageTag(file, x, y, width, height){
  const data = fs.readFileSync(file).toString('base64');
  return `<image href="data:image/png;base64,${data}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>`;
}

function summarizeFormation(state = {}){
  const enemies = Array.isArray(state.enemies) ? state.enemies : [];
  const live = enemies.filter(enemy => enemy && enemy.hp !== 0);
  const xs = live.map(enemy => +enemy.x).filter(Number.isFinite);
  const ys = live.map(enemy => +enemy.y).filter(Number.isFinite);
  const unique = key => [...new Set(live.map(enemy => enemy[key]).filter(Boolean))].sort();
  return {
    enemyCount: live.length,
    typeKeys: unique('type'),
    families: unique('family'),
    pathFamilies: unique('pathFamily'),
    xRange: xs.length ? round(Math.max(...xs) - Math.min(...xs)) : 0,
    yRange: ys.length ? round(Math.max(...ys) - Math.min(...ys)) : 0,
    minY: ys.length ? round(Math.min(...ys)) : null,
    maxY: ys.length ? round(Math.max(...ys)) : null
  };
}

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function aggregate(samples){
  const summaries = samples.map(sample => sample.summary || {});
  return {
    sampleCount: samples.length,
    averageEnemyCount: round(average(summaries.map(summary => summary.enemyCount))),
    averageXRange: round(average(summaries.map(summary => summary.xRange))),
    averageYRange: round(average(summaries.map(summary => summary.yRange))),
    pathFamilies: [...new Set(summaries.flatMap(summary => summary.pathFamilies || []))].sort(),
    typeKeys: [...new Set(summaries.flatMap(summary => summary.typeKeys || []))].sort()
  };
}

function ratio(candidate, baseline){
  const c = +candidate;
  const b = +baseline;
  return Number.isFinite(c) && Number.isFinite(b) && b > 0 ? round(c / b, 3) : null;
}

function visualPresenceGuardrails(baselineAggregate = {}, candidateAggregate = {}){
  const enemyCountRatio = ratio(candidateAggregate.averageEnemyCount, baselineAggregate.averageEnemyCount);
  const xRangeRatio = ratio(candidateAggregate.averageXRange, baselineAggregate.averageXRange);
  const yRangeRatio = ratio(candidateAggregate.averageYRange, baselineAggregate.averageYRange);
  const enemyCountDelta = round((+candidateAggregate.averageEnemyCount || 0) - (+baselineAggregate.averageEnemyCount || 0), 2);
  const xRangeDelta = round((+candidateAggregate.averageXRange || 0) - (+baselineAggregate.averageXRange || 0), 2);
  const yRangeDelta = round((+candidateAggregate.averageYRange || 0) - (+baselineAggregate.averageYRange || 0), 2);
  const enemyCountPass = enemyCountRatio === null || enemyCountRatio >= 0.82;
  const xRangePass = xRangeRatio === null || xRangeRatio >= 0.72;
  const yRangePass = yRangeRatio === null || yRangeRatio >= 0.72;
  const pass = enemyCountPass && xRangePass && yRangePass;
  const blocked = [];
  if(!enemyCountPass) blocked.push(`visible enemy density collapsed to ${enemyCountRatio}x baseline`);
  if(!xRangePass) blocked.push(`horizontal swarm range collapsed to ${xRangeRatio}x baseline`);
  if(!yRangePass) blocked.push(`vertical swarm range collapsed to ${yRangeRatio}x baseline`);
  return {
    pass,
    baseline: {
      averageEnemyCount: baselineAggregate.averageEnemyCount,
      averageXRange: baselineAggregate.averageXRange,
      averageYRange: baselineAggregate.averageYRange
    },
    candidate: {
      averageEnemyCount: candidateAggregate.averageEnemyCount,
      averageXRange: candidateAggregate.averageXRange,
      averageYRange: candidateAggregate.averageYRange
    },
    enemyCountRatio,
    xRangeRatio,
    yRangeRatio,
    enemyCountDelta,
    xRangeDelta,
    yRangeDelta,
    policy: 'A challenge candidate may reduce overlap, but it must preserve visible swarm presence: at least 82% of baseline visible enemy density and at least 72% of baseline horizontal and vertical runtime spread in the before/after window.',
    read: pass
      ? `Visual presence preserved: enemy density ${enemyCountRatio ?? 'n/a'}x, horizontal range ${xRangeRatio ?? 'n/a'}x, vertical range ${yRangeRatio ?? 'n/a'}x versus baseline.`
      : `Visual presence guard blocks promotion: ${blocked.join('; ')}.`
  };
}

function scoreValue(item, pathParts, fallback = null){
  let value = item;
  for(const part of pathParts){
    if(value == null) return fallback;
    value = value[part];
  }
  return Number.isFinite(+value) ? round(value, 2) : fallback;
}

function summarizeSelectedCandidate(candidate, sweepSummary = {}){
  const expectedScore10 = scoreValue(candidate, ['expectedMatch', 'score10'], scoreValue(candidate, ['bestMatch', 'score10'], null));
  const targetVideoObjectFitScore10 = scoreValue(candidate, ['targetVideoObjectFit', 'score10'], null);
  const humanPerfectPotentialScore10 = scoreValue(candidate, ['humanPerfectPotential', 'score10'], null);
  const baselineExpectedScore10 = scoreValue(sweepSummary, ['baselineExpectedScore10'], null);
  const baselineTargetVideoObjectFitScore10 = scoreValue(sweepSummary, ['baselineTargetVideoObjectFitScore10'], null);
  const baselineHumanPerfectPotentialScore10 = scoreValue(sweepSummary, ['baselineHumanPerfectPotentialScore10'], null);
  const expectedLift10 = baselineExpectedScore10 === null || expectedScore10 === null
    ? null
    : round(expectedScore10 - baselineExpectedScore10, 2);
  const targetVideoObjectFitLift10 = baselineTargetVideoObjectFitScore10 === null || targetVideoObjectFitScore10 === null
    ? null
    : round(targetVideoObjectFitScore10 - baselineTargetVideoObjectFitScore10, 2);
  const humanPerfectPotentialLift10 = baselineHumanPerfectPotentialScore10 === null || humanPerfectPotentialScore10 === null
    ? null
    : round(humanPerfectPotentialScore10 - baselineHumanPerfectPotentialScore10, 2);
  return {
    candidateId: candidate.candidateId,
    description: candidate.description || '',
    expectedScore10,
    targetVideoObjectFitScore10,
    humanPerfectPotentialScore10,
    baselineExpectedScore10,
    baselineTargetVideoObjectFitScore10,
    baselineHumanPerfectPotentialScore10,
    expectedLift10,
    targetVideoObjectFitLift10,
    humanPerfectPotentialLift10,
    humanPerfectGuard: candidate.humanPerfectGuard || null,
    bestMatch: candidate.bestMatch || null,
    expectedMatch: candidate.expectedMatch || null,
    targetVideoObjectFit: candidate.targetVideoObjectFit ? {
      score10: targetVideoObjectFitScore10,
      coverage: round(candidate.targetVideoObjectFit.coverage, 3),
      groupCount: candidate.targetVideoObjectFit.groupCount ?? null,
      targetGroupCount: candidate.targetVideoObjectFit.targetGroupCount ?? null,
      read: candidate.targetVideoObjectFit.read || ''
    } : null,
    read: `Selected candidate ${candidate.candidateId} changes expected-label score by ${expectedLift10 ?? 'n/a'}/10, target-video fit by ${targetVideoObjectFitLift10 ?? 'n/a'}/10, and human-perfect routeability by ${humanPerfectPotentialLift10 ?? 'n/a'}/10.`
  };
}

async function captureRun({ stage, label, layoutOverride, outDir }){
  const frameDir = path.join(outDir, 'frames', label);
  fs.rmSync(frameDir, { recursive: true, force: true });
  ensureDir(frameDir);
  return withHarnessPage({ stage, ships: 3, challenge: false, seed: 7313 }, async ({ page }) => {
    await page.evaluate(cfg => window.__galagaHarness__.setupChallengeMotionProfileTest(cfg), {
      stage,
      layoutOverride
    });
    const frames = [];
    const samples = [];
    let previous = 0;
    for(const t of SAMPLE_TIMES){
      const delta = Math.max(0, t - previous);
      if(delta > 0){
        await page.evaluate(seconds => window.__galagaHarness__.advanceFor(seconds, {
          step: 1 / 60,
          stopOnGameOver: false
        }), delta);
      }
      previous = t;
      const state = await page.evaluate(() => window.__galagaHarness__.challengeFormationState());
      const file = path.join(frameDir, `${label}-${String(frames.length + 1).padStart(2, '0')}-${String(Math.round(t * 10)).padStart(3, '0')}ds.png`);
      await page.locator('#playfieldFrame').screenshot({ path: file });
      const summary = summarizeFormation(state);
      frames.push({ t, path: rel(file), summary });
      samples.push({ t, summary });
    }
    return { label, frames, samples, aggregate: aggregate(samples) };
  });
}

function writeContactSheet({ stage, candidateId, baseline, candidate, outDir }){
  const first = baseline.frames[0]?.path ? path.join(ROOT, baseline.frames[0].path) : '';
  const dims = first && fs.existsSync(first) ? imageDimensions(first) : { width: 900, height: 1200 };
  const thumbW = 214;
  const thumbH = Math.round(thumbW * (dims.height / Math.max(1, dims.width)));
  const gutter = 14;
  const labelH = 36;
  const columns = SAMPLE_TIMES.length;
  const width = 40 + (thumbW * columns) + (gutter * (columns - 1));
  const height = 132 + (thumbH * 2) + labelH + gutter + 56;
  const children = [
    `<rect width="100%" height="100%" fill="#06101a"/>`,
    svgText(`Challenging Stage ${stage - 1}-${stage} candidate before/after`, 24, 34, 22, '#f2fbff', 800),
    svgText(`Candidate: ${candidateId}`, 24, 62, 15, '#9fc8e8', 600),
    svgText('Baseline', 24, 108, 18, '#ffb0a8', 800),
    svgText('Candidate', 24, 108 + labelH + thumbH + gutter, 18, '#8effd2', 800)
  ];
  baseline.frames.forEach((frame, index) => {
    const x = 20 + index * (thumbW + gutter);
    const y = 124;
    children.push(svgText(`${frame.t.toFixed(1)}s`, x + 8, y - 8, 12, '#c7dff3', 700));
    children.push(`<rect x="${x}" y="${y}" width="${thumbW}" height="${thumbH}" rx="6" fill="#000" stroke="#244863"/>`);
    children.push(imageTag(path.join(ROOT, frame.path), x, y, thumbW, thumbH));
  });
  candidate.frames.forEach((frame, index) => {
    const x = 20 + index * (thumbW + gutter);
    const y = 124 + labelH + thumbH + gutter;
    children.push(svgText(`${frame.t.toFixed(1)}s`, x + 8, y - 8, 12, '#c7dff3', 700));
    children.push(`<rect x="${x}" y="${y}" width="${thumbW}" height="${thumbH}" rx="6" fill="#000" stroke="#244863"/>`);
    children.push(imageTag(path.join(ROOT, frame.path), x, y, thumbW, thumbH));
  });
  children.push(svgText('Read with metrics: this sheet shows visual timing/shape only; promotion still requires full challenge conformance, routeability, and human-perfect checks.', 24, height - 26, 14, '#9fc8e8', 500));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
  ${children.join('\n  ')}
</svg>
`;
  const out = path.join(outDir, `challenge-stage-${String(stage).padStart(2, '0')}-candidate-before-after.svg`);
  writeText(out, svg);
  return rel(out);
}

function readme(report){
  return `# Challenge Candidate Before/After

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

Stage: ${report.stage}
Candidate: ${report.candidateId}

This artifact is a human-readable review sheet for a focused candidate from the challenge-stage sweep. It compares the current runtime baseline against the candidate layout override at the same sample times.

- Contact sheet: \`${report.media.contactSheet}\`
- Source sweep: \`${report.sourceSweep}\`
- Candidate decision: ${report.sweepSummary.keeperDecision}
- Selected candidate expected-label lift: ${report.selectedCandidate.expectedLift10}/10
- Selected candidate target-video object-track lift: ${report.selectedCandidate.targetVideoObjectFitLift10}/10
- Selected candidate human-perfect lift: ${report.selectedCandidate.humanPerfectPotentialLift10}/10
- Visual presence guard: ${report.visualPresenceGuardrails.pass ? 'pass' : 'blocked'} (${report.visualPresenceGuardrails.read})

## Measurement Limits

This is visual evidence, not a promotion gate by itself. A runtime change must still pass full challenge-stage conformance, routeability, human-perfect playability, safety, and build checks.
`;
}

async function main(){
  const stage = Number(argValue('stage', '3'));
  if(!Number.isFinite(stage)) throw new Error('stage must be numeric');
  const sweepItem = findLatestSweepForStage(stage);
  if(!sweepItem) throw new Error(`No candidate sweep report found for stage ${stage}`);
  const sweep = sweepItem.report;
  const candidateId = argValue('candidate', sweep.summary?.bestCandidateId || '');
  const candidate = (sweep.candidates || []).find(row => row.candidateId === candidateId);
  if(!candidate) throw new Error(`Candidate ${candidateId} not found in ${rel(sweepItem.file)}`);
  const selectedCandidate = summarizeSelectedCandidate(candidate, sweep.summary || {});
  const stamp = `${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}-${gitShortCommit()}`;
  const outDir = path.join(OUT_ROOT, stamp);
  fs.rmSync(outDir, { recursive: true, force: true });
  ensureDir(outDir);
  const baselineRun = await captureRun({ stage, label: 'baseline', layoutOverride: null, outDir });
  const candidateRun = await captureRun({ stage, label: 'candidate', layoutOverride: candidate.layout, outDir });
  const visualPresence = visualPresenceGuardrails(baselineRun.aggregate, candidateRun.aggregate);
  const contactSheet = writeContactSheet({ stage, candidateId, baseline: baselineRun, candidate: candidateRun, outDir });
  const latestContactSheet = path.join(OUT_ROOT, 'latest-candidate-before-after.svg');
  fs.copyFileSync(path.join(ROOT, contactSheet), latestContactSheet);
  const report = {
    schemaVersion: 1,
    artifactType: 'challenge-candidate-before-after',
    generatedAt: new Date().toISOString(),
    generatedBy: 'tools/harness/analyze-challenge-candidate-before-after.js',
    commit: gitShortCommit(),
    branch: gitBranch(),
    stage,
    candidateId,
    sourceSweep: rel(sweepItem.file),
    sweepSummary: sweep.summary || {},
    selectedCandidate,
    media: {
      contactSheet,
      latestContactSheet: rel(latestContactSheet)
    },
    baseline: baselineRun,
    candidate: candidateRun,
    visualPresenceGuardrails: visualPresence,
    read: `Candidate ${candidateId} should be visually compared against baseline, then accepted only if the full analyzers preserve safety, human-perfect playability, and visual swarm presence. ${selectedCandidate.read} ${visualPresence.read}`
  };
  writeJson(path.join(outDir, 'report.json'), report);
  writeText(path.join(outDir, 'README.md'), readme(report));
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  console.log(JSON.stringify({
    ok: true,
    stage,
    candidateId,
    contactSheet,
    latestContactSheet: rel(latestContactSheet),
    latest: rel(path.join(OUT_ROOT, 'latest.json'))
  }, null, 2));
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
