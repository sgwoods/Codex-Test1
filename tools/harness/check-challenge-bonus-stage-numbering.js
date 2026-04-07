#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function readStagePresentation(cfg){
  return withHarnessPage(cfg, async ({ page }) => {
    return page.evaluate(() => {
      const snap = window.__galagaHarness__.snapshot();
      return { stage: snap.stage || 1, challenge: !!snap.challenge, banner: window.__galagaHarness__.bannerState() };
    });
  });
}

async function main(){
  const challengeStage = await readStagePresentation({ stage: 3, ships: 3, challenge: false, seed: 9161 });
  const nextCombatStage = await readStagePresentation({ stage: 4, ships: 3, challenge: false, seed: 9162 });
  const challengeGameOver = await withHarnessPage({ stage: 3, ships: 1, challenge: false, seed: 9163 }, async ({ page }) => {
    return page.evaluate(() => {
      const loss = window.__galagaHarness__.triggerShipLoss({
        reserveLives: 0,
        cause: 'harness_challenge_bonus_stage_numbering'
      });
      const view = window.__galagaHarness__.gameOverView();
      return { loss, view };
    });
  });

  if(!challengeStage.challenge) fail('expected stage 3 to resolve as a challenge stage for Aurora cadence', challengeStage);
  if(challengeStage.banner?.bannerTxt !== 'CHALLENGING STAGE'){
    fail('challenge-stage banner title drifted away from the expected Galaga-style wording', challengeStage);
  }
  if(challengeStage.banner?.bannerSub !== 'BONUS STAGE'){
    fail('challenge-stage banner sub-label should mark the stage as bonus-only progression', challengeStage);
  }

  if(challengeGameOver.loss?.started) fail('challenge-stage ship loss should end the single-ship harness run', challengeGameOver);
  if(!challengeGameOver.view?.challenge) fail('challenge-stage game over should preserve challenge context in the results state', challengeGameOver);
  if(challengeGameOver.view?.shownStage !== 2){
    fail('challenge-stage results should report the visible combat stage number instead of consuming the next stage number', challengeGameOver);
  }
  if(!challengeGameOver.view?.html.includes('resultsValue">02<')){
    fail('challenge-stage results markup should show the numbered combat stage reached, not the challenge stage ordinal', challengeGameOver);
  }

  if(nextCombatStage.challenge) fail('expected stage 4 to resolve as a normal combat stage', nextCombatStage);
  if(nextCombatStage.banner?.bannerTxt !== 'STAGE 03'){
    fail('first combat stage after the first challenge should display as stage 03', nextCombatStage);
  }

  console.log(JSON.stringify({
    ok: true,
    challengeStage: {
      bannerTxt: challengeStage.banner?.bannerTxt || '',
      bannerSub: challengeStage.banner?.bannerSub || ''
    },
    challengeGameOver: {
      shownStage: challengeGameOver.view?.shownStage || 0,
      challenge: !!challengeGameOver.view?.challenge
    },
    nextCombatStage: {
      bannerTxt: nextCombatStage.banner?.bannerTxt || ''
    }
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
