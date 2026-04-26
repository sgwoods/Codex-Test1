#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function countTypes(events){
  return events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {});
}

async function main(){
  const result = await withHarnessPage({ stage: 2, ships: 3, challenge: false, seed: 81421, controlledClock: true }, async ({ page }) => {
    await page.evaluate(() => {
      window.__galagaHarness__.exportAndReset({ label: 'galaxy_guardians_event_log_wait' });
      installGamePack('galaxy-guardians-preview', { persist: false });
    });
    await page.waitForTimeout(180);
    await page.keyboard.press('Enter');

    await waitForHarness(page, () => {
      const snap = window.__galagaHarness__.snapshot();
      const events = window.__galagaHarness__.recentEvents({ count: 200 });
      return snap.started && snap.gameKey === 'galaxy-guardians-preview' && events.some(event => event.type === 'wave_setup')
        ? { snap, eventCount: events.length }
        : null;
    }, 1600, 40);

    await page.keyboard.down('ArrowRight');
    await page.evaluate(() => window.__galagaHarness__.advanceFor(0.42, { step: 1 / 60 }));
    await page.keyboard.up('ArrowRight');
    await page.keyboard.press('Space');
    await page.evaluate(() => {
      window.__galagaHarness__.forceEnemyProjectile({ kind: 'event-log-harness', vy: 165 });
      window.__galagaHarness__.setupCloseShotTest({ stage: 2 });
    });
    await page.keyboard.down('Space');
    await page.evaluate(() => window.__galagaHarness__.advanceFor(0.06, { step: 1 / 60 }));
    await page.keyboard.up('Space');
    await page.evaluate(() => window.__galagaHarness__.advanceFor(0.22, { step: 1 / 60 }));
    await page.evaluate(() => window.__galagaHarness__.triggerShipLoss({ reserveLives: 1, cause: 'event_log_harness_player_hit' }));

    const events = await page.evaluate(() => window.__galagaHarness__.recentEvents({ count: 200 }));
    const snapshot = await page.evaluate(() => window.__galagaHarness__.snapshot());
    return { snapshot, events, counts: countTypes(events) };
  });

  const required = [
    'game_start',
    'wave_setup',
    'player_move',
    'player_shot',
    'regular_dive_start',
    'enemy_projectile',
    'enemy_hit',
    'player_hit',
    'wave_clear'
  ];
  for(const type of required){
    if(!result.events.some(event => event.type === type)){
      fail(`Galaxy Guardians event log missing semantic event: ${type}`, result);
    }
  }
  const foreignEvents = result.events.filter(event =>
    event.gameKey === 'galaxy-guardians-preview'
    && ['capture_started', 'fighter_captured', 'fighter_rescued', 'challenge_clear'].includes(event.type)
  );
  if(foreignEvents.length){
    fail('Galaxy Guardians event log included Aurora-only semantic events', { foreignEvents, result });
  }
  for(const semantic of ['wave_setup', 'regular_dive_start', 'enemy_projectile', 'enemy_hit', 'player_hit', 'wave_clear']){
    const event = result.events.find(next => next.type === semantic);
    if(!event?.sourceEvent) fail(`Semantic event did not retain source event: ${semantic}`, { event, result });
  }

  console.log(JSON.stringify({
    ok: true,
    packKey: result.snapshot.gameKey,
    semanticEvents: required.reduce((acc, type) => Object.assign(acc, { [type]: result.counts[type] || 0 }), {}),
    sourceAliases: result.events
      .filter(event => event.sourceEvent)
      .map(event => `${event.sourceEvent}->${event.type}`)
      .filter((value, index, list) => list.indexOf(value) === index)
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
