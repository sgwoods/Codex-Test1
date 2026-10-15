#!/usr/bin/env node
const assert=require('node:assert/strict');
const {catalogFreshnessFailure}=require('../build/release-preflight-dev');
const failure={ok:false,missingCatalogText:['audio identity category is now 7/10']};
assert.deepEqual(catalogFreshnessFailure({stderr:JSON.stringify(failure)}),failure);
assert.deepEqual(catalogFreshnessFailure({stdout:JSON.stringify(failure)}),failure);
assert.equal(catalogFreshnessFailure({stderr:JSON.stringify({artifactCommit:'old'})}),null);
assert.equal(catalogFreshnessFailure({stderr:JSON.stringify({missingCatalogText:[]})}),null);
assert.equal(catalogFreshnessFailure({stderr:'Unexpected process failure'}),null);
console.log(JSON.stringify({ok:true,cases:5}));
