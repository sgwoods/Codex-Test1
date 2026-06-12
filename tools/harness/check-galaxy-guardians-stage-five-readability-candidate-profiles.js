#!/usr/bin/env node
const path = require('path');
const {
  ROOT,
  rel,
  loadGuardiansCandidateProfileSet
} = require('./guardians-candidate-profile-lib');

const PROFILE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'stage-five-readability-candidate-profiles-0.1.json');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

try {
  const profile = loadGuardiansCandidateProfileSet(PROFILE);
  const topologyCandidates = profile.candidates.filter(candidate => candidate.family === 'path-topology-lane-separation');
  if(topologyCandidates.length < 4){
    fail('Guardians stage-five readability profile set needs a richer path-topology family.', { topologyCount: topologyCandidates.length });
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(PROFILE),
    candidateCount: profile.candidates.length,
    familyCount: profile.families.length,
    topologyCandidateCount: topologyCandidates.length,
    targetStrictReadabilityScore10: profile.promotionGate.targetStrictReadabilityScore10,
    runtimeChangeAllowed: profile.promotionGate.runtimeChangeAllowed
  }, null, 2));
} catch (err) {
  fail(err && err.stack || String(err));
}
