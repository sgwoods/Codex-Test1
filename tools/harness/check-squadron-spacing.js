#!/usr/bin/env node
const { withHarnessPage, sleep, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function runScenario(stage, seed){
  return withHarnessPage({ stage, ships: 5, challenge: false, seed }, async ({ page }) => {
    await page.evaluate(cfg => window.__galagaHarness__.setupSquadronBonusTest(cfg), { playerX: 140, stage });
    const squad = await page.evaluate(() => window.__galagaHarness__.squadronState());
    if(!squad) throw new Error('No squadron state returned');
    await page.evaluate(() => window.__galagaHarness__.triggerSquadronBossKill());
    const bonusEvent = await waitForHarness(page, () => {
      const events = window.__galagaHarness__.recentEvents({ count: 25 });
      return events.find(e => e.type === 'special_attack_bonus') || null;
    }, 1200, 50);
    return { squad, bonusEvent };
  });
}

function assertScenario(name, result, expectedOffset, expectedLift){
  const { boss, escorts } = result.squad;
  if(!boss || escorts.length !== 2){
    fail(`expected one boss and two escorts in the ${name} squadron test`, result);
  }
  const offsets = escorts.map(e => +(e.x - boss.x).toFixed(2)).sort((a, b) => a - b);
  const lifts = escorts.map(e => +(boss.y - e.y).toFixed(2));
  if(Math.abs(offsets[0] + expectedOffset) > 2 || Math.abs(offsets[1] - expectedOffset) > 2){
    fail(`${name} escort spacing drifted away from the tightened layout`, { offsets, expectedOffset, result });
  }
  if(lifts.some(v => Math.abs(v - expectedLift) > 2)){
    fail(`${name} escort vertical lift drifted away from the tightened layout`, { lifts, expectedLift, result });
  }
  if(result.bonusEvent.bonus !== 1600 || result.bonusEvent.escorts !== 2){
    fail(`${name} special attack bonus did not preserve the full-escort 1600-point branch`, result);
  }
  return { offsets, lifts, bonusEvent: result.bonusEvent };
}

async function main(){
  const stage4 = await runScenario(4, 9045);
  const later = await runScenario(5, 9046);
  const stage4Summary = assertScenario('stage4', stage4, 34, 18);
  const laterSummary = assertScenario('later', later, 36, 20);

  console.log(JSON.stringify({
    ok: true,
    stage4: stage4Summary,
    later: laterSummary
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
