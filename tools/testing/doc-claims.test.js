const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { checkClaims, readClaims } = require('./doc-claims');
const block = claims => `# Contract\n\n\`\`\`aurora-claims\n${JSON.stringify(claims)}\n\`\`\`\n`;

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aurora-doc-claims-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ scripts: { test: 'node check.js' } }));
  fs.writeFileSync(path.join(root, 'state.json'), JSON.stringify({ games: ['aurora'], absent: false, 'a/b': { '~': 4 } }));
  return root;
}
test('owned document claims check commands, paths, JSON values and pointer escapes', t => {
  const root = fixture(t);
  assert.equal(checkClaims(root, block([
    { id: 'path', kind: 'file', file: 'state.json' },
    { id: 'command', kind: 'command', name: 'test', equals: 'node check.js' },
    { id: 'games', kind: 'json-value', file: 'state.json', pointer: '/games', equals: ['aurora'] },
    { id: 'absence', kind: 'json-value', file: 'state.json', pointer: '/absent', equals: false },
    { id: 'escape', kind: 'json-value', file: 'state.json', pointer: '/a~1b/~0', equals: 4 },
    { id: 'count', kind: 'json-length', file: 'state.json', pointer: '/games', equals: 1 },
  ])).checked, 6);
});
test('stale command, missing file, false absence and stale counts fail', t => {
  const root = fixture(t);
  for (const claim of [
    { id: 'missing', kind: 'file', file: 'missing.md' },
    { id: 'missing-command', kind: 'command', name: 'unknown', equals: 'node check.js' },
    { id: 'stale-command', kind: 'command', name: 'test', equals: 'node old.js' },
    { id: 'stale-state', kind: 'json-value', file: 'state.json', pointer: '/absent', equals: true },
    { id: 'stale-count', kind: 'json-length', file: 'state.json', pointer: '/games', equals: 2 },
    { id: 'invalid-index', kind: 'json-value', file: 'state.json', pointer: '/games/length', equals: 1 },
    { id: 'missing-value', kind: 'json-value', file: 'state.json', pointer: '/missing', equals: null },
  ]) assert.throws(() => checkClaims(root, block([claim])), new RegExp(claim.id));
});
test('malformed, duplicate, unknown and empty claims fail closed', t => {
  const root = fixture(t);
  const good = { id: 'path', kind: 'file', file: 'state.json' };
  for (const markdown of ['', block([]), block([good, good]), block([{ ...good, extra: true }]),
    block([{ id: 'unknown', kind: 'typo' }]), '```aurora-claims\n[', '```aurora-claims\ninvalid\n```']) {
    assert.throws(() => checkClaims(root, markdown));
  }
  assert.throws(() => readClaims(`${block([good])}\n\`\`\`aurora-claims\n[]`), /Unclosed/);
});
test('paths and symlinks cannot escape the owned repository', t => {
  const root = fixture(t);
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'aurora-outside-'));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  const file = path.join(outside, 'secret.json');
  fs.writeFileSync(file, '{}');
  fs.symlinkSync(file, path.join(root, 'escape.json'));
  for (const name of [file, path.relative(root, file), 'escape.json']) {
    assert.throws(() => checkClaims(root, block([{ id: 'escape', kind: 'file', file: name }])));
  }
});
