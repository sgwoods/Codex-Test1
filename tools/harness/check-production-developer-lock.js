#!/usr/bin/env node
const { DIST_PRODUCTION } = require('../build/paths');
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ root: DIST_PRODUCTION, stage: 1, ships: 3, challenge: false, seed: 73125, skipStart: true }, async ({ page }) => {
    await page.locator('#settingsBtn').click();
    await page.waitForTimeout(200);

    const locked = await page.evaluate(() => {
      const panel = document.getElementById('testPanel');
      const rootRow = document.getElementById('rootModeRow');
      const rootInput = document.getElementById('rootMode');
      const rootStatus = document.getElementById('rootModeStatus');
      const openViewer = document.getElementById('openViewerBtn');
      const recordBtn = document.getElementById('recordBtn');
      const playAudioTest = document.getElementById('playAudioTestBtn');
      const resetPilotScores = document.getElementById('resetTestPilotScoresBtn');
      const cfg = JSON.parse(localStorage.getItem('auroraGalacticaTestCfg') || '{}');
      return {
        panelLocked: !!panel?.classList.contains('locked'),
        rootVisible: !!(rootRow && !rootRow.hidden),
        rootValue: rootInput?.value || '',
        rootStatus: rootStatus?.textContent?.trim() || '',
        controls: {
          stageDisabled: !!document.getElementById('testStage')?.disabled,
          shipsDisabled: !!document.getElementById('testShips')?.disabled,
          extendFirstDisabled: !!document.getElementById('testExtendFirst')?.disabled,
          extendRecurringDisabled: !!document.getElementById('testExtendRecurring')?.disabled,
          challengeDisabled: !!document.getElementById('testChallenge')?.disabled
        },
        values: {
          stage: +document.getElementById('testStage')?.value || 0,
          ships: +document.getElementById('testShips')?.value || 0,
          extendFirst: +document.getElementById('testExtendFirst')?.value || 0,
          extendRecurring: +document.getElementById('testExtendRecurring')?.value || 0,
          challenge: !!document.getElementById('testChallenge')?.checked
        },
        hiddenActions: {
          openViewer: !!openViewer?.hidden,
          recordBtn: !!recordBtn?.hidden,
          playAudioTest: !!playAudioTest?.hidden,
          resetPilotScores: !!resetPilotScores?.hidden
        },
        persistedCfg: cfg
      };
    });

    await page.fill('#rootMode', 'n00b');
    await page.waitForTimeout(150);

    const unlocked = await page.evaluate(() => ({
      panelLocked: !!document.getElementById('testPanel')?.classList.contains('locked'),
      rootStatus: document.getElementById('rootModeStatus')?.textContent?.trim() || '',
      controls: {
        stageDisabled: !!document.getElementById('testStage')?.disabled,
        shipsDisabled: !!document.getElementById('testShips')?.disabled,
        extendFirstDisabled: !!document.getElementById('testExtendFirst')?.disabled,
        extendRecurringDisabled: !!document.getElementById('testExtendRecurring')?.disabled,
        challengeDisabled: !!document.getElementById('testChallenge')?.disabled
      }
    }));

    return { locked, unlocked };
  });

  if(!result.locked.panelLocked) fail('production developer start-state panel did not lock by default', result);
  if(!result.locked.rootVisible) fail('production developer panel did not expose the Root backdoor field', result);
  if(result.locked.rootValue !== '') fail('production developer Root field should start empty', result);
  if(!result.locked.rootStatus.toLowerCase().includes('locked')) fail('production developer panel did not show a locked status message', result);

  for(const [key, value] of Object.entries(result.locked.controls || {})){
    if(!value) fail(`production developer control ${key} was not disabled`, result);
  }
  for(const [key, value] of Object.entries(result.locked.hiddenActions || {})){
    if(!value) fail(`production developer action ${key} was not hidden`, result);
  }

  const values = result.locked.values || {};
  if(values.stage !== 1 || values.ships !== 3 || values.extendFirst !== 20000 || values.extendRecurring !== 70000 || values.challenge !== false){
    fail('production developer panel no longer shows the shipped start-state defaults while locked', result);
  }

  if(result.unlocked.panelLocked) fail('Root mode did not unlock the production developer start-state panel', result);
  if(!result.unlocked.rootStatus.toLowerCase().includes('root mode active')) fail('Root mode did not surface the unlocked status message', result);
  for(const [key, value] of Object.entries(result.unlocked.controls || {})){
    if(value) fail(`production developer control ${key} stayed disabled after Root unlock`, result);
  }

  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));
