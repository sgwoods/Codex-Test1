const assert = require('node:assert/strict');
const { serializeReleaseDetails, rewriteReleaseDetails } = require('../build/packaged-release-details');
const { fillBuildTokens } = require('../build/build-index');
const template = '<script type="application/json" id="buildReleaseDetails">{}</script>';
for(const lane of ['development', 'production beta', 'production']){
  const info = { label: `${lane}-build`, version: '1.2.3', buildNumber: 42,
    commit: 'abc123', releaseChannel: lane, builtAtUtc: '2026-10-27T12:00:00Z',
    latestReleaseNote: { version: '1.2.3', date: '2026-10-26', title: '</script><script>bad()</script>', summary: '$& <b>literal</b>' } };
  const serialized = serializeReleaseDetails(info);
  assert.equal(fillBuildTokens('{{DETAILS}}', {DETAILS:serialized}),serialized);
  assert.equal(fillBuildTokens('{{DETAILS}}', {DETAILS:"$& $` $' $$"}),"$& $` $' $$");
  assert(!serialized.includes('<'));
  const result = rewriteReleaseDetails(template, info);
  assert.equal((result.match(/<script/g)||[]).length, 1);
  const parsed = JSON.parse(result.slice(result.indexOf('>')+1, result.lastIndexOf('</script>')));
  assert.equal(parsed.lane, lane);
  assert.equal(parsed.note.summary, info.latestReleaseNote.summary);
  assert.equal(parsed.note.title, info.latestReleaseNote.title);
  assert.notEqual(parsed.note.date, parsed.builtAt);
  assert.equal(rewriteReleaseDetails('legacy approved artifact', info), 'legacy approved artifact');
}
console.log('Packaged release details: three lanes, safe serialization, legacy preservation PASS');
