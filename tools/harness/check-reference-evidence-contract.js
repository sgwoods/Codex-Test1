#!/usr/bin/env node
const assert = require('node:assert/strict');
const { trackletEvidenceContract, assessReferenceClaim, requireReferenceClaim } = require('./reference-evidence-contract');
const { resolveReferenceWindow, REVIEWED_CHALLENGE8 } = require('./reviewed-reference-windows');

const legacy = { trackRead: { trackCount: 60, groupCount: 5 }, confidence: .99 };
const current = { evidenceContract: trackletEvidenceContract('a'.repeat(64)) };
assert.equal(assessReferenceClaim(legacy).status, 'legacy-unqualified');
assert.equal(assessReferenceClaim(legacy, 'full-path').supported, false);
assert.equal(requireReferenceClaim(current, 'descriptive').supported, true);
for(const claim of ['full-entry', 'full-path', 'wave-identity']){
  assert.throws(() => requireReferenceClaim(current, claim), /does not establish/);
  assert.throws(() => requireReferenceClaim(legacy, claim), /does not establish/);
}
assert.throws(() => assessReferenceClaim(current, 'perfect-feasibility'), /Unknown/);
assert.equal(assessReferenceClaim({ evidenceContract: trackletEvidenceContract('missing') }).supported, false);
const reviewed = resolveReferenceWindow(8, REVIEWED_CHALLENGE8.sourceSha256, 241, 30, 16);
assert.equal(reviewed.startSeconds, 242);
assert(Math.abs(reviewed.durationSeconds - 16.8) < 1e-9);
assert.equal(resolveReferenceWindow(8, 'wrong', 241, 30, 16).durationSeconds, 16);
assert.equal(resolveReferenceWindow(7, REVIEWED_CHALLENGE8.sourceSha256, 210, 30, 16).durationSeconds, 16);
assert.equal(resolveReferenceWindow(8, 'wrong', 241, 30, 16).capped, true);
assert.throws(() => resolveReferenceWindow(8, 'wrong', 241, -1, 16));
console.log(JSON.stringify({ ok: true, descriptiveAccepted: true, unsupportedClaimsRejected: 6,
  missingProvenanceRejected: true, unknownClaimRejected: true }));
