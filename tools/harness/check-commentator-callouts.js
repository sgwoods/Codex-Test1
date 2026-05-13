#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 1, ships: 3, seed: 88331 }, async ({ page }) => page.evaluate(() => {
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

  if(!result.defaultState?.enabled){
    fail('Commentator should default on', result);
  }
  if(!result.queued){
    fail('enabled Commentator should accept a harness callout', result);
  }
  if(!/TACTICAL UPDATE/.test(result.onText) || !/Boss lane opening/.test(result.onText)){
    fail('queued Commentator callout did not render through the message box', result);
  }
  if(!result.onState?.active || !result.onState?.title){
    fail('Commentator state should report the active callout', result);
  }
  if(result.disabledState?.enabled){
    fail('Commentator harness toggle did not disable the feature', result);
  }
  if(result.rejected){
    fail('disabled Commentator should reject new callouts', result);
  }
  if(/SHOULD NOT SHOW/.test(result.offText)){
    fail('disabled Commentator callout leaked into the message box', result);
  }
  if(!result.settingEvents.some(e => e.enabled === false)){
    fail('Commentator setting change should be logged for production learning', result);
  }
  if(!result.callouts.some(e => e.key === 'harness' && /TACTICAL UPDATE/.test(e.title || ''))){
    fail('Commentator callout event should be logged with key and title', result);
  }

  console.log(JSON.stringify({
    ok: true,
    defaultEnabled: result.defaultState.enabled,
    rendered: result.onText,
    settingEvents: result.settingEvents.length,
    callouts: result.callouts.length
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
