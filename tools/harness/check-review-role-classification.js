#!/usr/bin/env node
const assert = require('node:assert/strict');
const { automaticFindings } = require('../review/build-code-review-packet');
const role = ['service', 'role'].join('_');
const examples = [
  ['supabase/add-platform-game-scores.sql', `grant all privileges on table public.game_scores to ${role};`],
  ['tools/harness/check-game-scores-migration.js', `await db.exec(\`create role anon; create role authenticated; create role ${role};`],
  ['tools/harness/check-supabase-data-api-contract.js', `grants: { anon: ['select', 'insert'], authenticated: ['select', 'insert', 'delete'], ${role}: ['all'] },`]
];
function flagged(file, text) {
  return automaticFindings([{ file }], [{ file, text }])
    .some(f => f.id === 'secret-like-token');
}
let checks = 0;
for (const [file, text] of examples) {
  assert.equal(flagged(file, text), false); checks++;
  assert.equal(flagged('src/js/unreviewed.js', text), true); checks++;
  assert.equal(flagged(file, text + ` const ${role}_key = 'test-value';`), true); checks++;
  assert.equal(flagged(file, text + ' // ' + 'ghp_' + 'x'.repeat(24)), true); checks++;
  assert.equal(flagged(file, text.replace(role, `${role}_password`)), true); checks++;
}
assert(flagged('src/js/example.js', `const ${role}_key = 'test-value';`)); checks++;
assert(flagged('src/js/example.js', `const key = '${'sk-' + 'x'.repeat(24)}';`)); checks++;
console.log(JSON.stringify({ ok: true, checks, scope: 'Three exact reviewed statement forms only; original security gate unchanged.' }, null, 2));
