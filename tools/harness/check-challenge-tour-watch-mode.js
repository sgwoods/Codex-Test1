#!/usr/bin/env node
const { withHarnessPage, sleep } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function startChallengeTour(page, expertPlays = 'human'){
  await page.evaluate(({ expertPlays }) => {
    if(typeof installGamePack === 'function') installGamePack('aurora-galactica');
    window.__galagaHarness__.setTest({
      startKind: 'challenge-tour',
      expertPlays,
      challengeStage: 1,
      ships: 3
    });
    window.startActiveGamePack();
  }, { expertPlays });
  await sleep(120);
  return page.evaluate(() => window.__galagaHarness__.state());
}

async function clearCurrentChallenge(page){
  const forced = await page.evaluate(() => window.__galagaHarness__.forcePerfectChallengeClear());
  if(!forced) fail('challenge-tour test could not force-clear the current challenge');
  return page.evaluate(() => window.__galagaHarness__.advanceFor(0.1, {
    step: 1 / 60,
    stopOnGameOver: false
  }));
}

function advanceTourTransition(page){
  return page.evaluate(() => window.__galagaHarness__.advanceFor(22, {
    step: 1 / 60,
    stopOnGameOver: false
  }));
}

async function advanceUntil(page, predicate, maxSeconds, label){
  const steps = Math.ceil(maxSeconds);
  let state = await page.evaluate(() => window.__galagaHarness__.state());
  for(let i = 0; i < steps; i += 1){
    if(predicate(state)) return state;
    state = await page.evaluate(() => window.__galagaHarness__.advanceFor(1, {
      step: 1 / 60,
      stopOnGameOver: false
    }));
  }
  if(predicate(state)) return state;
  fail(`Timed out waiting for ${label}`, state);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, seed: 95131 }, async ({ page }) => {
    const started = await startChallengeTour(page, 'human');
    if(!started.started || !started.challenge || started.stage !== 3){
      fail('Challenge Tour should start at the first challenging-stage marker', started);
    }
    if(!started.watchMode || started.watchPersona !== 'professional' || started.harnessPersona !== 'professional'){
      fail('Challenge Tour should default Human Pilot to Professional watch mode', started);
    }
    if(!started.challengeTour || started.challengeTour.total < 8 || started.challengeTour.index !== 1){
      fail('Challenge Tour should expose ordered tour state', started);
    }

    const naturalFirstResult = await advanceUntil(
      page,
      state => (state.challengeTour?.results || []).length >= 1,
      42,
      'the first natural Professional challenge result'
    );
    const firstResult = naturalFirstResult.challengeTour.results[0];
    if(firstResult.stage !== 3 || firstResult.total !== 40 || firstResult.hits <= 0){
      fail('Challenge Tour should record the first naturally played challenge result', naturalFirstResult);
    }
    if(naturalFirstResult.challengeTour.index !== 2 || naturalFirstResult.challengeTour.done){
      fail('Challenge Tour should queue the second challenging stage after the first clear', naturalFirstResult);
    }

    const secondStage = await advanceUntil(
      page,
      state => state.started && state.challenge && state.stage === 7 && (state.challengeTour?.results || []).length === 1,
      24,
      'natural transition to Challenging Stage 6-7'
    );
    if(!secondStage.started || !secondStage.challenge || secondStage.stage !== 7){
      fail('Challenge Tour should advance from Challenging Stage 2-3 to Challenging Stage 6-7', secondStage);
    }
    if(secondStage.stage === 4 || !secondStage.challenge){
      fail('Challenge Tour must not fall back into regular Stage 4 after Challenging Stage 2-3', secondStage);
    }

    let state = secondStage;
    for(let i = 2; i <= 8; i += 1){
      state = await clearCurrentChallenge(page);
      state = await advanceTourTransition(page);
    }
    const finalView = await page.evaluate(() => window.__galagaHarness__.gameOverView());
    return { state, finalView };
  });

  if(result.state.started){
    fail('Challenge Tour should stop gameplay after the final challenge', result);
  }
  if(!/CHALLENGE TOUR COMPLETE/.test(result.finalView.html || '') || !/CHALLENGES/.test(result.finalView.html || '') || !/8\/8/.test(result.finalView.html || '') || !result.finalView.watchMode || result.finalView.editing){
    fail('Challenge Tour should finish as a watch-mode result that is not score-editable', result);
  }
  console.log(JSON.stringify({ ok: true, final: result.finalView }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
