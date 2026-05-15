#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'galaga-path-reference-label-plan');

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

function existsRel(relativePath){
  return fs.existsSync(path.join(ROOT, relativePath));
}

function collectFiles(relativeDir){
  const dir = path.join(ROOT, relativeDir);
  if(!fs.existsSync(dir)) return [];
  const out = [];
  function walk(current){
    for(const entry of fs.readdirSync(current, { withFileTypes: true })){
      const full = path.join(current, entry.name);
      if(entry.isDirectory()) walk(full);
      else out.push(rel(full));
    }
  }
  walk(dir);
  return out.sort();
}

function evidenceMediaFiles(files){
  return files.filter(file => /\.(png|jpe?g|webp|gif|mp4|mov|webm|m4v)$/i.test(file));
}

function sourceAnchors(){
  const anchors = [
    {
      id: 'galaga-stage-reference-video',
      role: 'regular-stage-entry-and-formation-reference',
      anchor: 'reference-artifacts/analyses/galaga-stage-reference-video/README.md',
      fileRoot: 'reference-artifacts/analyses/galaga-stage-reference-video'
    },
    {
      id: 'challenge-stage-reference-pack',
      role: 'challenge-stage-arrival-and-results-reference',
      anchor: 'reference-artifacts/analyses/challenge-stage-reference/README.md',
      fileRoot: 'reference-artifacts/analyses/challenge-stage-reference'
    },
    {
      id: 'first-challenge-stage-baseline',
      role: 'first-challenge-motion-and-scoreability-reference',
      anchor: 'reference-artifacts/analyses/first-challenge-stage/README.md',
      fileRoot: 'reference-artifacts/analyses/first-challenge-stage'
    },
    {
      id: 'release-reference-pack',
      role: 'release-window-capture-transition-and-pressure-reference',
      anchor: 'reference-artifacts/analyses/release-reference-pack/README.md',
      fileRoot: 'reference-artifacts/analyses/release-reference-pack'
    }
  ];
  return anchors.map(anchor => {
    const files = collectFiles(anchor.fileRoot);
    const mediaFiles = evidenceMediaFiles(files);
    return Object.assign({}, anchor, {
      present: existsRel(anchor.anchor),
      artifactCount: files.length,
      mediaEvidenceCount: mediaFiles.length,
      frameEvidenceReady: mediaFiles.length > 0,
      exampleFiles: files.slice(0, 8),
      exampleMediaFiles: mediaFiles.slice(0, 8)
    });
  });
}

function labelSchemas(){
  return {
    regularEntry: [
      'sourceAnchor',
      'sourceTimestampS',
      'stageNumber',
      'entityType',
      'entityFamily',
      'firstVisibleFrame',
      'entrySide',
      'entryCurveFamily',
      'rackTargetRow',
      'rackTargetColumn',
      'settleFrame',
      'firstAttackOrExitFrame',
      'notes',
      'confidence'
    ],
    challengeEntry: [
      'sourceAnchor',
      'sourceTimestampS',
      'challengeNumber',
      'groupIndex',
      'entityType',
      'entityFamily',
      'firstVisibleFrame',
      'entrySide',
      'pathCommitFrame',
      'scoreableUpperBandStartFrame',
      'scoreableUpperBandEndFrame',
      'exitSide',
      'bonusOpportunity',
      'notes',
      'confidence'
    ],
    comparisonVector: [
      'xRange',
      'yRange',
      'pathLength',
      'turnCount',
      'reversalCount',
      'lowerFieldShare',
      'rackSlotError',
      'timingOffsetS'
    ]
  };
}

function latestAlienVariation(){
  return readJson(path.join(ANALYSES, 'alien-entry-challenge-variation', 'latest.json'), {});
}

function workQueue(alienReport){
  const closestRegular = alienReport.observed?.closestRegularGeometryPair || {};
  const closestChallenge = alienReport.observed?.closestChallengeGeometryPair || {};
  return [
    {
      priority: 1,
      id: 'regular-entry-reference-labels',
      metric: 'reference-grounded-path-precision',
      problem: 'Runtime path families are available, but the scorer is capped until Galaga reference paths have frame labels.',
      currentEvidence: closestRegular.a && closestRegular.b
        ? `Closest runtime regular pair is ${closestRegular.a} / ${closestRegular.b} at distance ${closestRegular.distance}.`
        : 'No closest runtime pair was available.',
      labelFamilies: ['regularEntry', 'comparisonVector'],
      targetWindows: [
        'stage-1-baseline',
        'mid-run-entry-variant',
        'mid-run-pincer-variant',
        'late-run-cleanup-or-failure',
        'late-run-escort-variant',
        'late-run-crown-entry'
      ],
      acceptanceGate: 'At least six regular reference windows have first-visible, entry-side, rack-target, settle-frame, and trajectory-vector labels.'
    },
    {
      priority: 2,
      id: 'challenge-arrival-reference-labels',
      metric: 'challenge-arrival-vs-appearance',
      problem: 'Challenge arrivals are still reference-capped: broad runtime arrival evidence exists, but reference path labels are not yet attached.',
      currentEvidence: closestChallenge.a && closestChallenge.b
        ? `Closest runtime challenge pair is ${closestChallenge.a} / ${closestChallenge.b} at distance ${closestChallenge.distance}.`
        : 'No closest challenge pair was available.',
      labelFamilies: ['challengeEntry', 'comparisonVector'],
      targetWindows: [
        'challenge-stage-candidate',
        'challenge-stage-scorpion-cross',
        'challenge-stage-stingray-hook',
        'challenge-stage-boss-led-loop'
      ],
      acceptanceGate: 'At least four challenge reference windows have first-visible, path-commit, upper-band scoreability, exit, and bonus-opportunity labels.'
    },
    {
      priority: 3,
      id: 'dashboard-and-quality-scorer-link',
      metric: 'release-dashboard-conformance-economics',
      problem: 'The economics dashboard can show CPU/browser cost for runtime extraction, but the reference-labeling cost and eventual quality lift need an explicit artifact link.',
      currentEvidence: `Current alien/challenge variation score is ${alienReport.score10 ?? 'unknown'}/10.`,
      labelFamilies: ['regularEntry', 'challengeEntry'],
      targetWindows: ['release-dashboard', 'quality-conformance-rollup'],
      acceptanceGate: 'Quality conformance and release dashboard rows link to this label plan, latest direct-reference label artifact, and measured run-ledger cost.'
    }
  ];
}

function buildReport(){
  const generatedAt = new Date().toISOString();
  const commit = gitShortCommit();
  const outDir = path.join(OUT_ROOT, `${generatedAt.slice(0, 10)}-${commit}`);
  const alienReport = latestAlienVariation();
  const anchors = sourceAnchors();
  const queue = workQueue(alienReport);
  const sourceAnchorCount = anchors.filter(anchor => anchor.present).length;
  const frameEvidenceAnchorCount = anchors.filter(anchor => anchor.present && anchor.frameEvidenceReady).length;
  const readinessScore10 = Math.min(10, +((sourceAnchorCount * 1.1) + (frameEvidenceAnchorCount * 1.4) + 1.1).toFixed(1));
  const status = sourceAnchorCount >= 2 && frameEvidenceAnchorCount >= 2
    ? 'source-anchored-frame-evidence-ready'
    : sourceAnchorCount >= 2
      ? 'source-anchor-readme-ready-frame-media-needed'
      : 'blocked-on-reference-source-anchors';
  const report = {
    generatedAt,
    commit,
    artifactType: 'galaga-path-reference-label-plan',
    score10: readinessScore10,
    summary: {
      problem: 'Alien-entry and challenge-stage runtime variety now exposes a deeper conformance bottleneck: direct Galaga path precision requires frame-labeled reference windows.',
      strategy: 'Use existing preserved reference media as source anchors, label regular and challenge path windows with a reusable schema, then feed those labels back into path-family comparison and quality conformance scoring.',
      successMeasure: 'Lift reference-grounded path precision above 7/10 only after the label artifacts contain enough regular and challenge windows to replace heuristic runtime caps with direct reference comparison.',
      status,
      sourceAnchorCount,
      frameEvidenceAnchorCount,
      sourceEvidenceGap: frameEvidenceAnchorCount >= 2
        ? 'Frame/contact-sheet evidence is ready for the first reference-labeling pass.'
        : 'Source provenance exists, but most anchors are README-only in this checkout; add or recover contact sheets / clips before accepting frame-precise labels.',
      requiredLabelArtifactFamilies: ['regularEntry', 'challengeEntry', 'comparisonVector'],
      currentAlienEntryScore10: alienReport.score10 ?? null,
      weakestMetric: alienReport.summary?.weakestMetric || null
    },
    sourceAnchors: anchors,
    labelSchemas: labelSchemas(),
    workQueue: queue,
    estimatedImpact: {
      metric: 'reference-grounded-path-precision',
      currentScore10: (alienReport.metrics || []).find(metric => metric.id === 'reference-grounded-path-precision')?.score10 ?? null,
      firstGateTarget10: 7,
      projectedOverallLift10: 0.08,
      note: 'This is intentionally modest in the top-line rollup because direct labels mostly unlock future scorer precision; the user-facing value appears when those labels drive route, challenge, and sprite decisions.'
    },
    nextHarnessIntegration: [
      'Create a label ingestion script that validates regularEntry and challengeEntry JSON files against this schema.',
      'Extend formation-boss-path-family comparison to read accepted labels and replace the current heuristic cap only when label coverage gates pass.',
      'Attach label artifact paths to release dashboard and public project documentation so the evidence is visible, not hidden in repo internals.'
    ]
  };
  writeJson(path.join(outDir, 'report.json'), report);
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);

  const lines = [
    '# Galaga Path Reference Label Plan',
    '',
    report.summary.problem,
    '',
    `- Score: ${report.score10}/10`,
    `- Status: ${report.summary.status}`,
    `- Current alien-entry/challenge score: ${report.summary.currentAlienEntryScore10 ?? 'unknown'}/10`,
    '',
    '## Source Anchors',
    '',
    '| Source | Role | Present | Artifacts | Media Evidence | Frame Ready |',
    '| --- | --- | ---: | ---: | ---: | ---: |'
  ];
  for(const anchor of anchors){
    lines.push(`| ${anchor.anchor} | ${anchor.role} | ${anchor.present ? 'yes' : 'no'} | ${anchor.artifactCount} | ${anchor.mediaEvidenceCount} | ${anchor.frameEvidenceReady ? 'yes' : 'no'} |`);
  }
  lines.push('', '## Work Queue', '', '| Priority | Work | Acceptance Gate |', '| ---: | --- | --- |');
  for(const item of queue){
    lines.push(`| ${item.priority} | ${item.id} | ${item.acceptanceGate} |`);
  }
  lines.push('', '## Next Harness Integration', '');
  for(const step of report.nextHarnessIntegration) lines.push(`- ${step}`);
  fs.writeFileSync(path.join(outDir, 'README.md'), `${lines.join('\n')}\n`);
  return { ok: true, score10: report.score10, status: report.summary.status, report: rel(path.join(outDir, 'report.json')), latest: rel(path.join(OUT_ROOT, 'latest.json')) };
}

if(require.main === module){
  console.log(JSON.stringify(buildReport(), null, 2));
}

module.exports = { buildReport };
