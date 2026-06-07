#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SWEEP = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-candidate-sweep', 'latest.json');
const TARGET_TRACKS = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-challenge-object-tracks', 'latest.json');
const UNDERPERFORMANCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-deconflict-underperformance', 'latest.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'stage7-authoring-contract');

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

function challengeNumberForStage(stage){
  return stage >= 3 ? Math.floor((stage - 3) / 4) + 1 : null;
}

function targetChallenge(targets, challengeNumber){
  const challenges = targets?.challenges || {};
  return Object.values(challenges).find(item => +item.challengeNumber === +challengeNumber) || null;
}

function compactCandidate(row){
  if(!row) return null;
  return {
    candidateId: row.candidateId,
    expectedScore10: round(row.expectedMatch?.score10 ?? row.expectedScore10, 2),
    targetVideoObjectFitScore10: round(row.targetVideoObjectFit?.score10 ?? row.targetVideoObjectFitScore10, 2),
    humanPerfectPotentialScore10: round(row.humanPerfectPotential?.score10 ?? row.humanPerfectPotentialScore10, 2),
    humanVisibleScore10: round(row.humanVisibleGuardrails?.score10, 2),
    bunchingRisk: round(row.humanVisibleGuardrails?.bunchingRisk, 3),
    magicAppearanceRisk: round(row.humanVisibleGuardrails?.magicAppearanceRisk, 3),
    spacingScore: round(row.humanVisibleGuardrails?.spacingScore, 3),
    read: row.humanVisibleGuardrails?.read || ''
  };
}

function buildMarkdown(report){
  const groups = (report.targetGroups || []).map(group => `| ${group.groupIndex} | ${group.trackCount} | ${group.visibleStartS}-${group.visibleEndS}s | ${group.entrySide} | ${group.exitSide} | ${group.xRange} | ${group.yRange} | ${group.pathLength} | ${group.lowerFieldShare} |`).join('\n');
  const gates = report.promotionGates.map(gate => `- ${gate}`).join('\n');
  const next = report.nextWork.map(item => `- ${item}`).join('\n');
  return `# Stage 7 Challenge Authoring Contract

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Purpose

Stage 7 is Aurora's internal marker for **Challenging Stage 2**. This contract turns the current no-keeper evidence into an authored target: aliens should arrive in coherent groups, stay readable as scoring targets, and avoid magic appearance or screen-space clumping.

## Current Read

${report.currentRead}

## Target Group Evidence

| Group | Tracks | Visible Window | Entry | Exit | X Range | Y Range | Path Length | Lower Field Share |
| ---: | ---: | --- | --- | --- | ---: | ---: | ---: | ---: |
${groups || '| n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |'}

## Promotion Gates

${gates}

## Next Work

${next}
`;
}

function main(){
  const sweep = readJson(SWEEP, {});
  const targets = readJson(TARGET_TRACKS, {});
  const underperformance = readJson(UNDERPERFORMANCE, {});
  const stage = +sweep.stage || 7;
  const challengeNumber = challengeNumberForStage(stage);
  const target = targetChallenge(targets, challengeNumber) || {};
  const candidates = Array.isArray(sweep.candidates) ? sweep.candidates : [];
  const best = candidates.find(row => row.candidateId === sweep.summary?.bestCandidateId) || null;
  const leastBunched = candidates.find(row => row.candidateId === sweep.diagnostics?.leastBunchedTop?.[0]?.candidateId)
    || sweep.diagnostics?.leastBunchedTop?.[0]
    || null;
  const route = candidates.find(row => row.candidateId === sweep.diagnostics?.routeAwareTop?.[0]?.candidateId)
    || sweep.diagnostics?.routeAwareTop?.[0]
    || null;
  const targetGroups = (target.targetGroups || []).map(group => {
    const t = group.objectTrackTarget || {};
    return {
      groupIndex: group.groupIndex,
      trackCount: group.trackCount,
      visibleStartS: round(t.visibleStartS, 2),
      visibleEndS: round(t.visibleEndS, 2),
      entrySide: t.entrySide || 'unknown',
      exitSide: t.exitSide || 'unknown',
      xRange: round(t.xRange, 3),
      yRange: round(t.yRange, 3),
      pathLength: round(t.pathLength, 3),
      lowerFieldShare: round(t.lowerFieldShare, 3),
      read: group.read || ''
    };
  });
  const report = {
    schemaVersion: 1,
    artifactType: 'stage7-authoring-contract',
    generatedAt: new Date().toISOString(),
    commit: gitShortCommit(),
    branch: gitBranch(),
    stage,
    challengeNumber,
    humanName: `Challenging Stage ${challengeNumber}`,
    sourceArtifacts: {
      sweep: 'reference-artifacts/analyses/challenge-stage-candidate-sweep/latest.json',
      objectTracks: 'reference-artifacts/analyses/galaga-challenge-object-tracks/latest.json',
      underperformance: 'reference-artifacts/analyses/challenge-deconflict-underperformance/latest.json'
    },
    current: {
      best: compactCandidate(best),
      leastBunched: compactCandidate(leastBunched),
      routeAware: compactCandidate(route),
      keeperDecision: sweep.summary?.keeperDecision || 'pending'
    },
    targetGroups,
    promotionGates: [
      'Safety remains pass: no challenge enemy shots, enemy attacks, or ship loss.',
      'Human-perfect potential must not regress from baseline and should remain >= 7.4/10.',
      'Human-visible score should improve materially and remain >= 7.8/10 before promotion.',
      'Bunching risk should move toward <= 0.36; interim candidates below 0.65 are worth full-analyzer review.',
      'Magic-appearance risk should stay <= 0.18, preserving visible group lead-ins.',
      'Expected challenge identity must not regress; target-video fit must clear the latest rejected full-analyzer calibration.'
    ],
    nextWork: [
      'Use route-aware group offsets to separate whole groups before adding object-level offsets.',
      'Prefer contract-shaped candidates over broad blind sweeps.',
      'Generate path visuals for baseline, best readability, best route-aware, and best deconflict candidates.',
      'Promote only after full analyzer confirms the expected-label and target-video lift.',
      'Generalize only the proven primitive to Challenging Stage 1 and Challenging Stage 3.'
    ],
    currentRead: underperformance.summary?.read || 'Current no-keeper evidence indicates measurement/process improvement but no runtime promotion yet.'
  };
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  writeText(path.join(OUT_ROOT, 'README.md'), buildMarkdown(report));
  console.log(JSON.stringify({
    ok: true,
    artifact: 'reference-artifacts/analyses/stage7-authoring-contract/latest.json',
    challengeNumber,
    targetGroupCount: targetGroups.length,
    keeperDecision: report.current.keeperDecision
  }, null, 2));
}

main();
