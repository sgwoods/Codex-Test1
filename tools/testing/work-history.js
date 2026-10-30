const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { insideFile } = require('./doc-claims');

const lines = bytes => bytes.toString('utf8').split('\n').length - (bytes.at(-1) === 10 ? 1 : 0);

function checkWorkHistory(root) {
  const manifest = JSON.parse(fs.readFileSync(insideFile(root, 'WORK_HISTORY.json'), 'utf8'));
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.maxActiveLines, 150, 'Active packet line budget changed');
  const active = fs.readFileSync(insideFile(root, manifest.activePacket));
  const index = fs.readFileSync(insideFile(root, manifest.index), 'utf8');
  assert(lines(active) <= manifest.maxActiveLines, 'Active packet exceeds line budget');
  assert(active.toString().includes(`](${manifest.index})`), 'Active packet must link history index');
  assert(index.includes(`](${manifest.activePacket})`), 'History index must link active packet');
  assert(Array.isArray(manifest.archives) && manifest.archives.length, 'History archive missing');
  const seen = new Set();
  for (const archive of manifest.archives) {
    assert(!seen.has(archive.file), 'Duplicate archive');
    seen.add(archive.file);
    const bytes = fs.readFileSync(insideFile(root, archive.file));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), archive.sha256, 'Archive hash changed');
    assert.equal(bytes.length, archive.bytes, 'Archive size changed');
    assert.equal(lines(bytes), archive.lines, 'Archive line count changed');
    assert(index.includes(`](${archive.file})`), 'Archive is not indexed');
  }
  // These two maintained Markdown files own the navigation contract, not prose truth.
  for (const text of [active.toString(), index]) {
    for (const [, target] of text.matchAll(/\]\(([^\s)]+)\)/g)) {
      if (/^[a-z]+:/i.test(target) || target.startsWith('#')) continue;
      insideFile(root, target.split('#')[0]);
    }
  }
  return { archives: seen.size, activeLines: lines(active) };
}
module.exports = { checkWorkHistory };
