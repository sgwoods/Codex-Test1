#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-conformance', 'latest.json');
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-human-playability');
const OUT_JSON = path.join(OUT_DIR, 'latest.json');
const OUT_MD = path.join(ROOT, 'CHALLENGE_STAGE_HUMAN_PLAYABILITY_REVIEW.md');

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

function git(args){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function round(value, digits = 1){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function average(values){
  const finite = values.filter(value => Number.isFinite(+value)).map(Number);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null;
}

function labelFor(row){
  const marker = +row.stage || 0;
  if(row.challengeNumber && marker) return `Challenging Stage ${Math.max(1, marker - 1)}-${marker}`;
  return `Challenging Stage ${row.challengeNumber || '?'}`;
}

function routeProbe(row){
  return row?.shotOpportunityProbe?.humanPerfectPotential || {};
}

function problemRead(row){
  const route = routeProbe(row);
  const parts = [];
  if((+route.routeKills || 0) < (+route.expectedTargetCount || 40)){
    parts.push(`perfect route incomplete (${+route.routeKills || 0}/${+route.expectedTargetCount || 40})`);
  }
  if((+route.topCrowdShare || 0) > 0.22){
    parts.push(`too much top-crowd pressure (${round((+route.topCrowdShare || 0) * 100, 0)}%)`);
  }
  if((+row.targetVideoObjectTrackFitScore10 || 0) < 5){
    parts.push(`movement track fit too low (${round(row.targetVideoObjectTrackFitScore10)}/10)`);
  }
  if((+row.alienNoveltyScore10 || 0) < 5){
    parts.push(`alien novelty too weak (${round(row.alienNoveltyScore10)}/10)`);
  }
  if((+row.graphicalConformanceScore10 || 0) < 5){
    parts.push(`visual conformance still early (${round(row.graphicalConformanceScore10)}/10)`);
  }
  return parts.length ? parts.join('; ') : 'No high-confidence human-playability problem isolated yet.';
}

function radicalRecommendation(row){
  const n = +row.challengeNumber || 0;
  const recommendations = {
    1: 'Keep the safe bee/butterfly lesson, but rebuild timing and vertical descent so all 40 targets are visibly routeable, with less top-band crowding and clearer first/late wave separation.',
    2: 'Make the cross-sweep readable as a deliberate second challenge: fewer overlapping upper-band clusters, clearer left/right crossing lanes, and a memorable specialty-family introduction rather than a shuffled first challenge.',
    3: 'Feature a distinct boss-led hook and specialty alien moment. Preserve 40/40 routeability while making the boss/stingray/dragonfly movement visibly different from the first two challenges.',
    4: 'Recast as a specialty serpentine set piece. The stage should look like a new authored pattern, not a faster remix, with long flowing arcs that still pass through learnable firing lanes.',
    5: 'Treat this as the current emergency stage: rebuild the cascade around all 40 tracked targets, alternating pink/green identity, lower-field score windows, and a perfect-route plan before adding more novelty.'
  };
  return recommendations[n] || 'Hold for phase two after the first five challenge stages show measurable routeability, novelty, and target-video object-track lift.';
}

function stageRow(row, focus = false){
  const route = routeProbe(row);
  return {
    challengeNumber: +row.challengeNumber || 0,
    stage: +row.stage || 0,
    label: labelFor(row),
    phase: focus ? 'first-five-focus' : 'later-backlog',
    layoutId: row.auroraLayoutId || '',
    targetRead: row.galagaTarget || '',
    currentRead: row.currentRead || '',
    humanProblem: problemRead(row),
    recommendation: radicalRecommendation(row),
    metrics: {
      strictScore10: round(row.conformanceScore10),
      interest10: round(row.interestingFactor10),
      movement10: round(row.movementConformanceScore10),
      graphics10: round(row.graphicalConformanceScore10),
      alienNovelty10: round(row.alienNoveltyScore10),
      playerShotOpportunity10: round(row.playerShotOpportunityScore10),
      humanPerfectPotential10: round(row.humanPerfectPotentialScore10 ?? route.score10),
      targetContractFit10: round(row.targetContractFitScore10),
      targetVideoObjectTrackFit10: round(row.targetVideoObjectTrackFitScore10),
      spriteMotionCorrespondence10: round(row.spriteMotionCorrespondenceScore10),
      safetyRule10: round(row.safetyRuleScore10)
    },
    route: {
      routeKills: +route.routeKills || 0,
      expectedTargetCount: +route.expectedTargetCount || 40,
      targetExposureShare: round(route.targetExposureShare, 3),
      sustainedExposureShare: round(route.sustainedExposureShare, 3),
      readableAltitudeShare: round(route.readableAltitudeShare, 3),
      topCrowdShare: round(route.topCrowdShare, 3),
      firstRouteT: round(route.firstRouteT, 2),
      lastRouteT: round(route.lastRouteT, 2),
      weakestReasons: Array.isArray(route.weakestReasons) ? route.weakestReasons : []
    },
    nextActions: Array.isArray(row.nextActions) ? row.nextActions : [],
    criticalGaps: Array.isArray(row.criticalGaps) ? row.criticalGaps : []
  };
}

function markdown(report){
  const tableRows = report.focusRows.map(row => `| ${row.label} | ${row.metrics.strictScore10}/10 | ${row.metrics.humanPerfectPotential10}/10 | ${row.route.routeKills}/${row.route.expectedTargetCount} | ${row.metrics.targetVideoObjectTrackFit10}/10 | ${row.metrics.alienNovelty10}/10 | ${row.humanProblem} |`).join('\n');
  const details = report.focusRows.map(row => `
## ${row.label}
- Target: ${row.targetRead || 'Target read pending.'}
- Current: ${row.currentRead || 'Current read pending.'}
- Human-playability problem: ${row.humanProblem}
- Recommendation: ${row.recommendation}
- Route read: ${row.route.routeKills}/${row.route.expectedTargetCount} route kills, ${round((row.route.targetExposureShare || 0) * 100, 0)}% any exposure, ${round((row.route.sustainedExposureShare || 0) * 100, 0)}% repeated exposure, ${round((row.route.topCrowdShare || 0) * 100, 0)}% top-crowd pressure.
- Priority next action: ${(row.nextActions || [])[0] || 'Define a candidate movement rewrite and re-run challenge-stage conformance.'}
`).join('\n');
  return `# Challenge Stage Human Playability Review

Generated: ${report.generatedAt}

Source: \`reference-artifacts/analyses/challenge-stage-conformance/latest.json\`

## Summary
The first five challenging stages remain the priority because they teach the player what Aurora's bonus stages are supposed to be. The current focus-set average is ${report.summary.focusAverageStrictScore10}/10 strict conformance and ${report.summary.focusAverageHumanPerfectPotential10}/10 human-perfect potential. The goal for the next gameplay pass is not only higher scores: it is visible learnability, reliable perfect-score routes, distinct alien identity, and movement that reads like authored Galaga-style set pieces.

| Stage | Strict | Human Perfect | Route | Object Track | Novelty | Main Problem |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
${tableRows}

${details}

## Phase Plan
1. Fix the first five challenging stages before treating later challenge stages as release-critical.
2. Require each promoted rewrite to improve or preserve routeability, target-video object-track fit, alien novelty, and no-shot/no-kill safety.
3. Generalize successful motion grammar and candidate-selection tactics to later challenges and future games.
`;
}

function main(){
  const source = readJson(SOURCE, null);
  if(!source || !Array.isArray(source.stageRows)){
    throw new Error(`Missing source artifact: ${SOURCE}`);
  }
  const rows = source.stageRows
    .slice()
    .sort((a, b) => (+a.challengeNumber || 0) - (+b.challengeNumber || 0));
  const focusRows = rows.slice(0, 5).map(row => stageRow(row, true));
  const laterRows = rows.slice(5).map(row => stageRow(row, false));
  const report = {
    schemaVersion: 1,
    artifactType: 'challenge-stage-human-playability',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD']),
    branch: git(['branch', '--show-current']),
    sourceArtifact: 'reference-artifacts/analyses/challenge-stage-conformance/latest.json',
    summary: {
      focus: 'first-five-challenging-stages',
      focusCount: focusRows.length,
      laterCount: laterRows.length,
      focusAverageStrictScore10: round(average(focusRows.map(row => row.metrics.strictScore10))),
      focusAverageHumanPerfectPotential10: round(average(focusRows.map(row => row.metrics.humanPerfectPotential10))),
      focusAverageTargetVideoObjectTrackFit10: round(average(focusRows.map(row => row.metrics.targetVideoObjectTrackFit10))),
      focusAverageAlienNovelty10: round(average(focusRows.map(row => row.metrics.alienNovelty10))),
      weakestFocusStage: focusRows.slice().sort((a, b) => (a.metrics.humanPerfectPotential10 || 0) - (b.metrics.humanPerfectPotential10 || 0))[0]?.label || '',
      nextBestEffort: 'Rebuild the weakest first-five challenge candidate around target-video object tracks, then re-run this report and challenge-stage conformance.'
    },
    focusRows,
    laterRows,
    successCriteria: [
      'First-five human-perfect potential >= 8.5/10 with at least 38/40 routeable targets per stage.',
      'Target-video object-track fit >= 5.5/10 for every first-five challenge stage.',
      'Alien novelty >= 5.5/10 for first five while preserving clear Galaga-like roles.',
      'Safety rule stays 10/10: no enemy shots, no ship losses, no attacks during challenging stages.'
    ]
  };
  writeJson(OUT_JSON, report);
  writeText(OUT_MD, markdown(report));
  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, OUT_JSON),
    report: path.relative(ROOT, OUT_MD),
    summary: report.summary
  }, null, 2));
}

main();
