const assert = require('node:assert/strict');

const CLAIMS = ['descriptive', 'full-entry', 'full-path', 'wave-identity'];

function trackletEvidenceContract(sourceSha256){
  return {
    schema: 'reference-evidence-contract-1',
    sourceSha256,
    timing: 'resampled-8fps-relative-time-not-native-pts',
    windowBoundaryStatus: 'coarse-source-window-not-event-labeled',
    analyzedNormalizedY: { min: .105, max: .875 },
    observationUnit: 'connected-component-tracklet-not-identified-alien',
    groupIdentity: 'five-requested-temporal-clusters-not-verified-waves',
    confidenceMeaning: 'uncalibrated-heuristic-not-probability',
    shootingCensoring: 'not-resolved-per-target',
    capabilities: { descriptive: true, 'full-entry': false, 'full-path': false, 'wave-identity': false }
  };
}

function assessReferenceClaim(row, claim = 'descriptive'){
  assert(CLAIMS.includes(claim), 'Unknown reference claim: ' + claim);
  const contract = row?.evidenceContract;
  const declared = contract?.schema === 'reference-evidence-contract-1';
  const hashed = /^[a-f0-9]{64}$/.test(contract?.sourceSha256 || '');
  const supported = !!(declared && hashed && contract.capabilities?.[claim] === true);
  return { claim, supported, status: declared ? 'declared' : 'legacy-unqualified',
    reason: supported ? 'Within declared evidence capability' :
      'Missing provenance/capability or evidence does not establish this claim' };
}

function requireReferenceClaim(row, claim){
  const assessment = assessReferenceClaim(row, claim);
  assert(assessment.supported, `${claim}: ${assessment.reason}`);
  return assessment;
}

module.exports = { trackletEvidenceContract, assessReferenceClaim, requireReferenceClaim };
