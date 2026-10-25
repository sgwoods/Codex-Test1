const assert = require('assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { approvalInventory, checkApprovalInventory } = require('../build/beta-approval-contract');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'beta-approval-'));
try {
  fs.writeFileSync(path.join(root, 'index.html'), 'accepted');
  const approved = { inventory: approvalInventory(root) };
  checkApprovalInventory(root, approved);
  fs.writeFileSync(path.join(root, 'approved-build-info.json'), JSON.stringify(approved));
  checkApprovalInventory(root, approved);
  assert.throws(() => checkApprovalInventory(root, {}));
  fs.writeFileSync(path.join(root, 'index.html'), 'changed');
  assert.throws(() => checkApprovalInventory(root, approved));
  fs.writeFileSync(path.join(root, 'index.html'), 'accepted');
  fs.writeFileSync(path.join(root, 'extra.txt'), 'unexpected');
  assert.throws(() => checkApprovalInventory(root, approved));
  fs.unlinkSync(path.join(root, 'extra.txt'));
  fs.unlinkSync(path.join(root, 'index.html'));
  assert.throws(() => checkApprovalInventory(root, approved));
  console.log('PASS: approval identity, receipt exclusion, missing approval, changed, added and deleted files');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
