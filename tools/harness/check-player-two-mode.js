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
    const blocked = window.__galagaHarness__.setPlayerTwoMode({ enabled: true, persona: 'expert' });
    window.__galagaHarness__.advanceFor(0);
    return Object.assign({}, blocked, {
      frontDoorHtml: document.getElementById('msg')?.innerHTML || ''
    });
  }));

  if(unsigned.selection?.selected){
    fail('unsigned pilots should not be able to enable Player Two persona mode', unsigned);
  }
  if(!/sign in/i.test(unsigned.accountNotice || '')){
    fail('blocked Player Two mode should explain that sign-in is required', unsigned);
  }
  if(!/SIGN IN REQUIRED/.test(unsigned.frontDoorHtml || '') || !/LOCKED UNTIL SIGN-IN/.test(unsigned.frontDoorHtml || '') || !/SCORE NOT RECORDED/.test(unsigned.frontDoorHtml || '')){
    fail('signed-out start screen should clearly show the locked 2UP lane while keeping Watch Mode available', unsigned);
  }

  const signed = await withHarnessPage({ skipStart: true, seed: 77103 }, async ({ page }) => page.evaluate(() => {
    window.__galagaHarness__.showFrontDoor();
    window.__galagaHarness__.setupPlayerTwoModeTest({
      signedIn: true,
      initials: 'SGW',
      email: 'pilot@example.com'
    });
    window.__galagaHarness__.setPlayerTwoMode({ enabled: true, persona: 'professional' });
    window.__galagaHarness__.advanceFor(0);
    const frontDoorHtml = document.getElementById('msg')?.innerHTML || '';
    window.__galagaHarness__.start({
      autoVideo: false,
      controlledClock: true,
      seed: 77103,
      playerTwo: true,
      playerTwoPersona: 'professional'
    });
    window.__galagaHarness__.advanceFor(0);
    const launch = window.__galagaHarness__.state();
    const p2 = launch.playerTwo || {};
    const hudRight = window.__galagaHarness__.playerTwoState().hudRight;
    window.__galagaHarness__.advanceFor(8);
    const live = window.__galagaHarness__.state();
    window.__galagaHarness__.triggerRemoteScoreGameOver({ score: 12340, stage: 2 });
    const gameOver = window.__galagaHarness__.gameOverView();
    const afterHumanP2 = window.__galagaHarness__.playerTwoState().run;
    window.__galagaHarness__.startPlayerTwoTurn();
    window.__galagaHarness__.advanceFor(12);
    const p2Turn = window.__galagaHarness__.state();
    const p2TurnHud = window.__galagaHarness__.playerTwoState().hudRight;
    window.__galagaHarness__.triggerRemoteScoreGameOver({ score: 43210, stage: 3 });
    const p2GameOver = window.__galagaHarness__.gameOverView();
    const board = JSON.parse(localStorage.getItem('auroraGalacticaTop10') || '[]');
    return {
      live,
      p2,
      frontDoorHtml,
      hudRight,
      gameOver,
      afterHumanP2,
      p2Turn,
      p2TurnHud,
      p2GameOver,
      board,
      boardScores: board.map(row => row.score)
    };
  }));

  if(!signed.p2.enabled || signed.p2.personaKey !== 'professional'){
    fail('signed Player Two mode should start a professional persona rival run', signed);
  }
  if(!/2 PLAYERS/.test(signed.frontDoorHtml || '') || !/PRO RIVAL/.test(signed.frontDoorHtml || '') || !/HUMAN SCORE ONLY/.test(signed.frontDoorHtml || '') || !/WATCH/.test(signed.frontDoorHtml || '') || !/SCORE NOT RECORDED/.test(signed.frontDoorHtml || '')){
    fail('signed-in start screen should make 2UP rival and Watch Mode meanings clear before launch', signed);
  }
  if((signed.p2.score | 0) !== 0 || signed.p2.activeTurn !== 'queued'){
    fail('Player Two score must stay queued at 0 during the human 1UP turn', signed);
  }
  if(!/2UP/.test(signed.hudRight || '')){
    fail('Player Two mode should render the arcade-style 2UP HUD lane', signed);
  }
  if(!/playerTwoResultReady/.test(signed.gameOver?.html || '') || !/playerTwoVersus/.test(signed.gameOver?.html || '') || !/2UP PRO/.test(signed.gameOver?.html || '') || !/START 2UP TURN/.test(signed.gameOver?.html || '') || !/HUMAN SCORE ONLY/.test(signed.gameOver?.html || '')){
    fail('game-over results should offer an arcade-style 2UP turn panel while preserving human-only leaderboard meaning', signed);
  }
  if(signed.afterHumanP2?.activeTurn !== 'ready' || (signed.afterHumanP2?.humanScore | 0) !== 12340){
    fail('human game over should queue the persona 2UP turn without starting it during 1UP', signed);
  }
  if(!signed.p2Turn.playerTwo?.enabled || signed.p2Turn.playerTwo?.activeTurn !== 'p2' || signed.p2Turn.harnessPersona !== 'professional'){
    fail('starting the 2UP turn should hand active play to the selected persona', signed);
  }
  if(!/2UP PLAY/.test(signed.p2TurnHud || '')){
    fail('active 2UP persona turn should be visible in the HUD as the playing lane', signed);
  }
  if(!signed.p2GameOver?.playerTwoMode || !/playerTwoResultFinal/.test(signed.p2GameOver?.html || '') || !/1UP SCORE IS THE ONLY SCOREBOARD ENTRY/.test(signed.p2GameOver?.html || '')){
    fail('2UP turn game over should show the final arcade comparison and explicit human-only score meaning', signed);
  }
  if(!signed.boardScores.includes(12340)){
    fail('human score should be recorded in the local top-10 board', signed);
  }
  if(signed.boardScores.includes(43210)){
    fail('Player Two persona turn score must not be recorded as a leaderboard score', signed);
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
