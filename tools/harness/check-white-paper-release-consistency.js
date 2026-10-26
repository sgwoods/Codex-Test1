const assert = require('assert');
const path = require('path');
const {
  assertReleaseConsistent,
  canonicalReleaseVersions,
  checkWhitePaperReleaseConsistency
} = require('../build/white-paper-release-consistency');
const canonical = ['1.4.2-beta.5', '1.4.2'];
const staleList = `

- hosted \`/production\` remains the stable public \`1.4.0\` line
- hosted \`/dev\` and \`/beta\` are review lanes for the next candidate family
- the current candidate is suitable for dev-lane review after preflight, but
  not yet a new \`1.4.1\` production promise
`;
assert.throws(() => assertReleaseConsistent(
  `As of this draft, the current production recommendation is deliberately\nconservative:${staleList}`,
  'fixture', canonical), /names 1\.4\.0, 1\.4\.1/);
assert.throws(() => assertReleaseConsistent(
  '| `1.4.0` | Current multi-game and conformance baseline | The public line now carries more. |',
  'fixture', canonical), /names 1\.4\.0/);
assert.throws(() => assertReleaseConsistent(
  'In June 2026 the production recommendation was conservative:' + staleList,
  'fixture', canonical), /names 1\.4\.0/);
for(const text of [
  `In the June 2026 historical assessment (\`2026-06-07\`), the production recommendation was\ndeliberately conservative:${staleList}`,
  'This revision was prepared for the current `1.4.2` release from the approved `1.4.2-beta.5` gameplay.',
  '| `1.0.0` | First public Aurora launch | The project became a real public product. |'
]){
  assert.doesNotThrow(() => assertReleaseConsistent(text, 'fixture', canonical));
}
const root = path.resolve(__dirname, '../..');
assert.ok(canonicalReleaseVersions(root).length === 2);
checkWhitePaperReleaseConsistency(root);
console.log(`White-paper release consistency: sources agree with ${canonicalReleaseVersions(root).join(' / ')}.`);
