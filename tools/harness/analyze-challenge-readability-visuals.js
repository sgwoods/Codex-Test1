#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SWEEP_PATH = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-candidate-sweep', 'latest.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-readability-visuals');

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function round(value, digits = 2){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function esc(value){
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[ch]);
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

function metric(row, pathParts, fallback = null){
  let value = row;
  for(const part of pathParts){
    value = value?.[part];
  }
  return Number.isFinite(+value) ? +value : fallback;
}

function compactCandidate(row){
  if(!row) return null;
  return {
    candidateId: row.candidateId,
    expectedScore10: metric(row, ['expectedMatch', 'score10'], 0),
    targetVideoObjectFitScore10: metric(row, ['targetVideoObjectFit', 'score10'], null),
    humanPerfectPotentialScore10: metric(row, ['humanPerfectPotential', 'score10'], null),
    humanVisibleScore10: metric(row, ['humanVisibleGuardrails', 'score10'], null),
    bunchingRisk: metric(row, ['humanVisibleGuardrails', 'bunchingRisk'], null),
    spacingScore: metric(row, ['humanVisibleGuardrails', 'spacingScore'], null),
    visibleGroupCount: metric(row, ['humanVisibleGuardrails', 'visibleGroupCount'], null),
    expectedGroups: metric(row, ['humanVisibleGuardrails', 'expectedGroups'], null),
    noSafetyRegression: !!row.noSafetyRegression,
    bestMatchLabelId: row.bestMatch?.labelId || null,
    read: row.humanVisibleGuardrails?.read || ''
  };
}

function uniqueCandidates(candidates){
  const seen = new Set();
  return candidates.filter(Boolean).filter(row => {
    if(seen.has(row.candidateId)) return false;
    seen.add(row.candidateId);
    return true;
  });
}

function bar(x, y, width, value, color, label){
  const safeValue = Number.isFinite(+value) ? Math.max(0, Math.min(10, +value)) : 0;
  const filled = width * (safeValue / 10);
  return `
    <text x="${x}" y="${y - 6}" fill="#c9eaff" font-size="14">${esc(label)} ${Number.isFinite(+value) ? `${round(value, 1)}/10` : 'n/a'}</text>
    <rect x="${x}" y="${y}" width="${width}" height="12" rx="6" fill="#0a1a27" stroke="#25485c"/>
    <rect x="${x}" y="${y}" width="${filled}" height="12" rx="6" fill="${color}"/>
  `;
}

function riskBar(x, y, width, risk){
  const safeRisk = Number.isFinite(+risk) ? Math.max(0, Math.min(1, +risk)) : 0;
  const filled = width * safeRisk;
  return `
    <text x="${x}" y="${y - 6}" fill="#c9eaff" font-size="14">Bunching Risk ${Number.isFinite(+risk) ? round(risk, 2) : 'n/a'}</text>
    <rect x="${x}" y="${y}" width="${width}" height="12" rx="6" fill="#0a1a27" stroke="#25485c"/>
    <rect x="${x}" y="${y}" width="${filled}" height="12" rx="6" fill="#ff6961"/>
  `;
}

function card(row, index){
  const x = 32 + index * 276;
  const y = 118;
  return `
    <g>
      <rect x="${x}" y="${y}" width="252" height="318" rx="14" fill="#0d2232" stroke="#31566e"/>
      <text x="${x + 18}" y="${y + 34}" fill="#f4fbff" font-size="18" font-weight="700">${esc(row.label)}</text>
      <text x="${x + 18}" y="${y + 58}" fill="#9ed1ec" font-size="12">${esc(row.candidateId)}</text>
      ${bar(x + 18, y + 92, 216, row.expectedScore10, '#6ee7b7', 'Expected')}
      ${bar(x + 18, y + 137, 216, row.targetVideoObjectFitScore10, '#5eead4', 'Target Fit')}
      ${bar(x + 18, y + 182, 216, row.humanPerfectPotentialScore10, '#fde68a', 'Perfect')}
      ${bar(x + 18, y + 227, 216, row.humanVisibleScore10, '#93c5fd', 'Visible')}
      ${riskBar(x + 18, y + 272, 216, row.bunchingRisk)}
      <text x="${x + 18}" y="${y + 306}" fill="#a5c5d8" font-size="12">${esc(row.visibleGroupCount ?? 'n/a')}/${esc(row.expectedGroups ?? 'n/a')} groups, safety ${row.noSafetyRegression ? 'pass' : 'risk'}</text>
    </g>
  `;
}

function buildSvg(report){
  const rows = report.candidatesToCompare || [];
  const height = 520;
  const width = Math.max(1160, 64 + rows.length * 276);
  const bunchingDelta = Number.isFinite(+report.summary.bunchingRiskDelta)
    ? `${report.summary.bunchingRiskDelta >= 0 ? '+' : ''}${round(report.summary.bunchingRiskDelta, 2)}`
    : 'n/a';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#06131d"/>
  <text x="32" y="44" fill="#f8fbff" font-size="28" font-weight="800">Stage ${esc(report.stage)} Challenge Readability Visual</text>
  <text x="32" y="76" fill="#a9cee3" font-size="15">Baseline vs best-selection vs readability and least-bunched diagnostic candidates. Lower bunching risk is better; runtime promotion still requires identity, scoreability, and safety gates.</text>
  <text x="32" y="100" fill="#d8f3ff" font-size="14">Best least-bunched: ${esc(report.summary.leastBunchedCandidateId || 'pending')} (${esc(report.summary.leastBunchedBunchingRisk ?? 'n/a')} risk, delta ${esc(bunchingDelta)} vs baseline).</text>
  ${rows.map(card).join('\n')}
  <text x="32" y="478" fill="#88aac0" font-size="13">Generated ${esc(report.generatedAt)} on ${esc(report.branch)} @ ${esc(report.commit)}. Artifact: reference-artifacts/analyses/challenge-stage-readability-visuals/latest.json</text>
</svg>`;
}

function main(){
  if(!fs.existsSync(SWEEP_PATH)){
    throw new Error('Missing challenge-stage candidate sweep. Run npm run harness:sweep:stage7-challenge-candidates first.');
  }
  const sweep = readJson(SWEEP_PATH);
  const candidates = Array.isArray(sweep.candidates) ? sweep.candidates : [];
  const diagnostics = sweep.diagnostics || {};
  const baseline = candidates.find(row => row.candidateId === (sweep.summary?.baselineCandidateId || 'baseline-current'))
    || candidates.find(row => row.candidateId === 'baseline-current')
    || null;
  const best = candidates.find(row => row.candidateId === sweep.summary?.bestCandidateId) || null;
  const readability = candidates.find(row => row.candidateId === diagnostics.readabilityTop?.[0]?.candidateId)
    || diagnostics.readabilityTop?.[0]
    || null;
  const leastBunched = candidates.find(row => row.candidateId === diagnostics.leastBunchedTop?.[0]?.candidateId)
    || diagnostics.leastBunchedTop?.[0]
    || null;
  const deconflict = candidates.find(row => row.candidateId === diagnostics.deconflictTop?.[0]?.candidateId)
    || diagnostics.deconflictTop?.[0]
    || null;
  const compact = uniqueCandidates([
    Object.assign({ label: 'Baseline' }, compactCandidate(baseline) || {}),
    Object.assign({ label: 'Best Selection' }, compactCandidate(best) || {}),
    Object.assign({ label: 'Best Readability' }, compactCandidate(readability) || {}),
    Object.assign({ label: 'Least Bunched' }, compactCandidate(leastBunched) || {}),
    Object.assign({ label: 'Best Deconflict' }, compactCandidate(deconflict) || {})
  ].filter(row => row.candidateId));
  const baselineRisk = compact.find(row => row.label === 'Baseline')?.bunchingRisk;
  const leastRisk = compact.find(row => row.label === 'Least Bunched')?.bunchingRisk;
  const report = {
    schemaVersion: 1,
    artifactType: 'challenge-stage-readability-visuals',
    generatedAt: new Date().toISOString(),
    commit: gitShortCommit(),
    branch: gitBranch(),
    stage: sweep.stage || null,
    sourceSweep: 'reference-artifacts/analyses/challenge-stage-candidate-sweep/latest.json',
    candidatesToCompare: compact,
    summary: {
      baselineCandidateId: compact.find(row => row.label === 'Baseline')?.candidateId || null,
      baselineBunchingRisk: round(baselineRisk, 3),
      leastBunchedCandidateId: compact.find(row => row.label === 'Least Bunched')?.candidateId || null,
      leastBunchedBunchingRisk: round(leastRisk, 3),
      bunchingRiskDelta: Number.isFinite(+baselineRisk) && Number.isFinite(+leastRisk)
        ? round(+leastRisk - +baselineRisk, 3)
        : null,
      playerMeaning: 'This artifact makes swarm readability review visual: it shows whether candidate grammar reduced clumping without hiding scoreability, identity, or safety tradeoffs.'
    }
  };
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  writeText(path.join(OUT_ROOT, 'latest.svg'), buildSvg(report));
  console.log(JSON.stringify({
    ok: true,
    artifact: 'reference-artifacts/analyses/challenge-stage-readability-visuals/latest.json',
    svg: 'reference-artifacts/analyses/challenge-stage-readability-visuals/latest.svg',
    stage: report.stage,
    summary: report.summary
  }, null, 2));
}

main();
