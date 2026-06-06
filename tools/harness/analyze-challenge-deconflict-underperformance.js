#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SWEEP = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-candidate-sweep', 'latest.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-deconflict-underperformance');

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

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
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

function compact(row){
  if(!row) return null;
  const visible = row.humanVisibleGuardrails || {};
  return {
    candidateId: row.candidateId || null,
    expectedScore10: round(row.expectedScore10 ?? row.expectedMatch?.score10, 2),
    targetVideoObjectFitScore10: round(row.targetVideoObjectFitScore10 ?? row.targetVideoObjectFit?.score10, 2),
    humanPerfectPotentialScore10: round(row.humanPerfectPotentialScore10 ?? row.humanPerfectPotential?.score10, 2),
    humanVisibleScore10: round(visible.score10, 2),
    bunchingRisk: round(visible.bunchingRisk, 3),
    magicAppearanceRisk: round(visible.magicAppearanceRisk, 3),
    spacingScore: round(visible.spacingScore, 3),
    arrivalContinuity: round(visible.arrivalContinuity, 3),
    pass: typeof visible.pass === 'boolean' ? visible.pass : null,
    read: visible.read || ''
  };
}

function lift(from, to, field){
  const a = Number.isFinite(+from?.[field]) ? +from[field] : null;
  const b = Number.isFinite(+to?.[field]) ? +to[field] : null;
  return a !== null && b !== null ? round(b - a, 3) : null;
}

function buildMarkdown(report){
  const rows = ['baseline', 'bestSelection', 'bestReadability', 'leastBunched', 'bestDeconflict', 'bestRouteAware']
    .map(key => report.rows[key])
    .filter(Boolean)
    .map(row => `| ${row.candidateId} | ${row.expectedScore10 ?? 'n/a'} | ${row.targetVideoObjectFitScore10 ?? 'n/a'} | ${row.humanPerfectPotentialScore10 ?? 'n/a'} | ${row.humanVisibleScore10 ?? 'n/a'} | ${row.bunchingRisk ?? 'n/a'} | ${row.magicAppearanceRisk ?? 'n/a'} | ${row.spacingScore ?? 'n/a'} | ${row.arrivalContinuity ?? 'n/a'} | ${row.pass === true ? 'pass' : 'blocked'} |`)
    .join('\n');
  return `# Challenge Deconflict Underperformance

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Summary

${report.summary.read}

- Baseline bunching risk: ${report.summary.baselineBunchingRisk}
- Best readability bunching risk: ${report.summary.bestReadabilityBunchingRisk}
- Least-bunched diagnostic risk: ${report.summary.leastBunchedBunchingRisk}
- Best deconflict risk: ${report.summary.bestDeconflictBunchingRisk}
- Best route-aware risk: ${report.summary.bestRouteAwareBunchingRisk}
- Deconflict gap vs least-bunched: ${report.summary.deconflictRiskGapVsLeastBunched}
- Route-aware gap vs least-bunched: ${report.summary.routeRiskGapVsLeastBunched}

## Candidate Comparison

| Candidate | Expected | Target Fit | Human Perfect | Human Visible | Bunching Risk | Magic Risk | Spacing | Arrival | Gate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${rows}

## Next Primitive

${report.nextPrimitive.read}
`;
}

function main(){
  if(!fs.existsSync(SWEEP)) throw new Error('Missing latest challenge-stage candidate sweep.');
  const sweep = readJson(SWEEP);
  const candidates = Array.isArray(sweep.candidates) ? sweep.candidates : [];
  const diagnostics = sweep.diagnostics || {};
  const baseline = candidates.find(row => row.candidateId === (sweep.summary?.baselineCandidateId || 'baseline-current'))
    || candidates.find(row => row.candidateId === 'baseline-current')
    || null;
  const bestSelection = candidates.find(row => row.candidateId === sweep.summary?.bestCandidateId) || null;
  const bestReadability = candidates.find(row => row.candidateId === diagnostics.readabilityTop?.[0]?.candidateId)
    || diagnostics.readabilityTop?.[0]
    || null;
  const leastBunched = candidates.find(row => row.candidateId === diagnostics.leastBunchedTop?.[0]?.candidateId)
    || diagnostics.leastBunchedTop?.[0]
    || null;
  const bestDeconflict = candidates.find(row => row.candidateId === diagnostics.deconflictTop?.[0]?.candidateId)
    || diagnostics.deconflictTop?.[0]
    || null;
  const bestRouteAware = candidates.find(row => row.candidateId === diagnostics.routeAwareTop?.[0]?.candidateId)
    || diagnostics.routeAwareTop?.[0]
    || null;
  const rows = {
    baseline: compact(baseline),
    bestSelection: compact(bestSelection),
    bestReadability: compact(bestReadability),
    leastBunched: compact(leastBunched),
    bestDeconflict: compact(bestDeconflict),
    bestRouteAware: compact(bestRouteAware)
  };
  const deconflictRiskGapVsLeastBunched = lift(rows.leastBunched, rows.bestDeconflict, 'bunchingRisk');
  const routeRiskGapVsLeastBunched = lift(rows.leastBunched, rows.bestRouteAware, 'bunchingRisk');
  const deconflictBeatsReadability = Number.isFinite(+rows.bestReadability?.bunchingRisk) && Number.isFinite(+rows.bestDeconflict?.bunchingRisk)
    ? rows.bestDeconflict.bunchingRisk <= rows.bestReadability.bunchingRisk
    : false;
  const routeBeatsDeconflict = Number.isFinite(+rows.bestRouteAware?.bunchingRisk) && Number.isFinite(+rows.bestDeconflict?.bunchingRisk)
    ? rows.bestRouteAware.bunchingRisk <= rows.bestDeconflict.bunchingRisk
    : false;
  const read = routeBeatsDeconflict
    ? 'Route-aware group offsets now beat direct deconflict on bunching risk, but they remain far from the promotion gate and need density, target-fit, and human-perfect review before runtime promotion. Direct deconflict still improves baseline readability, but the rejected full-analyzer trial shows local deconfliction can create misleading wins.'
    : deconflictBeatsReadability
      ? 'The stronger direct deconflict family now beats the earlier readability/timing family on bunching, but it remains far from the promotion gate. Route-aware offsets reduce magic-appearance risk and are now a useful grammar seam, but they did not beat deconflict-only on bunching in this pass, so they should remain measured rather than promoted.'
      : 'Direct object-level deconfliction improved over the current baseline but did not beat the best readability/timing candidate. The next attempt should move whole route groups coherently, then use object-level offsets only as a secondary fine-tuning layer.';
  const report = {
    schemaVersion: 1,
    artifactType: 'challenge-deconflict-underperformance',
    generatedAt: new Date().toISOString(),
    commit: gitShortCommit(),
    branch: gitBranch(),
    stage: sweep.stage || null,
    sourceSweep: 'reference-artifacts/analyses/challenge-stage-candidate-sweep/latest.json',
    rows,
    summary: {
      baselineBunchingRisk: rows.baseline?.bunchingRisk ?? null,
      bestReadabilityBunchingRisk: rows.bestReadability?.bunchingRisk ?? null,
      leastBunchedBunchingRisk: rows.leastBunched?.bunchingRisk ?? null,
      bestDeconflictBunchingRisk: rows.bestDeconflict?.bunchingRisk ?? null,
      bestRouteAwareBunchingRisk: rows.bestRouteAware?.bunchingRisk ?? null,
      deconflictRiskGapVsLeastBunched,
      routeRiskGapVsLeastBunched,
      deconflictImprovesBaseline: Number.isFinite(+rows.baseline?.bunchingRisk) && Number.isFinite(+rows.bestDeconflict?.bunchingRisk)
        ? rows.bestDeconflict.bunchingRisk < rows.baseline.bunchingRisk
        : false,
      deconflictBeatsReadability,
      routeBeatsDeconflict,
      read
    },
    nextPrimitive: {
      id: 'route-aware-group-separation',
      controls: ['routeOffsetX', 'routeOffsetY', 'routeCurveX', 'routeCurveY', 'routePhaseS'],
      read: 'Move entire challenge groups as authored routes before applying per-lane/object separation. This should reduce inter-group overlap while preserving the feeling that aliens arrive in coherent Galaga-like waves.'
    }
  };
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  writeText(path.join(OUT_ROOT, 'README.md'), buildMarkdown(report));
  console.log(JSON.stringify({
    ok: true,
    artifact: 'reference-artifacts/analyses/challenge-deconflict-underperformance/latest.json',
    stage: report.stage,
    summary: report.summary
  }, null, 2));
}

main();
