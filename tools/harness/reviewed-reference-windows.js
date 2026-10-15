const assert = require('node:assert/strict');

const REVIEWED_CHALLENGE8 = {
  sourceSha256: '8d29ea711d09d243a2904bf9538981d97fe1fa323e4f920177688fa2b4c4c840',
  challengeNumber: 8,
  startSeconds: 242,
  endSeconds: 258.8,
  previewSpacingSeconds: 0.2,
  review: 'reference-artifacts/analyses/reference-wave-previews/2026-10-05T12-08-15-502Z-d686a350/REVIEW.md',
  status: 'reviewed-preview-observation-window-not-complete-target-lifetimes'
};

function resolveReferenceWindow(challengeNumber, sourceSha256, coarseStart, coarseDuration, cap){
  for(const value of [coarseStart, coarseDuration, cap])assert(Number.isFinite(value));
  assert(coarseStart >= 0 && coarseDuration > 0 && cap > 0);
  if(+challengeNumber === REVIEWED_CHALLENGE8.challengeNumber && sourceSha256 === REVIEWED_CHALLENGE8.sourceSha256){
    return { ...REVIEWED_CHALLENGE8, durationSeconds: REVIEWED_CHALLENGE8.endSeconds - REVIEWED_CHALLENGE8.startSeconds };
  }
  return { startSeconds: coarseStart, durationSeconds: Math.min(coarseDuration, cap),
    declaredDurationSeconds: coarseDuration, capped: coarseDuration > cap,
    status: 'coarse-source-window-not-event-labeled' };
}

module.exports = { resolveReferenceWindow, REVIEWED_CHALLENGE8 };
