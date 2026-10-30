const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { checkWorkHistory } = require('./work-history');

test('retained work history is intact, indexed and reachable from the bounded active packet', () => {
  assert(checkWorkHistory(path.resolve(__dirname, '../..')).archives > 0);
});

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aurora-history-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'ACTIVE.md'), '[History](INDEX.md)\n');
  fs.writeFileSync(path.join(root, 'INDEX.md'), '[Active](ACTIVE.md)\n[Archive](OLD.md)\n');
  const bytes = Buffer.from('Historical evidence.\n');
  fs.writeFileSync(path.join(root, 'OLD.md'), bytes);
  const manifest = { schemaVersion: 1, activePacket: 'ACTIVE.md', index: 'INDEX.md', maxActiveLines: 150,
    archives: [{ file: 'OLD.md', sha256: crypto.createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, lines: 1 }] };
  fs.writeFileSync(path.join(root, 'WORK_HISTORY.json'), JSON.stringify(manifest));
  return root;
}

test('history contract rejects changed archives, missing navigation and oversized active records', t => {
  for (const [file, content, expected] of [
    ['OLD.md', 'Altered evidence.\n', /Archive hash changed/],
    ['INDEX.md', '[Active](ACTIVE.md)\n', /not indexed/],
    ['ACTIVE.md', '[History](INDEX.md)\n' + '\n'.repeat(150), /line budget/],
    ['INDEX.md', '[Active](ACTIVE.md)\n[Archive](OLD.md)\n[Missing](missing.md)', /ENOENT/],
  ]) {
    const root = fixture(t);
    assert.deepEqual(checkWorkHistory(root), { archives: 1, activeLines: 1 });
    fs.writeFileSync(path.join(root, file), content);
    assert.throws(() => checkWorkHistory(root), expected);
  }
});
