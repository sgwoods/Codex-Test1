#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'challenge-setpiece-contracts');
const OUT = path.join(OUT_ROOT, 'latest.json');
const MARKDOWN = path.join(ROOT, 'CHALLENGE_SETPIECE_CONTRACTS.md');
const TRAJECTORY_CONTROLS = path.join(ANALYSES, 'challenge-trajectory-controls', 'latest.json');
const CHALLENGE_CONFORMANCE = path.join(ANALYSES, 'challenge-stage-conformance', 'latest.json');
const TARGET_AUDIT = path.join(ANALYSES, 'galaga-target-evidence-audit', 'latest.json');

const SAFETY_GUARDRAILS = [
  'no enemy shots',
  'no enemy attack starts',
  'no ship losses',
  '40 targets presented as a bonus set piece',
  'perfect-bonus feedback remains visible after clear'
];

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
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function challengeStageDisplayLabel(stage){
  const marker = Number(stage);
  if(!Number.isFinite(marker)) return 'Challenging Stage interval pending';
  return `Challenging Stage ${Math.max(1, marker - 1)}-${marker}`;
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function round(value, places = 2){
  if(!Number.isFinite(+value)) return null;
  const scale = 10 ** places;
  return Math.round(+value * scale) / scale;
}

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null;
}

function stageRowByStage(report){
  return new Map((report.stageRows || []).map(row => [+row.stage, row]));
}

function challengeAuthority(audit){
  const row = (audit.rows || []).find(item => item.roleKey === 'challenge-specialty-aliens');
  return row ? {
    roleKey: row.roleKey,
    status: row.status,
    confidence: row.confidence,
    averageAuthorityScore10: row.averageAuthorityScore10 ?? audit.summary?.challengeSpecialtyAuthorityScore10 ?? null,
    read: row.scoringUse || 'Challenge specialty target authority pending.',
    nextGap: row.nextGap || ''
  } : {
    roleKey: 'challenge-specialty-aliens',
    status: 'pending',
    confidence: 'pending',
    averageAuthorityScore10: null,
    read: 'Challenge specialty target authority pending.',
    nextGap: 'Generate Galaga target evidence audit.'
  };
}

function contractRow(control, stageRow, authority){
  const groupRows = Array.isArray(control.groups) ? control.groups : [];
  const pathFamilies = [...new Set(groupRows.map(group => group.runtimePathFamilyHint).filter(Boolean))];
  const referencePathCount = groupRows.filter(group => group.referencePath).length;
  const safety = stageRow?.safetyProbe || {};
  const safetyPass = !!(safety.noEnemyShots && safety.noAttackStarts && safety.noShipLosses);
  const criticalGaps = Array.isArray(stageRow?.criticalGaps) ? stageRow.criticalGaps : [];
  const nextActions = Array.isArray(stageRow?.nextActions) ? stageRow.nextActions : [];
  const contractFitScore10 = stageRow?.targetContractFitScore10 ?? null;
  const objectFitScore10 = stageRow?.targetVideoObjectTrackFitScore10 ?? null;
  const score10 = stageRow?.conformanceScore10 ?? null;
  const priority = +score10 < 4.4 || +contractFitScore10 < 5 ? 'highest' : +score10 < 5.5 ? 'high' : 'medium';
  return {
    stage: control.stage,
    challengeNumber: control.challengeNumber,
    displayLabel: challengeStageDisplayLabel(control.stage),
    status: 'active-measured-setpiece-contract',
    priority,
    targetContract: {
      expectedGroupCount: 5,
      expectedEnemyCount: 40,
      safetyGuardrails: SAFETY_GUARDRAILS,
      pathFamilies,
      groupSchedule: groupRows.map(group => ({
        groupIndex: group.groupIndex,
        pathFamily: group.runtimePathFamilyHint,
        spawnOffsetS: group.runtimeControl?.spawnOffsetS ?? null,
        durationS: group.runtimeControl?.durationS ?? null,
        speedScale: group.runtimeControl?.speedScale ?? null,
        arcAmp: group.runtimeControl?.arcAmp ?? null,
        dropAmp: group.runtimeControl?.dropAmp ?? null,
        lowerFieldBias: group.runtimeControl?.lowerFieldBias ?? null,
        yOffset: group.runtimeControl?.yOffset ?? null,
        referencePathId: group.referencePath?.sourceTrackId || null,
        targetTrackConfidence: group.confidence ?? null,
        controlIntent: group.controlIntent || ''
      })),
      referencePathCount,
      averageTargetConfidence: control.averageConfidence ?? null,
      averageTargetXRange: control.averageTargetXRange ?? null,
      averageTargetYRange: control.averageTargetYRange ?? null,
      averageLowerFieldShare: control.averageLowerFieldShare ?? null
    },
    runtimeRead: {
      currentScore10: score10,
      movementScore10: stageRow?.movementConformanceScore10 ?? null,
      graphicsScore10: stageRow?.graphicalConformanceScore10 ?? null,
      alienNoveltyScore10: stageRow?.alienNoveltyScore10 ?? null,
      shotOpportunityScore10: stageRow?.playerShotOpportunityScore10 ?? null,
      targetContractFitScore10: contractFitScore10,
      targetVideoObjectTrackFitScore10: objectFitScore10,
      safetyPass,
      bestReferenceMatch: stageRow?.bestReferenceMatch?.labelId || null,
      currentRead: stageRow?.currentRead || ''
    },
    targetAuthority: authority,
    releaseGate: {
      ready: false,
      reason: +score10 >= 6 && +contractFitScore10 >= 6.5 && +objectFitScore10 >= 5.5 && safetyPass && +authority.averageAuthorityScore10 >= 6
        ? 'Ready for focused beta review, but still requires manual play.'
        : 'Not ready for a strong challenge-stage conformance claim; needs more movement, graphics, novelty, or target-authority lift.',
      minimumNextBetaTarget: '>=5.0/10 strict challenge conformance with no safety regression and at least one visibly distinct authored challenge upgrade.',
      matureTarget: '>=8.5/10 with clean target sprite authority, five-group frame labels, and replay-visible novelty across all eight challenge stages.'
    },
    criticalGaps,
    nextActions,
    nextImplementationStep: nextActions[0] || criticalGaps[0] || 'Run challenge-stage conformance analyzer and regenerate this contract.'
  };
}

function buildMarkdown(report){
  const rows = report.contracts.map(row => `| ${row.displayLabel} | ${row.stage} | ${row.priority} | ${row.runtimeRead.currentScore10 ?? 'n/a'}/10 | ${row.runtimeRead.targetContractFitScore10 ?? 'n/a'}/10 | ${row.runtimeRead.targetVideoObjectTrackFitScore10 ?? 'n/a'}/10 | ${(row.targetContract.pathFamilies || []).join(', ')} | ${row.targetContract.referencePathCount}/5 | ${row.nextImplementationStep} |`).join('\n');
  const details = report.contracts.map(row => `
## ${row.displayLabel}

**Current:** ${row.runtimeRead.currentScore10 ?? 'n/a'}/10 strict conformance; movement ${row.runtimeRead.movementScore10 ?? 'n/a'}/10; graphics ${row.runtimeRead.graphicsScore10 ?? 'n/a'}/10; novelty ${row.runtimeRead.alienNoveltyScore10 ?? 'n/a'}/10; shot opportunity ${row.runtimeRead.shotOpportunityScore10 ?? 'n/a'}/10.

**Contract:** ${row.targetContract.expectedGroupCount} groups / ${row.targetContract.expectedEnemyCount} targets; path families ${row.targetContract.pathFamilies.join(', ') || 'pending'}; ${row.targetContract.referencePathCount}/5 reference paths.

**Safety:** ${row.runtimeRead.safetyPass ? 'pass' : 'fail/pending'} (${SAFETY_GUARDRAILS.join('; ')}).

**Target authority:** challenge specialty evidence ${row.targetAuthority.averageAuthorityScore10 ?? 'pending'}/10, ${row.targetAuthority.status}. ${row.targetAuthority.read}

**Main gap:** ${(row.criticalGaps || [])[0] || 'pending'}

**Next implementation step:** ${row.nextImplementationStep}
`).join('\n');
  return `# Challenge Set-Piece Contracts

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Purpose

This artifact turns Galaga challenge reference tracks into explicit Aurora set-piece contracts. It is stricter than a broad score: every challenge should have five safe bonus groups, target-derived path timing, visual novelty, clear player shot opportunity, and enough target-authority evidence to justify any release-facing conformance claim.

## Summary

- Challenge contracts: ${report.summary.contractCount}
- Reference-backed groups: ${report.summary.referenceBackedGroupCount}/${report.summary.expectedGroupCount}
- Average strict conformance: ${report.summary.averageCurrentScore10}/10
- Average target-contract fit: ${report.summary.averageTargetContractFitScore10}/10
- Challenge specialty target authority: ${report.summary.challengeSpecialtyAuthorityScore10 ?? 'pending'}/10
- Release-ready contracts: ${report.summary.releaseReadyCount}

${report.summary.read}

| Challenging Stage | Internal Marker | Priority | Current | Contract Fit | Target-Video Fit | Path Families | Reference Paths | Next Step |
| --- | ---: | --- | ---: | ---: | ---: | --- | ---: | --- |
${rows}

${details}
`;
}

function main(){
  const controls = readJson(TRAJECTORY_CONTROLS, null);
  const conformance = readJson(CHALLENGE_CONFORMANCE, null);
  const audit = readJson(TARGET_AUDIT, { rows: [], summary: {} });
  if(!controls || controls.artifactType !== 'challenge-trajectory-controls'){
    throw new Error(`Missing challenge trajectory controls: ${rel(TRAJECTORY_CONTROLS)}`);
  }
  if(!conformance || conformance.artifactType !== 'challenge-stage-conformance'){
    throw new Error(`Missing challenge-stage conformance report: ${rel(CHALLENGE_CONFORMANCE)}`);
  }
  const authority = challengeAuthority(audit);
  const rows = stageRowByStage(conformance);
  const contracts = (controls.challenges || []).map(control => contractRow(control, rows.get(+control.stage), authority));
  const referenceBackedGroupCount = contracts.reduce((sum, row) => sum + row.targetContract.referencePathCount, 0);
  const expectedGroupCount = contracts.reduce((sum, row) => sum + row.targetContract.expectedGroupCount, 0);
  const releaseReadyCount = contracts.filter(row => row.releaseGate.ready).length;
  const report = {
    schemaVersion: 1,
    artifactType: 'challenge-setpiece-contracts',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    gameKey: 'aurora-galactica',
    sourceArtifacts: {
      challengeTrajectoryControls: rel(TRAJECTORY_CONTROLS),
      challengeStageConformance: rel(CHALLENGE_CONFORMANCE),
      galagaTargetEvidenceAudit: fs.existsSync(TARGET_AUDIT) ? rel(TARGET_AUDIT) : null
    },
    summary: {
      contractCount: contracts.length,
      expectedGroupCount,
      referenceBackedGroupCount,
      averageCurrentScore10: round(average(contracts.map(row => row.runtimeRead.currentScore10)), 1),
      averageMovementScore10: round(average(contracts.map(row => row.runtimeRead.movementScore10)), 1),
      averageGraphicsScore10: round(average(contracts.map(row => row.runtimeRead.graphicsScore10)), 1),
      averageNoveltyScore10: round(average(contracts.map(row => row.runtimeRead.alienNoveltyScore10)), 1),
      averageTargetContractFitScore10: round(average(contracts.map(row => row.runtimeRead.targetContractFitScore10)), 1),
      averageTargetVideoObjectTrackFitScore10: round(average(contracts.map(row => row.runtimeRead.targetVideoObjectTrackFitScore10)), 1),
      challengeSpecialtyAuthorityScore10: authority.averageAuthorityScore10 ?? null,
      releaseReadyCount,
      highestPriorityStages: contracts.filter(row => row.priority === 'highest').map(row => row.stage),
      read: 'The bottleneck is now clear: movement and group contracts have enough reference structure to guide implementation, but target-video fit and challenge-specialty sprite authority remain too low for a mature conformance claim.'
    },
    measurementLimits: [
      'This is a contract artifact, not a runtime promotion by itself.',
      'Reference paths are object-track summaries from ingested video and should still be checked by browser-backed runtime probes after each gameplay edit.',
      'Challenge specialty alien graphics are explicitly authority-limited until clean target windows replace provisional sheet cells.'
    ],
    contracts,
    nextBestStep: 'Implement one high-confidence contract-backed challenge stage upgrade, then rerun strict challenge conformance and compare target-contract fit, object-track fit, and player shot opportunity.'
  };
  const stamp = `${report.generatedAt.replace(/[:.]/g, '-').slice(0, 19)}-${report.commit}`;
  writeJson(path.join(OUT_ROOT, stamp, 'report.json'), report);
  writeText(path.join(OUT_ROOT, stamp, 'README.md'), buildMarkdown(report));
  writeJson(OUT, report);
  writeText(MARKDOWN, buildMarkdown(report));
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    markdown: rel(MARKDOWN),
    summary: report.summary
  }, null, 2));
}

try{
  main();
}catch(err){
  console.error(err && err.stack || String(err));
  process.exit(1);
}
