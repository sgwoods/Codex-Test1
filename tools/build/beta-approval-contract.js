const assert = require('assert/strict');
const { createHash } = require('crypto');
const { inventory } = require('./frozen-beta-contract');

function approvalInventory(root){
  const files = inventory(root).filter(row => row.path !== 'approved-build-info.json');
  return { fileCount: files.length, sha256: createHash('sha256').update(JSON.stringify(files)).digest('hex') };
}

function checkApprovalInventory(root, approved){
  assert.deepEqual(approved.inventory, approvalInventory(root),
    'Approved beta files changed or inventory approval is missing. Review and approve the exact package again.');
}

module.exports = { approvalInventory, checkApprovalInventory };
