const assert = require('assert/strict');
const { checkProductionReleaseDocs } = require('../build/check-publish-ready');
const info = { version: '1.4.2', promotedFromApprovedBeta: 'beta5' };
const docs = {
  dashboard: {
    timeline: [{ title: '1.4.2 Production', releaseNoteVersion: '1.4.2', status: 'approved' }],
    productionApproval: { version: '1.4.2', betaLabel: 'beta5', approvedAt: '2026-10-24' }
  },
  readiness: '`1.4.2` is approved for production publication; not yet deployed.'
};
checkProductionReleaseDocs(info, docs);
assert.throws(() => checkProductionReleaseDocs({ ...info, promotedFromApprovedBeta: 'other' }, docs));
assert.throws(() => checkProductionReleaseDocs(info, { ...docs, readiness: 'Pending review' }));
const missing = JSON.parse(JSON.stringify(docs));
delete missing.dashboard.productionApproval;
assert.throws(() => checkProductionReleaseDocs(info, missing));
const pending = JSON.parse(JSON.stringify(docs));
pending.dashboard.timeline[0].status = 'planned';
assert.throws(() => checkProductionReleaseDocs(info, pending));
console.log('PASS: explicit matching publication approval accepted; mismatch, missing approval and pending review rejected');
