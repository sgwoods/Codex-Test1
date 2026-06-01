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
    document.querySelector('[data-player-two-persona="prev"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
    window.__galagaHarness__.advanceFor(0);
    const afterRivalPicker = {
      state: window.__galagaHarness__.playerTwoState().selection,
      html: document.getElementById('msg')?.innerHTML || ''
    };
    document.querySelector('[data-watch-persona="next"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
    window.__galagaHarness__.advanceFor(0);
    const afterWatchPicker = {
      state: window.__galagaHarness__.playerTwoState().selection,
      watchScope: window.__galagaHarness__.playerTwoState().watchScope,
      html: document.getElementById('msg')?.innerHTML || ''
    };
    document.querySelector('[data-watch-scope="next"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
    window.__galagaHarness__.advanceFor(0);
    const afterWatchScopePicker = {
      state: window.__galagaHarness__.playerTwoState().selection,
      watchScope: window.__galagaHarness__.playerTwoState().watchScope,
      html: document.getElementById('msg')?.innerHTML || ''
    };
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
    const launchPilotCard = {
      dock: document.getElementById('accountDockBtn')?.textContent || '',
      mode: document.getElementById('accountDockBtn')?.dataset?.pilotMode || '',
      summary: document.getElementById('accountSummary')?.textContent || ''
    };
    window.__galagaHarness__.advanceFor(2);
    const live = window.__galagaHarness__.state();
    const humanLifeLoss = window.__galagaHarness__.triggerShipLoss({ reserveLives: 2, cause: 'harness_1up_life_loss' });
    const afterHumanLifeLoss = window.__galagaHarness__.playerTwoState().run;
    window.__galagaHarness__.advanceFor(1.55);
    const p2Turn = window.__galagaHarness__.state();
    const p2TurnHud = window.__galagaHarness__.playerTwoState().hudRight;
    const p2PilotCard = {
      dock: document.getElementById('accountDockBtn')?.textContent || '',
      mode: document.getElementById('accountDockBtn')?.dataset?.pilotMode || '',
      summary: document.getElementById('accountSummary')?.textContent || ''
    };
    const p2LifeLoss = window.__galagaHarness__.triggerShipLoss({ reserveLives: 2, cause: 'harness_2up_life_loss' });
    const afterP2LifeLoss = window.__galagaHarness__.playerTwoState().run;
    window.__galagaHarness__.advanceFor(1.55);
    const p1Return = window.__galagaHarness__.state();
    window.__galagaHarness__.triggerRemoteScoreGameOver({ score: 12340, stage: 2 });
    const gameOver = window.__galagaHarness__.gameOverView();
    const board = JSON.parse(localStorage.getItem('auroraGalacticaTop10') || '[]');
    return {
      live,
      p2,
      frontDoorHtml,
      afterRivalPicker,
      afterWatchPicker,
      afterWatchScopePicker,
      hudRight,
      launchPilotCard,
      humanLifeLoss,
      afterHumanLifeLoss,
      gameOver,
      p2Turn,
      p2TurnHud,
      p2PilotCard,
      p2LifeLoss,
      afterP2LifeLoss,
      p1Return,
      board,
      boardScores: board.map(row => row.score)
    };
  }));

  if(!signed.p2.enabled || signed.p2.personaKey !== 'professional'){
    fail('signed Player Two mode should start a professional persona rival run', signed);
  }
  if(!/2 PLAYERS/.test(signed.frontDoorHtml || '') || !/PRO RIVAL/.test(signed.frontDoorHtml || '') || !/RIVAL/.test(signed.frontDoorHtml || '') || !/PILOT/.test(signed.frontDoorHtml || '') || !/HUMAN SCORE ONLY/.test(signed.frontDoorHtml || '') || !/WATCH/.test(signed.frontDoorHtml || '') || !/SCORE NOT RECORDED/.test(signed.frontDoorHtml || '')){
    fail('signed-in start screen should make 2UP rival and Watch Mode meanings clear before launch', signed);
  }
  if(signed.afterRivalPicker?.state?.personaKey !== 'expert' || !/EXPERT/.test(signed.afterRivalPicker?.html || '')){
    fail('2UP Rival pilot selector should visibly cycle the role before launch', signed);
  }
  if(!/WATCH/.test(signed.afterWatchPicker?.html || '') || !/EXPERT/.test(signed.afterWatchPicker?.html || '') || !/GAME FLOW/.test(signed.afterWatchPicker?.html || '') || signed.afterWatchPicker?.state?.personaKey !== 'expert' || signed.afterWatchPicker?.watchScope !== 'game'){
    fail('Watch pilot selector should visibly cycle the watched role without launching a run', signed);
  }
  if(signed.afterWatchScopePicker?.watchScope !== 'challenges' || !/CHALLENGES ONLY/.test(signed.afterWatchScopePicker?.html || '')){
    fail('Watch scope selector should visibly switch from full game flow to challenges-only from the front door', signed);
  }
  if((signed.p2.score | 0) !== 0 || signed.p2.activeTurn !== 'p1' || signed.p2.turnModel !== 'galaga-per-life-alternation'){
    fail('Player Two score must stay separate at 0 during the human 1UP turn, with per-life alternation armed', signed);
  }
  if(!/PILOT/.test(signed.hudRight || '') || !/SGW/.test(signed.hudRight || '')){
    fail('human 1UP turn should keep the current onboard pilot visible in the HUD while 2UP is queued', signed);
  }
  if(signed.launchPilotCard?.mode !== 'human-with-rival' || !/1UP PILOT/.test(signed.launchPilotCard?.dock || '') || !/SGW/.test(signed.launchPilotCard?.dock || '')){
    fail('pilot card should show the human as onboard while a 2UP rival is queued', signed);
  }
  if(signed.afterHumanLifeLoss?.activeTurn !== 'p1' || signed.afterHumanLifeLoss?.pendingTurnSwitch?.to !== 'p2'){
    fail('1UP ship loss should queue the selected 2UP persona as the next life-turn', signed);
  }
  if(!signed.p2Turn.playerTwo?.enabled || signed.p2Turn.playerTwo?.activeTurn !== 'p2' || signed.p2Turn.harnessPersona !== 'professional'){
    fail('per-life alternation should hand active play to the selected persona after 1UP loses a ship', signed);
  }
  if(!/2UP PLAY/.test(signed.p2TurnHud || '')){
    fail('active 2UP persona turn should be visible in the HUD as the playing lane', signed);
  }
  if(signed.p2PilotCard?.mode !== 'player-two-active' || !/2UP PLAY/.test(signed.p2PilotCard?.dock || '') || !/PROFESSIONAL/.test(signed.p2PilotCard?.dock || '') || !/comparison-only/.test(signed.p2PilotCard?.summary || '')){
    fail('pilot card should show the persona rival onboard during the active 2UP turn', signed);
  }
  if(signed.afterP2LifeLoss?.activeTurn !== 'p2' || signed.afterP2LifeLoss?.pendingTurnSwitch?.to !== 'p1'){
    fail('2UP ship loss should queue 1UP as the next life-turn when the human still has ships', signed);
  }
  if(!signed.p1Return?.playerTwo?.enabled || signed.p1Return?.playerTwo?.activeTurn !== 'p1' || signed.p1Return?.harnessPersona){
    fail('per-life alternation should return from the persona lane to human 1UP after 2UP loses a ship', signed);
  }
  if(!/playerTwoResultFinal/.test(signed.gameOver?.html || '') || !/ARCADE PER-LIFE ALTERNATION/.test(signed.gameOver?.html || '') || !/1UP SCORE IS THE ONLY SCOREBOARD ENTRY/.test(signed.gameOver?.html || '')){
    fail('final 2UP results should show arcade per-life comparison and explicit human-only score meaning', signed);
  }
  if(!signed.boardScores.includes(12340)){
    fail('human score should be recorded in the local top-10 board', signed);
  }
  if(signed.board.some(row => row.initials === 'PRO')){
    fail('Player Two persona score must not be recorded as a leaderboard score', signed);
  }

  const autoTurn = await withHarnessPage({ skipStart: true, seed: 77106 }, async ({ page }) => {
    return page.evaluate(() => {
      window.__galagaHarness__.showFrontDoor();
      window.__galagaHarness__.setupPlayerTwoModeTest({
        signedIn: true,
        initials: 'SGW',
        email: 'pilot@example.com'
      });
      window.__galagaHarness__.setPlayerTwoMode({ enabled: true, persona: 'novice' });
      window.__galagaHarness__.start({
        autoVideo: false,
        controlledClock: true,
        seed: 77106,
        playerTwo: true,
        playerTwoPersona: 'novice'
      });
      window.__galagaHarness__.advanceFor(0);
      window.__galagaHarness__.triggerShipLoss({ reserveLives: 2, cause: 'harness_auto_life_loss' });
      const ready = { p2: window.__galagaHarness__.playerTwoState().run };
      window.__galagaHarness__.advanceFor(1.55);
      const after = {
        state: window.__galagaHarness__.state(),
        p2: window.__galagaHarness__.playerTwoState().run,
        events: window.__galagaHarness__.sessionEvents(500)
          .filter(event => /^player_two_/.test(event.type))
          .map(event => event.type)
      };
      return { ready, after };
    });
  });

  if(autoTurn.ready?.p2?.pendingTurnSwitch?.to !== 'p2'){
    fail('2UP mode should visibly queue the persona rival for automatic per-life alternation after 1UP loses a ship', autoTurn);
  }
  if(!autoTurn.after?.state?.started || autoTurn.after?.state?.playerTwo?.activeTurn !== 'p2' || autoTurn.after?.state?.harnessPersona !== 'novice'){
    fail('2UP mode should automatically hand active play to the selected persona after the 1UP life loss', autoTurn);
  }
  if(!autoTurn.after?.events?.includes('player_two_turn_active')){
    fail('2UP per-life automatic handoff should be logged for production behavior review', autoTurn);
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
    const pilotCard = {
      dock: document.getElementById('accountDockBtn')?.textContent || '',
      mode: document.getElementById('accountDockBtn')?.dataset?.pilotMode || '',
      summary: document.getElementById('accountSummary')?.textContent || '',
      hudRight: window.__galagaHarness__.playerTwoState().hudRight
    };
    window.__galagaHarness__.triggerRemoteScoreGameOver({ score: 55550, stage: 3 });
    const gameOver = window.__galagaHarness__.gameOverView();
    const board = JSON.parse(localStorage.getItem('auroraGalacticaTop10') || '[]');
    return {
      live,
      pilotCard,
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
  if(watch.pilotCard?.mode !== 'watch' || !/WATCH/.test(watch.pilotCard?.dock || '') || !/PROFESSIONAL/.test(watch.pilotCard?.dock || '') || !/not eligible/.test(watch.pilotCard?.summary || '') || !/WATCH/.test(watch.pilotCard?.hudRight || '')){
    fail('Watch Mode should show the persona as the pilot onboard and score-ineligible in the pilot card', watch);
  }
  if(!watch.gameOver?.watchMode || !/WATCH MODE/.test(watch.gameOver?.html || '') || !/SCORE NOT RECORDED/.test(watch.gameOver?.html || '')){
    fail('Watch Mode game over should clearly mark the run as non-recorded', watch);
  }
  if(watch.boardScores.includes(55550)){
    fail('Watch Mode score must not be recorded in the local top-10 board', watch);
  }

  const challengeWatch = await withHarnessPage({ skipStart: true, seed: 77105 }, async ({ page }) => page.evaluate(() => {
    window.__galagaHarness__.showFrontDoor();
    window.__galagaHarness__.setTest({
      stage: 1,
      startKind: 'level',
      challengeStage: 1,
      ships: 3,
      expertPlays: 'human'
    });
    window.__galagaHarness__.startWatchMode({
      persona: 'professional',
      scope: 'challenges',
      seed: 77105
    });
    window.__galagaHarness__.advanceFor(0);
    const start = window.__galagaHarness__.state();
    const pilotCard = {
      dock: document.getElementById('accountDockBtn')?.textContent || '',
      mode: document.getElementById('accountDockBtn')?.dataset?.pilotMode || '',
      summary: document.getElementById('accountSummary')?.textContent || ''
    };
    window.__galagaHarness__.forcePerfectChallengeClear();
    window.__galagaHarness__.advanceFor(16.5);
    const afterClear = window.__galagaHarness__.state();
    const events = window.__galagaHarness__.sessionEvents(500);
    const transition = events.find(event => event.type === 'challenge_transition_queued') || null;
    return { start, pilotCard, afterClear, transition };
  }));

  if(!challengeWatch.start?.watchMode || challengeWatch.start?.watchScope !== 'challenges' || !challengeWatch.start?.challenge || challengeWatch.start?.stage !== 3){
    fail('front-door Watch Mode challenges-only scope should start at the configured first challenging stage', challengeWatch);
  }
  if(challengeWatch.pilotCard?.mode !== 'watch' || !/challenges-only/i.test(challengeWatch.pilotCard?.summary || '')){
    fail('pilot card should describe challenges-only Watch Mode as a challenge-stage tour', challengeWatch);
  }
  const challengeTourAdvanced = challengeWatch.transition?.pendingStage === 7 && challengeWatch.transition?.watchScope === 'challenges'
    || challengeWatch.afterClear?.stage === 7 && challengeWatch.afterClear?.watchScope === 'challenges';
  if(!challengeTourAdvanced){
    fail('challenges-only Watch Mode should queue the next challenging stage after a clear instead of returning to regular gameplay', challengeWatch);
  }
  if(!challengeWatch.afterClear?.challenge || challengeWatch.afterClear?.stage !== 7){
    fail('challenges-only Watch Mode should advance into the next challenging stage during the tour', challengeWatch);
  }

  console.log(JSON.stringify({
    ok: true,
    unsigned: unsigned.selection,
    signed: {
      persona: signed.p2.personaKey,
      playerTwoScore: signed.p2.score,
      playerTwoStage: signed.p2.stage,
      turnModel: signed.p2.turnModel,
      p1Return: signed.p1Return.playerTwo.activeTurn,
      humanScoreRecorded: 12340
    },
    autoTurn: {
      persona: autoTurn.after.state.harnessPersona,
      activeTurn: autoTurn.after.state.playerTwo.activeTurn,
      queuedTo: autoTurn.ready.p2.pendingTurnSwitch?.to || ''
    },
    watch: {
      persona: watch.live.harnessPersona,
      score: watch.live.score,
      recorded: watch.boardScores.includes(55550)
    },
    challengeWatch: {
      startStage: challengeWatch.start.stage,
      nextStage: challengeWatch.afterClear.stage,
      scope: challengeWatch.afterClear.watchScope
    }
  }, null, 2));
}

main().catch(err => fail(err.message || String(err), { stack: err.stack }));
