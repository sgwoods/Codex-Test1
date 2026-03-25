#!/usr/bin/env node
const { withHarnessPage, sleep, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 4, ships: 5, challenge: false, seed: 9045 }, async ({ page }) => {
    await page.evaluate(() => window.__galagaHarness__.setupSquadronBonusTest({ playerX: 140 }));
    const squad = await page.evaluate(() => window.__galagaHarness__.squadronState());
    if(!squad) throw new Error('No squadron state returned');
    await page.evaluate(() => window.__galagaHarness__.triggerSquadronBossKill());
    const bonusEvent = await waitForHarness(page, () => {
      const events = window.__galagaHarness__.recentEvents({ count: 25 });
      return events.find(e => e.type === 'special_attack_bonus') || null;
    }, 1200, 50);
    return { squad, bonusEvent };
  });

  const { boss, escorts } = result.squad;
  if(!boss || escorts.length !== 2){
    fail('expected one boss and two escorts in the squadron test', result);
  }
  const offsets = escorts.map(e => +(e.x - boss.x).toFixed(2)).sort((a, b) => a - b);
  const lifts = escorts.map(e => +(boss.y - e.y).toFixed(2));
  if(Math.abs(offsets[0] + 42) > 2 || Math.abs(offsets[1] - 42) > 2){
    fail('escort spacing drifted away from the tightened Stage 4 layout', { offsets, result });
  }
  if(lifts.some(v => Math.abs(v - 20) > 2)){
    fail('escort vertical lift drifted away from the tightened Stage 4 layout', { lifts, result });
  }
  if(result.bonusEvent.bonus !== 1600 || result.bonusEvent.escorts !== 2){
    fail('special attack bonus did not preserve the full-escort 1600-point branch', result);
  }

  console.log(JSON.stringify({
    ok: true,
    offsets,
    lifts,
    bonusEvent: result.bonusEvent
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
