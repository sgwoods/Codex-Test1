#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 8, ships: 3, challenge: false, seed: 24141, skipStart: true }, async ({ page }) => {
    const cues = await page.evaluate(() => {
      const entries = [
        ['captureSuccess', { phase: 'stage', atmosphereTheme: 'aurora-borealis' }],
        ['capturedFighterDestroyed', { phase: 'stage', atmosphereTheme: 'aurora-borealis' }],
        ['challengeResults', { phase: 'challenge', atmosphereTheme: 'aurora-borealis', challenge: true }],
        ['challengePerfect', { phase: 'challenge', atmosphereTheme: 'aurora-borealis', challenge: true }],
        ['highScoreFirst', { phase: 'results', atmosphereTheme: 'aurora-borealis' }],
        ['highScoreOther', { phase: 'results', atmosphereTheme: 'aurora-borealis' }]
      ];
      return entries.map(([cue, opts]) => ({ cue, resolved: window.__galagaHarness__.triggerAudioCue(cue, opts) }));
    });
    return { cues };
  });

  const missing = result.cues.filter(entry => !entry.resolved || entry.resolved.cue !== entry.cue);
  if(missing.length){
    fail('one or more new Aurora audio cue slots did not resolve through the live game audio system', result);
  }

  console.log(JSON.stringify({ ok: true, cues: result.cues }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
