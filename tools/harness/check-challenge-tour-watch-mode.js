#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, seed: 77305 }, async ({ page }) => page.evaluate(() => {
    window.__galagaHarness__.showFrontDoor();
    window.__galagaHarness__.setTest({
      stage: 1,
      startKind: 'level',
      challengeStage: 1,
      ships: 3,
      expertPlays: 'human',
      watchPersona: 'professional',
      watchScope: 'challenges'
    });
    window.__galagaHarness__.advanceFor(0);
    document.querySelector('[data-watch-persona="next"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
    document.querySelector('[data-watch-persona="next"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
    document.querySelector('[data-watch-scope="next"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
    window.__galagaHarness__.advanceFor(0);
    const frontDoorHtml = document.getElementById('msg')?.innerHTML || '';
    window.__galagaHarness__.startWatchMode({
      persona: 'professional',
      scope: 'challenges',
      seed: 77305
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
    const events = window.__galagaHarness__.sessionEvents(800);
    return {
      frontDoorHtml,
      start,
      pilotCard,
      afterClear,
      transition: events.find(event => event.type === 'challenge_transition_queued') || null,
      shipLosses: events.filter(event => event.type === 'ship_lost'),
      challengeClears: events.filter(event => event.type === 'challenge_clear')
    };
  }));

  if(!/CHALLENGE TOUR/.test(result.frontDoorHtml || '') || !/CHALLENGING STAGES ONLY/.test(result.frontDoorHtml || '')){
    fail('Challenge-tour Watch Mode should be clearly labeled on the front door.', result);
  }
  if(!result.start?.watchMode || result.start?.watchScope !== 'challenges' || !result.start?.challenge || result.start?.stage !== 3){
    fail('Challenge-tour Watch Mode should start at Challenging Stage 3-4.', result);
  }
  if(result.pilotCard?.mode !== 'watch' || !/Challenging Stage tour/i.test(result.pilotCard?.summary || '')){
    fail('Pilot card should explain that challenges-only Watch Mode is a Challenging Stage tour.', result);
  }
  if(result.shipLosses.length){
    fail('Challenge-tour Watch Mode must not lose ships during challenging stages.', result);
  }
  if(!result.challengeClears.length){
    fail('Challenge-tour Watch Mode should record a challenge clear before advancing.', result);
  }
  const advanced = result.transition?.pendingStage === 7 && result.transition?.watchScope === 'challenges'
    || result.afterClear?.stage === 7 && result.afterClear?.watchScope === 'challenges';
  if(!advanced || !result.afterClear?.challenge){
    fail('Challenge-tour Watch Mode should advance directly to the next challenging stage.', result);
  }

  console.log(JSON.stringify({
    ok: true,
    startStage: result.start.stage,
    nextStage: result.afterClear.stage,
    scope: result.afterClear.watchScope,
    shipLosses: result.shipLosses.length,
    challengeClears: result.challengeClears.length
  }, null, 2));
}

main().catch(err => fail(err.message || String(err), { stack: err.stack }));
