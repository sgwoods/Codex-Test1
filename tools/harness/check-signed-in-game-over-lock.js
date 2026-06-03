#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 1, ships: 1, seed: 48127 }, async ({ page }) => {
    return page.evaluate(() => {
      window.__galagaHarness__.setupUnsignedTopScoreTest();
      window.__galagaHarness__.triggerRemoteScoreGameOver({
        score: 1890,
        stage: 1,
        reserveLives: 0,
        shots: 12,
        hits: 7
      });
      const unsignedTopTen = window.__galagaHarness__.gameOverView();
      window.__galagaHarness__.showGameOverScoreboard();
      const unsignedScoreboardHtml = document.getElementById('msg')?.innerHTML || '';
      window.__galagaHarness__.setupRemoteScoreSubmitTest({
        userId: 'pilot-ste',
        email: 'steven@stevenwoods.com',
        initials: 'STE'
      });
      window.__galagaHarness__.triggerRemoteScoreGameOver({
        score: 1790,
        stage: 1,
        reserveLives: 0,
        shots: 12,
        hits: 7
      });
      return {
        unsignedTopTen,
        unsignedScoreboardHtml,
        gameOver: window.__galagaHarness__.gameOverView(),
        accountSummary: document.getElementById('accountSummary')?.textContent?.trim() || '',
        hudPilot: document.getElementById('hud')?.textContent?.replace(/\s+/g, ' ').trim() || '',
        scoreText: document.getElementById('msg')?.textContent?.replace(/\s+/g, ' ').trim() || ''
      };
    });
  });

  if(result.gameOver.editing){
    fail('signed-in pilot still entered initials-edit mode at game over', result);
  }
  if(result.gameOver.initials !== 'STE'){
    fail('signed-in pilot did not carry the locked pilot ID into game over', result);
  }
  if(/ENTER INITIALS/i.test(result.gameOver.html)){
    fail('game-over screen still rendered initials entry for a signed-in pilot', result);
  }
  if(!/001790/.test(result.gameOver.html)){
    fail('game-over screen did not preserve the signed-in pilot score in the results view', result);
  }
  if(!result.unsignedTopTen.topScoreSigninPrompt){
    fail('unsigned top-10 score did not set the sign-in prompt flag', result);
  }
  if(result.unsignedTopTen.topScoreVideoPosting?.canPostVideo){
    fail('unsigned top-10 score should not be eligible for video posting', result);
  }
  if(!/Top-10 .* run saved locally\./i.test(result.unsignedScoreboardHtml) || !/Sign in to post the replay/i.test(result.unsignedScoreboardHtml)){
    fail('unsigned top-10 score did not render the sign-in reminder on the score table', result);
  }
  if(result.gameOver.topScoreSigninPrompt){
    fail('signed-in pilot should not see the top-score sign-in prompt', result);
  }
  if(!result.gameOver.topScoreVideoPosting?.canPostVideo){
    fail('signed-in pilot top-10 score should be eligible for future video posting', result);
  }

  console.log(JSON.stringify({
    ok: true,
    unsignedTopTen: result.unsignedTopTen,
    gameOver: result.gameOver,
    scoreText: result.scoreText
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
