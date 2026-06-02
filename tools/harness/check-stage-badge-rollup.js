#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function summarize(layout){
  return layout.reduce((acc, badge) => {
    const key = String(badge.value || badge.size || 'unknown');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

async function main(){
  const cases = [
    { stage: 4, expected: { 1: 4 }, max: 4 },
    { stage: 5, expected: { 5: 1 }, max: 1 },
    { stage: 9, expected: { 5: 1, 1: 4 }, max: 5 },
    { stage: 10, expected: { 10: 1 }, max: 1 },
    { stage: 24, expected: { 10: 2, 1: 4 }, max: 6 },
    { stage: 25, expected: { 25: 1 }, max: 1 },
    { stage: 57, expected: { 25: 2, 5: 1, 1: 2 }, max: 5 },
    { stage: 99, expected: { 25: 3, 10: 2, 1: 4 }, max: 9 }
  ];

  const result = await withHarnessPage({ skipStart: true, seed: 90991 }, async ({ page }) => page.evaluate(input => {
    const api = window.__galagaHarness__;
    return input.map(item => {
      const layout = api.stageBadgeLayout(item.stage);
      return {
        stage: item.stage,
        layout,
        counts: layout.reduce((acc, badge) => {
          const key = String(badge.value || badge.size || 'unknown');
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {})
      };
    });
  }, cases));

  for(const item of cases){
    const actual = result.find(row => row.stage === item.stage);
    if(!actual) fail('stage badge rollup result missing case', { item, result });
    const counts = summarize(actual.layout || []);
    const expectedKeys = Object.keys(item.expected).sort();
    const actualKeys = Object.keys(counts).filter(key => counts[key] > 0).sort();
    const sameKeys = expectedKeys.join(',') === actualKeys.join(',');
    const sameCounts = expectedKeys.every(key => counts[key] === item.expected[key]);
    if(!sameKeys || !sameCounts || actual.layout.length > item.max){
      fail('stage badge rollup no longer matches arcade-readable denominations', {
        stage: item.stage,
        expected: item.expected,
        maxMarkers: item.max,
        actual
      });
    }
  }

  console.log(JSON.stringify({ ok: true, cases: result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
