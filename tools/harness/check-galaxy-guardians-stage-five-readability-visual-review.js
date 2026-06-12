#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'stage-five-readability-visual-review-0.1.json');
const MARKDOWN = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'stage-five-readability-visual-review-0.1.md');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function finite(value){
  return Number.isFinite(+value);
}

function main(){
  if(!fs.existsSync(ARTIFACT)) fail('Missing Guardians stage-five readability visual review.', { artifact: rel(ARTIFACT) });
  if(!fs.existsSync(MARKDOWN)) fail('Missing Guardians stage-five readability visual review markdown.', { markdown: rel(MARKDOWN) });
  const artifact = readJson(ARTIFACT);
  const payload = {
    artifact: rel(ARTIFACT),
    status: artifact.status,
    verdict: artifact.visualVerdict,
    promotionDecision: artifact.promotionDecision
  };
  if(artifact.gameKey !== 'galaxy-guardians-preview' || artifact.artifactType !== 'galaxy-guardians-stage-five-readability-visual-review'){
    fail('Guardians stage-five readability visual review is linked incorrectly.', payload);
  }
  if(!['visual-review-qualified-pass-runtime-hold', 'visual-review-pass-ready-for-bounded-runtime-branch'].includes(artifact.status)){
    fail('Guardians stage-five readability visual review has an unexpected status.', payload);
  }
  if(!artifact.bestCandidate?.id || !finite(artifact.bestCandidate.lowerFieldReadabilityScore10)){
    fail('Guardians stage-five readability visual review is missing best candidate metrics.', payload);
  }
  if(artifact.visualVerdict?.missileLocked !== true){
    fail('Guardians stage-five readability visual review must preserve missile pace and single-shot cadence.', payload);
  }
  if(artifact.missilePaceLock?.preserved !== true){
    fail('Guardians stage-five readability visual review must carry a named missile pace lock.', payload);
  }
  if(!finite(artifact.candidateStageFiveClosenessEstimate?.estimatedStageFiveClosenessScore10)){
    fail('Guardians stage-five readability visual review must include candidate-mode closeness estimate.', payload);
  }
  if(!finite(artifact.alienShipPaceComparison?.candidateMedianAlienShipSpeedPxPerSecond)){
    fail('Guardians stage-five readability visual review must include alien ship pace comparison.', payload);
  }
  if(artifact.visualVerdict?.laneOverlapImproves !== true || artifact.visualVerdict?.collisionImproves !== true){
    fail('Guardians stage-five readability visual review must show lane/collision improvement before any branch decision.', payload);
  }
  if(artifact.promotionDecision?.promoteNow && artifact.visualVerdict?.hardPromotionHold){
    fail('Guardians visual review cannot both promote and hold.', payload);
  }
  if(artifact.status === 'visual-review-qualified-pass-runtime-hold' && artifact.promotionDecision?.runtimePromotion !== 'hold'){
    fail('Guardians visual review hold status must keep runtime promotion held.', payload);
  }
  const contactSheet = artifact.media?.contactSheet ? path.join(ROOT, artifact.media.contactSheet) : null;
  if(!contactSheet || !fs.existsSync(contactSheet)){
    fail('Guardians stage-five readability visual review is missing contact-sheet evidence.', artifact.media);
  }
  const markdown = fs.readFileSync(MARKDOWN, 'utf8');
  for(const phrase of ['Verdict', 'Promotion Decision', 'Next Steps']){
    if(!markdown.includes(phrase)) fail('Guardians visual review markdown is missing required context.', { phrase });
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(ARTIFACT),
    markdown: rel(MARKDOWN),
    contactSheet: rel(contactSheet),
    status: artifact.status,
    bestCandidateId: artifact.bestCandidate.id,
    runtimePromotion: artifact.promotionDecision.runtimePromotion,
    missileLocked: artifact.visualVerdict.missileLocked
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}
