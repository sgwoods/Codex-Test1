#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const manual = await withHarnessPage({ stage: 1, ships: 3, seed: 88331 }, async ({ page }) => page.evaluate(() => {
    const harness = window.__galagaHarness__;
    const defaultState = harness.commentatorState();
    const queued = harness.queueCommentator({
      key: 'harness',
      title: 'TACTICAL UPDATE',
      lines: ['Boss lane opening'],
      duration: 3.5
    });
    harness.advanceFor(2.2);
    const onText = document.getElementById('msg')?.innerText || document.getElementById('msg')?.textContent || '';
    const onState = harness.commentatorState();
    harness.setCommentatorEnabled(false);
    const disabledState = harness.commentatorState();
    const rejected = harness.queueCommentator({
      key: 'harness-off',
      title: 'SHOULD NOT SHOW',
      lines: ['Commentator disabled'],
      duration: 2
    });
    harness.advanceFor(.3);
    const offText = document.getElementById('msg')?.innerText || document.getElementById('msg')?.textContent || '';
    const events = harness.recentEvents({ count: 100 });
    return {
      defaultState,
      queued,
      onText: onText.replace(/\s+/g, ' ').trim(),
      onState,
      disabledState,
      rejected,
      offText: offText.replace(/\s+/g, ' ').trim(),
      settingEvents: events.filter(e => e.type === 'commentator_setting_changed'),
      callouts: events.filter(e => e.type === 'commentator_callout')
    };
  }));

  if(!manual.defaultState?.enabled){
    fail('Commentator should default on', manual);
  }
  if(!manual.queued){
    fail('enabled Commentator should accept a harness callout', manual);
  }
  if(!/TACTICAL UPDATE/.test(manual.onText) || !/Boss lane opening/.test(manual.onText)){
    fail('queued Commentator callout did not render through the message box', manual);
  }
  if(!manual.onState?.active || !manual.onState?.title){
    fail('Commentator state should report the active callout', manual);
  }
  if(manual.disabledState?.enabled){
    fail('Commentator harness toggle did not disable the feature', manual);
  }
  if(manual.rejected){
    fail('disabled Commentator should reject new callouts', manual);
  }
  if(/SHOULD NOT SHOW/.test(manual.offText)){
    fail('disabled Commentator callout leaked into the message box', manual);
  }
  if(!manual.settingEvents.some(e => e.enabled === false)){
    fail('Commentator setting change should be logged for production learning', manual);
  }
  if(!manual.callouts.some(e => e.key === 'harness' && /TACTICAL UPDATE/.test(e.title || ''))){
    fail('Commentator callout event should be logged with key and title', manual);
  }

  const watch = await withHarnessPage({ skipStart: true, seed: 88332 }, async ({ page }) => page.evaluate(() => {
    const harness = window.__galagaHarness__;
    harness.showFrontDoor();
    harness.startWatchMode({ persona: 'professional', seed: 88332 });
    harness.advanceFor(2.25);
    const text = document.getElementById('msg')?.innerText || document.getElementById('msg')?.textContent || '';
    const events = harness.recentEvents({ count: 200 });
    return {
      text: text.replace(/\s+/g, ' ').trim(),
      state: harness.commentatorState(),
      callouts: events.filter(e => e.type === 'commentator_callout')
    };
  }));

  if(!/WATCH MODE/.test(watch.text) || !/PROFESSIONAL/.test(watch.text)){
    fail('Watch Mode should surface a Commentator callout after the opening banner', watch);
  }
  if(!watch.callouts.some(e => e.key === 'watch_mode')){
    fail('Watch Mode should log the watch_mode Commentator callout', watch);
  }

  const playerTwo = await withHarnessPage({ skipStart: true, seed: 88333 }, async ({ page }) => page.evaluate(() => {
    const harness = window.__galagaHarness__;
    harness.showFrontDoor();
    harness.setupPlayerTwoModeTest({ signedIn: true, initials: 'SGW', email: 'pilot@example.com' });
    harness.setPlayerTwoMode({ enabled: true, persona: 'expert' });
    harness.start({ autoVideo: false, controlledClock: true, seed: 88333, playerTwo: true, playerTwoPersona: 'expert' });
    harness.advanceFor(2.05);
    const text = document.getElementById('msg')?.innerText || document.getElementById('msg')?.textContent || '';
    const live = harness.state();
    const events = harness.recentEvents({ count: 200 });
    return {
      text: text.replace(/\s+/g, ' ').trim(),
      live,
      callouts: events.filter(e => e.type === 'commentator_callout')
    };
  }));

  if(!/2UP QUEUED/.test(playerTwo.text) || !/Human score only/.test(playerTwo.text)){
    fail('Player Two should surface a queued-rival Commentator callout after the opening banner', playerTwo);
  }
  if((playerTwo.live.playerTwo?.score | 0) !== 0 || playerTwo.live.playerTwo?.activeTurn !== 'queued'){
    fail('Player Two callout must not start persona scoring during the 1UP turn', playerTwo);
  }
  if(!playerTwo.callouts.some(e => e.key === 'player_two_queued')){
    fail('Player Two queued callout should be logged', playerTwo);
  }

  console.log(JSON.stringify({
    ok: true,
    defaultEnabled: manual.defaultState.enabled,
    rendered: manual.onText,
    watchMode: watch.text,
    playerTwo: playerTwo.text,
    settingEvents: manual.settingEvents.length,
    callouts: manual.callouts.length + watch.callouts.length + playerTwo.callouts.length
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
