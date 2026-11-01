const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../../src/js/19-render-shell.js'), 'utf8');
const from = source.indexOf('function syncHudAndShellMessages({ox,oy,viewW,viewH}){');
const to = source.indexOf(' if(center)', from);
assert(from >= 0 && to > from);

function renderScore(playerTwo, score = 567390) {
  const S = { score, playerTwo };
  const before = JSON.stringify(S);
  const left = { innerHTML: '' };
  const ctx = vm.createContext({ S, left, formatScore: value => String(value).padStart(6, '0') });
  // Execute the actual 1UP render path, excluding unrelated shell/modal updates.
  vm.runInContext(source.slice(from, to) + '\n}\nsyncHudAndShellMessages({});', ctx);
  assert.equal(JSON.stringify(S), before, 'HUD rendering must not mutate lane or score state');
  return left.innerHTML;
}

function expected(score) {
  return `<span class="hudLabel">1UP</span> <span class="hudValue">${String(score).padStart(6, '0')}</span>`;
}

test('solo and disabled Rival display the live score', () => {
  assert.equal(renderScore(undefined), expected(567390));
  assert.equal(renderScore({ enabled: false, activeTurn: 'done', p1: { score: 0 } }), expected(567390));
});

for (const activeTurn of ['p1', 'queued', 'simulated']) {
  test(`${activeTurn} displays the live human score rather than a stale saved lane`, () => {
    assert.equal(renderScore({ enabled: true, activeTurn, p1: { score: 0 }, humanScore: 100 }), expected(567390));
  });
}

for (const activeTurn of ['p2', 'ready', 'done', 'final']) {
  test(`${activeTurn} displays the saved human score, including zero`, () => {
    for (const score of [0, 12340]) {
      assert.equal(renderScore({ enabled: true, activeTurn, p1: { score }, humanScore: 999 }), expected(score));
    }
  });
}

test('missing saved lane falls back to humanScore, then zero, never the rival score', () => {
  for (const activeTurn of ['p2', 'ready', 'done', 'final']) {
    assert.equal(renderScore({ enabled: true, activeTurn, humanScore: 42 }), expected(42));
    assert.equal(renderScore({ enabled: true, activeTurn, humanScore: 0 }), expected(0));
    assert.equal(renderScore({ enabled: true, activeTurn }), expected(0));
    assert.equal(renderScore({ enabled: true, activeTurn, p1: { score: null }, humanScore: 42 }), expected(42));
  }
});
