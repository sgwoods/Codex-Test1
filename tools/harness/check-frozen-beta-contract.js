const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { createHash } = require('crypto');
const { execFileSync } = require('child_process');
const { inventory, verifyInventory, loadFrozenCandidate, verifyBetaOnlyPaths, verifyGitTree } = require('../build/frozen-beta-contract');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aurora-frozen-beta-fixture-'));
const beta = path.join(root, 'beta');
const hash = data => createHash('sha256').update(data).digest('hex');
try{
  fs.mkdirSync(beta);
  const info = { commit: '1'.repeat(40), label: 'fixture-beta', releaseChannel: 'production beta',
    dirty: false, promotedFromState: 'main@11111111 clean' };
  fs.writeFileSync(path.join(beta, 'build-info.json'), JSON.stringify(info));
  fs.writeFileSync(path.join(beta, 'index.html'), '<html>Frozen fixture</html>');
  const files = inventory(beta);
  const receipt = { inventorySha256: hash(JSON.stringify(files)), fileCount: files.length,
    totalBytes: files.reduce((n, row) => n + row.bytes, 0), sourceCommit: info.commit, betaLabel: info.label };
  fs.writeFileSync(path.join(root, 'inventory.json'), JSON.stringify(files));
  fs.writeFileSync(path.join(root, 'freeze-receipt.json'), JSON.stringify(receipt));
  assert.deepEqual(loadFrozenCandidate(root).files, files);
  fs.writeFileSync(path.join(beta, 'extra.txt'), 'unexpected');
  assert.throws(() => verifyInventory(beta, files), /inventory mismatch/);
  fs.unlinkSync(path.join(beta, 'extra.txt'));
  const original = fs.readFileSync(path.join(beta, 'index.html'));
  fs.writeFileSync(path.join(beta, 'index.html'), 'tampered');
  assert.throws(() => verifyInventory(beta, files), /inventory mismatch/);
  fs.writeFileSync(path.join(beta, 'index.html'), original);
  fs.unlinkSync(path.join(beta, 'index.html'));
  assert.throws(() => verifyInventory(beta, files), /inventory mismatch/);
  fs.symlinkSync(path.join(beta, 'build-info.json'), path.join(beta, 'index.html'));
  assert.throws(() => verifyInventory(beta, files), /symlink/);
  fs.unlinkSync(path.join(beta, 'index.html'));
  fs.writeFileSync(path.join(beta, 'index.html'), original);
  fs.writeFileSync(path.join(root, 'freeze-receipt.json'), JSON.stringify({ ...receipt, inventorySha256: '0'.repeat(64) }));
  assert.throws(() => loadFrozenCandidate(root), /receipt mismatch/);
  fs.writeFileSync(path.join(root, 'freeze-receipt.json'), JSON.stringify(receipt));
  verifyBetaOnlyPaths(['beta/index.html', 'beta/old-asset.png']);
  assert.throws(() => verifyBetaOnlyPaths(['dev/index.html']), /non-beta/);
  assert.throws(() => verifyBetaOnlyPaths(['index.html']), /non-beta/);
  execFileSync('git', ['init', '-q', root]);
  execFileSync('git', ['-C', root, 'add', 'beta']);
  const tree = execFileSync('git', ['-C', root, 'write-tree'], { encoding: 'utf8' }).trim();
  const entries = execFileSync('git', ['-C', root, 'ls-tree', '-r', '-z', tree, '--', 'beta/'], { encoding: 'utf8' });
  verifyGitTree(entries, beta, files);
  assert.throws(() => verifyGitTree(entries.replace('100644', '100755'), beta, files), /Committed beta tree/);
  const git = args => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' });
  fs.writeFileSync(path.join(root, 'outside.txt'), 'rename fixture');
  git(['add', 'outside.txt']);
  git(['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.com', 'commit', '-qm', 'Fixture baseline']);
  const base = git(['rev-parse', 'HEAD']).trim();
  fs.renameSync(path.join(root, 'outside.txt'), path.join(beta, 'renamed.txt'));
  git(['add', '-A']);
  git(['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.com', 'commit', '-qm', 'Fixture rename']);
  const changed = git(['diff', '--no-renames', '--name-only', '-z', base, 'HEAD']).split('\0').filter(Boolean);
  assert(changed.includes('outside.txt'));
  assert.throws(() => verifyBetaOnlyPaths(changed), /non-beta/);
  fs.unlinkSync(path.join(beta, 'renamed.txt'));
  verifyInventory(beta, files);
  console.log(JSON.stringify({ ok: true, cases: ['accepted receipt', 'extra file', 'tampered bytes',
    'missing file', 'symlink', 'receipt digest', 'beta-only paths', 'DEV rejection',
    'production rejection', 'actual Git tree', 'Git mode mismatch', 'outside-to-beta rename rejection'] }, null, 2));
}finally{
  fs.rmSync(root, { recursive: true, force: true });
}
