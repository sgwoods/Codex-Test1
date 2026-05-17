#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE = path.join(ROOT, 'reference-artifacts', 'ingestion', 'galaga-target-artifact-corpus', 'target-artifacts-0.1.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-target-artifact-coverage');
const REPORT_MD = path.join(ROOT, 'GALAGA_TARGET_ARTIFACT_COVERAGE.md');

const AXIS_WEIGHTS = {
  'challenge-stage entry': 0.16,
  'trajectory': 0.14,
  'late challenge-stage progression': 0.14,
  'later challenge stages': 0.12,
  'rules': 0.1,
  'scoring': 0.06,
  'sprites': 0.08,
  'audio': 0.08,
  'screen surfaces': 0.06,
  'enemy taxonomy': 0.06
};

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
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
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

function round(value, digits = 1){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function statusCredit(status){
  const key = String(status || '').toLowerCase();
  if(key === 'ingested') return 1;
  if(key === 'partial') return 0.62;
  if(key === 'candidate') return 0.28;
  if(key === 'planned') return 0.18;
  if(key === 'not-ingested') return 0;
  return 0;
}

function confidenceCredit(confidence){
  const key = String(confidence || '').toLowerCase();
  if(key.includes('medium-high')) return 0.82;
  if(key.includes('high')) return 1;
  if(key === 'medium') return 0.68;
  if(key.includes('medium-low')) return 0.5;
  if(key.includes('low')) return 0.35;
  return 0.55;
}

function priorityRank(priority){
  const key = String(priority || '').toLowerCase();
  if(key === 'critical') return 4;
  if(key === 'high') return 3;
  if(key === 'medium-high') return 2.5;
  if(key === 'medium') return 2;
  if(key === 'low-medium') return 1;
  return 0.5;
}

function localEvidenceStatus(paths){
  const rows = (Array.isArray(paths) ? paths : []).map(sourcePath => {
    const absolute = path.join(ROOT, sourcePath);
    return {
      path: sourcePath,
      exists: fs.existsSync(absolute),
      kind: fs.existsSync(absolute) && fs.statSync(absolute).isDirectory() ? 'directory' : 'file'
    };
  });
  return {
    rows,
    existingCount: rows.filter(row => row.exists).length,
    missingCount: rows.filter(row => !row.exists).length
  };
}

function sourceRow(artifact){
  const evidence = localEvidenceStatus(artifact.localEvidence);
  const credit = statusCredit(artifact.ingestionStatus);
  const confidence = confidenceCredit(artifact.confidence);
  const axes = Array.isArray(artifact.coverageAxes) ? artifact.coverageAxes : [];
  const axisWeight = axes.reduce((sum, axis) => sum + (AXIS_WEIGHTS[axis] || 0.025), 0);
  const coverage10 = round(10 * credit * confidence, 1);
  return {
    id: artifact.id,
    title: artifact.title,
    sourceType: artifact.sourceType,
    priority: artifact.priority,
    priorityRank: priorityRank(artifact.priority),
    ingestionStatus: artifact.ingestionStatus,
    confidence: artifact.confidence,
    coverageAxes: axes,
    sourceUrls: artifact.sourceUrls || [],
    targetUse: artifact.targetUse,
    currentUse: artifact.currentUse,
    missingWork: artifact.missingWork,
    localEvidence: evidence.rows,
    evidenceExistingCount: evidence.existingCount,
    evidenceMissingCount: evidence.missingCount,
    coverage10,
    weightedCoverage: credit * confidence * axisWeight,
    axisWeight: round(axisWeight, 3)
  };
}

function axisRows(rows){
  const axes = new Map();
  for(const row of rows){
    for(const axis of row.coverageAxes || []){
      if(!axes.has(axis)) axes.set(axis, []);
      axes.get(axis).push(row);
    }
  }
  return Array.from(axes.entries()).map(([axis, members]) => {
    const best = members.reduce((winner, row) => row.coverage10 > winner.coverage10 ? row : winner, members[0]);
    const meaningful = members.filter(row => row.ingestionStatus === 'ingested' || row.ingestionStatus === 'partial').length;
    return {
      axis,
      bestSource: best.id,
      bestStatus: best.ingestionStatus,
      bestCoverage10: best.coverage10,
      sourceCount: members.length,
      meaningfulSourceCount: meaningful,
      needsWork: members.some(row => row.priorityRank >= 3 && row.ingestionStatus !== 'ingested')
    };
  }).sort((a, b) => {
    const weightDelta = (AXIS_WEIGHTS[b.axis] || 0.025) - (AXIS_WEIGHTS[a.axis] || 0.025);
    if(weightDelta) return weightDelta;
    return a.axis.localeCompare(b.axis);
  });
}

function challengeCoverageRows(corpus){
  const rows = Array.isArray(corpus.challengeStagePriorityTargets) ? corpus.challengeStagePriorityTargets : [];
  return rows.map(row => {
    const status = row.status || 'not-ingested';
    const credit = status === 'partially-ingested' ? 0.45 : status === 'ingested' ? 1 : 0;
    const evidence = Array.isArray(row.currentEvidence) ? row.currentEvidence : [];
    return Object.assign({}, row, {
      coverage10: round(10 * credit, 1),
      evidenceCount: evidence.length
    });
  });
}

function table(rows){
  return rows.map(row => `| ${row.id} | ${row.ingestionStatus} | ${row.coverage10}/10 | ${row.priority} | ${row.evidenceExistingCount}/${row.localEvidence.length} | ${row.missingWork} |`).join('\n');
}

function challengeTable(rows){
  return rows.map(row => `| ${row.challengeNumber} | ${row.stageMarker} | ${row.status} | ${row.coverage10}/10 | ${row.evidenceCount} | ${row.nextNeed} |`).join('\n');
}

function buildMarkdown(report){
  const summary = report.summary;
  return `# Galaga Target Artifact Coverage

Generated: \`${report.generatedAt}\`

This is the project-facing inventory of online and local artifacts that best
illustrate Aurora's Galaga-like target. It records what is already ingested,
what is only a candidate, and what still blocks stronger challenge-stage
conformance work.

## Summary

- Overall target-artifact ingestion coverage: \`${summary.coverageScore10}/10\`
- Challenge-stage target readiness: \`${summary.challengeStageReadiness10}/10\`
- Critical sources: \`${summary.criticalSourceCount}\`
- Critical sources not fully ingested: \`${summary.criticalOpenCount}\`
- Existing local evidence anchors: \`${summary.existingEvidenceCount}\`
- Missing local evidence anchors: \`${summary.missingEvidenceCount}\`

## Interpretation

${summary.interpretation}

## Source Coverage

| Source | Status | Coverage | Priority | Evidence | Next Work |
| --- | --- | ---: | --- | ---: | --- |
${table(report.rows)}

## Challenge-Stage Priority Windows

| Challenge | Stage Marker | Status | Coverage | Evidence Count | Next Need |
| ---: | ---: | --- | ---: | ---: | --- |
${challengeTable(report.challengeStageCoverage)}

## Next Best Steps

${report.nextBestSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}
`;
}

function buildReport(){
  const corpus = readJson(SOURCE, null);
  if(!corpus || !Array.isArray(corpus.artifacts)){
    throw new Error(`target artifact corpus is missing or invalid: ${rel(SOURCE)}`);
  }
  const generatedAt = new Date().toISOString();
  const commit = gitShortCommit();
  const rows = corpus.artifacts.map(sourceRow).sort((a, b) => {
    const rank = b.priorityRank - a.priorityRank;
    if(rank) return rank;
    return a.id.localeCompare(b.id);
  });
  const weightedTotal = rows.reduce((sum, row) => sum + row.weightedCoverage, 0);
  const weightTotal = rows.reduce((sum, row) => sum + row.axisWeight, 0);
  const coverageScore10 = weightTotal ? round(10 * weightedTotal / weightTotal, 1) : 0;
  const challengeStageCoverage = challengeCoverageRows(corpus);
  const challengeStageReadiness10 = round(challengeStageCoverage.reduce((sum, row) => sum + row.coverage10, 0) / Math.max(challengeStageCoverage.length, 1), 1);
  const criticalRows = rows.filter(row => row.priorityRank >= 4);
  const criticalOpen = criticalRows.filter(row => row.ingestionStatus !== 'ingested');
  const existingEvidenceCount = rows.reduce((sum, row) => sum + row.evidenceExistingCount, 0);
  const missingEvidenceCount = rows.reduce((sum, row) => sum + row.evidenceMissingCount, 0);
  const missingLateChallenges = challengeStageCoverage.filter(row => row.status === 'not-ingested');
  const partialLateChallenges = challengeStageCoverage.filter(row => +row.challengeNumber >= 4 && row.status === 'partially-ingested');
  const interpretation = missingLateChallenges.length
    ? 'Aurora has enough Galaga source material to prove the current challenge-stage gap, but not enough late-stage media-backed material to rebuild the later challenge stages with high confidence. The most valuable next ingestion work is controlled or sourced capture for Challenge Stages 4-8, followed by per-group movement and alien-novelty labels.'
    : 'Aurora now has media-backed windows for all tracked Galaga challenge stages, including Challenges 4-8. The bottleneck has moved from source acquisition to precision: each window needs five-group frame labels for entry side, path family, scoreable band, exit side, alien family, and perfect-bonus opportunity before direct trajectory scoring should rise.';
  const firstNextStep = missingLateChallenges.length
    ? 'Acquire or create a lawful controlled reference capture for Challenge Stages 4-8, prioritizing stages 15, 19, 23, 27, and 31.'
    : 'Promote the user-supplied all-perfect challenge video windows into five-group labels for Challenges 1-8, prioritizing Challenges 4, 7, and 8 for late-stage visual novelty.';
  const report = {
    generatedAt,
    commit,
    artifactType: 'galaga-target-artifact-coverage',
    source: rel(SOURCE),
    schema: corpus.schema,
    referenceTarget: corpus.referenceTarget,
    copyrightPolicy: corpus.copyrightPolicy,
    summary: {
      coverageScore10,
      challengeStageReadiness10,
      sourceCount: rows.length,
      criticalSourceCount: criticalRows.length,
      criticalOpenCount: criticalOpen.length,
      ingestedSourceCount: rows.filter(row => row.ingestionStatus === 'ingested').length,
      partialSourceCount: rows.filter(row => row.ingestionStatus === 'partial').length,
      candidateOrPlannedSourceCount: rows.filter(row => ['candidate', 'planned'].includes(row.ingestionStatus)).length,
      notIngestedSourceCount: rows.filter(row => row.ingestionStatus === 'not-ingested').length,
      existingEvidenceCount,
      missingEvidenceCount,
      lateChallengeGapCount: missingLateChallenges.length,
      lateChallengePartialCount: partialLateChallenges.length,
      interpretation
    },
    rows,
    axisRows: axisRows(rows),
    challengeStageCoverage,
    nextBestSteps: [
      firstNextStep,
      'Promote five-group labels for each challenge: first visible frame, entry side, path family, scoreable band, exit side, alien family, and perfect-bonus opportunity.',
      'Split the existing early challenge reference windows into complete group-by-group target contracts before further Aurora runtime tuning.',
      'Add active sprite-motion evidence for challenge aliens so graphics conformance is not static-pose-only.',
      'Use official/manual sources for rule and scoring grounding, and measured video/contact-sheet sources for path and visual timing scoring.'
    ]
  };
  const outDir = path.join(OUT_ROOT, `${generatedAt.slice(0, 10)}-${commit}`);
  writeJson(path.join(outDir, 'report.json'), report);
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  writeText(REPORT_MD, buildMarkdown(report));
  return report;
}

if(require.main === module){
  const report = buildReport();
  console.log(JSON.stringify({
    ok: true,
    coverageScore10: report.summary.coverageScore10,
    challengeStageReadiness10: report.summary.challengeStageReadiness10,
    criticalOpenCount: report.summary.criticalOpenCount,
    lateChallengeGapCount: report.summary.lateChallengeGapCount,
    report: rel(path.join(OUT_ROOT, 'latest.json')),
    markdown: rel(REPORT_MD)
  }, null, 2));
}

module.exports = { buildReport };
