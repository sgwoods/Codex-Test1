#!/usr/bin/env node
const { withHarnessPage, sleep } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

const CASES = [
  { stage: 30, seed: 36101, ships: 5, persona: 'professional' },
  { stage: 36, seed: 36102, ships: 5, persona: 'professional' },
  { stage: 42, seed: 36103, ships: 5, persona: 'professional' }
];

async function readRuntime(page){
  return page.evaluate(() => ({
    state: window.__galagaHarness__.state(),
    systemLog: typeof window.recentSystemLogEntries === 'function' ? window.recentSystemLogEntries(40) : []
  }));
}

async function waitForSimAdvance(page, minSimT, timeoutMs){
  const startedAt = Date.now();
  while(Date.now() - startedAt < timeoutMs){
    const runtime = await readRuntime(page);
    if((runtime.state?.simT || 0) >= minSimT) return runtime;
    if((runtime.systemLog || []).some(entry => entry.action === 'runtime_loop_crash')) return runtime;
    await sleep(200);
  }
  return readRuntime(page);
}

async function runCase(spec){
  return withHarnessPage({
    stage: spec.stage,
    ships: spec.ships,
    seed: spec.seed,
    persona: spec.persona
  }, async ({ page }) => {
    const preLoss = await waitForSimAdvance(page, 6, 12000);
    const beforeLossSimT = preLoss.state?.simT || 0;
    if((preLoss.systemLog || []).some(entry => entry.action === 'runtime_loop_crash')){
      return { spec, phase: 'pre_loss', preLoss };
    }

    const firstLoss = await page.evaluate(() => window.__galagaHarness__.triggerShipLoss({
      reserveLives: 3,
      cause: 'late_run_soak_first_loss'
    }));
    const afterFirst = await waitForSimAdvance(page, beforeLossSimT + 1.5, 6000);

    const secondPreSimT = afterFirst.state?.simT || 0;
    const secondLoss = await page.evaluate(() => window.__galagaHarness__.triggerShipLoss({
      reserveLives: 2,
      cause: 'late_run_soak_second_loss'
    }));
    const afterSecond = await waitForSimAdvance(page, secondPreSimT + 1.5, 6000);

    return {
      spec,
      firstLoss,
      secondLoss,
      preLoss,
      afterFirst,
      afterSecond
    };
  });
}

function crashEntry(runtime){
  return (runtime.systemLog || []).find(entry => entry.action === 'runtime_loop_crash') || null;
}

async function main(){
  const results = [];
  for(const spec of CASES){
    const result = await runCase(spec);
    results.push(result);

    const firstCrash = crashEntry(result.preLoss) || crashEntry(result.afterFirst) || crashEntry(result.afterSecond);
    if(firstCrash){
      fail('late-run soak recorded a runtime loop crash', { spec, crash: firstCrash, result });
    }
    if(!result.firstLoss.started || !result.secondLoss.started){
      fail('late-run soak unexpectedly ended the run immediately on forced ship loss', { spec, result });
    }
    if((result.afterFirst.state?.simT || 0) <= (result.preLoss.state?.simT || 0)){
      fail('late-run soak did not advance simulation after the first late-stage ship loss', { spec, result });
    }
    if((result.afterSecond.state?.simT || 0) <= (result.afterFirst.state?.simT || 0)){
      fail('late-run soak did not advance simulation after the second late-stage ship loss', { spec, result });
    }
    if(result.afterSecond.state?.paused){
      fail('late-run soak ended in a paused state after late-stage ship loss', { spec, result });
    }
  }

  console.log(JSON.stringify({
    ok: true,
    checked: results.map(result => ({
      stage: result.spec.stage,
      seed: result.spec.seed,
      persona: result.spec.persona,
      preLossSimT: result.preLoss.state?.simT || 0,
      afterFirstSimT: result.afterFirst.state?.simT || 0,
      afterSecondSimT: result.afterSecond.state?.simT || 0,
      livesAfterSecond: result.afterSecond.state?.lives || 0
    }))
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
