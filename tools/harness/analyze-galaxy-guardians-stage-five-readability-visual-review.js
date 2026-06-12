#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  ROOT,
  loadGuardiansVm,
  installGuardiansRuntimeRulePatch
} = require('./guardians-long-surface-lib');

const IDENTITY_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity');
const CANDIDATE = path.join(IDENTITY_ROOT, 'stage-five-readability-candidate-0.1.json');
const OUT = path.join(IDENTITY_ROOT, 'stage-five-readability-visual-review-0.1.json');
const OUT_MD = path.join(IDENTITY_ROOT, 'stage-five-readability-visual-review-0.1.md');
const OUT_SVG = path.join(IDENTITY_ROOT, 'stage-five-readability-visual-review-0.1.svg');

function readJson(file, fallback = {}){
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function esc(text){
  return String(text ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

function round(value, digits = 2){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : 0;
}

function pct(value){
  return `${round((+value || 0) * 100, 0)}%`;
}

function sampleSnapshots(patch = null){
  const ctx = loadGuardiansVm();
  if(patch) installGuardiansRuntimeRulePatch(ctx, patch);
  const state = ctx.createGalaxyGuardiansRuntimeState({
    stage: 5,
    ships: 5,
    seed: 12553,
    maxPlayableStage: 9
  });
  state.player.inv = 999;
  const rules = ctx.guardiansRuntimeRules(5);
  const targets = [6, 10, 14, 18, 22, 26, 30, 34];
  const snapshots = [];
  const dt = 1 / 60;
  let nextTarget = 0;
  const totalFrames = Math.round((targets[targets.length - 1] + 0.2) / dt);
  for(let frame = 0; frame < totalFrames && !state.gameOver; frame++){
    ctx.stepGalaxyGuardiansRuntime(state, dt, ctx.galaxyGuardiansHarnessPersonaInput(state, 'professional'));
    if(nextTarget < targets.length && state.t >= targets[nextTarget]){
      const summary = ctx.summarizeGalaxyGuardiansRuntime(state);
      const lowerFieldThreshold = rules.playfieldHeight * 0.42;
      const activeDives = (summary.activeDives || []).filter(dive => dive.mode === 'diving' || dive.mode === 'wrapping');
      const lowerFieldDives = activeDives.filter(dive => (+dive.y || 0) >= lowerFieldThreshold);
      const shots = summary.enemyShots || [];
      const laneOverlaps = lowerFieldDives.filter(dive => shots.some(shot =>
        Math.abs((+dive.x || 0) - (+shot.x || 0)) <= 18
        && Math.abs((+dive.y || 0) - (+shot.y || 0)) <= 84
      )).length;
      snapshots.push({
        t: round(state.t, 2),
        score: summary.score,
        activeDives,
        lowerFieldDives,
        enemyShots: shots,
        laneOverlaps,
        lowerFieldThreats: lowerFieldDives.length + shots.length
      });
      nextTarget++;
    }
  }
  return {
    rules,
    snapshots,
    eventCounts: {
      alienDiveStart: state.events.filter(event => event.type === 'alien_dive_start').length,
      flagshipDiveStart: state.events.filter(event => event.type === 'flagship_dive_start').length,
      enemyShot: state.events.filter(event => event.type === 'enemy_shot').length,
      enemyWrapOrReturn: state.events.filter(event => event.type === 'enemy_wrap_or_return').length
    }
  };
}

function snapshotSummary(sample){
  const lowerFieldThreats = sample.snapshots.map(row => row.lowerFieldThreats);
  const laneOverlaps = sample.snapshots.map(row => row.laneOverlaps);
  return {
    snapshotCount: sample.snapshots.length,
    averageLowerFieldThreats: round(lowerFieldThreats.reduce((sum, value) => sum + value, 0) / Math.max(1, lowerFieldThreats.length), 2),
    maxLowerFieldThreats: Math.max(...lowerFieldThreats, 0),
    overlapSnapshotShare: round(laneOverlaps.filter(value => value > 0).length / Math.max(1, laneOverlaps.length), 3),
    totalLaneOverlaps: laneOverlaps.reduce((sum, value) => sum + value, 0)
  };
}

function drawEntity(x, y, role, mode, originX, originY, scale){
  const fill = role === 'flagship' ? '#ffdb58' : role === 'escort' ? '#ff5b5b' : '#4b7dff';
  const stroke = mode === 'wrapping' ? '#ffffff' : '#06101a';
  const sx = originX + (+x || 0) * scale;
  const sy = originY + (+y || 0) * scale;
  return `<circle cx="${round(sx, 1)}" cy="${round(sy, 1)}" r="4.5" fill="${fill}" stroke="${stroke}" stroke-width="1.1"/>`;
}

function drawShot(shot, originX, originY, scale){
  const sx = originX + (+shot.x || 0) * scale;
  const sy = originY + (+shot.y || 0) * scale;
  return `<rect x="${round(sx - 1.5, 1)}" y="${round(sy - 5, 1)}" width="3" height="10" rx="1.5" fill="#ffef8a"/>`;
}

function drawPanel(label, sample, snapshot, x, y, scale){
  const width = 280 * scale;
  const height = 360 * scale;
  const lowerY = y + 360 * 0.42 * scale;
  const pieces = [
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="6" fill="#081524" stroke="#244863"/>`,
    `<rect x="${x}" y="${lowerY}" width="${width}" height="${height - (lowerY - y)}" fill="#102942" opacity="0.55"/>`,
    `<line x1="${x}" y1="${lowerY}" x2="${x + width}" y2="${lowerY}" stroke="#7bd6ff" stroke-dasharray="4 5" opacity="0.75"/>`,
    `<text x="${x}" y="${y - 14}" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="800" fill="#eaf8ff">${esc(label)} ${snapshot.t}s</text>`,
    `<text x="${x + width - 86}" y="${y + height + 18}" font-family="Inter, Arial, sans-serif" font-size="11" fill="#9fc8e8">threats ${snapshot.lowerFieldThreats}; overlaps ${snapshot.laneOverlaps}</text>`
  ];
  for(const dive of snapshot.activeDives || []) pieces.push(drawEntity(dive.x, dive.y, dive.role, dive.mode, x, y, scale));
  for(const shot of snapshot.enemyShots || []) pieces.push(drawShot(shot, x, y, scale));
  pieces.push(`<rect x="${x + 132 * scale}" y="${y + 320 * scale}" width="${16 * scale}" height="${7 * scale}" rx="2" fill="#49f27a"/>`);
  return pieces.join('\n');
}

function writeContactSheet(report){
  const scale = 0.55;
  const panelW = 280 * scale;
  const panelH = 360 * scale;
  const gap = 34;
  const cols = 4;
  const rows = 2;
  const leftA = 36;
  const leftB = leftA + cols * (panelW + gap) + 70;
  const top = 124;
  const width = Math.ceil(leftB + cols * (panelW + gap) + 10);
  const height = Math.ceil(top + rows * (panelH + 64) + 82);
  const children = [
    `<rect width="100%" height="100%" fill="#06101a"/>`,
    `<text x="36" y="42" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="900" fill="#f2fbff">Galaxy Guardians Stage 5 Readability Contact Sheet</text>`,
    `<text x="36" y="72" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="600" fill="#9fc8e8">Baseline vs ${esc(report.bestCandidate.label)}; lower field is shaded, yellow marks enemy missiles.</text>`,
    `<text x="${leftA}" y="108" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="900" fill="#f2fbff">Current Runtime</text>`,
    `<text x="${leftB}" y="108" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="900" fill="#f2fbff">Candidate Profile</text>`
  ];
  for(let i = 0; i < report.baselineVisual.snapshots.length; i++){
    const col = i % cols;
    const row = Math.floor(i / cols);
    const xA = leftA + col * (panelW + gap);
    const xB = leftB + col * (panelW + gap);
    const y = top + row * (panelH + 64);
    children.push(drawPanel('baseline', report.baselineVisual, report.baselineVisual.snapshots[i], xA, y, scale));
    children.push(drawPanel('candidate', report.candidateVisual, report.candidateVisual.snapshots[i], xB, y, scale));
  }
  children.push(`<text x="36" y="${height - 38}" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="700" fill="#c7dff3">${esc(report.visualVerdict.read)}</text>`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
  ${children.join('\n  ')}
</svg>
`;
  writeText(OUT_SVG, svg);
  return rel(OUT_SVG);
}

function buildMarkdown(report){
  return `# Galaxy Guardians Stage-Five Readability Visual Review

Generated: ${report.createdOn}
Status: ${report.status}

## Verdict

${report.visualVerdict.read}

| Signal | Baseline | Candidate |
| --- | ---: | ---: |
| Strict readability score | ${report.baselineCandidateMetrics.lowerFieldReadabilityScore10}/10 | ${report.bestCandidate.lowerFieldReadabilityScore10}/10 |
| Routeability | ${report.baselineCandidateMetrics.routeability.score10}/10 | ${report.bestCandidate.routeability.score10}/10 |
| Collision-loss share | ${pct(report.baselineCandidateMetrics.routeability.collisionLossShare)} | ${pct(report.bestCandidate.routeability.collisionLossShare)} |
| Lane-overlap share | ${pct(report.baselineCandidateMetrics.readabilityWindow.pace.laneOverlapShare)} | ${pct(report.bestCandidate.readabilityWindow.pace.laneOverlapShare)} |
| Contact-sheet overlap snapshots | ${pct(report.baselineVisual.summary.overlapSnapshotShare)} | ${pct(report.candidateVisual.summary.overlapSnapshotShare)} |
| Median alien ship speed | ${report.alienShipPaceComparison.baselineMedianAlienShipSpeedPxPerSecond}px/s | ${report.alienShipPaceComparison.candidateMedianAlienShipSpeedPxPerSecond}px/s |
| Enemy missile speed | ${report.baselineVisual.rules.enemyShotVy}px/s | ${report.candidateVisual.rules.enemyShotVy}px/s |
| Single-shot cooldown | ${report.baselineVisual.rules.singleShotCooldown}s | ${report.candidateVisual.rules.singleShotCooldown}s |

## Candidate-Mode Closeness

Estimated stage-five closeness in candidate-analysis mode:
${report.candidateStageFiveClosenessEstimate.estimatedStageFiveClosenessScore10}/10.
This is not a refreshed runtime artifact; it is an analysis-mode estimate used
to decide whether a runtime branch is worth creating.

## Promotion Decision

${report.promotionDecision.read}

## Next Steps

${report.nextSteps.map(step => `- ${step}`).join('\n')}
`;
}

function main(){
  const candidateArtifact = readJson(CANDIDATE);
  const bestId = candidateArtifact.summary?.bestCandidateId;
  const bestCandidate = (candidateArtifact.candidates || []).find(row => row.id === bestId);
  if(!bestCandidate) throw new Error(`Missing best candidate ${bestId || '(empty)'}`);
  const baselineVisual = sampleSnapshots(null);
  baselineVisual.summary = snapshotSummary(baselineVisual);
  const candidateVisual = sampleSnapshots(bestCandidate.patch);
  candidateVisual.summary = snapshotSummary(candidateVisual);
  const missileLocked = Math.abs((candidateVisual.rules.enemyShotVy || 0) - (baselineVisual.rules.enemyShotVy || 0)) < 0.001
    && Math.abs((candidateVisual.rules.enemyShotIntervalBase || 0) - (baselineVisual.rules.enemyShotIntervalBase || 0)) < 0.001
    && Math.abs((candidateVisual.rules.singleShotCooldown || 0) - (baselineVisual.rules.singleShotCooldown || 0)) < 0.001;
  const laneOverlapImproves = bestCandidate.readabilityWindow.pace.laneOverlapShare < candidateArtifact.baseline.readabilityWindow.pace.laneOverlapShare;
  const collisionImproves = bestCandidate.routeability.collisionLossShare < candidateArtifact.baseline.routeability.collisionLossShare;
  const routeabilityImproves = bestCandidate.routeabilityLift10 >= 0.5;
  const contactSheetImproves = candidateVisual.summary.overlapSnapshotShare <= baselineVisual.summary.overlapSnapshotShare;
  const visualPass = !!bestCandidate.promotionGate?.pass
    && missileLocked
    && laneOverlapImproves
    && collisionImproves
    && routeabilityImproves
    && contactSheetImproves;
  const hardPromotionHold = bestCandidate.lowerFieldReadabilityScore10 < 4.0;
  const baselineSpec = candidateArtifact.baselineSpecRead || {};
  const estimatedStageFiveClosenessScore10 = round((+baselineSpec.stageFiveClosenessScore10 || 0)
    + (bestCandidate.routeabilityLift10 * 0.34)
    + (bestCandidate.readabilityLift10 * 0.16), 1);
  const report = {
    gameKey: 'galaxy-guardians-preview',
    artifactType: 'galaxy-guardians-stage-five-readability-visual-review',
    version: '0.1-dev-preview',
    createdOn: new Date().toISOString(),
    status: hardPromotionHold ? 'visual-review-qualified-pass-runtime-hold' : 'visual-review-pass-ready-for-bounded-runtime-branch',
    generatedBy: 'tools/harness/analyze-galaxy-guardians-stage-five-readability-visual-review.js',
    sourceEvidence: {
      candidateArtifact: rel(CANDIDATE)
    },
    bestCandidate,
    baselineCandidateMetrics: candidateArtifact.baseline,
    baselineVisual,
    candidateVisual,
    candidateStageFiveClosenessEstimate: {
      mode: 'candidate-profile-analysis-not-runtime-refresh',
      baselineStageFiveClosenessScore10: baselineSpec.stageFiveClosenessScore10,
      estimatedStageFiveClosenessScore10,
      routeabilityLift10: bestCandidate.routeabilityLift10,
      readabilityLift10: bestCandidate.readabilityLift10,
      read: `Candidate analysis estimates stage-five closeness would move from ${baselineSpec.stageFiveClosenessScore10}/10 to about ${estimatedStageFiveClosenessScore10}/10 before runtime refresh.`
    },
    alienShipPaceComparison: {
      baselineMedianAlienShipSpeedPxPerSecond: candidateArtifact.baseline.readabilityWindow.pace.medianAlienShipSpeedPxPerSecond,
      candidateMedianAlienShipSpeedPxPerSecond: bestCandidate.readabilityWindow.pace.medianAlienShipSpeedPxPerSecond,
      baselineMedianAlienShipYSpeedPxPerSecond: candidateArtifact.baseline.readabilityWindow.pace.medianAlienShipYSpeedPxPerSecond,
      candidateMedianAlienShipYSpeedPxPerSecond: bestCandidate.readabilityWindow.pace.medianAlienShipYSpeedPxPerSecond,
      baselineLowerFieldThreatShare: candidateArtifact.baseline.readabilityWindow.pace.lowerFieldThreatShare,
      candidateLowerFieldThreatShare: bestCandidate.readabilityWindow.pace.lowerFieldThreatShare,
      baselineLaneOverlapShare: candidateArtifact.baseline.readabilityWindow.pace.laneOverlapShare,
      candidateLaneOverlapShare: bestCandidate.readabilityWindow.pace.laneOverlapShare,
      read: 'Candidate analysis slows/lengthens alien path commitment while preserving enemy missile velocity, enemy missile cadence, and player single-shot cadence.'
    },
    missilePaceLock: {
      enemyShotVy: baselineVisual.rules.enemyShotVy,
      enemyShotIntervalBase: baselineVisual.rules.enemyShotIntervalBase,
      singleShotCooldown: baselineVisual.rules.singleShotCooldown,
      preserved: missileLocked
    },
    visualVerdict: {
      pass: visualPass,
      hardPromotionHold,
      missileLocked,
      laneOverlapImproves,
      collisionImproves,
      routeabilityImproves,
      contactSheetImproves,
      read: hardPromotionHold
        ? `${bestCandidate.label} improves routeability and aggregate lane/collision metrics, but the contact-sheet sample is still mixed and strict lower-field readability is only ${bestCandidate.lowerFieldReadabilityScore10}/10, so this pass should not promote runtime constants yet.`
        : `${bestCandidate.label} clears the visual/contact-sheet gate for a bounded runtime branch while preserving missile pace and single-shot cadence.`
    },
    promotionDecision: {
      runtimePromotion: hardPromotionHold ? 'hold' : 'ready-for-branch',
      promoteNow: !hardPromotionHold && visualPass,
      read: hardPromotionHold
        ? 'Hold runtime promotion. Keep the candidate as a measured improvement and use the next pass to raise absolute lower-field clarity before changing shipped behavior.'
        : 'Create a bounded runtime branch for this exact rank-three profile, then refresh conformance artifacts after promotion.'
    },
    nextSteps: hardPromotionHold ? [
      'Do not promote the current candidate constants into runtime yet.',
      'Use commitment-window-v1 as the baseline for the next candidate family.',
      'Because static path-topology variants did not beat commitment-window-v1, test threat source selection, firing eligibility, or player-corridor rules next.',
      'Refresh visual review after a candidate reaches at least 4.0/10 on the strict lower-field readability scale.'
    ] : [
      'Promote the exact candidate profile in a bounded rank-three runtime branch.',
      'Refresh stage-five closeness, routeability review, candidate artifacts, and first-class conformance.',
      'Capture a hosted browser stage-five segment after promotion.'
    ]
  };
  report.media = {
    contactSheet: writeContactSheet(report)
  };
  writeJson(OUT, report);
  writeText(OUT_MD, buildMarkdown(report));
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    markdown: rel(OUT_MD),
    contactSheet: report.media.contactSheet,
    status: report.status,
    bestCandidateId: bestCandidate.id,
    visualPass,
    hardPromotionHold,
    runtimePromotion: report.promotionDecision.runtimePromotion,
    missileLocked,
    laneOverlapImproves,
    collisionImproves,
    routeabilityImproves
  }, null, 2));
}

try {
  main();
} catch (err) {
  console.error(err && err.stack || String(err));
  process.exit(1);
}
