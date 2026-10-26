const assert = require('assert');
const path = require('path');
const { assertComplete, checkWhitePaperSources } = require('../build/white-paper-completeness');
for(const text of ['> TODO illustration:', '<blockquote><p>TODO illustration:</p></blockquote>', '<b>TO</b>DO: image', '<p>TO&#68;O illustration:</p>', 'T&#x42;D', 'TBD', 'fixme', '[insert diagram]']){
  assert.throws(() => assertComplete(text, 'fixture'), /unfinished editorial marker/);
}
for(const text of ['Future work requires new measurements.', 'TODOs must not ship.', 'The historical baseline is dated.']){
  assert.doesNotThrow(() => assertComplete(text, 'fixture'));
}
checkWhitePaperSources(path.resolve(__dirname, '../..'));
console.log('White-paper completeness: source and rendered-marker regressions passed.');
