const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { createHash } = require('crypto');

const sha256 = data => createHash('sha256').update(data).digest('hex');

function inventory(root, prefix = ''){
  return fs.readdirSync(path.join(root, prefix), { withFileTypes: true }).flatMap(entry => {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    assert(!entry.isSymbolicLink(), `Frozen beta rejects symlink: ${name}`);
    if(entry.isDirectory()) return inventory(root, name);
    assert(entry.isFile(), `Frozen beta rejects non-file: ${name}`);
    const data = fs.readFileSync(path.join(root, name));
    return [{ path: name, bytes: data.length, sha256: sha256(data) }];
  }).sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}

function verifyInventory(root, expected){
  assert.deepEqual(inventory(root), expected, 'Frozen beta file inventory mismatch');
}

function loadFrozenCandidate(root){
  const receipt = JSON.parse(fs.readFileSync(path.join(root, 'freeze-receipt.json'), 'utf8'));
  const files = JSON.parse(fs.readFileSync(path.join(root, 'inventory.json'), 'utf8'));
  assert(Array.isArray(files) && files.length > 0, 'Frozen beta inventory missing');
  for(const row of files){
    assert(typeof row.path === 'string' && row.path && !row.path.includes('\\') &&
      !path.posix.isAbsolute(row.path) && !row.path.split('/').some(p => !p || p === '.' || p === '..'),
    'Invalid frozen beta path');
    assert(Number.isSafeInteger(row.bytes) && row.bytes >= 0 && /^[a-f0-9]{64}$/.test(row.sha256),
      'Invalid frozen beta file metadata');
  }
  assert.equal(new Set(files.map(row => row.path)).size, files.length, 'Duplicate frozen beta path');
  assert.equal(sha256(JSON.stringify(files)), receipt.inventorySha256, 'Frozen beta receipt mismatch');
  assert.equal(files.length, receipt.fileCount, 'Frozen beta count mismatch');
  assert.equal(files.reduce((n, row) => n + row.bytes, 0), receipt.totalBytes, 'Frozen beta size mismatch');
  verifyInventory(path.join(root, 'beta'), files);
  const info = JSON.parse(fs.readFileSync(path.join(root, 'beta/build-info.json'), 'utf8'));
  assert.equal(info.commit, receipt.sourceCommit, 'Frozen beta source mismatch');
  assert.equal(info.label, receipt.betaLabel, 'Frozen beta label mismatch');
  assert.equal(info.releaseChannel, 'production beta', 'Frozen beta channel mismatch');
  assert.equal(info.dirty, false, 'Frozen beta source is dirty');
  assert(/ clean$/.test(info.promotedFromState || ''), 'Frozen beta promotion source is not clean');
  return { receipt, files };
}

function verifyBetaOnlyPaths(paths){
  assert(paths.every(name => name.startsWith('beta/')), 'Frozen beta refuses non-beta publication changes');
}

function verifyGitTree(tree, root, files){
  const expected = files.map(row => {
    const data = fs.readFileSync(path.join(root, row.path));
    const blob = createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
    return `100644 blob ${blob}\tbeta/${row.path}`;
  }).sort();
  assert.deepEqual(tree.split('\0').filter(Boolean).sort(), expected,
    'Committed beta tree differs from frozen files');
}

module.exports = { inventory, verifyInventory, loadFrozenCandidate, verifyBetaOnlyPaths, verifyGitTree };
