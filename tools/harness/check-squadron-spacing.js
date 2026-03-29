#!/usr/bin/env node
const { withHarnessPage, sleep, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function runScenario(stage, seed){
  return withHarnessPage({ stage, ships: 5, challenge: false, seed }, async ({ page }) => {
    await page.evaluate(cfg => window.__galagaHarness__.setupSquadronBonusTest(cfg), {
      playerX: 140,
      stage,
      bossX: 132,
      vx: stage === 4 ? 34 : 38
    });
    const samples = [];
    for(let i=0;i<8;i++){
      const squad = await page.evaluate(() => window.__galagaHarness__.squadronState());
      if(squad) samples.push(squad);
      await sleep(80);
    }
    const squad = samples.at(-1);
    if(!squad) throw new Error('No squadron state returned');
    await page.evaluate(() => window.__galagaHarness__.triggerSquadronBossKill());
    const bonusEvent = await waitForHarness(page, () => {
      const events = window.__galagaHarness__.recentEvents({ count: 25 });
      return events.find(e => e.type === 'special_attack_bonus') || null;
    }, 1200, 50);
    return { squad, bonusEvent, samples };
  });
}

function assertScenario(name, result, expectedOffset, expectedLift){
  const { boss, escorts } = result.squad;
  if(!boss || escorts.length !== 2){
    fail(`expected one boss and two escorts in the ${name} squadron test`, result);
  }
  const offsets = escorts.map(e => +(e.x - boss.x).toFixed(2)).sort((a, b) => a - b);
  const lifts = escorts.map(e => +(boss.y - e.y).toFixed(2));
  const drift = result.samples.map(sample => {
    const sampleBoss = sample.boss;
    const sampleEscorts = sample.escorts.map(e => ({
      dx: +(e.x - sampleBoss.x).toFixed(2),
      dy: +(sampleBoss.y - e.y).toFixed(2)
    }));
    const dxError = Math.max(...sampleEscorts.map(e => Math.abs(Math.abs(e.dx) - expectedOffset)));
    const dyError = Math.max(...sampleEscorts.map(e => Math.abs(e.dy - expectedLift)));
    return {
      dxError: +dxError.toFixed(2),
      dyError: +dyError.toFixed(2)
    };
  });
  const maxDxError = Math.max(...drift.map(s => s.dxError));
  const maxDyError = Math.max(...drift.map(s => s.dyError));
  if(Math.abs(offsets[0] + expectedOffset) > 2 || Math.abs(offsets[1] - expectedOffset) > 2){
    fail(`${name} escort spacing drifted away from the tightened layout`, { offsets, expectedOffset, result });
  }
  const initialLifts = result.samples[0].escorts.map(e => +(result.samples[0].boss.y - e.y).toFixed(2));
  if(initialLifts.some(v => Math.abs(v - expectedLift) > 1)){
    fail(`${name} escort vertical lift was not initialized to the expected formation`, {
      initialLifts,
      expectedLift,
      result
    });
  }
  if(maxDxError > 4.5){
    fail(`${name} escort spacing became too loose while the squadron was moving`, {
      maxDxError,
      expectedOffset,
      drift,
      result
    });
  }
  if(maxDyError > 5){
    fail(`${name} escort vertical cohesion became too loose while the squadron was moving`, {
      maxDyError,
      expectedLift,
      drift,
      result
    });
  }
  if(result.bonusEvent.bonus !== 1600 || result.bonusEvent.escorts !== 2){
    fail(`${name} special attack bonus did not preserve the full-escort 1600-point branch`, result);
  }
  return { offsets, lifts, maxDxError, maxDyError, bonusEvent: result.bonusEvent };
}

async function main(){
  const stage4 = await runScenario(4, 9045);
  const later = await runScenario(5, 9046);
  const stage4Summary = assertScenario('stage4', stage4, 28, 16);
  const laterSummary = assertScenario('later', later, 30, 18);

  console.log(JSON.stringify({
    ok: true,
    stage4: stage4Summary,
    later: laterSummary
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
