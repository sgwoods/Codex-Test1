#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const unsigned = await withHarnessPage({ skipStart: true, seed: 77102 }, async ({ page }) => page.evaluate(() => {
    window.__galagaHarness__.showFrontDoor();
    window.__galagaHarness__.setupPlayerTwoModeTest({ signedIn: false });
    return window.__galagaHarness__.setPlayerTwoMode({ enabled: true, persona: 'expert' });
  }));

  if(unsigned.selection?.selected){
    fail('unsigned pilots should not be able to enable Player Two persona mode', unsigned);
  }
  if(!/sign in/i.test(unsigned.accountNotice || '')){
    fail('blocked Player Two mode should explain that sign-in is required', unsigned);
  }

  const signed = await withHarnessPage({ skipStart: true, seed: 77103 }, async ({ page }) => page.evaluate(() => {
    window.__galagaHarness__.showFrontDoor();
    window.__galagaHarness__.setupPlayerTwoModeTest({
      signedIn: true,
      initials: 'SGW',
      email: 'pilot@example.com'
    });
    window.__galagaHarness__.setPlayerTwoMode({ enabled: true, persona: 'professional' });
    window.__galagaHarness__.start({
      autoVideo: false,
      controlledClock: true,
      seed: 77103,
      playerTwo: true,
      playerTwoPersona: 'professional'
    });
    window.__galagaHarness__.advanceFor(18);
    const live = window.__galagaHarness__.state();
    const p2 = live.playerTwo || {};
    const hudRight = window.__galagaHarness__.playerTwoState().hudRight;
    window.__galagaHarness__.triggerRemoteScoreGameOver({ score: 12340, stage: 2 });
    const gameOver = window.__galagaHarness__.gameOverView();
    const board = JSON.parse(localStorage.getItem('auroraGalacticaTop10') || '[]');
    return {
      live,
      p2,
      hudRight,
      gameOver,
      board,
      boardScores: board.map(row => row.score)
    };
  }));

  if(!signed.p2.enabled || signed.p2.personaKey !== 'professional'){
    fail('signed Player Two mode should start a professional persona rival run', signed);
  }
  if((signed.p2.score | 0) !== 0 || signed.p2.activeTurn !== 'queued'){
    fail('Player Two score must stay queued at 0 during the human 1UP turn', signed);
  }
  if(!/2UP/.test(signed.hudRight || '')){
    fail('Player Two mode should render the arcade-style 2UP HUD lane', signed);
  }
  if(!/2UP PRO/.test(signed.gameOver?.html || '') || !/2UP HAS NOT PLAYED THIS TURN/.test(signed.gameOver?.html || '')){
    fail('game-over results should show the persona rival while preserving human-only leaderboard meaning', signed);
  }
  if(!signed.boardScores.includes(12340)){
    fail('human score should be recorded in the local top-10 board', signed);
  }
  if(signed.board.some(row => row.initials === 'PRO')){
    fail('Player Two persona score must not be recorded as a leaderboard score', signed);
  }

  const watch = await withHarnessPage({ skipStart: true, seed: 77104 }, async ({ page }) => page.evaluate(() => {
    window.__galagaHarness__.showFrontDoor();
    window.__galagaHarness__.setPlayerTwoMode({ enabled: false, persona: 'professional', silent: true });
    window.__galagaHarness__.startWatchMode({
      persona: 'professional',
      seed: 77104
    });
    window.__galagaHarness__.advanceFor(18);
    const live = window.__galagaHarness__.state();
    window.__galagaHarness__.triggerRemoteScoreGameOver({ score: 55550, stage: 3 });
    const gameOver = window.__galagaHarness__.gameOverView();
    const board = JSON.parse(localStorage.getItem('auroraGalacticaTop10') || '[]');
    return {
      live,
      gameOver,
      board,
      boardScores: board.map(row => row.score)
    };
  }));

  if(!watch.live.watchMode || watch.live.harnessPersona !== 'professional'){
    fail('Watch Mode should run the selected persona as the active pilot', watch);
  }
  if((watch.live.score | 0) <= 0){
    fail('Watch Mode persona should actively play and score during the watched run', watch);
  }
  if(!watch.gameOver?.watchMode || !/WATCH MODE/.test(watch.gameOver?.html || '') || !/SCORE NOT RECORDED/.test(watch.gameOver?.html || '')){
    fail('Watch Mode game over should clearly mark the run as non-recorded', watch);
  }
  if(watch.boardScores.includes(55550)){
    fail('Watch Mode score must not be recorded in the local top-10 board', watch);
  }

  console.log(JSON.stringify({
    ok: true,
    unsigned: unsigned.selection,
    signed: {
      persona: signed.p2.personaKey,
      playerTwoScore: signed.p2.score,
      playerTwoStage: signed.p2.stage,
      humanScoreRecorded: 12340
    },
    watch: {
      persona: watch.live.harnessPersona,
      score: watch.live.score,
      recorded: watch.boardScores.includes(55550)
    }
  }, null, 2));
}

main().catch(err => fail(err.message || String(err), { stack: err.stack }));
