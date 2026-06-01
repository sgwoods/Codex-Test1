#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

const PLAYER_TWO_PERSONAS = ['novice', 'advanced', 'expert', 'professional'];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function checkPersonaLaneIsolation(persona, index){
  const p1Points = 100 + (index * 20);
  const p2Points = 25 + (index * 10);
  return withHarnessPage({ skipStart: true, seed: 77220 + index }, async ({ page }) => page.evaluate(({ persona, p1Points, p2Points, seed }) => {
    window.__galagaHarness__.showFrontDoor();
    window.__galagaHarness__.setupPlayerTwoModeTest({
      signedIn: true,
      initials: 'SGW',
      email: 'pilot@example.com'
    });
    window.__galagaHarness__.setPlayerTwoMode({ enabled: true, persona });
    window.__galagaHarness__.start({
      autoVideo: false,
      controlledClock: true,
      seed,
      playerTwo: true,
      playerTwoPersona: persona
    });
    window.__galagaHarness__.advanceFor(0);
    const launch = window.__galagaHarness__.playerTwoState();
    window.__galagaHarness__.awardScore({ points: p1Points });
    window.__galagaHarness__.advanceFor(0.05);
    const afterP1Award = window.__galagaHarness__.playerTwoState();
    window.__galagaHarness__.triggerShipLoss({ reserveLives: 2, cause: `harness_${persona}_p1_loss` });
    window.__galagaHarness__.advanceFor(1.55);
    const p2Turn = window.__galagaHarness__.state();
    window.__galagaHarness__.awardScore({ points: p2Points });
    window.__galagaHarness__.advanceFor(0.05);
    const afterP2Award = window.__galagaHarness__.playerTwoState();
    const scoreEvents = window.__galagaHarness__.sessionEvents(800)
      .filter(event => event.type === 'score_awarded')
      .map(event => ({
        owner: event.owner,
        points: event.points,
        before: event.before,
        after: event.after,
        activeTurn: event.activeTurn,
        playerTwoMode: !!event.playerTwoMode
      }));
    return { persona, p1Points, p2Points, launch, afterP1Award, p2Turn, afterP2Award, scoreEvents };
  }, { persona, p1Points, p2Points, seed: 77220 + index }));
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
    const humanAward = window.__galagaHarness__.awardScore({ points: 1000 });
    window.__galagaHarness__.advanceFor(0.05);
    const afterHumanAward = window.__galagaHarness__.playerTwoState();
    const humanLifeLoss = window.__galagaHarness__.triggerShipLoss({ reserveLives: 2, cause: 'harness_1up_life_loss' });
    const afterHumanLifeLoss = window.__galagaHarness__.playerTwoState().run;
    window.__galagaHarness__.advanceFor(1.55);
    const p2Turn = window.__galagaHarness__.state();
    const p2TurnHud = window.__galagaHarness__.playerTwoState().hudRight;
    const p2ScoreAward = window.__galagaHarness__.awardScore({ points: 250 });
    window.__galagaHarness__.advanceFor(0.05);
    const p2ScoreIsolation = window.__galagaHarness__.playerTwoState();
    const p2PilotCard = {
      dock: document.getElementById('accountDockBtn')?.textContent || '',
      mode: document.getElementById('accountDockBtn')?.dataset?.pilotMode || '',
      summary: document.getElementById('accountSummary')?.textContent || ''
    };
    const p2LifeLoss = window.__galagaHarness__.triggerShipLoss({ reserveLives: 2, cause: 'harness_2up_life_loss' });
    const afterP2LifeLoss = window.__galagaHarness__.playerTwoState().run;
    window.__galagaHarness__.advanceFor(1.55);
    const p1Return = window.__galagaHarness__.state();
    const p1ReturnHud = window.__galagaHarness__.playerTwoState();
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
      humanAward,
      afterHumanAward,
      humanLifeLoss,
      afterHumanLifeLoss,
      gameOver,
      p2Turn,
      p2TurnHud,
      p2ScoreAward,
      p2ScoreIsolation,
      p2PilotCard,
      p2LifeLoss,
      afterP2LifeLoss,
      p1Return,
      p1ReturnHud,
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
  if(signed.afterWatchScopePicker?.watchScope !== 'challenges' || !/CHALLENGE TOUR/.test(signed.afterWatchScopePicker?.html || '') || !/CHALLENGING STAGES ONLY/.test(signed.afterWatchScopePicker?.html || '')){
    fail('Watch scope selector should visibly switch from full game flow to challenges-only from the front door', signed);
  }
  if((signed.p2.score | 0) !== 0 || signed.p2.activeTurn !== 'p1' || signed.p2.turnModel !== 'galaga-per-life-alternation'){
    fail('Player Two score must stay separate at 0 during the human 1UP turn, with per-life alternation armed', signed);
  }
  if(!/2UP\s+000000/.test(signed.hudRight || '')){
    fail('human 1UP turn should keep the 2UP lane score visible in the arcade HUD', signed);
  }
  if(signed.launchPilotCard?.mode !== 'human-with-rival' || !/1UP PILOT/.test(signed.launchPilotCard?.dock || '') || !/SGW/.test(signed.launchPilotCard?.dock || '')){
    fail('pilot card should show the human as onboard while a 2UP rival is queued', signed);
  }
  if(signed.afterHumanLifeLoss?.activeTurn !== 'p1' || signed.afterHumanLifeLoss?.pendingTurnSwitch?.to !== 'p2'){
    fail('1UP ship loss should queue the selected 2UP persona as the next life-turn', signed);
  }
  if((signed.afterHumanLifeLoss?.humanScore | 0) !== 1000 || !/1UP\s+001000/.test(signed.afterHumanAward?.hudLeft || '')){
    fail('1UP score should be visible and preserved before handing off to 2UP', signed);
  }
  if(!signed.p2Turn.playerTwo?.enabled || signed.p2Turn.playerTwo?.activeTurn !== 'p2' || signed.p2Turn.harnessPersona !== 'professional'){
    fail('per-life alternation should hand active play to the selected persona after 1UP loses a ship', signed);
  }
  if((signed.p2Turn.playerTwo?.humanScore | 0) !== 1000 || (signed.p2Turn.playerTwo?.score | 0) !== 0){
    fail('2UP turn should start with a separate persona score while preserving the frozen 1UP score', signed);
  }
  if(!Number.isFinite(+signed.p2Turn.playerTwo?.p1?.boardStageClock) || +signed.p2Turn.playerTwo.p1.boardStageClock < 2 || (signed.p2Turn.playerTwo.p1.boardEnemies | 0) <= 0){
    fail('handing off to 2UP should preserve a non-empty 1UP mid-stage board snapshot for later resume', signed);
  }
  if(!/2UP PLAY/.test(signed.p2TurnHud || '')){
    fail('active 2UP persona turn should be visible in the HUD as the playing lane', signed);
  }
  if((signed.p2ScoreIsolation?.run?.humanScore | 0) !== 1000 || (signed.p2ScoreIsolation?.run?.score | 0) !== 250 || !/1UP\s+001000/.test(signed.p2ScoreIsolation?.hudLeft || '') || !/2UP PLAY\s+000250/.test(signed.p2ScoreIsolation?.hudRight || '')){
    fail('2UP persona scoring must not increment the visible or stored 1UP score', signed);
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
  if(+signed.p1Return.stageClock < 2 || !Number.isFinite(+signed.p1Return.playerTwo?.p2?.boardStageClock) || +signed.p1Return.playerTwo.p2.boardStageClock < .1 || (signed.p1Return.playerTwo.p2.boardEnemies | 0) <= 0){
    fail('returning to 1UP should restore the preserved human board and preserve the 2UP board for its next life', signed);
  }
  if(!/1UP\s+001000/.test(signed.p1ReturnHud?.hudLeft || '') || !/2UP\s+000250/.test(signed.p1ReturnHud?.hudRight || '')){
    fail('returning to 1UP should show frozen 1UP and 2UP lane scores side by side in the arcade HUD', signed);
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

  const personaSweep = [];
  let previousRescueBias = -1;
  let previousUnsafePenalty = -1;
  for(let i = 0; i < PLAYER_TWO_PERSONAS.length; i++){
    const persona = PLAYER_TWO_PERSONAS[i];
    const result = await checkPersonaLaneIsolation(persona, i);
    const run = result.afterP2Award?.run || {};
    const policy = result.launch?.selection?.personaPolicy || {};
    const p1Event = result.scoreEvents.find(event => event.owner === 'p1' && (event.points | 0) === result.p1Points);
    const p2Event = result.scoreEvents.find(event => event.owner === 'p2' && (event.points | 0) === result.p2Points);
    if(result.launch?.run?.personaKey !== persona){
      fail(`2UP persona sweep started the wrong persona for ${persona}`, result);
    }
    if(policy.key !== persona || !policy.captureRescueStyle){
      fail(`2UP persona sweep is missing capture/rescue policy metadata for ${persona}`, result);
    }
    if((policy.captureRescueBias | 0) <= previousRescueBias || (policy.captureRescueUnsafePenalty | 0) <= previousUnsafePenalty){
      fail(`2UP persona capture/rescue policy should become more rescue-aware and risk-sensitive from beginner to professional`, {
        persona,
        policy,
        previousRescueBias,
        previousUnsafePenalty,
        result
      });
    }
    previousRescueBias = policy.captureRescueBias | 0;
    previousUnsafePenalty = policy.captureRescueUnsafePenalty | 0;
    if((result.afterP1Award?.run?.humanScore | 0) !== result.p1Points || (result.afterP1Award?.run?.score | 0) !== 0){
      fail(`2UP persona sweep failed to keep ${persona} persona score at zero during 1UP scoring`, result);
    }
    if(result.p2Turn?.harnessPersona !== persona || result.p2Turn?.playerTwo?.activeTurn !== 'p2'){
      fail(`2UP persona sweep failed to hand active play to ${persona}`, result);
    }
    if((run.humanScore | 0) !== result.p1Points || (run.score | 0) !== result.p2Points){
      fail(`2UP persona sweep failed score isolation for ${persona}`, result);
    }
    if(!/1UP\s+\d{6}/.test(result.afterP2Award?.hudLeft || '') || !/2UP PLAY\s+\d{6}/.test(result.afterP2Award?.hudRight || '')){
      fail(`2UP persona sweep failed to keep both lane scores visible for ${persona}`, result);
    }
    if(!p1Event || !p2Event){
      fail(`2UP persona sweep failed to log score ownership events for ${persona}`, result);
    }
    personaSweep.push({
      persona,
      humanScore: run.humanScore | 0,
      playerTwoScore: run.score | 0,
      captureRescueStyle: policy.captureRescueStyle,
      captureRescueBias: policy.captureRescueBias,
      captureRescueUnsafePenalty: policy.captureRescueUnsafePenalty,
      scoreOwners: result.scoreEvents.map(event => `${event.owner}:${event.points}`)
    });
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
  if(challengeWatch.pilotCard?.mode !== 'watch' || !/Challenging Stage tour/i.test(challengeWatch.pilotCard?.summary || '')){
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
    personaSweep,
    challengeWatch: {
      startStage: challengeWatch.start.stage,
      nextStage: challengeWatch.afterClear.stage,
      scope: challengeWatch.afterClear.watchScope
    }
  }, null, 2));
}

main().catch(err => fail(err.message || String(err), { stack: err.stack }));
